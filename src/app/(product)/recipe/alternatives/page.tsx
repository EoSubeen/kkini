import Link from "next/link";
import { connection } from "next/server";
import { QueryTabs } from "@/components/query-tabs";
import { Card, Metric, PageIntro, recipeTabs, SectionHeading, SegmentTabs } from "@/components/ui";
import {
  houseAlternatives,
  inheritAlternatives,
  investAlternatives,
  taxAlternatives,
  welfareAlternatives,
  type Note,
} from "@/domain/finance";
import { shortMoney } from "@/lib/format/money";
import { getLatestState } from "@/server";

export const instant = false;

const tabs = [
  { id: "tax", label: "세금·연말정산" },
  { id: "welfare", label: "복지 혜택" },
  { id: "invest", label: "투자" },
  { id: "house", label: "집·부동산" },
  { id: "inherit", label: "상속·증여" },
];

const toneLabel = { good: "혜택", warn: "주의", info: "알아두기" } as const;

function NoteList({ notes }: { notes: Note[] }) {
  return (
    <div className="section-stack">
      {notes.map((note) => (
        <Card key={note.title} className="section-stack">
          <SectionHeading title={note.title} action={<span className="report-card__tag">{toneLabel[note.tone]}</span>} />
          <p style={{ margin: 0, color: "var(--kkini-muted)", fontSize: 14, lineHeight: 1.6 }}>{note.body}</p>
        </Card>
      ))}
    </div>
  );
}

const depText = (age: number | null) => (age === null ? "95세까지 유지" : `${age}세 고갈`);

export default async function AlternativesPage({ searchParams }: { searchParams: Promise<{ tab?: string; ratio?: string }> }) {
  await connection();
  const params = await searchParams;
  const tab = tabs.some((item) => item.id === params.tab) ? (params.tab as string) : "tax";
  const { profile, selection } = await getLatestState();

  if (!profile) {
    return (
      <div className="page-stack">
        <SegmentTabs items={recipeTabs} current="/recipe/alternatives" />
        <PageIntro eyebrow="분야별 대안" title="분야별로 더 살펴볼 방법" description="내 정보를 입력하면 세금·복지·투자·집·상속 대안을 계산해 드려요." />
        <Card tone="green" className="section-stack"><Link className="button" href="/onboarding">내 정보 입력하기</Link></Card>
      </div>
    );
  }

  const sel = selection ?? undefined;
  let body: React.ReactNode = null;

  if (tab === "tax") {
    const tax = taxAlternatives(profile);
    body = (
      <>
        <Card tone="green" className="section-stack">
          <SectionHeading title="카드 결제 순서만 바꾸면" action={<strong>{tax.card.gain >= 1 ? `연 +${Math.round(tax.card.gain)}만 원` : "변화 없음"}</strong>} />
          <div className="metric-grid">
            <Metric label="공제 문턱(연봉의 25%)" value={`${Math.round(tax.card.threshold).toLocaleString("ko-KR")}만`} />
            <Metric label="1년 카드·현금 사용" value={`${Math.round(tax.card.spend).toLocaleString("ko-KR")}만`} hint="미입력 시 생활비×12" />
            <Metric label="지금 방식 환급" value={`${Math.round(tax.card.currentRefund)}만`} />
            <Metric label="순서를 바꾸면" value={`${Math.round(tax.card.optimizedRefund)}만`} status="good" />
          </div>
          <p className="notice">문턱까지 {Math.round(tax.card.creditUntilThreshold).toLocaleString("ko-KR")}만 원은 신용카드, 나머지는 체크카드·현금영수증으로. 같은 돈을 쓰고 환급만 늘어요(한계세율 약 {Math.round(tax.marginalRate * 1000) / 10}%).</p>
        </Card>
        <Card className="section-stack">
          <SectionHeading title="연금계좌 세액공제" action={<span className="report-card__tag">세액공제 {Math.round(tax.pension.creditRate * 1000) / 10}%</span>} />
          <div className="metric-grid">
            <Metric label="올해 납입" value={`${Math.round(tax.pension.paid)}만`} />
            <Metric label="남은 한도" value={`${Math.round(tax.pension.room)}만`} hint="연금저축+IRP 900만 원" />
          </div>
          <p className="notice">한도를 채우면 연 약 {Math.round(tax.pension.extraCreditIfFilled)}만 원을 더 돌려받지만, 흑자 전환 뒤에 채워요.</p>
        </Card>
        <NoteList notes={tax.notes} />
      </>
    );
  } else if (tab === "welfare") {
    const welfare = welfareAlternatives(profile);
    body = (
      <div className="section-stack">
        {welfare.items.map((item) => (
          <Card key={item.title} className="section-stack">
            <SectionHeading title={item.title} action={<span className="report-card__tag">{item.status}</span>} />
            <p style={{ margin: 0, color: "var(--kkini-muted)", fontSize: 14, lineHeight: 1.6 }}>{item.body}</p>
            <a className="text-button" href={item.url} target="_blank" rel="noopener noreferrer">공식 기관에서 확인</a>
          </Card>
        ))}
        <p className="notice">복지 수급은 재산 평가와 제도 변경에 따라 달라져 장기 계산에는 넣지 않았어요.</p>
      </div>
    );
  } else if (tab === "invest") {
    const invest = investAlternatives(profile, sel);
    const total = invest.buckets.reduce((sum, bucket) => sum + bucket.amount, 0) || 1;
    const risky = invest.buckets.reduce((sum, bucket) => sum + (bucket.amount * bucket.riskRate) / 100, 0);
    body = (
      <>
        <Card tone="green" className="section-stack">
          <SectionHeading title="따르는 등급" action={<strong>{invest.finalGrade}</strong>} />
          <div className="metric-grid">
            <Metric label="투자성향(기본 설문)" value={invest.profileGrade} hint="57점 기준" />
            <Metric label="재무적 감수능력" value={invest.capacityGrade} hint={invest.capped ? "적자·비상자금 부족으로 제한" : "제한 없음"} status={invest.capped ? "warn" : "good"} />
          </div>
          <p className="notice">{invest.capped ? "지금 적자이거나 비상자금이 3개월 미만이라 감수능력을 안정추구형까지로 제한했어요. 흑자가 되면 제한이 풀려요." : "흑자이고 비상자금도 3개월 이상이라 감수능력 제한이 없어요."}</p>
        </Card>
        <Card className="section-stack">
          <SectionHeading title="쓰는 시점별 네 바구니" description={`위험자산 합계 ${shortMoney(risky)} (${Math.round((risky / total) * 100)}%)`} />
          {invest.buckets.map((bucket) => (
            <div className="bar-row" key={bucket.name}>
              <div className="bar-row__labels"><strong>{bucket.name}</strong><span>{shortMoney(bucket.amount)} · 위험자산 {bucket.riskRate}%</span></div>
              <div className="progress" aria-label={`${bucket.name} 위험자산 ${bucket.riskRate}%`}><span style={{ width: `${bucket.riskRate}%` }} /></div>
              <p style={{ margin: "4px 0 0", color: "var(--kkini-muted)", fontSize: 13 }}>{bucket.purpose}</p>
            </div>
          ))}
          <p className="notice">연금계좌 위험자산 한도는 70%(퇴직연금감독규정)예요. 이 배분은 연도별 계산의 수익률에 그대로 연결돼요. 특정 상품을 권유하지 않아요.</p>
        </Card>
      </>
    );
  } else if (tab === "house") {
    const ratio = [0.7, 0.6, 0.5].includes(Number(params.ratio)) ? Number(params.ratio) : 0.7;
    const house = houseAlternatives(profile, sel, ratio);
    body = !house.hasHome ? (
      <Card className="section-stack"><p style={{ margin: 0 }}>살고 있는 집 시세를 입력하면 집을 어떻게 쓸지 비교해 드려요.</p><Link className="button-secondary" href="/onboarding">집 시세 입력하기</Link></Card>
    ) : (
      <>
        <Card tone="green" className="section-stack">
          <SectionHeading title="가장 오래 버티는 방법" action={<strong>{house.bestName}</strong>} />
          <div className="metric-grid">
            <Metric label="집이 총자산에서 차지하는 비중" value={`${Math.round(house.homeShare * 100)}%`} status={house.homeShare > 0.7 ? "warn" : "good"} hint={house.homeShare > 0.7 ? "현금이 묶여 있어요" : "양호"} />
            <Metric label="팔 때 양도세" value={house.taxFree ? "비과세" : "12억 초과분 과세"} hint="1세대 1주택·2년 보유 가정" status={house.taxFree ? "good" : "warn"} />
            <Metric label="이사로 생기는 현금" value={shortMoney(house.move.cash - house.move.loanLeft)} hint={`비용 ${Math.round(house.move.cost).toLocaleString("ko-KR")}만 원 차감`} />
            <Metric label="주택연금 월액(추정)" value={`${Math.round(house.housingPensionMonthly)}만`} hint={`부부 중 연소자 ${house.youngerAge}세 기준`} />
          </div>
        </Card>
        <Card className="section-stack">
          <SectionHeading title="집을 쓰는 네 가지 방법" description={`새 집은 지금 집의 ${Math.round(ratio * 100)}%로 가정`} />
          {house.scenarios.map((scenario) => (
            <div className="bar-row" key={scenario.name}>
              <div className="bar-row__labels"><strong>{scenario.name}</strong><span>{depText(scenario.depletionAge)}</span></div>
              <p style={{ margin: "2px 0 0", color: "var(--kkini-muted)", fontSize: 13 }}>95세 금융·연금 {shortMoney(scenario.assetsAt95)} · 물려줄 집 {scenario.pension ? "최대 " : ""}{shortMoney(scenario.homeLeft)}{scenario.pension ? ` · 주택연금 누적 ${shortMoney(scenario.pensionReceived)}` : ""}</p>
            </div>
          ))}
          <div className="button-row">
            {[0.7, 0.6, 0.5].map((value) => <Link key={value} className={value === ratio ? "button" : "button-secondary"} href={`?tab=house&ratio=${value}`} scroll={false}>새 집 {Math.round(value * 100)}%</Link>)}
          </div>
          <p className="notice">집값 상승은 넣지 않았어요. 주택연금 ‘물려줄 집’은 집값에서 받은 돈을 뺀 최대치이고, 실제로는 이자·보증료만큼 더 줄어요. 이사는 가족이 정할 일이라 자동 추천에는 넣지 않아요.</p>
        </Card>
      </>
    );
  } else {
    const inherit = inheritAlternatives(profile, sel);
    body = (
      <>
        <Card tone="green" className="section-stack">
          <SectionHeading title="부모님 재산과 내 몫" />
          <div className="metric-grid">
            <Metric label="부모님 상속세(예상)" value={inherit.estate ? shortMoney(inherit.parentTax) : "입력 필요"} hint="신고공제 3% 반영" status={inherit.parentTax > 0 ? "warn" : "good"} />
            <Metric label={`내 몫 (형제 ${inherit.siblings}명)`} value={inherit.estate ? shortMoney(inherit.myShare) : "-"} hint="세금 뺀 뒤 똑같이 나눈다고 가정" />
            <Metric label="자녀 1인 지원 증여세" value={inherit.giftTax ? `${Math.round(inherit.giftTax).toLocaleString("ko-KR")}만` : "0원"} hint={`1인 ${Math.round(inherit.giftPerChild).toLocaleString("ko-KR")}만 원, 일반공제만`} status={inherit.giftTax ? "warn" : "good"} />
            <Metric label="내가 물려줄 때 상속세" value={shortMoney(inherit.myTax)} hint={`집 + 95세 남은 자산(지금 가치) ${shortMoney(inherit.myEstate)}`} />
          </div>
        </Card>
        <NoteList notes={inherit.notes} />
      </>
    );
  }

  return (
    <div className="page-stack">
      <SegmentTabs items={recipeTabs} current="/recipe/alternatives" />
      <PageIntro eyebrow="분야별 대안" title="분야별로 더 살펴볼 방법" description="추천 조합 밖에서 챙길 수 있는 세금·복지·투자·집·상속 선택지예요." />
      <QueryTabs items={tabs} current={tab} label="분야" />
      {body}
      <p className="notice">교육·모의설계용 추정이에요. 세법·제도는 2026.11 기준이며, 실제 결정 전 공식 기관과 전문가 확인이 필요해요.</p>
    </div>
  );
}
