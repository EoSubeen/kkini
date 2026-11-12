# 통합 보고서

```yaml
status: integrated-awaiting-release-qa
producer: architecture-supervisor
consumer: qa-release
updated_at: 2026-11-12
```

## 연결된 흐름

1. 회원가입·로그인 폼은 `src/app/auth/actions.ts`의 Supabase Server Action을 호출한다.
2. 제품 라우트 그룹은 `requireUser()`로 인증을 확인하고 비로그인 사용자를 로그인 화면으로 보낸다.
3. `/onboarding`의 6단계 폼은 공용 재무 계약과 같은 키로 payload를 만든다.
4. `/api/calculate`는 서버에서 Zod 검증과 계산을 수행하고, 로그인 사용자에게 입력·계산·레시피 스냅샷을 저장한다.
5. `/diagnosis/current`는 사용자의 최신 계산 스냅샷을 다시 읽어 월수지와 건강 지표를 표시한다.
6. `/recipe`는 최신 저장 프로필을 `/api/profile/latest`에서 불러온 뒤 선택 레시피를 다시 계산·저장한다.
7. `/check`는 `/api/checks`를 통해 체크리스트를 복원하고 `check_plans`·`check_items`에 저장한다.
8. 계산 저장은 `persist_calculation_snapshot` DB 함수에서 입력·계산·레시피를 한 트랜잭션으로 기록한다.
9. 설정 화면의 로그아웃은 실제 Supabase 로그아웃 Server Action을 호출한다.

## 검증

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm test`: PASS, 6 files / 16 tests
- `npm run build`: PASS, Next.js 16 Webpack production build
- `npm audit --omit=dev`: PASS, 운영 의존성 취약점 0건

## 남은 통합 범위

- 홈과 현재 진단은 최신 저장 결과를 읽는다. 미래 타임라인·가족 안전망·동년배 비교의 일부 설명용 데이터는 아직 예시값이다.
- 로컬 PostgreSQL reset과 두 마이그레이션 적용, pgTAP RLS·사용자 격리 22개 assertion, 전체 인증·복원 Playwright E2E를 통과했다.
- Vercel·운영 Supabase 계정과 환경변수가 없어 실제 외부 배포는 수행하지 않았다.

## 부분 실패 기록

통합 에이전트가 사용량 제한으로 종료됐으며, 종료 전 생성된 인증·온보딩 변경을 감독 역할이 검토하고 연결·검증을 마무리했다. 부분 결과는 폐기하지 않고 이 보고서에 인수했다.
