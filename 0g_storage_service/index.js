import 'dotenv/config';
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { rateLimit } from "express-rate-limit";
import { StorageManager } from "./storageManager.js";
import { INFTManager } from './INFTManager.js';
import { GameEngine } from './lib/game/gameEngine.js';
import { RoomManager } from './roomManager.js';
import { randomUUID } from 'node:crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Validate required env vars at startup ────────────────────────────────────
const REQUIRED_ENV = ['PRIVATE_KEY'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
    console.error(`❌ Missing required env vars: ${missing.join(', ')}`);
    console.error('   Copy .env.example to .env and fill in your values.');
    process.exit(1);
}

// ── App setup ────────────────────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const PORT = parseInt(process.env.PORT || '3002', 10);

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Prevent LLM budget exhaustion and abuse
const gameLimiter = rateLimit({
    windowMs: 60 * 1000,   // 1 minute
    max: 10,               // max 10 new games per IP per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait before starting another game.' },
});

const interactLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,               // 60 interactions per minute per IP (1/sec)
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many interactions. Slow down.' },
});

const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(generalLimiter);

// ── Persistent session store ──────────────────────────────────────────────────
// activeGames survives server restarts via a JSON file in ./data/
const SESSION_FILE = path.join(__dirname, 'data', 'active-sessions.json');

class SessionStore {
    constructor() {
        this.sessions = new Map();
        this._load();
    }

    async _load() {
        try {
            await fs.mkdir(path.dirname(SESSION_FILE), { recursive: true });
            const raw = await fs.readFile(SESSION_FILE, 'utf8');
            const obj = JSON.parse(raw);
            // Only restore sessions less than 24 hours old
            const cutoff = Date.now() - 24 * 60 * 60 * 1000;
            for (const [id, session] of Object.entries(obj)) {
                if (session._savedAt && session._savedAt > cutoff) {
                    this.sessions.set(id, session);
                }
            }
            console.log(`📂 Session store loaded (${this.sessions.size} active sessions)`);
        } catch (err) {
            if (err.code !== 'ENOENT') console.error('Session store load error:', err.message);
        }
    }

    async _save() {
        try {
            const obj = Object.fromEntries(this.sessions);
            await fs.writeFile(SESSION_FILE, JSON.stringify(obj, null, 2), 'utf8');
        } catch (err) {
            console.error('Session store save error:', err.message);
        }
    }

    get(id) { return this.sessions.get(id) || null; }

    async set(id, gameState) {
        this.sessions.set(id, { ...gameState, _savedAt: Date.now() });
        // Non-blocking save
        this._save().catch(() => {});
    }

    async delete(id) {
        this.sessions.delete(id);
        this._save().catch(() => {});
    }
}

const activeGames = new SessionStore();

// ── Service instances ────────────────────────────────────────────────────────
const storageManager = new StorageManager();
const inftManager    = new INFTManager();
const gameEngine     = new GameEngine();
const roomManager    = new RoomManager(gameEngine, storageManager);

// ── WebSocket ────────────────────────────────────────────────────────────────
wss.on('connection', (ws, req) => {
    const parts = (req.url || '').split('/');
    // Expected URL: /ws/<roomId>/<playerId>
    if (parts[1] === 'ws' && parts[2] && parts[3]) {
        roomManager.handleConnection(ws, parts[2], parts[3]);
    } else {
        ws.close(1008, 'Invalid WebSocket URL');
    }
});

// ── Utility ──────────────────────────────────────────────────────────────────
function validateAddress(addr) {
    return typeof addr === 'string' && /^0x[0-9a-fA-F]{40}$/.test(addr);
}

// ── Health / meta ─────────────────────────────────────────────────────────────
app.get('/ping', (_req, res) => res.json({ status: 'pong', timestamp: new Date() }));

app.get('/', (_req, res) => res.json({
    name:          'Beyond-The-Fog Unified Core',
    version:       '2.0.0',
    status:        'Active',
    network:       '0G Newton Testnet (Chain 16602)',
    contracts: {
        userRegistry:   process.env.USER_REGISTRY_ADDRESS,
        narrativeINFT:  process.env.INFT_CONTRACT_ADDRESS,
    },
}));

app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() }));

// ── Multiplayer ───────────────────────────────────────────────────────────────
app.post('/create_room', (_req, res) => {
    const roomId = roomManager.createRoom();
    res.json({ room_id: roomId });
});

// ── Game engine ───────────────────────────────────────────────────────────────

// POST /game/new
app.post('/game/new', gameLimiter, async (req, res) => {
    try {
        const { num_inaccessible_locations = 5, difficulty = 'Medium', player_id } = req.body;

        const gameState = await gameEngine.startNewGame(
            Math.min(Math.max(parseInt(num_inaccessible_locations) || 5, 2), 10),
            difficulty
        );

        const gameId = randomUUID();
        await activeGames.set(gameId, gameState);

        // Persist to 0G Storage (non-blocking — don't fail the request if storage is slow)
        if (player_id && validateAddress(player_id)) {
            storageManager.saveGameState(player_id, gameState).catch(err =>
                console.error('Background saveGameState failed:', err.message)
            );
        }

        res.json({
            game_id:                gameId,
            status:                 'success',
            story_theme:            gameState.storyTheme,
            inaccessible_locations: gameState.inaccessibleLocations,
            villagers:              gameState.villagers.map(v => ({ id: v.id, title: v.title, name: v.name })),
        });
    } catch (err) {
        console.error('POST /game/new failed:', err.message);
        res.status(500).json({ error: 'Failed to initialize game engine. Is the LLM available?' });
    }
});

// GET /game/:playerId/resume
app.get('/game/:playerId/resume', async (req, res) => {
    try {
        const { playerId } = req.params;
        if (!validateAddress(playerId)) return res.status(400).json({ error: 'Invalid player address.' });

        const gameState = await storageManager.getGameState(playerId);
        if (!gameState) return res.status(404).json({ error: 'No saved game found for this player.' });

        const gameId = randomUUID();
        await activeGames.set(gameId, gameState);

        res.json({
            game_id:         gameId,
            status:          'resumed',
            story_theme:     gameState.storyTheme,
            discovered_nodes: gameState.discoveredNodes,
            villagers:       gameState.villagers.map(v => ({ id: v.id, title: v.title, name: v.name })),
        });
    } catch (err) {
        console.error('GET /game/resume failed:', err.message);
        res.status(500).json({ error: 'Failed to resume game.' });
    }
});

// POST /game/:gameId/interact
app.post('/game/:gameId/interact', interactLimiter, async (req, res) => {
    try {
        const { gameId } = req.params;
        const { villager_id, player_prompt, player_id } = req.body;

        if (!villager_id || !player_prompt) {
            return res.status(400).json({ error: 'villager_id and player_prompt are required.' });
        }

        const gameState = activeGames.get(gameId);
        if (!gameState) return res.status(404).json({ error: 'Game session not found. It may have expired.' });

        const interaction = await gameEngine.interact(gameState, villager_id, String(player_prompt).slice(0, 500));

        // Non-blocking auto-save
        if (player_id && validateAddress(player_id)) {
            storageManager.saveGameState(player_id, gameState).catch(err =>
                console.error('Background saveGameState failed:', err.message)
            );
        }

        res.json({
            villager_id,
            villager_name:      interaction.villager_name,
            npc_dialogue:       interaction.npc_dialogue,
            player_suggestions: interaction.player_responses || [],
        });
    } catch (err) {
        console.error('POST /game/interact failed:', err.message);
        res.status(500).json({ error: 'Interaction processing failed.' });
    }
});

// POST /game/:gameId/guess
app.post('/game/:gameId/guess', async (req, res) => {
    try {
        const { gameId } = req.params;
        const { location_name, player_id } = req.body;

        if (!location_name) return res.status(400).json({ error: 'location_name is required.' });

        const gameState = activeGames.get(gameId);
        if (!gameState) return res.status(404).json({ error: 'Game session not found.' });

        const is_correct = gameState.inaccessibleLocations.includes(location_name);
        const story = is_correct
            ? `You have successfully identified ${location_name} as a key site. The mystery unravels...`
            : `Nothing of interest was found at ${location_name}.`;

        if (player_id && validateAddress(player_id) && is_correct) {
            // Non-blocking — persist solved state and DA event
            storageManager.saveGameState(player_id, { ...gameState, solved: true }).catch(() => {});
            storageManager.makeDataAvailable(
                { player_id, location_name, event: 'mystery_solved' },
                'Mystery Solved'
            ).catch(() => {});
        }

        res.json({ is_correct, story });
    } catch (err) {
        console.error('POST /game/guess failed:', err.message);
        res.status(500).json({ error: 'Guess processing failed.' });
    }
});

// POST /game/end  — called by frontend EndScene to save final dialogue history
app.post('/game/end', async (req, res) => {
    try {
        const { game_id, player_id } = req.body;
        if (!player_id || !validateAddress(player_id)) {
            return res.status(400).json({ error: 'Valid player_id is required.' });
        }

        const gameState = game_id ? activeGames.get(game_id) : null;

        // Save final game state to 0G Storage
        if (gameState) {
            await storageManager.saveGameState(player_id, { ...gameState, ended: true });
            await activeGames.delete(game_id);
        }

        // Persist dialogue history on-chain
        const dialogue = await storageManager.getDialogue(player_id);
        if (dialogue?.dialogue_history?.length > 0) {
            await storageManager.saveFullDialogueHistory(player_id, dialogue);
        }

        res.json({ status: 'success', message: 'Game ended and history saved.' });
    } catch (err) {
        console.error('POST /game/end failed:', err.message);
        res.status(500).json({ error: 'Failed to end game.' });
    }
});

// ── Storage endpoints ─────────────────────────────────────────────────────────

app.get('/dialogue/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        if (!validateAddress(walletAddress)) return res.status(400).json({ error: 'Invalid wallet address.' });
        const dialogue = await storageManager.getDialogue(walletAddress);
        res.json(dialogue);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve dialogue history.' });
    }
});

app.post('/dialogue/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        if (!validateAddress(walletAddress)) return res.status(400).json({ error: 'Invalid wallet address.' });
        const { newDialogue } = req.body;
        if (!newDialogue) return res.status(400).json({ error: 'newDialogue is required.' });
        const success = await storageManager.saveDialogue(walletAddress, newDialogue);
        res.status(success ? 200 : 500).json({ success });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save dialogue.' });
    }
});

// ── INFT endpoints ────────────────────────────────────────────────────────────

app.post('/inft/create', async (req, res) => {
    try {
        const { playerAddress, gameMode, difficulty, ownerPublicKey } = req.body;
        if (!playerAddress || !validateAddress(playerAddress)) {
            return res.status(400).json({ success: false, error: 'Valid playerAddress is required.' });
        }
        if (!ownerPublicKey) {
            return res.status(400).json({ success: false, error: 'ownerPublicKey is required.' });
        }
        const result = await inftManager.createGameINFT(playerAddress, gameMode || 'single_player', difficulty || 'medium', ownerPublicKey);
        res.json({ success: true, ...result });
    } catch (err) {
        console.error('POST /inft/create failed:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/inft/evolve', async (req, res) => {
    try {
        const { tokenId, gameProgressData, ownerPublicKey } = req.body;
        if (!tokenId || !gameProgressData || !ownerPublicKey) {
            return res.status(400).json({ success: false, error: 'tokenId, gameProgressData, and ownerPublicKey are required.' });
        }
        const result = await inftManager.evolveINFT(tokenId, gameProgressData, ownerPublicKey);
        res.json({ success: true, ...result });
    } catch (err) {
        console.error('POST /inft/evolve failed:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/inft/player/:address', async (req, res) => {
    try {
        const { address } = req.params;
        if (!validateAddress(address)) return res.status(400).json({ success: false, error: 'Invalid address.' });
        if (!inftManager.inftContract) return res.status(503).json({ success: false, error: 'INFT contract not initialised.' });
        const infts = await inftManager.inftContract.getPlayerINFTs(address);
        res.json({ success: true, infts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── DA endpoint ───────────────────────────────────────────────────────────────

app.post('/da/disperse', async (req, res) => {
    try {
        const { data, description } = req.body;
        if (!data) return res.status(400).json({ success: false, error: 'data is required.' });
        const response = await storageManager.makeDataAvailable(data, description || 'Manual Dispersal');
        res.json({ success: true, response });
    } catch (err) {
        console.error('POST /da/disperse failed:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
    console.log(`🚀 Beyond-The-Fog Unified Core  →  http://localhost:${PORT}`);
    console.log(`🌐 Network: 0G Newton Testnet (Chain 16602)`);
    console.log(`📦 Sessions persisted to ./data/ | Dialogue map persisted to ./data/`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
async function shutdown(signal) {
    console.log(`\n${signal} received — shutting down gracefully...`);
    httpServer.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
    });
    // Force exit after 10s if connections are stuck
    setTimeout(() => { console.error('⚠️  Forced exit after timeout.'); process.exit(1); }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// Catch unhandled promise rejections — log but don't crash
process.on('unhandledRejection', (reason) => {
    console.error('⚠️  Unhandled promise rejection:', reason);
});
