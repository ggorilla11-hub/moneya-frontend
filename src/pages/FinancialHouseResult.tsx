// src/pages/FinancialHouseResult.tsx
// Phase 9-13: 금융집짓기 3단계 - 재무설계도 결과 화면
// UI 수정: 외부/내부 이미지 스와이프 + SVG 텍스트 오버레이 (데이터 연동)

import { useState } from 'react';

// AI머니야 로고 URL (Firebase Storage)
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a";

// 금융집 이미지 URL (Firebase Storage)
const EXTERIOR_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/financial-house-exterior.png?alt=media&token=debc4c4c-5c43-49c4-b7ee-bde444185951';
const INTERIOR_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EA%B8%88%EC%9C%B5%EC%A7%91%EC%A7%93%EA%B8%B0%EC%8B%A4%EC%82%AC%20%EB%82%B4%EB%B6%80%EC%9B%90%EB%B3%B8.png?alt=media&token=e551fe5a-5899-4366-8421-719c2694f0b7';

interface FinancialHouseResultProps {
  userName?: string;
  onRestart?: () => void;
  onNavigate?: (path: string) => void;
  // 데이터 연동용 props
  financialData?: {
    currentAge?: number;
    retirementAge?: number;
    lifeExpectancy?: number;
    wealthIndex?: number;
    taxAmount?: number;
    realEstateValue?: number;
    debtRatio?: number;
    debtAmount?: number;
    savingsRate?: number;
    monthlySavings?: number;
    retirementReadyRate?: number;
    requiredMonthly?: number;
    preparedMonthly?: number;
    shortfallMonthly?: number;
  };
}

const FinancialHouseResult = ({ 
  userName = '',
  onRestart,
  onNavigate,
  financialData = {}
}: FinancialHouseResultProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [exteriorLoaded, setExteriorLoaded] = useState(false);
  const [interiorLoaded, setInteriorLoaded] = useState(false);

  // 기본값 설정
  const data = {
    currentAge: financialData.currentAge || 37,
    retirementAge: financialData.retirementAge || 65,
    lifeExpectancy: financialData.lifeExpectancy || 90,
    wealthIndex: financialData.wealthIndex || 108,
    taxAmount: financialData.taxAmount || 380,
    realEstateValue: financialData.realEstateValue || 5,
    debtRatio: financialData.debtRatio || 46,
    debtAmount: financialData.debtAmount || 3.5,
    savingsRate: financialData.savingsRate || 25,
    monthlySavings: financialData.monthlySavings || 130,
    retirementReadyRate: financialData.retirementReadyRate || 43,
    requiredMonthly: financialData.requiredMonthly || 300,
    preparedMonthly: financialData.preparedMonthly || 130,
    shortfallMonthly: financialData.shortfallMonthly || 170,
  };

  const tabs = [
    { emoji: '🏖️', label: '은퇴' },
    { emoji: '💳', label: '부채' },
    { emoji: '💰', label: '저축' },
    { emoji: '📈', label: '투자' },
    { emoji: '💸', label: '세금' },
    { emoji: '🏠', label: '부동산' },
    { emoji: '🛡️', label: '보험' },
  ];

  const handleMetaverse = () => {
    alert('메타버스 기능은 준비 중입니다.');
  };

  const handleConsultation = () => {
    if (onNavigate) {
      onNavigate('mypage-consulting');
    } else {
      alert('강의상담 신청 페이지로 이동합니다.');
    }
  };

  const handleSwipeLeft = () => {
    if (currentSlide < 1) {
      setCurrentSlide(1);
    }
  };

  const handleSwipeRight = () => {
    if (currentSlide > 0) {
      setCurrentSlide(0);
    }
  };

  const handleNavClick = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleRestart = () => {
    if (onRestart) {
      onRestart();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 - 로고 + 고객 이름 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img 
            src={LOGO_URL}
            alt="AI머니야 로고"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-lg font-bold text-gray-900">
            {userName || '고객'}님의 금융집짓기®
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMetaverse}
            className="flex flex-col items-center gap-0.5 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base">
              🏘️
            </div>
            <span className="text-[9px] text-gray-600 font-medium">메타버스</span>
          </button>
          <button
            onClick={handleConsultation}
            className="flex flex-col items-center gap-0.5 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
              오
            </div>
            <span className="text-[9px] text-gray-600 font-medium">강의상담</span>
          </button>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 bg-green-100 text-green-700"
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              <span className="w-3.5 h-3.5 rounded-full bg-green-500 text-white text-[8px] flex items-center justify-center">
                ✓
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 메인 컨텐츠 - 스크롤 가능 영역 */}
      <main className="flex-1 overflow-y-auto pb-32">
        {/* 이미지 스와이프 영역 */}
        <div className="relative bg-white mx-3 mt-3 rounded-2xl overflow-hidden shadow-lg" style={{ height: '50vh', minHeight: '300px' }}>
          <div 
            className="flex transition-transform duration-300 ease-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* 외부 이미지 (첫 번째 슬라이드) */}
            <div className="min-w-full h-full relative flex items-center justify-center bg-gray-100">
              {!exteriorLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                </div>
              )}
              <img 
                src={EXTERIOR_IMAGE_URL}
                alt="금융집 외부"
                className={`w-full h-full object-contain ${exteriorLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setExteriorLoaded(true)}
                onError={() => setExteriorLoaded(true)}
              />
              {/* 스와이프 화살표 */}
              <button
                onClick={handleSwipeLeft}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <span className="text-gray-600 font-bold">›</span>
              </button>
            </div>

            {/* 내부 이미지 + SVG 오버레이 (두 번째 슬라이드) */}
            <div className="min-w-full h-full relative flex items-center justify-center bg-gray-100">
              {!interiorLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                </div>
              )}
              
              {/* 내부 실사 이미지 */}
              <img 
                src={INTERIOR_IMAGE_URL}
                alt="금융집 내부"
                className={`w-full h-full object-contain ${interiorLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setInteriorLoaded(true)}
                onError={() => setInteriorLoaded(true)}
              />
              
              {/* SVG 텍스트 오버레이 - 데이터 연동 */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 355 296" 
                preserveAspectRatio="xMidYMid slice"
              >
                {/* 투자 영역 */}
                <text x="44%" y="34%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="7" fontWeight="800" fill="#000">투자</text>
                <text x="44%" y="38%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="5" fontWeight="700" fill="#000">부자지수 {data.wealthIndex}%</text>
                
                {/* 세금 영역 */}
                <text x="58%" y="34%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="7" fontWeight="800" fill="#000">세금</text>
                <text x="58%" y="38%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="5" fontWeight="700" fill="#000">결정세액 {data.taxAmount}만원</text>
                
                {/* 부동산 영역 (좌측으로 + 아래로 이동 - 흰색) */}
                <text x="73%" y="24%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="5" fontWeight="800" fill="#fff">부동산</text>
                <text x="73%" y="28%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="4" fontWeight="700" fill="#fff">시가 {data.realEstateValue}억</text>
                
                {/* 처마보 (타임라인) */}
                <text x="18%" y="46%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="5" fontWeight="700" fill="#000">현재({data.currentAge})</text>
                <text x="48%" y="46%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="5" fontWeight="700" fill="#000">은퇴({data.retirementAge})</text>
                <text x="81%" y="46%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="5" fontWeight="700" fill="#000">사망({data.lifeExpectancy})</text>
                
                {/* 부채 영역 (우측으로 이동) */}
                <text x="24%" y="58%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="6" fontWeight="800" fill="#000">부채</text>
                <text x="24%" y="62%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="4" fontWeight="700" fill="#000">부채비율 {data.debtRatio}%</text>
                <text x="24%" y="66%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="4" fontWeight="600" fill="#000">담보 {data.debtAmount}억</text>
                
                {/* 저축 영역 */}
                <text x="45%" y="66%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="6" fontWeight="800" fill="#000">저축</text>
                <text x="45%" y="70%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="4" fontWeight="700" fill="#000">저축률 {data.savingsRate}%</text>
                <text x="45%" y="74%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="4" fontWeight="600" fill="#000">월 {data.monthlySavings}만원</text>
                
                {/* 은퇴 영역 (좌측으로 이동) */}
                <text x="76%" y="58%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="6" fontWeight="800" fill="#000">은퇴</text>
                <text x="76%" y="62%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="4" fontWeight="700" fill="#000">준비율 {data.retirementReadyRate}%</text>
                <text x="76%" y="66%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="3" fontWeight="600" fill="#000">필요: {data.requiredMonthly}만원/월</text>
                <text x="76%" y="70%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="3" fontWeight="600" fill="#000">준비: {data.preparedMonthly}만원/월</text>
                <text x="76%" y="74%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="3" fontWeight="700" fill="#000">부족: {data.shortfallMonthly}만원/월</text>
                
                {/* 보장 영역 (흰색) */}
                <text x="6%" y="88%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="6" fontWeight="800" fill="#fff">보장</text>
                
                {/* 우측 하단 둔덕 가림용 사각형 */}
                <rect x="85%" y="85%" width="15%" height="15%" fill="#5D4037" opacity="0.95"/>
              </svg>

              {/* 스와이프 화살표 */}
              <button
                onClick={handleSwipeRight}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <span className="text-gray-600 font-bold">‹</span>
              </button>
            </div>
          </div>
        </div>

        {/* 다시 설계하기 버튼 */}
        <div className="px-3 mt-2">
          <button
            onClick={handleRestart}
            className="w-full py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 shadow-sm transition-colors flex items-center justify-center gap-1"
          >
            <span>🔄</span>
            <span>다시 설계하기</span>
          </button>
        </div>

        {/* 저작권 정보 */}
        <div className="mt-2 mb-1 text-center px-3">
          <p className="text-[9px] text-gray-500">
            © 2017 오원트금융연구소 All rights reserved.
          </p>
          <p className="text-[9px] text-gray-400">
            특허 제10-2202486호 | 상표권 제41-0388261호
          </p>
        </div>
      </main>

      {/* 마이크 입력바 - 네비게이션 바로 위 */}
      <div className="fixed bottom-[80px] left-0 right-0 bg-white border-t border-gray-200 px-3 py-2 z-20">
        <div className="flex items-center gap-2 max-w-screen-sm mx-auto">
          <button className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-lg active:scale-95 transition-transform">
            +
          </button>
          <button className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-lg active:scale-95 transition-transform">
            🎤
          </button>
          <input
            type="text"
            placeholder="지출 전에 물어보세요..."
            className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-500 focus:bg-white transition-colors"
          />
          <button className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg active:scale-95 transition-transform">
            ➤
          </button>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around items-center py-2 pb-5 max-w-screen-sm mx-auto">
          {[
            { icon: '🏠', label: '홈', tab: 'home' },
            { icon: '💬', label: 'AI지출', tab: 'ai-spend' },
            { icon: '🏗️', label: '금융집짓기', tab: 'financial-house', active: true },
            { icon: '👤', label: '마이페이지', tab: 'mypage' },
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => !item.active && handleNavClick(item.tab)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 active:scale-95 transition-transform"
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`text-[10px] font-semibold ${item.active ? 'text-teal-500' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default FinancialHouseResult;
