import { Card, diagnosisTabs, PageIntro, SegmentTabs } from "@/components/ui";

const events = [
  { age: "55세", title: "임금피크 시작", body: "월급이 약 20% 줄어들며 저축 여력이 작아져요." },
  { age: "60세", title: "정년과 교육비 겹침", body: "근로소득이 끝나기 전 막내 교육비를 따로 마련해야 해요." },
  { age: "65세", title: "국민연금 수령 시작", body: "연금이 들어오지만 은퇴 생활비 목표에는 조금 모자라요." },
  { age: "72세", title: "금융자산 소진 예상", body: "아무 조정도 하지 않으면 이때부터 집에 더 의존하게 돼요." },
];

export default function TimelinePage() {
  return (
    <div className="page-stack">
      <SegmentTabs items={diagnosisTabs} current="/diagnosis/timeline" />
      <PageIntro eyebrow="미래 타임라인" title="돈이 부딪히는 해를 먼저 볼게요" description="소득이 줄고 큰 지출이 겹치는 시점을 미리 알면 준비 순서가 선명해져요." />
      <Card tone="warm"><strong>예시 시뮬레이션</strong><p style={{ margin: "4px 0 0", color: "var(--kkini-muted)", fontSize: 14 }}>현재 화면의 나이와 사건은 김샌드 보고서 사례예요. 개인 입력 연동은 다음 계산 엔진 확장 단계에서 제공해요.</p></Card>
      <Card tone="green">
        <p className="eyebrow">핵심 시점</p>
        <h2 style={{ margin: "5px 0 7px" }}>72세 금융자산 소진 예상</h2>
        <p style={{ margin: 0, color: "var(--kkini-muted)" }}>생활비 조정과 재취업 레시피를 함께 쓰면 소진 시점을 뒤로 미룰 수 있어요.</p>
      </Card>
      <Card><div className="timeline">
        {events.map((event) => <article className="timeline-item" key={event.age}><time>{event.age}</time><h3>{event.title}</h3><p>{event.body}</p></article>)}
      </div></Card>
      <p className="notice">타임라인은 입력값과 계산 가정에 따른 모의 결과예요. 임금·금리·세법이 달라지면 다시 계산해 주세요.</p>
    </div>
  );
}
