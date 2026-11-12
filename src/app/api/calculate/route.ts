import { NextResponse } from "next/server";
import { calculateRequestSchema } from "@/lib/contracts";
import { createClient } from "@/lib/supabase/server";
import {
  calculateAndMaybePersist,
  SupabaseCalculationRepository,
} from "@/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "요청 본문이 올바른 JSON이 아닙니다." } },
      { status: 400 },
    );
  }

  const parsed = calculateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "입력값을 확인해 주세요.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 422 },
    );
  }

  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    const response = await calculateAndMaybePersist(parsed.data, {
      userId: user?.id,
      repository: user ? new SupabaseCalculationRepository(client) : undefined,
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error("calculate request failed", {
      message: error instanceof Error ? error.message : "unknown error",
    });
    return NextResponse.json(
      {
        error: {
          code: "CALCULATION_FAILED",
          message: "진단 계산을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        },
      },
      { status: 500 },
    );
  }
}
