import { useState, useEffect } from 'react';

// AI머니야 로고 URL (Firebase Storage)
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a";

// 오상열 대표 사진 URL (Firebase Storage)
const PROFILE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%98%A4%EC%83%81%EC%97%B4%20%EC%82%AC%EC%A7%84.png?alt=media&token=63eaf15e-9d0b-4d72-8fbb-ee03d6ecc8e5';

// 이용약관 내용
const TERMS_CONTENT = `AI머니야 서비스 이용약관

제정일: 2026년 1월 21일
시행일: 2026년 1월 21일

제1조 (목적)
본 약관은 오원트금융연구소(이하 "회사")가 제공하는 AI머니야 모바일 애플리케이션 및 관련 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 서비스 이용조건 및 절차 등 기본적인 사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
본 약관에서 사용하는 용어의 정의는 다음과 같습니다.
1. "서비스"란 회사가 제공하는 AI머니야 애플리케이션을 통한 개인 재무관리, AI 금융코칭, 예산 수립, 지출 분석, 재무설계 등 제반 서비스를 의미합니다.
2. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.
3. "회원"이란 회사와 서비스 이용계약을 체결하고 회원 ID를 부여받은 자를 말합니다.
4. "AI 금융코치"란 인공지능 기술을 활용한 대화형 재무 상담 및 관리 서비스를 의미합니다.
5. "금융집짓기®"란 회사가 제공하는 체계적 재무설계 프로그램을 의미합니다.
6. "DESIRE 로드맵"이란 회사가 제공하는 6단계 재무목표 달성 프로세스를 의미합니다.

제3조 (약관의 명시, 효력 및 변경)
1. 회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면 및 애플리케이션 내에 게시합니다.
2. 회사는 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」(이하 "정보통신망법"), 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.
3. 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 애플리케이션 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
4. 이용자는 변경된 약관에 동의하지 않을 권리가 있으며, 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 이용계약을 해지할 수 있습니다.

제4조 (약관 외 준칙)
본 약관에서 정하지 아니한 사항과 본 약관의 해석에 관하여는 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」, 「정보통신망법」 및 관련 법령 또는 상관례에 따릅니다.

제5조 (이용계약의 성립)
1. 이용계약은 이용자가 본 약관의 내용에 대하여 동의한 후 회원가입 신청을 하고, 회사가 이러한 신청에 대하여 승낙함으로써 성립합니다.
2. 회원가입은 다음 각 호의 방법으로 진행됩니다.
가. 구글 계정을 통한 소셜 로그인
나. 네이버 계정을 통한 소셜 로그인 (향후 제공 예정)
다. 카카오 계정을 통한 소셜 로그인 (향후 제공 예정)
라. 기타 회사가 지정하는 방법

제6조 (서비스의 내용)
회사가 제공하는 서비스의 내용은 다음 각 호와 같습니다.
1. AI 대화형 금융 상담 서비스 ("지출 전 대화" 기능)
2. 개인 재무진단 및 분석 서비스
3. 예산 수립 및 관리 서비스
4. 수입·지출 기록 및 분석 서비스
5. 금융집짓기® 재무설계 서비스
6. DESIRE 로드맵 제공 및 진행 관리
7. 재무 목표 설정 및 추적 관리
8. AI 절약 꿀팁 제공
9. 금융 교육 콘텐츠 제공
10. 기타 회사가 추가 개발하거나 제휴계약 등을 통해 이용자에게 제공하는 일체의 서비스

제7조 (서비스의 변경 및 중단)
1. 회사는 상당한 이유가 있는 경우에 운영상, 기술상의 필요에 따라 제공하고 있는 전부 또는 일부 서비스를 변경할 수 있습니다.
2. 서비스의 내용, 이용방법, 이용시간에 대하여 변경이 있는 경우에는 변경사유, 변경될 서비스의 내용 및 제공일자 등은 그 변경 전에 애플리케이션 내 공지사항을 통해 게시합니다.

제8조 (정보의 제공 및 광고의 게재)
1. 회사는 이용자가 서비스 이용 중 필요하다고 인정되는 다양한 정보를 공지사항이나 전자우편, 푸시 알림 등의 방법으로 이용자에게 제공할 수 있습니다.
2. 회사는 서비스의 운영과 관련하여 애플리케이션 화면, 전자우편 등에 광고를 게재할 수 있습니다.

제9조 (게시물의 관리)
회사는 다음 각 호에 해당하는 게시물이나 자료를 사전통지 없이 삭제하거나 이동 또는 등록 거부를 할 수 있습니다.
가. 다른 이용자 또는 제3자에게 심한 모욕을 주거나 명예를 손상시키는 내용인 경우
나. 공공질서 및 미풍양속에 위반되는 내용을 유포하거나 링크시키는 경우
다. 불법복제 또는 해킹을 조장하는 내용인 경우
라. 영리를 목적으로 하는 광고일 경우
마. 범죄적 행위에 결부된다고 인정되는 내용일 경우

제10조 (저작권의 귀속 및 이용제한)
1. 회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.
2. 이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.

제11조 (개인정보보호)
1. 회사는 이용자의 개인정보 수집 시 서비스제공을 위하여 필요한 범위에서 최소한의 개인정보를 수집합니다.
2. 회사는 회원가입 시 서비스 제공에 필수적인 정보를 필수항목으로 수집하며, 선택적 정보는 별도 동의를 받아 수집합니다.
3. 개인정보의 처리에 관한 자세한 사항은 별도의 "개인정보처리방침"에 따릅니다.

제12조 (회사의 의무)
1. 회사는 관련 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 본 약관이 정하는 바에 따라 지속적이고, 안정적으로 서비스를 제공하는데 최선을 다하여야 합니다.
2. 회사는 이용자가 안전하게 인터넷 서비스를 이용할 수 있도록 이용자의 개인정보(신용정보 포함)보호를 위한 보안 시스템을 구축합니다.

제13조 (회원의 의무)
1. 이용자는 다음 각 호의 행위를 하여서는 안됩니다.
가. 신청 또는 변경 시 허위내용의 등록
나. 타인의 정보도용
다. 회사에 게시된 정보의 변경
라. 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시
마. 회사 기타 제3자의 저작권 등 지적재산권에 대한 침해

제14조 (서비스 이용시간)
서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간 운영을 원칙으로 합니다.

제15조 (유료서비스)
1. 회사는 다음 각 호의 유료서비스를 제공할 수 있습니다.
가. 프리미엄 재무설계 리포트
나. 1:1 전문가 화상 상담
다. 금융집짓기® 프리미엄 패키지
라. 기타 회사가 정하는 유료 콘텐츠 및 서비스

제16조 (환불 및 청약철회)
이용자는 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 구매일로부터 7일 이내에 청약철회를 할 수 있습니다.

제17조 (면책조항)
1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
2. 회사가 제공하는 AI 금융코칭 서비스는 참고용 정보 제공을 목적으로 하며, 실제 금융상품 가입, 투자 결정 등은 이용자 본인의 판단과 책임 하에 이루어져야 합니다.

제18조 (재판권 및 준거법)
1. 회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다.
2. 회사와 이용자 간에 제기된 전자상거래 소송에는 대한민국 법을 적용합니다.

부칙
본 약관은 2026년 1월 21일부터 적용됩니다.`;

// 개인정보처리방침 내용
const PRIVACY_CONTENT = `AI머니야 개인정보처리방침

제정일: 2026년 1월 21일
시행일: 2026년 1월 21일

오원트금융연구소(이하 "회사")는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.

제1조 (개인정보의 처리목적)
회사는 다음의 목적을 위하여 개인정보를 처리합니다.

1. 회원 가입 및 관리
- 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지, 고충처리 목적

2. 재무관리 서비스 제공
- 개인 맞춤형 재무진단 및 분석, 예산 수립 및 관리, 수입·지출 분석, 재무설계(금융집짓기®) 서비스 제공, DESIRE 로드맵 제공, 재무목표 설정 및 추적 관리

3. AI 금융코칭 서비스 제공
- 대화형 금융 상담, 지출 패턴 분석, 맞춤형 절약 제안, 금융 관련 질의응답, 행동 변화 추적 및 피드백

4. 마케팅 및 광고에 활용
- 신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공

제2조 (처리하는 개인정보 항목)
회사는 다음의 개인정보 항목을 처리하고 있습니다.

1. 필수항목
가. 회원가입 시: 이름(닉네임), 이메일 주소, 프로필 사진(선택), 소셜 계정 고유식별자
나. 재무관리 서비스 이용 시: 총자산, 총부채, 순자산, 월소득, 월지출, 고정지출, 변동지출, 저축액, 투자액
다. AI 금융코칭 이용 시: 대화 내용(텍스트), 음성 데이터(음성입력 이용 시)

2. 선택항목
- 전화번호, 생년월일, 성별, 마케팅 정보 수신 동의

3. 자동 수집 정보
- 접속 로그, 쿠키, 접속 IP 정보, 서비스 이용 기록, 기기정보(OS 버전, 기기 모델명)

제3조 (개인정보의 처리 및 보유기간)
1. 회원가입 및 관리: 회원 탈퇴 시까지
2. 재무관리 서비스 제공: 서비스 제공 완료 후 5년
3. AI 대화 내용: 서비스 제공 완료 후 1년

제4조 (개인정보의 제3자 제공)
회사는 현재 개인정보를 제3자에게 제공하고 있지 않습니다. 향후 제3자 제공이 필요한 경우, 별도의 동의를 받습니다.

제5조 (개인정보처리의 위탁)
회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
- Google LLC: 소셜 로그인 인증, 클라우드 서버 호스팅
- OpenAI / Anthropic: AI 대화 서비스 제공

제6조 (개인정보의 파기)
회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.

제7조 (정보주체의 권리·의무 및 행사방법)
정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
- 개인정보 열람요구
- 오류 등이 있을 경우 정정 요구
- 삭제요구
- 처리정지 요구

제8조 (개인정보의 안전성 확보조치)
회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
1. 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육
2. 기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 개인정보의 암호화, 보안프로그램 설치
3. 물리적 조치: 전산실, 자료보관실 등의 접근통제

제9조 (개인정보 자동 수집 장치의 설치·운영 및 거부)
회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 '쿠키(cookie)'를 사용합니다.

제10조 (개인정보 보호책임자)
성명: 오상열
직책: 대표
전화번호: 010-5424-5332
이메일: ggorilla11@gmail.com

제11조 (개인정보 열람청구)
정보주체는 개인정보 열람 청구를 아래의 담당자에게 할 수 있습니다.
담당자: 오상열
전화번호: 010-5424-5332
이메일: ggorilla11@gmail.com

제12조 (권익침해 구제방법)
정보주체는 아래의 기관에 대해 개인정보 침해에 대한 피해구제, 상담 등을 문의하실 수 있습니다.
- 개인정보 침해신고센터 (한국인터넷진흥원): privacy.kisa.or.kr, 전화 118
- 개인정보 분쟁조정위원회: www.kopico.go.kr, 전화 1833-6972
- 대검찰청 사이버범죄수사단: 02-3480-3573, www.spo.go.kr
- 경찰청 사이버안전국: 전화 182, cyberbureau.police.go.kr

제13조 (개인정보 처리방침 변경)
이 개인정보처리방침은 2026년 1월 21일부터 적용됩니다.`;

interface FinancialResult {
  name: string;
  age: number;
  income: number;
  assets: number;
  debt: number;
  wealthIndex: number;
  level: number;
  houseName: string;
  houseImage: string;
  message: string;
}

// DESIRE 단계별 집/날씨 정의
const DESIRE_STAGES = [
  { stage: 1, label: 'D', name: 'Debt Free', house: '🏚️', houseName: '초가집', weather: '⛈️', weatherName: '폭풍우', color: 'text-red-600', bgColor: 'from-red-100 to-red-200' },
  { stage: 2, label: 'E', name: 'Emergency Fund', house: '🏡', houseName: '나무집', weather: '☁️', weatherName: '흐림', color: 'text-orange-600', bgColor: 'from-orange-100 to-orange-200' },
  { stage: 3, label: 'S', name: 'Savings', house: '🏠', houseName: '벽돌집', weather: '⛅', weatherName: '구름', color: 'text-yellow-600', bgColor: 'from-yellow-100 to-yellow-200' },
  { stage: 4, label: 'I', name: 'Investment', house: '🏢', houseName: '콘크리트', weather: '☀️', weatherName: '맑음', color: 'text-blue-600', bgColor: 'from-blue-100 to-blue-200' },
  { stage: 5, label: 'R', name: 'Retirement', house: '🏛️', houseName: '대리석', weather: '🌤️', weatherName: '화창', color: 'text-purple-600', bgColor: 'from-purple-100 to-purple-200' },
  { stage: 6, label: 'E', name: 'Enjoy & Estate', house: '🏰', houseName: '고급주택', weather: '🌈', weatherName: '무지개', color: 'text-emerald-600', bgColor: 'from-emerald-100 to-emerald-200' },
];

// 로마숫자 변환
const toRoman = (num: number): string => {
  const romans = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ'];
  return romans[num - 1] || '';
};

interface MyPageProps {
  userName: string;
  userEmail: string;
  userPhoto: string | null;
  financialResult: FinancialResult | null;
  onNavigate: (page: 'subscription' | 'consulting' | 'monthly-report') => void;
  onLogout: () => void;
  onReset: () => void;
}

export default function MyPage({
  userName,
  userEmail,
  userPhoto: _userPhoto,
  financialResult: _financialResult,
  onNavigate,
  onLogout,
  onReset
}: MyPageProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [desireStage, setDesireStage] = useState<number | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // 금융집짓기 DESIRE 단계 데이터 로드
useEffect(() => {
    const savedDesireData = localStorage.getItem('moneya_desire_stage');
    if (savedDesireData) {
      try {
        const parsed = JSON.parse(savedDesireData);
        setDesireStage(parsed.stage || null);
      } catch (e) {
        console.error('DESIRE 데이터 파싱 에러:', e);
      }
    }
  }, []);

  const currentDesire = desireStage ? DESIRE_STAGES.find(d => d.stage === desireStage) : null;

  const handleLogout = () => {
    onLogout();
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleResetConfirm = () => {
    setShowResetConfirm(false);
    onReset();
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
  };

  const handleInquiry = () => {
    window.location.href = 'mailto:ggorilla11@gmail.com?subject=[AI머니야] 1:1 문의&body=문의 내용을 작성해주세요.';
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 pt-8 pb-6 px-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
            <img 
              src={LOGO_URL}
              alt="AI머니야"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-white text-lg font-bold">{userName}</h1>
            <p className="text-white/70 text-sm">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-white/20 text-white text-xs font-semibold rounded-lg"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* DESIRE 현재 단계 카드 */}
      {currentDesire && (
        <div className="mx-4 -mt-4 bg-white rounded-2xl shadow-lg p-4 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${currentDesire.bgColor} opacity-30`}></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentDesire.house}</span>
                <div>
                  <p className="text-xs text-gray-500 font-medium">현재 DESIRE 단계</p>
                  <p className={`text-lg font-bold ${currentDesire.color}`}>
                    {toRoman(currentDesire.stage)}. {currentDesire.label} - {currentDesire.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl">{currentDesire.weather}</span>
                <p className="text-xs text-gray-500">{currentDesire.weatherName}</p>
              </div>
            </div>
            <div className="flex gap-1">
              {DESIRE_STAGES.map((stage, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-2 rounded-full ${
                    idx < desireStage! ? 'bg-green-500' : 
                    idx === desireStage! - 1 ? currentDesire.color.replace('text-', 'bg-') : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {currentDesire.houseName} 단계 • 다음 목표: {DESIRE_STAGES[Math.min(desireStage!, 5)]?.name || '완료'}
            </p>
          </div>
        </div>
      )}

      {/* 오상열 CFP 소개 카드 */}
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-100 shadow-md flex-shrink-0">
            <img 
              src={PROFILE_IMAGE_URL}
              alt="오상열 대표"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900">오상열 CFP</h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">금융집짓기® 창시자</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              22년차 재무설계사 • 前 삼성생명<br/>
              MDRT 15회 • 금융감독원 강사
            </p>
          </div>
        </div>
      </div>

      {/* 메뉴 목록 */}
      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* 프리미엄 구독 - 앱스토어 제출용 숨김 처리 (2026-01-23) */}

        {/* 전문가 상담·강의 신청 */}
        <button 
          onClick={() => onNavigate('consulting')}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-base">
            👨‍🏫
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">전문가 상담 · 강의 신청</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 월간 리포트 */}
        <button 
          onClick={() => onNavigate('monthly-report')}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-base">
            📊
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">월간 리포트</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 금융감독원 전문가 강의영상 */}
        <button 
          onClick={() => window.open('https://www.fss.or.kr/fss/ntcn/fncsusvPrMng/view.do?dataSlno=78&dataTrgtCode=02&menuNo=200266', '_blank')}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-base">
            🎬
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">금융감독원 전문가 강의영상</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 개인정보 관리 - 앱스토어 제출용 숨김 처리 (2026-01-23) */}

        {/* 1:1 문의 */}
        <button 
          onClick={handleInquiry}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-base">
            💬
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">1:1 문의</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 설정 - 앱스토어 제출용 숨김 처리 (2026-01-23) */}
      </div>

      {/* 기타 메뉴 */}
      <div className="mx-4 mt-4 space-y-1">
        {/* 고객센터/FAQ - 앱스토어 제출용 숨김 처리 (2026-01-23) */}
        <button 
          onClick={() => setShowTermsModal(true)}
          className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700"
        >
          📄 이용약관
        </button>
        <button 
          onClick={() => setShowPrivacyModal(true)}
          className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700"
        >
          🔒 개인정보처리방침
        </button>
        <button 
          onClick={handleResetClick}
          className="w-full text-left py-2.5 text-sm text-red-500 hover:text-red-600"
        >
          🔄 처음부터 다시하기
        </button>
      </div>

      {/* 앱 정보 */}
      <div className="mx-4 mt-6 text-center">
        <p className="text-xs text-gray-400">AI머니야 v1.0.0</p>
        <p className="text-xs text-gray-400 mt-1">© 2026 오원트금융연구소</p>
      </div>

      {/* 처음부터 다시하기 확인 모달 */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">처음부터 다시하기</h3>
            <p className="text-sm text-gray-500 mb-6">
              모든 데이터가 초기화됩니다.<br/>
              정말 처음부터 다시 시작하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleResetCancel}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl"
              >
                취소
              </button>
              <button
                onClick={handleResetConfirm}
                className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이용약관 팝업 모달 */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">📄 서비스 이용약관</h3>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{TERMS_CONTENT}</pre>
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보처리방침 팝업 모달 */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">🔒 개인정보 처리방침</h3>
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{PRIVACY_CONTENT}</pre>
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
