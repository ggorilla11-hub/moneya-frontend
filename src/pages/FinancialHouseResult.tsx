// src/pages/FinancialHouseResult.tsx
// Phase 9-13: 금융집짓기 3단계 - 재무설계도 결과 화면
// UI 수정: 로고/글자 크기 홈 대시보드와 동일하게 확대

import { useState } from 'react';

// AI머니야 로고 URL (Firebase Storage)
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a";

interface FinancialHouseResultProps {
  userName?: string;
  onRestart?: () => void;
  onNavigate?: (path: string) => void;
}

const FinancialHouseResult = ({ 
  userName = '',
  onRestart,
  onNavigate 
}: FinancialHouseResultProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Firebase Storage 이미지 URL
  const EXTERIOR_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/financial-house-exterior.png?alt=media&token=debc4c4c-5c43-49c4-b7ee-bde444185951';

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
      {/* 헤더 - 로고 + 고객 이름 (홈 대시보드와 동일한 크기) */}
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

      {/* 탭 네비게이션 - 여백 확대 */}
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
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                </div>
              )}
              <img 
                src={EXTERIOR_IMAGE_URL}
                alt="금융집 외부"
                className={`w-full h-full object-contain ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
              {/* 스와이프 화살표 */}
              <button
                onClick={handleSwipeLeft}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <span className="text-gray-600 font-bold">›</span>
              </button>
            </div>

            {/* 내부 이미지 (두 번째 슬라이드) */}
            <div className="min-w-full h-full relative flex items-center justify-center bg-gradient-to-br from-amber-100 to-yellow-200">
              <div className="absolute top-3 left-3 bg-white/90 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-200">
                &lt;샘플&gt;
              </div>
              <div className="text-center">
                <div className="text-5xl mb-2">📊</div>
                <div className="text-base font-bold text-amber-800">금융집 내부</div>
                <div className="text-xs text-amber-600 mt-1 opacity-70">실제 이미지로 교체 예정</div>
              </div>
              <button
                onClick={handleSwipeRight}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <span className="text-gray-600 font-bold">‹</span>
              </button>
            </div>
          </div>
        </div>

        {/* 다시 설계하기 버튼 - 이미지 밖 아래 (축소) */}
        <div className="px-3 mt-2">
          <button
            onClick={handleRestart}
            className="w-full py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 shadow-sm transition-colors flex items-center justify-center gap-1"
          >
            <span>🔄</span>
            <span>다시 설계하기</span>
          </button>
        </div>

        {/* 저작권 정보 - 중앙 배치 (여백 축소) */}
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
