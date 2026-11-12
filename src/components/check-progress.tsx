"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, checkTabs, PageIntro, ProgressBar, SectionHeading, SegmentTabs } from "./ui";

const initialItems = [
  { id: "expense", title: "생활비 10% 조정", description: "고정비와 구독 서비스부터 확인" },
  { id: "insurance", title: "보험 구조 정리", description: "중복 특약과 실손 세대 확인" },
  { id: "pension", title: "연금 계좌 확인", description: "IRP·연금저축 납입액 점검" },
  { id: "welfare", title: "받을 수 있는 제도 신청", description: "기초연금·장학금 가능성 확인" },
];

export function CheckProgress({ plannedAssets = [] }: { plannedAssets?: number[] }) {
  const [elapsed, setElapsed] = useState(1);
  const [actualAssets, setActualAssets] = useState("");
  const [review, setReview] = useState("");
  const [done, setDone] = useState(() => new Set<string>());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const percent = useMemo(() => Math.round((done.size / initialItems.length) * 100), [done]);

  useEffect(() => {
    let active = true;
    fetch("/api/checks", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message ?? "점검 항목을 불러오지 못했어요.");
        if (active) {
          setDone(new Set((payload.items ?? []).filter((item: { done: boolean }) => item.done).map((item: { key: string }) => item.key)));
        }
      })
      .catch((caught) => active && setError(caught instanceof Error ? caught.message : "점검 항목을 불러오지 못했어요."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  async function persist(next: Set<string>) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/checks", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: initialItems.map((item, index) => ({
            key: item.id,
            label: item.title,
            detail: item.description,
            done: next.has(item.id),
            sortOrder: index,
          })),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message ?? "점검 항목을 저장하지 못했어요.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "점검 항목을 저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  }

  function compare() {
    const actual = Number(actualAssets);
    const plan = plannedAssets[elapsed - 1];
    if (!actualAssets.trim() || !Number.isFinite(actual)) {
      setReview("지금 실제 금융자산(예금·투자에서 마이너스통장을 뺀 금액)을 만 원 단위로 넣어 주세요.");
      return;
    }
    if (plan === undefined) {
      setReview("먼저 내 정보를 입력해야 계획 금액을 계산할 수 있어요.");
      return;
    }
    const gap = actual - plan;
    const rate = plan !== 0 ? gap / Math.abs(plan) : 0;
    const planText = `${Math.round(plan).toLocaleString("ko-KR")}만 원`;
    if (rate < -0.1) {
      setReview(`계획(${elapsed}년 후 ${planText})보다 ${Math.round(-gap).toLocaleString("ko-KR")}만 원(${Math.round(-rate * 100)}%) 뒤처졌어요. 10% 넘게 뒤처졌으니 내 정보를 고치고 레시피를 다시 짜요.`);
    } else if (rate < 0) {
      setReview(`계획(${elapsed}년 후 ${planText})보다 조금 적지만 10% 안이에요. 지금 계획을 유지하고 다음 점검 때 다시 봐요.`);
    } else {
      setReview(`계획(${elapsed}년 후 ${planText})보다 ${Math.round(gap).toLocaleString("ko-KR")}만 원 앞서 있어요. 남는 돈은 비상자금 → 연금계좌 순서로 담아요.`);
    }
  }

  function toggle(id: string) {
    const next = new Set(done);
    if (next.has(id)) next.delete(id); else next.add(id);
    setDone(next);
    void persist(next);
  }

  return (
    <div className="page-stack">
      <SegmentTabs items={checkTabs} current="/check" />
      <PageIntro eyebrow="계획 추적" title="계획대로 가고 있나요?" description="한 일을 체크하고, 지금 금융자산이 계획과 얼마나 다른지 확인해요." />
      <Card tone="green" className="section-stack">
        <SectionHeading title="이번 달 진행률" action={<strong>{percent}%</strong>} />
        <ProgressBar value={percent} label="이번 달 계획 진행률" />
        <p style={{ margin: 0, color: "var(--kkini-muted)", fontSize: 14 }}>{loading ? "저장된 계획을 불러오는 중…" : saving ? "변경 내용을 저장하는 중…" : `${done.size}개 완료 · ${initialItems.length - done.size}개 남음`}</p>
      </Card>
      <section className="section-stack">
        <SectionHeading title="실행 체크리스트" description="끝낸 일은 바로 체크해 주세요." />
        <div className="checklist">
          {initialItems.map((item) => (
            <label className="check-item" key={item.id}>
              <input type="checkbox" checked={done.has(item.id)} disabled={loading || saving} onChange={() => toggle(item.id)} />
              <span><strong>{item.title}</strong><span>{item.description}</span></span>
            </label>
          ))}
        </div>
      </section>
      {error ? <p className="notice notice--warn" role="alert">{error}</p> : null}
      <Card className="section-stack">
        <SectionHeading title="계획 대비 실제 점검" />
        <div className="form-field"><label htmlFor="elapsed">설계 후 지난 기간</label><select id="elapsed" value={elapsed} onChange={(event) => setElapsed(Number(event.target.value))} style={{ minHeight: 52, border: "1px solid var(--kkini-border)", borderRadius: 14, padding: "0 14px", background: "white" }}><option value={1}>1년</option><option value={2}>2년</option><option value={3}>3년</option></select></div>
        <div className="form-field"><label htmlFor="actualAssets">지금 실제 금융자산</label><input id="actualAssets" inputMode="numeric" placeholder="금액 입력 (만 원)" value={actualAssets} onChange={(event) => setActualAssets(event.target.value)} /></div>
        <button className="button" type="button" onClick={compare}>계획과 비교하기</button>
        {review ? <p className="notice" role="status">{review}</p> : null}
      </Card>
      <p className="notice">정년·임금피크 변경, 부모님 요양 시작, 금리 1%p 이상 변화가 생기면 1년을 기다리지 말고 다시 설계해요.</p>
    </div>
  );
}
