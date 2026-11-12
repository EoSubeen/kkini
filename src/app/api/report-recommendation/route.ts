import { NextResponse } from "next/server";
import { REPORT_RECOMMENDATION_CASE } from "@/domain/finance";

export async function GET() {
  return NextResponse.json(REPORT_RECOMMENDATION_CASE);
}
