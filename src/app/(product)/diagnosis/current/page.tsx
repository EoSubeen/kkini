import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { CalculationBasisDialog } from "@/components/calculation-basis-dialog";
import { Card, diagnosisTabs, Metric, PageIntro, SectionHeading, SegmentTabs } from "@/components/ui";
import { calculateFinance, peerComparison } from "@/domain/finance";
import { shortMoney } from "@/lib/format/money";
import { getLatestState } from "@/server";

export const instant = false;

function signedAmount(value: number) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : rounded < 0 ? "−" : ""}${Math.abs(rounded).toLocaleString("ko-KR")}만 원`;
}

export default async function CurrentDiagnosisPage() {
  await connection();
  const { profile } = await getLatestState();

  if (!profile) {
    return (
      <div className="page-stack">
        <SegmentTabs items={diagnosisTabs} current="/diagnosis/current" />
        <PageIntro title="먼저 우리 집 정보를 알려 주세요" description="입력한 숫자로 월수지와 건강 지표를 계산해요." />
        <Card tone="green" className="section-stack">
          <SectionHeading title="아직 저장된 진단이 없어요" description="약 5분이면 첫 진단을 만들 수 있어요." />
          <Link className="button" href="/onboarding">내 정보 입력하기</Link>
        </Card>
      </div>
    );
  }

  const result = calculateFinance(profile);
  const peer = peerComparison(profile);
  const peers = peer.rows.map((row) => {
    const scale = Math.max(row.ours, row.average, 1) * 1.1;
    return {
      label: row.label,
      ours: shortMoney(row.ours),
      average: shortMoney(row.average),
      oursWidth: Math.max(2, Math.round((row.ours / scale) * 100)),
      averageLeft: Math.round((row.average / scale) * 100),
    };
  });
  const cashFlow = result.monthlyCashFlow;
  const isDeficit = cashFlow < 0;
  const emergencyMonths = result.health.emergencyFundMonths;
  const debtRate = result.health.debtToIncomeRate * 100;
  const homeRate = result.health.homeAssetRate * 100;
  const pensionGap = result.health.pensionGapYears;

  return (
    <div className="page-stack diagnosis-page">
      <SegmentTabs items={diagnosisTabs} current="/diagnosis/current" />
      <PageIntro title="지금 우리 집 재무 균형" description={`${result.depletionAge === null ? "95세까지 금융자산이 유지되고" : `금융자산은 ${result.depletionAge}세에 바닥나고`}, 95세엔 약 ${(result.assetsAt95 / 10000).toFixed(1)}억 원으로 예상되요.`} />

      <section className="diagnosis-overview" aria-labelledby="cashflow-heading">
        <div className="diagnosis-overview__copy">
          <p id="cashflow-heading">이번 달 돈의 흐름</p>
          <strong data-risk={isDeficit}>{signedAmount(cashFlow)}</strong>
          <span>{isDeficit ? "지출이 소득보다 크게 아파요. 생활비부터 줄여 볼게요." : "남는 돈을 비상자금과 장기 목표에 나눠 담아요."}</span>
        </div>
        <span className="diagnosis-overview__art">
          <Image src="/kkini/diagnosis-ledger.png" alt="샌드위치 재료로 재무 흐름을 정리한 장부" fill sizes="150px" loading="eager" />
        </span>
        <div className="diagnosis-overview__rule" aria-hidden="true"><i data-risk={isDeficit} style={{ width: `${Math.min(100, Math.max(8, Math.abs(cashFlow)))}%` }} /></div>
      </section>

      <section className="diagnosis-ledger section-stack">
        <SectionHeading title="재무 건강 지표" action={<CalculationBasisDialog />} />
        <div className="health-ledger">
          <Metric label="비상자금" value={`${emergencyMonths.toFixed(1)}개월`} hint={emergencyMonths >= 6 ? "기본 안전망이 있어요" : "3~6개월을 준비해요"} status={emergencyMonths >= 6 ? "good" : "warn"} />
          <Metric label="부채 / 소득" value={`${Math.round(debtRate)}%`} hint={debtRate <= 100 ? "관리 가능한 범위에요" : "조정이 필요해요"} status={debtRate <= 100 ? "good" : "warn"} />
          <Metric label="집 중심 자산" value={`${Math.round(homeRate)}%`} hint={homeRate <= 60 ? "자산 구성이 분산됬어요" : "비중이 노파요"} status={homeRate <= 60 ? "good" : "warn"} />
          <Metric label="연금 공백" value={`${pensionGap}년`} hint={pensionGap === 0 ? "공백이 없어요" : "보완이 필요해요"} status={pensionGap === 0 ? "good" : "risk"} />
        </div>
      </section>

      <section className="peer-section section-stack">
        <SectionHeading title="나와 비스한 가구는 어떤가요?" description={peer.applicable ? peer.source : `${peer.source} (내 나이와 연령대가 달라 참고용이에요)`} />
        <div className="chart-panel peer-chart">
          <div className="peer-chart__legend" aria-hidden="true"><span><i />우리 집</span><span><b />50대 가구 평균</span></div>
          {peers.map((row) => (
            <div className="bar-row" key={row.label}>
              <div className="bar-row__labels"><strong>{row.label}</strong><span>우리 {row.ours} <em>평균 {row.average}</em></span></div>
              <div className="bar-comparison" aria-label={`${row.label}: 우리 ${row.ours}, 평균 ${row.average}`}>
                <i style={{ width: `${row.oursWidth}%` }} />
                <b style={{ left: `${row.averageLeft}%` }} />
              </div>
            </div>
          ))}
          <p className="chart-footnote">총자산에는 집·예금·투자·연금·기타 자산이 포함되어 있어요.</p>
        </div>
      </section>
    </div>
  );
}
