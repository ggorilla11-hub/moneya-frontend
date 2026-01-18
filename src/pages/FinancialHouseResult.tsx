// src/pages/FinancialHouseResult.tsx
// Phase 9-13: 금융집짓기 3단계 - 재무설계도 결과 화면

import { useState } from 'react';

interface FinancialHouseResultProps {
  userName?: string;
  onNavigate?: (path: string) => void;
}

const FinancialHouseResult = ({ 
  userName = '홍길동',
  onNavigate 
}: FinancialHouseResultProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Firebase Storage 이미지 URL
  const EXTERIOR_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/financial-house-exterior.png?alt=media&token=debc4c4c-5c43-49c4-b7ee-bde444185951';

  const tabs = [
    { emoji: '🏖️', label: '은퇴', completed: true },
    { emoji: '💳', label: '부채', completed: true },
    { emoji: '💰', label: '저축', completed: true },
    { emoji: '📈', label: '투자', completed: true },
    { emoji: '💸', label: '세금', completed: true },
    { emoji: '🏠', label: '부동산', completed: true },
    { emoji: '🛡️', label: '보험', completed: true },
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-base font-bold text-gray-900">
          {userName}님의 금융집짓기®
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMetaverse}
            className="flex flex-col items-center gap-0.5 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base">
              🏘️
            </div>
            <span className="text-[9px] text-gray-600 font-semibold">메타버스</span>
          </button>
          <button
            onClick={handleConsultation}
            className="flex flex-col items-center gap-0.5 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
              오
            </div>
            <span className="text-[9px] text-gray-600 font-semibold">강의상담</span>
          </button>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 bg-green-100 text-green-700 border-2 border-transparent"
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              <span className="w-3.5 h-3.5 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center">
                ✓
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 overflow-y-auto p-4 pb-40">
        {/* 이미지 스와이프 영역 */}
        <div className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
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
              <button
                onClick={handleSwipeLeft}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <span className="text-gray-700 font-bold text-lg">›</span>
              </button>
            </div>

            {/* 내부 이미지 (두 번째 슬라이드) */}
            <div className="min-w-full h-full relative flex items-center justify-center bg-gradient-to-br from-amber-100 to-yellow-200">
              <div className="absolute top-4 left-4 bg-white/90 text-red-600 text-[10px] font-bold px-2 py-1 rounded border border-red-200">
                &lt;샘플&gt;
              </div>
              <div className="text-center">
                <div className="text-6xl mb-3">📊</div>
                <div className="text-lg font-bold text-amber-800">금융집 내부</div>
                <div className="text-sm text-amber-600 mt-1 opacity-70">실제 이미지로 교체 예정</div>
              </div>
              <button
                onClick={handleSwipeRight}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <span className="text-gray-700 font-bold text-lg">‹</span>
              </button>
            </div>
          </div>
        </div>

        {/* 저작권 정보 */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-gray-500 font-semibold">
            © 2017 오원트금융연구소 All rights reserved.
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            특허 제10-2202486호 | 상표권 제41-0388261호
          </p>
        </div>
      </main>

      {/* 마이크 입력바 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-20">
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
            { icon: '💬', label: 'AI대화', tab: 'ai-spend' },
            { icon: '💰', label: '지출', tab: 'home' },
            { icon: '🏠', label: '금융집짓기', tab: 'financial-house', active: true },
            { icon: '👤', label: '마이페이지', tab: 'mypage' },
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => !item.active && handleNavClick(item.tab)}
              className="flex flex-col items-center gap-1 px-3 py-1 active:scale-95 transition-transform"
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
