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
    icon: "/chain-icons/ethereum.png",
    mainnet: {
      caip2: "eip155:1",
      explorerUrl: "https://etherscan.io/tx/",
      privyChainId: "ethereum",
      gasSponsorship: true,
    },
    testnet: {
      caip2: "eip155:11155111",
      explorerUrl: "https://sepolia.etherscan.io/tx/",
      privyChainId: "sepolia",
      gasSponsorship: true,
    },
    tokens: {
      native: { symbol: "ETH", decimals: 18 },
      usdc: {
        symbol: "USDC",
        decimals: 6,
        mainnetAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        testnetAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      },
    },
  },

  base: {
    name: "Base",
    type: "ethereum",
    icon: "/chain-icons/base.png",
    mainnet: {
      caip2: "eip155:8453",
      explorerUrl: "https://basescan.org/tx/",
      privyChainId: "base",
      gasSponsorship: true,
    },
    testnet: {
      caip2: "eip155:84532",
      explorerUrl: "https://sepolia.basescan.org/tx/",
      privyChainId: "base_sepolia",
      gasSponsorship: true,
    },
    tokens: {
      native: { symbol: "ETH", decimals: 18 },
      usdc: {
        symbol: "USDC",
        decimals: 6,
        mainnetAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        testnetAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      },
    },
  },

  optimism: {
    name: "Optimism",
    type: "ethereum",
    icon: "/chain-icons/optimism.png",
    mainnet: {
      caip2: "eip155:10",
      explorerUrl: "https://optimistic.etherscan.io/tx/",
      privyChainId: "optimism",
      gasSponsorship: true,
    },
    testnet: {
      caip2: "eip155:11155420",
      explorerUrl: "https://sepolia-optimism.etherscan.io/tx/",
      privyChainId: "optimism_sepolia",
      gasSponsorship: true,
    },
    tokens: {
      native: { symbol: "ETH", decimals: 18 },
      usdc: {
        symbol: "USDC",
        decimals: 6,
        mainnetAddress: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        testnetAddress: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
      },
    },
  },

  arbitrum: {
    name: "Arbitrum",
    type: "ethereum",
    icon: "/chain-icons/arbitrum.png",
    mainnet: {
      caip2: "eip155:42161",
      explorerUrl: "https://arbiscan.io/tx/",
      privyChainId: "arbitrum",
      gasSponsorship: true,
    },
    testnet: {
      caip2: "eip155:421614",
      explorerUrl: "https://sepolia.arbiscan.io/tx/",
      privyChainId: "arbitrum_sepolia",
      gasSponsorship: true,
    },
    tokens: {
      native: { symbol: "ETH", decimals: 18 },
      usdc: {
        symbol: "USDC",
        decimals: 6,
        mainnetAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        testnetAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
      },
    },
  },

  polygon: {
    name: "Polygon",
    type: "ethereum",
    icon: "/chain-icons/polygon.png",
    mainnet: {
      caip2: "eip155:137",
      explorerUrl: "https://polygonscan.com/tx/",
      privyChainId: "polygon",
      gasSponsorship: true,
    },
    testnet: {
      caip2: "eip155:80002",
      explorerUrl: "https://amoy.polygonscan.com/tx/",
      privyChainId: "polygon_amoy",
      gasSponsorship: true,
    },
    tokens: {
      native: { symbol: "POL", decimals: 18 },
      usdc: {
        symbol: "USDC",
        decimals: 6,
        mainnetAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        testnetAddress: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
      },
    },
  },

  // Abstract uses custom RPC (not supported by Privy balance API)
  abstract: {
    name: "Abstract",
    type: "ethereum",
    icon: "/chain-icons/abstract.png",
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
    icon: "/chain-icons/monad.png",
    mainnet: {
      caip2: "eip155:143",
      explorerUrl: "https://monad.socialscan.io/tx/",
      rpcUrl: `https://monad-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      gasSponsorship: true,
    },
    testnet: {
      caip2: "eip155:10143", // Testnet chain ID - update when available
      explorerUrl: "https://monad-testnet.socialscan.io/tx/",
      rpcUrl: `https://monad-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      gasSponsorship: true,
    },
    tokens: {
      native: { symbol: "MON", decimals: 18 },
      usdc: {
        symbol: "USDC",
        decimals: 6,
        mainnetAddress: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
        testnetAddress: "0x534b2f3A21130d7a60830c2Df862319e593943A3",
      },
    },
  },

  // HyperEVM (Hyperliquid) - uses custom RPC (not supported by Privy balance API)
  hyperevm: {
    name: "HyperEVM",
    type: "ethereum",
    icon: "/chain-icons/hyperliquid.png",
    mainnet: {
      caip2: "eip155:998",
      explorerUrl: "https://hyperliquid.xyz/tx/",
      rpcUrl: `https://hyperliquid-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    },
    testnet: {
      caip2: "eip155:998", // Update when testnet chain ID is different
      explorerUrl: "https://testnet.hyperliquid.xyz/tx/",
      rpcUrl: `https://hyperliquid-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    },
    tokens: {
      native: { symbol: "HYPE", decimals: 18 },
      usdc: {
        symbol: "USDC",
        decimals: 6,
        mainnetAddress: "0xb88339CB7199b77E23DB6E890353E22632Ba630f",
        testnetAddress: "0x2B3370eE501B4a559b57D449569354196457D8Ab",
      },
    },
  },

  solana: {
    name: "Solana",
    type: "solana",
    icon: "/chain-icons/solana.png",
    mainnet: {
      caip2: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
      explorerUrl: "https://explorer.solana.com/tx/",
      privyChainId: "solana",
      gasSponsorship: true,
    },
    testnet: {
      caip2: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      explorerUrl: "https://explorer.solana.com/tx/",
      explorerSuffix: "?cluster=devnet",
      privyChainId: "solana_devnet",
      gasSponsorship: true,
    },
    tokens: {
      native: { symbol: "SOL", decimals: 9 },
      usdc: {
        symbol: "USDC",
        decimals: 6,
        mainnetAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        testnetAddress: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
      },
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

// Get custom RPC chains that have USDC (for ERC20 balance fetching)
export function getCustomRpcChainsWithUsdc(mode: NetworkMode) {
  const result: Array<{
    chainId: ChainId;
    rpcUrl: string;
    balanceKey: string;
    usdcAddress: string;
  }> = [];

  for (const chainId of CHAIN_IDS) {
    const chain = CHAINS[chainId];
    const network = chain[mode];

    // Only for custom RPC chains (not Privy-supported)
    if ("rpcUrl" in network && network.rpcUrl && !("privyChainId" in network && network.privyChainId)) {
      const usdcAddress = getUsdcAddress(chainId, mode);
      if (usdcAddress) {
        result.push({
          chainId,
          rpcUrl: network.rpcUrl,
          balanceKey: mode === "mainnet" ? chainId : `${chainId}_testnet`,
          usdcAddress,
        });
      }
    }
  }

  return result;
}

// Check if a network supports gas sponsorship
export function hasGasSponsorship(chainId: ChainId, mode: NetworkMode): boolean {
  const network = getNetwork(chainId, mode);
  if (!network) return false;
  return "gasSponsorship" in network && network.gasSponsorship === true;
}

// Get USDC address for a chain
export function getUsdcAddress(chainId: ChainId, mode: NetworkMode): string | null {
  const chain = CHAINS[chainId];
  if (!("usdc" in chain.tokens) || !chain.tokens.usdc) return null;
  return mode === "mainnet" 
    ? chain.tokens.usdc.mainnetAddress || null
    : chain.tokens.usdc.testnetAddress || null;
}

// Check if a chain supports USDC
export function hasUsdcSupport(chainId: ChainId, mode: NetworkMode): boolean {
  return getUsdcAddress(chainId, mode) !== null;
}

// Get all supported tokens for a chain
export function getSupportedTokens(chainId: ChainId, mode: NetworkMode): Array<{ type: "native" | "usdc"; symbol: string; decimals: number }> {
  const chain = CHAINS[chainId];
  const tokens: Array<{ type: "native" | "usdc"; symbol: string; decimals: number }> = [
    { type: "native", symbol: chain.tokens.native.symbol, decimals: chain.tokens.native.decimals },
  ];
  
  if (hasUsdcSupport(chainId, mode)) {
    tokens.push({ type: "usdc", symbol: "USDC", decimals: 6 });
  }
  
  return tokens;
}
