import { NextRequest, NextResponse } from "next/server";
import { privy, ETHEREUM_WALLET_ID, headers, SOLANA_WALLET_ID } from "@/lib/privy";
import { getBalances, RpcBalanceResult } from "@/lib/balance";
import { CHAIN_CONFIG, getRpcUrl } from "@/lib/config/chains";

export async function GET(request: NextRequest) {
  // Get wallet addresses
  const ethereumWallet = await privy.wallets().get(ETHEREUM_WALLET_ID);
  const solanaWallet = await privy.wallets().get(SOLANA_WALLET_ID);

  // Fetch balances from Privy for supported chains
  const ethereumEndpoint = new URL(`https://auth.privy.io/v1/wallets/${ETHEREUM_WALLET_ID}/balance`);
  ethereumEndpoint.searchParams.append("asset", "eth");
  ethereumEndpoint.searchParams.append("asset", "pol");

  // Mainnets (Privy-supported)
  ethereumEndpoint.searchParams.append("chain", "ethereum");
  ethereumEndpoint.searchParams.append("chain", "base");
  ethereumEndpoint.searchParams.append("chain", "optimism");
  ethereumEndpoint.searchParams.append("chain", "arbitrum");
  ethereumEndpoint.searchParams.append("chain", "polygon");

  // Testnets (Privy-supported)
  ethereumEndpoint.searchParams.append("chain", "sepolia");
  ethereumEndpoint.searchParams.append("chain", "base_sepolia");
  ethereumEndpoint.searchParams.append("chain", "optimism_sepolia");
  ethereumEndpoint.searchParams.append("chain", "arbitrum_sepolia");
  ethereumEndpoint.searchParams.append("chain", "polygon_amoy");

  const solanaEndpoint = new URL(`https://auth.privy.io/v1/wallets/${SOLANA_WALLET_ID}/balance`);
  solanaEndpoint.searchParams.append("asset", "sol");
  solanaEndpoint.searchParams.append("chain", "solana");
  solanaEndpoint.searchParams.append("chain", "solana_devnet");

  // Fetch Privy balances
  const [ethereumResponse, solanaResponse] = await Promise.all([
    fetch(ethereumEndpoint.href, { headers }),
    fetch(solanaEndpoint.href, { headers }),
  ]);

  const ethereumData = await ethereumResponse.json();
  const solanaData = await solanaResponse.json();

  // Fetch custom RPC balances for chains not supported by Privy
  const customRpcChains = Object.entries(CHAIN_CONFIG)
    .filter(([_, config]) => config.alchemyRpcPath && config.type === "ethereum")
    .map(([chainId, config]) => ({ chainId, ...config }));

  let customBalances: RpcBalanceResult[] = [];
  if (customRpcChains.length > 0) {
    const rpcRequests = customRpcChains
      .map((chain) => {
        const rpcUrl = getRpcUrl(chain.chainId);
        if (!rpcUrl) return null;
        return {
          rpcUrl,
          address: ethereumWallet.address,
          chainId: chain.chainId,
          symbol: "eth",
          decimals: chain.decimals,
        };
      })
      .filter((req): req is NonNullable<typeof req> => req !== null);

    if (rpcRequests.length > 0) {
      customBalances = await getBalances(rpcRequests);
    }
  }

  // Merge custom balances into ethereum data
  const mergedEthereumBalances = [
    ...(ethereumData.balances || []),
    ...customBalances,
  ];

  return NextResponse.json({
    ethereum: {
      ...ethereumData,
      balances: mergedEthereumBalances,
      wallet: ethereumWallet,
    },
    solana: {
      ...solanaData,
      wallet: solanaWallet,
    },
  });
}
