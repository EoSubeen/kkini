import Link from "next/link";
import { connection } from "next/server";
import { CalculationBasisDialog } from "@/components/calculation-basis-dialog";
import { Card, checkTabs, Metric, PageIntro, SectionHeading, SegmentTabs } from "@/components/ui";
import { analyzeProfile, CALCULATION_BASIS, CALCULATION_VERSION, RECIPES, SOURCES } from "@/domain/finance";
import { eokText, signedManwon } from "@/lib/format/money";
import { getLatestState } from "@/server";

export const instant = false;

export default async function ReportPage() {
  await connection();
  const { profile, selection, profileSavedAt } = await getLatestState();

  const summary = profile ? analyzeProfile(profile, selection ?? undefined) : null;
  const applied = summary?.selected?.applied ?? [];

  return (
    <div className="page-stack">
      <SegmentTabs items={checkTabs} current="/check/report" />
      <PageIntro eyebrow="근거·리포트" title="숫자의 근거를 확인해요" description="계산에 쓴 가정값과 통계·제도값의 출처를 모두 공개해요." trailing={<CalculationBasisDialog />} />

      {summary ? (
        <Card tone="green" className="section-stack">
          <SectionHeading title="내 재무설계 요약" description={profileSavedAt ? `입력 기준 ${profileSavedAt.slice(0, 10)}` : undefined} />
          <div className="metric-grid">
            <Metric label="지금 그대로 월수지" value={signedManwon(summary.baseResult.m0)} />
            <Metric label="지금 그대로" value={summary.baseResult.deplete === null ? "95세까지 유지" : `${summary.baseResult.deplete}세 고갈`} hint={`95세 ${eokText(summary.baseResult.z95)}`} status={summary.baseResult.deplete === null ? "good" : "risk"} />
            <Metric label="레시피 적용 월수지" value={applied.length ? signedManwon(summary.appliedResult.m0) : "-"} />
            <Metric label="레시피 적용" value={applied.length ? (summary.appliedResult.deplete === null ? "95세까지 유지" : `${summary.appliedResult.deplete}세 고갈`) : "-"} hint={applied.length ? `95세 ${eokText(summary.appliedResult.z95)}` : "추천 조합에서 골라요"} status={applied.length ? (summary.appliedResult.deplete === null ? "good" : "risk") : undefined} />
          </div>
          {applied.length ? <p style={{ margin: 0, fontSize: 14, color: "var(--kkini-muted)" }}>고른 레시피: {applied.map((id) => RECIPES.find((recipe) => recipe.id === id)?.t ?? id).join(", ")}</p> : null}
        </Card>
      ) : (
        <Card tone="green" className="section-stack"><SectionHeading title="아직 저장된 정보가 없어요" /><Link className="button" href="/onboarding">내 정보 입력하기</Link></Card>
      )}

      <Card className="section-stack">
        <SectionHeading title="계산 가정" action={<span className="report-card__tag">{CALCULATION_VERSION}</span>} />
        {CALCULATION_BASIS.map((row) => (
          <div className="bar-row__labels" key={row.key}><span>{row.label}</span><strong>{row.value}</strong></div>
        ))}
      </Card>

      <section className="section-stack">
        <SectionHeading title="통계·제도값 출처" description="교차확인: 공식 자료와 대조 · 추정: 팀 가정 또는 범위의 중간값" />
        {SOURCES.map((source) => (
          <Card key={source.item} className="section-stack">
            <SectionHeading title={source.item} action={<span className="report-card__tag">{source.status}</span>} />
            <p style={{ margin: 0, color: "var(--kkini-muted)", fontSize: 14 }}>{source.value}</p>
            <a className="text-button" href={source.url} target="_blank" rel="noopener noreferrer">원문 보기</a>
          </Card>
        ))}
      </section>
      <p className="notice">AI 도구로 자료를 조사하고 계산 코드를 작성했으며, 수치는 원문과 계산식으로 대조했어요. 이 결과는 교육·모의설계용이며 실제 결정 전 공식 기관 조회와 전문가 상담이 필요해요.</p>
    </div>
  );
}
