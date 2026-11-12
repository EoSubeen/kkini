"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function safeNextPath(value: string, fallback: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const displayName = readString(formData, "displayName");

  if (!email || !email.includes("@")) return { error: "이메일 주소를 확인해 주세요." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 해요." };
  if (!displayName || displayName.length > 40) return { error: "이름은 1~40자로 입력해 주세요." };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${siteUrl.replace(/\/$/, "")}/auth/callback?next=/onboarding`,
    },
  });

  if (error) return { error: "가입을 완료하지 못했어요. 이메일과 비밀번호를 다시 확인해 주세요." };

  revalidatePath("/", "layout");
  if (data.session) redirect("/onboarding");
  redirect("/login?notice=이메일에서 가입 확인 링크를 눌러 주세요.");
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const nextPath = safeNextPath(readString(formData, "next"), "/home");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "이메일 또는 비밀번호가 맞지 않아요." };

  revalidatePath("/", "layout");
  redirect(nextPath);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
