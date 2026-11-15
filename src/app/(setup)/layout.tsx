import { requireUser } from "@/lib/supabase/session";
import { connection } from "next/server";
import "@/styles/kkini.css";

export const instant = false;

export default async function SetupLayout({ children }: { children: React.ReactNode }) {
  await connection();
  await requireUser();
  return <div className="setup-viewport">{children}</div>;
}
