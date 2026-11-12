# 끼니 시스템 개요

## 권장 MVP 구성

- 클라이언트와 서버: Next.js + TypeScript
- 인증과 데이터베이스: Supabase Auth + PostgreSQL + RLS
- 배포: Vercel, Supabase 관리형 프로젝트
- 검증: 단위 테스트 + API 통합 테스트 + Playwright E2E

실제 패키지 버전은 구현 시작 시 공식 지원 범위를 확인하고 잠금 파일로 고정한다.

## 경계

```text
UI (src/app, src/components)
        ↓ typed contract
API / service (src/app/api, src/server)
        ↓
finance domain (src/domain/finance) ── pure, deterministic
        ↓
repository / Supabase
        ↓
PostgreSQL + RLS
```

- UI는 직접 금융 공식을 계산하지 않는다.
- API는 인증과 입력 검증 없이 데이터 계층을 호출하지 않는다.
- 금융 도메인은 브라우저·DB·프레임워크에 의존하지 않는다.
- 사용자 소유권은 애플리케이션 검사와 RLS를 함께 사용한다.
- 외부 서비스 키와 서비스 역할 키는 서버 환경에만 둔다.

## 초기 결정

- 커스텀 비밀번호 저장이나 자체 인증 서버를 만들지 않는다.
- 재무 입력과 결과는 버전 있는 스냅샷으로 보존해 계산 변경 후에도 근거를 추적한다.
- 계산 가정 버전, 레시피 버전과 생성 시각을 결과에 저장한다.
- 원본 HTML 데모는 구현 근거로 보존하며 제품 런타임에서 직접 사용하지 않는다.

## 미결정 항목

- Next.js와 테스트 도구의 정확한 버전
- 소셜 로그인 포함 여부
- 배포 리전과 데이터 보존 기간
- 공모전 데모 계정과 실제 회원가입의 분리 방식
- 공식 통계·연금 조회값을 수동 기준값으로 둘지 외부 API로 연동할지 여부
