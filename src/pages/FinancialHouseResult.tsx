// src/pages/FinancialHouseResult.tsx
// Phase 9-13: 금융집짓기 3단계 - 재무설계도 결과 화면
// v2.0: 탭 클릭 시 해당 2단계로 이동 기능 추가
// v3.0: 종합재무설계 리포트 모달 추가 (고객 데이터 연동)
// v4.0: 슬라이드1을 SVG 기반 금융집 다이어그램으로 전면 교체 (시뮬레이터 스타일)
//       - 지붕(투자/세금/부동산), 처마보(나이/기간), 기둥(부채/저축/은퇴), 보험(8대보장)
//       - 리포트 모달에도 금융집 시각화 섹션 추가
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

            {/* 슬라이드 1: SVG 금융집 다이어그램 (시뮬레이터 스타일) */}
            <div className="min-w-full h-full relative flex items-center justify-center bg-gradient-to-b from-teal-400 to-teal-500 p-3 overflow-hidden">
              
              {/* SVG 금융집 전체 */}
              <div className="w-full max-w-[340px] mx-auto">
                
                {/* ===== 지붕 섹션 (투자/세금/부동산) ===== */}
                <div className="relative">
                  <svg viewBox="0 0 340 70" className="w-full" preserveAspectRatio="xMidYMid meet">
                    {/* 지붕 좌측 (투자) - 하늘색 */}
                    <polygon points="170,0 0,70 170,70" fill="#5DADE2" stroke="#333" strokeWidth="1.5"/>
                    {/* 지붕 우측 (세금) - 민트색 */}
                    <polygon points="170,0 340,70 170,70" fill="#82E0AA" stroke="#333" strokeWidth="1.5"/>
                    {/* 중앙선 */}
                    <line x1="170" y1="0" x2="170" y2="70" stroke="#333" strokeWidth="1"/>
                    {/* 굴뚝 */}
                    <rect x="255" y="18" width="40" height="40" fill="#E8E8E8" stroke="#333" strokeWidth="1.5"/>
                  </svg>
                  
                  {/* 지붕 내용 오버레이 */}
                  <div className="absolute inset-0 flex">
                    {/* 투자 영역 (좌측) */}
                    <div className="flex-1 flex flex-col items-center justify-center pt-4 pr-8">
                      <p className="text-[11px] font-extrabold text-gray-800">📈 투자</p>
                      <p className="text-[9px] text-gray-700 mt-0.5">부자지수 <span className="font-bold text-blue-700">{data.wealthIndex}%</span></p>
                      <p className="text-[8px] text-gray-600">순자산 2.5억원</p>
                    </div>
                    {/* 세금 영역 (우측) */}
                    <div className="flex-1 flex flex-col items-center justify-center pt-4 pl-2 pr-12">
                      <p className="text-[11px] font-extrabold text-gray-800">💸 세금</p>
                      <p className="text-[9px] text-gray-700 mt-0.5">결정세액 <span className="font-bold">{data.taxAmount}만원</span></p>
                      <p className="text-[8px] text-gray-600">환급예상 70만원</p>
                    </div>
                  </div>
                  
                  {/* 굴뚝 (부동산) 텍스트 */}
                  <div className="absolute right-[30px] top-[22px] text-center">
                    <p className="text-[9px] font-bold text-gray-700">🏠 부동산</p>
                    <p className="text-[8px] text-gray-600">{data.realEstateValue}억</p>
                  </div>
                </div>
                
                {/* ===== 처마보 (나이/기간 타임라인) ===== */}
                <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-x-2 border-gray-800 px-2 py-1.5 flex items-center justify-between">
                  {/* 현재 나이 */}
                  <div className="text-center">
                    <p className="text-[13px] font-extrabold text-gray-800">{data.currentAge}</p>
                    <p className="text-[7px] text-gray-500">현재</p>
                  </div>
                  
                  {/* 경제활동기간 */}
                  <div className="flex-1 flex items-center justify-center mx-1">
                    <div className="flex items-center gap-0.5">
                      <span className="text-red-500 text-[8px]">◀</span>
                      <div className="flex-1 h-[1px] bg-red-400 min-w-[20px]"></div>
                      <span className="text-[9px] font-bold text-red-500 px-1">{data.retirementAge - data.currentAge}년</span>
                      <div className="flex-1 h-[1px] bg-red-400 min-w-[20px]"></div>
                      <span className="text-red-500 text-[8px]">▶</span>
                    </div>
                  </div>
                  
                  {/* 은퇴 나이 */}
                  <div className="text-center">
                    <p className="text-[13px] font-extrabold text-gray-800">{data.retirementAge}</p>
                    <p className="text-[7px] text-gray-500">은퇴</p>
                  </div>
                  
                  {/* 은퇴기간 */}
                  <div className="flex-1 flex items-center justify-center mx-1">
                    <div className="flex items-center gap-0.5">
                      <span className="text-red-500 text-[8px]">◀</span>
                      <div className="flex-1 h-[1px] bg-red-400 min-w-[15px]"></div>
                      <span className="text-[9px] font-bold text-red-500 px-1">{data.lifeExpectancy - data.retirementAge}년</span>
                      <div className="flex-1 h-[1px] bg-red-400 min-w-[15px]"></div>
                      <span className="text-red-500 text-[8px]">▶</span>
                    </div>
                  </div>
                  
                  {/* 기대수명 */}
                  <div className="text-center">
                    <p className="text-[13px] font-extrabold text-gray-800">{data.lifeExpectancy}</p>
                    <p className="text-[7px] text-gray-500">기대수명</p>
                  </div>
                </div>
                
                {/* ===== 기둥 섹션 (부채/저축 + 은퇴) ===== */}
                <div className="flex border-x-2 border-gray-800" style={{ height: '110px' }}>
                  {/* 부채/저축 영역 (53%) */}
                  <div className="relative border-r-2 border-gray-800" style={{ flex: '53' }}>
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                      {/* 부채 (위쪽 삼각형) - 회색 */}
                      <polygon points="0,0 100,0 0,100" fill="#C0C0C0"/>
                      {/* 저축 (아래쪽 삼각형) - 노란색 */}
                      <polygon points="100,0 100,100 0,100" fill="#F4D03F"/>
                      {/* 대각선 */}
                      <line x1="0" y1="100" x2="100" y2="0" stroke="#333" strokeWidth="0.5"/>
                    </svg>
                    
                    {/* 부채 정보 */}
                    <div className="absolute top-2 left-2 text-left">
                      <p className="text-[10px] font-extrabold text-gray-800">💳 부채 <span className="text-red-500">↓</span></p>
                      <p className="text-[8px] text-gray-700">① 담보: {data.debtAmount}억원</p>
                      <p className="text-[8px] text-gray-700">② 신용: 5천만원</p>
                      <p className="text-[8px] text-gray-700">③ DSR: {data.debtRatio}%</p>
                    </div>
                    
                    {/* 저축 정보 */}
                    <div className="absolute bottom-2 right-2 text-right">
                      <p className="text-[10px] font-extrabold text-gray-800"><span className="text-green-600">↑</span> 💰 저축</p>
                      <p className="text-[8px] text-gray-700">① 목적: 노후준비</p>
                      <p className="text-[8px] text-gray-700">② 저축률: {data.savingsRate}%</p>
                      <p className="text-[8px] text-gray-700">③ 월저축: {data.monthlySavings}만원</p>
                    </div>
                  </div>
                  
                  {/* 은퇴 영역 (47%) */}
                  <div className="flex flex-col bg-gradient-to-b from-blue-50 to-blue-100" style={{ flex: '47' }}>
                    {/* 은퇴 헤더 */}
                    <div className="bg-teal-500 px-2 py-1 flex justify-between items-center">
                      <p className="text-[10px] font-extrabold text-white">🏖️ 은퇴</p>
                      <p className="text-[9px] font-semibold text-white">준비율 {data.retirementReadyRate}%</p>
                    </div>
                    
                    {/* 은퇴 내용 */}
                    <div className="flex-1 px-2 py-1.5 flex flex-col justify-center gap-0.5">
                      <div className="flex justify-between">
                        <span className="text-[8px] text-gray-600">필요자금(월)</span>
                        <span className="text-[9px] font-semibold text-gray-800">{data.requiredMonthly}만원</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[8px] text-gray-600">준비자금(월)</span>
                        <span className="text-[9px] font-semibold text-gray-800">{data.preparedMonthly}만원</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[8px] text-gray-600">부족자금(월)</span>
                        <span className="text-[9px] font-bold text-red-500">{data.shortfallMonthly}만원</span>
                      </div>
                      <div className="border-t border-gray-300 mt-1 pt-1">
                        <div className="flex justify-between">
                          <span className="text-[8px] text-gray-600">노후총필요</span>
                          <span className="text-[9px] font-bold text-red-500">9억원</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[8px] text-gray-600">추가준비필요</span>
                          <span className="text-[9px] font-semibold text-gray-800">5.1억원</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* ===== 보험 섹션 (8대 보장 막대 차트) ===== */}
                <div className="bg-white border-2 border-t-0 border-gray-800 px-2 py-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-extrabold text-gray-800">🛡️ 보장성 보험 (8대 보장)</p>
                  </div>
                  
                  {/* 막대 차트 */}
                  <div className="flex gap-1">
                    {/* 사망 */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full h-10 bg-gray-200 rounded-sm overflow-hidden flex flex-col justify-end">
                        <div className="w-full bg-gradient-to-t from-red-400 to-red-300" style={{ height: '66%' }}></div>
                      </div>
                      <p className="text-[7px] font-semibold text-gray-700 mt-0.5">3.9억</p>
                      <p className="text-[7px] text-gray-500">사망</p>
                    </div>
                    
                    {/* 장해 */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full h-10 bg-gray-200 rounded-sm overflow-hidden flex flex-col justify-end">
                        <div className="w-full bg-gradient-to-t from-red-400 to-red-300" style={{ height: '83%' }}></div>
                      </div>
                      <p className="text-[7px] font-semibold text-gray-700 mt-0.5">4.9억</p>
                      <p className="text-[7px] text-gray-500">장해</p>
                    </div>
                    
                    {/* 암진단 */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full h-10 bg-gray-200 rounded-sm overflow-hidden flex flex-col justify-end">
                        <div className="w-full bg-gradient-to-t from-red-400 to-red-300" style={{ height: '58%' }}></div>
                      </div>
                      <p className="text-[7px] font-semibold text-gray-700 mt-0.5">7천</p>
                      <p className="text-[7px] text-gray-500">암진단</p>
                    </div>
                    
                    {/* 뇌질환 */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full h-10 bg-gray-200 rounded-sm overflow-hidden flex flex-col justify-end">
                        <div className="w-full bg-gradient-to-t from-red-400 to-red-300" style={{ height: '50%' }}></div>
                      </div>
                      <p className="text-[7px] font-semibold text-gray-700 mt-0.5">3천</p>
                      <p className="text-[7px] text-gray-500">뇌질환</p>
                    </div>
                    
                    {/* 심질환 */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full h-10 bg-gray-200 rounded-sm overflow-hidden flex flex-col justify-end">
                        <div className="w-full bg-gradient-to-t from-red-400 to-red-300" style={{ height: '50%' }}></div>
                      </div>
                      <p className="text-[7px] font-semibold text-gray-700 mt-0.5">3천</p>
                      <p className="text-[7px] text-gray-500">심질환</p>
                    </div>
                    
                    {/* 실비 */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full h-10 bg-gray-200 rounded-sm overflow-hidden flex flex-col justify-end">
                        <div className="w-full bg-gradient-to-t from-green-400 to-green-300 h-full"></div>
                      </div>
                      <p className="text-[7px] font-semibold text-green-600 mt-0.5">충분</p>
                      <p className="text-[7px] text-gray-500">실비</p>
                    </div>
                    
                    {/* 입원수술 */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full h-10 bg-gray-200 rounded-sm overflow-hidden flex flex-col justify-end">
                        <div className="w-full bg-gradient-to-t from-teal-400 to-teal-300 h-full"></div>
                      </div>
                      <p className="text-[7px] font-semibold text-teal-600 mt-0.5">있음</p>
                      <p className="text-[6px] text-gray-500 leading-tight">입원<br/>수술</p>
                    </div>
                    
                    {/* 치매간병 */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full h-10 bg-gray-200 rounded-sm overflow-hidden flex items-center justify-center">
                        <p className="text-[6px] text-gray-400">없음</p>
                      </div>
                      <p className="text-[7px] font-semibold text-gray-400 mt-0.5">없음</p>
                      <p className="text-[6px] text-gray-500 leading-tight">치매<br/>간병</p>
                    </div>
                  </div>
                </div>
                
                {/* 출처 */}
                <p className="text-[8px] text-white/80 text-center mt-2">출처: 한국FPSB, 오원트금융연구소</p>
              </div>
              
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

        {/* 저작권 정보 */}
        <div className="w-full mt-2 mb-2 text-center px-3 py-2 bg-gray-50 rounded-lg">
          <p className="text-xs font-bold text-gray-600">
            © 2017 오원트금융연구소 All rights reserved.
          </p>
          <p className="text-[11px] font-semibold text-gray-500 mt-1">
            특허 제10-2202486호 | 상표권 제41-0388261호
          </p>
          
          {/* ★★★ v3.1: 두 버튼 나란히 배치 ★★★ */}
          <div className="flex justify-center gap-4 mt-3">
            <button 
              onClick={() => setShowReportModal(true)}
              className="text-[11px] text-teal-600 font-semibold flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 rounded-full transition-colors active:scale-95"
            >
              <span>▼</span>
              <span>📊 재무설계리포트 보기</span>
            </button>
            <button 
              onClick={handleCertificateToggle}
              className="text-[11px] text-gray-500 font-semibold flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors active:scale-95"
            >
              <span>{showCertificates ? '▲' : '▼'}</span>
              <span>📜 관련 자격증 보기</span>
            </button>
          </div>
        </div>

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

              {/* ★★★ 금융집 시각화 ★★★ */}
              <div className="bg-white mx-4 my-4 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-teal-500">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-xl">🏠</div>
                  <div>
                    <h2 className="font-bold text-lg">Financial House</h2>
                    <p className="text-xs text-gray-500">나의 금융집</p>
                  </div>
                </div>

                {/* 금융집 다이어그램 */}
                <div className="bg-gradient-to-b from-teal-400 to-teal-500 rounded-xl p-3">
                  <p className="text-center text-white text-sm font-bold mb-2">🏠 {userName || '고객'}님의 금융집</p>
                  
                  <div className="max-w-[300px] mx-auto">
                    {/* 지붕 */}
                    <div className="relative">
                      <svg viewBox="0 0 300 60" className="w-full" preserveAspectRatio="xMidYMid meet">
                        <polygon points="150,0 0,60 150,60" fill="#5DADE2" stroke="#333" strokeWidth="1"/>
                        <polygon points="150,0 300,60 150,60" fill="#82E0AA" stroke="#333" strokeWidth="1"/>
                        <line x1="150" y1="0" x2="150" y2="60" stroke="#333" strokeWidth="0.5"/>
                        <rect x="220" y="15" width="35" height="35" fill="#E8E8E8" stroke="#333" strokeWidth="1"/>
                      </svg>
                      <div className="absolute inset-0 flex">
                        <div className="flex-1 flex flex-col items-center justify-center pt-3 pr-6">
                          <p className="text-[9px] font-bold text-gray-800">📈 투자</p>
                          <p className="text-[7px] text-gray-700">부자지수 {data.wealthIndex}%</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center pt-3 pl-2 pr-10">
                          <p className="text-[9px] font-bold text-gray-800">💸 세금</p>
                          <p className="text-[7px] text-gray-700">{data.taxAmount}만원</p>
                        </div>
                      </div>
                      <div className="absolute right-[22px] top-[18px] text-center">
                        <p className="text-[7px] font-bold text-gray-700">🏠</p>
                        <p className="text-[6px] text-gray-600">{data.realEstateValue}억</p>
                      </div>
                    </div>

                    {/* 처마보 */}
                    <div className="bg-amber-100 border-x border-gray-800 px-2 py-1 flex items-center justify-between text-[8px]">
                      <span className="font-bold">{data.currentAge}</span>
                      <span className="text-red-500 text-[7px]">← {data.retirementAge - data.currentAge}년 →</span>
                      <span className="font-bold">{data.retirementAge}</span>
                      <span className="text-red-500 text-[7px]">← {data.lifeExpectancy - data.retirementAge}년 →</span>
                      <span className="font-bold">{data.lifeExpectancy}</span>
                    </div>

                    {/* 기둥 */}
                    <div className="flex border-x border-gray-800" style={{ height: '80px' }}>
                      <div className="relative border-r border-gray-800" style={{ flex: '53' }}>
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                          <polygon points="0,0 100,0 0,100" fill="#C0C0C0"/>
                          <polygon points="100,0 100,100 0,100" fill="#F4D03F"/>
                        </svg>
                        <div className="absolute top-1 left-1">
                          <p className="text-[8px] font-bold">💳 부채</p>
                          <p className="text-[6px]">DSR {data.debtRatio}%</p>
                        </div>
                        <div className="absolute bottom-1 right-1 text-right">
                          <p className="text-[8px] font-bold">💰 저축</p>
                          <p className="text-[6px]">{data.savingsRate}%</p>
                        </div>
                      </div>
                      <div className="bg-blue-50" style={{ flex: '47' }}>
                        <div className="bg-teal-500 px-1 py-0.5 flex justify-between">
                          <span className="text-[8px] font-bold text-white">🏖️ 은퇴</span>
                          <span className="text-[7px] text-white">{data.retirementReadyRate}%</span>
                        </div>
                        <div className="p-1 text-[6px]">
                          <div className="flex justify-between"><span>필요</span><span>{data.requiredMonthly}만</span></div>
                          <div className="flex justify-between"><span>준비</span><span>{data.preparedMonthly}만</span></div>
                          <div className="flex justify-between text-red-500 font-bold"><span>부족</span><span>{data.shortfallMonthly}만</span></div>
                        </div>
                      </div>
                    </div>

                    {/* 보험 */}
                    <div className="bg-white border-x border-b border-gray-800 p-2">
                      <p className="text-[8px] font-bold mb-1">🛡️ 8대 보장</p>
                      <div className="flex gap-0.5">
                        {['사망', '장해', '암', '뇌', '심', '실비', '입원', '치매'].map((item, i) => (
                          <div key={i} className="flex-1 text-center">
                            <div className={`h-6 rounded-sm ${i < 5 ? 'bg-red-200' : i < 7 ? 'bg-green-200' : 'bg-gray-200'}`}></div>
                            <p className="text-[5px] mt-0.5">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 등급 */}
                  <div className="bg-white/90 rounded-xl p-3 mt-3 text-center">
                    <p className="text-2xl">🏠</p>
                    <p className="font-extrabold text-gray-800">벽돌집 (Level 3)</p>
                    <p className="text-sm text-teal-600 font-semibold">66.7점 / 100점</p>
                  </div>
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
