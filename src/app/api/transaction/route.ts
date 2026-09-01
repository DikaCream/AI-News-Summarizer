import { NextRequest, NextResponse } from "next/server";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const genlayerClient = createClient({
  chain: studionet,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const txHash = searchParams.get("hash");

    if (!txHash) {
      return NextResponse.json(
        { error: "Transaction hash is required" },
        { status: 400 }
      );
    }

    const tx = await genlayerClient.getTransaction({
      hash: txHash as any,
    });

    return NextResponse.json({
      hash: txHash,
      status: (tx as any)?.statusName || (tx as any)?.status,
      details: tx,
    });
  } catch (error: any) {
    console.error("Get transaction error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get transaction" },
      { status: 500 }
    );
  }
}
