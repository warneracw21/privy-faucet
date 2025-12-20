import type { ChainConfig, NetworkMode } from "@/types";

/**
 * CHAIN CONFIGURATION
 * 
 * To add a new chain, just add an entry here. That's it!
 * 
 * - If Privy supports the chain natively, set `privyChainId` on each network
 * - If Privy doesn't support it, set `rpcUrl` instead (we'll fetch balance via RPC)
 * 
 * Example (Privy-supported):
 * ```
 * mychain: {
 *   name: "My Chain",
 *   type: "ethereum",
 *   mainnet: { caip2: "eip155:123", explorerUrl: "...", privyChainId: "mychain" },
 *   testnet: { caip2: "eip155:456", explorerUrl: "...", privyChainId: "mychain_testnet" },
 *   tokens: { native: { symbol: "MYC", decimals: 18 } },
 * }
 * ```
 * 
 * Example (Custom RPC):
 * ```
 * mychain: {
 *   name: "My Chain",
 *   type: "ethereum",
 *   mainnet: { caip2: "eip155:123", explorerUrl: "...", rpcUrl: "https://rpc.mychain.com" },
 *   testnet: { caip2: "eip155:456", explorerUrl: "...", rpcUrl: "https://testnet.mychain.com" },
 *   tokens: { native: { symbol: "MYC", decimals: 18 } },
 * }
 * ```
 */
export const CHAINS = {
  ethereum: {
    name: "Ethereum",
    type: "ethereum",
    mainnet: {
      caip2: "eip155:1",
      explorerUrl: "https://etherscan.io/tx/",
      privyChainId: "ethereum",
    },
    testnet: {
      caip2: "eip155:11155111",
      explorerUrl: "https://sepolia.etherscan.io/tx/",
      privyChainId: "sepolia",
    },
    tokens: {
      native: { symbol: "ETH", decimals: 18 },
    },
  },

  base: {
    name: "Base",
    type: "ethereum",
    mainnet: {
      caip2: "eip155:8453",
      explorerUrl: "https://basescan.org/tx/",
      privyChainId: "base",
    },
    testnet: {
      caip2: "eip155:84532",
      explorerUrl: "https://sepolia.basescan.org/tx/",
      privyChainId: "base_sepolia",
    },
    tokens: {
      native: { symbol: "ETH", decimals: 18 },
    },
  },

  optimism: {
    name: "Optimism",
    type: "ethereum",
    mainnet: {
      caip2: "eip155:10",
      explorerUrl: "https://optimistic.etherscan.io/tx/",
      privyChainId: "optimism",
    },
    testnet: {
      caip2: "eip155:11155420",
      explorerUrl: "https://sepolia-optimism.etherscan.io/tx/",
      privyChainId: "optimism_sepolia",
    },
    tokens: {
      native: { symbol: "ETH", decimals: 18 },
    },
  },

  arbitrum: {
    name: "Arbitrum",
    type: "ethereum",
    mainnet: {
      caip2: "eip155:42161",
      explorerUrl: "https://arbiscan.io/tx/",
      privyChainId: "arbitrum",
    },
    testnet: {
      caip2: "eip155:421614",
      explorerUrl: "https://sepolia.arbiscan.io/tx/",
      privyChainId: "arbitrum_sepolia",
    },
    tokens: {
      native: { symbol: "ETH", decimals: 18 },
    },
  },

  polygon: {
    name: "Polygon",
    type: "ethereum",
    mainnet: {
      caip2: "eip155:137",
      explorerUrl: "https://polygonscan.com/tx/",
      privyChainId: "polygon",
    },
    testnet: {
      caip2: "eip155:80002",
      explorerUrl: "https://amoy.polygonscan.com/tx/",
      privyChainId: "polygon_amoy",
    },
    tokens: {
      native: { symbol: "POL", decimals: 18 },
    },
  },

  // Abstract uses custom RPC (not supported by Privy balance API)
  abstract: {
    name: "Abstract",
    type: "ethereum",
    mainnet: {
      caip2: "eip155:2741",
      explorerUrl: "https://abscan.org/tx/",
      rpcUrl: `https://abstract-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    },
    testnet: {
      caip2: "eip155:11124",
      explorerUrl: "https://sepolia.abscan.org/tx/",
      rpcUrl: `https://abstract-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    },
    tokens: {
      native: { symbol: "ETH", decimals: 18 },
    },
  },

  // Monad - high-performance EVM L1 (not supported by Privy balance API)
  monad: {
    name: "Monad",
    type: "ethereum",
    mainnet: {
      caip2: "eip155:143",
      explorerUrl: "https://monadvision.com/tx/",
      rpcUrl: `https://monad-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    },
    testnet: {
      caip2: "eip155:10143", // Testnet chain ID - update when available
      explorerUrl: "https://testnet.monadvision.com/tx/",
      rpcUrl: `https://monad-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    },
    tokens: {
      native: { symbol: "MON", decimals: 18 },
    },
  },

  solana: {
    name: "Solana",
    type: "solana",
    mainnet: {
      caip2: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
      explorerUrl: "https://explorer.solana.com/tx/",
      privyChainId: "solana",
    },
    testnet: {
      caip2: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      explorerUrl: "https://explorer.solana.com/tx/",
      explorerSuffix: "?cluster=devnet",
      privyChainId: "solana_devnet",
    },
    tokens: {
      native: { symbol: "SOL", decimals: 9 },
    },
  },
} as const satisfies Record<string, ChainConfig>;

// Derive chain IDs from the config
export type ChainId = keyof typeof CHAINS;
export const CHAIN_IDS = Object.keys(CHAINS) as ChainId[];

// Helper to get chain config
export function getChain(chainId: string): ChainConfig | undefined {
  return CHAINS[chainId as ChainId];
}

// Helper to get network config for a chain
export function getNetwork(chainId: string, mode: NetworkMode) {
  const chain = CHAINS[chainId as ChainId];
  if (!chain) return undefined;
  return chain[mode];
}

// Helper to build explorer URL
export function buildExplorerUrl(chainId: string, mode: NetworkMode, hash: string): string | null {
  const network = getNetwork(chainId, mode);
  if (!network) return null;
  const suffix = "explorerSuffix" in network ? network.explorerSuffix : "";
  return `${network.explorerUrl}${hash}${suffix || ""}`;
}

// Helper to build explorer URL from CAIP-2 (for transaction status endpoint)
export function buildExplorerUrlFromCaip2(caip2: string, hash: string): string | null {
  for (const chainId of CHAIN_IDS) {
    const chain = CHAINS[chainId];
    if (chain.mainnet.caip2 === caip2) {
      const suffix = "explorerSuffix" in chain.mainnet ? chain.mainnet.explorerSuffix : "";
      return `${chain.mainnet.explorerUrl}${hash}${suffix || ""}`;
    }
    if (chain.testnet.caip2 === caip2) {
      const suffix = "explorerSuffix" in chain.testnet ? chain.testnet.explorerSuffix : "";
      return `${chain.testnet.explorerUrl}${hash}${suffix || ""}`;
    }
  }
  return null;
}

// Get Privy chain IDs for balance fetching (grouped by wallet type)
export function getPrivyChainIds() {
  const evm: { mainnet: string[]; testnet: string[] } = { mainnet: [], testnet: [] };
  const solana: { mainnet: string[]; testnet: string[] } = { mainnet: [], testnet: [] };

  for (const chainId of CHAIN_IDS) {
    const chain = CHAINS[chainId];
    const target = chain.type === "ethereum" ? evm : solana;

    if ("privyChainId" in chain.mainnet && chain.mainnet.privyChainId) {
      target.mainnet.push(chain.mainnet.privyChainId);
    }
    if ("privyChainId" in chain.testnet && chain.testnet.privyChainId) {
      target.testnet.push(chain.testnet.privyChainId);
    }
  }

  return { evm, solana };
}

// Get chains that need custom RPC for balance fetching
export function getCustomRpcChains(mode: NetworkMode) {
  const result: Array<{
    chainId: ChainId;
    rpcUrl: string;
    balanceKey: string;
    symbol: string;
    decimals: number;
  }> = [];

  for (const chainId of CHAIN_IDS) {
    const chain = CHAINS[chainId];
    const network = chain[mode];

    if ("rpcUrl" in network && network.rpcUrl && !("privyChainId" in network && network.privyChainId)) {
      result.push({
        chainId,
        rpcUrl: network.rpcUrl,
        balanceKey: mode === "mainnet" ? chainId : `${chainId}_testnet`,
        symbol: chain.tokens.native.symbol,
        decimals: chain.tokens.native.decimals,
      });
    }
  }

  return result;
}

// Get balance key for a chain (used by frontend to find balance in API response)
export function getBalanceKey(chainId: ChainId, mode: NetworkMode): string {
  const chain = CHAINS[chainId];
  const network = chain[mode];

  // If Privy-supported, use the privyChainId
  if ("privyChainId" in network && network.privyChainId) {
    return network.privyChainId;
  }

  // For custom RPC chains, use chainId_testnet convention
  return mode === "mainnet" ? chainId : `${chainId}_testnet`;
}
