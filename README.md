# Beyond The Fog — 0G Native AI Mystery Game

A fully on-chain AI-driven narrative RPG built natively on the **0G Galileo Testnet**. Every NPC conversation is AI-generated, every game state is anchored to 0G decentralized storage, and every item and avatar is a real NFT on-chain.

---

## Live Contracts (0G Galileo Testnet — Chain 16602)

Deployed | Deployer: `0x5aB3036C7d0bA7043E0BB531374dC6c732eC4954`

| Contract | Address | Standard |
| :--- | :--- | :--- |
| **UserRegistry** | `0x90564782BfCd4abddC749B2209C03F774e82191e` | Custom |
| **GameItems** | `0x61c54308FD1f5bB2451DE76DADaDE3b590b256e6` | ERC-721 |
| **StakingManager** | `0x2f48419F77E6cD6E9D319Dc1314a1b1008C8ddfB` | Custom |
| **NarrativeINFT** | `0x5EFaA2dd48323156ebE3d5B4834d83fcB8bFfcF4` | ERC-7857 |
| **TradeManager** | `0x1284159FA72081846e6a0e947a34CaF2Df9e70Bd` | Custom |
| **WrappedOGBase** | `0x0000000000000000000000000000000000001001` | Precompile |

Explorer: [chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai)

---

## Architecture

```
Player Browser (Next.js 14 + Phaser 3)
    │
    ├── wagmi / RainbowKit ──────────────► 0G Galileo Testnet (Chain 16602)
    │                                              │
    │                                    5 Smart Contracts
    │                                    + WrappedOGBase precompile
    │
    ├── REST API ────────────────────────► Python FastAPI Backend (port 3002)
    │                                              │
    │                                   ┌──────────┼──────────┐
    │                                   │          │          │
    │                              GameEngine  OGStorage  ERC-7857
    │                                   │          │       Oracle
    │                              Gemini 2.0  0G Storage  ECDSA
    │                              Flash Lite  (async)     Proofs
    │
    └── WebSocket ──────────────────────► Multiplayer rooms
```

---

## 0G Integration Points

| Feature | 0G Service | How |
| :--- | :--- | :--- |
| Dialogue history | **0G Storage** | Async upload via `@0glabs/0g-ts-sdk`, root hash anchored to `UserRegistry` on-chain |
| iNFT metadata | **0G Storage** | ERC-7857 `NarrativeINFT` — URI points to 0G Storage, evolves with gameplay |
| Game rewards | **Native 0G token** | Backend sends native 0G directly to winners via `StakingManager` |
| NFT trading | **WrappedOGBase** | `TradeManager` uses official 0G precompile (`0x...1001`) for payments |
| AI inference | **Gemini 2.0 Flash Lite** | Story generation, NPC dialogue, quest network — with retry/circuit breaker |

---

## Smart Contract Summary

### GameItems (ERC-721)
- Each tool (axe, shovel, fishing rod, etc.) is a unique ERC-721 NFT
- Players mint directly via `mintItemTo()` — no backend needed
- Frontend reads `Transfer` events + `getItem(tokenId)` to build inventory

### NarrativeINFT (ERC-7857)
- Extends ERC-721 with encrypted metadata, oracle-verified evolution, clone, and authorized usage
- Backend wallet acts as oracle — signs ECDSA proofs for metadata evolution
- Players can `authorizeUsage()` to let backend auto-evolve their NFT
- `clone()` lets players duplicate their character
- Upgradeable oracle: `setOracle()` can point to TEE/ZKP in future

### StakingManager
- Native 0G token staking (max 0.1 0G)
- `depositFundsForHint()` — wrong guess penalty (0.001 0G)
- `settleSinglePlayerGame()` — 2x payout on win
- Full `ReentrancyGuard` on all payout functions

### TradeManager
- Atomic escrow P2P marketplace
- Payments in `WrappedOGBase` (official 0G precompile)
- 2.5% protocol fee to treasury
- `setFeeBps()` — adjustable up to 10%

### UserRegistry
- Stores per-player Merkle root hash of dialogue tree on 0G Storage
- `updateDialogueRoot()` — called by backend after each session

---

## Backend Security

| Feature | Status |
| :--- | :--- |
| CORS | Restricted to `ALLOWED_ORIGINS` env var |
| Rate limiting | 60 req/min global, 5 req/min on `/game/complete` |
| Session auth | Every game endpoint requires `session_token` issued at game start |
| Input sanitization | `player_prompt` stripped, normalized, capped at 500 chars |
| Gemini retry | 3 attempts with exponential backoff (0.5s, 1s, 2s) |
| 0G upload | Async `asyncio.create_subprocess_exec` — non-blocking |
| Private key | Never committed — loaded from `PRIVATE_KEY` env var only |

---

## Quick Start

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js v20+
- Python 3.11+
- 0G Galileo testnet tokens from [faucet.0g.ai](https://faucet.0g.ai)

### 1. Smart Contracts (already deployed — skip unless redeploying)
```bash
cd contracts-0G
cp .env.local.example .env.local   # add PRIVATE_KEY
PRIVATE_KEY=0x<your_key> forge script script/DeployAll.s.sol \
  --rpc-url https://evmrpc-testnet.0g.ai \
  --private-key 0x<your_key> \
  --broadcast --legacy
```

### 2. Backend
```bash
cd server_centralized
cp .env.example .env
# Fill in: GOOGLE_API_KEY, PRIVATE_KEY, ALLOWED_ORIGINS
pip install -r requirements.txt
npm install
uvicorn main:app --host 0.0.0.0 --port 3002
```

### 3. Frontend
```bash
cd game_0G
cp .env.local.example .env.local   # already configured for localhost
npm install
npm run dev
```

### 4. Docker (production)
```bash
docker compose up --build
```

---

## Environment Variables

### `server_centralized/.env`
```env
GOOGLE_API_KEY=<gemini_api_key>
PRIVATE_KEY=0x<backend_wallet_private_key>
0G_TESTNET_RPC=https://evmrpc-testnet.0g.ai
ALLOWED_ORIGINS=http://localhost:3000
BACKEND_URL=http://localhost:3002

USER_REGISTRY_ADDRESS=0x90564782BfCd4abddC749B2209C03F774e82191e
GAME_ITEMS_ADDRESS=0x61c54308FD1f5bB2451DE76DADaDE3b590b256e6
STAKING_MANAGER_ADDRESS=0x2f48419F77E6cD6E9D319Dc1314a1b1008C8ddfB
NARRATIVE_INFT_ADDRESS=0x5EFaA2dd48323156ebE3d5B4834d83fcB8bFfcF4
TRADE_MANAGER_ADDRESS=0x1284159FA72081846e6a0e947a34CaF2Df9e70Bd
WRAPPED_OG_ADDRESS=0x0000000000000000000000000000000000001001
```

### `game_0G/.env.local`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_CHAIN_ID=16602
NEXT_PUBLIC_RPC_URL=https://evmrpc-testnet.0g.ai

NEXT_PUBLIC_USER_REGISTRY_ADDRESS=0x90564782BfCd4abddC749B2209C03F774e82191e
NEXT_PUBLIC_GAME_ITEMS_ADDRESS=0x61c54308FD1f5bB2451DE76DADaDE3b590b256e6
NEXT_PUBLIC_STAKING_MANAGER_ADDRESS=0x2f48419F77E6cD6E9D319Dc1314a1b1008C8ddfB
NEXT_PUBLIC_NARRATIVE_INFT_ADDRESS=0x5EFaA2dd48323156ebE3d5B4834d83fcB8bFfcF4
NEXT_PUBLIC_TRADE_MANAGER_ADDRESS=0x1284159FA72081846e6a0e947a34CaF2Df9e70Bd
NEXT_PUBLIC_WRAPPED_OG_ADDRESS=0x0000000000000000000000000000000000001001
```

---

## Game Flow

1. **Connect wallet** via RainbowKit (MetaMask, WalletConnect, etc.)
2. **Choose avatar** → mint ERC-7857 iNFT on-chain (optional)
3. **Start game** → backend generates unique mystery via Gemini AI
4. **Explore village** → talk to 8 AI-powered NPCs, collect ERC-721 item NFTs
5. **Build trust** → familiarity system (0-5) gates clue reveals
6. **Guess location** → correct = win + native 0G reward
7. **Ranked mode** → stake 0G → win = 2x payout, lose = stake confiscated
8. **iNFT evolves** → backend signs ERC-7857 oracle proof, metadata updates on 0G Storage

---

## Repo Structure

```
Towns-whisper/
├── contracts-0G/          # Foundry — 5 production contracts
│   ├── src/               # StakingManager, GameItems, NarrativeINFT, TradeManager, UserRegistry
│   └── script/            # DeployAll.s.sol + individual scripts
├── game_0G/               # Next.js 14 + Phaser 3 frontend
│   └── src/
│       ├── scenes/        # 12 Phaser scenes
│       ├── contractConfig.js  # All ABIs + addresses
│       └── api.js         # Backend REST calls
├── server_centralized/    # Python FastAPI backend
│   ├── main.py            # All endpoints + auth + rate limiting
│   ├── og_storage_service.py  # 0G Storage + on-chain interactions
│   ├── game_logic/        # Gemini AI engine + state manager
│   └── bridge_0g.js       # Async 0G Storage upload bridge
└── docker-compose.yml     # Production orchestration
```

---

*Built on 0G. Every story is unique. Every action is permanent.*
