import { privy } from "./privy";
import type { TransactionStatus, TransactionResult } from "@/types";

const FINAL_STATUSES: TransactionStatus[] = [
  "confirmed",
  "finalized",
  "execution_reverted",
  "failed",
  "replaced",
  "provider_error",
];

/**
 * Get the current status of a transaction by ID
 */
export async function getTransactionStatus(transactionId: string): Promise<TransactionResult> {
  const transaction = await privy.transactions().get(transactionId);
  return transaction as TransactionResult;
}

/**
 * Poll a transaction until it reaches a final status
 * @param transactionId - The Privy transaction ID
 * @param options - Polling options
 * @returns The final transaction result
 */
export async function pollTransactionStatus(
  transactionId: string,
  options: {
    maxAttempts?: number;
    intervalMs?: number;
    onStatusChange?: (status: TransactionStatus) => void;
  } = {}
): Promise<TransactionResult> {
  const {
    maxAttempts = 60, // 60 attempts = ~2 minutes with 2s interval
    intervalMs = 2000,
    onStatusChange,
  } = options;

  let attempts = 0;
  let lastStatus: TransactionStatus | null = null;

  while (attempts < maxAttempts) {
    const transaction = await getTransactionStatus(transactionId);

    // Notify on status change
    if (transaction.status !== lastStatus) {
      lastStatus = transaction.status;
      onStatusChange?.(transaction.status);
    }

    // Check if we've reached a final status
    if (FINAL_STATUSES.includes(transaction.status)) {
      return transaction;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  // Timeout - return last known status
  const finalTransaction = await getTransactionStatus(transactionId);
  return finalTransaction;
}

/**
 * Check if a transaction status is successful
 */
export function isTransactionSuccessful(status: TransactionStatus): boolean {
  return status === "confirmed" || status === "finalized";
}

/**
 * Check if a transaction status is final (no more changes expected)
 */
export function isTransactionFinal(status: TransactionStatus): boolean {
  return FINAL_STATUSES.includes(status);
}
