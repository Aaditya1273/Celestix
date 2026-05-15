import { StorageManager } from './storageManager.js';
import { ethers } from 'ethers';
import sodium from 'libsodium-wrappers';
import { Base64 } from 'js-base64';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve the frontend public assets directory (sibling repo)
const ASSETS_DIR = path.resolve(__dirname, '../beyond-the-fog-next/public/assets/images');

export class INFTManager extends StorageManager {
    constructor() {
        super();
        this.initLibsodium();
        this.initINFTContract();
        this.metadataVersions = new Map();

        // Stage → 0G root hash (populated by uploadGameAssets or loaded from env)
        this.stageImages = {
            newborn: process.env.NEWBORN_IMAGE_CID || null,
            curious: process.env.CURIOUS_IMAGE_CID || null,
            master:  process.env.MASTER_IMAGE_CID  || null,
            wise:    process.env.WISE_IMAGE_CID    || null,
            savior:  process.env.SAVIOR_IMAGE_CID  || null,
        };

        this.itemImages = {
            lantern:     process.env.ITEM_LANTERN_CID      || null,
            axe:         process.env.ITEM_AXE_CID          || null,
            fishing_rod: process.env.ITEM_FISHING_ROD_CID  || null,
            shovel:      process.env.ITEM_SHOVEL_CID       || null,
            pickaxe:     process.env.ITEM_PICKAXE_CID      || null,
            hammer:      process.env.ITEM_HAMMER_CID       || null,
            bucket:      process.env.ITEM_BUCKET_CID       || null,
            scythe:      process.env.ITEM_SCYTHE_CID       || null,
        };
    }

    // ============== CONTRACT INITIALIZATION ==============

    async initINFTContract() {
        const INFT_CONTRACT_ADDRESS = process.env.INFT_CONTRACT_ADDRESS;
        if (!INFT_CONTRACT_ADDRESS) {
            console.warn('⚠️  INFT_CONTRACT_ADDRESS not set in .env — INFT minting disabled');
            this.inftContract = null;
            return;
        }

        const INFT_ABI = [
            "function birthINFT(address,string,string,string,bytes32,bytes) external returns (uint256)",
            "function evolveINFT(uint256,string,string,bytes32,bytes) external",
            "function initiateSecureTransfer(uint256,address,bytes) external",
            "function completeSecureTransferWithNewKey(uint256,address,bytes,uint256) external",
            "function authorizeUsage(uint256,address,uint256) external",
            "function getCurrentMetadata(uint256) external view returns (tuple(string,uint256,bytes32,string,address,uint256,bool,uint256))",
            "function getPlayerINFTs(address) external view returns (uint256[])",
            "function getMetadataHistory(uint256) external view returns (tuple(bytes32,string,uint256,uint256)[])"
        ];

        this.inftContract = new ethers.Contract(INFT_CONTRACT_ADDRESS, INFT_ABI, this.signer);
        console.log(`✅ INFT contract initialised: ${INFT_CONTRACT_ADDRESS}`);
    }

    async initLibsodium() {
        await sodium.ready;
        console.log('✅ Libsodium initialised for encryption');
    }

    // ============== ASSET UPLOAD TO 0G STORAGE ==============

    /**
     * Upload all game images (stage + item) to 0G Storage.
     * Prints the resulting root hashes so they can be pasted into .env.
     * Safe to call multiple times — skips images that already have a CID set.
     */
    async uploadGameAssets() {
        console.log('🖼️  Starting game asset upload to 0G Storage...');

        const stageFiles = {
            newborn: path.join(ASSETS_DIR, 'characters/villager01.png'),
            curious: path.join(ASSETS_DIR, 'characters/villager02.png'),
            master:  path.join(ASSETS_DIR, 'characters/villager03.png'),
            wise:    path.join(ASSETS_DIR, 'characters/villager04.png'),
            savior:  path.join(ASSETS_DIR, 'characters/mc.png'),
        };

        const itemFiles = {
            lantern:     path.join(ASSETS_DIR, 'items/lantern.png'),
            axe:         path.join(ASSETS_DIR, 'items/axe.png'),
            fishing_rod: path.join(ASSETS_DIR, 'items/fishing_rod.png'),
            shovel:      path.join(ASSETS_DIR, 'items/shovel.png'),
            pickaxe:     path.join(ASSETS_DIR, 'items/pickaxe.png'),
            hammer:      path.join(ASSETS_DIR, 'items/hammer.png'),
            bucket:      path.join(ASSETS_DIR, 'items/bucket.png'),
            scythe:      path.join(ASSETS_DIR, 'items/scythe.png'),
        };

        const results = { stageImages: {}, itemImages: {} };

        for (const [stage, filePath] of Object.entries(stageFiles)) {
            if (this.stageImages[stage] && !this.stageImages[stage].startsWith('QmStub')) {
                console.log(`⏭️  Skipping ${stage} — already has CID: ${this.stageImages[stage]}`);
                results.stageImages[stage] = this.stageImages[stage];
                continue;
            }
            try {
                const fileData = await fs.readFile(filePath);
                const { rootHash } = await this._uploadAsFile(fileData);
                this.stageImages[stage] = rootHash;
                results.stageImages[stage] = rootHash;
                console.log(`✅ ${stage}: ${rootHash}`);
            } catch (err) {
                console.error(`❌ Failed to upload ${stage} image:`, err.message);
                results.stageImages[stage] = null;
            }
        }

        for (const [item, filePath] of Object.entries(itemFiles)) {
            if (this.itemImages[item] && !this.itemImages[item].startsWith('QmStub')) {
                console.log(`⏭️  Skipping ${item} — already has CID: ${this.itemImages[item]}`);
                results.itemImages[item] = this.itemImages[item];
                continue;
            }
            try {
                const fileData = await fs.readFile(filePath);
                const { rootHash } = await this._uploadAsFile(fileData);
                this.itemImages[item] = rootHash;
                results.itemImages[item] = rootHash;
                console.log(`✅ ${item}: ${rootHash}`);
            } catch (err) {
                console.error(`❌ Failed to upload ${item} image:`, err.message);
                results.itemImages[item] = null;
            }
        }

        console.log('\n📋 Add these to your .env file:');
        for (const [k, v] of Object.entries(results.stageImages)) {
            if (v) console.log(`${k.toUpperCase()}_IMAGE_CID=${v}`);
        }
        for (const [k, v] of Object.entries(results.itemImages)) {
            if (v) console.log(`ITEM_${k.toUpperCase()}_CID=${v}`);
        }

        return results;
    }

    // ============== ENCRYPTION UTILITIES ==============

    generateKeyPair() {
        const keypair = sodium.crypto_box_keypair();
        return {
            publicKey: Base64.fromUint8Array(keypair.publicKey),
            secretKey: Base64.fromUint8Array(keypair.privateKey),
        };
    }

    encryptMetadataForOwner(metadataJSON, ownerPublicKeyBase64) {
        try {
            const message = JSON.stringify(metadataJSON);
            const publicKey = Base64.toUint8Array(ownerPublicKeyBase64);
            if (publicKey.length !== sodium.crypto_box_PUBLICKEYBYTES) {
                throw new Error(`Invalid public key length: expected ${sodium.crypto_box_PUBLICKEYBYTES}, got ${publicKey.length}`);
            }
            return Base64.fromUint8Array(sodium.crypto_box_seal(message, publicKey));
        } catch (error) {
            throw new Error(`Failed to encrypt metadata: ${error.message}`);
        }
    }

    decryptMetadata(encryptedDataBase64, publicKeyBase64, secretKeyBase64) {
        try {
            const decrypted = sodium.crypto_box_seal_open(
                Base64.toUint8Array(encryptedDataBase64),
                Base64.toUint8Array(publicKeyBase64),
                Base64.toUint8Array(secretKeyBase64)
            );
            return JSON.parse(sodium.to_string(decrypted));
        } catch (error) {
            throw new Error('Failed to decrypt metadata');
        }
    }

    // ============== 0G STORAGE OPERATIONS ==============

    async uploadTo0G(metadata) {
        const result = await this._uploadAsFile(metadata);
        return result.rootHash;
    }

    build0gUrl(rootHash) {
        if (!rootHash || rootHash.startsWith('QmStub')) return null;
        return `0g://${rootHash}`;
    }

    // ============== INFT LIFECYCLE ==============

    async createGameINFT(playerAddress, gameMode, difficulty, ownerPublicKey) {
        if (!this.inftContract) throw new Error('INFT contract not initialised');

        console.log(`🎮 Creating INFT for ${playerAddress} in ${gameMode} mode`);

        const metadata     = this.generateInitialMetadata(gameMode, difficulty);
        const rootHash     = await this.uploadTo0G(metadata);
        const encryptedMeta = this.encryptMetadataForOwner(metadata, ownerPublicKey);
        const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(metadata)));
        const sealedKey    = Buffer.from(`sealed_key_${playerAddress}_${Date.now()}`);

        const tx      = await this.inftContract.birthINFT(playerAddress, gameMode, difficulty, rootHash, metadataHash, sealedKey);
        const receipt = await tx.wait();
        const tokenId = this.extractTokenIdFromReceipt(receipt);

        console.log(`✅ INFT #${tokenId} minted for ${playerAddress}`);
        return { tokenId, rootHash, metadataHash, metadata, encryptedMetadata: encryptedMeta };
    }

    async evolveINFT(tokenId, gameProgressData, ownerPublicKey, oracleProof = null) {
        if (!this.inftContract) throw new Error('INFT contract not initialised');

        console.log(`🌱 Evolving INFT #${tokenId}`);

        const newStage          = this.calculateStage(gameProgressData);
        const evolvedMetadata   = this.generateEvolvedMetadata(gameProgressData, newStage);
        const newRootHash       = await this.uploadTo0G(evolvedMetadata);          // ✅ was newIpfsHash (undefined)
        const newEncryptedMeta  = this.encryptMetadataForOwner(evolvedMetadata, ownerPublicKey);
        const newMetadataHash   = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(evolvedMetadata)));
        // Use real ECDSA oracle proof — deployer IS the oracle on this deployment
        const proof             = oracleProof || await this.generateOracleProof(tokenId, newMetadataHash);

        const tx = await this.inftContract.evolveINFT(tokenId, newStage, newEncryptedMeta, newMetadataHash, proof);
        await tx.wait();

        console.log(`✅ INFT #${tokenId} evolved to ${newStage}`);

        // Track version history — use newRootHash (not the old undefined newIpfsHash)
        const versionKey = `${tokenId}_v${gameProgressData.version || 1}`;
        this.metadataVersions.set(versionKey, {
            version:       gameProgressData.version || 1,
            stage:         newStage,
            metadata:      evolvedMetadata,
            rootHash:      newRootHash,          // ✅ fixed: was newIpfsHash
            metadataHash:  newMetadataHash,
            timestamp:     Date.now(),
            encryptedData: newEncryptedMeta,
        });

        return { tokenId, newStage, newRootHash, newMetadataHash, evolvedMetadata, encryptedMetadata: newEncryptedMeta };
    }

    async initiateSecureTransfer(tokenId, currentOwner, newOwner, transferProof = null) {
        if (!this.inftContract) throw new Error('INFT contract not initialised');

        const proof   = transferProof || this.generateSimpleProof(tokenId, ethers.getAddress(newOwner));
        const tx      = await this.inftContract.initiateSecureTransfer(tokenId, newOwner, proof);
        const receipt = await tx.wait();

        return { tokenId, from: currentOwner, to: newOwner, transactionHash: receipt.hash };
    }

    async completeSecureTransfer(tokenId, newOwner, newOwnerPublicKey, newSealedKey = null) {
        if (!this.inftContract) throw new Error('INFT contract not initialised');

        const currentInftData   = await this.inftContract.getCurrentMetadata(tokenId);
        const metadataJSON      = JSON.parse(Buffer.from(currentInftData.encryptedMetadataURI, 'base64').toString('utf8'));
        const newEncryptedMeta  = this.encryptMetadataForOwner(metadataJSON, newOwnerPublicKey);
        const sealedKey         = newSealedKey || Buffer.from(`sealed_key_${newOwner}_${Date.now()}`);
        const keyValidUntil     = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

        const tx = await this.inftContract.completeSecureTransferWithNewKey(tokenId, newOwner, sealedKey, keyValidUntil);
        await tx.wait();

        return { tokenId, newOwner, transactionHash: tx.hash, newEncryptedMetadata: newEncryptedMeta };
    }

    // ============== METADATA GENERATION ==============

    generateInitialMetadata(gameMode, difficulty) {
        const timestamp = Date.now();
        return {
            name:         `Beyond-The-Fog Guide #${timestamp.toString().slice(-4)}`,
            description:  'An AI companion born from your first steps into the mysterious village.',
            image:        this.build0gUrl(this.stageImages.newborn),
            external_url: 'https://beyond-the-fog.game',
            attributes: [
                { trait_type: 'Stage',                value: 'Newborn Guide' },
                { trait_type: 'Game Mode',            value: gameMode },
                { trait_type: 'Difficulty',           value: difficulty },
                { trait_type: 'Mysteries Solved',     value: 0 },
                { trait_type: 'Villager Interactions',value: 0 },
                { trait_type: 'Items Collected',      value: 0 },
                { trait_type: 'Penalties Paid',       value: '0.00' },
                { trait_type: 'Birth Timestamp',      value: timestamp },
                { trait_type: 'Rarity',               value: 'Common' },
            ],
            properties: {
                stage: 'newborn', gameActive: true, completionTime: null,
                finalScore: null, personalityType: 'Unknown', specialization: 'None', version: 1,
            },
        };
    }

    generateEvolvedMetadata(gameData, stage) {
        const stageNames = { newborn:'Newborn Guide', curious:'Curious Seeker', master:'Tool Master', wise:'Wise Explorer', savior:'Village Savior' };
        const rarityMap  = { newborn:'Common', curious:'Uncommon', master:'Rare', wise:'Epic', savior:'Legendary' };
        return {
            name:         `Beyond-The-Fog Guide #${gameData.tokenId || 'Unknown'}`,
            description:  this.generateStageDescription(stage, gameData),
            image:        this.build0gUrl(this.stageImages[stage]),
            external_url: 'https://beyond-the-fog.game',
            attributes: [
                { trait_type: 'Stage',                value: stageNames[stage] },
                { trait_type: 'Game Mode',            value: gameData.gameMode || 'single_player' },
                { trait_type: 'Mysteries Solved',     value: gameData.mysteriesSolved || 0 },
                { trait_type: 'Villager Interactions',value: gameData.villagerInteractions || 0 },
                { trait_type: 'Items Collected',      value: gameData.itemsCollected || 0 },
                { trait_type: 'Penalties Paid',       value: gameData.penaltiesPaid || '0.00' },
                { trait_type: 'Current Score',        value: gameData.currentScore || 0 },
                { trait_type: 'Rarity',               value: rarityMap[stage] },
                { trait_type: 'Personality Type',     value: this.analyzePersonality(gameData) },
                { trait_type: 'Specialization',       value: this.determineSpecialization(gameData) },
                { trait_type: 'Play Duration',        value: `${gameData.playDurationSeconds || 0}s` },
            ],
            properties: {
                stage, gameActive: !gameData.isCompleted,
                completionTime: gameData.completionTime || null,
                finalScore: gameData.finalScore || null,
                collectedItems: gameData.collectedItemNames || [],
                conversationHistory: gameData.dialogueCount || 0,
                version: gameData.version || 1,
                lastUpdated: Date.now(),
            },
        };
    }

    generateStageDescription(stage, gameData) {
        const base = {
            newborn:  'A newly awakened consciousness, eager to explore the village mysteries.',
            curious:  'An inquisitive entity that has begun to understand the village\'s secrets.',
            master:   'A skilled companion that has mastered tool collection and problem-solving.',
            wise:     'An experienced guide with deep knowledge of the village\'s hidden truths.',
            savior:   'A legendary hero who successfully unravelled the mystery and saved the missing friends.',
        };
        let desc = base[stage] || base.newborn;
        if (gameData.villagerInteractions > 5) desc += ' Known for engaging deeply with villagers.';
        if (gameData.itemsCollected > 2)       desc += ' Renowned for collecting essential tools.';
        if (parseFloat(gameData.penaltiesPaid || '0') > 0) desc += ' Shows resilience in learning from mistakes.';
        return desc;
    }

    calculateStage(gameData) {
        const i = gameData.villagerInteractions || 0;
        const t = gameData.itemsCollected || 0;
        const p = gameData.progressPercentage || 0;
        if (p >= 90)           return 'savior';
        if (p >= 70 || t >= 3) return 'wise';
        if (p >= 40 || i >= 5) return 'master';
        if (i >= 2  || t >= 1) return 'curious';
        return 'newborn';
    }

    analyzePersonality(gameData) {
        const i = gameData.villagerInteractions || 0;
        const t = gameData.itemsCollected || 0;
        const p = parseFloat(gameData.penaltiesPaid || '0');
        if (i > t && p === 0) return 'Diplomatic';
        if (t > i && p === 0) return 'Practical';
        if (p > 0)            return 'Persistent';
        if (i > 8)            return 'Social';
        if (t > 3)            return 'Collector';
        return 'Balanced';
    }

    determineSpecialization(gameData) {
        const items = gameData.collectedItemNames || [];
        if (items.includes('LANTERN')     && items.includes('PICKAXE'))    return 'Cave Explorer';
        if (items.includes('FISHING_ROD') && items.includes('BUCKET'))     return 'Water Specialist';
        if (items.includes('AXE')         && items.includes('HAMMER'))     return 'Craftsman';
        if (items.includes('SHOVEL')      && items.includes('SCYTHE'))     return 'Earth Worker';
        if (items.length >= 4) return 'Master Collector';
        if (items.length >= 2) return 'Tool Specialist';
        return 'Generalist';
    }

    // ============== PROOF GENERATION ==============

    /**
     * Generate a real ECDSA oracle proof signed by the deployer wallet.
     * The NarrativeINFT contract verifies:
     *   keccak256(abi.encodePacked(tokenId, metadataHash)).toEthSignedMessageHash()
     * signed by oracleAddress (which is the deployer on this deployment).
     */
    async generateOracleProof(tokenId, metadataHash) {
        try {
            // The contract checks: ECDSA.recover(ethSignedHash, proof) == oracleAddress
            // oracleAddress was set to the deployer in DeployAll.s.sol
            // this.signer IS the deployer wallet, so we can sign directly
            const messageHash = ethers.keccak256(
                ethers.solidityPacked(['uint256', 'bytes32'], [tokenId, metadataHash])
            );
            // Sign with eth_sign prefix (matches MessageHashUtils.toEthSignedMessageHash)
            const signature = await this.signer.signMessage(ethers.getBytes(messageHash));
            console.log(`🔏 Oracle proof generated for token #${tokenId}`);
            return signature; // 65-byte ECDSA signature
        } catch (err) {
            console.error('❌ Failed to generate oracle proof:', err.message);
            throw new Error(`Oracle proof generation failed: ${err.message}`);
        }
    }

    /**
     * @deprecated Use generateOracleProof() instead.
     * Kept for backward compatibility — will be rejected by the contract.
     */
    generateSimpleProof(tokenId, dataHash) {
        return ethers.solidityPacked(
            ['uint256', 'bytes32', 'uint256'],
            [tokenId, dataHash, Math.floor(Date.now() / 1000)]
        );
    }

    // ============== EXTRACTION HELPERS ==============

    extractTokenIdFromReceipt(receipt) {
        const transferEvent = receipt.logs.find(
            log => log.topics[0] === ethers.id('Transfer(address,address,uint256)')
        );
        return transferEvent ? parseInt(transferEvent.topics[3], 16) : null;
    }
}
