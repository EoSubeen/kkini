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
    supabase.from("check_plans").select("id").eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const displayName = typeof userResponse.data.user?.user_metadata?.display_name === "string"
    ? userResponse.data.user.user_metadata.display_name
    : "끼니 사용자";
  let completed = 0;
  let total = 0;
  if (planResponse.data?.id) {
    const { data: items } = await supabase.from("check_items").select("status").eq("check_plan_id", planResponse.data.id);
    total = items?.length ?? 0;
    completed = items?.filter((item) => item.status === "done").length ?? 0;
  }
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (!latest.profile) {
    return (
      <div className="page-stack">
        <PageIntro eyebrow={`안녕하세요, ${displayName} 님`} title="첫 재무 진단을 시작할까요?" description="우리 집 숫자를 넣으면 월수지와 맞춤 레시피를 만들어요." />
        <Card tone="green" className="section-stack">
          <SectionHeading title="약 5분이면 충분해요" description="모르는 항목은 비워 두어도 기본 가정으로 계산해요." />
          <Link className="button" href="/onboarding">내 정보 입력하기 <ArrowRight size={18} aria-hidden="true" /></Link>
        </Card>
      </div>
    );
  }

  const result = calculateFinance(latest.profile);
  const planned = latest.selection ? calculateFinance(latest.profile, latest.selection) : null;
  const roundedCashFlow = Math.round(result.monthlyCashFlow);
  const cashFlowLabel = `${roundedCashFlow > 0 ? "+" : roundedCashFlow < 0 ? "−" : ""}${Math.abs(roundedCashFlow).toLocaleString("ko-KR")}만 원`;
  const deficit = roundedCashFlow < 0;

  return (
    <div className="page-stack home-page">
      <header className="home-intro">
        <p>안녕하세요, {displayName} 님</p>
        <h1>오늘 우리 집 돈,<br />어떤가요?</h1>
        <span>지금 손볼 한 가지부터 보여드릴게요.</span>
      </header>

      <section className="home-balance" aria-labelledby="home-balance-title">
        <div className="home-balance__copy">
          <p id="home-balance-title">이번 달 월수지</p>
          <strong>{cashFlowLabel}</strong>
          <small>{deficit ? "지출과 가족 목표가 겹쳐 조금 빠듯해요." : "현재 흑자를 목표별로 나눠 담을 수 있어요."}</small>
        </div>
        <span className="home-balance__image">
          <Image src="/kkini/balanced-sandwich.png" alt="균형 있게 쌓인 끼니 샌드위치" fill sizes="(max-width: 374px) 190px, 220px" loading="eager" />
        </span>
      </section>

      <section className="home-prescription">
        <div className="home-prescription__copy">
          <span className="home-prescription__icon"><CircleAlert size={20} aria-hidden="true" /></span>
          <div>
            <strong>{deficit ? "이번 달은 생활비 조정부터" : "남는 돈의 목적을 정해 볼까요?"}</strong>
            <p>{planned ? `레시피를 적용하면 이번 달 ${Math.round(planned.monthlyCashFlow).toLocaleString("ko-KR")}만 원, 95세 자산은 약 ${(planned.assetsAt95 / 10000).toFixed(1)}억 원이에요.` : `지금 그대로면 ${result.depletionAge === null ? "95세까지 유지" : `${result.depletionAge}세에 고갈`}하고, 95세 자산은 약 ${(result.assetsAt95 / 10000).toFixed(1)}억 원이에요.`}</p>
          </div>
        </div>
        <Link className="home-prescription__link" href="/recipe">레시피 보기 <ArrowRight size={18} aria-hidden="true" /></Link>
      </section>

      <section className="home-actions">
        <SectionHeading title="지금 할 일" />
        <div className="home-action-list">
          <Link className="home-action-row" href="/recipe">
            <span className="home-action-row__art"><Image src="/kkini/actions/recipe-card.png" alt="" fill sizes="72px" /></span>
            <div><strong>레시피 조합하기</strong><p>진단을 샌드위치로 바꿔요.</p></div>
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
          <Link className="home-action-row" href="/check">
            <span className="home-action-row__art"><Image src="/kkini/actions/checklist.png" alt="" fill sizes="72px" /></span>
            <div><strong>이번 달 실행 체크</strong><p>끝낸 일을 하나씩 완료해요.</p></div>
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="home-progress">
        <SectionHeading title="이번 달 실행률" action={<strong>{progress}%</strong>} />
        <ProgressBar value={progress} label="이번 달 실행률" />
        <p>{total > 0 ? `${completed}개 완료 · ${total - completed}개 남음` : "점검 탭에서 첫 실행 계획을 체크해 보세요."}</p>
      </section>

      <p className="service-footnote">끼니의 결과는 교육·모의설계용 추정치예요. 실제 금융 결정 전에는 공식 기관 조회와 전문가 상담을 거치세요.</p>
    </div>
  );
}
