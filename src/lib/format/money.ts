/** 만 원 단위 금액을 화면용 짧은 표기로 바꾼다. 예: 61300 → "6.13억", 4500 → "4,500만" */
export function shortMoney(value: number) {
  const sign = value < 0 ? "−" : "";
  const abs = Math.abs(value);
  if (abs >= 10_000) {
    const eok = abs / 10_000;
    return `${sign}${eok >= 10 ? eok.toFixed(1) : eok.toFixed(2).replace(/0$/, "")}억`;
  }
  return `${sign}${Math.round(abs).toLocaleString("ko-KR")}만`;
}

/** 부호가 붙은 만 원 금액. 예: −61 → "−61만 원" */
export function signedManwon(value: number) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : rounded < 0 ? "−" : ""}${Math.abs(rounded).toLocaleString("ko-KR")}만 원`;
}

export function eokText(value: number) {
  const sign = value < 0 ? "−" : value > 0 ? "+" : "";
  return `${sign}${(Math.abs(value) / 10_000).toFixed(1)}억 원`;
}
