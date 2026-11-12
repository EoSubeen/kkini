# 의존성 점검

점검일: 2026-11-12

- `npm audit --omit=dev`: 운영 의존성 취약점 0건
- 전체 `npm audit`: 중간 등급 7건
- 잔여 항목은 ESLint/TypeScript ESLint 경로의 개발 전용 `minimatch` 전이 의존성이다.
- `npm audit fix --force`는 호환성 파괴 가능성이 있어 적용하지 않는다.
- 배포 전 운영 의존성 0건을 필수 게이트로 유지하고 개발 도구 업데이트 시 재점검한다.
