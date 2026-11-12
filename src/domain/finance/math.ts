export function payment(ratePerPeriod: number, periods: number, presentValue: number) {
  if (presentValue <= 0 || periods <= 0) return 0;
  return ratePerPeriod === 0
    ? presentValue / periods
    : (presentValue * ratePerPeriod) / (1 - Math.pow(1 + ratePerPeriod, -periods));
}

export function loanBalance(
  principal: number,
  annualRate: number,
  years: number,
  elapsedYears: number,
) {
  if (principal <= 0 || years <= 0 || elapsedYears >= years) return 0;
  const rate = annualRate / 12;
  const periods = years * 12;
  const elapsed = elapsedYears * 12;
  if (rate === 0) return principal * (1 - elapsed / periods);
  const monthlyPayment = payment(rate, periods, principal);
  return (
    principal * Math.pow(1 + rate, elapsed) -
    (monthlyPayment * (Math.pow(1 + rate, elapsed) - 1)) / rate
  );
}

// startAge는 부부 중 나이가 적은 사람의 가입 나이여야 한다(주택금융공사 기준).
export function reverseMortgageMonthly(homeValue: number, startAge = 65) {
  const points: Array<[number, number]> = [
    [55, 93.6],
    [60, 126.4],
    [63, 141.0],
    [65, 151.7],
  ];
  const cappedAge = Math.max(55, Math.min(65, startAge));
  let perSixHundredMillion = points[points.length - 1][1];
  for (let index = 1; index < points.length; index += 1) {
    const [previousAge, previousValue] = points[index - 1];
    const [age, value] = points[index];
    if (cappedAge <= age) {
      perSixHundredMillion =
        previousValue + ((value - previousValue) * (cappedAge - previousAge)) / (age - previousAge);
      break;
    }
  }
  return (homeValue / 60_000) * perSixHundredMillion;
}
