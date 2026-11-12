import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleAlert } from "lucide-react";
import { connection } from "next/server";
import { Card, PageIntro, ProgressBar, SectionHeading } from "@/components/ui";
import { calculateFinance } from "@/domain/finance";
import { createClient } from "@/lib/supabase/server";
import { getLatestState } from "@/server";

export const instant = false;

export default async function HomePage() {
  await connection();
  const supabase = await createClient();
  const [userResponse, latest, planResponse] = await Promise.all([
    supabase.auth.getUser(),
    getLatestState(),
    supabase
      .from("check_plans")
      .select("id")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const displayName =
    typeof userResponse.data.user?.user_metadata?.display_name === "string"
      ? userResponse.data.user.user_metadata.display_name
      : "끼니 사용자";
  let completed = 0;
  let total = 0;
  if (planResponse.data?.id) {
    const { data: items } = await supabase
      .from("check_items")
      .select("status")
      .eq("check_plan_id", planResponse.data.id);
    total = items?.length ?? 0;
    completed = items?.filter((item) => item.status === "done").length ?? 0;
  }
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (!latest.profile) {
    return (
      <div className="page-stack">
        <PageIntro eyebrow={`안녕하세요, ${displayName} 님`} title="첫 재무 진단을 시작해 볼까요?" description="우리 집 숫자를 입력하면 월수지와 맞춤 레시피를 만들어 드려요." />
        <Card tone="green" className="section-stack">
          <SectionHeading title="약 5분이면 충분해요" description="모르는 항목은 비워 두어도 기본 가정으로 계산해요." />
          <Link className="button" href="/onboarding">내 정보 입력하기 <ArrowRight size={18} aria-hidden="true" /></Link>
        </Card>
      </div>
    );
  }

  // 저장된 최신 입력으로 다시 계산한다. 이번 달 월수지는 '지금 그대로', 95세 자산은 고른 레시피가 있으면 그 조합 기준이다.
  const result = calculateFinance(latest.profile);
  const planned = latest.selection ? calculateFinance(latest.profile, latest.selection) : null;
  const roundedCashFlow = Math.round(result.monthlyCashFlow);
  const cashFlowLabel = `${roundedCashFlow > 0 ? "+" : roundedCashFlow < 0 ? "−" : ""}${Math.abs(roundedCashFlow).toLocaleString("ko-KR")}만 원`;
  const deficit = roundedCashFlow < 0;

  return (
    <div className="page-stack">
      <PageIntro eyebrow={`안녕하세요, ${displayName} 님`} title="오늘 우리 집 돈은 어때요?" description="가장 먼저 손볼 한 가지부터 차근차근 보여드릴게요." />

      <Card className="hero-card">
        <div className="hero-card__copy">
          <p>이번 달 예상 월수지</p>
          <strong>{cashFlowLabel}</strong>
          <small>{deficit ? "지출과 가족 목표가 겹쳐 조금 빠듯해요." : "현재 흑자를 목표별로 나눠 담을 수 있어요."}</small>
        </div>
        <Image className="hero-card__image" src="/kkini/balanced-sandwich.png" alt="균형 있게 쌓인 끼니 샌드위치" width={215} height={190} priority />
      </Card>

      <Card tone="warm" className="section-stack">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <CircleAlert color="#b77626" size={22} aria-hidden="true" />
          <div>
            <strong>{deficit ? "이번 달은 생활비 조정부터" : "남는 돈의 목적을 정해 볼까요?"}</strong>
            <p style={{ margin: "4px 0 0", color: "var(--kkini-muted)", fontSize: 14 }}>{planned ? `고른 레시피를 적용하면 이번 달 ${Math.round(planned.monthlyCashFlow).toLocaleString("ko-KR")}만 원, 95세 금융·연금 자산은 약 ${(planned.assetsAt95 / 10000).toFixed(1)}억 원이에요.` : `지금 그대로면 ${result.depletionAge === null ? "95세까지 금융자산이 버티고" : `${result.depletionAge}세에 금융자산이 바닥나고`}, 95세 금융·연금 자산은 약 ${(result.assetsAt95 / 10000).toFixed(1)}억 원이에요.`}</p>
          </div>
        </div>
        <Link className="button-secondary" href="/recipe">추천 레시피 보기 <ArrowRight size={18} aria-hidden="true" /></Link>
      </Card>

      <section className="section-stack">
        <SectionHeading title="빠른 실행" description="지금 필요한 화면으로 바로 가요." />
        <div className="quick-grid">
          <Link className="card card--green quick-card" href="/recipe">
            <Image src="/kkini/actions/recipe-card.png" alt="" width={58} height={58} />
            <div><strong>추천 레시피 보기</strong><p>우리 집 처방을 샌드위치로 조합해요.</p></div>
          </Link>
          <Link className="card card--soft quick-card" href="/check">
            <Image src="/kkini/actions/checklist.png" alt="" width={58} height={58} />
            <div><strong>내 정보 점검하기</strong><p>달라진 소득과 지출을 바로 고쳐요.</p></div>
          </Link>
        </div>
      </section>

      <Card className="section-stack">
        <SectionHeading title="이번 달 실행률" action={<strong>{progress}%</strong>} />
        <ProgressBar value={progress} label="이번 달 실행률" />
        <p style={{ margin: 0, color: "var(--kkini-muted)", fontSize: 14 }}>{total > 0 ? `${completed}개 완료 · ${total - completed}개 남음` : "점검 탭에서 첫 실행 계획을 체크해 보세요."}</p>
      </Card>

      <p className="notice">끼니의 결과는 교육·모의설계용 추정치예요. 실제 금융 결정 전에는 공식 기관 조회와 전문가 상담을 거쳐 주세요.</p>
    </div>
  );
}
