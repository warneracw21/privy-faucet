import { NextRequest, NextResponse } from "next/server";
import { privy, ETHEREUM_WALLET_ID, headers, SOLANA_WALLET_ID } from "@/lib/privy";
import { getBalances, RpcBalanceResult } from "@/lib/balance";
import { getPrivyChainIds, getCustomRpcChains } from "@/lib/config/chains";

export async function GET(request: NextRequest) {
  // Get wallet addresses
  const ethereumWallet = await privy.wallets().get(ETHEREUM_WALLET_ID);
  const solanaWallet = await privy.wallets().get(SOLANA_WALLET_ID);

  // Get Privy-supported chain IDs (derived from config)
  const privyChains = getPrivyChainIds();

  // Fetch balances from Privy for supported EVM chains
  const ethereumEndpoint = new URL(`https://auth.privy.io/v1/wallets/${ETHEREUM_WALLET_ID}/balance`);
  ethereumEndpoint.searchParams.append("asset", "eth");
  ethereumEndpoint.searchParams.append("asset", "pol");

  // Add all Privy-supported EVM chains (mainnet + testnet)
  [...privyChains.evm.mainnet, ...privyChains.evm.testnet].forEach(chain =>
    ethereumEndpoint.searchParams.append("chain", chain)
  );

  // Fetch balances from Privy for supported Solana chains
  const solanaEndpoint = new URL(`https://auth.privy.io/v1/wallets/${SOLANA_WALLET_ID}/balance`);
  solanaEndpoint.searchParams.append("asset", "sol");

  // Add all Privy-supported Solana chains (mainnet + testnet)
  [...privyChains.solana.mainnet, ...privyChains.solana.testnet].forEach(chain =>
    solanaEndpoint.searchParams.append("chain", chain)
  );

  // Fetch Privy balances
  const [ethereumResponse, solanaResponse] = await Promise.all([
    fetch(ethereumEndpoint.href, { headers }),
    fetch(solanaEndpoint.href, { headers }),
  ]);

  const ethereumData = await ethereumResponse.json();
  const solanaData = await solanaResponse.json();

  // Fetch custom RPC balances for chains not supported by Privy
  const customRpcMainnet = getCustomRpcChains("mainnet");
  const customRpcTestnet = getCustomRpcChains("testnet");
  const allCustomRpcChains = [...customRpcMainnet, ...customRpcTestnet];

  let customBalances: RpcBalanceResult[] = [];
  if (allCustomRpcChains.length > 0) {
    customBalances = await getBalances(
      allCustomRpcChains.map(chain => ({
        rpcUrl: chain.rpcUrl,
        address: ethereumWallet.address,
        chainId: chain.balanceKey,
        symbol: chain.symbol.toLowerCase(),
        decimals: chain.decimals,
      }))
    );
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
