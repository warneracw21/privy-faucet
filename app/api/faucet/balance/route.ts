import { NextRequest, NextResponse } from "next/server";
import { privy, ETHEREUM_WALLET_ID, headers, SOLANA_WALLET_ID, DEPOSIT_ADDRESS_MOVER_AUTH_ID } from "@/lib/privy";
import { getBalances, getErc20Balances, RpcBalanceResult } from "@/lib/balance";
import { getPrivyChainIds, getCustomRpcChains, getCustomRpcChainsWithUsdc } from "@/lib/config/chains";
import type { LinkedAccountEmbeddedWallet, Wallet } from "@privy-io/node";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 401 });
  }

  // Fetch deposit addresses for the user
  const user = await privy.users()._get(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get user deposit addresses (create if not found)
  let ethereumWallet = user.linked_accounts.find(acc => acc.type === "wallet" && acc.chain_type === "ethereum" && acc.connector_type === "privy") as LinkedAccountEmbeddedWallet | Wallet | undefined;
  let solanaWallet = user.linked_accounts.find(acc => acc.type === "wallet" && acc.chain_type === "solana" && acc.connector_type === "privy") as LinkedAccountEmbeddedWallet | Wallet | undefined;

  if (!ethereumWallet || !solanaWallet) {
    if (!DEPOSIT_ADDRESS_MOVER_AUTH_ID) {
      return NextResponse.json({ error: "Deposit address mover auth ID is required" }, { status: 400 });
    }
    if (!ethereumWallet) {
      ethereumWallet = await privy.wallets().create({
        chain_type: "ethereum",
        owner: { user_id: userId },
        additional_signers: [
          {
            signer_id: DEPOSIT_ADDRESS_MOVER_AUTH_ID,
            override_policy_ids: []
          }
        ]
      });
    }
    if (!solanaWallet) {
      solanaWallet = await privy.wallets().create({
        chain_type: "solana",
        owner: { user_id: userId },
        additional_signers: [
          {
            signer_id: DEPOSIT_ADDRESS_MOVER_AUTH_ID,
            override_policy_ids: []
          }
        ]
      });
    }
  }

  // Get wallet addresses
  const ethereumWalletAddress = ethereumWallet?.address;
  const solanaWalletAddress = solanaWallet?.address;

  // Get Privy-supported chain IDs (derived from config)
  const privyChains = getPrivyChainIds();

  // Fetch balances from Privy for supported EVM chains
  const ethereumEndpoint = new URL(`https://auth.privy.io/v1/wallets/${ETHEREUM_WALLET_ID}/balance`);
  // Native assets
  ethereumEndpoint.searchParams.append("asset", "eth");
  ethereumEndpoint.searchParams.append("asset", "pol");
  // USDC (Privy supports USDC on all their chains)
  ethereumEndpoint.searchParams.append("asset", "usdc");

  // Add all Privy-supported EVM chains (mainnet + testnet)
  [...privyChains.evm.mainnet, ...privyChains.evm.testnet].forEach(chain =>
    ethereumEndpoint.searchParams.append("chain", chain)
  );

  // Fetch balances from Privy for supported Solana chains
  const solanaEndpoint = new URL(`https://auth.privy.io/v1/wallets/${SOLANA_WALLET_ID}/balance`);
  solanaEndpoint.searchParams.append("asset", "sol");
  solanaEndpoint.searchParams.append("asset", "usdc"); // Solana USDC

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

  // Fetch native token balances
  let customNativeBalances: RpcBalanceResult[] = [];
  if (allCustomRpcChains.length > 0) {
    customNativeBalances = await getBalances(
      allCustomRpcChains.map(chain => ({
        rpcUrl: chain.rpcUrl,
        address: ethereumWallet.address,
        chainId: chain.balanceKey,
        symbol: chain.symbol.toLowerCase(),
        decimals: chain.decimals,
      }))
    );
  }

  // Fetch USDC balances for custom RPC chains
  const customRpcUsdcMainnet = getCustomRpcChainsWithUsdc("mainnet");
  const customRpcUsdcTestnet = getCustomRpcChainsWithUsdc("testnet");
  const allCustomRpcUsdcChains = [...customRpcUsdcMainnet, ...customRpcUsdcTestnet];

  let customUsdcBalances: RpcBalanceResult[] = [];
  if (allCustomRpcUsdcChains.length > 0) {
    customUsdcBalances = await getErc20Balances(
      allCustomRpcUsdcChains.map(chain => ({
        rpcUrl: chain.rpcUrl,
        walletAddress: ethereumWallet.address,
        tokenAddress: chain.usdcAddress,
        chainId: chain.balanceKey,
        symbol: "usdc",
        decimals: 6,
      }))
    );
  }

  // Merge all balances into a single array
  const balances = [
    ...(ethereumData.balances || []),
    ...(solanaData.balances || []),
    ...customNativeBalances,
    ...customUsdcBalances,
  ];

  return NextResponse.json({
    balances,
    wallets: {
      ethereum: ethereumWalletAddress,
      solana: solanaWalletAddress,
    },
  });
}
