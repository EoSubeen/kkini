"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Card, PageIntro, ProgressBar, SectionHeading } from "./ui";

const steps = [
  ["가족", "함께 살림을 꾸리는 가족을 알려 주세요."],
  ["버는 돈", "세금과 4대보험을 뺀 실제 월 소득 기준이에요."],
  ["쓰는 돈", "생활비와 가족 지원 비용을 나눠 적어요."],
  ["가진 것과 빚", "자산은 현재 시세, 대출은 남은 원금이에요."],
  ["보험·상속", "모르는 항목은 비워도 괜찮아요."],
  ["복지 확인", "받을 수 있는 제도를 찾는 선택 정보예요."],
] as const;

function number(formData: FormData, key: string, fallback = 0) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function optionalNumber(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function Field({
  name,
  label,
  unit,
  required,
  defaultValue,
  min = 0,
  max,
}: {
  name: string;
  label: string;
  unit?: string;
  required?: boolean;
  defaultValue?: number | string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label}{unit ? ` (${unit})` : ""}
      </label>
      <input
        id={name}
        name={name}
        type={name === "displayName" ? "text" : "number"}
        inputMode={name === "displayName" ? undefined : "decimal"}
        min={name === "displayName" ? undefined : min}
        max={max}
        step={name.includes("Rate") || name.includes("Reduction") ? "0.1" : "1"}
        defaultValue={defaultValue}
        required={required}
      />
    </div>
  );
}

const selectStyle = {
  minHeight: 52,
  border: "1px solid var(--kkini-border)",
  borderRadius: 14,
  padding: "0 14px",
  background: "white",
};

export function OnboardingForm({ defaultName = "" }: { defaultName?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const formData = new FormData(event.currentTarget);
    const childrenAges = ["child1Age", "child2Age", "child3Age"]
      .map((key) => optionalNumber(formData, key))
      .filter((value): value is number => value !== null);
    const spouseAge = optionalNumber(formData, "spouseAge");
    const supportedParentAge = optionalNumber(formData, "supportedParentAge");

    const profile = {
      schemaVersion: 1,
      displayName: String(formData.get("displayName") ?? "").trim(),
      age: number(formData, "age"),
      spouseAge: spouseAge && spouseAge > 0 ? spouseAge : null,
      childrenAges,
      supportedParentAge:
        supportedParentAge && supportedParentAge > 0 ? supportedParentAge : null,
      parentNeedsCare: formData.get("parentNeedsCare") === "on",
      monthlyNetIncome: number(formData, "monthlyNetIncome"),
      annualGrossIncome: optionalNumber(formData, "annualGrossIncome"),
      spouseMonthlyNetIncome: number(formData, "spouseMonthlyNetIncome"),
      spouseRetirementAge: number(formData, "spouseRetirementAge", 60),
      retirementAge: number(formData, "retirementAge", 60),
      wagePeakAge: number(formData, "wagePeakAge", 56),
      wagePeakReductionRate: number(formData, "wagePeakReductionRate", 20) / 100,
      nationalPensionMonthly: optionalNumber(formData, "nationalPensionMonthly"),
      nationalPensionStartAge: number(formData, "nationalPensionStartAge", 65),
      spouseNationalPensionMonthly: number(formData, "spouseNationalPensionMonthly"),
      monthlyLivingExpense: number(formData, "monthlyLivingExpense"),
      monthlyInsurancePremium: number(formData, "monthlyInsurancePremium"),
      annualCardSpend: optionalNumber(formData, "annualCardSpend"),
      checkCardCashReceiptRate: number(formData, "checkCardCashReceiptRate") / 100,
      annualTraditionalMarketSpend: number(formData, "annualTraditionalMarketSpend"),
      annualTransitSpend: number(formData, "annualTransitSpend"),
      monthlyParentSupport: number(formData, "monthlyParentSupport"),
      parentSupportYears: number(formData, "parentSupportYears"),
      annualUniversityTuitionPerChild: optionalNumber(formData, "annualUniversityTuitionPerChild"),
      monthlyAcademyCostPerHighSchoolChild: optionalNumber(formData, "monthlyAcademyCostPerHighSchoolChild"),
      targetMonthlyRetirementExpense: optionalNumber(formData, "targetMonthlyRetirementExpense"),
      deposits: number(formData, "deposits"),
      investments: number(formData, "investments"),
      unsecuredDebt: number(formData, "unsecuredDebt"),
      homeValue: number(formData, "homeValue"),
      mortgageBalance: number(formData, "mortgageBalance"),
      mortgageRate: number(formData, "mortgageRate", 4.2) / 100,
      mortgageYearsRemaining: number(formData, "mortgageYearsRemaining"),
      retirementPensionBalance: number(formData, "retirementPensionBalance"),
      personalPensionBalance: number(formData, "personalPensionBalance"),
      monthlyPersonalPensionContribution: number(formData, "monthlyPersonalPensionContribution"),
      otherAssets: number(formData, "otherAssets"),
      deathBenefit: optionalNumber(formData, "deathBenefit"),
      cancerBenefit: optionalNumber(formData, "cancerBenefit"),
      hasIndemnityInsurance: formData.get("hasIndemnityInsurance") === "yes",
      indemnityInsuranceGeneration: String(formData.get("indemnityInsuranceGeneration") ?? "unknown"),
      monthlyIndemnityPremium: optionalNumber(formData, "monthlyIndemnityPremium"),
      parentEstateValue: optionalNumber(formData, "parentEstateValue"),
      parentHomeValue: optionalNumber(formData, "parentHomeValue"),
      bothParentsAlive: formData.get("bothParentsAlive") !== "no",
      siblingCountIncludingSelf: number(formData, "siblingCountIncludingSelf", 1),
      plannedGiftPerChild: number(formData, "plannedGiftPerChild"),
      parentsMonthlyRecognizedIncome: optionalNumber(formData, "parentsMonthlyRecognizedIncome"),
      householdPropertyMonthlyIncomeEquivalent: optionalNumber(
        formData,
        "householdPropertyMonthlyIncomeEquivalent",
      ),
    };

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profile, persist: true }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "입력 정보를 저장하지 못했어요.");
      }
      router.push("/diagnosis/current");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "잠시 후 다시 시도해 주세요.");
      setPending(false);
    }
  }

  return (
    <form className="page-stack" onSubmit={submit}>
      <PageIntro
        eyebrow={`정보 입력 · ${step + 1} / ${steps.length}`}
        title={steps[step][0]}
        description={steps[step][1]}
      />
      <ProgressBar
        value={((step + 1) / steps.length) * 100}
        label="재무 정보 입력 진행률"
      />

      <Card className="section-stack">
        <fieldset hidden={step !== 0} style={{ border: 0, padding: 0, margin: 0 }}>
          <SectionHeading title="우리 가족" description="필수 항목은 이름과 내 나이예요." />
          <div className="section-stack" style={{ marginTop: 16 }}>
            <Field name="displayName" label="부를 이름" defaultValue={defaultName} required />
            <Field name="age" label="내 나이" unit="세" min={25} max={80} required />
            <Field name="spouseAge" label="배우자 나이" unit="세" max={120} />
            <Field name="child1Age" label="첫째 자녀 나이" unit="세" max={120} />
            <Field name="child2Age" label="둘째 자녀 나이" unit="세" max={120} />
            <Field name="child3Age" label="셋째 자녀 나이" unit="세" max={120} />
            <Field name="supportedParentAge" label="지원하는 부모님 나이" unit="세" max={120} />
            <label className="choice">
              <input name="parentNeedsCare" type="checkbox" />
              <span className="choice__copy"><strong>부모님 돌봄이 필요해요</strong><span>식사·이동 등 일상생활 도움 기준</span></span>
            </label>
          </div>
        </fieldset>

        <fieldset hidden={step !== 1} style={{ border: 0, padding: 0, margin: 0 }}>
          <SectionHeading title="버는 돈" description="금액 단위는 만 원이에요." />
          <div className="section-stack" style={{ marginTop: 16 }}>
            <Field name="monthlyNetIncome" label="월 세후소득" unit="만 원" required />
            <Field name="annualGrossIncome" label="연봉" unit="만 원" />
            <Field name="spouseMonthlyNetIncome" label="배우자 월 세후소득" unit="만 원" />
            <Field name="spouseRetirementAge" label="배우자 정년" unit="세" defaultValue={60} max={80} />
            <Field name="retirementAge" label="내 정년" unit="세" defaultValue={60} max={80} />
            <Field name="wagePeakAge" label="임금피크 시작" unit="세" defaultValue={56} max={80} />
            <Field name="wagePeakReductionRate" label="임금 감소율" unit="%" defaultValue={20} max={100} />
            <Field name="nationalPensionMonthly" label="국민연금 예상 월액" unit="만 원" />
            <Field name="nationalPensionStartAge" label="국민연금 시작 나이" unit="세" defaultValue={65} max={80} />
            <Field name="spouseNationalPensionMonthly" label="배우자 국민연금 월액" unit="만 원" />
          </div>
        </fieldset>

        <fieldset hidden={step !== 2} style={{ border: 0, padding: 0, margin: 0 }}>
          <SectionHeading title="쓰는 돈" description="대출 원리금은 자산·빚 단계에서 계산해요." />
          <div className="section-stack" style={{ marginTop: 16 }}>
            <Field name="monthlyLivingExpense" label="월 생활비" unit="만 원" required />
            <Field name="monthlyInsurancePremium" label="월 보험료" unit="만 원" />
            <Field name="annualCardSpend" label="연 카드·현금영수증" unit="만 원" />
            <Field name="checkCardCashReceiptRate" label="체크카드·현금 비중" unit="%" max={100} />
            <Field name="annualTraditionalMarketSpend" label="연 전통시장 사용액" unit="만 원" />
            <Field name="annualTransitSpend" label="연 대중교통 사용액" unit="만 원" />
            <Field name="monthlyParentSupport" label="월 부모님 지원" unit="만 원" />
            <Field name="parentSupportYears" label="앞으로 지원할 기간" unit="년" max={50} />
            <Field name="annualUniversityTuitionPerChild" label="자녀 1명 대학 등록금" unit="만 원/년" defaultValue={823} />
            <Field name="monthlyAcademyCostPerHighSchoolChild" label="고교생 1명 학원비" unit="만 원/월" defaultValue={79} />
            <Field name="targetMonthlyRetirementExpense" label="은퇴 뒤 목표 생활비" unit="만 원/월" defaultValue={298} />
          </div>
        </fieldset>

        <fieldset hidden={step !== 3} style={{ border: 0, padding: 0, margin: 0 }}>
          <SectionHeading title="가진 것과 빚" description="금액 단위는 만 원이에요." />
          <div className="section-stack" style={{ marginTop: 16 }}>
            <Field name="deposits" label="예금·적금" unit="만 원" required />
            <Field name="investments" label="주식·펀드" unit="만 원" />
            <Field name="unsecuredDebt" label="신용대출·마이너스통장" unit="만 원" />
            <Field name="homeValue" label="집 시세" unit="만 원" />
            <Field name="mortgageBalance" label="주택담보대출 잔액" unit="만 원" />
            <Field name="mortgageRate" label="주택담보대출 금리" unit="%" defaultValue={4.2} max={100} />
            <Field name="mortgageYearsRemaining" label="대출 남은 기간" unit="년" max={50} />
            <Field name="retirementPensionBalance" label="퇴직연금 잔액" unit="만 원" />
            <Field name="personalPensionBalance" label="연금저축·IRP 잔액" unit="만 원" />
            <Field name="monthlyPersonalPensionContribution" label="월 개인연금 납입액" unit="만 원" />
            <Field name="otherAssets" label="자동차 등 기타 자산" unit="만 원" />
          </div>
        </fieldset>

        <fieldset hidden={step !== 4} style={{ border: 0, padding: 0, margin: 0 }}>
          <SectionHeading title="보험·상속" description="선택 정보이며 모르면 비워도 돼요." />
          <div className="section-stack" style={{ marginTop: 16 }}>
            <Field name="deathBenefit" label="사망보험금" unit="만 원" />
            <Field name="cancerBenefit" label="암 진단비" unit="만 원" />
            <div className="form-field"><label htmlFor="hasIndemnityInsurance">실손보험</label><select id="hasIndemnityInsurance" name="hasIndemnityInsurance" style={selectStyle} defaultValue="no"><option value="no">없음</option><option value="yes">있음</option></select></div>
            <div className="form-field"><label htmlFor="indemnityInsuranceGeneration">실손 세대</label><select id="indemnityInsuranceGeneration" name="indemnityInsuranceGeneration" style={selectStyle} defaultValue="unknown"><option value="unknown">모름</option><option value="1">1세대</option><option value="2">2세대</option><option value="3">3세대</option><option value="4">4세대</option><option value="5">5세대</option></select></div>
            <Field name="monthlyIndemnityPremium" label="월 실손 보험료" unit="만 원" />
            <Field name="parentEstateValue" label="부모님 재산" unit="만 원" />
            <Field name="parentHomeValue" label="부모님 집 시세" unit="만 원" />
            <div className="form-field"><label htmlFor="bothParentsAlive">부모님 두 분 모두 계신가요?</label><select id="bothParentsAlive" name="bothParentsAlive" style={selectStyle} defaultValue="yes"><option value="yes">예</option><option value="no">아니오</option></select></div>
            <Field name="siblingCountIncludingSelf" label="나를 포함한 형제자매" unit="명" defaultValue={1} min={1} max={20} />
            <Field name="plannedGiftPerChild" label="자녀 1명 결혼 지원 계획" unit="만 원" />
          </div>
        </fieldset>

        <fieldset hidden={step !== 5} style={{ border: 0, padding: 0, margin: 0 }}>
          <SectionHeading title="복지 확인용" description="복지 가능성을 대략 가늠하는 데만 사용해요." />
          <div className="section-stack" style={{ marginTop: 16 }}>
            <Field name="parentsMonthlyRecognizedIncome" label="부모님 월 소득인정액" unit="만 원" />
            <Field name="householdPropertyMonthlyIncomeEquivalent" label="우리 집 재산의 월 소득환산액" unit="만 원" />
            <p className="notice">입력값과 계산 결과는 로그인한 계정에 저장돼요. 다른 사용자는 볼 수 없어요.</p>
          </div>
        </fieldset>
      </Card>

      {error ? <p className="notice notice--warn" role="alert">{error}</p> : null}
      <div className="button-row">
        <button className="button-secondary" type="button" disabled={step === 0 || pending} onClick={() => setStep((value) => Math.max(0, value - 1))}>이전</button>
        {step < steps.length - 1 ? (
          <button className="button" type="button" onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}>다음</button>
        ) : (
          <button className="button" type="submit" disabled={pending} aria-busy={pending}>{pending ? "진단 중…" : "입력 끝내고 결과 보기"}</button>
        )}
      </div>
    </form>
  );
}
