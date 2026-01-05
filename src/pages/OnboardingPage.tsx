import { useState } from 'react';

interface OnboardingPageProps {
  onComplete: () => void;
}

function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const allRequired = agreements.terms && agreements.privacy;
  const allChecked = agreements.terms && agreements.privacy && agreements.marketing;

  const toggleAll = () => {
    const newValue = !allChecked;
    setAgreements({
      terms: newValue,
      privacy: newValue,
      marketing: newValue,
    });
  };

  const toggleItem = (key: 'terms' | 'privacy' | 'marketing') => {
    setAgreements(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleStart = () => {
    if (allRequired) {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-green-50 to-amber-50 flex flex-col p-5">
      
      {/* 환영 섹션 */}
      <div className="text-center py-4">
        {/* 로고 */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-400/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-purple-400/40 rounded-full animate-spin" style={{ animationDuration: '8s' }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30">
            <span className="text-white text-xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>M</span>
          </div>
        </div>
        
        <h1 className="text-xl font-extrabold text-gray-800 mb-2">AI머니야에 오신 것을 환영합니다</h1>
        <p className="text-sm text-gray-600">
          <span className="text-purple-600 font-bold">"지출 전후에 AI에게 물어봐"</span><br />
          똑똑한 지출통제로 목표를 달성하세요
        </p>
      </div>

      {/* 서비스 흐름 타이틀 */}
      <div className="text-center text-sm font-bold text-gray-800 mb-3 flex items-center justify-center gap-1">
        <span className="text-pink-500">★</span> AI머니야 서비스 흐름
      </div>

      {/* 서비스 흐름도 SVG */}
      <div className="bg-white rounded-2xl p-3 mb-4 shadow-md border border-gray-100">
        <svg viewBox="0 0 280 100" className="w-full h-auto">
          <defs>
            <radialGradient id="twinkleGrad">
              <stop offset="0%" stopColor="#c4b5fd" stopOpacity="1"/>
              <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
            </radialGradient>
            <path id="animPath" d="M67 45 L95 45 L95 20 Q95 15, 100 15 L181 15 Q210 15, 210 20 L210 45 L253 45 L253 88 Q253 93, 248 93 L52 93 Q47 93, 47 88 L47 45 L95 45 L95 60 Q95 65, 100 65 L181 65 Q210 65, 210 60 L210 45 L253 45 L253 88 Q253 93, 248 93 L52 93 Q47 93, 47 88 L47 45" fill="none"/>
          </defs>
          
          <rect width="280" height="100" fill="white" rx="8"/>
          
          {/* 연결선들 */}
          <path d="M67 45 L95 45" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
          <path d="M95 45 L95 20 Q95 15, 100 15 L106 15" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
          <path d="M95 45 L95 60 Q95 65, 100 65 L106 65" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
          <path d="M181 15 L205 15 Q210 15, 210 20 L210 45" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
          <path d="M181 65 L205 65 Q210 65, 210 60 L210 45" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
          <path d="M210 45 L223 45" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
          <path d="M250 57 L250 88 Q250 93, 245 93 L52 93 Q47 93, 47 88 L47 65" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
          
          {/* 화살표 */}
          <polygon points="108,11 108,19 115,15" fill="#8b5cf6"/>
          <polygon points="108,61 108,69 115,65" fill="#8b5cf6"/>
          <polygon points="225,41 225,49 232,45" fill="#8b5cf6"/>
          <polygon points="43,65 51,65 47,58" fill="#8b5cf6"/>
          
          {/* 박스들 */}
          <rect x="27" y="33" width="40" height="24" rx="8" fill="#8b5cf6"/>
          <text x="36" y="49" fill="white" fontSize="11" fontWeight="700" fontFamily="'Noto Sans KR',sans-serif">예산</text>
          
          <rect x="116" y="3" width="75" height="24" rx="8" fill="#8b5cf6"/>
          <text x="124" y="19" fill="white" fontSize="9" fontWeight="600" fontFamily="'Noto Sans KR',sans-serif">지출 전 AI 대화</text>
          
          <rect x="116" y="53" width="75" height="24" rx="8" fill="#8b5cf6"/>
          <text x="119" y="69" fill="white" fontSize="8" fontWeight="600" fontFamily="'Noto Sans KR',sans-serif">금융집짓기 재무설계</text>
          
          <rect x="233" y="33" width="40" height="24" rx="8" fill="#8b5cf6"/>
          <text x="242" y="49" fill="white" fontSize="11" fontWeight="700" fontFamily="'Noto Sans KR',sans-serif">지출</text>
          
          {/* 애니메이션 */}
          <circle r="2.5" fill="#c4b5fd">
            <animate attributeName="opacity" values="0.9;1;0.9" dur="0.4s" repeatCount="indefinite"/>
            <animateMotion dur="18s" repeatCount="indefinite">
              <mpath href="#animPath"/>
            </animateMotion>
          </circle>
          
          <circle r="5" fill="url(#twinkleGrad)" opacity="0.6">
            <animate attributeName="r" values="4;6;4" dur="0.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0.3;0.6" dur="0.8s" repeatCount="indefinite"/>
            <animateMotion dur="18s" repeatCount="indefinite">
              <mpath href="#animPath"/>
            </animateMotion>
          </circle>
          
          <circle r="7" fill="none" stroke="#a78bfa" strokeWidth="0.5" opacity="0.3">
            <animate attributeName="r" values="6;9;6" dur="0.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.3;0.1;0.3" dur="0.8s" repeatCount="indefinite"/>
            <animateMotion dur="18s" repeatCount="indefinite">
              <mpath href="#animPath"/>
            </animateMotion>
          </circle>
        </svg>
      </div>

      {/* 약관 동의 섹션 */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-md border border-gray-100 flex-1">
        <h2 className="text-sm font-bold text-gray-800 mb-3">📋 이용약관 동의</h2>
        
        {/* 전체 동의 */}
        <div className="bg-purple-50 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={toggleAll}>
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${allChecked ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
              {allChecked && (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )}
            </div>
            <span className="font-bold text-gray-800">전체 동의하기</span>
          </div>
        </div>

        {/* 개별 약관 */}
        <div className="space-y-3">
          {/* 서비스 이용약관 */}
          <div className="flex items-start gap-3 py-2 border-b border-gray-100">
            <div 
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${agreements.terms ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}
              onClick={() => toggleItem('terms')}
            >
              {agreements.terms && (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 text-sm">서비스 이용약관</span>
                <span className="text-xs text-red-500 font-bold">필수</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">AI머니야 서비스 이용에 관한 약관입니다 <span className="text-purple-500 underline cursor-pointer">보기</span></p>
            </div>
          </div>

          {/* 개인정보 처리방침 */}
          <div className="flex items-start gap-3 py-2 border-b border-gray-100">
            <div 
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${agreements.privacy ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}
              onClick={() => toggleItem('privacy')}
            >
              {agreements.privacy && (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 text-sm">개인정보 처리방침</span>
                <span className="text-xs text-red-500 font-bold">필수</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">개인정보 수집 및 이용에 동의합니다 <span className="text-purple-500 underline cursor-pointer">보기</span></p>
            </div>
          </div>

          {/* 마케팅 정보 수신 */}
          <div className="flex items-start gap-3 py-2">
            <div 
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${agreements.marketing ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}
              onClick={() => toggleItem('marketing')}
            >
              {agreements.marketing && (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 text-sm">마케팅 정보 수신</span>
                <span className="text-xs text-gray-400 font-semibold">선택</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">이벤트, 혜택 등 마케팅 정보를 받습니다</p>
            </div>
          </div>
        </div>
      </div>

      {/* 시작하기 버튼 */}
      <button
        onClick={handleStart}
        disabled={!allRequired}
        className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
          allRequired 
            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 hover:-translate-y-0.5' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        시작하기
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
        </svg>
      </button>
    </div>
  );
}

export default OnboardingPage;