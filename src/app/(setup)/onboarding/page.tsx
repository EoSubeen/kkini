import { OnboardingForm } from "@/components/onboarding-form";
import { getCurrentUser } from "@/lib/supabase/session";
import { getLatestState } from "@/server";
import { connection } from "next/server";

export const instant = false;

export default async function OnboardingPage() {
  await connection();
  const [user, latest] = await Promise.all([getCurrentUser(), getLatestState()]);
  const defaultName = typeof user?.user_metadata?.display_name === "string" ? user.user_metadata.display_name : "";
  return <main className="setup-page setup-page--form"><OnboardingForm defaultName={defaultName} initialProfile={latest.profile} setupMode={!latest.profile} /></main>;
}
