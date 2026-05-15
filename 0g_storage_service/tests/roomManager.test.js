/**
 * roomManager.test.js
 * Tests for RoomManager — WebSocket and storageManager are mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoomManager } from '../roomManager.js';

// ── Mock WebSocket ────────────────────────────────────────────────────────────
function makeWs(readyState = 1) {
    return {
        readyState,
        send:  vi.fn(),
        close: vi.fn(),
        on:    vi.fn(),
    };
}

// ── Mock dependencies ─────────────────────────────────────────────────────────
function makeGameEngine() {
    return {
        startNewGame: vi.fn().mockResolvedValue({
            storyTheme:            'Test theme',
            inaccessibleLocations: ['Loc A', 'Loc B'],
            correctLocation:       'Loc A',
            questNetwork:          { nodes: [] },
            villagers:             [],
            discoveredNodes:       [],
            knowledgeSummary:      'Test summary',
        }),
    };
}

function makeStorageManager() {
    return {
        makeDataAvailable: vi.fn().mockResolvedValue(null),
    };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('RoomManager', () => {
    let rm, gameEngine, storageManager;

    beforeEach(() => {
        gameEngine      = makeGameEngine();
        storageManager  = makeStorageManager();
        rm              = new RoomManager(gameEngine, storageManager);
    });

    // ── createRoom ────────────────────────────────────────────────────────────

    describe('createRoom', () => {
        it('returns a 6-character uppercase room ID', () => {
            const id = rm.createRoom();
            expect(id).toMatch(/^[A-Z0-9]{6}$/);
        });

        it('creates unique IDs for each call', () => {
            const ids = new Set(Array.from({ length: 20 }, () => rm.createRoom()));
            expect(ids.size).toBeGreaterThan(15); // very unlikely to collide 20 times
        });

        it('stores the room in internal map', () => {
            const id = rm.createRoom();
            expect(rm.rooms.has(id)).toBe(true);
        });

        it('initialises room with lobby state and empty players', () => {
            const id   = rm.createRoom();
            const room = rm.rooms.get(id);
            expect(room.state).toBe('lobby');
            expect(room.players.size).toBe(0);
            expect(room.gameData).toBeNull();
        });
    });

    // ── handleConnection ──────────────────────────────────────────────────────

    describe('handleConnection', () => {
        it('closes connection for unknown room', () => {
            const ws = makeWs();
            rm.handleConnection(ws, 'BADROOM', 'player1');
            expect(ws.close).toHaveBeenCalled();
            const sent = JSON.parse(ws.send.mock.calls[0][0]);
            expect(sent.type).toBe('error');
        });

        it('registers player in room and broadcasts player_joined', () => {
            const roomId = rm.createRoom();
            const ws     = makeWs();
            rm.handleConnection(ws, roomId, 'player1');

            const room = rm.rooms.get(roomId);
            expect(room.players.has('player1')).toBe(true);

            const sent = JSON.parse(ws.send.mock.calls[0][0]);
            expect(sent.type).toBe('player_joined');
            expect(sent.players).toHaveLength(1);
        });

        it('rejects new player if game already in progress', () => {
            const roomId = rm.createRoom();
            rm.rooms.get(roomId).state = 'playing';

            const ws = makeWs();
            rm.handleConnection(ws, roomId, 'latePlayer');
            expect(ws.close).toHaveBeenCalled();
        });

        it('allows reconnect for existing player even if game is playing', () => {
            const roomId = rm.createRoom();
            const room   = rm.rooms.get(roomId);
            const ws1    = makeWs();
            rm.handleConnection(ws1, roomId, 'player1');
            room.state = 'playing';

            const ws2 = makeWs();
            rm.handleConnection(ws2, roomId, 'player1'); // same player
            expect(ws2.close).not.toHaveBeenCalled();
        });

        it('tracks player → room mapping', () => {
            const roomId = rm.createRoom();
            const ws     = makeWs();
            rm.handleConnection(ws, roomId, 'player1');
            expect(rm.playerToRoom.get('player1')).toBe(roomId);
        });
    });

    // ── handleMessage ─────────────────────────────────────────────────────────

    describe('handleMessage', () => {
        it('start_game transitions room to playing and broadcasts game_started', async () => {
            const roomId = rm.createRoom();
            const ws     = makeWs();
            rm.handleConnection(ws, roomId, 'player1');
            ws.send.mockClear();

            await rm.handleMessage(roomId, 'player1', { type: 'start_game' });

            const room = rm.rooms.get(roomId);
            expect(room.state).toBe('playing');
            expect(room.gameData).not.toBeNull();

            const sent = JSON.parse(ws.send.mock.calls[0][0]);
            expect(sent.type).toBe('game_started');
            expect(sent.game_data.isMultiplayer).toBe(true);
        });

        it('start_game calls storageManager.makeDataAvailable', async () => {
            const roomId = rm.createRoom();
            const ws     = makeWs();
            rm.handleConnection(ws, roomId, 'player1');

            await rm.handleMessage(roomId, 'player1', { type: 'start_game' });
            expect(storageManager.makeDataAvailable).toHaveBeenCalledOnce();
        });

        it('start_game is ignored if room is already playing', async () => {
            const roomId = rm.createRoom();
            const ws     = makeWs();
            rm.handleConnection(ws, roomId, 'player1');
            rm.rooms.get(roomId).state = 'playing';
            ws.send.mockClear();

            await rm.handleMessage(roomId, 'player1', { type: 'start_game' });
            expect(gameEngine.startNewGame).not.toHaveBeenCalled();
        });

        it('player_move relays to other players but not sender', async () => {
            const roomId = rm.createRoom();
            const ws1    = makeWs();
            const ws2    = makeWs();
            rm.handleConnection(ws1, roomId, 'p1');
            rm.handleConnection(ws2, roomId, 'p2');
            ws1.send.mockClear();
            ws2.send.mockClear();

            await rm.handleMessage(roomId, 'p1', { type: 'player_move', pos: { x: 10, y: 20 }, anim: 'walk' });

            // p2 should receive the move, p1 should not
            expect(ws2.send).toHaveBeenCalledOnce();
            expect(ws1.send).not.toHaveBeenCalled();

            const msg = JSON.parse(ws2.send.mock.calls[0][0]);
            expect(msg.type).toBe('remote_move');
            expect(msg.playerId).toBe('p1');
        });

        it('chat broadcasts to all players including sender', async () => {
            const roomId = rm.createRoom();
            const ws1    = makeWs();
            const ws2    = makeWs();
            rm.handleConnection(ws1, roomId, 'p1');
            rm.handleConnection(ws2, roomId, 'p2');
            ws1.send.mockClear();
            ws2.send.mockClear();

            await rm.handleMessage(roomId, 'p1', { type: 'chat', message: 'Hello!' });

            expect(ws1.send).toHaveBeenCalledOnce();
            expect(ws2.send).toHaveBeenCalledOnce();
            const msg = JSON.parse(ws1.send.mock.calls[0][0]);
            expect(msg.type).toBe('chat_message');
            expect(msg.message).toBe('Hello!');
        });
    });

    // ── broadcast ─────────────────────────────────────────────────────────────

    describe('broadcast', () => {
        it('sends to all connected players', () => {
            const roomId = rm.createRoom();
            const ws1    = makeWs();
            const ws2    = makeWs();
            rm.handleConnection(ws1, roomId, 'p1');
            rm.handleConnection(ws2, roomId, 'p2');
            ws1.send.mockClear();
            ws2.send.mockClear();

            rm.broadcast(roomId, { type: 'test' });
            expect(ws1.send).toHaveBeenCalledOnce();
            expect(ws2.send).toHaveBeenCalledOnce();
        });

        it('skips closed WebSocket connections (readyState !== 1)', () => {
            const roomId    = rm.createRoom();
            const wsOpen    = makeWs(1);
            const wsClosed  = makeWs(3); // CLOSED
            rm.handleConnection(wsOpen,   roomId, 'p1');
            rm.handleConnection(wsClosed, roomId, 'p2');
            wsOpen.send.mockClear();
            wsClosed.send.mockClear();

            rm.broadcast(roomId, { type: 'test' });
            expect(wsOpen.send).toHaveBeenCalledOnce();
            expect(wsClosed.send).not.toHaveBeenCalled();
        });

        it('does nothing for unknown room', () => {
            // Should not throw
            expect(() => rm.broadcast('UNKNOWN', { type: 'test' })).not.toThrow();
        });
    });
});
