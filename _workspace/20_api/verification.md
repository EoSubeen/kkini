# Finance/API verification

상태: `pass` (전체 빌드와 실제 로컬 DB insert는 통합/QA 단계에서 확인)

## 실행 결과

| 명령 | 결과 |
| --- | --- |
| `npm test -- --run src/domain/finance/engine.test.ts src/server/calculation-service.test.ts` | PASS, 2 files / 9 tests |
| `npx eslint src/domain/finance src/server src/app/api` | PASS, 오류 0 |
| `npm run typecheck` | PASS, 오류 0 (DB/Auth helper 병합 후 재실행) |

## 테스트 범위

- 상환액·대출잔액 정상/무이자 계산
- 집 축소 시 기존 집 주택연금 해제
- 이사 후 새 집 가격으로 주택연금 계산
- 동일 입력·동일 시각 결정성
- 김샌드 현재 월수지 원본 회귀
- 제출 보고서 고정 사례 분리
- 주택연금 재확인 안내
- 비로그인 미저장 / 로그인 저장 경계

## 잔여 확인

1. 전체 `npm run build`는 통합/QA 단계에서 재실행
2. 실제 로컬 Supabase에서 세 스냅샷 insert 및 RLS 확인
3. 저장 3단계를 원자화할 RPC 도입 여부 결정
