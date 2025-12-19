import { useQuery } from "@tanstack/react-query";
import type { TransactionStatus, TransactionStatusResponse } from "@/types";

async function fetchTransactionStatus(transactionId: string): Promise<TransactionStatusResponse> {
  const res = await fetch(`/api/faucet/transaction/${transactionId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch transaction status");
  }
  return res.json();
}

export function useTransactionStatus(transactionId: string | null) {
  return useQuery({
    queryKey: ["transaction-status", transactionId],
    queryFn: () => fetchTransactionStatus(transactionId!),
    enabled: !!transactionId,
    refetchInterval: (query) => {
      // Stop polling once transaction is final
      if (query.state.data?.isFinal) {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
    refetchIntervalInBackground: false,
  });
}

export function isTransactionSuccessful(status: TransactionStatus): boolean {
  return status === "confirmed" || status === "finalized";
}
