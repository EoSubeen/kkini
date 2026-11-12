import { ProductShell } from "@/components/app-shell";
import { requireUser } from "@/lib/supabase/session";
import { connection } from "next/server";
import "@/styles/kkini.css";

// The authenticated shell reads the current session from request cookies.
export const instant = false;

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  await connection();
  await requireUser();
  return <ProductShell>{children}</ProductShell>;
}
