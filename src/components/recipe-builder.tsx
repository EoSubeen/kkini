"use client";

import Image from "next/image";
import { Check, ChevronDown, Home, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CalculationBasisDialog } from "./calculation-basis-dialog";
import { Card, PageIntro, SectionHeading } from "./ui";

type Ingredient = { id: string; name: string; meaning: string; image: string };
type Category = { id: string; label: string; title: string; description: string; max: number; ingredients: Ingredient[] };

const categories: Category[] = [
  { id: "bread", label: "빵", title: "현재 재무 기반을 골라요", description: "우리 집의 지금 재무구조를 받치는 한 장이에요.", max: 1, ingredients: [
    { id: "milk", name: "우유식빵", meaning: "유연한 기본형", image: "/kkini/ingredients/bread/milk-bread.png" },
    { id: "wheat", name: "통밀빵", meaning: "꾸준한 저축 기반", image: "/kkini/ingredients/bread/whole-wheat-bread.png" },
    { id: "rye", name: "호밀빵", meaning: "부채·고정자산 중심", image: "/kkini/ingredients/bread/rye-bread.png" },
  ]},
  { id: "spread", label: "소스", title: "돈을 관리하는 방식을 골라요", description: "생활 습관과 목표가 전체 레시피에 스며들어요.", max: 1, ingredients: [
    { id: "mayo", name: "마요네즈", meaning: "익숙하고 단순한 관리", image: "/kkini/ingredients/spread/mayonnaise.png" },
    { id: "mustard", name: "머스터드", meaning: "효율과 절약 중심", image: "/kkini/ingredients/spread/mustard.png" },
    { id: "pesto", name: "페스토", meaning: "적극적인 자산 관리", image: "/kkini/ingredients/spread/pesto.png" },
    { id: "fig", name: "무화과잼", meaning: "장기적인 가족 이전", image: "/kkini/ingredients/spread/fig-jam.png" },
  ]},
  { id: "main", label: "메인", title: "가장 중요한 목표를 골라요", description: "샌드위치에서 가장 존재감이 큰 1순위 목표예요.", max: 1, ingredients: [
    { id: "chicken", name: "닭가슴살", meaning: "꾸준한 노후 준비", image: "/kkini/ingredients/main/chicken-breast.png" },
    { id: "egg", name: "달걀", meaning: "자녀 교육과 미래", image: "/kkini/ingredients/main/egg.png" },
    { id: "ham", name: "햄", meaning: "가족 부양", image: "/kkini/ingredients/main/ham.png" },
    { id: "patty", name: "패티", meaning: "큰 자산 활용", image: "/kkini/ingredients/main/patty.png" },
  ]},
  { id: "cheese", label: "치즈", title: "장기 준비 방법을 더해요", description: "노후와 연금을 실제로 준비하는 방법이에요.", max: 2, ingredients: [
    { id: "cheddar", name: "체더", meaning: "연금계좌 적립", image: "/kkini/ingredients/cheese/cheddar.png" },
    { id: "swiss", name: "스위스", meaning: "계획적인 연금 인출", image: "/kkini/ingredients/cheese/swiss.png" },
    { id: "mozzarella", name: "모차렐라", meaning: "연금 수령 시점 조정", image: "/kkini/ingredients/cheese/mozzarella.png" },
    { id: "ricotta", name: "리코타", meaning: "부족한 연금 보완", image: "/kkini/ingredients/cheese/ricotta.png" },
  ]},
  { id: "vegetable", label: "채소", title: "가족의 안전망을 채워요", description: "위험을 막고 가족의 균형을 지켜 주는 재료예요.", max: 2, ingredients: [
    { id: "lettuce", name: "양상추", meaning: "비상자금 6개월", image: "/kkini/ingredients/vegetable/lettuce.png" },
    { id: "arugula", name: "루콜라", meaning: "보험 구조 정리", image: "/kkini/ingredients/vegetable/arugula.png" },
    { id: "tomato", name: "토마토", meaning: "부모님 지원", image: "/kkini/ingredients/vegetable/tomato.png" },
    { id: "cucumber", name: "오이", meaning: "교육비 관리", image: "/kkini/ingredients/vegetable/cucumber.png" },
  ]},
  { id: "point", label: "포인트", title: "놓치기 쉬운 혜택을 챙겨요", description: "핵심 처방에 작은 기회를 한 가지 더해요.", max: 1, ingredients: [
    { id: "pickle", name: "피클", meaning: "부채 정리", image: "/kkini/ingredients/point/pickle.png" },
    { id: "nuts", name: "견과류", meaning: "투자 분산", image: "/kkini/ingredients/point/nuts.png" },
    { id: "honey", name: "꿀", meaning: "세금 혜택", image: "/kkini/ingredients/point/honey.png" },
    { id: "herbs", name: "허브", meaning: "놓친 제도 발견", image: "/kkini/ingredients/point/herbs.png" },
  ]},
];

const defaultSelection: Record<string, string[]> = {
  bread: ["rye"], spread: ["mustard"], main: ["chicken"], cheese: ["cheddar"], vegetable: ["lettuce", "tomato"], point: ["honey"],
};

const recipeByIngredient: Record<string, string> = {
  milk: "basic",
  wheat: "irp",
  rye: "prepay",
  mayo: "basic",
  mustard: "card",
  pesto: "isa",
  fig: "youth",
  chicken: "reemp",
  ham: "par",
  patty: "hp",
  cheddar: "irp",
  swiss: "dc15",
  mozzarella: "np70",
  ricotta: "spouse",
  arugula: "ins",
  tomato: "par",
  cucumber: "basic",
  pickle: "prepay",
  nuts: "isa",
  honey: "card",
};

export function RecipeBuilder() {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState("bread");
  const [selected, setSelected] = useState(defaultSelection);
  const [reportOpen, setReportOpen] = useState(false);
  const [downsizing, setDownsizing] = useState(false);
  const [reverseMortgage, setReverseMortgage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];

  const selectedIngredients = useMemo(() => categories.flatMap((group) => group.ingredients.filter((item) => selected[group.id]?.includes(item.id))), [selected]);

  function toggleIngredient(id: string) {
    setSelected((current) => {
      const values = current[category.id] ?? [];
      if (values.includes(id)) return { ...current, [category.id]: values.filter((value) => value !== id) };
      if (category.max === 1) return { ...current, [category.id]: [id] };
      return { ...current, [category.id]: [...values.slice(-(category.max - 1)), id] };
    });
  }

  function toggleDownsizing(checked: boolean) {
    setDownsizing(checked);
    if (checked) setReverseMortgage(false);
  }

  async function saveRecipe() {
    setSaving(true);
    setSaveError("");

    try {
      const profileResponse = await fetch("/api/profile/latest", { cache: "no-store" });
      const profilePayload = await profileResponse.json();
      if (!profileResponse.ok) {
        if (profileResponse.status === 404) router.push("/onboarding");
        throw new Error(profilePayload?.error?.message ?? "저장된 정보를 불러오지 못했어요.");
      }

      const selectedRecipeIds = Array.from(
        new Set(
          selectedIngredients
            .map((ingredient) => recipeByIngredient[ingredient.id])
            .filter((recipeId): recipeId is string => Boolean(recipeId)),
        ),
      );
      if (downsizing) selectedRecipeIds.push("down");
      if (reverseMortgage && !downsizing) selectedRecipeIds.push("hp");

      const calculateResponse = await fetch("/api/calculate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profile: profilePayload.profile,
          recipeSelection: {
            selectedRecipeIds: Array.from(new Set(selectedRecipeIds)),
            housing: {
              downsizingRatio: 0.7,
              downsizingAge: null,
              reverseMortgageEnabled: reverseMortgage && !downsizing,
            },
          },
          persist: true,
        }),
      });
      const calculatePayload = await calculateResponse.json();
      if (!calculateResponse.ok) {
        throw new Error(calculatePayload?.error?.message ?? "레시피 결과를 저장하지 못했어요.");
      }

      router.push("/diagnosis/current");
      router.refresh();
    } catch (caught) {
      setSaveError(caught instanceof Error ? caught.message : "잠시 후 다시 시도해 주세요.");
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <PageIntro eyebrow="추천 조합" title="내 재무 레시피를 샌드위치로 만들어요" description="진단 결과와 목표를 바탕으로 여섯 가지 재료를 하나씩 골라요." trailing={<span className="report-card__tag">{selectedIngredients.length}개 선택</span>} />

      <div className="button-row">
        <button className="button" type="button"><Sparkles size={18} aria-hidden="true" /> 추천 조합 찾기</button>
        <button className="button-secondary" type="button" aria-expanded={reportOpen} onClick={() => setReportOpen((value) => !value)}>
          보고서 추천안 불러오기 <ChevronDown size={18} aria-hidden="true" />
        </button>
      </div>

      {reportOpen ? (
        <Card tone="warm" className="report-card">
          <div className="report-card__tag">제출 보고서의 고정 사례</div>
          <div><strong style={{ fontSize: 19 }}>김샌드 씨 · 보고서 추천안</strong><p style={{ margin: "4px 0 0", color: "var(--kkini-muted)", fontSize: 14 }}>버튼을 눌러도 내 입력값과 아래 레시피 선택은 바뀌지 않아요.</p></div>
          <div className="report-card__metrics">
            <div className="report-card__metric"><span>정기 월수지</span><strong style={{ color: "var(--kkini-red)" }}>약 −12만 원</strong></div>
            <div className="report-card__metric"><span>95세 금융·연금 자산</span><strong>약 3.2억 원</strong></div>
          </div>
        </Card>
      ) : null}

      <div className="builder-stage" aria-label={`현재 ${selectedIngredients.length}개 재료로 조립한 샌드위치`}>
        <span className="builder-stage__badge">조립 중</span>
        <Image className="builder-stage__plate" src="/kkini/plate.png" alt="" width={430} height={145} />
        <div className="builder-layers">
          {selectedIngredients.map((item, index) => (
            <Image
              className="builder-layer"
              style={{ "--layer-bottom": `${index * 14}px` } as React.CSSProperties}
              key={`${item.id}-${index}`}
              src={item.image}
              alt={item.name}
              width={380}
              height={138}
            />
          ))}
        </div>
      </div>

      <div className="ingredient-tabs" role="tablist" aria-label="재료 카테고리">
        {categories.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={item.id === categoryId} data-active={item.id === categoryId} onClick={() => setCategoryId(item.id)}>{item.label}</button>
        ))}
      </div>

      <section className="section-stack" role="tabpanel">
        <SectionHeading title={category.title} description={category.description} action={<span className="report-card__tag">최대 {category.max}개</span>} />
        <div className="ingredient-grid">
          {category.ingredients.map((item) => {
            const isSelected = selected[category.id]?.includes(item.id) ?? false;
            return (
              <button className="ingredient-card" type="button" key={item.id} data-selected={isSelected} aria-pressed={isSelected} onClick={() => toggleIngredient(item.id)}>
                <Image src={item.image} alt="" width={150} height={92} />
                <div><strong>{item.name}</strong><span>{item.meaning}</span></div>
                {isSelected ? <span className="ingredient-card__check"><Check size={18} aria-hidden="true" /> 선택됨</span> : null}
              </button>
            );
          })}
        </div>
      </section>

      <Card className="section-stack">
        <SectionHeading title="주택 활용 방법" description="두 선택은 같은 집을 기준으로 동시에 적용하지 않아요." action={<Home size={22} color="var(--kkini-green-700)" aria-hidden="true" />} />
        <div className="choice-list">
          <label className="choice"><input type="checkbox" checked={reverseMortgage} disabled={downsizing} onChange={(event) => setReverseMortgage(event.target.checked)} /><span className="choice__copy"><strong>본인 주택연금</strong><span>현재 집 기준 월액을 노후 소득으로 반영</span></span></label>
          <label className="choice"><input type="checkbox" checked={downsizing} onChange={(event) => toggleDownsizing(event.target.checked)} /><span className="choice__copy"><strong>집 줄여 이사</strong><span>새 집은 현재 집 가격의 70%로 가정</span></span></label>
        </div>
        {downsizing ? <p className="notice notice--warn">이사 후 주택연금은 새 집 기준으로 월액을 다시 확인해 주세요.</p> : null}
      </Card>

      {saveError ? <p className="notice notice--warn" role="alert">{saveError}</p> : null}
      <div className="button-row"><CalculationBasisDialog /><button className="button" type="button" disabled={saving} aria-busy={saving} onClick={saveRecipe}>{saving ? "저장 중…" : "이 조합으로 결과 보기"}</button></div>
    </div>
  );
}
