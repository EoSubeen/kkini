import Link from "next/link";
import { connection } from "next/server";
import { Card, checkTabs, Metric, PageIntro, SectionHeading, SegmentTabs } from "@/components/ui";
import { assumptionSensitivity, monteCarlo, shockTests } from "@/domain/finance";
import { eokText } from "@/lib/format/money";
import { getLatestState } from "@/server";

export const instant = false;

const dep = (age: number | null) => (age === null ? "95세까지 유지" : `${age}세 고갈`);
const pct = (value: number) => `${Math.round(value * 1000) / 10}%`;

export default async function ShockPage() {
  await connection();
  const { profile, selection } = await getLatestState();

  if (!profile) {
    return (
      <div className="page-stack">
        <SegmentTabs items={checkTabs} current="/check/shock" />
        <PageIntro eyebrow="충격 테스트" title="흔들려도 버티는지 확인해요" description="내 정보를 입력하면 위기 사건과 모의실험 결과를 보여 드려요." />
        <Card tone="green" className="section-stack"><Link className="button" href="/onboarding">내 정보 입력하기</Link></Card>
      </div>
    );
  }

  const sel = selection ?? undefined;
  const shocks = shockTests(profile, sel);
  const mc = monteCarlo(profile, sel);
  const sens = assumptionSensitivity(profile, sel);
  const top = sens.rows.slice(0, 5);

  return (
    <div className="page-stack">
      <SegmentTabs items={checkTabs} current="/check/shock" />
      <PageIntro eyebrow="충격 테스트" title="흔들려도 버티는지 확인해요" description={sel ? `고른 레시피 ${sel.selectedRecipeIds.length}개를 적용한 계획에 사건을 하나씩 넣어 봤어요.` : "지금 그대로의 계획에 사건을 하나씩 넣어 봤어요. 레시피를 고르면 그 조합으로 다시 계산해요."} />

      <Card tone="green" className="section-stack">
        <SectionHeading title="해마다 수익률이 달라지면" description={`예금·주식 수익률과 물가를 무작위로 바꿔 ${mc.runs}번 계산했어요(시드 고정).`} />
        <div className="metric-grid">
          <Metric label="지금 그대로" value={pct(mc.current.p)} hint="95세까지 버틴 비율" status={mc.current.p >= 0.8 ? "good" : mc.current.p >= 0.5 ? "warn" : "risk"} />
          <Metric label={sel ? "고른 조합" : "레시피를 고르면"} value={sel ? pct(mc.selected.p) : "-"} hint={sel ? `하위 10% ${eokText(mc.selected.p10)}` : "추천 조합에서 골라요"} status={sel ? (mc.selected.p >= 0.8 ? "good" : "warn") : undefined} />
          <Metric label="+ 인출 가드레일" value={sel ? pct(mc.guardrail.p) : "-"} hint="뒤처지면 생활비 10% 감액" status={sel && mc.guardrail.p >= 0.8 ? "good" : undefined} />
          <Metric label="가드레일 발동" value={sel ? pct(mc.guardrail.cut) : "-"} hint="한 번 이상 생활비를 줄인 비율" />
        </div>
        <p className="notice">예금은 평균 3.0%·표준편차 0.8%p, 주식은 평균 6%·표준편차 18%p(폭락이 잦은 t분포), 물가는 평균 2%·표준편차 1%p예요. 실제 확률이 아니라 가정한 모형의 성공 비율이에요.</p>
      </Card>

      <section className="section-stack">
        <SectionHeading title="사건 하나씩 넣어 보기" description={`사건 전: ${dep(shocks.before.depletionAge)} · 95세 ${eokText(shocks.before.assetsAt95)}`} />
        {shocks.events.map((event) => (
          <Card key={event.id} className="section-stack">
            <SectionHeading title={event.title} action={<span className="report-card__tag">{dep(event.depletionAge)}</span>} />
            <p style={{ margin: 0, color: "var(--kkini-muted)", fontSize: 14 }}>{event.description}</p>
            <p style={{ margin: 0, fontSize: 14 }}>95세 금융·연금 자산 <strong>{eokText(event.assetsAt95)}</strong> ({eokText(event.assetsAt95 - shocks.before.assetsAt95)})</p>
          </Card>
        ))}
      </section>

      <Card className="section-stack">
        <SectionHeading title="정확히 확인해야 할 숫자 Top 5" description="가정값 11개를 하나씩 올리고 내려 95세 자산이 얼마나 흔들리는지 봤어요." />
        {top.map((row, index) => (
          <div className="bar-row" key={row.key}>
            <div className="bar-row__labels"><strong>{index + 1}. {row.label} ({row.range})</strong><span>폭 {eokText(row.width).replace("+", "")}</span></div>
            <p style={{ margin: "2px 0 0", color: "var(--kkini-muted)", fontSize: 13 }}>낮을 때 {eokText(row.low)} · 높을 때 {eokText(row.high)}</p>
          </div>
        ))}
      </Card>
      <p className="notice">정년·임금피크 변경, 부모님 요양 시작, 금리 1%p 이상 변화가 생기면 1년을 기다리지 말고 다시 설계해요.</p>
    </div>
  );
}
