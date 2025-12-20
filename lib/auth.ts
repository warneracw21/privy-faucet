import type { NetworkMode } from "@/types";

/**
 * Extracts the Privy user ID from a DID string.
 * Converts "did:privy:abc123" to "abc123"
 */
export function extractPrivyUserId(did: string): string {
  const prefix = "did:privy:";
  if (did.startsWith(prefix)) {
    return did.slice(prefix.length);
  }
  return did;
}

/**
 * Formats chain ID with network mode.
 * - "ethereum" + "testnet" -> "ethereum_testnet"
 * - "ethereum" + "mainnet" -> "ethereum"
 */
export function formatChainNetwork(chainId: string, networkMode: NetworkMode): string {
  if (networkMode === "testnet") {
    return `${chainId}_testnet`;
  }
  return chainId;
}

