import type { Chain, ChainType, ChainGroup, NetworkMode } from "@/types";

// Chain configuration for the frontend
export const CHAINS: Chain[] = [
  // Mainnets
  { id: "ethereum", name: "Ethereum", symbol: "ETH", type: "ethereum" },
  { id: "base", name: "Base", symbol: "ETH", type: "ethereum" },
  { id: "optimism", name: "Optimism", symbol: "ETH", type: "ethereum" },
  { id: "arbitrum", name: "Arbitrum One", symbol: "ETH", type: "ethereum" },
  { id: "polygon", name: "Polygon", symbol: "POL", type: "ethereum" },
  { id: "abstract", name: "Abstract", symbol: "ETH", type: "ethereum" },
  { id: "solana", name: "Solana", symbol: "SOL", type: "solana" },
  // Testnets
  { id: "sepolia", name: "Sepolia", symbol: "ETH", type: "ethereum" },
  { id: "base_sepolia", name: "Base Sepolia", symbol: "ETH", type: "ethereum" },
  { id: "optimism_sepolia", name: "Optimism Sepolia", symbol: "ETH", type: "ethereum" },
  { id: "arbitrum_sepolia", name: "Arbitrum Sepolia", symbol: "ETH", type: "ethereum" },
  { id: "polygon_amoy", name: "Polygon Amoy", symbol: "POL", type: "ethereum" },
  { id: "abstract_testnet", name: "Abstract Testnet", symbol: "ETH", type: "ethereum" },
  { id: "solana_devnet", name: "Solana Devnet", symbol: "SOL", type: "solana" },
];

// Unified chain groups (mainnet + testnet pairs)
export const CHAIN_GROUPS: ChainGroup[] = [
  { id: "ethereum", name: "Ethereum", symbol: "ETH", type: "ethereum", mainnet: "ethereum", testnet: "sepolia" },
  { id: "base", name: "Base", symbol: "ETH", type: "ethereum", mainnet: "base", testnet: "base_sepolia" },
  { id: "optimism", name: "Optimism", symbol: "ETH", type: "ethereum", mainnet: "optimism", testnet: "optimism_sepolia" },
  { id: "arbitrum", name: "Arbitrum", symbol: "ETH", type: "ethereum", mainnet: "arbitrum", testnet: "arbitrum_sepolia" },
  { id: "polygon", name: "Polygon", symbol: "POL", type: "ethereum", mainnet: "polygon", testnet: "polygon_amoy" },
  { id: "abstract", name: "Abstract", symbol: "ETH", type: "ethereum", mainnet: "abstract", testnet: "abstract_testnet" },
  { id: "solana", name: "Solana", symbol: "SOL", type: "solana", mainnet: "solana", testnet: "solana_devnet" },
];

// Helper to get the active chain ID for a group based on network mode
export function getActiveChainId(group: ChainGroup, mode: NetworkMode): string {
  return mode === "mainnet" ? group.mainnet : group.testnet;
}

// Extended chain configuration for the backend (includes CAIP-2, decimals, explorer)
export interface ChainConfig {
  caip2: string;
  type: ChainType;
  decimals: number;
  explorer: {
    url: string;
    suffix?: string;
  };
  // Alchemy RPC path for chains not supported by Privy's balance endpoint
  // Will be combined with ALCHEMY_API_KEY env var
  alchemyRpcPath?: string;
}

// Build full RPC URL from Alchemy path
export function getRpcUrl(chainId: string): string | null {
  const config = CHAIN_CONFIG[chainId];
  if (!config?.alchemyRpcPath) return null;
  
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    console.warn("ALCHEMY_API_KEY not set");
    return null;
  }
  
  return `${config.alchemyRpcPath}${apiKey}`;
}

export const CHAIN_CONFIG: Record<string, ChainConfig> = {
  // Mainnets
  ethereum: {
    caip2: "eip155:1",
    type: "ethereum",
    decimals: 18,
    explorer: { url: "https://etherscan.io/tx/" },
  },
  base: {
    caip2: "eip155:8453",
    type: "ethereum",
    decimals: 18,
    explorer: { url: "https://basescan.org/tx/" },
  },
  optimism: {
    caip2: "eip155:10",
    type: "ethereum",
    decimals: 18,
    explorer: { url: "https://optimistic.etherscan.io/tx/" },
  },
  arbitrum: {
    caip2: "eip155:42161",
    type: "ethereum",
    decimals: 18,
    explorer: { url: "https://arbiscan.io/tx/" },
  },
  polygon: {
    caip2: "eip155:137",
    type: "ethereum",
    decimals: 18,
    explorer: { url: "https://polygonscan.com/tx/" },
  },
  abstract: {
    caip2: "eip155:2741",
    type: "ethereum",
    decimals: 18,
    explorer: { url: "https://abscan.org/tx/" },
    alchemyRpcPath: "https://abstract-mainnet.g.alchemy.com/v2/",
  },
  solana: {
    caip2: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
    type: "solana",
    decimals: 9,
    explorer: { url: "https://explorer.solana.com/tx/" },
  },
  // Testnets
  sepolia: {
    caip2: "eip155:11155111",
    type: "ethereum",
    decimals: 18,
    explorer: { url: "https://sepolia.etherscan.io/tx/" },
  },
  base_sepolia: {
    caip2: "eip155:84532",
    type: "ethereum",
    decimals: 18,
    explorer: { url: "https://sepolia.basescan.org/tx/" },
  },
  optimism_sepolia: {
    caip2: "eip155:11155420",
    type: "ethereum",
    decimals: 18,
    explorer: { url: "https://sepolia-optimism.etherscan.io/tx/" },
  },
  arbitrum_sepolia: {
    caip2: "eip155:421614",
    type: "ethereum",
    decimals: 18,
    explorer: { url: "https://sepolia.arbiscan.io/tx/" },
  },
  polygon_amoy: {
    caip2: "eip155:80002",
    type: "ethereum",
    decimals: 18,
    explorer: { url: "https://amoy.polygonscan.com/tx/" },
  },
  abstract_testnet: {
    caip2: "eip155:11124",
    type: "ethereum",
    decimals: 18,
    explorer: { url: "https://sepolia.abscan.org/tx/" },
    alchemyRpcPath: "https://abstract-testnet.g.alchemy.com/v2/",
  },
  solana_devnet: {
    caip2: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    type: "solana",
    decimals: 9,
    explorer: { url: "https://explorer.solana.com/tx/", suffix: "?cluster=devnet" },
  },
};

// Map CAIP-2 to explorer config (for transaction status endpoint)
export const CAIP2_TO_EXPLORER: Record<string, { url: string; suffix?: string }> = Object.fromEntries(
  Object.values(CHAIN_CONFIG).map((config) => [config.caip2, config.explorer])
);

// Helper to build explorer URL
export function buildExplorerUrl(chainIdOrCaip2: string, hash: string): string | null {
  // Try chain ID first
  let config = CHAIN_CONFIG[chainIdOrCaip2];
  if (config) {
    return `${config.explorer.url}${hash}${config.explorer.suffix || ""}`;
  }

  // Try CAIP-2
  const explorer = CAIP2_TO_EXPLORER[chainIdOrCaip2];
  if (explorer) {
    return `${explorer.url}${hash}${explorer.suffix || ""}`;
  }

  return null;
}

// Get chain by ID
export function getChainById(chainId: string): Chain | undefined {
  return CHAINS.find((c) => c.id === chainId);
}

// Get chain config by ID
export function getChainConfig(chainId: string): ChainConfig | undefined {
  return CHAIN_CONFIG[chainId];
}
