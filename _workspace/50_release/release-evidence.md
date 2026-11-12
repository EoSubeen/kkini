# 끼니 QA·Release evidence

```yaml
status: READY_FOR_PREVIEW
producer: qa-release
consumer: architecture-supervisor
verified_at: 2026-11-12 Asia/Seoul
release_recommendation: ALLOW_PREVIEW_BLOCK_PRODUCTION
```

## 결론

코드 품질 게이트, 로컬 PostgreSQL 마이그레이션, RLS 격리, 공개 인증 경계와 전체 영구 저장 E2E가 통과했다. 회원가입부터 입력·진단·점검 저장, 로그아웃과 재로그인 후 복원까지 실제 로컬 Supabase에서 확인했으며, 개인 계산이 아직 연결되지 않은 화면은 보고서 예시임을 명시했다. 현재 상태는 `READY_FOR_PREVIEW`다. 원격 CI 최초 실행, Preview/Production 환경 구성과 사람 승인이 남아 있어 프로덕션 배포는 아직 승인하지 않는다.

## 실행 증거

| 검증 | 명령 | 결과 |
| --- | --- | --- |
| 린트·타입·단위/통합·빌드 | `npm run verify` | PASS, exit 0. 최종 재검토에서는 동시 build lock 뒤 `npm run build`를 별도 재실행해 PASS |
| Vitest | 위 명령에 포함 | PASS, 6 files / 16 tests |
| 프로덕션 빌드 | `next build --webpack` | PASS, 21 routes |
| Playwright 모바일 스모크·영구 저장 | `RUN_SUPABASE_E2E=1 npm run test:e2e` | PASS, 4 tests / 0 failures |
| 운영 의존성 감사 | `npm audit --omit=dev` | PASS, 취약점 0 |
| 전체 의존성 감사 | `npm audit` | PARTIAL, 개발 전용 ESLint 경로 `minimatch` 중간 7건 |
| Docker 상태 | `docker info --format '{{.ServerVersion}}'` | PASS, Docker 29.2.1 |
| Supabase 재현성 | `npm run supabase:start` → `npm run db:reset` | PASS, migration 001·002와 seed 적용 |
| Supabase migration/RLS | `npx supabase test db` | PASS, 2 files / 22 tests |
| 비밀키 정적 검색 | 서비스 역할 키·개인키 패턴 `rg` | PASS, 발견 없음 |

## 검토 결과

### 인증·권한

- `AuthForm`은 `useActionState`로 실제 `signUpAction`/`signInAction`을 호출한다.
- 제품 레이아웃은 `requireUser()`로 보호되며 비로그인 `/home` 접근은 `/login`으로 이동한다.
- `/api/profile/latest`, `/api/checks`는 비로그인 요청에 `401 UNAUTHORIZED`를 반환한다.
- 계산 API는 비로그인 계산을 허용하지만 저장소와 사용자 ID가 없으면 저장하지 않는다. 로그인 저장의 사용자 ID는 서버의 `auth.getUser()` 결과만 사용한다.
- 8개 사용자 테이블에 RLS가 활성화·강제되고, 관계 테이블은 `(id, user_id)` 복합 외래키로 교차사용자 연결을 제한한다.
- 실제 pgTAP에서 소유자 접근, 타 사용자 읽기·쓰기 차단, 비로그인 차단을 포함한 22개 assertion이 통과했다.

### 입력·계산·복원

- 6단계 온보딩 입력은 서버의 Zod 계약으로 재검증된 뒤 계산된다.
- `persist_calculation_snapshot`은 `SECURITY INVOKER`, `auth.uid()`와 RLS를 사용하며 입력·계산·레시피 3개 행을 한 PostgreSQL 함수 호출에서 저장한다.
- 현재 진단은 로그인 사용자의 최신 계산 스냅샷을 다시 읽는다.
- 홈은 최신 계산 스냅샷, 활성 점검 항목, 인증 사용자 이름을 다시 읽으며 진단이 없으면 온보딩 빈 상태를 보여 준다.
- 레시피 결과는 최신 프로필을 불러와 새 계산·레시피 스냅샷으로 저장한다.
- 점검 화면은 `/api/checks`로 활성 계획과 항목을 복원하고 변경을 upsert한다. 컴포넌트 테스트에서 복원 후 변경 payload를 확인했다.
- 실제 브라우저 E2E에서 회원가입 → 6단계 입력 → 진단 저장 → 점검 저장 → 로그아웃 → 재로그인 → 진단·점검 복원을 확인했다.

### 회귀·화면

- 김샌드 원본 월수지 `-47.250895만원` 회귀와 보고서 고정 사례 `-12만원 / 3.2억원` 분리가 테스트돼 있다.
- 보고서 추천안을 펼쳐도 재료 선택은 바뀌지 않는다.
- 집 축소 시 기존 집 주택연금이 해제되고 새 집 기준 월액 재확인 문구가 나타난다.
- 모바일 Chrome(Pixel 7 프로필)에서 로그인·회원가입 화면에 가로 넘침이 없고 입력 label/autocomplete를 확인했다.
- 현재 진단의 동년배 비교는 `예시 데이터`, 미래 타임라인과 가족 안전망은 `예시 시뮬레이션`으로 명시되어 개인 계산 결과와 분리됐다.

## 배포 차단 항목

1. **프리뷰·프로덕션 배포 없음**: Vercel과 원격 Supabase 프로젝트, 환경변수, Redirect URL, 이메일 확인 설정과 배포 로그 검증이 남았다.
2. **원격 CI 최초 실행 없음**: GitHub 원격 저장소에서 앱·DB 두 job이 실제 실행되기 전까지 CI 워크플로는 로컬 검증 결과만 가진다.
3. **제품 계약 미승인**: `_workspace/00_scope/acceptance.md`의 제품·기술·데이터·개인정보 승인 체크가 비어 있다.

## 비차단 잔여 위험

- 개발 도구 경로에 `minimatch` 중간 등급 7건이 있다. 운영 의존성은 0건이며 강제 호환성 업그레이드는 적용하지 않았다.
- 점검 체크는 저장 중 비활성화해 요청 순서를 직렬화한다. 네트워크 오류 후 재시도 UX는 후속 검토한다.
- 미래 타임라인·가족 안전망과 동년배 비교의 일부 값은 개인 계산이 아닌 명시된 보고서 예시다.

## CI

`.github/workflows/quality.yml`을 추가했다.

- 앱 job: `npm ci` → `npm run verify` → Playwright Chromium 설치 → 공개 인증/API E2E
- DB job: Supabase 시작 → DB reset → pgTAP 실행 → 로컬 공개 설정 추출 → 전체 인증·복원 Playwright → 종료

CI가 실제 원격 저장소에서 최초 실행되기 전까지 워크플로 자체는 미검증 상태다.

## 남은 재현 절차

```bash
# Docker Desktop 실행 및 로컬 공개 설정을 .env.local에 반영 후
npm run supabase:start
npm run db:reset
npx supabase test db
RUN_SUPABASE_E2E=1 npm run test:e2e
npm run verify
```

## 롤백

- Vercel: 마지막 정상 배포를 Promote한다.
- DB: 파괴적 down migration 대신 Supabase 백업 복구 또는 새 프로젝트에 마지막 정상 마이그레이션까지 재적용한다.
- 현재는 프로덕션 DB/배포가 없으므로 코드·마이그레이션 파일 변경만 되돌리면 된다.
