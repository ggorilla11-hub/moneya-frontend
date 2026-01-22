// src/pages/FinancialHouseResult.tsx
// Phase 9-13: 금융집짓기 3단계 - 재무설계도 결과 화면
// UI 수정: 10가지 수정사항 반영
// 수정 (2026-01-22): 저작권/상표권/특허권 박스 클릭 시 자격증 이미지 표시 기능 추가
// 수정 (2026-01-22): 내부 이미지 → 애니메이션 영상 슬라이드 추가
// 수정 (2026-01-22): 강의상담 버튼 오상열 대표 사진으로 교체

import { useState, useRef } from 'react';

// AI머니야 로고 URL (Firebase Storage)
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a";

// 오상열 대표 사진 URL (Firebase Storage)
const PROFILE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%98%A4%EC%83%81%EC%97%B4%20%EC%82%AC%EC%A7%84.png?alt=media&token=63eaf15e-9d0b-4d72-8fbb-ee03d6ecc8e5';

// 금융집 이미지 URL (Firebase Storage)
const EXTERIOR_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/financial-house-exterior.png.png?alt=media&token=e1651823-af8e-4ed3-9b3d-557a1bf0eb10';
const INTERIOR_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EA%B8%88%EC%9C%B5%EC%A7%91%EC%A7%93%EA%B8%B0%EC%8B%A4%EC%82%AC%20%EB%82%B4%EB%B6%80%EC%9B%90%EB%B3%B8.png?alt=media&token=0d287c6b-2ba3-45ea-ac66-319e630ea11b';

// 저작권/상표권/특허권 자격증 이미지 URL (Firebase Storage)
const CERTIFICATE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%A0%80%EC%9E%91%EA%B6%8C%EC%83%81%ED%91%9C%EA%B6%8C%ED%8A%B9%ED%97%88%EA%B6%8C.png?alt=media&token=2ad30230-ccc5-481d-89d7-82c421ee3759';

// 금융집짓기 애니메이션 영상 URL (Firebase Storage)
const ANIMATION_VIDEO_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EA%B8%88%EC%9C%B5%EC%A7%91%EC%A7%93%EA%B8%B0%20%EC%97%90%EB%8B%88%EB%A9%94%EC%9D%B4%EC%85%98.mp4?alt=media&token=7b052cb9-4c71-407a-bddd-e8d60e96e95c';

interface FinancialHouseResultProps {
  userName?: string;
  onRestart?: () => void;
  onNavigate?: (path: string) => void;
  onBack?: () => void;
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
  onBack,
  financialData = {}
}: FinancialHouseResultProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [exteriorLoaded, setExteriorLoaded] = useState(false);
  const [interiorLoaded, setInteriorLoaded] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // 슬라이드 이동 (0: 외부, 1: 내부, 2: 애니메이션)
  const handleSlideNext = () => {
    if (currentSlide < 2) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      
      // 애니메이션 슬라이드로 이동 시 영상 재생
      if (nextSlide === 2 && videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    }
  };

  const handleSlidePrev = () => {
    if (currentSlide > 0) {
      // 애니메이션 슬라이드에서 벗어날 때 영상 정지
      if (currentSlide === 2 && videoRef.current) {
        videoRef.current.pause();
      }
      setCurrentSlide(currentSlide - 1);
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

  const handleCertificateToggle = () => {
    setShowCertificates(!showCertificates);
  };

  const handleCertificateImageClick = () => {
    setShowCertificateModal(true);
  };

  const handleCloseModal = () => {
    setShowCertificateModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 - 로고 + 고객 이름 */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {/* 뒤로가기 버튼 */}
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 active:scale-95 transition-transform"
          >
            ←
          </button>
          <img 
            src={LOGO_URL}
            alt="AI머니야 로고"
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-base font-bold text-gray-900">
            {userName || '고객'}님의 금융집짓기®
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMetaverse}
            className="flex flex-col items-center gap-0.5 active:scale-95 transition-transform"
          >
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm">
              🏘️
            </div>
            <span className="text-[8px] text-gray-600 font-medium">메타버스</span>
          </button>
          <button
            onClick={handleConsultation}
            className="flex flex-col items-center gap-0.5 active:scale-95 transition-transform"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden">
              <img 
                src={PROFILE_IMAGE_URL} 
                alt="오상열 대표" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[8px] text-gray-600 font-medium">강의상담</span>
          </button>
        </div>
      </header>

      {/* 탭 네비게이션 - 축소 */}
      <div className="bg-white border-b border-gray-200 px-2 py-1.5 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-2 py-1 rounded-full text-[10px] font-semibold flex items-center gap-0.5 bg-green-100 text-green-700"
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              <span className="w-3 h-3 rounded-full bg-green-500 text-white text-[7px] flex items-center justify-center">
                ✓
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 메인 컨텐츠 - 스크롤 가능 영역 */}
      <main className="flex-1 overflow-y-auto pb-40">
        {/* 이미지 스와이프 영역 - 크게 (3개 슬라이드) */}
        <div className="relative bg-white mx-2 mt-2 rounded-xl overflow-hidden shadow-lg" style={{ height: '50vh', minHeight: '300px' }}>
          <div 
            className="flex transition-transform duration-300 ease-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* 슬라이드 0: 외부 이미지 */}
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
              {/* 스와이프 화살표 (다음) */}
              <button
                onClick={handleSlideNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <span className="text-gray-600 font-bold">›</span>
              </button>
              
              {/* 다시 설계하기 버튼 */}
              <button
                onClick={handleRestart}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-white/95 hover:bg-white text-gray-700 text-sm font-bold rounded-lg border border-gray-300 shadow-md transition-colors flex items-center gap-1.5"
              >
                <span>🔄</span>
                <span>다시 설계하기</span>
              </button>
            </div>

            {/* 슬라이드 1: 내부 이미지 + SVG 오버레이 */}
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
              
              {/* SVG 텍스트 오버레이 */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 355 296" 
                preserveAspectRatio="xMidYMid slice"
              >
                {/* 투자 영역 */}
                <text x="44%" y="40%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="7" fontWeight="800" fill="#000">투자</text>
                <text x="44%" y="44%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="5" fontWeight="700" fill="#000">부자지수 {data.wealthIndex}%</text>
                
                {/* 세금 영역 */}
                <text x="58%" y="40%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="7" fontWeight="800" fill="#000">세금</text>
                <text x="58%" y="44%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="5" fontWeight="700" fill="#000">결정세액 {data.taxAmount}만원</text>
                
                {/* 부동산 영역 */}
                <text x="72%" y="28%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="5" fontWeight="800" fill="#fff">부동산</text>
                <text x="72%" y="32%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="4" fontWeight="700" fill="#fff">시가 {data.realEstateValue}억</text>
                
                {/* 처마보 (타임라인) */}
                <text x="28%" y="47%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="5" fontWeight="700" fill="#000">현재({data.currentAge})</text>
                <text x="52%" y="49%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="5" fontWeight="700" fill="#000">은퇴({data.retirementAge})</text>
                <text x="73%" y="47%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="5" fontWeight="700" fill="#000">사망({data.lifeExpectancy})</text>
                
                {/* 부채 영역 */}
                <text x="30%" y="54%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="6" fontWeight="800" fill="#000">부채</text>
                <text x="30%" y="58%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="4" fontWeight="700" fill="#000">부채비율 {data.debtRatio}%</text>
                <text x="30%" y="62%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="4" fontWeight="600" fill="#000">담보 {data.debtAmount}억</text>
                
                {/* 저축 영역 */}
                <text x="45%" y="60%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="6" fontWeight="800" fill="#000">저축</text>
                <text x="45%" y="64%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="4" fontWeight="700" fill="#000">저축률 {data.savingsRate}%</text>
                <text x="45%" y="68%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="4" fontWeight="600" fill="#000">월 {data.monthlySavings}만원</text>
                
                {/* 은퇴 영역 */}
                <text x="70%" y="54%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="6" fontWeight="800" fill="#000">은퇴</text>
                <text x="70%" y="58%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="4" fontWeight="700" fill="#000">준비율 {data.retirementReadyRate}%</text>
                <text x="70%" y="62%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="3" fontWeight="600" fill="#000">필요: {data.requiredMonthly}만원/월</text>
                <text x="70%" y="66%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="3" fontWeight="600" fill="#000">준비: {data.preparedMonthly}만원/월</text>
                <text x="70%" y="70%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="3" fontWeight="700" fill="#000">부족: {data.shortfallMonthly}만원/월</text>
                
                {/* 보장 영역 */}
                <text x="8%" y="88%" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="6" fontWeight="800" fill="#fff">보장</text>
                
                {/* 우측 하단 둔덕 가림용 사각형 */}
                <rect x="85%" y="85%" width="15%" height="15%" fill="#5D4037" opacity="0.95"/>
              </svg>

              {/* 스와이프 화살표 (이전) */}
              <button
                onClick={handleSlidePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <span className="text-gray-600 font-bold">‹</span>
              </button>
              
              {/* 스와이프 화살표 (다음 - 애니메이션으로) */}
              <button
                onClick={handleSlideNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <span className="text-gray-600 font-bold">›</span>
              </button>
              
              {/* 다시 설계하기 버튼 */}
              <button
                onClick={handleRestart}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-white/95 hover:bg-white text-gray-700 text-sm font-bold rounded-lg border border-gray-300 shadow-md transition-colors flex items-center gap-1.5"
              >
                <span>🔄</span>
                <span>다시 설계하기</span>
              </button>
            </div>

            {/* 슬라이드 2: 애니메이션 영상 */}
            <div className="min-w-full h-full relative flex items-center justify-center bg-black">
              <video
                ref={videoRef}
                src={ANIMATION_VIDEO_URL}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center center' }}
                playsInline
                controls
                preload="metadata"
              />
              
              {/* 스와이프 화살표 (이전) */}
              <button
                onClick={handleSlidePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform z-10"
              >
                <span className="text-gray-600 font-bold">‹</span>
              </button>
              
              {/* 영상 안내 텍스트 */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 rounded-full z-10">
                <p className="text-white text-xs font-semibold">🎬 금융집짓기® 애니메이션</p>
              </div>
              
              {/* 다시 설계하기 버튼 */}
              <button
                onClick={handleRestart}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-white/95 hover:bg-white text-gray-700 text-sm font-bold rounded-lg border border-gray-300 shadow-md transition-colors flex items-center gap-1.5 z-10"
              >
                <span>🔄</span>
                <span>다시 설계하기</span>
              </button>
            </div>
          </div>
          
          {/* 슬라이드 인디케이터 */}
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index ? 'bg-teal-500 w-4' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 저작권 정보 - 클릭 가능 */}
        <button 
          onClick={handleCertificateToggle}
          className="w-full mt-6 mb-2 text-center px-3 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors active:scale-[0.99]"
        >
          <p className="text-xs font-bold text-gray-600">
            © 2017 오원트금융연구소 All rights reserved.
          </p>
          <p className="text-[11px] font-semibold text-gray-500 mt-1">
            특허 제10-2202486호 | 상표권 제41-0388261호
          </p>
          <p className="text-[10px] text-teal-600 mt-1 flex items-center justify-center gap-1">
            <span>{showCertificates ? '▲' : '▼'}</span>
            <span>{showCertificates ? '접기' : '관련 자격증 보기'}</span>
          </p>
        </button>

        {/* 자격증 이미지 영역 - 토글 */}
        {showCertificates && (
          <div className="mx-3 mb-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fadeIn">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span>📜</span>
                <span>관련 저작권·상표권·특허권</span>
              </h3>
            </div>
            <div className="p-3">
              <button
                onClick={handleCertificateImageClick}
                className="w-full rounded-lg overflow-hidden border border-gray-100 hover:border-teal-300 transition-colors active:scale-[0.99]"
              >
                <img 
                  src={CERTIFICATE_IMAGE_URL}
                  alt="저작권, 상표권, 특허권 자격증"
                  className="w-full h-auto object-contain"
                />
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                이미지를 클릭하면 확대됩니다
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 자격증 이미지 확대 모달 */}
      {showCertificateModal && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div className="relative max-w-full max-h-full">
            <button
              onClick={handleCloseModal}
              className="absolute -top-10 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 font-bold shadow-lg"
            >
              ✕
            </button>
            <img 
              src={CERTIFICATE_IMAGE_URL}
              alt="저작권, 상표권, 특허권 자격증 (확대)"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-center text-white text-sm mt-3 font-medium">
              관련 저작권·상표권·특허권
            </p>
          </div>
        </div>
      )}

      {/* 마이크 입력바 */}
      <div className="fixed bottom-[85px] left-0 right-0 bg-white border-t border-gray-200 px-3 py-2 z-20">
        <div className="flex items-center gap-2 max-w-screen-sm mx-auto">
          <button className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-base active:scale-95 transition-transform">
            +
          </button>
          <button className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-base active:scale-95 transition-transform">
            🎤
          </button>
          <input
            type="text"
            placeholder="지출 전에 물어보세요..."
            className="flex-1 px-3 py-2 rounded-full border border-gray-200 bg-gray-50 text-xs outline-none focus:border-teal-500 focus:bg-white transition-colors"
          />
          <button className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-base active:scale-95 transition-transform">
            ➤
          </button>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around items-center py-1.5 pb-4 max-w-screen-sm mx-auto">
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
              <span className="text-lg">{item.icon}</span>
              <span className={`text-[9px] font-semibold ${item.active ? 'text-teal-500' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FinancialHouseResult;
