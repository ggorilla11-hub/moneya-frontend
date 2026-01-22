import { useState, useEffect } from 'react';

// AI머니야 로고 URL (Firebase Storage)
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a";

// 오상열 대표 사진 URL (Firebase Storage)
const PROFILE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%98%A4%EC%83%81%EC%97%B4%20%EC%82%AC%EC%A7%84.png?alt=media&token=63eaf15e-9d0b-4d72-8fbb-ee03d6ecc8e5';

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

  // 금융집짓기 DESIRE 단계 데이터 로드
  useEffect(() => {
    const loadDesireStage = () => {
      try {
        const savedData = localStorage.getItem('financialHouseData');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.desireStage && parsed.desireStage.stage) {
            setDesireStage(parsed.desireStage.stage);
          }
        }
      } catch (error) {
        console.error('DESIRE 단계 로드 오류:', error);
      }
    };
    loadDesireStage();
  }, []);

  // 현재 DESIRE 단계 정보 가져오기
  const currentStageInfo = desireStage ? DESIRE_STAGES[desireStage - 1] : null;

  // 1:1 문의 이메일 열기
  const handleInquiry = () => {
    window.location.href = 'mailto:ggorilla11@gmail.com?subject=[AI머니야] 1:1 문의';
  };

  // 처음부터 다시하기 확인
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

  // 추후 financialResult 활용 예정
  console.log('MyPage loaded, financialResult:', _financialResult);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 프로필 영역 */}
      <div className="bg-white p-5 border-b border-gray-200">
        <div className="flex gap-4">
          {/* 왼쪽: 로고 + 이름/이메일 + 구독상태 */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <img 
                src={LOGO_URL}
                alt="AI머니야 로고"
                className="w-14 h-14"
              />
              <div>
                <p className="font-extrabold text-lg text-gray-900">{userName}님</p>
                <p className="text-sm text-gray-500">{userEmail}</p>
              </div>
            </div>
            {/* 구독 상태 배지 */}
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl self-start">
              <span className="text-base">⭐</span>
              <span className="text-sm font-bold text-blue-600">베이직 이용 중</span>
              <span className="text-xs text-gray-500 ml-2">무료 체험</span>
            </div>
          </div>
          
          {/* 오른쪽: 금융집짓기 일러스트 + DESIRE 진행바 (확대) */}
          <div className="flex flex-col items-center justify-center w-32">
            {currentStageInfo ? (
              <>
                {/* 일러스트 집 + 날씨 (확대) */}
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${currentStageInfo.bgColor} flex flex-col items-center justify-center shadow-md border border-gray-100`}>
                  <span className="text-base mb-0.5">{currentStageInfo.weather}</span>
                  <span className="text-4xl">{currentStageInfo.house}</span>
                  <span className="text-[10px] text-gray-600 font-semibold mt-0.5">{currentStageInfo.houseName}</span>
                </div>
                
                {/* DESIRE 진행바 (확대) */}
                <div className="w-full mt-2">
                  <div className="flex items-center justify-center gap-1 mb-1.5">
                    <span className={`text-xs font-bold ${currentStageInfo.color}`}>DESIRE</span>
                    <span className="text-xs text-gray-600 font-semibold">{desireStage}단계</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                      <div
                        key={step}
                        className={`h-2 flex-1 rounded-full ${
                          step <= (desireStage || 0)
                            ? step <= 2 ? 'bg-red-400' : step <= 4 ? 'bg-yellow-400' : 'bg-emerald-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                      <span
                        key={step}
                        className={`text-[9px] ${
                          step === desireStage ? 'font-bold text-gray-700' : 'text-gray-400'
                        }`}
                      >
                        {toRoman(step)}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* 데이터 없는 경우 (확대) */
              <div className="w-24 h-24 rounded-2xl bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                <span className="text-3xl mb-1">🏠</span>
                <span className="text-[10px] text-gray-500 text-center font-medium px-2">재무설계<br/>필요</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 오상열 대표 배너 - 상담 신청 강조 */}
      <div className="mx-4 mt-4">
        <div 
          className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-4 flex gap-4 items-center cursor-pointer"
          onClick={() => onNavigate('consulting')}
        >
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
            <img 
              src={PROFILE_IMAGE_URL} 
              alt="오상열 대표" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-extrabold text-gray-900">오상열 대표</h3>
              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">CFP</span>
            </div>
            <p className="text-xs text-yellow-700 font-bold mb-1">금융집짓기® 창시자 · 20년 경력</p>
            <p className="text-xs text-gray-600">전문가 1:1 재무상담 받아보세요 →</p>
          </div>
        </div>
      </div>

      {/* 획득한 뱃지 */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
          🏆 획득한 뱃지
        </h3>
        <div className="flex justify-between">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-xl">
              🔥
            </div>
            <span className="text-[10px] text-gray-500 font-medium">7일연속</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-xl">
              💰
            </div>
            <span className="text-[10px] text-gray-500 font-medium">첫저축</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-xl">
              📊
            </div>
            <span className="text-[10px] text-gray-500 font-medium">분석왕</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-xl">
              🎯
            </div>
            <span className="text-[10px] text-gray-500 font-medium">목표달성</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-xl text-gray-400">
              🔒
            </div>
            <span className="text-[10px] text-gray-400 font-medium">???</span>
          </div>
        </div>
      </div>

      {/* 성장 기록 */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
          📈 성장 기록
        </h3>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">출석</span>
            <span className="text-sm font-bold text-teal-600">27/30일 🔥</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">예산 달성</span>
            <span className="text-sm font-bold text-gray-900">23일</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">이번 달 절약</span>
            <span className="text-sm font-bold text-green-500">+127,000원</span>
          </div>
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* 프리미엄 구독 */}
        <button 
          onClick={() => onNavigate('subscription')}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-base">
            ⭐
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">프리미엄 구독</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

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

        {/* 머니야 목소리 설정 */}
        <button 
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-base">
            🎤
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">머니야 목소리 설정</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 개인정보 관리 */}
        <button 
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-base">
            👤
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">개인정보 관리</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 1:1 문의 */}
        <button 
          onClick={handleInquiry}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-base">
            💬
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">1:1 문의</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 설정 */}
        <button 
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-base">
            ⚙️
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">설정</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>
      </div>

      {/* 기타 메뉴 */}
      <div className="mx-4 mt-4 space-y-1">
        <button className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700">
          ❓ 고객센터 / FAQ
        </button>
        <button className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700">
          📄 이용약관
        </button>
        <button className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700">
          🔒 개인정보처리방침
        </button>
        <div className="border-t border-gray-200 my-2"></div>
        <button 
          onClick={handleResetClick}
          className="w-full text-left py-2.5 text-sm text-blue-500 hover:text-blue-700 font-medium"
        >
          🔄 처음부터 다시하기
        </button>
        <button 
          onClick={onLogout}
          className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700"
        >
          🚪 로그아웃
        </button>
        <button className="w-full text-left py-2.5 text-sm text-red-500 hover:text-red-700">
          ⚠️ 회원탈퇴
        </button>
        <p className="text-center text-xs text-gray-400 py-4">앱 버전 v1.0.0</p>
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
    </div>
  );
}
