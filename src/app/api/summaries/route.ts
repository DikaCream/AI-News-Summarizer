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

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const category = searchParams.get("category");
    const sentiment = searchParams.get("sentiment");

    // Get specific summary by URL
    if (url) {
      const result = await genlayerClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: "get_summary",
        args: [url],
      });

      return NextResponse.json(result);
    }

    // Get summaries by category
    if (category) {
      const result = await genlayerClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: "get_summaries_by_category",
        args: [category],
      });

      return NextResponse.json(result);
    }

    // Get summaries by sentiment
    if (sentiment) {
      const result = await genlayerClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: "get_summaries_by_sentiment",
        args: [sentiment],
      });

      return NextResponse.json(result);
    }

    // Get all summaries
    const result = await genlayerClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: "get_all_summaries",
      args: [],
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Get summaries error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get summaries" },
      { status: 500 }
    );
  }
}
