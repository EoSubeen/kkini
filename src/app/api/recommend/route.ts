import { NextResponse } from "next/server";
import { z } from "zod";
import { recommendRecipes } from "@/domain/finance";
import { financialProfileSchema } from "@/lib/contracts";

const requestSchema = z.object({
  profile: financialProfileSchema,
  keepHouse: z.boolean().default(false),
});

/** '추천 조합 찾기': 적자부터 막고 효과가 큰 처방부터 더한 조합을 돌려준다(저장하지 않음). */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "INVALID_JSON", message: "요청 본문이 올바른 JSON이 아닙니다." } }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "입력값을 확인해 주세요." } }, { status: 422 });
  }
  return NextResponse.json(recommendRecipes(parsed.data.profile, parsed.data.keepHouse));
}
