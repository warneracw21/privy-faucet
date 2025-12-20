import { NextRequest, NextResponse } from "next/server";
import { privy, ETHEREUM_WALLET_ID, SOLANA_WALLET_ID } from "@/lib/privy";
import { parseUnits, encodeFunctionData } from "viem";
import { getChain, getNetwork, buildExplorerUrl, getUsdcAddress, hasGasSponsorship } from "@/lib/config/chains";
import type { TransferResponse, NetworkMode, TokenType } from "@/types";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  TokenAccountNotFoundError,
} from "@solana/spl-token";

// ERC20 transfer ABI
const ERC20_TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

interface TransferRequestBody {
  walletAddress: string;
  amount: number;
  chainId: string;
  networkMode: NetworkMode;
  token: TokenType;
}

export async function POST(request: NextRequest) {
  // Parse and validate request
  const { walletAddress, amount, chainId, networkMode, token = "native" }: TransferRequestBody = await request.json();

  const chain = getChain(chainId);
  if (!chain) {
    return NextResponse.json({ error: "Invalid chain" }, { status: 400 });
  }

  const network = getNetwork(chainId, networkMode);
  if (!network) {
    return NextResponse.json({ error: "Invalid network mode" }, { status: 400 });
  }

  // Get token details
  const isNative = token === "native";
  const decimals = isNative ? chain.tokens.native.decimals : 6; // USDC is always 6 decimals
  const usdcAddress = !isNative ? getUsdcAddress(chainId as any, networkMode) : null;

  if (!isNative && !usdcAddress) {
    return NextResponse.json({ error: "USDC not supported on this chain/network" }, { status: 400 });
  }

  try {
    if (chain.type === "ethereum") {
      let txParams: { to: string; value?: string; data?: string };

      if (isNative) {
        // Native ETH transfer
        const valueInWei = parseUnits(amount.toString(), decimals);
        txParams = {
          to: walletAddress,
          value: "0x" + BigInt(valueInWei.toString()).toString(16),
        };
      } else {
        // ERC20 USDC transfer
        const amountInUnits = parseUnits(amount.toString(), decimals);
        const data = encodeFunctionData({
          abi: ERC20_TRANSFER_ABI,
          functionName: "transfer",
          args: [walletAddress as `0x${string}`, amountInUnits],
        });
        txParams = {
          to: usdcAddress!,
          data,
        };
      }

      // Check if gas sponsorship is enabled for this chain
      const sponsored = hasGasSponsorship(chainId as any, networkMode);

      const result = await privy.wallets().ethereum().sendTransaction(ETHEREUM_WALLET_ID, {
        caip2: network.caip2,
        params: {
          transaction: txParams,
        },
        ...(sponsored && { sponsor: true }),
      });

      console.log(`Transaction submitted: ${result.transaction_id}, hash: ${result.hash}, sponsored: ${sponsored}`);

      const response: TransferResponse = {
        success: true,
        transactionId: result.transaction_id,
        chain: chainId,
        hash: result.hash,
        explorerUrl: buildExplorerUrl(chainId, networkMode, result.hash)!,
        amount,
        to: walletAddress,
      };

      return NextResponse.json(response);
    } else if (chain.type === "solana") {
      const solanaWallet = await privy.wallets().get(SOLANA_WALLET_ID);
      const fromPubkey = new PublicKey(solanaWallet.address);
      const toPubkey = new PublicKey(walletAddress);

      // Check if gas sponsorship is enabled for this chain
      const solanaSponsored = hasGasSponsorship(chainId as any, networkMode);

      const transaction = new Transaction({
        recentBlockhash: "11111111111111111111111111111111",
        feePayer: fromPubkey,
      });

      if (isNative) {
        // Native SOL transfer
        const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
        transaction.add(
          SystemProgram.transfer({ fromPubkey, toPubkey, lamports })
        );
      } else {
        // SPL Token (USDC) transfer
        const mintPubkey = new PublicKey(usdcAddress!);
        
        // Get RPC URL for Solana (use Alchemy with API key)
        const rpcUrl = networkMode === "mainnet" 
          ? `https://solana-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
          : `https://solana-devnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
        const connection = new Connection(rpcUrl, "confirmed");

        // Derive Associated Token Accounts
        const senderAta = await getAssociatedTokenAddress(mintPubkey, fromPubkey);
        const recipientAta = await getAssociatedTokenAddress(mintPubkey, toPubkey);

        // Check if recipient ATA exists, if not, create it
        try {
          await getAccount(connection, recipientAta);
        } catch (error) {
          if (error instanceof TokenAccountNotFoundError) {
            // Recipient ATA doesn't exist, add instruction to create it
            // The faucet wallet will pay for the ATA creation (~0.002 SOL)
            console.log(`Creating ATA for recipient: ${recipientAta.toBase58()}`);
            transaction.add(
              createAssociatedTokenAccountInstruction(
                fromPubkey, // payer
                recipientAta, // ata
                toPubkey, // owner
                mintPubkey // mint
              )
            );
          } else {
            throw error;
          }
        }

        // Add transfer instruction
        // Amount in smallest units (USDC has 6 decimals)
        const amountInSmallestUnits = BigInt(Math.floor(amount * Math.pow(10, decimals)));
        transaction.add(
          createTransferInstruction(
            senderAta, // source
            recipientAta, // destination
            fromPubkey, // owner/authority
            amountInSmallestUnits // amount
          )
        );
      }

      const serialized = transaction
        .serialize({ requireAllSignatures: false, verifySignatures: false })
        .toString("base64");

      const result = await privy.wallets().solana().signAndSendTransaction(SOLANA_WALLET_ID, {
        caip2: network.caip2,
        transaction: serialized,
        ...(solanaSponsored && { sponsor: true }),
      });

      console.log(`Solana transaction submitted: ${result.transaction_id}, hash: ${result.hash}, sponsored: ${solanaSponsored}`);

      return NextResponse.json({
        success: true,
        transactionId: result.transaction_id || "",
        chain: chainId,
        hash: result.hash,
        explorerUrl: buildExplorerUrl(chainId, networkMode, result.hash)!,
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
