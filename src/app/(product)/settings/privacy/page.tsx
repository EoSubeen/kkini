import { Card, PageIntro, SectionHeading } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="설정"
        title="개인정보와 보안"
        description="끼니가 저장하는 정보와 보호 방식을 확인하세요."
      />
      <Card className="section-stack">
        <SectionHeading title="저장하는 정보" />
        <p>로그인 계정, 사용자가 입력한 가족·소득·지출·자산 정보, 진단 결과, 레시피 선택과 점검 상태를 저장해요.</p>
      </Card>
      <Card className="section-stack">
        <SectionHeading title="내 정보 보호" />
        <p>로그인한 사용자 본인만 자신의 데이터를 읽고 쓸 수 있도록 데이터베이스 정책으로 제한해요. 비밀번호는 끼니가 직접 저장하지 않아요.</p>
      </Card>
      <Card className="section-stack">
        <SectionHeading title="안전하게 이용하기" />
        <p>공용 기기에서는 사용을 마친 뒤 설정 화면에서 로그아웃하고, 다른 서비스에서 쓰지 않는 비밀번호를 사용해 주세요.</p>
      </Card>
      <p className="notice">진단 결과는 교육·모의설계 목적이며 실제 금융 결정 전 공식 기관 조회와 전문가 확인이 필요해요.</p>
    </div>
  );
}
