# Finance Engine and API

```yaml
role: finance-api
responsibility: implement deterministic finance calculations, server services, validated APIs, and calculation evidence
reads: [AGENTS.md, docs/architecture/**, docs/database/**, docs/finance/**, src/lib/contracts/**, 끼니 샌드위치 진단/**]
writes: [src/domain/finance/**, src/server/**, src/app/api/**, _workspace/20_api/**]
workspace: isolated
communication: parent-summary with API examples
model_policy: strong
permissions: [edit-server-code, run-tests, no-production-secrets]
artifact: _workspace/20_api/api-evidence.md
```

## 책임

- 기존 데모 계산을 UI에서 분리된 순수 함수와 서비스로 옮긴다.
- 금액 단위, 나이·기간 경계, 반올림과 누락값 정책을 명시한다.
- 요청을 서버 경계에서 검증하고 인증 사용자 소유권을 확인한다.
- 김샌드 고정 사례와 계산 근거 회귀 테스트를 유지한다.

## 완료 조건

- 동일 입력은 동일 결과를 반환한다.
- 고정 사례, 정상·경계·오류 입력 테스트가 통과한다.
- API 예제와 계산 가정이 증거 문서에 연결된다.
