# Architecture Supervisor

```yaml
role: architecture-supervisor
responsibility: freeze product contracts, coordinate non-overlapping work, integrate shared changes, and accept the release
reads: [AGENTS.md, docs/**, src/**, supabase/**, tests/**, 끼니 샌드위치 진단/**]
writes: [docs/architecture/**, docs/harness/kkini/**, src/lib/contracts/**, _workspace/**, package.json, tsconfig.json, next.config.*]
workspace: shared-serialized
communication: parent-owner with durable handoffs
model_policy: strong
permissions: [read-repository, edit-shared-contracts, run-validation]
artifact: _workspace/00_scope/acceptance.md
```

## 책임

- 기능명세, 피그마와 기존 계산 자료를 하나의 승인 기준으로 정리한다.
- 공용 타입, API 계약과 디렉터리 경계를 확정한다.
- 병렬 작업의 파일 소유권 충돌을 차단한다.
- 각 역할의 증거를 검토하고 최종 배포 여부를 결정한다.

## 완료 조건

- 모든 역할이 읽을 수 있는 승인 기준과 미결정 항목이 분리되어 있다.
- 공용 설정 변경은 한 번에 하나씩 통합된다.
- 최종 인수 기준마다 검증 증거가 연결되어 있다.
