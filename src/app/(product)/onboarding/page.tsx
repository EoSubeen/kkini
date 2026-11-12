import { OnboardingForm } from "@/components/onboarding-form";
import { getCurrentUser } from "@/lib/supabase/session";
import { connection } from "next/server";

export const instant = false;

export default async function OnboardingPage() {
  await connection();
  const user = await getCurrentUser();
  const defaultName =
    typeof user?.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : "";
  return <OnboardingForm defaultName={defaultName} />;
}
