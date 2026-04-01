import { NextRequest, NextResponse } from "next/server";
import type { Asset } from "@/lib/types";
import { fetchAll } from "@/lib/fetchers";
import { buildReport } from "@/lib/report";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const VALID_ASSETS = new Set<Asset>(["BTC", "ETH", "GOLD"]);

export async function GET(request: NextRequest) {
  const asset = request.nextUrl.searchParams.get("asset")?.toUpperCase() as Asset;

  if (!asset || !VALID_ASSETS.has(asset)) {
    return NextResponse.json(
      { success: false, error: "Geçersiz asset. BTC, ETH veya GOLD seçin." },
      { status: 400 }
    );
  }

  try {
    const data = await fetchAll(asset);
    const report = buildReport(asset, data);
    return NextResponse.json({ success: true, data: report });
  } catch (err: any) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Analiz sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
