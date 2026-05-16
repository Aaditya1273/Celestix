// contractConfig.js
// Configuration for 0G Galileo Testnet (chain 16602)
// Contracts deployed: 2026-05-16 | Deployer: 0x5aB3036C7d0bA7043E0BB531374dC6c732eC4954

export const CHAIN_ID = `0x${parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "16661").toString(16)}`;
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://evmrpc.0g.ai";

// ── Live Contract Addresses (0G Galileo Testnet) ──────────────────────────────
export const USER_REGISTRY_ADDRESS  = process.env.NEXT_PUBLIC_USER_REGISTRY_ADDRESS  || "0xe36bbfc7767cb6ea98a6fe072dccd80f499d02c2";
export const GAME_ITEMS_ADDRESS     = process.env.NEXT_PUBLIC_GAME_ITEMS_ADDRESS     || "0x02762535d0c005bb95dbcb6e1814dc4e38486a80";
export const STAKING_MANAGER_ADDRESS= process.env.NEXT_PUBLIC_STAKING_MANAGER_ADDRESS|| "0x4134c9eb31097693f79c16ef69e12006f68d0daa";
export const NARRATIVE_INFT_ADDRESS = process.env.NEXT_PUBLIC_NARRATIVE_INFT_ADDRESS || "0xb7d1af8bda86bde064ee7842cc4a6bd201a8461a";
export const TRADE_MANAGER_ADDRESS  = process.env.NEXT_PUBLIC_TRADE_MANAGER_ADDRESS  || "0xafbc3f2b0b47275e0d8d483da19d0ecd3bbd81f5";

// WrappedOGBase: official 0G precompile — same address on testnet AND mainnet
// Works like WETH: deposit() wraps native 0G, withdraw() unwraps it
export const WRAPPED_OG_ADDRESS = process.env.NEXT_PUBLIC_WRAPPED_OG_ADDRESS || "0x0000000000000000000000000000000000001001";

// WrappedOGBase ABI (official 0G precompile — replaces FogCoin)
export const WRAPPED_OG_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

export const USER_REGISTRY_ABI = [
  "function latestDialogueRootHash(address user) view returns (string)",
  "function isUserRegistered(address user) view returns (bool)",
  "function registerUser() external",
  "function updateDialogueRoot(string memory _rootHash) external"
];

// GameItems is ERC-721 (not ERC-1155) — each item is a unique NFT
export const GAME_ITEMS_ABI = [
  // ERC-721 standard
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string memory)",
  "function totalSupply() view returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  // Custom: mint item to player (called by frontend directly)
  "function mintItemTo(address to, string memory tokenURI_, string memory name, string memory description) external returns (uint256)",
  // Custom: owner-only backend mint
  "function mint(address to, string memory tokenURI_, string memory name, string memory description) external returns (uint256)",
  // Custom: get item metadata
  "function getItem(uint256 tokenId) view returns (string memory name, string memory description)",
  // Events — frontend reads Transfer events to build inventory
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event ItemMinted(address indexed to, uint256 indexed tokenId, string name)"
];

export const STAKING_MANAGER_ABI = [
  "function stake() external payable",
  "function resolveGameStake(address user, bool won) external",
  "function settleSinglePlayerGame(address user, uint256 timeTaken) external",
  "function depositFundsForHint() external payable",
  "function getStake(address user) view returns (uint256)",
  "function totalStaked() view returns (uint256)",
  "function hintDeposits(address user) view returns (uint256)"
];

export const NARRATIVE_INFT_ABI = [
  // ERC-721 standard
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string memory)",
  "function totalSupply() view returns (uint256)",
  // ERC-7857: Minting
  "function safeMint(address to, string memory uri, bytes32 _metaHash) external returns (uint256)",
  // ERC-7857: Metadata evolution (requires oracle proof)
  "function updateMetadata(uint256 tokenId, string memory newUri, bytes32 newHash, bytes calldata proof) external",
  "function forceUpdateMetadata(uint256 tokenId, string memory newUri, bytes32 newHash) external",
  "function getNonce(uint256 tokenId) view returns (uint256)",
  "function metadataHash(uint256 tokenId) view returns (bytes32)",
  // ERC-7857: Authorized usage
  "function authorizeUsage(uint256 tokenId, address executor, bytes calldata permissions) external",
  "function revokeAuthorization(uint256 tokenId, address executor) external",
  "function isAuthorized(uint256 tokenId, address executor) view returns (bool)",
  // ERC-7857: Clone
  "function clone(address to, uint256 tokenId) external returns (uint256 newTokenId)",
  // Oracle management
  "function oracle() view returns (address)",
  "function setOracle(address newOracle) external",
  // Events
  "event MetadataUpdated(uint256 indexed tokenId, string newUri, bytes32 newHash, uint256 nonce)",
  "event UsageAuthorized(uint256 indexed tokenId, address indexed executor, bytes permissions)",
  "event INFTCloned(uint256 indexed originalTokenId, uint256 indexed newTokenId, address indexed to)"
];

export const TRADE_MANAGER_ABI = [
  "function createTrade(address nftContract, uint256 tokenId, uint256 price) external",
  "function completeTrade(uint256 tradeId) external",
  "function cancelTrade(uint256 tradeId) external",
  "function trades(uint256) view returns (address creator, address nftContract, uint256 tokenId, uint256 price, bool active)"
];
