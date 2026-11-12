# 끼니 모바일 디자인 명세

- Producer: `ui-ux-designer`
- Consumer: `frontend`, `qa-release`
- Status: `incomplete`
- Source of truth: Figma

## 화면 기준

| 화면/흐름 | Figma 기준 | 구현 경로 | 필수 상태 | 상태 |
| --- | --- | --- | --- | --- |
| 홈 | 미연결 | `/home` | 기본·로딩·오류·빈 상태 | 미검수 |
| 진단 | 미연결 | `/diagnosis/**` | 현재·미래·가족 안전망 | 미검수 |
| 레시피 | 미연결 | `/recipe/**` | 선택·해제·추천·저장·빈 조합 | 미검수 |
| 점검 | 미연결 | `/check/**` | 진행 전·진행 중·완료 | 미검수 |
| 설정 | 미연결 | `/settings` | 기본·저장 정보 있음/없음 | 미검수 |

## 디자인 토큰

- Typeface: Pretendard
- Mobile frame: 유동 폭 `100%`, 최대 `540px`
- Review widths: `320 / 375 / 390 / 412px`
- Touch target: 최소 `44 × 44px`
- Colors, spacing, radius, elevation: 피그마 변수와 `src/styles/kkini.css` 대조 필요

## 반응형·접근성 체크리스트

- [ ] 가로 스크롤과 잘림 없음
- [ ] 제목·배지·금액의 의도하지 않은 줄바꿈 없음
- [ ] 하단 내비게이션과 앱 프레임 폭 일치
- [ ] 키보드 포커스와 스크린리더 이름 제공
- [ ] 로딩·오류·빈 상태 제공
- [ ] 이미지 비율과 대체 텍스트 확인

## 프론트엔드 전달 사항

피그마 노드 연결과 화면별 상태 정의가 완료되면 이 섹션에 구현 순서와 예외를 기록한다.
