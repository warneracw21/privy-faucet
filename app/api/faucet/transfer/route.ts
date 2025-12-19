import { NextRequest, NextResponse } from "next/server";
import { privy, ETHEREUM_WALLET_ID, SOLANA_WALLET_ID } from "@/lib/privy";
import { parseUnits } from "viem";
import { getChainConfig, buildExplorerUrl } from "@/lib/config/chains";
import type { TransferRequest, TransferResponse } from "@/types";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

export async function POST(request: NextRequest) {
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
      // Get wallet address from Privy
      const solanaWallet = await privy.wallets().get(SOLANA_WALLET_ID);
      const fromPubkey = new PublicKey(solanaWallet.address);
      const toPubkey = new PublicKey(walletAddress);
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      // Build transaction with placeholder blockhash - serialize requires one
      // Using a dummy that Privy should replace
      const transaction = new Transaction({
        recentBlockhash: "11111111111111111111111111111111",
        feePayer: fromPubkey,
      }).add(
        SystemProgram.transfer({ fromPubkey, toPubkey, lamports })
      );
      // Set recentBlockhash for serialization (Privy may replace it)
      transaction.recentBlockhash = "11111111111111111111111111111111";

      // Serialize without signatures - Privy will sign
      const serialized = transaction
        .serialize({ requireAllSignatures: false, verifySignatures: false })
        .toString("base64");

      // Sign and send via Privy
      const result = await privy.wallets().solana().signAndSendTransaction(SOLANA_WALLET_ID, {
        caip2: chainConfig.caip2,
        transaction: serialized,
      });

      return NextResponse.json({
        success: true,
        transactionId: result.transaction_id || "",
        chain,
        hash: result.hash,
        explorerUrl: buildExplorerUrl(chain, result.hash)!,
        amount,
        to: walletAddress,
      } as TransferResponse);
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
