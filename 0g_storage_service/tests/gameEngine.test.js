/**
 * gameEngine.test.js
 * Tests for GameEngine — all LLM calls are mocked so no network needed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameEngine } from '../lib/game/gameEngine.js';
import { VILLAGER_ROSTER, FAMILIARITY_LEVELS } from '../lib/constants.js';

// ── Mock the LLM so tests never hit 0G Compute ──────────────────────────────
vi.mock('../lib/infra/llm.js', () => ({
    ZeroGravityAI: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        generate: vi.fn(),
    })),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeStoryResponse(numLocations = 3) {
    const locations = Array.from({ length: numLocations }, (_, i) => `Location_${i}`);
    return JSON.stringify({
        story_theme:            'A dark fog has swallowed the village.',
        inaccessible_locations: locations,
        correct_location:       locations[0],
    });
}

function makeQuestNetworkResponse(villagerName = 'Arthur Hobbs') {
    return JSON.stringify({
        nodes: [
            { node_id: 'n1', villager_name: villagerName, content: 'Clue about the fog.', required_familiarity: 0, preconditions: [] },
            { node_id: 'n2', villager_name: villagerName, content: 'Deeper secret.',       required_familiarity: 2, preconditions: ['n1'] },
        ],
    });
}

function makeInteractionResponse(overrides = {}) {
    return JSON.stringify({
        npc_dialogue:          'I know something about the fog...',
        player_responses:      ['Tell me more.', 'I must go.'],
        new_familiarity_level: 1,
        node_revealed_id:      null,
        ...overrides,
    });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('GameEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new GameEngine();
    });

    // ── startNewGame ──────────────────────────────────────────────────────────

    describe('startNewGame', () => {
        it('returns a valid game state with correct shape', async () => {
            engine.llm.generate
                .mockResolvedValueOnce(makeStoryResponse(3))
                .mockResolvedValueOnce(makeQuestNetworkResponse());

            const state = await engine.startNewGame(3, 'Medium');

            expect(state.storyTheme).toBe('A dark fog has swallowed the village.');
            expect(state.inaccessibleLocations).toHaveLength(3);
            expect(state.correctLocation).toBe('Location_0');
            expect(state.discoveredNodes).toEqual([]);
            expect(state.villagers).toHaveLength(VILLAGER_ROSTER.length);
        });

        it('initialises every villager with familiarity 0 and empty chatHistory', async () => {
            engine.llm.generate
                .mockResolvedValueOnce(makeStoryResponse(2))
                .mockResolvedValueOnce(makeQuestNetworkResponse());

            const state = await engine.startNewGame(2, 'Easy');

            state.villagers.forEach((v, i) => {
                expect(v.id).toBe(`villager_${i}`);
                expect(v.familiarity).toBe(0);
                expect(v.chatHistory).toEqual([]);
                expect(v.name).toBe(VILLAGER_ROSTER[i].name);
            });
        });

        it('calls llm.generate exactly twice (story + quest network)', async () => {
            engine.llm.generate
                .mockResolvedValueOnce(makeStoryResponse(2))
                .mockResolvedValueOnce(makeQuestNetworkResponse());

            await engine.startNewGame(2, 'Hard');
            expect(engine.llm.generate).toHaveBeenCalledTimes(2);
        });

        it('propagates LLM errors', async () => {
            engine.llm.generate.mockRejectedValueOnce(new Error('LLM offline'));
            await expect(engine.startNewGame(3, 'Medium')).rejects.toThrow('LLM offline');
        });
    });

    // ── interact ──────────────────────────────────────────────────────────────

    describe('interact', () => {
        let gameState;

        beforeEach(async () => {
            engine.llm.generate
                .mockResolvedValueOnce(makeStoryResponse(3))
                .mockResolvedValueOnce(makeQuestNetworkResponse('Arthur Hobbs'));
            gameState = await engine.startNewGame(3, 'Medium');
            engine.llm.generate.mockReset();
        });

        it('returns npc_dialogue from LLM response', async () => {
            engine.llm.generate.mockResolvedValueOnce(makeInteractionResponse());
            const result = await engine.interact(gameState, 'villager_0', 'Hello');
            expect(result.npc_dialogue).toBe('I know something about the fog...');
        });

        it('appends player and npc messages to chatHistory', async () => {
            engine.llm.generate.mockResolvedValueOnce(makeInteractionResponse());
            await engine.interact(gameState, 'villager_0', 'Hello');

            const history = gameState.villagers[0].chatHistory;
            expect(history).toHaveLength(2);
            expect(history[0]).toEqual({ role: 'player', content: 'Hello' });
            expect(history[1]).toEqual({ role: 'npc', content: 'I know something about the fog...' });
        });

        it('increments familiarity by at most 1 per interaction', async () => {
            // LLM says familiarity should jump to 5 — should be capped at 1
            engine.llm.generate.mockResolvedValueOnce(
                makeInteractionResponse({ new_familiarity_level: 5 })
            );
            await engine.interact(gameState, 'villager_0', 'Hello');
            expect(gameState.villagers[0].familiarity).toBe(1);
        });

        it('does not decrease familiarity', async () => {
            gameState.villagers[0].familiarity = 3;
            engine.llm.generate.mockResolvedValueOnce(
                makeInteractionResponse({ new_familiarity_level: 1 })
            );
            await engine.interact(gameState, 'villager_0', 'Hello');
            expect(gameState.villagers[0].familiarity).toBe(3);
        });

        it('adds revealed node to discoveredNodes', async () => {
            engine.llm.generate.mockResolvedValueOnce(
                makeInteractionResponse({ node_revealed_id: 'n1' })
            );
            await engine.interact(gameState, 'villager_0', 'Tell me about the fog');
            expect(gameState.discoveredNodes).toContain('n1');
        });

        it('does not add the same node twice', async () => {
            gameState.discoveredNodes.push('n1');
            engine.llm.generate.mockResolvedValueOnce(
                makeInteractionResponse({ node_revealed_id: 'n1' })
            );
            await engine.interact(gameState, 'villager_0', 'Again');
            expect(gameState.discoveredNodes.filter(n => n === 'n1')).toHaveLength(1);
        });

        it('updates knowledgeSummary when a node is revealed', async () => {
            engine.llm.generate.mockResolvedValueOnce(
                makeInteractionResponse({ node_revealed_id: 'n1' })
            );
            await engine.interact(gameState, 'villager_0', 'Tell me');
            expect(gameState.knowledgeSummary).toContain('Clue about the fog.');
        });
    });

    // ── _getClueStatus ────────────────────────────────────────────────────────

    describe('_getClueStatus', () => {
        let gameState;

        beforeEach(async () => {
            engine.llm.generate
                .mockResolvedValueOnce(makeStoryResponse(2))
                .mockResolvedValueOnce(makeQuestNetworkResponse('Arthur Hobbs'));
            gameState = await engine.startNewGame(2, 'Easy');
            engine.llm.generate.mockReset();
        });

        it('returns CAN_REVEAL when preconditions met and familiarity sufficient', () => {
            const villager = gameState.villagers[0]; // Arthur Hobbs
            const status = engine._getClueStatus(gameState, villager);
            expect(status.status).toBe('CAN_REVEAL');
            expect(status.node.node_id).toBe('n1');
        });

        it('returns HAS_LOCKED_CLUES when familiarity too low for next node', () => {
            const villager = gameState.villagers[0];
            // Reveal n1 so only n2 (requires familiarity 2) remains
            gameState.discoveredNodes.push('n1');
            const status = engine._getClueStatus(gameState, villager);
            expect(status.status).toBe('HAS_LOCKED_CLUES');
        });

        it('returns PERMANENTLY_EXHAUSTED when all nodes discovered', () => {
            const villager = gameState.villagers[0];
            gameState.discoveredNodes.push('n1', 'n2');
            const status = engine._getClueStatus(gameState, villager);
            expect(status.status).toBe('PERMANENTLY_EXHAUSTED');
        });

        it('returns PERMANENTLY_EXHAUSTED for a villager with no nodes', () => {
            // villager_1 is Sam — no nodes in the quest network
            const villager = gameState.villagers[1];
            const status = engine._getClueStatus(gameState, villager);
            expect(status.status).toBe('PERMANENTLY_EXHAUSTED');
        });
    });

    // ── serialize / deserialize ───────────────────────────────────────────────

    describe('serialize / deserialize', () => {
        it('round-trips game state without data loss', async () => {
            engine.llm.generate
                .mockResolvedValueOnce(makeStoryResponse(2))
                .mockResolvedValueOnce(makeQuestNetworkResponse());
            const original = await engine.startNewGame(2, 'Easy');

            const json       = engine.serialize(original);
            const restored   = engine.deserialize(json);

            expect(restored.storyTheme).toBe(original.storyTheme);
            expect(restored.inaccessibleLocations).toEqual(original.inaccessibleLocations);
            expect(restored.villagers).toHaveLength(original.villagers.length);
            expect(restored.discoveredNodes).toEqual([]);
        });

        it('serialized output is valid JSON', async () => {
            engine.llm.generate
                .mockResolvedValueOnce(makeStoryResponse(2))
                .mockResolvedValueOnce(makeQuestNetworkResponse());
            const state = await engine.startNewGame(2, 'Easy');
            expect(() => JSON.parse(engine.serialize(state))).not.toThrow();
        });
    });
});
