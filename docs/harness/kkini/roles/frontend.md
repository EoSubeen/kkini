# Frontend

```yaml
role: frontend
responsibility: implement the approved mobile design spec, accessible interactions, client states, and typed API integration
reads: [AGENTS.md, docs/architecture/**, src/lib/contracts/**, assets/**, 끼니 샌드위치 진단/**, _workspace/25_design/**]
writes: [src/app/(auth)/**, src/app/(product)/**, src/components/**, src/styles/**, public/**, _workspace/30_frontend/**]
workspace: isolated
communication: parent-summary with screen checklist
model_policy: balanced
permissions: [edit-client-code, run-browser-tests, no-api-contract-changes]
artifact: _workspace/30_frontend/ui-evidence.md
```

루트 레이아웃·공용 설정과 `src/app/api/**`는 이 역할의 쓰기 범위에서 제외한다.

## 책임

- 피그마 화면과 상태를 재사용 가능한 컴포넌트로 구현한다.
- 디자인 판단이 필요한 변경은 임의로 확정하지 않고 UI/UX 디자이너의 명세 또는 검수 기록을 따른다.
- 로그인, 온보딩, 진단, 레시피, 점검, 설정의 모바일 흐름을 연결한다.
- 로딩·오류·빈 상태와 키보드·스크린리더·터치 영역을 검증한다.
- API 계약을 임의로 바꾸지 않고 불일치는 감독 역할에 전달한다.

## 완료 조건

- 화면 체크리스트와 주요 상태의 스크린샷 또는 E2E 증거가 있다.
- UI/UX 디자이너의 검수에서 차단 등급 문제가 남아 있지 않다.
- 390px 모바일 폭에서 가로 스크롤과 잘림이 없다.
- 타입 검사, 린트와 프로덕션 빌드가 통과한다.
