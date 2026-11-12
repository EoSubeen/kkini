"use client";

import { Calculator, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
      <button className="text-button" type="button" onClick={() => setOpen(true)}>
        <Calculator size={18} aria-hidden="true" /> 계산 근거 보기
      </button>
      <dialog className="basis-dialog" ref={dialogRef} onClose={() => setOpen(false)}>
        <div className="basis-dialog__header">
          <div>
            <p className="eyebrow">계산 기준 · 2026.11</p>
            <h2>이 숫자는 이렇게 계산했어요</h2>
          </div>
          <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="계산 근거 닫기">
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="basis-dialog__body">
          <article>
            <strong>월수지</strong>
            <p>세후 소득에서 생활비·보험료·부모님 지원·대출 원리금·교육비를 뺀 값이에요.</p>
          </article>
          <article>
            <strong>95세 금융·연금 자산</strong>
            <p>연도별 소득과 지출, 연금 수령, 가정한 수익률을 반영해 95세까지 이어 계산해요.</p>
          </article>
          <article>
            <strong>주택연금</strong>
            <p>화면의 월액은 교육용 추정치예요. 이사 후에는 새 집 가격과 가입 나이로 공사 조회값을 다시 확인해야 해요.</p>
          </article>
          <p className="notice">이 서비스는 재무설계 교육·모의계산 도구예요. 실제 결정 전 공식 기관 조회와 전문가 상담을 거쳐 주세요.</p>
        </div>
      </dialog>
    </>
  );
}
