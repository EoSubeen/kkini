# Finance/API evidence

상태: `implementation-complete / integration-check-pending`

## 원본과 이식 범위

- 원본: `끼니 샌드위치 진단/index.html`
- 기준 계산: `BASE`, `pmt`, `loanBal`, `run`, `eng`, `RECIPES`
- 이식: 입력 기본값, 2026년부터 95세까지 연도별 현금흐름, 교육비, 주담대, 퇴직·개인연금, 국민연금, 자산 고갈 나이, 95세 금융·연금 자산, 건강 지표
- 금액 단위: `KRW_10K`(만원)
- 계산 버전: `kkini-2026.11-v1`
- 가정 기준일: `2026-11-03`

## API

### `POST /api/calculate`

요청은 `src/lib/contracts/api.ts`의 `calculateRequestSchema`로 검증한다.

```json
{
  "profile": { "schemaVersion": 1, "displayName": "김샌드 님", "...": "생략" },
  "recipeSelection": {
    "selectedRecipeIds": ["basic", "down", "hp"],
    "housing": {
      "downsizingRatio": 0.7,
      "downsizingAge": 60,
      "reverseMortgageEnabled": false
    }
  },
  "persist": true
}
```

- 비로그인: 계산 결과를 반환하고 `snapshotId`는 `null`이다.
- 로그인: 입력·계산·레시피 스냅샷을 한 사용자 ID로 저장하고 계산 스냅샷 ID를 반환한다.
- `down`과 기존 집 기준 `hp`를 함께 보내면 `hp`를 해제하고 아래 안내를 포함한다.
  - `이사 후 주택연금은 새 집 기준으로 월액을 다시 확인해 주세요.`
- 새 집 주택연금은 `housing.reverseMortgageEnabled: true`일 때 새 집 예상 가격으로 별도 계산한다.

### 읽기 API

- `GET /api/calculation-basis`: 계산 버전, 가정 버전, 단위, 계산 근거, 교육·모의계산 고지
- `GET /api/report-recommendation`: 제출 보고서의 고정 사례 카드
  - 정기 월수지 약 `-12만 원`
  - 95세 금융·연금 자산 약 `3.2억 원` (`32,000만원`)

## 회귀 증거

- 김샌드 원본 HTML `run(eng())` 현재 월수지: `-47.250895...만원`
- TypeScript 엔진 회귀 기대값: `-47.25만원`(화면 반올림 전)
- 보고서 추천안은 사용자 입력을 덮지 않는 별도 고정 사례다.

## 저장 계약

- `financial_input_snapshots`: `user_id`, `schema_version`, `input`
- `calculation_snapshots`: `user_id`, `financial_input_snapshot_id`, `calculation_version`, `assumption_version`, `result`
- `recipe_selections`: `user_id`, `calculation_snapshot_id`, `selected_recipe_ids`, `housing`
- 브라우저 서비스 키는 사용하지 않으며 서버 세션의 `auth.getUser()`로 사용자 ID를 얻는다.

## 제한

- 원본 데모의 세금·복지·상속·보험 세부 화면 전체는 이번 순수 엔진 이식 범위에 포함하지 않았다.
- 공식 연금·통계 API 대신 버전 고정 가정을 사용한다.
- DB 원자 트랜잭션은 Supabase RPC가 추가되기 전까지 세 insert의 연속 작업이다. 중간 실패 보상은 통합 단계의 잔여 위험이다.
