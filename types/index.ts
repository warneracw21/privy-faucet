// Chain types
export type ChainType = "ethereum" | "solana";

export interface Chain {
  id: string;
  name: string;
  symbol: string;
  type: ChainType;
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

export interface ChainBalances {
  balances: BalanceEntry[];
  wallet: WalletInfo;
}

export interface BalanceData {
  ethereum?: ChainBalances;
  solana?: ChainBalances;
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
  chain: string;
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

