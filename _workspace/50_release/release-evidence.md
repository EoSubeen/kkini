# 끼니 QA·Release evidence

```yaml
status: READY_FOR_PRODUCTION_PROMOTION
producer: qa-release
consumer: architecture-supervisor
target_ref: main@ce779ee plus this QA patch
verified_at: 2026-11-15 Asia/Seoul
release_recommendation: ALLOW_PRODUCTION_AFTER_ENV_CONFIGURATION
```

## 결론

커밋 `ce779ee` 기준 코드를 Vercel Preview와 관리형 Supabase 프로젝트에 연결했다. 회원가입→6단계 입력→진단→점검 저장→로그아웃→재로그인→진단·점검 복원 E2E가 실제 원격 DB에서 통과했다. 인증 사용자 A/B 격리와 전체 RLS 정책을 검사하는 pgTAP 22건도 원격 DB에서 통과했다.

프리뷰 로그에서 애플리케이션 오류·경고, Supabase Auth 오류, PostgREST 오류는 확인되지 않았다. 업데이트된 코드 게이트를 다시 통과하고 동일한 환경변수를 Vercel Production에 설정한 뒤 공개 URL에서 스모크 테스트를 통과하면 프로덕션 승격이 가능하다.

## 실행 증거

| 검증 | 명령 | 결과 |
| --- | --- | --- |
| 전체 정적·단위·빌드 게이트 | `npm run verify` | PASS, exit 0 |
| 린트 | `npm run lint` | PASS, exit 0 |
| 타입 검사 | `npm run typecheck` | PASS, exit 0 |
| Vitest | `npm run test` (`verify` 포함) | PASS, 9 files / 26 tests / 0 failures |
| 프로덕션 빌드 | `next build --webpack` (`verify` 포함) | PASS, 27 routes |
| 공개 인증·반응형 Playwright | `npm run test:e2e` | PASS, 8 passed / 1 skipped / 0 failed, exit 0 |
| 운영 의존성 감사 | `npm audit --omit=dev` | PASS, 취약점 0, exit 0 |
| 트래킹 파일 비밀값 패턴 | `git grep` 기반 검사 | PASS, 비밀값 0 |

### 원격 프리뷰 추가 검증

| 검증 | 명령 | 결과 |
| --- | --- | --- |
| 원격 인증·저장·복원 E2E | `RUN_SUPABASE_E2E=1 PLAYWRIGHT_BASE_URL=https://kkinisandwich.vercel.app npm run test:e2e -- tests/e2e/persistence.spec.ts` | PASS, 1 passed / 0 failed, 약 46초 |
| 원격 RLS·소유권 pgTAP | `npx supabase test db --remote --yes` | PASS, 2 files / 22 tests / 0 failed |
| 원격 마이그레이션 | `npx supabase db push` | PASS, 2 migrations applied |
| Vercel Preview 로그 | 최신 Preview deployment 로그 조회 | PASS, 앱 error/warning 0 |
| Supabase Auth/PostgREST 로그 | 최근 로그 조회 | PASS, 사용자 흐름 관련 error 0 |

프리뷰 URL: `https://kkinisandwich.vercel.app`
마이그레이션: `202611120001_initial_schema.sql`, `202611120002_persist_calculation_rpc.sql`

## 모바일·접근성 검토

### 실제 브라우저 통과 범위

- `/login`, `/signup`: 375×812, 390×844, 844×390에서 `scrollWidth <= innerWidth`.
- 공개 인증 폼의 버튼·입력·링크: 최소 44×44px. Next.js 개발 툴 버튼은 제품 UI가 아니므로 측정에서 제외했다.
- `prefers-reduced-motion: reduce`: 버튼의 transition/animation duration이 `0.01ms`로 축소된다.
- 390×844, 200% 브라우저 확대: 이메일·비밀번호·로그인 조작 가능, 가로 넘침 없음.
- 비로그인 제품 라우트 접근은 `/login`으로 이동하고, `/api/profile/latest` 비로그인 요청은 401을 반환한다.

### 조건부로 추가한 범위

`tests/e2e/persistence.spec.ts`는 실제 Supabase 실행 시 다음을 함께 확인하도록 확장했다.

- 회원가입 → 6단계 입력 → 현재 진단 → 점검 저장 → 로그아웃 → 재로그인 → 진단·점검 복원.
- `/home`, `/diagnosis/current`, `/recipe`, `/check`, `/settings`의 375px·390px·가로 화면 가로 넘침.
- 고정 헤더·하단 내비게이션 44px 터치 영역과 최하단 콘텐츠 가림 여부.

원격 Preview에서 `RUN_SUPABASE_E2E=1`로 위 흐름을 실행했고 1건 전체가 통과했다. 375px·390px·가로 화면 라우트 순회에서 가로 넘침이 없음을 함께 확인했다.

## 보안·데이터 검토

- 제품 레이아웃은 서버 `requireUser()` 경계를 사용한다.
- 사용자 저장 API는 서버의 인증 사용자 ID로 조회·저장하며 클라이언트 전달 사용자 ID를 신뢰하지 않는다.
- 8개 사용자 테이블은 RLS 활성화·강제 구문을 갖고 모든 정책이 `auth.uid()` 소유자 조건을 사용한다.
- 자식 테이블은 `(id, user_id)` 복합 외래키로 교차사용자 연결을 제한한다.
- 계산 저장 RPC는 `SECURITY INVOKER`와 `auth.uid()`를 사용한다.
- `supabase/tests/owner_isolation.sql`과 `rls_policies.sql`을 관리형 Supabase에서 실행했고 타 사용자 읽기·쓰기, 비로그인 접근 차단, 8개 사용자 테이블의 정책 수를 포함한 22건이 모두 통과했다.

## 김샌드 회귀

`npm run verify`에서 다음 고정 사례가 통과했다.

- 원본 보고서 현재 상태: 정기 월수지 약 `-60.84만원`, 59세 고갈, 95세 약 `-27.09억원`.
- 제출 보고서 추천안: 정기 월수지 약 `-12만원`, 95세 금융·연금 자산 약 `3.2억원`.
- 보고서 추천안은 사용자 계산과 별도 고정 사례로 유지된다.
- 집 축소 선택 시 기존 집 주택연금이 제거되고 새 집 기준 월액 재확인 고지가 생성된다.

## 발견 이슈

### RESOLVED · P2 · 인증 전환 링크 터치 영역

- 재현: `npm run test:e2e`, `/login`의 `회원가입` 또는 `/signup`의 `로그인` 링크를 375px·390px·가로 화면에서 측정.
- 기대: 조작 대상 최소 44×44px.
- 최초 실제: 높이 21px, `로그인` 링크 폭 36.31px.
- 증거: `tests/e2e/responsive-auth.spec.ts` 최초 실행 4 failed / 3 passed / 1 skipped.
- 해결 확인: 공유 작업 트리의 `.auth-links a` 최소 크기 보강 후 8 passed / 1 skipped. 해당 소스 변경은 QA 역할이 작성하지 않았다.

신규 미해결 P0/P1/P2/P3 제품 결함은 이번 실행 가능 범위에서 발견되지 않았다.

## 프로덕션 승격 전 남은 조건

1. Vercel Production에 원격 Supabase URL·publishable key와 `NEXT_PUBLIC_SITE_URL` 환경변수를 설정한다.
2. 전체 코드 게이트, 일반 Playwright, 비밀키 스캔을 최신 작업 트리에서 재실행한다.
3. Production 배포 후 공개 URL에서 인증·저장·복원 E2E와 비로그인 API 401 스모크를 통과한다.
4. Vercel과 GitHub 연결이 없으므로 자동 배포가 필요하면 계정 연결을 추가한다. 현재 릴리스는 CLI 배포를 사용한다.

## 정확한 재현 명령

```bash
npm run verify
npm run test:e2e
npm audit --omit=dev
npx supabase test db --remote --yes
RUN_SUPABASE_E2E=1 PLAYWRIGHT_BASE_URL=https://kkinisandwich.vercel.app npm run test:e2e -- tests/e2e/persistence.spec.ts
```

## 롤백

- 애플리케이션: Vercel에서 마지막 정상 배포를 Promote한다.
- 데이터베이스: 파괴적 down migration 대신 Supabase 백업 복구 또는 새 프로젝트에 마지막 정상 마이그레이션까지 재적용한다.
- 배포 전 단계에서는 코드·테스트·마이그레이션 변경을 각각의 마지막 정상 커밋으로 되돌린다. 사용자 데이터가 생긴 뒤에는 migration 파일을 삭제하거나 과거 버전으로 강제 덮어쓰지 않는다.
