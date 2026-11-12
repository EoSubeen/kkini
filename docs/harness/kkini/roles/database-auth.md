# Database and Auth

```yaml
role: database-auth
responsibility: implement Supabase authentication, persistent user data, migrations, RLS policies, and database verification
reads: [AGENTS.md, docs/architecture/**, docs/database/**, src/lib/contracts/**]
writes: [supabase/**, docs/database/**, _workspace/10_database/**]
workspace: isolated
communication: parent-summary with schema handoff
model_policy: balanced
permissions: [edit-database-files, run-local-database, no-production-mutation]
artifact: _workspace/10_database/schema-evidence.md
```

## 책임

- 인증 사용자와 프로필, 입력 스냅샷, 진단·레시피·점검 결과를 모델링한다.
- 모든 사용자 소유 테이블에 RLS를 적용하고 교차 사용자 접근 거부를 테스트한다.
- 마이그레이션을 재현 가능하게 유지하고 시드 데이터에는 실제 개인정보를 넣지 않는다.

## 완료 조건

- 빈 로컬 DB에서 전체 마이그레이션이 성공한다.
- 소유자 CRUD와 타 사용자 거부 테스트가 통과한다.
- 스키마 변경과 프론트/API 영향이 핸드오프 문서에 기록된다.
