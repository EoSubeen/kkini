import Link from "next/link";
import { connection } from "next/server";
import { Card, diagnosisTabs, PageIntro, SectionHeading, SegmentTabs } from "@/components/ui";
import { analyzeProfile, timelineEvents } from "@/domain/finance";
import { signedManwon } from "@/lib/format/money";
import { getLatestState } from "@/server";

export const instant = false;

export default async function TimelinePage() {
  await connection();
  const { profile, selection } = await getLatestState();

  if (!profile) {
    return (
      <div className="page-stack">
        <SegmentTabs items={diagnosisTabs} current="/diagnosis/timeline" />
        <PageIntro eyebrow="미래 타임라인" title="돈이 부딪히는 해를 먼저 볼게요" description="내 정보를 입력하면 95세까지의 사건을 계산해 드려요." />
        <Card tone="green" className="section-stack">
          <SectionHeading title="아직 저장된 정보가 없어요" />
          <Link className="button" href="/onboarding">내 정보 입력하기</Link>
        </Card>
      </div>
    );
  }

  const { baseResult, appliedResult, selected } = analyzeProfile(profile, selection ?? undefined);
  const events = timelineEvents(appliedResult);
  const depletion = appliedResult.deplete;
  const crevasse = -Math.min(0, appliedResult.crev);

  return (
    <div className="page-stack">
      <SegmentTabs items={diagnosisTabs} current="/diagnosis/timeline" />
      <PageIntro eyebrow="미래 타임라인" title="돈이 부딪히는 해를 먼저 볼게요" description="소득이 줄고 큰 지출이 겹치는 시점을 미리 알면 준비 순서가 선명해져요." />
      <Card tone="warm"><strong>{selected ? "고른 레시피를 적용한 타임라인" : "지금 그대로의 타임라인"}</strong><p style={{ margin: "4px 0 0", color: "var(--kkini-muted)", fontSize: 14 }}>{selected ? `레시피 ${selected.applied.length}개를 반영했어요. 지금 그대로면 ${baseResult.deplete === null ? "95세까지 유지돼요" : `${baseResult.deplete}세에 금융자산이 바닥나요`}.` : "저장된 내 입력으로 95세까지 해마다 계산했어요. 레시피를 고르면 이 타임라인도 바뀌어요."}</p></Card>
      <Card tone="green">
        <p className="eyebrow">핵심 시점</p>
        <h2 style={{ margin: "5px 0 7px" }}>{depletion === null ? "95세까지 금융자산 유지" : `${depletion}세 금융자산 소진 예상`}</h2>
        <p style={{ margin: 0, color: "var(--kkini-muted)" }}>{crevasse > 0 ? `정년부터 국민연금 개시 전까지 ${(crevasse / 10000).toFixed(2)}억 원이 모자라요. ` : ""}{depletion === null ? "지금 계획을 유지하면서 1년마다 점검해요." : "생활비 조정과 재취업 레시피를 함께 쓰면 소진 시점을 뒤로 미룰 수 있어요."}</p>
      </Card>
      <Card><div className="timeline">
        {events.map((event) => (
          <article className="timeline-item" key={`${event.age}-${event.title}`}>
            <time>{event.age}세</time>
            <h3>{event.title}</h3>
            <p>{event.year}년 · 그해 순현금흐름 {signedManwon(event.cashFlow)}</p>
          </article>
        ))}
      </div></Card>
      <p className="notice">타임라인은 입력값과 계산 가정에 따른 모의 결과예요. 임금·금리·세법이 달라지면 다시 계산해 주세요.</p>
    </div>
  );
}
