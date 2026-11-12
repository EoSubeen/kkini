import Image from "next/image";
import { Card, diagnosisTabs, Metric, PageIntro, ProgressBar, SectionHeading, SegmentTabs } from "@/components/ui";

export default function FamilyPage() {
  return (
    <div className="page-stack">
      <SegmentTabs items={diagnosisTabs} current="/diagnosis/family" />
      <PageIntro eyebrow="가족 안전망" title="세 세대를 한 장에 연결했어요" description="부모님, 우리 집, 자녀의 돈이 어디서 오가고 있는지 확인해요." />
      <Card tone="warm"><strong>예시 시뮬레이션</strong><p style={{ margin: "4px 0 0", color: "var(--kkini-muted)", fontSize: 14 }}>아래 금액과 가족 구성은 김샌드 보고서 사례예요. 실제 사용자 수치로 오해하지 않도록 개인 진단과 분리해 표시해요.</p></Card>
      <Card tone="green" className="section-stack">
        <SectionHeading title="가족 재무상태표" action={<span className="report-card__tag">순자산 11.13억</span>} />
        <strong style={{ fontSize: 20 }}>매달 50만 원이 부모님께 가요</strong>
        <div className="family-map">
          <div className="family-person"><Image src="/kkini/family/parents.png" alt="부모님" width={68} height={62} /><div><strong>부모님</strong><span>재산 5.0억</span></div></div>
          <div className="family-person"><Image src="/kkini/family/our-home.png" alt="우리 집" width={68} height={62} /><div><strong>우리 집</strong><span>순자산 6.13억</span></div></div>
          <div className="family-person"><Image src="/kkini/family/children.png" alt="자녀" width={68} height={62} /><div><strong>자녀</strong><span>21세 · 18세</span></div></div>
        </div>
        <p style={{ margin: 0, color: "var(--kkini-muted)", fontSize: 13 }}>부모님 주택연금을 활용하면 월 지원금 50만 원을 줄일 수 있어요.</p>
      </Card>
      <div className="metric-grid">
        <Metric label="전체 순자산" value="11.13억" hint="부모+우리 집" />
        <Metric label="세대 간 이전" value="월 50만" hint="나 → 부모님" status="warn" />
      </div>
      <Card className="section-stack">
        <SectionHeading title="가족이 버티는 데 필요한 돈" action={<strong style={{ color: "var(--kkini-red)" }}>1.9억 부족</strong>} />
        <div><div className="bar-row__labels"><span>필요 보장액</span><strong>6.9억</strong></div><ProgressBar value={100} label="필요 보장액 6.9억" /></div>
        <div><div className="bar-row__labels"><span>준비된 금액</span><strong>5.0억</strong></div><ProgressBar value={72} label="준비된 금액 5억" /></div>
        <p className="notice notice--warn">실손·정기보험·사망보장을 확인하고 부족분만 보완해요.</p>
      </Card>
    </div>
  );
}
