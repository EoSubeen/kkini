# 끼니 배포 런북

## 1. Supabase 프로젝트

1. 운영용 Supabase 프로젝트를 만든다.
2. 로컬에서 검증한 `supabase/migrations/`를 운영 프로젝트에 적용한다.
3. 이메일 인증을 켜고 Site URL과 Redirect URL을 운영 도메인으로 설정한다.
4. RLS가 모든 사용자 데이터 테이블에 활성화됐는지 확인한다.
5. 운영 데이터에는 데모용 개인 식별 정보나 로컬 seed를 넣지 않는다.

## 2. Vercel 환경변수

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Preview와 Production 환경을 분리한다. Supabase secret/service-role key는 현재 웹 앱에 필요하지 않으며 브라우저 공개 변수로 등록하면 안 된다.

## 3. 배포 전 게이트

```bash
npm ci
npm run verify
npm run test:e2e
npm audit --omit=dev
```

추가 확인:

- 신규 계정 가입 → 이메일 확인 → 로그인 → 로그아웃 → 세션 복원
- 사용자 A가 사용자 B의 프로필·계산 스냅샷·점검 항목을 읽거나 수정할 수 없음
- 입력 저장 후 새 기기/브라우저에서 동일 계정으로 복원
- 레시피 결과와 계산근거 버전이 스냅샷에 함께 저장
- 모바일 390px 뷰포트에서 고정 하단 메뉴가 콘텐츠를 가리지 않음

## 4. 배포 후

1. Production URL에서 smoke test를 반복한다.
2. Supabase Auth·Database 로그와 Vercel Function 로그를 확인한다.
3. 공식 통계·세법·연금 가정의 기준일과 계산 버전을 사용자 화면에 표시한다.
4. 롤백이 필요하면 이전 Vercel 배포를 Promote하고, DB 마이그레이션은 별도 역방향 스크립트로 처리한다.
