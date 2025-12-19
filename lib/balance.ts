/**
 * Fetch balance from any EVM-compatible RPC endpoint
 */

export interface RpcBalanceResult {
  chain: string;
  asset: string;
  raw_value: string;
  raw_value_decimals: number;
  display_values: Record<string, string>;
}

/**
 * Get native token balance from an RPC endpoint
 * @param rpcUrl - The RPC URL to query
 * @param address - The wallet address
 * @param chainId - Chain identifier for the response
 * @param symbol - Token symbol (e.g., "ETH")
 * @param decimals - Token decimals (default 18)
 */
export async function getBalance(
  rpcUrl: string,
  address: string,
  chainId: string,
  symbol: string = "eth",
  decimals: number = 18
): Promise<RpcBalanceResult> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [address, "latest"],
      id: 1,
    }),
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`);
  }

  // Convert hex balance to decimal string
  const rawValue = BigInt(data.result).toString();
  const displayValue = (Number(rawValue) / Math.pow(10, decimals)).toString();

  return {
    chain: chainId,
    asset: symbol.toLowerCase(),
    raw_value: rawValue,
    raw_value_decimals: decimals,
    display_values: { [symbol.toLowerCase()]: displayValue },
  };
}

/**
 * Fetch balances from multiple RPC endpoints in parallel
 */
export async function getBalances(
  requests: Array<{
    rpcUrl: string;
    address: string;
    chainId: string;
    symbol?: string;
    decimals?: number;
  }>
): Promise<RpcBalanceResult[]> {
  const results = await Promise.allSettled(
    requests.map((req) =>
      getBalance(req.rpcUrl, req.address, req.chainId, req.symbol, req.decimals)
    )
  );

  return results
    .filter((r): r is PromiseFulfilledResult<RpcBalanceResult> => r.status === "fulfilled")
    .map((r) => r.value);
}

