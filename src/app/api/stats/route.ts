import { NextRequest, NextResponse } from "next/server";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const genlayerClient = createClient({
  chain: studionet,
});

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";

export async function GET(request: NextRequest) {
  try {
    if (!CONTRACT_ADDRESS) {
      return NextResponse.json(
        { error: "Contract address not configured" },
        { status: 500 }
      );
    }

    const result = await genlayerClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: "get_stats",
      args: [],
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get stats" },
      { status: 500 }
    );
  }
}
