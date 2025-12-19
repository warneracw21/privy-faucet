import { useQuery } from "@tanstack/react-query";
import type { BalanceData } from "@/types";
import { usePrivy } from "@privy-io/react-auth";

async function fetchBalances(accessToken: string): Promise<BalanceData> {
  const res = await fetch("/api/faucet/balance", {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch balances");
  }
  return res.json();
}

export function useBalance(enabled: boolean = true) {
  const { getAccessToken } = usePrivy();

  return useQuery({
    queryKey: ["faucet-balance"],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Failed to get access token");
      }
      return fetchBalances(accessToken);
    },
    enabled,
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    refetchIntervalInBackground: false, // Only poll when tab is focused
  });
}
