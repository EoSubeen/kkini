import { NextResponse } from "next/server";
import { financialProfileSchema } from "@/lib/contracts";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요해요." } },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("financial_input_snapshots")
    .select("input, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: { code: "PROFILE_READ_FAILED", message: "저장된 정보를 불러오지 못했어요." } },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: { code: "PROFILE_NOT_FOUND", message: "먼저 재무 정보를 입력해 주세요." } },
      { status: 404 },
    );
  }

  const parsed = financialProfileSchema.safeParse(data.input);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "PROFILE_INVALID", message: "저장된 정보 형식을 다시 확인해 주세요." } },
      { status: 409 },
    );
  }

  return NextResponse.json({ profile: parsed.data, createdAt: data.created_at });
}
