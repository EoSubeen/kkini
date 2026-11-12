# 끼니

세대 사이에 끼인 샌드위치 세대를 위한 재무 진단·레시피·점검 서비스다.

## 현재 자산

- 데모: `끼니 샌드위치 진단/index.html`
- 서비스 설명: `끼니 샌드위치 진단.md`
- 디자인·재료 에셋: `assets/`
- 개발 하네스: `docs/harness/kkini/team-spec.md`

## 에이전트 개발 시작점

1. `AGENTS.md`를 읽는다.
2. `docs/harness/kkini/team-spec.md`에서 역할과 파일 소유권을 확인한다.
3. `_workspace/00_scope/acceptance.md`에서 MVP 계약을 먼저 확정한다.
4. 계약 승인 후 DB/Auth, 계산/API, 프론트 기반을 병렬 구축한다.
5. `docs/quality-gates.md`의 검증을 모두 통과한 뒤 배포한다.

## 설치된 하네스

Meta Harness 0.8.4의 Codex 프로젝트 프로필을 사용한다. 출처와 고정 커밋은 `docs/harness/kkini/PROVENANCE.md`에 기록되어 있다.

## 기술 스택

- Next.js 16 App Router + React 19 + TypeScript
- Supabase Auth + Postgres + Row Level Security
- Zod 계약 검증
- Vitest + Testing Library + Playwright
- Vercel 배포 예정

## 로컬 실행

```bash
npm install
cp .env.example .env.local
npm run supabase:start
npm run db:reset
npm run dev
```

Supabase 시작 로그의 URL과 publishable key를 `.env.local`에 넣는다. 전체 검증은 `npm run verify`, 브라우저 검증은 `npm run test:e2e`로 실행한다.

운영 배포에는 별도의 Supabase 프로젝트와 Vercel 환경변수가 필요하다. 서비스 키는 브라우저 번들에 넣지 않는다.
