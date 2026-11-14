"use client";

import Image from "next/image";
import { Check, ChevronDown, Home, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FinancialProfile, RecipeSelection } from "@/lib/contracts";
import { CalculationBasisDialog } from "./calculation-basis-dialog";
import { Card, Metric, PageIntro, recipeTabs, SectionHeading, SegmentTabs } from "./ui";

/** recipes: 이 재료를 고르면 계산에 켜지는 처방 id. 비어 있으면 계산에는 넣지 않고 설계 의도만 표시한다. */
type Ingredient = { id: string; name: string; meaning: string; image: string; recipes: string[] };
type Category = { id: string; label: string; title: string; description: string; max: number; ingredients: Ingredient[] };

// 재료 목록·제목·설명은 피그마 14~19번 화면, 재료와 처방의 연결은 '샌드위치 재료 설계 — 경제 용어 매칭 수정본'을 따른다.
export const categories: Category[] = [
  { id: "bread", label: "빵", title: "현재 재무 기반", description: "샌드위치 전체를 받치는 현재의 재무구조예요. 항상 한 종류를 선택해요.", max: 1, ingredients: [
    { id: "milk", name: "우유식빵", meaning: "수지균형형 가계", image: "/kkini/ingredients/bread/milk-bread.png", recipes: [] },
    { id: "wheat", name: "통밀빵", meaning: "흑자·저축여력형 가계", image: "/kkini/ingredients/bread/whole-wheat-bread.png", recipes: [] },
    { id: "rye", name: "호밀빵", meaning: "부동산 편중·고레버리지 가계", image: "/kkini/ingredients/bread/rye-bread.png", recipes: [] },
    { id: "baguette", name: "바게트", meaning: "적자 가계 · 현금흐름 개선 우선", image: "/kkini/ingredients/bread/baguette.png", recipes: [] },
  ]},
  { id: "spread", label: "소스", title: "돈을 관리하는 방식", description: "생활 습관과 관리 성향을 나타내요. 눈에 덜 보이지만 전체에 영향을 줘요.", max: 1, ingredients: [
    { id: "mayo", name: "마요네즈", meaning: "지출관리 · 생활비 10% 조정", image: "/kkini/ingredients/spread/mayonnaise.png", recipes: ["basic"] },
    { id: "mustard", name: "머스터드", meaning: "지출 최적화 · 카드 사용 순서", image: "/kkini/ingredients/spread/mustard.png", recipes: ["card"] },
    { id: "pesto", name: "페스토", meaning: "위험성향 기반 자산배분", image: "/kkini/ingredients/spread/pesto.png", recipes: [] },
    { id: "strawberry", name: "딸기잼", meaning: "중기 목적자금 · 자녀 결혼 등", image: "/kkini/ingredients/spread/strawberry-jam.png", recipes: [] },
    { id: "fig", name: "무화과잼", meaning: "세대 간 자산이전 · 상속·증여", image: "/kkini/ingredients/spread/fig-jam.png", recipes: [] },
    { id: "apricot", name: "살구잼", meaning: "노부모 부양 · 부모 지원 조정", image: "/kkini/ingredients/spread/apricot-jam.png", recipes: ["par"] },
  ]},
  { id: "main", label: "메인", title: "가장 중요한 재무 목표", description: "사용자가 고른 1순위 목표예요. 샌드위치에서 가장 존재감이 큰 재료예요.", max: 1, ingredients: [
    { id: "ham", name: "햄", meaning: "부양부담 관리 · 부모님 부양", image: "/kkini/ingredients/main/ham.png", recipes: [] },
    { id: "turkey", name: "칠면조햄", meaning: "디레버리징 · 빚 줄이기", image: "/kkini/ingredients/main/turkey-ham.png", recipes: [] },
    { id: "chicken", name: "닭가슴살", meaning: "노후소득 확보 · 내 노후", image: "/kkini/ingredients/main/chicken-breast.png", recipes: [] },
    { id: "egg", name: "달걀", meaning: "교육자금 설계 · 자녀 교육", image: "/kkini/ingredients/main/egg.png", recipes: [] },
    { id: "patty", name: "패티", meaning: "주택자산 유동화 · 집 활용", image: "/kkini/ingredients/main/patty.png", recipes: [] },
  ]},
  { id: "cheese", label: "치즈", title: "장기 준비 방법", description: "노후와 연금을 실제로 준비하는 방법이에요. 처방에 따라 0~2개가 들어갈 수 있어요.", max: 2, ingredients: [
    { id: "cheddar", name: "체더", meaning: "IRP 연 600만 원 · 세액공제", image: "/kkini/ingredients/cheese/cheddar.png", recipes: ["irp"] },
    { id: "swiss", name: "스위스", meaning: "퇴직연금 15년 나눠 받기", image: "/kkini/ingredients/cheese/swiss.png", recipes: ["dc15"] },
    { id: "mozzarella", name: "모차렐라", meaning: "국민연금 5년 연기 +36%", image: "/kkini/ingredients/cheese/mozzarella.png", recipes: ["np70"] },
    { id: "ricotta", name: "리코타", meaning: "임의가입·임의계속가입", image: "/kkini/ingredients/cheese/ricotta.png", recipes: ["spouse", "npcont"] },
    { id: "cream", name: "크림치즈", meaning: "은퇴 후 생활비 조정", image: "/kkini/ingredients/cheese/cream-cheese.png", recipes: ["retm"] },
    { id: "gouda", name: "고다", meaning: "정년 뒤 5년 재취업", image: "/kkini/ingredients/cheese/gouda.png", recipes: ["reemp"] },
    { id: "brie", name: "브리", meaning: "본인 주택연금", image: "/kkini/ingredients/cheese/brie.png", recipes: ["hp"] },
  ]},
  { id: "vegetable", label: "채소", title: "가족 안전망과 균형", description: "위험을 막거나 가족 상황을 보완하는 요소예요. 1~2종을 함께 넣을 수 있어요.", max: 2, ingredients: [
    { id: "lettuce", name: "양상추", meaning: "비상자금 6개월치", image: "/kkini/ingredients/vegetable/lettuce.png", recipes: [] },
    { id: "arugula", name: "루콜라", meaning: "보험 리모델링", image: "/kkini/ingredients/vegetable/arugula.png", recipes: ["ins"] },
    { id: "tomato", name: "토마토", meaning: "기초연금 확인·부모 지원 조정", image: "/kkini/ingredients/vegetable/tomato.png", recipes: ["par"] },
    { id: "cucumber", name: "오이", meaning: "교육비 부담 조정 · 장학금", image: "/kkini/ingredients/vegetable/cucumber.png", recipes: [] },
    { id: "avocado", name: "아보카도", meaning: "정기보험·5세대 실손", image: "/kkini/ingredients/vegetable/avocado.png", recipes: ["term", "sil5"] },
  ]},
  { id: "point", label: "포인트", title: "추가 혜택과 기회", description: "핵심 레시피에 더하면 좋은 보조 처방이에요. 최대 한 종류가 적당해요.", max: 1, ingredients: [
    { id: "pickle", name: "피클", meaning: "퇴직금으로 남은 대출 갚기", image: "/kkini/ingredients/point/pickle.png", recipes: ["prepay"] },
    { id: "nuts", name: "견과류", meaning: "분산투자 · 안전자산 비중", image: "/kkini/ingredients/point/nuts.png", recipes: [] },
    { id: "honey", name: "꿀", meaning: "ISA·공제 등 절세", image: "/kkini/ingredients/point/honey.png", recipes: ["isa"] },
    { id: "herbs", name: "허브", meaning: "놓친 복지 제도 찾기", image: "/kkini/ingredients/point/herbs.png", recipes: [] },
    { id: "sprout", name: "새싹", meaning: "자녀 청년미래적금", image: "/kkini/ingredients/point/microgreens.png", recipes: ["youth"] },
  ]},
];

type Selection = Record<string, string[]>;
type Preview = { monthlyCashFlow: number; depletionAge: number | null; assetsAt95: number; appliedRecipeIds?: string[]; notices?: string[] };

const emptySelection: Selection = { bread: [], spread: [], main: [], cheese: [], vegetable: [], point: [] };

/** 현재 진단으로 빵(재무 기반)을 고른다: 적자면 바게트, 집 비중이 70%를 넘으면 호밀빵, 흑자가 크면 통밀빵. */
function breadFor(profile: FinancialProfile | null, monthlyCashFlow: number | null) {
  if (!profile) return "milk";
  if (monthlyCashFlow !== null && monthlyCashFlow < 0) return "baguette";
  const total = profile.homeValue + profile.deposits + profile.investments + profile.retirementPensionBalance + profile.personalPensionBalance + profile.otherAssets;
  if (total > 0 && profile.homeValue / total > 0.7) return "rye";
  return monthlyCashFlow !== null && monthlyCashFlow > 50 ? "wheat" : "milk";
}

/** 저장된 처방 id를 재료 선택으로 되돌린다. 재료의 처방이 모두 켜져 있을 때만 그 재료를 고른 것으로 본다. */
function selectionFromRecipes(ids: string[]): Selection {
  const set = new Set(ids);
  const next: Selection = { ...emptySelection };
  categories.forEach((category) => {
    const picked = category.ingredients
      .filter((item) => item.recipes.length > 0 && item.recipes.every((id) => set.has(id) || (id === "npcont" && set.has("spouse")) || (id === "spouse" && set.has("npcont"))))
      .map((item) => item.id);
    next[category.id] = picked.slice(0, category.max);
  });
  return next;
}

function recipesFromSelection(selected: Selection) {
  const ids = new Set<string>();
  categories.forEach((category) => {
    category.ingredients.forEach((item) => {
      if (selected[category.id]?.includes(item.id)) item.recipes.forEach((id) => ids.add(id));
    });
  });
  return [...ids];
}

const won = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(Math.round(value)).toLocaleString("ko-KR")}만 원`;
const eok = (value: number) => `${value < 0 ? "−" : ""}${(Math.abs(value) / 10000).toFixed(1)}억 원`;

export function RecipeBuilder({
  initialProfile = null,
  initialSelection = null,
  reportCase,
}: {
  initialProfile?: FinancialProfile | null;
  initialSelection?: RecipeSelection | null;
  reportCase?: { monthlyCashFlow: number; depletionAge: number | null; assetsAt95: number };
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState("bread");
  const [selected, setSelected] = useState<Selection>(() =>
    initialSelection ? selectionFromRecipes(initialSelection.selectedRecipeIds) : { ...emptySelection },
  );
  const [reportOpen, setReportOpen] = useState(false);
  const [downsizing, setDownsizing] = useState(initialSelection?.selectedRecipeIds.includes("down") ?? false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [base, setBase] = useState<Preview | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [recommended, setRecommended] = useState<string[]>([]);
  const [recommendNote, setRecommendNote] = useState("");
  const [finding, setFinding] = useState(false);
  const requestId = useRef(0);
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];

  const selectedIngredients = useMemo(() => categories.flatMap((group) => group.ingredients.filter((item) => selected[group.id]?.includes(item.id))), [selected]);
  const selectedRecipeIds = useMemo(() => {
    const ids = recipesFromSelection(selected);
    if (downsizing) return [...ids.filter((id) => id !== "hp"), "down"];
    return ids;
  }, [selected, downsizing]);
  // 주택연금(브리)과 '본인 주택연금' 체크는 같은 처방이다.
  const reverseMortgage = selected.cheese?.includes("brie") ?? false;

  const calculate = useCallback(async (recipeIds: string[]) => {
    if (!initialProfile) return null;
    const response = await fetch("/api/calculate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        profile: initialProfile,
        recipeSelection: {
          selectedRecipeIds: recipeIds,
          housing: { downsizingRatio: 0.7, downsizingAge: null, reverseMortgageEnabled: false },
        },
        persist: false,
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message ?? "계산하지 못했어요.");
    return payload.result as Preview;
  }, [initialProfile]);

  // 지금 그대로의 결과(빵 자동 선택에도 쓴다)
  useEffect(() => {
    let active = true;
    calculate([]).then((result) => {
      if (!active || !result) return;
      setBase(result);
      setSelected((current) => (current.bread?.length ? current : { ...current, bread: [breadFor(initialProfile, result.monthlyCashFlow)] }));
    }).catch(() => undefined);
    return () => { active = false; };
  }, [calculate, initialProfile]);

  // 재료를 바꿀 때마다 바로 다시 계산(저장하지 않음)
  useEffect(() => {
    const id = ++requestId.current;
    const timer = setTimeout(() => {
      calculate(selectedRecipeIds)
        .then((result) => { if (result && id === requestId.current) setPreview(result); })
        .catch(() => undefined);
    }, 150);
    return () => clearTimeout(timer);
  }, [calculate, selectedRecipeIds]);

  function toggleIngredient(id: string) {
    setSelected((current) => {
      const values = current[category.id] ?? [];
      if (values.includes(id)) return { ...current, [category.id]: values.filter((value) => value !== id) };
      if (category.max === 1) return { ...current, [category.id]: [id] };
      return { ...current, [category.id]: [...values.slice(-(category.max - 1)), id] };
    });
    if (id === "brie") setDownsizing(false);
  }

  function setReverseMortgage(checked: boolean) {
    setSelected((current) => {
      const cheese = (current.cheese ?? []).filter((value) => value !== "brie");
      return { ...current, cheese: checked ? [...cheese.slice(-1), "brie"] : cheese };
    });
  }

  function toggleDownsizing(checked: boolean) {
    setDownsizing(checked);
    if (checked) setReverseMortgage(false);
  }

  async function findRecommendation() {
    if (!initialProfile) { router.push("/onboarding"); return; }
    setFinding(true);
    setRecommendNote("");
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profile: initialProfile }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message ?? "추천 조합을 찾지 못했어요.");
      const ids: string[] = payload.recipeIds ?? [];
      const next = selectionFromRecipes(ids);
      next.bread = selected.bread?.length ? selected.bread : [breadFor(initialProfile, base?.monthlyCashFlow ?? null)];
      next.main = selected.main ?? [];
      setSelected(next);
      setDownsizing(false);
      setRecommended(categories.flatMap((group) => next[group.id] ?? []));
      setRecommendNote(
        payload.alreadyOk
          ? "레시피 없이도 95세까지 버텨요. 남는 돈을 어떻게 굴릴지 분야별 대안에서 보세요."
          : payload.depletionAge === null
            ? `적자부터 막고 효과가 큰 순서로 ${ids.length}개를 골랐어요. 이번 달 ${won(payload.monthlyCashFlow)}, 95세에 ${eok(payload.assetsAt95)}이 남아요. 주택연금·보험처럼 가족 동의나 계약이 필요한 재료는 직접 더해 보세요.`
            : `자동으로 고를 수 있는 재료를 모두 더해도 ${payload.depletionAge}세에 바닥나요. 브리(주택연금)·아보카도(정기보험) 같은 재료를 직접 더해 보세요.`,
      );
    } catch (caught) {
      setRecommendNote(caught instanceof Error ? caught.message : "잠시 후 다시 시도해 주세요.");
    } finally {
      setFinding(false);
    }
  }

  async function saveRecipe() {
    setSaving(true);
    setSaveError("");
    try {
      let profile = initialProfile;
      if (!profile) {
        const profileResponse = await fetch("/api/profile/latest", { cache: "no-store" });
        const profilePayload = await profileResponse.json();
        if (!profileResponse.ok) {
          if (profileResponse.status === 404) router.push("/onboarding");
          throw new Error(profilePayload?.error?.message ?? "저장된 정보를 불러오지 못했어요.");
        }
        profile = profilePayload.profile;
      }
      const calculateResponse = await fetch("/api/calculate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profile,
          recipeSelection: {
            selectedRecipeIds,
            housing: { downsizingRatio: 0.7, downsizingAge: null, reverseMortgageEnabled: false },
          },
          persist: true,
        }),
      });
      const calculatePayload = await calculateResponse.json();
      if (!calculateResponse.ok) {
        throw new Error(calculatePayload?.error?.message ?? "레시피 결과를 저장하지 못했어요.");
      }
      router.push("/recipe/plan");
      router.refresh();
    } catch (caught) {
      setSaveError(caught instanceof Error ? caught.message : "잠시 후 다시 시도해 주세요.");
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <SegmentTabs items={recipeTabs} current="/recipe" />
      <PageIntro eyebrow="추천 조합" title="내 재무 레시피를 샌드위치로 만들어요" description="진단 결과와 목표를 바탕으로 여섯 가지 재료를 하나씩 골라요." trailing={<span className="report-card__tag">{selectedIngredients.length}개 선택</span>} />

      <div className="button-row">
        <button className="button" type="button" disabled={finding} aria-busy={finding} onClick={findRecommendation}><Sparkles size={18} aria-hidden="true" /> {finding ? "찾는 중…" : "추천 조합 찾기"}</button>
        <button className="button-secondary" type="button" aria-expanded={reportOpen} onClick={() => setReportOpen((value) => !value)}>
          보고서 추천안 불러오기 <ChevronDown size={18} aria-hidden="true" />
        </button>
      </div>
      {recommendNote ? <p className="notice" role="status">{recommendNote}</p> : null}

      {reportOpen ? (
        <Card tone="warm" className="report-card">
          <div className="report-card__tag">제출 보고서의 고정 사례</div>
          <div><strong style={{ fontSize: 19 }}>김샌드 씨 · 보고서 추천안</strong><p style={{ margin: "4px 0 0", color: "var(--kkini-muted)", fontSize: 14 }}>생활비·보험·부모 지원 조정, 정기보험, 재취업, 주택연금 월 141만 원, 은퇴 생활비 조정, 국민연금 임의계속가입. 버튼을 눌러도 내 입력값과 아래 레시피 선택은 바뀌지 않아요.</p></div>
          <div className="report-card__metrics">
            <div className="report-card__metric"><span>정기 월수지</span><strong style={{ color: "var(--kkini-red)" }}>약 {won(reportCase?.monthlyCashFlow ?? -12)}</strong></div>
            <div className="report-card__metric"><span>95세 금융·연금 자산</span><strong>약 {eok(reportCase?.assetsAt95 ?? 32000)}</strong></div>
          </div>
        </Card>
      ) : null}

      <div className="builder-stage" aria-label={`현재 ${selectedIngredients.length}개 재료로 조립한 샌드위치`}>
        <span className="builder-stage__badge">조립 중</span>
        <span className="builder-stage__plate">
          <Image src="/kkini/plate.png" alt="" fill sizes="(max-width: 540px) 96vw, 430px" loading="eager" />
        </span>
        <div className="builder-layers">
          {selectedIngredients.map((item, index) => (
            <span
              className="builder-layer"
              style={{ "--layer-bottom": `${index * 14}px` } as React.CSSProperties}
              key={`${item.id}-${index}`}
            >
              <Image src={item.image} alt={item.name} fill sizes="(max-width: 540px) 88vw, 390px" loading="eager" />
            </span>
          ))}
        </div>
      </div>

      {preview ? (
        <Card className="section-stack">
          <SectionHeading title="이 조합으로 계산하면" description={base ? `지금 그대로: 이번 달 ${won(base.monthlyCashFlow)} · ${base.depletionAge === null ? "95세까지 유지" : `${base.depletionAge}세 고갈`}` : undefined} />
          <div className="metric-grid">
            <Metric label="이번 달 월수지" value={won(preview.monthlyCashFlow)} hint="연말정산 환급 제외" status={preview.monthlyCashFlow >= 0 ? "good" : "warn"} />
            <Metric label="금융자산" value={preview.depletionAge === null ? "95세까지 유지" : `${preview.depletionAge}세 고갈`} status={preview.depletionAge === null ? "good" : "risk"} />
            <Metric label="95세 금융·연금 자산" value={eok(preview.assetsAt95)} status={preview.assetsAt95 >= 0 ? "good" : "risk"} />
          </div>
        </Card>
      ) : null}

      <div className="ingredient-tabs" role="tablist" aria-label="재료 카테고리">
        {categories.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={item.id === categoryId} data-active={item.id === categoryId} onClick={() => setCategoryId(item.id)}>{item.label}</button>
        ))}
      </div>

      <section className="section-stack" role="tabpanel">
        <SectionHeading title={category.title} description={category.description} action={<span className="report-card__tag">{category.max === 1 ? "1개 선택" : `최대 ${category.max}개`}</span>} />
        <div className="ingredient-grid">
          {category.ingredients.map((item) => {
            const isSelected = selected[category.id]?.includes(item.id) ?? false;
            const tag = category.id === "bread" && base && breadFor(initialProfile, base.monthlyCashFlow) === item.id
              ? "진단 추천"
              : recommended.includes(item.id) ? "추천" : item.recipes.length === 0 && category.id !== "bread" && category.id !== "main" ? "계산 제외" : null;
            return (
              <button className="ingredient-card" type="button" key={item.id} data-selected={isSelected} aria-pressed={isSelected} onClick={() => toggleIngredient(item.id)}>
                <span className="ingredient-card__image"><Image src={item.image} alt="" fill sizes="(max-width: 374px) 42vw, 230px" loading="eager" /></span>
                <div><strong>{item.name}</strong><span>{item.meaning}</span></div>
                {isSelected ? <span className="ingredient-card__check"><Check size={18} aria-hidden="true" /> 선택됨</span> : tag ? <span className="report-card__tag">{tag}</span> : null}
              </button>
            );
          })}
        </div>
        {category.id === "bread" || category.id === "main" ? <p className="notice">빵과 메인은 우리 집 상황과 목표를 나타내는 재료라 결과 숫자는 바뀌지 않아요.</p> : null}
      </section>

      <Card className="section-stack">
        <SectionHeading title="주택 활용 방법" description="두 선택은 같은 집을 기준으로 동시에 적용하지 않아요." action={<Home size={22} color="var(--kkini-green-700)" aria-hidden="true" />} />
        <div className="choice-list">
          <label className="choice"><input type="checkbox" checked={reverseMortgage} disabled={downsizing} onChange={(event) => setReverseMortgage(event.target.checked)} /><span className="choice__copy"><strong>본인 주택연금 (브리)</strong><span>부부 중 나이 적은 분 기준 월액을 65세부터 노후 소득으로 반영</span></span></label>
          <label className="choice"><input type="checkbox" checked={downsizing} onChange={(event) => toggleDownsizing(event.target.checked)} /><span className="choice__copy"><strong>집 줄여 이사</strong><span>정년 때 새 집은 현재 집 가격의 70%로 가정, 세금·중개보수·이사비 차감</span></span></label>
        </div>
        {downsizing ? <p className="notice notice--warn">이사 후 주택연금은 새 집 기준으로 월액을 다시 확인해 주세요.</p> : null}
      </Card>

      {preview?.notices?.length ? <ul className="notice" style={{ margin: 0, paddingLeft: 18 }}>{preview.notices.slice(1).map((notice) => <li key={notice}>{notice}</li>)}</ul> : null}
      {saveError ? <p className="notice notice--warn" role="alert">{saveError}</p> : null}
      <div className="button-row"><CalculationBasisDialog /><button className="button" type="button" disabled={saving} aria-busy={saving} onClick={saveRecipe}>{saving ? "저장 중…" : "이 조합으로 결과 보기"}</button></div>
    </div>
  );
}
