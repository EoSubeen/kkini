import { NextResponse } from "next/server";
import {
  ASSUMPTION_VERSION,
  CALCULATION_BASIS,
  CALCULATION_VERSION,
  MONEY_UNIT,
} from "@/domain/finance";

export async function GET() {
  return NextResponse.json({
    calculationVersion: CALCULATION_VERSION,
    assumptionVersion: ASSUMPTION_VERSION,
    moneyUnit: MONEY_UNIT,
    basis: CALCULATION_BASIS,
    disclaimer:
      "이 결과는 재무설계 교육·모의계산용이며 실제 결정 전 공식 기관 조회와 전문가 확인이 필요합니다.",
  });
}
