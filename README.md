# Beyond-The-Fog: The Unified Core

Beyond-The-Fog is a next-generation decentralized adventure game powered by **0G native infrastructure**. It fuses cinematic AI-driven storytelling with the **0G Newton Testnet** to create a truly permanent, high-performance gaming ecosystem.

![Cinematic Header](assets/landing_bg_preview.png)

## 🌌 The Narrative
You awaken on the outskirts of a mist-shrouded village. Your friends are missing. The only way to find them is to earn the trust of the suspicious villagers and uncover the ancient secrets hidden in the fog. Every choice you make is permanent, anchored to the blockchain, and evolved by AI.

## 🛠️ Technical Innovation (The Billion-Dollar Stack)

Beyond-The-Fog is built on a **Unified Core** architecture designed for maximum performance and 0G purity:

*   **0G Storage Persistence**: Unlike legacy games that use volatile servers, Beyond-The-Fog serializes your entire session and persists it to **0G Storage**. Resume your adventure from anywhere, anytime.
*   **Decentralized AI Brokerage**: Real-time narrative generation via **0G Compute** (Llama 3), ensuring every interaction is unique and uncensored.
*   **Merkle-Anchored Dialogue**: Every conversation is hashed and anchored to the **UserRegistry** smart contract, creating a verifiable, immutable player history.
*   **Evolvable iNFTs**: Your AI companion grows with you. As you solve mysteries, your companion evolves on-chain, updating its metadata and visual stage directly on 0G Storage.

## 🏗️ System Architecture

1.  **Frontend (Next.js 14)**: High-end React interface featuring a Phaser 3 game engine, 8px glassmorphism design system, and RainbowKit integration.
2.  **Unified Backend (Node.js)**: A single, robust gateway managing:
    - AI interaction cycles (LLM).
    - 0G Data Availability (DA) dispersal.
    - 0G Storage state management.
    - On-chain transaction orchestration.

## 📁 Project Structure

```bash
Beyond-The-Fog/
├── 0g_storage_service/      # Unified Core Backend (Node.js)
│   ├── lib/game/            # Narrative Engine & Game Logic
│   ├── storageManager.js    # 0G Storage & DA Orchestrator
│   └── index.js             # Unified API Gateway
├── beyond-the-fog-next/      # Premium Frontend Application
│   ├── app/                 # 8px Grid Design System
│   ├── components/          # High-Performance UI Components
│   └── scenes/              # Cinematic Game Scenes
└── contracts_eth/           # 0G Newton Smart Contracts
```

## 🚀 Deployment Guide

### 1. Launch the Unified Core
```bash
cd 0g_storage_service
npm install
cp .env.example .env # Configure your 0G Private Key
npm start
```

### 2. Launch the Frontend
```bash
cd beyond-the-fog-next
npm install
npm run dev
```

## 🔗 Protocol Anchors (0G Newton)
- **User Registry**: `0x6b542A9361A7dd16c0b6396202A192326154a1e2`
- **iNFT Contract**: `0x494d8E03605E297F936a6F244B7BcD03e4563D7E`

---
*Built for the 0G ecosystem. Designed for the players.*
