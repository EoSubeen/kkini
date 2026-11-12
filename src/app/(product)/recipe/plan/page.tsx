import Link from "next/link";
import { connection } from "next/server";
import { Card, Metric, PageIntro, recipeTabs, SectionHeading, SegmentTabs } from "@/components/ui";
import { analyzeProfile, PLAN, PLAN_PHASES, RECIPES } from "@/domain/finance";
import { eokText, signedManwon } from "@/lib/format/money";
import { getLatestState } from "@/server";

export const instant = false;

type Step = { id: string; ph: number; when: string; title: string; steps: string[]; link?: [string, string] };

export default async function PlanPage() {
  await connection();
  const { profile, selection } = await getLatestState();

  if (!profile) {
    return (
      <div className="page-stack">
        <SegmentTabs items={recipeTabs} current="/recipe/plan" />
        <PageIntro eyebrow="실행 계획" title="무엇부터 할지 순서대로 정리해요" description="내 정보를 입력하고 레시피를 고르면 실행 순서를 만들어 드려요." />
        <Card tone="green" className="section-stack"><Link className="button" href="/onboarding">내 정보 입력하기</Link></Card>
      </div>
    );
  }

  const { baseResult, appliedResult, selected } = analyzeProfile(profile, selection ?? undefined);
  const applied = selected?.applied ?? [];
  const y0 = appliedResult.rows[0];
  const p = appliedResult.p;
  const emergencyMonths = (p.dep0 - p.mt0) / Math.max(1, y0.R / 12);
  const items: Step[] = applied
    .filter((id) => PLAN[id])
    .map((id) => ({
      id,
      ph: PLAN[id].ph,
      when: PLAN[id].when,
      title: RECIPES.find((recipe) => recipe.id === id)?.t ?? id,
      steps: PLAN[id].s,
      link: PLAN[id].l,
    }));
  if (applied.length && emergencyMonths < 6) {
    items.push({
      id: "em",
      ph: 2,
      when: y0.S > 0 ? "흑자 전환 직후" : "흑자가 나면",
      title: "비상자금 6개월치 모으기",
      steps: [
        `지금 ${emergencyMonths.toFixed(1)}개월치 → 목표 ${Math.round((y0.R / 12) * 6).toLocaleString("ko-KR")}만 원`,
        "매달 흑자의 절반을 파킹통장(수시입출금)에 쌓기",
        "마이너스통장부터 갚으면 이자도 줄어요",
      ],
    });
  }
  items.sort((left, right) => left.ph - right.ph);
  const phases = [...new Set(items.map((item) => item.ph))];

  return (
    <div className="page-stack">
      <SegmentTabs items={recipeTabs} current="/recipe/plan" />
      <PageIntro eyebrow="실행 계획" title="무엇부터 할지 순서대로 정리했어요" description="돈이 안 드는 처방은 바로, 돈이 드는 처방은 흑자 전환 뒤에 해요." />

      <Card tone="green" className="section-stack">
        <SectionHeading title={applied.length ? `고른 레시피 ${applied.length}개를 적용하면` : "아직 고른 레시피가 없어요"} />
        <div className="metric-grid">
          <Metric label="이번 달 월수지" value={signedManwon(appliedResult.m0)} hint={`지금 그대로 ${signedManwon(baseResult.m0)}`} status={appliedResult.m0 >= 0 ? "good" : "warn"} />
          <Metric label="금융자산" value={appliedResult.deplete === null ? "95세까지 유지" : `${appliedResult.deplete}세 고갈`} hint={`지금 그대로 ${baseResult.deplete === null ? "유지" : `${baseResult.deplete}세`}`} status={appliedResult.deplete === null ? "good" : "risk"} />
          <Metric label="95세 금융·연금 자산" value={eokText(appliedResult.z95)} hint={`지금 그대로 ${eokText(baseResult.z95)}`} status={appliedResult.z95 >= 0 ? "good" : "risk"} />
        </div>
      </Card>

      {items.length === 0 ? (
        <Card className="section-stack">
          <p style={{ margin: 0 }}>추천 조합에서 재료를 고르고 저장하면, 무엇부터 언제 어떻게 할지 순서대로 정리해 드려요.</p>
          <Link className="button-secondary" href="/recipe">재료 고르러 가기</Link>
        </Card>
      ) : (
        phases.map((phase) => (
          <section className="section-stack" key={phase}>
            <SectionHeading title={PLAN_PHASES[phase]} />
            {items.filter((item) => item.ph === phase).map((item) => (
              <Card className="section-stack" key={item.id}>
                <SectionHeading title={item.title} action={<span className="report-card__tag">{item.when}</span>} />
                <ol style={{ margin: 0, paddingLeft: 20, color: "var(--kkini-muted)", fontSize: 14, lineHeight: 1.6 }}>
                  {item.steps.map((step) => <li key={step}>{step}</li>)}
                </ol>
                {item.link ? <a className="text-button" href={item.link[0]} target="_blank" rel="noopener noreferrer">{item.link[1]} 바로가기</a> : null}
              </Card>
            ))}
          </section>
        ))
      )}
      {applied.includes("irp") && y0.S < 0 ? <p className="notice notice--warn">지금은 적자라 IRP에 돈을 넣으면 생활비가 마이너스통장으로 빠져요. 1단계 레시피로 흑자를 먼저 만들어 주세요.</p> : null}
      <p className="notice">실행 계획은 교육·모의설계용이에요. 상품 가입 전 수수료·해지 비용·손실 가능성을 비교하고 공식 기관에서 확인해 주세요.</p>
    </div>
  );
}
