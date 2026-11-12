# 끼니 에이전트 작업 안내

이 저장소는 샌드위치 세대의 재무 진단·레시피·점검 서비스를 구현한다.
에이전트는 작업 전에 아래 문서를 필요한 범위만 읽고, 근거 없이 금융 계산이나 데이터 구조를 추측하지 않는다.

## 먼저 읽을 문서

- 팀 구성과 작업 순서: `docs/harness/kkini/team-spec.md`
- 시스템 경계: `docs/architecture/system-overview.md`
- 데이터 모델: `docs/database/schema.md`
- 품질 게이트: `docs/quality-gates.md`
- 재사용 하네스 절차: `.agents/skills/harness/SKILL.md`

## 공통 규칙

- 한 작업의 작성자는 팀 명세에 선언된 쓰기 경계만 수정한다.
- 동일 파일을 여러 에이전트가 동시에 편집하지 않는다. 공용 설정 변경은 감독 역할이 직렬화한다.
- 사용자 입력, 진단 결과와 재무 계산값은 서버 경계에서 검증한다.
- 재무 계산 로직은 UI와 분리하고, 고정 사례와 경계값 회귀 테스트를 함께 작성한다.
- 인증 사용자의 데이터는 본인만 읽고 쓸 수 있도록 데이터베이스 정책으로 강제한다.
- 비밀키, 실제 개인정보, 서비스 역할 키를 커밋하거나 로그에 남기지 않는다.
- 완료 보고에는 변경 파일, 실행한 검증, 남은 위험을 포함한다.
- 테스트·린트·타입 검사·빌드 중 해당되는 검증이 실패하면 완료로 보고하지 않는다.

## 제품 기준

- 모바일 우선, 한국어 UI, Pretendard를 기본 글꼴로 사용한다.
- 피그마가 화면 구조와 시각 디자인의 기준이다.
- 계산 결과는 교육·모의설계 목적이며 공식 조회값과 전문가 확인이 필요하다는 고지를 유지한다.
- 접근성, 44px 이상의 터치 영역, 명확한 로딩·오류·빈 상태를 포함한다.

## 현재 단계

현재 HTML 데모와 디자인 에셋은 참고 자료다. 본 구현의 스택과 디렉터리가 확정되기 전에는 기존 데모 파일을 삭제하거나 대규모 이동하지 않는다.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
