// Chain types
export type ChainType = "ethereum" | "solana";
export type NetworkMode = "mainnet" | "testnet";
export type TokenType = "native" | "usdc";

// Token configuration
export interface TokenConfig {
  symbol: string;
  decimals: number;
}

// ERC20 token configuration with network-specific addresses
export interface Erc20TokenConfig extends TokenConfig {
  mainnetAddress?: string; // Contract address on mainnet
  testnetAddress?: string; // Contract address on testnet
}

// Network-specific configuration
export interface NetworkConfig {
  caip2: string;
  explorerUrl: string;
  explorerSuffix?: string;
  rpcUrl?: string; // Required if privyChainId is not set
  privyChainId?: string; // Chain ID used by Privy API (e.g., "sepolia" for Ethereum testnet)
  gasSponsorship?: boolean;
}

// Unified chain configuration
// If BOTH mainnet.privyChainId AND testnet.privyChainId are set, rpcUrl is optional
// Otherwise, rpcUrl is required for networks without privyChainId
export interface ChainConfig {
  name: string;
  type: ChainType;
  icon?: string; // Path to chain icon (e.g., "/chain-icons/ethereum.png")
  mainnet: NetworkConfig;
  testnet: NetworkConfig;
  tokens: {
    native: TokenConfig;
    usdc?: Erc20TokenConfig;
  };
}

// Wallet types
export interface WalletInfo {
  address: string;
  id: string;
}

// Balance types
export interface BalanceEntry {
  chain: string;
  asset: string;
  raw_value: string;
  raw_value_decimals: number;
  display_values: { [key: string]: string };
}

export interface BalanceData {
  balances: BalanceEntry[];
  wallets: {
    ethereum: string;
    solana: string;
  };
}

// Transaction types
export type TransactionStatus =
  | "pending"
  | "broadcasted"
  | "confirmed"
  | "finalized"
  | "execution_reverted"
  | "failed"
  | "replaced"
  | "provider_error";

export interface TransactionResult {
  id: string;
  caip2: string;
  created_at: number;
  status: TransactionStatus;
  transaction_hash: string | null;
  wallet_id: string;
  sponsored?: boolean;
}

export interface TransactionStatusResponse {
  id: string;
  status: TransactionStatus;
  hash: string | null;
  explorerUrl: string | null;
  isFinal: boolean;
  caip2: string;
  createdAt: number;
}

// Transfer types
export interface TransferRequest {
  walletAddress: string;
  amount: number;
  chainId: string;
  networkMode: NetworkMode;
  token: TokenType; // "native" or "usdc"
}

export interface TransferResponse {
  success: boolean;
  transactionId?: string;
  chain: string;
  hash: string;
  explorerUrl: string;
  amount: number;
  to: string;
  error?: string;
}

// Pending transaction (client-side)
export interface PendingTransaction {
  id: string;
  hash: string;
  explorerUrl: string;
}

