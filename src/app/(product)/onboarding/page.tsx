import { OnboardingForm } from "@/components/onboarding-form";
import { getCurrentUser } from "@/lib/supabase/session";
import { getLatestState } from "@/server";
import { connection } from "next/server";

export const instant = false;

export default async function OnboardingPage() {
  await connection();
  const [user, latest] = await Promise.all([getCurrentUser(), getLatestState()]);
  const defaultName =
    typeof user?.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : "";
  // 이미 저장한 정보가 있으면 그 값을 채워서 '재무 정보 수정'이 처음부터 다시 입력하는 화면이 되지 않게 한다.
  return <OnboardingForm defaultName={defaultName} initialProfile={latest.profile} />;
}
