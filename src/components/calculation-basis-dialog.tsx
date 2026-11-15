"use client";

import { Calculator, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

function BasisSection({ number, title, children, open = false }: { number: number; title: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="basis-section" open={open}>
      <summary><span>{number}</span><strong>{title}</strong><ChevronDown size={18} aria-hidden="true" /></summary>
      <div className="basis-section__content">{children}</div>
    </details>
  );
}

function BasisTable({ headings, rows }: { headings: string[]; rows: string[][] }) {
  return (
    <div className="basis-table-wrap" tabIndex={0} role="region" aria-label={`${headings[0]} 표`}>
      <table className="basis-table">
        <thead><tr>{headings.map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function CalculationBasisDialog() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button className="text-button" type="button" onClick={() => setOpen(true)}><Calculator size={18} aria-hidden="true" /> 계산 근거 보기</button>
      <dialog className="basis-dialog" ref={dialogRef} onClose={() => setOpen(false)} aria-labelledby="basis-dialog-title">
        <div className="basis-dialog__header">
          <div><p className="eyebrow">김샌드 씨 고정 사례 · 2026.11</p><h2 id="basis-dialog-title">이 숫자는 이렇게 계산했어요</h2></div>
          <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="계산 근거 닫기"><X aria-hidden="true" /></button>
        </div>
        <div className="basis-dialog__body">
          <p className="basis-dialog__lead">제출 보고서의 예시 고객을 기준으로 사용한 계산식과 가정을 모두 공개해요. 항목을 누르면 자세히 볼 수 있어요.</p>
          <BasisSection number={1} title="계산은 이렇게 해요" open>
            <ol>
              <li>50세부터 95세까지 <strong>1년 단위로</strong> 계산해요.</li>
              <li>해마다 <strong>들어오는 돈 − 나가는 돈 = 그해 남는 돈</strong>을 구해요. 들어오는 돈은 월급·재취업 소득·국민연금·퇴직연금·연금저축·주택연금, 나가는 돈은 생활비·교육비·부모 지원·대출 원리금·보험료·의료비·건강보험료·세금이에요.</li>
              <li>남는 돈은 금융자산에 더하고, 모자라면 금융자산에서 꺼내 써요.</li>
              <li>금융자산이 바닥나면 모자란 돈을 <strong>마이너스통장(연 5.5%)</strong>으로 메운다고 보고 이자를 붙여요. 5,000만 원 한도를 넘는 금액은 실제로 빌릴 수 없는 부족액이라는 뜻이에요.</li>
              <li>결과는 <strong>명목 금액</strong>이에요. 95세 자산 3.2억 원을 오늘 돈으로 바꾸면 약 1.3억 원이에요(물가 2% 할인).</li>
            </ol>
          </BasisSection>
          <BasisSection number={2} title="기본 가정값">
            <BasisTable headings={["항목", "적용 값", "근거"]} rows={[
              ["물가상승률", "연 2%", "한국은행 물가안정목표"], ["예금 수익률", "연 3.0% (이자소득세 15.4% 차감)", "팀 가정"], ["주식 등 위험자산", "연 6%", "팀 가정"],
              ["연금계좌 수익률", "약 연 3.7%", "위험자산 비중 약 22% × 6% + 나머지 × 3.0%"], ["임금피크", "55세부터 세후 월급 20% 감액", "56~59세 감액률 10~34%의 중간값"],
              ["정년", "60세", "현행 법정 정년"], ["국민연금", "65세부터 월 174만 원, 매년 2.1% 인상", "국민연금공단 예상연금 간단계산"],
              ["국민연금 보험료율", "9.5%에서 13%까지 단계적 인상", "국민연금법 개정"], ["노후 의료비", "65세 이상 연 550.8만 원 × 본인부담 20%, 매년 3% 증가", "65세 이상 1인당 진료비, 팀 가정"],
              ["은퇴 후 건강보험료", "65세 기준 월 약 21만 원(오늘 돈)", "지역가입자 산정 방식(연금소득 50% × 7.19% + 재산분), 실제 금액은 공단 모의계산 필요"], ["마이너스통장 금리", "연 5.5%", "시중은행 평균 연 5%대(2026.9)"],
              ["주택연금", "월 141만 원(본인 65세·배우자 63세)", "한국주택금융공사 일람표(2026.6.1), 연소자 기준"],
            ]} />
          </BasisSection>
          <BasisSection number={3} title="연금과 세금은 이렇게 계산해요">
            <ul>
              <li><strong>퇴직연금:</strong> 정년 때 IRP로 옮겨 10년 나눠 받는 것이 기본이에요. 연금으로 받으면 퇴직소득세를 30%, 11년째부터는 40% 깎아 줘요.</li>
              <li><strong>연금 인출액:</strong> 남은 잔액을 남은 기간에 똑같이 나눠 받고, 해마다 연금수령한도(평가액 ÷ (11 − 연차) × 120%)를 넘지 않게 맞춰요.</li>
              <li><strong>연금소득세:</strong> 70세 미만 5.5%, 80세 미만 4.4%, 80세 이상 3.3%예요.</li>
              <li><strong>사적연금 1,500만 원 규칙:</strong> 1년에 1,500만 원을 넘게 받으면 16.5% 분리과세를 적용해요. 김샌드 씨는 모든 조합에서 1,500만 원 이하예요.</li>
              <li><strong>예금 이자:</strong> 이자소득세 15.4%를 빼고 계산해요.</li>
            </ul>
          </BasisSection>
          <BasisSection number={4} title="추천 조합에 넣은 숫자">
            <BasisTable headings={["처방", "지금", "추천안"]} rows={[
              ["기본생활비", "월 258만 원", "월 232.2만 원(10% 절감)"], ["보험료", "월 45만 원", "월 30만 원(중복 특약 정리)"], ["부모 지원", "월 50만 원", "월 30만 원(부모 기초연금 신청 후)"],
              ["정기보험", "없음", "사망보장 2억 원, 월 12만 원, 7년"], ["정년 뒤 재취업", "없음", "월 200만 원, 5년(60~64세)"], ["은퇴 후 생활비", "월 298.1만 원", "월 253.4만 원(오늘 돈, 최소 노후생활비 216.6만 원보다 높게)"],
              ["주택연금", "없음", "65세부터 월 141만 원"], ["ISA·국민연금 임의계속가입", "없음", "흑자 전환 뒤 적용"],
            ]} />
            <p><strong>결과:</strong> 정기 월수지 −61만 원 → −12만 원, 금융자산 소진 59세 → 95세까지 유지, 95세 자산 −27.1억 원 → +3.2억 원.</p>
            <p className="basis-muted">남은 −12만 원은 해마다 받는 연말정산 환급(연 약 163만 원)으로 메워져요. 환급은 매년 달라 장기 계산에는 넣지 않았어요.</p>
          </BasisSection>
          <BasisSection number={5} title="500번 모의실험(몬테카를로)">
            <p>예금 연 3.0% ± 0.8%p, 주식 연 6% ± 18%p(폭락이 더 잦은 분포), 물가 연 2% ± 1%p 범위에서 해마다 값을 뽑아 95세까지 500번 계산했어요.</p>
            <BasisTable headings={["구분", "95세까지 버틸 확률", "운 나쁜 하위 10%", "중간값"]} rows={[["지금 그대로", "0%", "−31.1억", "−27.1억"], ["추천 조합", "99.2%", "+1.5억", "+3.1억"], ["추천 조합 + 인출 규칙", "100%", "+2.7억", "+3.4억"]]} />
            <p><strong>인출 규칙:</strong> 자산이 계획보다 20% 넘게 뒤처지면 그해 생활비를 10% 줄이고, 회복하면 되돌려요. 500번 중 34%에서 한 번 이상 생활비를 줄였어요. 난수 시작값은 고정했어요.</p>
          </BasisSection>
          <BasisSection number={6} title="정년 뒤 몇 년 더 일하면 될까?">
            <BasisTable headings={["정년 뒤 일하는 기간", "0년", "3년", "5년", "7년", "10년"]} rows={[["95세까지 버틸 확률", "1.7%", "81.0%", "99.3%", "100%", "100%"]]} />
            <p className="basis-muted">추천 조합 기준, 기간별 300번 모의실험. 5년이 사실상 안전선이에요.</p>
          </BasisSection>
          <BasisSection number={7} title="연금은 어떤 순서로 꺼낼까?">
            <p>퇴직연금 수령 기간(10·15·20년) × 연금저축 개시 나이(60·65·70세), 9가지를 비교했어요.</p>
            <ul><li><strong>가장 유리:</strong> 퇴직연금 15년 + 연금저축 70세 개시 → 세금 비율 3.86% → 3.52%, 95세 자산 약 +0.3억 원</li><li><strong>주의:</strong> 20년으로 늘리면 세금은 3.45%로 줄지만 정년~국민연금 사이에 꺼낼 돈이 모자라 64세에 금융자산이 바닥나요.</li></ul>
          </BasisSection>
          <BasisSection number={8} title="건강이 나빠지거나 가장이 먼저 떠나면?">
            <ul>
              <li><strong>장기요양:</strong> 80세부터 5년간 본인부담 월 100만 원(오늘 돈)이 생기면 확률 86.2%, 인출 규칙을 함께 쓰면 100%</li><li><strong>운동·모임으로 요양비 30% 감소 시:</strong> 93.4%(일본 추적 연구 참고값, 한국 자료 아님)</li>
              <li><strong>남편 84세 사망, 아내 100세까지 혼자:</strong> 유족연금 월 약 104만 원, 생활비 70% 가정 시 100세까지 금융자산 유지(마지막 해 4.7억 원)</li><li><strong>부모 요양으로 1년 무급 휴직:</strong> 95세 자산 −2.2억 원. 장기요양등급 신청과 가족돌봄휴가를 먼저 써요.</li>
            </ul>
          </BasisSection>
          <BasisSection number={9} title="어떤 가정이 결과를 가장 크게 바꾸나요?">
            <p>가정값 11개를 하나씩 올리고 내려 봤어요. 영향이 큰 5개는 <strong>물가상승률, 국민연금 예상액, 정년, 은퇴 후 생활비, 월 소득</strong>이에요. 이 값에 따라 95세 자산이 최대 약 9.1억 원까지 달라져 매년 다시 확인해요.</p>
          </BasisSection>
          <BasisSection number={10} title="공식 계산기와 맞춰 봤어요">
            <BasisTable headings={["항목", "앱 값", "공식값", "결과"]} rows={[
              ["국민연금(65세)", "월 174만 원", "공단 간단계산 174만 원", "일치 (초기 추정식 234만 원 오류 수정)"], ["주택연금(6억 원, 연소자 63세)", "월 141만 원", "공식 조회 1,410,020원", "일치 (나이 기준 수정)"],
              ["카드 결제 전환 추가 환급", "연 28.0만 원", "공제율 수기 계산 28.0만 원", "일치"], ["주택담보대출 원리금(1.8억, 4.2%, 15년)", "월 134.9만 원", "원리금균등 공식 134.9만 원", "일치"],
            ]} />
          </BasisSection>
          <BasisSection number={11} title="일부러 넣지 않은 것">
            <p>아래 항목은 받을지 확실하지 않아 계산에서 뺐어요. 그래서 결과는 실제보다 <strong>보수적</strong>이에요.</p>
            <ul><li>연말정산 환급(연 약 163만 원)</li><li>집값 상승</li><li>본인 기초연금(자산이 줄면 부부 월 약 42만 원 가능)</li><li>ISA 절세 효과</li><li>부모님 상속(받으면 95세 자산 약 +9.8억 원)</li></ul>
          </BasisSection>
          <p className="notice">이 앱은 재무설계 이해를 돕는 교육·모의계산 도구예요. 실제 가입·투자 전에는 공단·금융회사 공식 조회값과 전문가 상담으로 다시 확인하세요.</p>
        </div>
      </dialog>
    </>
  );
}
