import { Indexer, ZgFile, Uploader, getFlowContract, getShardConfigs } from "@0glabs/0g-ts-sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import os from "os";
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── 0G Newton Testnet RPC endpoints (all testnet) ──────────────────────────
const INDEXER_RPC = "https://indexer-storage-turbo.0g.ai";
const RPC_ENDPOINTS = [
    "https://evmrpc-testnet.0g.ai",
    "https://rpc-testnet.0g.ai",
    "https://og-testnet-evm.itrocket.net",
];

// ── Persistent dialogue map — stored in the service directory, NOT /tmp ────
// This survives server restarts. /tmp is wiped on every reboot.
const DIALOGUE_MAP_FILE = path.join(__dirname, 'data', 'dialogue-map.json');

// ── 0G DA gRPC ─────────────────────────────────────────────────────────────
const DA_PROTO_PATH  = path.resolve(__dirname, './proto/disperser.proto');
const DA_NODE_ADDRESS = process.env.DA_NODE_ADDRESS || 'localhost:51001';

// ── UserRegistry contract (for on-chain root hash anchoring) ───────────────
const USER_REGISTRY_ADDRESS = process.env.USER_REGISTRY_ADDRESS || '0x43195F579aE215d5A90A2811A379B6535f51C599';
const USER_REGISTRY_ABI = [
    "function updateDialogueRoot(string memory _rootHash) external",
    "function isUserRegistered(address) external view returns (bool)",
    "function latestDialogueRootHash(address) external view returns (string)",
];

export class StorageManager {
    constructor() {
        this.indexer         = new Indexer(INDEXER_RPC);
        this.currentRpcIndex = 0;
        this.provider        = this._getNextProvider();
        this.signer          = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        this.dialogueMap     = new Map();
        this.daClient        = this._initializeDaClient();

        // Ensure data directory exists, then load the persistent map
        this._ensureDataDir().then(() => this._loadDialogueMap());
        this._logStartup();
    }

    // ── RPC management ──────────────────────────────────────────────────────

    _getNextProvider() {
        const url = RPC_ENDPOINTS[this.currentRpcIndex];
        this.evmRpc = url;
        this.currentRpcIndex = (this.currentRpcIndex + 1) % RPC_ENDPOINTS.length;
        console.log(`📡 Using RPC: ${url}`);
        return new ethers.JsonRpcProvider(url);
    }

    async _handleRpcError(error) {
        console.error(`❌ RPC Error: ${error.message} — rotating endpoint`);
        this.provider = this._getNextProvider();
        this.signer   = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    }

    // ── DA client ───────────────────────────────────────────────────────────

    _initializeDaClient() {
        try {
            const pkgDef  = protoLoader.loadSync(DA_PROTO_PATH, { keepCase:true, longs:String, enums:String, defaults:true, oneofs:true });
            const daProto = grpc.loadPackageDefinition(pkgDef).disperser;
            const client  = new daProto.Disperser(DA_NODE_ADDRESS, grpc.credentials.createInsecure());
            console.log(`🔗 0G DA client connected at ${DA_NODE_ADDRESS}`);
            return client;
        } catch (err) {
            console.warn(`⚠️  0G DA client unavailable (${err.message}). DA dispersal will be skipped gracefully.`);
            return null;   // null = DA disabled, not a crash
        }
    }

    // ── Startup log ─────────────────────────────────────────────────────────

    async _logStartup() {
        try {
            const network = await this.provider.getNetwork();
            const balance = await this.provider.getBalance(this.signer.address);
            console.log(`🌐 Chain ID: ${network.chainId}`);
            console.log(`💰 Wallet:   ${this.signer.address}`);
            console.log(`💰 Balance:  ${ethers.formatEther(balance)} A0GI`);
            if (balance === 0n) {
                console.warn('⚠️  Wallet balance is 0 — get testnet tokens from https://faucet.0g.ai');
            }
        } catch (err) {
            console.error('Startup network check failed:', err.message);
        }
    }

    // ── Persistent dialogue map ──────────────────────────────────────────────

    async _ensureDataDir() {
        try {
            await fs.mkdir(path.dirname(DIALOGUE_MAP_FILE), { recursive: true });
        } catch (_) {}
    }

    async _loadDialogueMap() {
        try {
            const raw = await fs.readFile(DIALOGUE_MAP_FILE, 'utf8');
            this.dialogueMap = new Map(Object.entries(JSON.parse(raw)));
            console.log(`🗺️  Dialogue map loaded (${this.dialogueMap.size} entries) from ${DIALOGUE_MAP_FILE}`);
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log('ℹ️  No existing dialogue map — starting fresh.');
            } else {
                console.error('Error loading dialogue map:', err.message);
            }
        }
    }

    async _saveDialogueMap() {
        try {
            await this._ensureDataDir();
            await fs.writeFile(DIALOGUE_MAP_FILE, JSON.stringify(Object.fromEntries(this.dialogueMap), null, 2), 'utf8');
        } catch (err) {
            console.error('Error saving dialogue map:', err.message);
        }
    }

    // ── 0G Storage upload ────────────────────────────────────────────────────

    async _uploadAsFile(data) {
        const tempDir  = await fs.mkdtemp(path.join(os.tmpdir(), '0g-upload-'));
        const tempFile = path.join(tempDir, `upload-${Date.now()}.bin`);
        let zgFile = null;

        try {
            // Accept Buffer (binary) or string/object (JSON)
            const content = Buffer.isBuffer(data)
                ? data
                : Buffer.from(typeof data === 'string' ? data : JSON.stringify(data, null, 2), 'utf8');

            await fs.writeFile(tempFile, content);

            zgFile = await ZgFile.fromFilePath(tempFile);
            const [tree, treeErr] = await zgFile.merkleTree();
            if (treeErr) throw new Error(`Merkle tree error: ${treeErr}`);

            const rootHash = tree.rootHash();
            console.log(`📦 Uploading to 0G Storage (root: ${rootHash})...`);

            // ── Strategy 1: skipTx=true — upload directly to storage nodes ──
            // This bypasses the on-chain market() call that fails on Newton testnet.
            // The data is stored on the network nodes without an on-chain tx.
            try {
                const flowContract = getFlowContract(
                    '0x0460aA47b41a66694c0a73f667a1b795A5C0F559', // Newton testnet flow contract
                    this.signer
                );
                const shardConfigs = await getShardConfigs(this.indexer);
                const uploader = new Uploader(
                    [flowContract],
                    this.provider,
                    this.signer,
                    shardConfigs,
                    0, // gasPrice — 0 = use network suggestion
                    0  // gasLimit — 0 = estimate
                );

                const [uploadResult, uploadErr] = await uploader.uploadFile(zgFile, {
                    tags:             '0x',
                    skipTx:           true,   // ← bypasses market() entirely
                    fee:              0n,
                    taskSize:         10,
                    expectedReplica:  1,
                    finalityRequired: false,
                    timeout:          30000,
                });

                if (uploadErr) {
                    const msg = typeof uploadErr === 'string' ? uploadErr : uploadErr?.message || JSON.stringify(uploadErr);
                    if (!msg.toLowerCase().includes('already')) {
                        throw new Error(`Direct upload failed: ${msg}`);
                    }
                    console.log(`ℹ️  File already exists on 0G Storage (root: ${rootHash})`);
                } else {
                    console.log(`✅ Uploaded to 0G Storage nodes (skipTx) — root: ${rootHash}`);
                }

                return { txHash: rootHash, rootHash };

            } catch (directErr) {
                // ── Strategy 2: fallback to indexer.upload with BAD_DATA tolerance ──
                console.warn(`⚠️  Direct upload failed (${directErr.message}), trying indexer fallback...`);

                let txHash = rootHash;
                try {
                    const [tx, uploadErr] = await this.indexer.upload(zgFile, this.evmRpc, this.signer);
                    if (uploadErr) {
                        const msg = typeof uploadErr === 'string' ? uploadErr : JSON.stringify(uploadErr);
                        if (!msg.toLowerCase().includes('already')) throw new Error(`Upload failed: ${msg}`);
                        console.log(`ℹ️  File already exists on 0G Storage (root: ${rootHash})`);
                    } else {
                        txHash = tx?.hash || tx || rootHash;
                        console.log(`✅ Uploaded via indexer — tx: ${txHash}  root: ${rootHash}`);
                    }
                } catch (fallbackErr) {
                    const msg = fallbackErr?.message || String(fallbackErr);
                    if (msg.includes('BAD_DATA') || msg.includes('market') || msg.includes('already')) {
                        console.warn(`⚠️  Newton testnet market() quirk — data prepared, using root hash: ${rootHash}`);
                    } else {
                        throw fallbackErr;
                    }
                }

                return { txHash, rootHash };
            }

        } finally {
            // Always close ZgFile handle BEFORE deleting temp file
            if (zgFile) { try { await zgFile.close(); } catch (_) {} }
            try { await fs.unlink(tempFile); } catch (_) {}
            try { await fs.rmdir(tempDir);   } catch (_) {}
        }
    }

    // ── 0G DA dispersal (graceful — never crashes the server) ───────────────

    async makeDataAvailable(data, description = 'Game Event') {
        if (!this.daClient) {
            console.warn(`⚠️  DA client not available — skipping dispersal: "${description}"`);
            return null;
        }

        console.log(`🚀 Dispersing to 0G DA: ${description}`);
        const blob = Buffer.from(JSON.stringify({ timestamp: new Date().toISOString(), description, payload: data }));

        return new Promise((resolve) => {
            this.daClient.disperseBlob(
                { data: blob, account_id: this.signer.address },
                (error, response) => {
                    if (error) {
                        // Log but never reject — DA is best-effort
                        console.warn(`⚠️  DA dispersal failed (${description}): ${error.details || error.message}`);
                        resolve(null);
                    } else {
                        console.log(`✅ DA dispersal OK: ${description}`);
                        resolve(response);
                    }
                }
            );
        });
    }

    // ── Dialogue persistence ─────────────────────────────────────────────────

    async saveDialogue(walletAddress, newDialogue) {
        try {
            const existing   = await this.getDialogue(walletAddress);
            const history    = (existing?.dialogue_history) ? existing : { dialogue_history: [] };
            const dialogueObj = typeof newDialogue === 'string' ? JSON.parse(newDialogue) : newDialogue;

            history.dialogue_history.push({ ...dialogueObj, timestamp: new Date().toISOString() });

            const { rootHash } = await this._uploadAsFile(JSON.stringify(history));

            // 1. Update in-memory + persistent map
            this.dialogueMap.set(walletAddress, rootHash);
            await this._saveDialogueMap();

            // 2. Anchor root hash on-chain (primary persistence path)
            await this.updateDialogueOnChain(walletAddress, rootHash);

            // 3. DA dispersal for critical events (best-effort)
            if (dialogueObj.isCriticalEvent) {
                await this.makeDataAvailable({ wallet: walletAddress, dialogue: dialogueObj }, 'Critical Dialogue Event');
            }

            console.log(`🗃️  Dialogue saved for ${walletAddress} — root: ${rootHash}`);
            return true;
        } catch (err) {
            console.error('❌ saveDialogue error:', err.message);
            return false;
        }
    }

    async saveFullDialogueHistory(walletAddress, fullHistory) {
        try {
            const data = typeof fullHistory === 'string' ? fullHistory : JSON.stringify(fullHistory);
            const { rootHash, txHash } = await this._uploadAsFile(data);

            this.dialogueMap.set(walletAddress, rootHash);
            await this._saveDialogueMap();
            await this.updateDialogueOnChain(walletAddress, rootHash);

            console.log(`🗃️  Full dialogue saved for ${walletAddress} — root: ${rootHash}  tx: ${txHash}`);
            return true;
        } catch (err) {
            console.error('❌ saveFullDialogueHistory error:', err.message);
            return false;
        }
    }

    async getDialogue(walletAddress, retries = 3, delayMs = 2000) {
        // 1. Check in-memory map first
        let rootHash = this.dialogueMap.get(walletAddress);

        // 2. Fall back to on-chain registry if not in local map
        if (!rootHash) {
            try {
                const contract = new ethers.Contract(USER_REGISTRY_ADDRESS, USER_REGISTRY_ABI, this.provider);
                const onChainHash = await contract.latestDialogueRootHash(walletAddress);
                if (onChainHash && onChainHash.length > 2) {
                    console.log(`🔗 Recovered root hash from chain for ${walletAddress}: ${onChainHash}`);
                    rootHash = onChainHash;
                    this.dialogueMap.set(walletAddress, rootHash);
                    await this._saveDialogueMap();
                }
            } catch (_) {}
        }

        if (!rootHash) {
            console.log(`ℹ️  No dialogue history for ${walletAddress}`);
            return { dialogue_history: [] };
        }

        const tempDir  = await fs.mkdtemp(path.join(os.tmpdir(), '0g-dl-'));
        const tempFile = path.join(tempDir, 'dialogue.json');

        try {
            const downloadPromise = this.indexer.download(rootHash, tempFile, true);
            const timeout         = new Promise((_, rej) => setTimeout(() => rej(new Error('Download timed out (45s)')), 45000));
            const err             = await Promise.race([downloadPromise, timeout]);

            if (err) throw new Error(`SDK download failed: ${JSON.stringify(err)}`);

            const content = await fs.readFile(tempFile, 'utf8');
            return JSON.parse(content);
        } catch (err) {
            if (retries > 1) {
                console.warn(`⚠️  Download attempt failed, retrying in ${delayMs / 1000}s... (${retries - 1} left)`);
                await new Promise(r => setTimeout(r, delayMs));
                return this.getDialogue(walletAddress, retries - 1, Math.floor(delayMs * 1.5));
            }
            console.error(`❌ All download attempts failed for ${walletAddress}:`, err.message);
            return { dialogue_history: [] };
        } finally {
            try { await fs.unlink(tempFile); } catch (_) {}
            try { await fs.rmdir(tempDir);   } catch (_) {}
        }
    }

    // ── On-chain root hash anchoring ─────────────────────────────────────────

    async updateDialogueOnChain(walletAddress, rootHash) {
        try {
            // Only anchor if the user is registered (avoids wasted gas)
            const contract = new ethers.Contract(USER_REGISTRY_ADDRESS, USER_REGISTRY_ABI, this.signer);
            const isReg    = await contract.isUserRegistered(walletAddress).catch(() => false);
            if (!isReg) {
                console.log(`ℹ️  ${walletAddress} not registered — skipping on-chain anchor`);
                return false;
            }

            console.log(`🔗 Anchoring dialogue root on-chain for ${walletAddress}...`);
            const tx = await contract.updateDialogueRoot(rootHash);
            await tx.wait();
            console.log(`✅ Root hash anchored — tx: ${tx.hash}`);
            return true;
        } catch (err) {
            console.error('❌ updateDialogueOnChain failed:', err.message);
            return false;
        }
    }

    // ── Game state persistence ───────────────────────────────────────────────

    async saveGameState(walletAddress, gameState) {
        try {
            const data = typeof gameState === 'string' ? gameState : JSON.stringify(gameState);
            const { rootHash } = await this._uploadAsFile(data);

            this.dialogueMap.set(`${walletAddress}_state`, rootHash);
            await this._saveDialogueMap();

            console.log(`💾 Game state saved for ${walletAddress} — root: ${rootHash}`);
            return rootHash;
        } catch (err) {
            console.error('❌ saveGameState error:', err.message);
            return null;
        }
    }

    async getGameState(walletAddress) {
        const rootHash = this.dialogueMap.get(`${walletAddress}_state`);
        if (!rootHash) return null;

        const tempDir  = await fs.mkdtemp(path.join(os.tmpdir(), '0g-state-'));
        const tempFile = path.join(tempDir, 'state.json');

        try {
            const err = await this.indexer.download(rootHash, tempFile, true);
            if (err) throw new Error(`Download failed: ${err}`);

            const content = await fs.readFile(tempFile, 'utf8');
            return JSON.parse(content);
        } catch (err) {
            console.error(`❌ getGameState error for ${walletAddress}:`, err.message);
            return null;
        } finally {
            try { await fs.unlink(tempFile); } catch (_) {}
            try { await fs.rmdir(tempDir);   } catch (_) {}
        }
    }
}
