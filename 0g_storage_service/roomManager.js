import { randomUUID } from 'node:crypto';

export class RoomManager {
    constructor(gameEngine, storageManager) {
        this.gameEngine = gameEngine;
        this.storageManager = storageManager;
        this.rooms = new Map(); // roomId -> { players: Map(playerId -> {ws, name}), state: 'lobby'|'playing', gameData: null }
        this.playerToRoom = new Map(); // playerId -> roomId
    }

    createRoom() {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.rooms.set(roomId, {
            players: new Map(),
            state: 'lobby',
            gameData: null
        });
        console.log(`🏠 Room created: ${roomId}`);
        return roomId;
    }

    handleConnection(ws, roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
            ws.close();
            return;
        }

        if (room.state !== 'lobby' && !room.players.has(playerId)) {
            ws.send(JSON.stringify({ type: 'error', message: 'Game already in progress' }));
            ws.close();
            return;
        }

        // Register player
        room.players.set(playerId, { ws, id: playerId });
        this.playerToRoom.set(playerId, roomId);

        console.log(`👤 Player ${playerId} joined room ${roomId}`);

        // Broadcast player list
        this.broadcast(roomId, {
            type: 'player_joined',
            players: Array.from(room.players.values()).map(p => ({ id: p.id }))
        });

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                await this.handleMessage(roomId, playerId, data);
            } catch (e) {
                console.error('WS Message Error:', e);
            }
        });

        ws.on('close', () => {
            room.players.delete(playerId);
            this.playerToRoom.delete(playerId);
            console.log(`👤 Player ${playerId} left room ${roomId}`);
            
            if (room.players.size === 0) {
                this.rooms.delete(roomId);
                console.log(`🏠 Room ${roomId} closed (empty)`);
            } else {
                this.broadcast(roomId, {
                    type: 'player_left',
                    playerId,
                    players: Array.from(room.players.values()).map(p => ({ id: p.id }))
                });
            }
        });
    }

    async handleMessage(roomId, playerId, data) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        switch (data.type) {
            case 'start_game':
                if (room.state === 'lobby') {
                    room.state = 'playing';
                    const gameState = await this.gameEngine.startNewGame(5, 'Medium');
                    room.gameData = gameState;
                    
                    this.broadcast(roomId, {
                        type: 'game_started',
                        game_data: {
                            ...gameState,
                            isMultiplayer: true,
                            roomId: roomId
                        }
                    });
                    
                    // Persist start event to 0G DA
                    await this.storageManager.makeDataAvailable({
                        roomId,
                        players: Array.from(room.players.keys()),
                        timestamp: Date.now()
                    }, "Multiplayer Game Started");
                }
                break;

            case 'player_move':
                // Relay movement to other players
                this.broadcast(roomId, {
                    type: 'remote_move',
                    playerId,
                    pos: data.pos,
                    anim: data.anim
                }, playerId); // Skip sender
                break;

            case 'chat':
                this.broadcast(roomId, {
                    type: 'chat_message',
                    playerId,
                    message: data.message
                });
                break;
        }
    }

    broadcast(roomId, data, skipPlayerId = null) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const message = JSON.stringify(data);
        room.players.forEach((player, id) => {
            if (id !== skipPlayerId && player.ws.readyState === 1) { // 1 = OPEN
                player.ws.send(message);
            }
        });
    }
}
