"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { ProgressBar } from "./ui";

const promises = [
  { title: "이 앱은 계산 도구예요", description: "AI가 숫자를 계산하고 정리해요. 최종 결정은 나와 가족, 재무설계사가 함께 해요." },
  { title: "상품을 팔지 않아요", description: "특정 금융회사 상품을 권하지 않아요. 제도와 생활 습관부터 처방해요." },
  { title: "숫자는 추정이에요", description: "세법과 제도는 바뀔 수 있어요. 계산 근거와 출처를 공개하고 공식 조회가 필요한 값은 따로 알려 드려요." },
] as const;

const goals = [
  { id: "parents", title: "부모님 부양", description: "부모님 생활비·요양 걱정", symbol: "부" },
  { id: "education", title: "자녀 교육", description: "대학 등록금·학원비", symbol: "자" },
  { id: "retirement", title: "내 노후", description: "정년 뒤 생활비·연금", symbol: "나" },
  { id: "home", title: "집 지키기", description: "지금 집에서 계속 살기", symbol: "집" },
  { id: "legacy", title: "자녀에게 물려주기", description: "상속·결혼 지원", symbol: "선" },
  { id: "debt", title: "빚 줄이기", description: "대출·마이너스통장", symbol: "빚" },
] as const;

function SetupProgress({ current }: { current: 1 | 2 }) {
  return <div className="setup-progress"><span>{current} / 3</span><ProgressBar value={(current / 3) * 100} label={`상담 시작 ${current}/3단계`} /></div>;
}

export function ConsentStep() {
  const router = useRouter();
  const [checked, setChecked] = useState<boolean[]>(promises.map(() => false));
  const complete = checked.every(Boolean);

  useEffect(() => { router.prefetch("/consultation/goals"); }, [router]);

  return (
    <main className="setup-page">
      <SetupProgress current={1} />
      <header className="setup-intro">
        <div className="setup-intro__title"><Image src="/kkini/logo-symbol.png" alt="" width={42} height={39} priority /><h1>시작하기 전에<br className="mobile-break" /> 약속할게요</h1></div>
        <p>재무설계는 고객과 설계사가 서로 무엇을 하는지 합의하는 데서 시작해요. 아래 세 가지를 확인해 주세요.</p>
      </header>
      <div className="promise-list">
        {promises.map((item, index) => (
          <label className="promise-card" data-checked={checked[index]} key={item.title}>
            <input type="checkbox" checked={checked[index]} onChange={(event) => setChecked((values) => values.map((value, itemIndex) => itemIndex === index ? event.target.checked : value))} />
            <span className="promise-card__box" aria-hidden="true">{checked[index] ? <Check size={17} /> : null}</span>
            <span><strong>{item.title}</strong><small>{item.description}</small></span>
          </label>
        ))}
      </div>
      <p className="setup-privacy">입력 정보와 진단 결과는 로그인한 계정에 안전하게 저장되며 다른 사용자는 볼 수 없어요.</p>
      <button className="button setup-primary" type="button" disabled={!complete} onClick={() => router.push("/consultation/goals")}>모두 확인했어요 <ChevronRight size={18} aria-hidden="true" /></button>
    </main>
  );
}

export function GoalStep() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => { router.prefetch("/onboarding"); }, [router]);

  function toggle(id: string) {
    setSelected((values) => values.includes(id) ? values.filter((value) => value !== id) : values.length < 3 ? [...values, id] : values);
  }

  function next() {
    window.sessionStorage.setItem("kkini:selected-goals", JSON.stringify(selected));
    router.push("/onboarding");
  }

  return (
    <main className="setup-page">
      <SetupProgress current={2} />
      <header className="setup-intro"><p className="eyebrow">목표 정하기</p><h1>우리 집에서 가장<br />중요한 건 뭔가요?</h1><p>중요한 순서대로 세 가지까지 골라 주세요. 처방을 고를 때 이 순서를 존중해요.</p></header>
      <div className="goal-list" role="group" aria-label="재무 목표 선택">
        {goals.map((goal) => {
          const order = selected.indexOf(goal.id);
          return (
            <button className="goal-card" data-selected={order >= 0} type="button" key={goal.id} onClick={() => toggle(goal.id)} aria-pressed={order >= 0}>
              <span className="goal-card__symbol">{goal.symbol}</span><span className="goal-card__copy"><strong>{goal.title}</strong><small>{goal.description}</small></span>
              <span className="goal-card__order" aria-label={order >= 0 ? `${order + 1}순위` : "선택 안 됨"}>{order >= 0 ? order + 1 : "+"}</span>
            </button>
          );
        })}
      </div>
      <button className="button setup-primary" type="button" disabled={selected.length === 0} onClick={next}>{selected.length ? `${selected.length}개 목표로 계속하기` : "목표를 선택해 주세요"} <ChevronRight size={18} aria-hidden="true" /></button>
    </main>
  );
}
