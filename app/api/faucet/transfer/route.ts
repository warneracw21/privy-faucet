import { NextRequest, NextResponse } from "next/server";
import { privy, ETHEREUM_WALLET_ID, SOLANA_WALLET_ID } from "@/lib/privy";
import { parseUnits } from "viem";
import { getChainConfig, buildExplorerUrl } from "@/lib/config/chains";
import type { TransferRequest, TransferResponse } from "@/types";

export async function POST(request: NextRequest) {
  // User ID is set by middleware after token verification
  const userId = request.headers.get("x-user-id");
  console.log("Authenticated user:", userId);

  // Parse and validate request
  const { walletAddress, amount, chain }: TransferRequest = await request.json();

  const chainConfig = getChainConfig(chain);
  if (!chainConfig) {
    return NextResponse.json({ error: "Invalid chain" }, { status: 400 });
  }

  try {
    if (chainConfig.type === "ethereum") {
      const valueInWei = parseUnits(amount.toString(), chainConfig.decimals);

      const result = await privy.wallets().ethereum().sendTransaction(ETHEREUM_WALLET_ID, {
        caip2: chainConfig.caip2,
        params: {
          transaction: {
            to: walletAddress,
            value: "0x" + BigInt(valueInWei.toString()).toString(16),
          },
        },
      });

      // Return immediately with transaction ID for client-side polling
      console.log(`Transaction submitted: ${result.transaction_id}, hash: ${result.hash}`);

      const response: TransferResponse = {
        success: true,
        transactionId: result.transaction_id,
        chain,
        hash: result.hash,
        explorerUrl: buildExplorerUrl(chain, result.hash)!,
        amount,
        to: walletAddress,
      };

      return NextResponse.json(response);
    } else if (chainConfig.type === "solana") {
      // Solana requires building a serialized transaction
      // This would need @solana/web3.js to create a transfer instruction
      return NextResponse.json(
        { error: "Solana transfers not yet implemented" },
        { status: 501 }
      );
    }

    return NextResponse.json({ error: "Unsupported chain type" }, { status: 400 });
  } catch (error) {
    console.error("Transfer failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transfer failed" },
      { status: 500 }
    );
  }
}
