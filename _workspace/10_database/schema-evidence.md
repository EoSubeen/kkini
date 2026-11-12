# DB/Auth 핸드오프

상태: `implementation-complete / runtime-db-verification-blocked`

## 생산자와 소비자

- 생산자: `database-auth`
- 소비자: `finance-api`, `frontend`, `qa-release`, `architecture-supervisor`
- 마이그레이션: `202611120001_initial_schema.sql`

## 구현 결과

- Supabase SSR browser/server client와 Next.js 16 `proxy.ts` 세션 갱신
- 이메일·비밀번호 회원가입, 로그인, 로그아웃 server actions
- PKCE callback과 이메일 OTP 확인 route
- `auth.users` 생성 시 `profiles` 자동 생성
- 사용자 소유 8개 테이블에 RLS 강제 및 29개 정책
- 입력·계산 스냅샷 UPDATE 차단
- 관계마다 `(참조 id, user_id)` 복합 외래키 적용
- 서비스 역할 키나 실제 개인정보 없음

## API가 사용할 계약

서버 client:

```ts
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
```

저장 순서:

1. `financial_input_snapshots`: `user_id`, 선택 `household_id`, `schema_version`, `input`
2. `calculation_snapshots`: `user_id`, `financial_input_snapshot_id`, `calculation_version`, `assumption_version`, `result` (`money_unit` 기본 `KRW_10K`)
3. `recipe_selections`: `user_id`, `calculation_snapshot_id`, `selected_recipe_ids`, `housing`

모든 insert의 `user_id`는 `supabase.auth.getUser()`의 서버 검증 결과를 사용한다.

## 검증 증거

| 명령 | 결과 |
| --- | --- |
| `npx eslint src/lib/supabase src/app/auth src/proxy.ts` | 종료 0 |
| `npx tsc --noEmit` | 종료 0 |
| `git diff --check -- supabase src/lib/supabase src/app/auth src/proxy.ts docs/database _workspace/10_database` | 종료 0 |
| RLS 정책 정적 개수 | 8개 테이블, 29개 정책 |
| `docker info` | 실패: 로컬 Docker daemon 미실행 |
| Supabase CLI 실행 | 샌드박스가 `~/.supabase` 생성을 차단 |

`supabase/tests/rls_policies.sql`은 RLS 활성화·정책 구성을 17개 assertion으로 검사한다. `supabase/tests/owner_isolation.sql`은 소유자 insert/read, 타 사용자 read/insert 거부, 비로그인 read 거부를 5개 assertion으로 검사한다.

## QA 재현 절차

Docker Desktop을 실행한 환경에서:

```sh
npm run supabase:start
npm run db:reset
npx supabase test db
```

기대 결과: 전체 마이그레이션 성공, pgTAP 22개 assertion 성공. 그 뒤 `.env.example`의 URL과 publishable key를 로컬 출력값으로 채운다.

## 알려진 제한과 운영 설정

- 현재 실행 환경에는 Docker daemon이 없어 실제 PostgreSQL 마이그레이션과 pgTAP을 실행하지 못했다. 따라서 DB 런타임 게이트는 아직 미통과다.
- 로컬 `config.toml`은 개발 편의를 위해 이메일 확인을 끈다. 프로덕션 Supabase Dashboard에서는 이메일 확인을 켜고 Site URL·Redirect URL을 실제 Vercel 도메인으로 제한해야 한다.
- 비밀번호 재설정 UI와 action은 이번 역할 범위에 포함하지 않았다.
- `financial_input_snapshots.household_id`는 MVP API가 가구 편집 전에도 저장할 수 있도록 선택값이다.

## 롤백

아직 프로덕션 DB에는 적용하지 않았다. 개발 DB는 `supabase db reset`으로 재생성한다. 프로덕션 적용 뒤에는 파괴적 down migration 대신 Supabase 백업 복구 또는 새 프로젝트에 마지막 정상 마이그레이션까지 재적용한다.
