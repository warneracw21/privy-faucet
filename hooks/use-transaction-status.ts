import { useQuery } from "@tanstack/react-query";
import type { TransactionStatus, TransactionStatusResponse } from "@/types";
import { usePrivy } from "@privy-io/react-auth";

async function fetchTransactionStatus(transactionId: string, accessToken: string): Promise<TransactionStatusResponse> {
  const res = await fetch(`/api/faucet/transaction/${transactionId}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch transaction status");
  }
  return res.json();
}

export function useTransactionStatus(transactionId: string | null) {
  const { getAccessToken } = usePrivy();
  return useQuery({
    queryKey: ["transaction-status", transactionId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Failed to get access token");
      }
      return fetchTransactionStatus(transactionId!, accessToken);
    },
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
