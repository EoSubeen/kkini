# 끼니 개발 팀 명세

## 목표

회원가입·로그인, 입력 정보와 진단 결과의 영구 저장, 재무 진단·샌드위치 레시피·점검 기능을 모바일 웹으로 구현하고 검증 가능한 상태로 배포한다.

## 팀 구조

| 역할 | 책임 | 주요 쓰기 경계 |
| --- | --- | --- |
| `architecture-supervisor` | 요구사항, 계약, 공용 설정과 최종 인수 | `docs/architecture/**`, `_workspace/**`, 공용 루트 설정(직렬 작업만) |
| `database-auth` | Supabase Auth, 스키마, 마이그레이션, RLS | `supabase/**`, `docs/database/**` |
| `finance-api` | 재무 계산 엔진, 서버 서비스, API | `src/domain/finance/**`, `src/server/**`, `src/app/api/**` |
| `frontend` | 피그마 기반 모바일 UI와 클라이언트 상태 | `src/app/**`(API 제외), `src/components/**`, `src/styles/**`, `public/**` |
| `qa-release` | 자동 검증, E2E, CI와 배포 증거 | `tests/**`, `.github/workflows/**`, 배포 설정 |

`src/lib/contracts/**`, 루트 `package.json`, 잠금 파일과 공용 설정은 `architecture-supervisor`가 변경 요청을 모아 직렬로 수정한다.

## 협업 패턴

- 전체 흐름: `Supervisor + Pipeline`
- 독립 기반 작업: `Fan-out/Fan-in`
- 기능 구현 후: `Producer-Reviewer`
- 최종 배포: 사람 승인 전에는 프로덕션 변경 금지

## 실행 단계

### 0. 계약 고정

감독 역할이 다음을 확정하고 `_workspace/00_scope/acceptance.md`에 기록한다.

- MVP 화면과 제외 범위
- DB 엔터티 및 소유권
- API 요청·응답 스키마
- 재무 계산의 입력, 단위, 반올림과 고정 사례
- 배포 환경과 환경변수 목록

이 문서가 승인되기 전에는 DB·API·UI 구현을 병렬 시작하지 않는다.

### 1. 기반 병렬 구축

- `database-auth`: 인증, 마이그레이션, RLS와 정책 테스트
- `finance-api`: 순수 계산 모듈과 고정 사례 단위 테스트
- `frontend`: 앱 셸, 라우팅, 디자인 토큰과 정적 화면

각 역할은 다른 역할의 경계 파일을 수정하지 않는다.

### 2. 통합

감독 역할이 공유 계약을 갱신한 뒤 프론트와 API를 연결한다. 통합 결과는 `_workspace/40_integration/integration-report.md`에 기록한다.

### 3. 검증과 배포

`qa-release`가 회원가입부터 재접속 후 저장 데이터 확인까지 핵심 경로를 검증한다. 모든 게이트 통과 후에만 사람 승인으로 배포한다.

## 필수 핸드오프

| 생산자 | 소비자 | 산출물 | 완료 기준 |
| --- | --- | --- | --- |
| 감독 | 전 역할 | `_workspace/00_scope/acceptance.md` | 범위·계약·제외 항목 명시 |
| DB/Auth | API·QA | `_workspace/10_database/schema-evidence.md` | 마이그레이션 및 RLS 증거 포함 |
| Finance/API | Frontend·QA | `_workspace/20_api/api-evidence.md` | 예제 요청·응답과 테스트 로그 포함 |
| Frontend | QA | `_workspace/30_frontend/ui-evidence.md` | 화면 목록과 상태별 검증 포함 |
| QA/Release | 감독 | `_workspace/50_release/release-evidence.md` | 게이트 결과·배포 URL·롤백 방법 포함 |

## 실패 정책

- 계약 불일치: 구현을 멈추고 감독 역할이 계약을 먼저 수정한다.
- 파일 소유권 충돌: 병렬 편집을 중단하고 한 작업만 남겨 직렬화한다.
- 도구·권한 부족: 우회 구현하지 말고 필요한 승인과 대체 검증을 기록한다.
- 계산 근거 부족: 추정값을 제품 로직에 넣지 않고 미결정 항목으로 남긴다.
- 일부 작업 실패: 성공한 산출물을 보존하고 전체 작업을 `incomplete`로 표시한다.
- 배포 게이트 실패: 프로덕션 배포를 중지하고 실패 로그와 복구 단계를 남긴다.

## 최종 인수 기준

- 신규 사용자가 회원가입하고 다시 로그인할 수 있다.
- 입력 정보와 진단·레시피·점검 결과가 사용자별로 영구 저장된다.
- 다른 사용자의 데이터에 접근할 수 없다.
- 기준 고객의 계산값과 계산 근거가 일관된다.
- 모바일 핵심 경로 E2E가 통과한다.
- 린트, 타입 검사, 단위·통합 테스트와 프로덕션 빌드가 통과한다.
- 배포 URL, 환경변수, 마이그레이션과 롤백 절차가 문서화된다.
