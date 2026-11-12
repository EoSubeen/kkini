// r6 계산 모듈(JS)을 TypeScript에서 쓰기 위한 얇은 타입 경계.
// 원본 식은 engine-core.js / planning.js에 그대로 두고, 여기서는 들고 나는 값의 모양만 정한다.
import * as core from "./engine-core.js";
import * as planning from "./planning.js";

/** r6 엔진 입력. 키 이름은 원본 데모(age0, net_m …)를 따른다. 금액 단위는 만 원. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type R6Input = Record<string, any> & {
  age0: number;
  sage0: number;
  kids: number[];
  retire: number;
  np_age: number;
  house: number;
  par_m: number;
  par_years: number;
  par_house: number;
  par_age: number;
  hp_quote_m: number;
  hp_start_age: number;
  hp_younger_age: number;
  survivor_m: number;
  par_new_m: number;
  npEst: boolean;
};

export interface R6Row {
  i: number; yr: number; age: number; sage: number;
  wage: number; credit: number; np: number; snp: number; H: number; I: number; hp: number;
  J: number; K: number; L: number; M: number; N: number; O: number; P: number; Q: number;
  extra: number; NH: number; debt: number; R: number; S: number; T: number; W: number; Y: number; Z: number;
  V: number; X: number; col: number; hs: number; g: number; tax: number;
}

export interface R6Result {
  p: R6Input;
  rows: R6Row[];
  deplete: number | null;
  z95: number;
  crev: number;
  m0: number;
  annualAverage: number;
  loanY: number;
  cuts: number;
  taxSum: number;
  wdSum: number;
  maxX: number;
  gLow: number;
}

export interface R6Ctx {
  parBoth: boolean;
  silson: boolean;
  silGen: string;
  silM: number;
  cardY: number | null;
  chkPct: number;
  tradY: number;
  busY: number;
  parEstate: number;
  sib: number;
  ds: { ratio: number; age: number };
}

export interface MonteResult { p: number; p10: number; p50: number; p90: number; dmed: number | null; cut: number; g10: number }
export interface NeedsResult { cover: number; yk: number; yB: number; A: number; Ap: number; B: number; C: number; D: number; E: number; need: number; F: number; G: number; Iv: number; Jv: number; have: number; gap: number }
export interface RecipeDef { id: string; t: string; manual?: boolean; x?: string }
export interface EventDef { id: string; t: string; d: string }
export interface SensitivityRow { key: string; label: string; range: string; low: number; high: number; lowDeplete: number | null; highDeplete: number | null; width: number }

type Fn<A extends unknown[], R> = (...args: A) => R;

export const run = core.run as unknown as Fn<[Record<string, unknown>], R6Result>;
export const engFromProfile = planning.engFromProfile as unknown as Fn<[object], R6Input>;
export const makeCtx = planning.makeCtx as unknown as Fn<[object], R6Ctx>;
export const cfg = planning.cfg as unknown as Fn<[R6Input, R6Ctx, string[]?, string[]?], R6Input & { __applied: string[] }>;
export const monte = planning.monte as unknown as Fn<[Record<string, unknown>, number?, boolean?], MonteResult>;
export const needs = planning.needs as unknown as Fn<[R6Input], NeedsResult>;
export const avail = planning.avail as unknown as Fn<[R6Input, R6Ctx, Set<string>], RecipeDef[]>;
export const findBest = planning.findBest as unknown as Fn<[R6Input, R6Ctx, { keepHouse?: boolean }?], { ids: string[]; result: R6Result; wasNeg: boolean; alreadyOk: boolean }>;
export const sensitivity = planning.sensitivity as unknown as Fn<[Record<string, unknown>], { base: number; rows: SensitivityRow[] }>;
export const runReportCase = planning.runReportCase as unknown as Fn<[], R6Result>;
export const parHp = planning.parHp as unknown as Fn<[R6Input, boolean], number>;
export const hpMonthly = planning.hpMonthly as unknown as Fn<[number, number], number>;
export const dsInfo = planning.dsInfo as unknown as Fn<[R6Input, { ratio: number; age: number }], { H: number; N: number; age: number; cost: number; cash: number; bal: number; high: boolean }>;
export const termPrem = planning.termPrem as unknown as Fn<[number, number], number>;
export const RECIPES = planning.RECIPES as unknown as RecipeDef[];
export const EVENTS = planning.EVENTS as unknown as EventDef[];
