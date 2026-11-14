# 끼니 QA·Release evidence

```yaml
status: PARTIAL
producer: qa-release
consumer: architecture-supervisor
target_ref: main@67c7924 plus this QA patch
verified_at: 2026-11-14 Asia/Seoul
release_recommendation: ALLOW_PREVIEW_BLOCK_PRODUCTION
```

## 결론

커밋 `67c7924` 기준 코드 품질·금융 회귀·빌드는 통과했다. 공개 인증 화면은 375px, 390px, 가로 화면, 200% 브라우저 확대, 축소 모션에서 가로 넘침 없이 동작했다. 첫 실행에서 인증 전환 링크가 44px 터치 기준에 미달하는 P2를 발견했고, 공유 작업 트리에 반영된 CSS 보강 후 재실행에서 통과했다.

현재 Docker daemon에 접근할 수 없어 최신 코드로 로컬 Supabase, pgTAP RLS, 회원가입부터 재로그인 복원까지의 전체 E2E를 재실행하지 못했다. 따라서 프리뷰는 허용하되 프로덕션 배포는 차단한다.

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
| Docker 상태 | `docker info --format '{{.ServerVersion}}'` | FAIL, exit 1: Docker API socket permission/daemon unavailable |
| Supabase/RLS 최신 런타임 | 아래 재현 명령 | NOT RUN: Docker 선행 조건 불충족 |

마이그레이션은 `202611120001_initial_schema.sql`, `202611120002_persist_calculation_rpc.sql` 두 개다.

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

이번 패스에서는 `RUN_SUPABASE_E2E`와 로컬 Supabase가 없어 위 1개 테스트가 명시적으로 skip됐다. 정적 CSS에는 콘텐츠 하단 여백 `112px + safe-area`, 헤더 48px 조작 영역, 하단 탭 52px 조작 영역, 축소 모션 규칙이 존재하지만 이는 실제 인증 화면 런타임 증거를 대체하지 않는다.

## 보안·데이터 검토

- 제품 레이아웃은 서버 `requireUser()` 경계를 사용한다.
- 사용자 저장 API는 서버의 인증 사용자 ID로 조회·저장하며 클라이언트 전달 사용자 ID를 신뢰하지 않는다.
- 8개 사용자 테이블은 RLS 활성화·강제 구문을 갖고 모든 정책이 `auth.uid()` 소유자 조건을 사용한다.
- 자식 테이블은 `(id, user_id)` 복합 외래키로 교차사용자 연결을 제한한다.
- 계산 저장 RPC는 `SECURITY INVOKER`와 `auth.uid()`를 사용한다.
- `supabase/tests/owner_isolation.sql`과 `rls_policies.sql`은 타 사용자 읽기·쓰기와 비로그인 접근 차단을 포함하지만, 이번 패스에서 pgTAP 실행은 Docker 부재로 미검증이다.

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

## 배포 차단 조건

1. Docker/Supabase를 복구한 뒤 아래 전체 인증·복원 E2E와 pgTAP을 최신 코드로 다시 통과해야 한다.
2. 사용자 A/B 실제 세션으로 교차사용자 읽기·쓰기 차단을 확인해야 한다.
3. 프리뷰 Supabase 환경변수, 인증 Redirect URL, 이메일 확인 정책을 구성하고 프리뷰 로그·네트워크 오류를 확인해야 한다.
4. 원격 CI 최초 성공과 사람의 프로덕션 승인 기록이 필요하다.
5. 44px 인증 링크 보강 변경이 최종 커밋에 포함되어야 한다.

## 정확한 재현 명령

```bash
# Docker Desktop/daemon을 먼저 실행
npm run supabase:start
npm run db:reset
npx supabase test db
RUN_SUPABASE_E2E=1 npm run test:e2e
npm run verify
npm audit --omit=dev
```

## 롤백

- 애플리케이션: Vercel에서 마지막 정상 배포를 Promote한다.
- 데이터베이스: 파괴적 down migration 대신 Supabase 백업 복구 또는 새 프로젝트에 마지막 정상 마이그레이션까지 재적용한다.
- 배포 전 단계에서는 코드·테스트·마이그레이션 변경을 각각의 마지막 정상 커밋으로 되돌린다. 사용자 데이터가 생긴 뒤에는 migration 파일을 삭제하거나 과거 버전으로 강제 덮어쓰지 않는다.
