import type { Chain, ChainType } from "@/types";

// Chain configuration for the frontend
export const CHAINS: Chain[] = [
  { id: "sepolia", name: "Sepolia", symbol: "ETH", type: "ethereum" },
  { id: "base_sepolia", name: "Base Sepolia", symbol: "ETH", type: "ethereum" },
  { id: "optimism_sepolia", name: "Optimism Sepolia", symbol: "ETH", type: "ethereum" },
  { id: "arbitrum_sepolia", name: "Arbitrum Sepolia", symbol: "ETH", type: "ethereum" },
  { id: "polygon_amoy", name: "Polygon Amoy", symbol: "POL", type: "ethereum" },
  { id: "solana_devnet", name: "Solana Devnet", symbol: "SOL", type: "solana" },
];

// Extended chain configuration for the backend (includes CAIP-2, decimals, explorer)
export interface ChainConfig {
  caip2: string;
  type: ChainType;
  decimals: number;
  explorer: {
    url: string;
    suffix?: string;
  };
}

export const CHAIN_CONFIG: Record<string, ChainConfig> = {
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

