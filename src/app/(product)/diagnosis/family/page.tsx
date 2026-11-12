import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Card, diagnosisTabs, Metric, PageIntro, ProgressBar, SectionHeading, SegmentTabs } from "@/components/ui";
import { familyView } from "@/domain/finance";
import { shortMoney } from "@/lib/format/money";
import { getLatestState } from "@/server";

export const instant = false;

export default async function FamilyPage() {
  await connection();
  const { profile, selection } = await getLatestState();

  if (!profile) {
    return (
      <div className="page-stack">
        <SegmentTabs items={diagnosisTabs} current="/diagnosis/family" />
        <PageIntro eyebrow="가족 안전망" title="세 세대를 한 장에 연결해요" description="내 정보를 입력하면 가족 재무상태표와 필요 보장액을 계산해 드려요." />
        <Card tone="green" className="section-stack">
          <SectionHeading title="아직 저장된 정보가 없어요" />
          <Link className="button" href="/onboarding">내 정보 입력하기</Link>
        </Card>
      </div>
    );
  }

  const view = familyView(profile, selection ?? undefined);
  const need = view.protection.need;
  const have = view.protection.have;
  const gap = view.protection.gap;
  const haveRate = need > 0 ? Math.round((have / need) * 100) : 100;
  const children = view.childrenAges.length ? view.childrenAges.map((age) => `${age}세`).join(" · ") : "없음";
  const parentNote =
    view.monthlyParentSupport <= 0
      ? "지금 부모님께 정기적으로 보내는 돈은 없어요."
      : view.parentHome > 0
        ? `부모님 집으로 주택연금을 받으면 월 약 ${Math.round(view.parentPensionMonthly)}만 원이 생겨 ${view.supportAfterParentPension <= 0 ? "월 지원금을 끝낼 수 있어요" : `월 지원금을 ${Math.round(view.supportAfterParentPension)}만 원으로 줄일 수 있어요`}. 가족 동의가 필요해요.`
        : "부모님 집이 없어 부모님 주택연금은 대상이 아니에요.";

  return (
    <div className="page-stack">
      <SegmentTabs items={diagnosisTabs} current="/diagnosis/family" />
      <PageIntro eyebrow="가족 안전망" title="세 세대를 한 장에 연결했어요" description="부모님, 우리 집, 자녀의 돈이 어디서 오가고 있는지 확인해요." />
      <Card tone="warm"><strong>내 입력으로 계산했어요</strong><p style={{ margin: "4px 0 0", color: "var(--kkini-muted)", fontSize: 14 }}>부모님 재산과 형제 수는 입력값, 주택연금 월액은 공식 일람표 기준 추정이에요. 상속 몫은 형제 수로 나눈 단순값이고 상속세는 빼지 않았어요.</p></Card>
      <Card tone="green" className="section-stack">
        <SectionHeading title="가족 재무상태표" action={<span className="report-card__tag">순자산 {shortMoney(view.familyNetWorth)}</span>} />
        <strong style={{ fontSize: 20 }}>{view.monthlyParentSupport > 0 ? `매달 ${Math.round(view.monthlyParentSupport)}만 원이 부모님께 가요` : "세대 사이에 매달 오가는 돈이 없어요"}</strong>
        <div className="family-map">
          <div className="family-person"><Image src="/kkini/family/parents.png" alt="부모님" width={68} height={62} /><div><strong>부모님</strong><span>재산 {shortMoney(view.parentEstate)}</span></div></div>
          <div className="family-person"><Image src="/kkini/family/our-home.png" alt="우리 집" width={68} height={62} /><div><strong>우리 집</strong><span>순자산 {shortMoney(view.ourNetWorth)}</span></div></div>
          <div className="family-person"><Image src="/kkini/family/children.png" alt="자녀" width={68} height={62} /><div><strong>자녀</strong><span>{children}</span></div></div>
        </div>
        <p style={{ margin: 0, color: "var(--kkini-muted)", fontSize: 13 }}>{parentNote}</p>
      </Card>
      <div className="metric-grid">
        <Metric label="전체 순자산" value={shortMoney(view.familyNetWorth)} hint="부모+우리 집" />
        <Metric label="세대 간 이전" value={`월 ${Math.round(view.monthlyParentSupport)}만`} hint="나 → 부모님" status={view.monthlyParentSupport > 0 ? "warn" : "good"} />
      </div>
      <Card className="section-stack">
        <SectionHeading title="가족이 버티는 데 필요한 돈" action={<strong style={{ color: gap > 0 ? "var(--kkini-red)" : "var(--kkini-green-700)" }}>{gap > 0 ? `${shortMoney(gap)} 부족` : "부족 없음"}</strong>} />
        <div><div className="bar-row__labels"><span>필요 보장액</span><strong>{shortMoney(need)}</strong></div><ProgressBar value={100} label={`필요 보장액 ${shortMoney(need)}`} /></div>
        <div><div className="bar-row__labels"><span>준비된 금액</span><strong>{shortMoney(have)}</strong></div><ProgressBar value={haveRate} label={`준비된 금액 ${shortMoney(have)}`} /></div>
        <p className="notice notice--warn">{gap > 0 ? `막내가 25세가 될 때까지 ${view.protection.yk}년만 필요한 돈이라, 부족분 ${shortMoney(gap)}은 평생 보장보다 기간을 정한 정기보험이 맞아요.` : "지금 준비된 금액으로 필요 보장액을 채워요. 보험은 중복 특약부터 정리해요."}</p>
      </Card>
    </div>
  );
}
