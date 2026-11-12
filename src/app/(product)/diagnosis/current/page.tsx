import Link from "next/link";
import { connection } from "next/server";
import { CalculationBasisDialog } from "@/components/calculation-basis-dialog";
import { Card, diagnosisTabs, Metric, PageIntro, SectionHeading, SegmentTabs } from "@/components/ui";
import { diagnosisResultSchema } from "@/lib/contracts";
import { createClient } from "@/lib/supabase/server";

const peers = [
  { label: "금융자산", ours: "4,500만", average: "6,200만", oursWidth: 64, averageLeft: 80 },
  { label: "주택자산", ours: "6.0억", average: "4.8억", oursWidth: 88, averageLeft: 68 },
  { label: "주택대출", ours: "1.8억", average: "1.2억", oursWidth: 72, averageLeft: 48 },
];

export const instant = false;

function signedAmount(value: number) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : rounded < 0 ? "−" : ""}${Math.abs(rounded).toLocaleString("ko-KR")}만 원`;
}

export default async function CurrentDiagnosisPage() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase
    .from("calculation_snapshots")
    .select("result, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const parsed = diagnosisResultSchema.safeParse(data?.result);

  if (!parsed.success) {
    return (
      <div className="page-stack">
        <SegmentTabs items={diagnosisTabs} current="/diagnosis/current" />
        <PageIntro eyebrow="현재 진단" title="먼저 우리 집 정보를 알려 주세요" description="입력한 숫자를 바탕으로 월수지와 건강 지표를 계산해 드려요." />
        <Card tone="green" className="section-stack">
          <SectionHeading title="아직 저장된 진단이 없어요" description="약 5분이면 첫 진단을 만들 수 있어요." />
          <Link className="button" href="/onboarding">내 정보 입력하기</Link>
        </Card>
      </div>
    );
  }

  const result = parsed.data;
  const cashFlow = result.monthlyCashFlow;
  const isDeficit = cashFlow < 0;
  const emergencyMonths = result.health.emergencyFundMonths;
  const debtRate = result.health.debtToIncomeRate * 100;
  const homeRate = result.health.homeAssetRate * 100;
  const pensionGap = result.health.pensionGapYears;

  return (
    <div className="page-stack">
      <SegmentTabs items={diagnosisTabs} current="/diagnosis/current" />
      <PageIntro eyebrow="현재 진단" title={isDeficit ? "지금 내 샌드위치는 조금 눌려 있어요" : "지금 내 샌드위치는 안정적으로 쌓였어요"} description={`저장된 입력으로 계산한 최근 결과예요. 95세 금융·연금 자산은 약 ${(result.assetsAt95 / 10000).toFixed(1)}억 원으로 예상돼요.`} />

      <Card tone="green" className="section-stack">
        <SectionHeading title="이번 달 돈의 흐름" action={<strong style={{ color: isDeficit ? "var(--kkini-red)" : "var(--kkini-green-700)" }}>{signedAmount(cashFlow)}</strong>} />
        <div className="progress"><span style={{ width: `${Math.min(100, Math.max(8, Math.abs(cashFlow)))}%`, background: isDeficit ? "var(--kkini-red)" : "var(--kkini-green-700)" }} /></div>
        <p style={{ margin: 0, color: "var(--kkini-muted)", fontSize: 14 }}>{isDeficit ? "추천 레시피에서 적자 폭을 줄일 수 있는 순서를 확인해 보세요." : "현재 흑자를 비상자금과 장기 목표에 나눠 담아 보세요."}</p>
      </Card>

      <section className="section-stack">
        <SectionHeading title="건강 지표" action={<CalculationBasisDialog />} />
        <Card><div className="metric-grid">
          <Metric label="비상자금" value={`${emergencyMonths.toFixed(1)}개월`} hint={emergencyMonths >= 6 ? "기본 안전망이 있어요" : "3~6개월을 준비해요"} status={emergencyMonths >= 6 ? "good" : "warn"} />
          <Metric label="부채 / 소득" value={`${Math.round(debtRate)}%`} hint={debtRate <= 100 ? "관리 가능한 범위예요" : "조정이 필요해요"} status={debtRate <= 100 ? "good" : "warn"} />
          <Metric label="집 중심 자산" value={`${Math.round(homeRate)}%`} hint={homeRate <= 60 ? "자산 구성이 분산됐어요" : "비중이 높아요"} status={homeRate <= 60 ? "good" : "warn"} />
          <Metric label="연금 공백" value={`${pensionGap}년`} hint={pensionGap === 0 ? "공백이 없어요" : "보완이 필요해요"} status={pensionGap === 0 ? "good" : "risk"} />
        </div></Card>
      </section>

      <section className="section-stack">
        <SectionHeading title="동년배와 비교" description="50대 수도권 자가 가구의 설명용 예시 기준" action={<span className="report-card__tag">예시 데이터</span>} />
        <Card className="chart-panel">
          {peers.map((peer) => (
            <div className="bar-row" key={peer.label}>
              <div className="bar-row__labels"><strong>{peer.label}</strong><span>우리 {peer.ours} · 평균 {peer.average}</span></div>
              <div className="bar-comparison" aria-label={`${peer.label}: 우리 ${peer.ours}, 평균 ${peer.average}`}>
                <i style={{ width: `${peer.oursWidth}%` }} />
                <b style={{ left: `${peer.averageLeft}%` }} />
              </div>
            </div>
          ))}
          <p className="notice">초록 막대는 우리 집, 주황 표시는 동년배 평균이에요. 비교값은 화면 설명용 예시이며 실제 서비스에서는 공신력 있는 통계 기준을 연결해요.</p>
        </Card>
      </section>
    </div>
  );
}
