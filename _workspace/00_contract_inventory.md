# Phase 0 계약 인벤토리

```yaml
status: complete
producer: phase-0-auditor
consumer: architecture-supervisor
operation_classification: new-harness
installed_runtime: codex
portable_skill: .agents/skills/harness
native_profiles: 5
compatibility_risks: []
stale_artifacts: []
source_commit: b6f54317249478f4c196cabe68e1c948aaa6a404
```

## 기존 자산

- `끼니 샌드위치 진단/index.html`: 계산과 화면 흐름을 확인할 수 있는 데모
- `끼니 샌드위치 진단.md`: 화면·진단 설명 자료
- `assets/**`: 브랜드, 캐릭터, 샌드위치 재료 및 UI 에셋
- Figma: 모바일 화면과 디자인 시스템의 시각 기준

## 설치 결과

- Meta Harness 휴대형 스킬을 프로젝트 범위 copy 모드로 설치한다.
- Codex 역할 프로필은 휴대형 역할 문서에서 생성하며 직접 편집하지 않는다.
- `AGENTS.md`와 프로젝트 문서는 끼니 저장소가 직접 소유한다.

## 다음 결정

- MVP 기능과 제외 범위 승인
- Next.js·Supabase 프로젝트 생성 위치와 버전 고정
- API 계약과 계산 입력 스키마 확정
- 개발·프리뷰·프로덕션 환경 분리
