import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const checkItemSchema = z.object({
  key: z.string().min(1).max(80),
  label: z.string().min(1).max(120),
  detail: z.string().max(500).default(""),
  done: z.boolean(),
  sortOrder: z.number().int().min(0).max(100),
});

const updateSchema = z.object({
  items: z.array(checkItemSchema).min(1).max(30),
});

async function authenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await authenticatedClient();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요해요." } },
      { status: 401 },
    );
  }

  const { data: plan, error: planError } = await supabase
    .from("check_plans")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (planError) {
    return NextResponse.json(
      { error: { code: "CHECK_READ_FAILED", message: "점검 항목을 불러오지 못했어요." } },
      { status: 500 },
    );
  }
  if (!plan) return NextResponse.json({ items: [] });

  const { data: items, error: itemsError } = await supabase
    .from("check_items")
    .select("item_key, label, detail, status, sort_order")
    .eq("user_id", user.id)
    .eq("check_plan_id", plan.id)
    .order("sort_order", { ascending: true });

  if (itemsError) {
    return NextResponse.json(
      { error: { code: "CHECK_READ_FAILED", message: "점검 항목을 불러오지 못했어요." } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    items: (items ?? []).map((item) => ({
      key: item.item_key,
      label: item.label,
      detail: item.detail ?? "",
      done: item.status === "done",
      sortOrder: item.sort_order,
    })),
  });
}

export async function PUT(request: Request) {
  const { supabase, user } = await authenticatedClient();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요해요." } },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "요청 형식을 확인해 주세요." } },
      { status: 400 },
    );
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "점검 항목 형식을 확인해 주세요." } },
      { status: 422 },
    );
  }

  let { data: plan, error: planError } = await supabase
    .from("check_plans")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!plan && !planError) {
    const created = await supabase
      .from("check_plans")
      .insert({ user_id: user.id, title: "나의 실행 계획", status: "active" })
      .select("id")
      .single();
    plan = created.data;
    planError = created.error;
  }

  if (planError || !plan) {
    return NextResponse.json(
      { error: { code: "CHECK_SAVE_FAILED", message: "점검 계획을 저장하지 못했어요." } },
      { status: 500 },
    );
  }

  const rows = parsed.data.items.map((item) => ({
    user_id: user.id,
    check_plan_id: plan.id,
    item_key: item.key,
    label: item.label,
    detail: item.detail,
    status: item.done ? "done" : "todo",
    sort_order: item.sortOrder,
  }));
  const { error } = await supabase
    .from("check_items")
    .upsert(rows, { onConflict: "check_plan_id,item_key" });

  if (error) {
    return NextResponse.json(
      { error: { code: "CHECK_SAVE_FAILED", message: "점검 항목을 저장하지 못했어요." } },
      { status: 500 },
    );
  }

  return NextResponse.json({ items: parsed.data.items });
}
