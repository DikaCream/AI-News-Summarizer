import { NextRequest, NextResponse } from "next/server";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const genlayerClient = createClient({
  chain: studionet,
});

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";

export async function POST(request: NextRequest) {
  try {
    if (!CONTRACT_ADDRESS) {
      return NextResponse.json(
        { error: "Contract address not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Send write transaction
    const txHash = await genlayerClient.writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: "summarize",
      args: [url],
      value: 0n,
    });

    return NextResponse.json({
      success: true,
      txHash,
      message: "Transaction sent. Waiting for consensus...",
    });
  } catch (error: any) {
    console.error("Summarize error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to summarize" },
      { status: 500 }
    );
  }
}
