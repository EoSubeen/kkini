import { connection } from "next/server";
import { CheckProgress } from "@/components/check-progress";
import { analyzeProfile } from "@/domain/finance";
import { getLatestState } from "@/server";

export const instant = false;

export default async function CheckPage() {
  await connection();
  const { profile, selection } = await getLatestState();
  // 계획 대비 점검 기준: 고른 조합(없으면 지금 그대로)의 1~3년 뒤 금융자산(예금·투자−마통)
  const planned = profile
    ? analyzeProfile(profile, selection ?? undefined).appliedResult.rows.slice(0, 3).map((row) => Math.round(row.T))
    : [];
  return <CheckProgress plannedAssets={planned} />;
}
