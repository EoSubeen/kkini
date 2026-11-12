import { redirect } from "next/navigation";
import { createClient } from "./server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) return null;
  return user;
}

export async function requireUser(nextPath?: string) {
  const user = await getCurrentUser();
  if (user) return user;

  const next = nextPath?.startsWith("/") ? `?next=${encodeURIComponent(nextPath)}` : "";
  redirect(`/login${next}`);
}
