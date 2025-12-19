import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus, isTransactionFinal } from "@/lib/transaction";
import { buildExplorerUrl } from "@/lib/config/chains";
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
      ? buildExplorerUrl(transaction.caip2, transaction.transaction_hash)
      : null;

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
