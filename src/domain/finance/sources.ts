// 계산에 쓴 통계·제도값과 출처(r6 데모 '근거' 탭과 같은 목록, 2026.11 기준).
export interface SourceRow { item: string; value: string; status: "교차확인" | "추정"; url: string }

export const SOURCES: SourceRow[] = [
  {
    "item": "국민연금 예상액 (예시값)",
    "value": "174만 원은 최종 B안 가상 입력값·개인조회 확정액 아님",
    "status": "교차확인",
    "url": "https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0095M0.do"
  },
  {
    "item": "신용카드 등 소득공제",
    "value": "문턱 25% · 15/30/40% · 한도 250~300+200~300만",
    "status": "교차확인",
    "url": "https://wikidocs.net/blog/@Insight_Lab/22631/"
  },
  {
    "item": "2026 세제개편안 (카드)",
    "value": "대중교통 우대 폐지 등, 정부안",
    "status": "추정",
    "url": "https://news.mtn.co.kr/news-detail/2026080315521251297"
  },
  {
    "item": "실손 4·5세대 자기부담률",
    "value": "5세대 비급여 중증 30% · 비중증 50%",
    "status": "교차확인",
    "url": "https://fsc.go.kr/po010101/86831"
  },
  {
    "item": "수급 개시·조기 감액·연기 가산",
    "value": "출생연도별 정상수급 · 조기 연6% · 연기 연7.2%",
    "status": "교차확인",
    "url": "https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0056M0.do?menuId=MN24001118"
  },
  {
    "item": "2026 연금개혁",
    "value": "2026년9.5%→매년0.5%p→2033년13%; 개인급여 별도",
    "status": "교차확인",
    "url": "https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0104M0.do"
  },
  {
    "item": "임의가입 최저 보험료",
    "value": "월 9.6만 원 (1,013,000원 × 9.5%)",
    "status": "교차확인",
    "url": "https://wikidocs.net/blog/@Insight_Lab/23188/"
  },
  {
    "item": "퇴직연금 위험자산 한도",
    "value": "70% (2015 개정, 상향 논의 중·미확정)",
    "status": "교차확인",
    "url": "https://www.newstomato.com/ReadNews.aspx?no=1308001"
  },
  {
    "item": "임금피크 세후감액률",
    "value": "56~59세 10~34%",
    "status": "추정",
    "url": "https://bizhankook.com/articles/8545.html"
  },
  {
    "item": "적정·최소 노후생활비",
    "value": "부부 298.1 · 216.6만 원",
    "status": "교차확인",
    "url": "https://www.segye.com/newsView/20260530504495"
  },
  {
    "item": "세후 실수령 (연봉 9천)",
    "value": "약 597만 원/월",
    "status": "교차확인",
    "url": "https://www.jobplanet.co.kr/contents/news-7982"
  },
  {
    "item": "연금계좌 세액공제",
    "value": "600/900만 원 · 16.5/13.2%",
    "status": "교차확인",
    "url": "https://wikidocs.net/blog/@TaxSave/25192/"
  },
  {
    "item": "연금소득세·분리과세",
    "value": "과세재원 연1500만원 초과16.5% 분리과세 선택 시나리오",
    "status": "교차확인",
    "url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7889&mi=6609"
  },
  {
    "item": "교육비 세액공제",
    "value": "1인 900만 원 · 15%",
    "status": "교차확인",
    "url": "https://wikidocs.net/blog/@Insight_Lab/23876/"
  },
  {
    "item": "주택연금 (6억 원, 종신 정액형)",
    "value": "2026.6.1 일반주택 일람표: 연소자63세·6억 원·정액형·일시인출금0원 월141만 원. 미래 가입 시 재조회",
    "status": "교차확인",
    "url": "https://www.hf.go.kr/ko/sub03/sub03_02_02.do"
  },
  {
    "item": "50대 평균 자산·순자산",
    "value": "6억 6,205 · 5억 5,161만 원",
    "status": "교차확인",
    "url": "https://www.fnnews.com/news/202512061252213954"
  },
  {
    "item": "사립대 등록금",
    "value": "연 823만 원",
    "status": "교차확인",
    "url": "https://www.heraldk.com/article/2026042819000056070"
  },
  {
    "item": "국가장학금 구간",
    "value": "재단 확정구간 입력; 월급·집값만으로 판정하지 않음",
    "status": "교차확인",
    "url": "https://www.kosaf.go.kr/ko/scholarnf.do?page=5&pg=scholarship05_12_08p"
  },
  {
    "item": "기초연금",
    "value": "2026 소득인정액 단독247·부부395.2만 원; 추가조건 확인",
    "status": "교차확인",
    "url": "https://www.korea.kr/news/policyNewsView.do?newsId=148957428"
  },
  {
    "item": "65세 이상 진료비",
    "value": "연 550.8만 원",
    "status": "교차확인",
    "url": "https://www.reportera.co.kr/news/health-insurance-crisis-with-52-trillion-won-in-medical-expenses-for-the-elderly/"
  },
  {
    "item": "예금금리",
    "value": "정기예금 평균 3.14% (2026.8) → 계산은 보수적으로 연 3.0% 적용",
    "status": "교차확인",
    "url": "https://eiec.kdi.re.kr/policy/materialView.do?num=287550"
  },
  {
    "item": "퇴직소득세 연금수령 감면",
    "value": "10년 이하 30 · 11~20년 40 · 20년 초과 50%",
    "status": "교차확인",
    "url": "https://maily.so/pensionletter/posts/e9o0805qz8w"
  },
  {
    "item": "의료비 세액공제",
    "value": "총급여 3% 초과 · 15/20/30% · 일반 700만 한도",
    "status": "교차확인",
    "url": "https://wikidocs.net/blog/@Insight_Lab/23619/"
  },
  {
    "item": "퇴직연금 수익률",
    "value": "2025년 6.5% → 장기 가정 4%",
    "status": "추정",
    "url": "https://www.mt.co.kr/stock/2026/05/20/2026052009025934325"
  },
  {
    "item": "결혼비용",
    "value": "신혼집 제외 약 5,912만 원",
    "status": "추정",
    "url": "https://bravo.etoday.co.kr/view/atc_view/20156"
  },
  {
    "item": "1세대 1주택 양도세 비과세",
    "value": "2년 보유 · 양도가 12억 원 이하",
    "status": "교차확인",
    "url": "https://tilnote.io/pages/69ffe6e8f8d829d171c402e0"
  },
  {
    "item": "주택 취득세·중개보수",
    "value": "취득세 6억 이하 1% · 6~9억 1~3% · 9억 초과 3% / 중개 2~9억 0.4%",
    "status": "교차확인",
    "url": "https://kbthink.com/house/costs.html"
  },
  {
    "item": "2026 세제개편안 (부동산)",
    "value": "종부세 1주택 공제 12→14억 등, 정부안",
    "status": "추정",
    "url": "https://kbmaeil.com/article/20260803500668"
  },
  {
    "item": "유족연금 중복급여",
    "value": "본인연금+유족30%와 유족전액 중 큰 값, 지급정지 별도",
    "status": "교차확인",
    "url": "https://www.npsonair.kr/advantages/2302"
  }
];
