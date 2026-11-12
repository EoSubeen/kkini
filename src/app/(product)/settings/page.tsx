import Link from "next/link";
import { connection } from "next/server";
import { ChevronRight, FileText, LockKeyhole, LogOut, UserRound } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { Card, PageIntro, SectionHeading } from "@/components/ui";
import { getCurrentUser } from "@/lib/supabase/session";

export const instant = false;

export default async function SettingsPage() {
  await connection();
  const user = await getCurrentUser();
  const displayName =
    typeof user?.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : "끼니 사용자";
  return (
    <div className="page-stack">
      <PageIntro eyebrow="설정" title="내 정보와 서비스 설정" description="저장된 정보와 계정 상태를 관리해요." />
      <Card tone="green">
        <p className="eyebrow">로그인 계정</p>
        <strong style={{ display: "block", fontSize: 20 }}>{displayName} 님</strong>
        <span style={{ color: "var(--kkini-muted)", fontSize: 14 }}>{user?.email}</span>
      </Card>
      <section className="section-stack">
        <SectionHeading title="내 정보" />
        <Card className="settings-list">
          <Link href="/onboarding"><span><UserRound size={19} aria-hidden="true" style={{ verticalAlign: -4, marginRight: 10 }} />재무 정보 수정</span><ChevronRight size={19} aria-hidden="true" /></Link>
          <Link href="/diagnosis/current"><span><FileText size={19} aria-hidden="true" style={{ verticalAlign: -4, marginRight: 10 }} />최근 진단 결과</span><ChevronRight size={19} aria-hidden="true" /></Link>
          <button type="button"><span><LockKeyhole size={19} aria-hidden="true" style={{ verticalAlign: -4, marginRight: 10 }} />개인정보와 보안</span><ChevronRight size={19} aria-hidden="true" /></button>
        </Card>
      </section>
      <section className="section-stack">
        <SectionHeading title="서비스" />
        <Card className="settings-list">
          <button type="button"><span>계산 기준일</span><span style={{ color: "var(--kkini-muted)" }}>2026.11</span></button>
          <button type="button"><span>앱 버전</span><span style={{ color: "var(--kkini-muted)" }}>0.1.0</span></button>
          <form action={signOutAction}>
            <button type="submit"><span><LogOut size={19} aria-hidden="true" style={{ verticalAlign: -4, marginRight: 10 }} />로그아웃</span><ChevronRight size={19} aria-hidden="true" /></button>
          </form>
        </Card>
      </section>
      <p className="notice">계정 삭제 시 저장된 입력 정보와 진단 결과를 복구할 수 없어요.</p>
    </div>
  );
}
