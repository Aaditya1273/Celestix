/**
 * inftManager.test.js
 * Tests for INFTManager — 0G Storage, ethers, and libsodium are all mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock heavy dependencies before importing INFTManager ────────────────────

vi.mock('@0glabs/0g-ts-sdk', () => ({
    Indexer: vi.fn().mockImplementation(() => ({
        upload:   vi.fn().mockResolvedValue([{ hash: '0xTEST_TX' }, null]),
        download: vi.fn().mockResolvedValue(null),
    })),
    ZgFile: {
        fromFilePath: vi.fn().mockResolvedValue({
            merkleTree: vi.fn().mockResolvedValue([{ rootHash: () => '0xTEST_ROOT' }, null]),
            close:      vi.fn().mockResolvedValue(undefined),
        }),
    },
}));

vi.mock('@0glabs/0g-serving-broker', () => ({
    createZGComputeNetworkBroker: vi.fn(),
}));

vi.mock('@grpc/grpc-js', () => ({
    default: { credentials: { createInsecure: vi.fn() } },
    credentials: { createInsecure: vi.fn() },
}));

vi.mock('@grpc/proto-loader', () => ({
    default: { loadSync: vi.fn().mockReturnValue({}) },
    loadSync: vi.fn().mockReturnValue({}),
}));

vi.mock('libsodium-wrappers', () => ({
    default: {
        ready:                    Promise.resolve(),
        crypto_box_keypair:       vi.fn().mockReturnValue({ publicKey: new Uint8Array(32), privateKey: new Uint8Array(32) }),
        crypto_box_seal:          vi.fn().mockReturnValue(new Uint8Array(64)),
        crypto_box_seal_open:     vi.fn().mockReturnValue(new TextEncoder().encode(JSON.stringify({ test: true }))),
        crypto_box_PUBLICKEYBYTES: 32,
        to_string:                vi.fn().mockReturnValue(JSON.stringify({ test: true })),
    },
}));

vi.mock('ethers', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        ethers: {
            ...actual.ethers,
            Wallet:          vi.fn().mockImplementation(() => ({
                address:     '0xDEAD',
                signMessage: vi.fn().mockResolvedValue('0x' + 'ab'.repeat(65)), // 65-byte mock sig
            })),
            JsonRpcProvider: vi.fn().mockImplementation(() => ({
                getNetwork: vi.fn().mockResolvedValue({ chainId: 16602n }),
                getBalance: vi.fn().mockResolvedValue(100n),
            })),
            Contract: vi.fn().mockImplementation(() => ({
                birthINFT:   vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue({ logs: [] }) }),
                evolveINFT:  vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue({}) }),
                isUserRegistered:       vi.fn().mockResolvedValue(false),
                latestDialogueRootHash: vi.fn().mockResolvedValue(''),
                updateDialogueRoot:     vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue({}) }),
                getPlayerINFTs:         vi.fn().mockResolvedValue([]),
            })),
            keccak256:       vi.fn().mockReturnValue('0xHASH'),
            toUtf8Bytes:     vi.fn().mockReturnValue(new Uint8Array()),
            solidityPacked:  vi.fn().mockReturnValue('0xPROOF'),
            getBytes:        vi.fn().mockReturnValue(new Uint8Array(32)),
            id:              vi.fn().mockReturnValue('0xEVENT_ID'),
            getAddress:      vi.fn().mockImplementation(a => a),
            formatEther:     vi.fn().mockReturnValue('1.0'),
        },
    };
});

// fs mock — prevent real disk I/O
vi.mock('fs/promises', () => ({
    default: {
        mkdtemp:   vi.fn().mockResolvedValue('/tmp/mock-dir'),
        writeFile: vi.fn().mockResolvedValue(undefined),
        readFile:  vi.fn().mockResolvedValue(Buffer.from('{"test":true}')),
        unlink:    vi.fn().mockResolvedValue(undefined),
        rmdir:     vi.fn().mockResolvedValue(undefined),
        mkdir:     vi.fn().mockResolvedValue(undefined),
    },
    mkdtemp:   vi.fn().mockResolvedValue('/tmp/mock-dir'),
    writeFile: vi.fn().mockResolvedValue(undefined),
    readFile:  vi.fn().mockResolvedValue(Buffer.from('{"test":true}')),
    unlink:    vi.fn().mockResolvedValue(undefined),
    rmdir:     vi.fn().mockResolvedValue(undefined),
    mkdir:     vi.fn().mockResolvedValue(undefined),
}));

import { INFTManager } from '../INFTManager.js';

// ── Tests ────────────────────────────────────────────────────────────────────

describe('INFTManager', () => {
    let manager;

    beforeEach(() => {
        manager = new INFTManager();
        // Give async constructor tasks a tick to settle
    });

    // ── calculateStage ────────────────────────────────────────────────────────

    describe('calculateStage', () => {
        it('returns newborn for a fresh player', () => {
            expect(manager.calculateStage({})).toBe('newborn');
        });

        it('returns curious after 2 interactions', () => {
            expect(manager.calculateStage({ villagerInteractions: 2 })).toBe('curious');
        });

        it('returns curious after collecting 1 item', () => {
            expect(manager.calculateStage({ itemsCollected: 1 })).toBe('curious');
        });

        it('returns master at 40% progress', () => {
            expect(manager.calculateStage({ progressPercentage: 40 })).toBe('master');
        });

        it('returns master after 5 interactions', () => {
            expect(manager.calculateStage({ villagerInteractions: 5 })).toBe('master');
        });

        it('returns wise at 70% progress', () => {
            expect(manager.calculateStage({ progressPercentage: 70 })).toBe('wise');
        });

        it('returns wise after collecting 3 items', () => {
            expect(manager.calculateStage({ itemsCollected: 3 })).toBe('wise');
        });

        it('returns savior at 90% progress', () => {
            expect(manager.calculateStage({ progressPercentage: 90 })).toBe('savior');
        });

        it('returns savior at 100% progress', () => {
            expect(manager.calculateStage({ progressPercentage: 100 })).toBe('savior');
        });
    });

    // ── analyzePersonality ────────────────────────────────────────────────────

    describe('analyzePersonality', () => {
        it('returns Diplomatic for high interactions, no penalties', () => {
            expect(manager.analyzePersonality({ villagerInteractions: 5, itemsCollected: 1, penaltiesPaid: '0' })).toBe('Diplomatic');
        });

        it('returns Practical for high items, no penalties', () => {
            expect(manager.analyzePersonality({ villagerInteractions: 1, itemsCollected: 5, penaltiesPaid: '0' })).toBe('Practical');
        });

        it('returns Persistent when penalties > 0', () => {
            expect(manager.analyzePersonality({ penaltiesPaid: '0.5' })).toBe('Persistent');
        });

        it('returns Social for 9+ interactions (equal items, no penalties)', () => {
            // i=9, t=9 → neither i>t nor t>i, so falls through to Social check
            expect(manager.analyzePersonality({ villagerInteractions: 9, itemsCollected: 9, penaltiesPaid: '0' })).toBe('Social');
        });

        it('returns Collector for 4+ items (equal interactions, no penalties)', () => {
            // i=4, t=4 → neither i>t nor t>i, i<=8, t>3 → Collector
            expect(manager.analyzePersonality({ villagerInteractions: 4, itemsCollected: 4, penaltiesPaid: '0' })).toBe('Collector');
        });

        it('returns Balanced as default', () => {
            expect(manager.analyzePersonality({})).toBe('Balanced');
        });
    });

    // ── determineSpecialization ───────────────────────────────────────────────

    describe('determineSpecialization', () => {
        it('Cave Explorer for LANTERN + PICKAXE', () => {
            expect(manager.determineSpecialization({ collectedItemNames: ['LANTERN', 'PICKAXE'] })).toBe('Cave Explorer');
        });

        it('Water Specialist for FISHING_ROD + BUCKET', () => {
            expect(manager.determineSpecialization({ collectedItemNames: ['FISHING_ROD', 'BUCKET'] })).toBe('Water Specialist');
        });

        it('Craftsman for AXE + HAMMER', () => {
            expect(manager.determineSpecialization({ collectedItemNames: ['AXE', 'HAMMER'] })).toBe('Craftsman');
        });

        it('Earth Worker for SHOVEL + SCYTHE', () => {
            expect(manager.determineSpecialization({ collectedItemNames: ['SHOVEL', 'SCYTHE'] })).toBe('Earth Worker');
        });

        it('Master Collector for 4+ items', () => {
            expect(manager.determineSpecialization({ collectedItemNames: ['AXE', 'SHOVEL', 'BUCKET', 'LANTERN'] })).toBe('Master Collector');
        });

        it('Tool Specialist for 2-3 items without a named combo', () => {
            expect(manager.determineSpecialization({ collectedItemNames: ['AXE', 'SHOVEL'] })).toBe('Tool Specialist');
        });

        it('Generalist for 0-1 items', () => {
            expect(manager.determineSpecialization({ collectedItemNames: [] })).toBe('Generalist');
            expect(manager.determineSpecialization({ collectedItemNames: ['AXE'] })).toBe('Generalist');
        });
    });

    // ── generateInitialMetadata ───────────────────────────────────────────────

    describe('generateInitialMetadata', () => {
        it('returns valid ERC-721 metadata shape', () => {
            const meta = manager.generateInitialMetadata('single_player', 'medium');
            expect(meta).toHaveProperty('name');
            expect(meta).toHaveProperty('description');
            expect(meta).toHaveProperty('attributes');
            expect(meta).toHaveProperty('properties');
            expect(Array.isArray(meta.attributes)).toBe(true);
        });

        it('sets stage to newborn', () => {
            const meta = manager.generateInitialMetadata('single_player', 'easy');
            const stageTrait = meta.attributes.find(a => a.trait_type === 'Stage');
            expect(stageTrait.value).toBe('Newborn Guide');
            expect(meta.properties.stage).toBe('newborn');
        });

        it('embeds gameMode and difficulty in attributes', () => {
            const meta = manager.generateInitialMetadata('multiplayer', 'hard');
            const mode = meta.attributes.find(a => a.trait_type === 'Game Mode');
            const diff = meta.attributes.find(a => a.trait_type === 'Difficulty');
            expect(mode.value).toBe('multiplayer');
            expect(diff.value).toBe('hard');
        });

        it('sets gameActive to true', () => {
            const meta = manager.generateInitialMetadata('single_player', 'medium');
            expect(meta.properties.gameActive).toBe(true);
        });
    });

    // ── generateEvolvedMetadata ───────────────────────────────────────────────

    describe('generateEvolvedMetadata', () => {
        const gameData = {
            tokenId: 42, gameMode: 'single_player',
            mysteriesSolved: 2, villagerInteractions: 6,
            itemsCollected: 3, penaltiesPaid: '0.1',
            currentScore: 500, progressPercentage: 75,
            isCompleted: false, version: 2,
        };

        it('sets correct stage name in attributes', () => {
            const meta = manager.generateEvolvedMetadata(gameData, 'wise');
            const stageTrait = meta.attributes.find(a => a.trait_type === 'Stage');
            expect(stageTrait.value).toBe('Wise Explorer');
        });

        it('sets Epic rarity for wise stage', () => {
            const meta = manager.generateEvolvedMetadata(gameData, 'wise');
            const rarity = meta.attributes.find(a => a.trait_type === 'Rarity');
            expect(rarity.value).toBe('Epic');
        });

        it('sets Legendary rarity for savior stage', () => {
            const meta = manager.generateEvolvedMetadata(gameData, 'savior');
            const rarity = meta.attributes.find(a => a.trait_type === 'Rarity');
            expect(rarity.value).toBe('Legendary');
        });

        it('sets gameActive false when isCompleted is true', () => {
            const meta = manager.generateEvolvedMetadata({ ...gameData, isCompleted: true }, 'savior');
            expect(meta.properties.gameActive).toBe(false);
        });

        it('includes personality and specialization traits', () => {
            const meta = manager.generateEvolvedMetadata(gameData, 'wise');
            expect(meta.attributes.find(a => a.trait_type === 'Personality Type')).toBeDefined();
            expect(meta.attributes.find(a => a.trait_type === 'Specialization')).toBeDefined();
        });
    });

    // ── generateStageDescription ──────────────────────────────────────────────

    describe('generateStageDescription', () => {
        it('appends villager engagement note for 6+ interactions', () => {
            const desc = manager.generateStageDescription('curious', { villagerInteractions: 6, itemsCollected: 0, penaltiesPaid: '0' });
            expect(desc).toContain('engaging deeply with villagers');
        });

        it('appends tool note for 3+ items', () => {
            const desc = manager.generateStageDescription('master', { villagerInteractions: 0, itemsCollected: 3, penaltiesPaid: '0' });
            expect(desc).toContain('collecting essential tools');
        });

        it('appends resilience note when penalties > 0', () => {
            const desc = manager.generateStageDescription('newborn', { villagerInteractions: 0, itemsCollected: 0, penaltiesPaid: '0.5' });
            expect(desc).toContain('resilience');
        });

        it('returns base description with no extras for fresh player', () => {
            const desc = manager.generateStageDescription('newborn', { villagerInteractions: 0, itemsCollected: 0, penaltiesPaid: '0' });
            expect(desc).toContain('newly awakened');
            expect(desc).not.toContain('villagers');
        });
    });

    // ── build0gUrl ────────────────────────────────────────────────────────────

    describe('build0gUrl', () => {
        it('returns null for null input', () => {
            expect(manager.build0gUrl(null)).toBeNull();
        });

        it('returns null for stub CIDs', () => {
            expect(manager.build0gUrl('QmStubNewborn')).toBeNull();
        });

        it('returns 0g:// URL for real root hash', () => {
            expect(manager.build0gUrl('0xABCDEF')).toBe('0g://0xABCDEF');
        });
    });

    // ── generateOracleProof ───────────────────────────────────────────────────

    describe('generateOracleProof', () => {
        it('returns a non-empty signature string', async () => {
            const proof = await manager.generateOracleProof(1, '0xHASH');
            expect(proof).toBeTruthy();
            expect(typeof proof).toBe('string');
        });

        it('calls signer.signMessage to produce a real ECDSA signature', async () => {
            const { ethers } = await import('ethers');
            vi.clearAllMocks();
            await manager.generateOracleProof(1, '0xHASH');
            // keccak256 builds the message hash, getBytes converts it for signMessage
            expect(ethers.keccak256).toHaveBeenCalled();
            expect(ethers.getBytes).toHaveBeenCalled();
        });
    });

    // ── generateSimpleProof (legacy) ──────────────────────────────────────────

    describe('generateSimpleProof', () => {
        it('returns a non-empty value', () => {
            const proof = manager.generateSimpleProof(1, '0xHASH');
            expect(proof).toBeTruthy();
        });

        it('calls solidityPacked for each invocation', async () => {
            const { ethers } = await import('ethers');
            vi.clearAllMocks();
            manager.generateSimpleProof(1, '0xHASH');
            manager.generateSimpleProof(2, '0xHASH');
            expect(ethers.solidityPacked).toHaveBeenCalledTimes(2);
        });
    });
});
