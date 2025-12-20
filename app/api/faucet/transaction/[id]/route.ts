import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus, isTransactionFinal } from "@/lib/transaction";
import { buildExplorerUrlFromCaip2 } from "@/lib/config/chains";
import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";
import type { TransactionStatusResponse } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: transactionId } = await params;

  if (!transactionId) {
    return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
  }

  try {
    const transaction = await getTransactionStatus(transactionId);
    const isFinal = isTransactionFinal(transaction.status);
    const explorerUrl = transaction.transaction_hash
      ? buildExplorerUrlFromCaip2(transaction.caip2, transaction.transaction_hash)
      : null;

    // Update withdrawal status in the database
    try {
      await prisma.withdrawal.updateMany({
        where: { transactionId },
        data: { status: transaction.status as Status },
      });
    } catch (dbError) {
      console.error("Failed to update withdrawal status:", dbError);
    }

    const response: TransactionStatusResponse = {
      id: transaction.id,
      status: transaction.status,
      hash: transaction.transaction_hash,
      explorerUrl,
      isFinal,
      caip2: transaction.caip2,
      createdAt: transaction.created_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to get transaction status:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get transaction status" },
      { status: 500 }
    );
  }
}
