import { NextRequest, NextResponse } from "next/server";
import { privy, ETHEREUM_WALLET_ID, headers, SOLANA_WALLET_ID } from "@/lib/privy";

export async function GET(request: NextRequest) {

  const ethereumEndpoint = new URL(`https://auth.privy.io/v1/wallets/${ETHEREUM_WALLET_ID}/balance`);

  ethereumEndpoint.searchParams.append("asset", "eth");
  ethereumEndpoint.searchParams.append("asset", "pol");

  // Mainnets
  ethereumEndpoint.searchParams.append("chain", "ethereum");
  ethereumEndpoint.searchParams.append("chain", "base");
  ethereumEndpoint.searchParams.append("chain", "optimism");
  ethereumEndpoint.searchParams.append("chain", "arbitrum");
  ethereumEndpoint.searchParams.append("chain", "polygon");

  // Testnets
  ethereumEndpoint.searchParams.append("chain", "sepolia");
  ethereumEndpoint.searchParams.append("chain", "base_sepolia");
  ethereumEndpoint.searchParams.append("chain", "optimism_sepolia");
  ethereumEndpoint.searchParams.append("chain", "arbitrum_sepolia");
  ethereumEndpoint.searchParams.append("chain", "polygon_amoy");

  const solanaEndpoint = new URL(`https://auth.privy.io/v1/wallets/${SOLANA_WALLET_ID}/balance`);

  solanaEndpoint.searchParams.append("asset", "sol");
  // Mainnet and devnet
  solanaEndpoint.searchParams.append("chain", "solana");
  solanaEndpoint.searchParams.append("chain", "solana_devnet");

  const ethereumResponse = await fetch(ethereumEndpoint.href, { headers })
  const solanaResponse = await fetch(solanaEndpoint.href, { headers })
  const ethereumData = await ethereumResponse.json();
  const solanaData = await solanaResponse.json();

  const ethereumWallet = await privy.wallets().get(ETHEREUM_WALLET_ID);
  const solanaWallet = await privy.wallets().get(SOLANA_WALLET_ID);

  return NextResponse.json({ ethereum: { ...ethereumData, wallet: ethereumWallet }, solana: { ...solanaData, wallet: solanaWallet } });
}
