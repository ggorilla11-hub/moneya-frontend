// src/pages/FinancialHouseResult.tsx
// Phase 9-13: 금융집짓기 3단계 - 재무설계도 결과 화면
// v2.0: 탭 클릭 시 해당 2단계로 이동 기능 추가
// v3.0: 종합재무설계 리포트 모달 추가 (고객 데이터 연동)
// UI 수정: 10가지 수정사항 반영

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
  // ★★★ v2.0 추가: 탭 클릭 시 2단계로 이동 ★★★
  onTabClick?: (tabId: string) => void;
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
  onTabClick,
  financialData = {}
}: FinancialHouseResultProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [exteriorLoaded, setExteriorLoaded] = useState(false);
  const [interiorLoaded, setInteriorLoaded] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false); // ★ 리포트 모달 상태
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

  // ★★★ v2.0 수정: 탭에 id 추가 ★★★
  const tabs = [
    { id: 'retire', emoji: '🏖️', label: '은퇴' },
    { id: 'debt', emoji: '💳', label: '부채' },
    { id: 'save', emoji: '💰', label: '저축' },
    { id: 'invest', emoji: '📈', label: '투자' },
    { id: 'tax', emoji: '💸', label: '세금' },
    { id: 'estate', emoji: '🏠', label: '부동산' },
    { id: 'insurance', emoji: '🛡️', label: '보험' },
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

  // ★★★ v2.0 추가: 탭 클릭 핸들러 ★★★
  const handleTabClick = (tabId: string) => {
    if (onTabClick) {
      onTabClick(tabId);
    }
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

      {/* ★★★ v2.0 수정: 탭 네비게이션 - 클릭 가능 ★★★ */}
      <div className="bg-white border-b border-gray-200 px-2 py-1.5 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(tab.id)}
              className="flex-shrink-0 px-2 py-1 rounded-full text-[10px] font-semibold flex items-center gap-0.5 bg-green-100 text-green-700 hover:bg-green-200 active:scale-95 transition-all cursor-pointer"
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              <span className="w-3 h-3 rounded-full bg-green-500 text-white text-[7px] flex items-center justify-center">
                ✓
              </span>
            </button>
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

        {/* ★★★ v3.0 추가: 종합재무설계 리포트 버튼 ★★★ */}
        <div className="mx-4 mb-6">
          <button
            onClick={() => setShowReportModal(true)}
            className="w-full py-4 px-5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-2xl shadow-lg active:scale-[0.98] transition-all"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">📊</span>
              <div className="text-left">
                <p className="font-bold text-base">{userName || '고객'}님의 금융집짓기</p>
                <p className="text-sm opacity-90">종합재무설계 리포트 보기</p>
              </div>
              <span className="text-xl ml-auto">→</span>
            </div>
          </button>
        </div>
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

      {/* ★★★ v3.0 추가: 종합재무설계 리포트 모달 ★★★ */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
          <div className="min-h-screen">
            {/* 리포트 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
              <button
                onClick={() => setShowReportModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
              >
                ←
              </button>
              <h1 className="font-bold text-gray-800">종합재무설계 리포트</h1>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-teal-500 text-white text-xs font-bold rounded-lg"
              >
                PDF 저장
              </button>
            </div>

            {/* 리포트 내용 */}
            <div className="bg-gray-100 pb-20">
              {/* 커버 페이지 */}
              <div className="bg-gradient-to-br from-teal-500 to-teal-700 text-white p-8 text-center min-h-[60vh] flex flex-col justify-center">
                <div className="flex items-center justify-center gap-2 mb-8">
                  <img src={LOGO_URL} alt="AI머니야" className="w-12 h-12" />
                  <span className="text-2xl font-bold tracking-wider">MONEYA</span>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-full text-sm mb-6 inline-block mx-auto">
                  🏠 금융집짓기 재정설계 리포트
                </div>
                <h1 className="text-3xl font-extrabold mb-2">Financial</h1>
                <h1 className="text-3xl font-extrabold mb-4">Planning Report</h1>
                <p className="text-white/80 mb-8">AI와 함께 만든 맞춤형 재무설계</p>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5 inline-flex items-center gap-4 mx-auto">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-2xl font-bold">
                    {(userName || '고객').charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold">{userName || '고객'}님</p>
                    <p className="text-white/70 text-sm">{data.currentAge}세 · 가구주</p>
                  </div>
                </div>
                <p className="text-white/50 text-xs mt-8">📅 {new Date().toLocaleDateString('ko-KR')} | AI머니야</p>
              </div>

              {/* Executive Summary */}
              <div className="bg-white mx-4 my-4 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-teal-500">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-xl">📊</div>
                  <div>
                    <h2 className="font-bold text-lg">Executive Summary</h2>
                    <p className="text-xs text-gray-500">한눈에 보는 재무 현황</p>
                  </div>
                </div>

                {/* 종합 점수 카드 */}
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 text-white mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm opacity-90">종합 점수</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">🏠 벽돌집 Level 3</span>
                  </div>
                  <div className="text-5xl font-extrabold">66.7<span className="text-xl font-normal opacity-70">/100</span></div>
                  <div className="mt-4 pt-4 border-t border-white/20 text-sm leading-relaxed">
                    {userName || '고객'}님의 재무 상태는 전반적으로 양호합니다. 부채관리와 비상자금은 잘 갖춰져 있으나, 투자 분산과 노후연금 확대가 필요합니다.
                  </div>
                </div>

                {/* 핵심 지표 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-4 text-center border-l-4 border-green-500">
                    <div className="text-2xl mb-1">💰</div>
                    <div className="text-xl font-bold">{(data.realEstateValue + 1.5).toFixed(1)}억</div>
                    <div className="text-xs text-gray-500">순자산</div>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-semibold rounded-full">양호</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center border-l-4 border-green-500">
                    <div className="text-2xl mb-1">💳</div>
                    <div className="text-xl font-bold">{data.debtRatio}%</div>
                    <div className="text-xs text-gray-500">부채비율</div>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-semibold rounded-full">양호</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center border-l-4 border-amber-500">
                    <div className="text-2xl mb-1">📈</div>
                    <div className="text-xl font-bold">{data.savingsRate}%</div>
                    <div className="text-xs text-gray-500">저축률</div>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-semibold rounded-full">목표 20%</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center border-l-4 border-amber-500">
                    <div className="text-2xl mb-1">🏠</div>
                    <div className="text-xl font-bold">85.7%</div>
                    <div className="text-xs text-gray-500">부동산 비중</div>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-semibold rounded-full">편중</span>
                  </div>
                </div>
              </div>

              {/* DESIRE 분석 */}
              <div className="bg-white mx-4 my-4 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-teal-500">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-xl">🎯</div>
                  <div>
                    <h2 className="font-bold text-lg">DESIRE Analysis</h2>
                    <p className="text-xs text-gray-500">6단계 재무건강 분석</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { letter: 'D', name: 'Debt-free (부채관리)', desc: `부채비율 ${data.debtRatio}%`, score: 80, color: 'from-red-500 to-red-600' },
                    { letter: 'E', name: 'Emergency (비상자금)', desc: '5.5개월분', score: 85, color: 'from-amber-500 to-amber-600' },
                    { letter: 'S', name: 'Savings (저축)', desc: `저축률 ${data.savingsRate}%`, score: 70, color: 'from-blue-500 to-blue-600' },
                    { letter: 'I', name: 'Investment (투자)', desc: '자산배분 필요', score: 60, color: 'from-purple-500 to-purple-600' },
                    { letter: 'R', name: 'Risk Mgmt (위험관리)', desc: '8대보장 62.5%', score: 65, color: 'from-pink-500 to-pink-600' },
                    { letter: 'E', name: 'Estate (자산설계)', desc: '부동산 편중', score: 40, color: 'from-emerald-500 to-emerald-600' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className={`w-11 h-11 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                        {item.letter}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <div className="text-xl font-bold">{item.score}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 은퇴설계 */}
              <div className="bg-white mx-4 my-4 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-emerald-500">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-xl">🏖️</div>
                  <div>
                    <h2 className="font-bold text-lg">Retirement Planning</h2>
                    <p className="text-xs text-gray-500">은퇴설계</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold">{data.currentAge}세</div>
                    <div className="text-[10px] text-gray-500">현재 나이</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold">{data.retirementAge}세</div>
                    <div className="text-[10px] text-gray-500">은퇴 예정</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold">{data.retirementAge - data.currentAge}년</div>
                    <div className="text-[10px] text-gray-500">남은 기간</div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">✅</div>
                  <div className="font-bold text-green-700">은퇴설계 달성률: {data.retirementReadyRate}%</div>
                  <div className="text-xs text-green-600 mt-1">월 {data.shortfallMonthly}만원 추가 저축 필요</div>
                </div>
              </div>

              {/* Action Plan */}
              <div className="bg-white mx-4 my-4 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-teal-500">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-xl">⚡</div>
                  <div>
                    <h2 className="font-bold text-lg">Action Plan</h2>
                    <p className="text-xs text-gray-500">우선순위 실행 계획</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { num: 1, title: '노후연금 월 90만원 증액', desc: '연금저축 30→60만, IRP 신규 30만원', effect: '은퇴자금 +7.2억' },
                    { num: 2, title: '저축률 20% 달성', desc: '월 150만 → 180만원 증액', effect: '자산 +3.6억' },
                    { num: 3, title: '보험 리모델링', desc: '종신 감액, 3대질병 추가', effect: '월 15만 절감' },
                    { num: 4, title: 'ETF 중심 자산배분', desc: '개별주식 → ETF 전환', effect: '리스크 분산' },
                  ].map((item) => (
                    <div key={item.num} className="flex gap-3 p-4 bg-gray-50 rounded-xl border-l-4 border-teal-500">
                      <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {item.num}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-600 text-[10px] font-semibold rounded-full">{item.effect}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 클로징 */}
              <div className="bg-white mx-4 my-4 rounded-2xl p-6 shadow-sm text-center">
                <div className="text-5xl mb-4">🏠</div>
                <h2 className="text-xl font-extrabold mb-3">{userName || '고객'}님의 금융집,<br/>함께 지어가요</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  현재 벽돌집(Level 3)에서<br/>
                  대리석집(Level 5)까지,<br/>
                  AI머니야가 함께하겠습니다.
                </p>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-full shadow-lg"
                >
                  💬 AI머니야와 대화하기
                </button>

                {/* 면책조항 */}
                <div className="mt-8 p-4 bg-gray-50 rounded-xl text-left">
                  <p className="text-xs font-bold text-gray-500 mb-2">⚠️ 법률 고지</p>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    본 재무설계 리포트는 일반적인 재무 교육 정보를 제공하기 위한 목적으로 작성되었으며, 투자 권유나 개인 맞춤 투자자문에 해당하지 않습니다.
                    모든 투자에는 원금 손실의 위험이 있습니다. 최종 투자 결정은 본인 책임 하에 이루어져야 합니다.
                  </p>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400">
                  <div className="flex items-center gap-1 font-bold text-teal-500">
                    <span>💰</span>
                    <span>MONEYA</span>
                  </div>
                  <div>© 2026 MONEYA</div>
                </div>
              </div>
            </div>
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
