// src/pages/FinancialHouseResult.tsx
// Phase 9-13: 금융집짓기 3단계 - 재무설계도 결과 화면
// v2.0: 탭 클릭 시 해당 2단계로 이동 기능 추가
// v3.0: 종합재무설계 리포트 모달 추가 (고객 데이터 연동)
// v4.0: 슬라이드1을 SVG 기반 금융집 다이어그램으로 전면 교체 (시뮬레이터 스타일)
// v5.0: 슬라이드1 SVG 전면 수정 (색상/데이터연동/보험)
// ★★★ v6.0: 5가지 수정사항 반영 ★★★
//   1) 파스텔톤 색상 (원색 → 부드러운 파스텔)
//   2) 수직선 위치 보정 (은퇴 60세 중심 일직선)
//   3) 투자↔세금 위치 교정 (좌측=세금, 우측=투자 올바르게)
//   4) 2단계 financialHouseDesignData 기반 데이터 연동 (1단계 X)
//   5) 보험 막대그래프 실데이터 연동 (8대 보장 필요자금/준비자금 비율)

import { useState, useRef, useEffect } from 'react';

// ============================================
// Firebase Storage URL 상수
// ============================================
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a";
const PROFILE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%98%A4%EC%83%81%EC%97%B4%20%EC%82%AC%EC%A7%84.png?alt=media&token=63eaf15e-9d0b-4d72-8fbb-ee03d6ecc8e5';
const EXTERIOR_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/financial-house-exterior.png.png?alt=media&token=e1651823-af8e-4ed3-9b3d-557a1bf0eb10';
const CERTIFICATE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%A0%80%EC%9E%91%EA%B6%8C%EC%83%81%ED%91%9C%EA%B6%8C%ED%8A%B9%ED%97%88%EA%B6%8C.png?alt=media&token=2ad30230-ccc5-481d-89d7-82c421ee3759';
const ANIMATION_VIDEO_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EA%B8%88%EC%9C%B5%EC%A7%91%EC%A7%93%EA%B8%B0%20%EC%97%90%EB%8B%88%EB%A9%94%EC%9D%B4%EC%85%98.mp4?alt=media&token=7b052cb9-4c71-407a-bddd-e8d60e96e95c';

// ============================================
// ★★★ v6.0: localStorage 키 상수 ★★★
// ============================================
const DESIGN_KEY = 'financialHouseDesignData';     // 2단계 재무설계 데이터 (최우선)
const BASIC_FINAL_KEY = 'financialHouseData';       // 1단계 최종저장 (폴백)
const BASIC_DRAFT_KEY = 'financialHouseBasicDraft'; // 1단계 임시저장 (폴백)

// ============================================
// ★★★ v6.0: 파스텔톤 색상 상수 ★★★
// 첨부1(외부 집 이미지)과 톤을 맞춤 - 부드러운 파스텔
// ============================================
const COLORS = {
  taxRoof: '#E8A09A',        // 좌측 지붕 (세금) - 파스텔 붉은색
  investRoof: '#8FBF8F',     // 우측 지붕 (투자) - 파스텔 녹색
  debt: '#F5D88E',           // 좌측 역삼각형 (부채) - 파스텔 노랑
  savings: '#C4A882',        // 좌측 정삼각형 (저축) - 파스텔 고동색
  retire: '#8BB8E0',         // 우측 기둥 (은퇴) - 파스텔 파랑
  insurance: '#5D4037',      // 기초 바닥 (보험) - 진한밤색
  chimney: '#D5D5D5',        // 굴뚝 (부동산) - 연한 회색
  timeline: '#F5F0E8',       // 처마보 (나이/기간) - 크림색
  background: '#4DB6AC',     // 배경 민트색 (그라디언트 시작)
  backgroundEnd: '#26A69A',  // 배경 민트색 (그라디언트 끝)
  barYellow: '#F5D547',      // 보험 막대그래프 노랑
  barRedLine: '#E53935',     // 보험 기준선 빨강
};

// ============================================
// 금액 포맷팅 유틸
// ============================================
const formatManwon = (val: number): string => {
  if (!val || val === 0) return '-';
  if (val >= 10000) {
    const eok = Math.floor(val / 10000);
    const remain = val % 10000;
    if (remain === 0) return `${eok}억`;
    return `${eok}억${remain.toLocaleString()}만`;
  }
  return `${val.toLocaleString()}만원`;
};

const formatEok = (val: number): string => {
  if (!val || val === 0) return '-';
  if (val >= 10000) {
    const eok = (val / 10000).toFixed(1);
    return `${eok}억원`;
  }
  return `${val.toLocaleString()}만원`;
};

// ============================================
// ★★★ v6.0 핵심: 2단계 재무설계 데이터 로드 ★★★
// 우선순위: 2단계(financialHouseDesignData) → 1단계(financialHouseData) → 기본값
// ============================================
const loadDesignDataFromStorage = () => {
  try {
    // ★ 2단계 데이터 최우선
    const designRaw = localStorage.getItem(DESIGN_KEY);
    if (designRaw) {
      const design = JSON.parse(designRaw);
      console.log('[v6.0] 2단계 재무설계 데이터 로드 성공:', design);
      return { source: '2단계', data: design };
    }

    // ★ 폴백: 1단계 최종
    const basicFinalRaw = localStorage.getItem(BASIC_FINAL_KEY);
    if (basicFinalRaw) {
      const basic = JSON.parse(basicFinalRaw);
      console.log('[v6.0] 1단계 최종 데이터 로드:', basic);
      return { source: '1단계최종', data: basic };
    }

    // ★ 폴백: 1단계 임시
    const basicDraftRaw = localStorage.getItem(BASIC_DRAFT_KEY);
    if (basicDraftRaw) {
      const basic = JSON.parse(basicDraftRaw);
      console.log('[v6.0] 1단계 임시 데이터 로드:', basic);
      return { source: '1단계임시', data: basic };
    }

    console.log('[v6.0] 저장된 데이터 없음, 기본값 사용');
    return { source: 'default', data: null };
  } catch (e) {
    console.error('[v6.0] 데이터 로드 실패:', e);
    return { source: 'error', data: null };
  }
};

// ★★★ v6.0: 2단계 데이터에서 각 영역별 값 추출 ★★★
const extractDesignValues = (rawData: any) => {
  if (!rawData) {
    return getDefaultValues();
  }

  // 2단계 데이터 구조: { retire: {...}, debt: {...}, save: {...}, invest: {...}, tax: {...}, estate: {...}, insurance: {...} }
  const retire = rawData.retire || {};
  const debt = rawData.debt || {};
  const save = rawData.save || {};
  const invest = rawData.invest || {};
  const tax = rawData.tax || {};
  const estate = rawData.estate || {};
  const insurance = rawData.insurance || {};

  // 나이 정보 (1단계 또는 2단계에서 가져옴)
  const currentAge = retire.currentAge || rawData.currentAge || rawData.basicInfo?.currentAge || 44;
  const retirementAge = retire.retirementAge || rawData.retirementAge || rawData.basicInfo?.retirementAge || 60;
  const lifeExpectancy = retire.lifeExpectancy || rawData.lifeExpectancy || rawData.basicInfo?.lifeExpectancy || 90;

  // 은퇴설계
  const retireNeeds = Number(retire.monthlyNeeds || retire.needsMonthly || retire.필요자금월 || 0);
  const retirePrep = Number(retire.monthlyPrep || retire.prepMonthly || retire.준비자금월 || 0);
  const retireShortage = retireNeeds > 0 ? retireNeeds - retirePrep : 0;
  const retireYears = lifeExpectancy - retirementAge;
  const retireLumpSum = retireShortage > 0 ? retireShortage * 12 * retireYears : 0; // 순은퇴일시금 (만원)
  const yearsToRetire = retirementAge - currentAge;
  const monthlySavingsForRetire = (yearsToRetire > 0 && retireLumpSum > 0) ? Math.round(retireLumpSum / (yearsToRetire * 12)) : 0;
  const retireReadiness = retireNeeds > 0 ? Math.round((retirePrep / retireNeeds) * 100) : 0;

  // 부채설계
  const totalDebt = Number(debt.totalDebt || debt.총부채 || 0);
  const totalAsset = Number(invest.totalAsset || estate.totalAsset || rawData.asset?.totalAsset || 0);
  const debtRatio = totalAsset > 0 ? Math.round((totalDebt / totalAsset) * 100) : 0;

  // 저축설계
  const savePurpose = save.purpose || save.목적 || '주택마련';
  const savePeriod = Number(save.period || save.기간 || 0);
  const saveAmount = Number(save.targetAmount || save.금액 || save.목표금액 || 0);
  const saveMonthlySavings = (savePeriod > 0 && saveAmount > 0) ? Math.round(saveAmount / (savePeriod * 12)) : Number(save.monthlySavings || save.월저축액 || 0);

  // 투자설계
  const totalAssetForWealth = Number(invest.totalAsset || estate.totalAsset || rawData.asset?.totalAsset || 0);
  const totalDebtForWealth = Number(debt.totalDebt || debt.총부채 || 0);
  const netAsset = totalAssetForWealth - totalDebtForWealth;
  const wealthIndex = totalAssetForWealth > 0 ? Math.round((netAsset / totalAssetForWealth) * 100) : 0;

  // 세금설계
  const taxAmount = Number(tax.taxAmount || tax.결정세액 || 0);
  const inheritanceTax = Number(tax.inheritanceTax || tax.예상상속세 || 0);

  // 부동산설계
  const realEstateValue = Number(estate.residentialValue || estate.거주용부동산 || estate.realEstateValue || 0);

  // 보험설계 (8대 보장)
  const insuranceItems = [
    { label: '사망', key: 'death', needKey: '사망' },
    { label: '장해', key: 'disability', needKey: '장해' },
    { label: '암진단', key: 'cancer', needKey: '암진단' },
    { label: '뇌혈관', key: 'brain', needKey: '뇌혈관' },
    { label: '심혈관', key: 'heart', needKey: '심혈관' },
    { label: '실비', key: 'medical', needKey: '실비' },
    { label: '입원수술', key: 'hospital', needKey: '입원수술' },
    { label: '치매간병', key: 'dementia', needKey: '치매간병' },
  ];

  const insuranceData = insuranceItems.map(item => {
    const need = Number(insurance[`${item.key}Need`] || insurance[`need_${item.key}`] || insurance[`필요자금_${item.needKey}`] || insurance[item.needKey]?.필요자금 || 0);
    const prep = Number(insurance[`${item.key}Prep`] || insurance[`prep_${item.key}`] || insurance[`준비자금_${item.needKey}`] || insurance[item.needKey]?.준비자금 || 0);
    const shortage = need - prep;
    const ratio = need > 0 ? Math.min(Math.round((prep / need) * 100), 100) : 0;
    // 특약필요 여부 체크
    const isSpecialRequired = (insurance[`${item.key}Status`] === '특약필요' || insurance[`준비자금_${item.needKey}`] === '특약필요');
    const isNotJoined = (insurance[`${item.key}Status`] === '미가입' || insurance[`부족자금_${item.needKey}`] === '미가입' || shortage < 0);

    return {
      label: item.label,
      need,
      prep,
      shortage,
      ratio,
      isSpecialRequired,
      isNotJoined: isNotJoined || (need === 0 && prep === 0),
    };
  });

  return {
    currentAge,
    retirementAge,
    lifeExpectancy,
    // 은퇴
    retireNeeds,
    retirePrep,
    retireShortage,
    retireLumpSum,
    monthlySavingsForRetire,
    retireReadiness,
    // 부채
    totalDebt,
    debtRatio,
    // 저축
    savePurpose,
    savePeriod,
    saveAmount,
    saveMonthlySavings,
    // 투자
    wealthIndex,
    netAsset,
    // 세금
    taxAmount,
    inheritanceTax,
    // 부동산
    realEstateValue,
    // 보험
    insuranceData,
  };
};

const getDefaultValues = () => ({
  currentAge: 44,
  retirementAge: 60,
  lifeExpectancy: 90,
  retireNeeds: 0,
  retirePrep: 0,
  retireShortage: 0,
  retireLumpSum: 0,
  monthlySavingsForRetire: 0,
  retireReadiness: 0,
  totalDebt: 0,
  debtRatio: 0,
  savePurpose: '-',
  savePeriod: 0,
  saveAmount: 0,
  saveMonthlySavings: 0,
  wealthIndex: 0,
  netAsset: 0,
  taxAmount: 0,
  inheritanceTax: 0,
  realEstateValue: 0,
  insuranceData: [
    { label: '사망', need: 0, prep: 0, shortage: 0, ratio: 0, isSpecialRequired: false, isNotJoined: true },
    { label: '장해', need: 0, prep: 0, shortage: 0, ratio: 0, isSpecialRequired: false, isNotJoined: true },
    { label: '암진단', need: 0, prep: 0, shortage: 0, ratio: 0, isSpecialRequired: false, isNotJoined: true },
    { label: '뇌혈관', need: 0, prep: 0, shortage: 0, ratio: 0, isSpecialRequired: false, isNotJoined: true },
    { label: '심혈관', need: 0, prep: 0, shortage: 0, ratio: 0, isSpecialRequired: false, isNotJoined: true },
    { label: '실비', need: 0, prep: 0, shortage: 0, ratio: 0, isSpecialRequired: false, isNotJoined: true },
    { label: '입원수술', need: 0, prep: 0, shortage: 0, ratio: 0, isSpecialRequired: false, isNotJoined: true },
    { label: '치매간병', need: 0, prep: 0, shortage: 0, ratio: 0, isSpecialRequired: false, isNotJoined: true },
  ],
});

// ============================================
// Props 인터페이스
// ============================================
interface FinancialHouseResultProps {
  userName?: string;
  onRestart?: () => void;
  onNavigate?: (path: string) => void;
  onBack?: () => void;
  onTabClick?: (tabId: string) => void;
  financialData?: any;
}

// ============================================
// 7개 탭 정의
// ============================================
const TABS = [
  { id: 'retire', label: '은퇴', icon: '🏖️', color: 'bg-blue-100 text-blue-700' },
  { id: 'debt', label: '부채', icon: '💳', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'save', label: '저축', icon: '💰', color: 'bg-amber-100 text-amber-700' },
  { id: 'invest', label: '투자', icon: '📈', color: 'bg-green-100 text-green-700' },
  { id: 'tax', label: '세금', icon: '💸', color: 'bg-red-100 text-red-700' },
  { id: 'estate', label: '부동산', icon: '🏠', color: 'bg-gray-100 text-gray-700' },
  { id: 'insurance', label: '보험', icon: '🛡️', color: 'bg-purple-100 text-purple-700' },
];

// ============================================
// 메인 컴포넌트
// ============================================
const FinancialHouseResult: React.FC<FinancialHouseResultProps> = ({
  userName = '4',
  onRestart,
  onNavigate,
  onBack,
  onTabClick,
  financialData: propData,
}) => {
  // ===== State =====
  const [currentSlide, setCurrentSlide] = useState(0);
  const [exteriorLoaded, setExteriorLoaded] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [designValues, setDesignValues] = useState(getDefaultValues());
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  // ===== 2단계 데이터 로드 =====
  useEffect(() => {
    const { source, data } = loadDesignDataFromStorage();
    console.log(`[v6.0] 데이터 소스: ${source}`);
    
    if (data) {
      const values = extractDesignValues(data);
      setDesignValues(values);
    } else if (propData) {
      const values = extractDesignValues(propData);
      setDesignValues(values);
    }
  }, [propData]);

  // ===== 슬라이드 핸들러 =====
  const totalSlides = 3;
  const handleSlideNext = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  const handleSlidePrev = () => setCurrentSlide(prev => Math.max(prev - 1, 0));
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleSlideNext();
      else handleSlidePrev();
    }
  };

  const handleRestart = () => {
    if (onRestart) onRestart();
    else if (onBack) onBack();
  };

  const handleTabClick = (tabId: string) => {
    if (onTabClick) onTabClick(tabId);
  };

  // ===== 디스트럭처링 =====
  const {
    currentAge, retirementAge, lifeExpectancy,
    retireNeeds, retirePrep, retireShortage, retireLumpSum, monthlySavingsForRetire, retireReadiness,
    totalDebt, debtRatio,
    savePurpose, savePeriod, saveAmount, saveMonthlySavings,
    wealthIndex, netAsset,
    taxAmount, inheritanceTax,
    realEstateValue,
    insuranceData,
  } = designValues;

  // 기간 계산
  const yearsToRetire = retirementAge - currentAge;
  const yearsAfterRetire = lifeExpectancy - retirementAge;

  // ============================================
  // 렌더링
  // ============================================
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* ===== 헤더 ===== */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-xl">←</button>
          )}
          <img src={LOGO_URL} alt="AI머니야" className="w-8 h-8 rounded-full" />
          <h1 className="text-lg font-bold text-gray-800">{userName}님의 금융집짓기®</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs text-gray-500 flex flex-col items-center">
            <span>🏠</span><span>메타버스</span>
          </button>
          <img src={PROFILE_IMAGE_URL} alt="상담" className="w-8 h-8 rounded-full border" />
        </div>
      </header>

      {/* ===== 7개 탭 (완료 표시) ===== */}
      <div className="flex gap-1 px-2 py-2 bg-white overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-green-50 border border-green-200 text-xs font-medium text-green-700 whitespace-nowrap flex-shrink-0"
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className="text-green-500">✓</span>
          </button>
        ))}
      </div>

      {/* ===== 진행률 바 ===== */}
      <div className="px-4 py-1 bg-white">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '100%' }} />
        </div>
      </div>

      {/* ===== 슬라이드 영역 ===== */}
      <div className="flex-1 overflow-hidden relative">
        <div
          ref={slideContainerRef}
          className="flex h-full transition-transform duration-300"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* ======================================== */}
          {/* 슬라이드 0: 외부 이미지 (파스텔 집) */}
          {/* ======================================== */}
          <div className="min-w-full h-full relative">
            <img
              src={EXTERIOR_IMAGE_URL}
              alt="금융집짓기 외부"
              className={`w-full h-full object-cover transition-opacity duration-300 ${exteriorLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setExteriorLoaded(true)}
              onError={() => setExteriorLoaded(true)}
            />
            <button onClick={handleSlideNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-95">
              <span className="text-gray-600 font-bold">›</span>
            </button>
            <button onClick={handleRestart} className="absolute bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-white/95 hover:bg-white text-gray-700 text-sm font-bold rounded-lg border border-gray-300 shadow-md flex items-center gap-1.5">
              <span>🔄</span><span>다시 설계하기</span>
            </button>
          </div>

          {/* ======================================== */}
          {/* ★★★ 슬라이드 1: SVG 금융집 내부 설계도 (v6.0) ★★★ */}
          {/* ======================================== */}
          <div className="min-w-full h-full relative flex items-center justify-center p-3 overflow-hidden"
               style={{ background: `linear-gradient(to bottom, ${COLORS.background}, ${COLORS.backgroundEnd})` }}>
            
            {/* 좌측 화살표 */}
            <button onClick={handleSlidePrev} className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow z-10 active:scale-95">
              <span className="text-gray-600 font-bold text-sm">‹</span>
            </button>

            {/* SVG 금융집 전체 */}
            <div className="w-full max-w-[360px] mx-auto">
              
              {/* ===== 지붕 (세금-좌 / 투자-우 / 부동산-굴뚝) ===== */}
              <div className="relative">
                <svg viewBox="0 0 360 75" className="w-full" preserveAspectRatio="xMidYMid meet">
                  {/* 좌측 지붕 (세금) - 파스텔 붉은색 */}
                  <polygon points="180,0 0,75 180,75" fill={COLORS.taxRoof} stroke="#666" strokeWidth="1"/>
                  {/* 우측 지붕 (투자) - 파스텔 녹색 */}
                  <polygon points="180,0 360,75 180,75" fill={COLORS.investRoof} stroke="#666" strokeWidth="1"/>
                  {/* 중앙 분할선 */}
                  <line x1="180" y1="0" x2="180" y2="75" stroke="#666" strokeWidth="0.5"/>
                  {/* 굴뚝 (부동산) */}
                  <rect x="270" y="18" width="42" height="42" fill={COLORS.chimney} stroke="#666" strokeWidth="1" rx="2"/>
                </svg>
                
                {/* 지붕 텍스트 오버레이 */}
                <div className="absolute inset-0 flex">
                  {/* ★ 세금 (좌측 지붕) - 좌측 정렬 */}
                  <div className="flex-1 flex flex-col items-start justify-center pt-6 pl-3">
                    <p className="text-[11px] font-extrabold text-white drop-shadow">💸 세금</p>
                    <p className="text-[9px] text-white/90 mt-0.5">결정세액 <span className="font-bold">{taxAmount > 0 ? formatManwon(taxAmount) : '-'}</span></p>
                    <p className="text-[8px] text-white/80">예상상속세 <span className="font-bold">{inheritanceTax > 0 ? formatManwon(inheritanceTax) : '-'}</span></p>
                  </div>
                  {/* ★ 투자 (우측 지붕) - 우측 정렬, 굴뚝 피해서 */}
                  <div className="flex-1 flex flex-col items-end justify-center pt-6 pr-[72px]">
                    <p className="text-[11px] font-extrabold text-white drop-shadow">📈 투자</p>
                    <p className="text-[9px] text-white/90 mt-0.5">부자지수 <span className="font-bold">{wealthIndex > 0 ? `${wealthIndex}%` : '-'}</span></p>
                    <p className="text-[8px] text-white/80">순자산 <span className="font-bold">{netAsset !== 0 ? formatManwon(netAsset) : '-'}</span></p>
                  </div>
                </div>
                
                {/* 부동산 (굴뚝 텍스트) */}
                <div className="absolute top-[22px] right-[18px] w-[42px] flex flex-col items-center">
                  <p className="text-[7px] font-bold text-gray-600">🏠 부동산</p>
                  <p className="text-[6px] text-gray-500 mt-0.5 text-center leading-tight">{realEstateValue > 0 ? formatManwon(realEstateValue) : '-'}</p>
                </div>
              </div>

              {/* ===== 처마보 (나이/기간 타임라인) ===== */}
              <div className="relative h-[28px] flex items-center" style={{ backgroundColor: COLORS.timeline }}>
                <svg viewBox="0 0 360 28" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  {/* 배경 */}
                  <rect x="0" y="0" width="360" height="28" fill={COLORS.timeline}/>
                  {/* 좌측: 현재 나이 */}
                  <text x="20" y="18" fontSize="11" fontWeight="bold" fill="#333">{currentAge}</text>
                  <text x="20" y="26" fontSize="7" fill="#666">현재</text>
                  {/* 좌측 기간 화살표 */}
                  <text x="70" y="14" fontSize="8" fill="#666">←</text>
                  <text x="82" y="14" fontSize="8" fontWeight="bold" fill="#333">{yearsToRetire}년</text>
                  <text x="110" y="14" fontSize="8" fill="#666">→</text>
                  {/* ★★★ v6.0: 중앙 은퇴 나이 - 수직선과 정확히 일치 (x=180) ★★★ */}
                  <text x="180" y="18" fontSize="12" fontWeight="bold" fill="#333" textAnchor="middle">{retirementAge}</text>
                  <text x="180" y="26" fontSize="7" fill="#666" textAnchor="middle">은퇴</text>
                  {/* 우측 기간 화살표 */}
                  <text x="220" y="14" fontSize="8" fill="#666">←</text>
                  <text x="240" y="14" fontSize="8" fontWeight="bold" fill="#333">{yearsAfterRetire}년</text>
                  <text x="275" y="14" fontSize="8" fill="#666">→</text>
                  {/* 우측: 기대수명 */}
                  <text x="340" y="18" fontSize="11" fontWeight="bold" fill="#333" textAnchor="end">{lifeExpectancy}</text>
                  <text x="340" y="26" fontSize="7" fill="#666" textAnchor="end">기대수명</text>
                </svg>
              </div>

              {/* ===== 본체 (부채+저축 좌측 / 은퇴 우측) ===== */}
              {/* ★★★ v6.0: 수직선이 정확히 중앙(50%) 위치 ★★★ */}
              <div className="relative" style={{ height: '180px' }}>
                <svg viewBox="0 0 360 180" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  {/* 부채 (좌측 역삼각형) - 파스텔 노랑 */}
                  <polygon points="0,0 180,0 0,90" fill={COLORS.debt} stroke="#666" strokeWidth="1"/>
                  {/* 저축 (좌측 정삼각형) - 파스텔 고동색 */}
                  <polygon points="0,90 180,0 180,180 0,180" fill={COLORS.savings} stroke="#666" strokeWidth="1"/>
                  {/* 은퇴 (우측 사각형) - 파스텔 파랑 */}
                  <rect x="180" y="0" width="180" height="180" fill={COLORS.retire} stroke="#666" strokeWidth="1"/>
                  
                  {/* ★★★ v6.0: 은퇴 수직 중심선 - x=180 고정, 처마보와 일직선 ★★★ */}
                  <line x1="180" y1="0" x2="180" y2="180" stroke="#CC3333" strokeWidth="2.5" strokeDasharray="4,2"/>
                </svg>
                
                {/* 부채 텍스트 (좌상단) */}
                <div className="absolute top-2 left-2 w-[80px]">
                  <p className="text-[10px] font-extrabold text-gray-700">💳 부채 ↓</p>
                  <p className="text-[8px] text-gray-600 mt-0.5">총부채 {totalDebt > 0 ? formatManwon(totalDebt) : '-'}</p>
                  <p className="text-[8px] text-gray-600">부채비율 {debtRatio > 0 ? `${debtRatio}%` : '-'}</p>
                </div>
                
                {/* 저축 텍스트 (좌하단) */}
                <div className="absolute bottom-3 left-2 w-[100px]">
                  <p className="text-[10px] font-extrabold text-white drop-shadow">↑ 💰 저축</p>
                  <p className="text-[8px] text-white/90 mt-0.5">목적: {savePurpose}</p>
                  <p className="text-[8px] text-white/90">기간: {savePeriod > 0 ? `${savePeriod}년` : '-'}</p>
                  <p className="text-[8px] text-white/90">월저축 {saveMonthlySavings > 0 ? `${saveMonthlySavings}만원` : '-'}</p>
                </div>
                
                {/* 은퇴 텍스트 (우측 중앙) */}
                <div className="absolute top-2 right-2 w-[155px] text-right">
                  <p className="text-[11px] font-extrabold text-white drop-shadow">🏖️ 은퇴 <span className="text-yellow-200">준비율 {retireReadiness > 0 ? `${retireReadiness}%` : '-'}</span></p>
                  <div className="mt-1 space-y-0.5 text-left pl-1">
                    <div className="flex justify-between text-[8px] text-white/90">
                      <span>필요자금(월)</span>
                      <span className="font-bold">{retireNeeds > 0 ? `${retireNeeds}만원` : '-'}</span>
                    </div>
                    <div className="flex justify-between text-[8px] text-white/90">
                      <span>준비자금(월)</span>
                      <span className="font-bold">{retirePrep > 0 ? `${retirePrep}만원` : '-'}</span>
                    </div>
                    <div className="flex justify-between text-[8px] text-red-200 font-bold">
                      <span>부족자금(월)</span>
                      <span>{retireShortage > 0 ? `${retireShortage}만원` : '-'}</span>
                    </div>
                    <hr className="border-white/30 my-0.5" />
                    <div className="flex justify-between text-[8px] text-white/90">
                      <span>순은퇴일시금</span>
                      <span className="font-bold">{retireLumpSum > 0 ? formatEok(retireLumpSum) : '-'}</span>
                    </div>
                    <div className="flex justify-between text-[8px] text-white/90">
                      <span>월저축연금액</span>
                      <span className="font-bold">{monthlySavingsForRetire > 0 ? `${monthlySavingsForRetire}만원` : '-'}</span>
                    </div>
                    <div className="flex justify-between text-[8px] text-yellow-200">
                      <span>은퇴준비율</span>
                      <span className="font-bold">{retireReadiness > 0 ? `${retireReadiness}%` : '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== 보장성 보험 (기초 - 8대 보장) ===== */}
              <div className="rounded-b-lg overflow-hidden" style={{ backgroundColor: COLORS.insurance }}>
                <p className="text-[10px] font-bold text-white text-center py-1">🛡️ 보장성 보험 (8대 보장)</p>
                
                {/* 8대 보장 막대그래프 */}
                <div className="flex justify-center gap-[6px] px-3 pb-1">
                  {insuranceData.map((item, idx) => {
                    const barHeight = 45; // 전체 막대 높이(px)
                    const filledHeight = item.isNotJoined ? 0 : (barHeight * item.ratio / 100);
                    
                    return (
                      <div key={idx} className="flex flex-col items-center" style={{ width: '34px' }}>
                        {/* 막대 영역 */}
                        <div className="relative" style={{ width: '20px', height: `${barHeight}px` }}>
                          {/* 배경 (빈 막대) */}
                          <div className="absolute inset-0 bg-gray-600 rounded-sm" />
                          {/* 기준선 (필요자금 = 상단) - 빨간 점선 */}
                          <div className="absolute top-0 left-0 right-0 border-t-2 border-dashed z-10" style={{ borderColor: COLORS.barRedLine }} />
                          {/* 노랑 막대 (준비자금 비율) */}
                          {item.ratio > 0 && !item.isNotJoined && (
                            <div
                              className="absolute bottom-0 left-0 right-0 rounded-sm"
                              style={{
                                height: `${filledHeight}px`,
                                backgroundColor: COLORS.barYellow,
                              }}
                            />
                          )}
                          {/* 미가입 / 없음 표시 */}
                          {item.isNotJoined && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[6px] text-gray-400 font-bold">없음</span>
                            </div>
                          )}
                        </div>
                        {/* 금액/비율 표시 */}
                        <p className="text-[6px] text-gray-300 mt-0.5 text-center leading-tight">
                          {item.isNotJoined ? '없음' : (item.need >= 10000 ? `${(item.need/10000).toFixed(0)}억` : `${item.need > 0 ? item.need : 0}`)}
                        </p>
                        {/* 담보명 */}
                        <p className="text-[7px] text-white font-medium text-center leading-tight">{item.label}</p>
                      </div>
                    );
                  })}
                </div>
                
                {/* 범례 */}
                <div className="flex justify-center gap-4 pb-1.5">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.barYellow }} />
                    <span className="text-[7px] text-gray-300">준비자금</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 border-t border-dashed" style={{ borderColor: COLORS.barRedLine }} />
                    <span className="text-[7px] text-gray-300">필요자금(기준)</span>
                  </div>
                </div>
              </div>

              {/* 다시 설계하기 버튼 */}
              <div className="flex justify-center mt-2">
                <button
                  onClick={handleRestart}
                  className="px-5 py-2 bg-white/95 hover:bg-white text-gray-700 text-sm font-bold rounded-lg border border-gray-300 shadow-md flex items-center gap-1.5"
                >
                  <span>🔄</span><span>다시 설계하기</span>
                </button>
              </div>
            </div>

            {/* 우측 화살표 */}
            <button onClick={handleSlideNext} className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow z-10 active:scale-95">
              <span className="text-gray-600 font-bold text-sm">›</span>
            </button>
          </div>

          {/* ======================================== */}
          {/* 슬라이드 2: 애니메이션 영상 */}
          {/* ======================================== */}
          <div className="min-w-full h-full relative flex items-center justify-center bg-gray-900">
            <button onClick={handleSlidePrev} className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow z-10 active:scale-95">
              <span className="text-gray-600 font-bold text-sm">‹</span>
            </button>
            <video
              src={ANIMATION_VIDEO_URL}
              controls
              playsInline
              className="w-full h-full object-contain"
              poster=""
            />
          </div>
        </div>

        {/* 슬라이드 인디케이터 */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${currentSlide === i ? 'bg-teal-400' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* ===== 저작권 정보 ===== */}
      <div className="bg-white px-4 py-3 text-center border-t">
        <p className="text-xs text-gray-500">© 2017 오원트금융연구소 All rights reserved.</p>
        <p className="text-[10px] text-gray-400 mt-1">특허 제10-2202486호 | 상표권 제41-0388261호</p>
        <div className="flex justify-center gap-6 mt-2">
          <button onClick={() => setShowReport(true)} className="text-xs text-purple-600 font-medium flex items-center gap-1">
            <span>▼</span><span>📊</span><span>재무설계리포트 보기</span>
          </button>
          <button onClick={() => setShowCertificate(true)} className="text-xs text-gray-500 font-medium flex items-center gap-1">
            <span>▼</span><span>📜</span><span>관련 자격증 보기</span>
          </button>
        </div>
      </div>

      {/* ===== 하단 입력바 ===== */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-t">
        <button className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center shadow text-lg font-bold text-white">+</button>
        <button className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center shadow">
          <span className="text-white text-sm">🎤</span>
        </button>
        <input
          type="text"
          placeholder="지출 전에 물어보세요..."
          className="flex-1 px-3 py-2 rounded-full border border-gray-300 text-sm"
          readOnly
        />
        <button className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center shadow">
          <span className="text-white font-bold">➤</span>
        </button>
      </div>

      {/* ===== 하단 네비게이션 ===== */}
      <nav className="bg-white border-t">
        <div className="flex justify-around py-2">
          {[
            { id: 'home', label: '홈', icon: '🏠' },
            { id: 'spend', label: 'AI지출', icon: '💬' },
            { id: 'house', label: '금융집짓기', icon: '🏗️', active: true },
            { id: 'more', label: '더보기', icon: '⋯' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate && onNavigate(item.id)}
              className="flex flex-col items-center gap-0.5"
            >
              <span className="text-lg">{item.icon}</span>
              <span className={`text-[10px] font-medium ${item.active ? 'text-teal-500' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* ===== 재무설계리포트 모달 ===== */}
      {showReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowReport(false)}>
          <div className="bg-white w-full max-w-md max-h-[85vh] rounded-t-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-bold">📊 종합재무설계 리포트</h2>
              <button onClick={() => setShowReport(false)} className="text-2xl text-gray-400">×</button>
            </div>
            <div className="p-4 space-y-4">
              {/* 기본 정보 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-bold text-gray-700 mb-2">👤 기본 정보</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>현재 나이: <strong>{currentAge}세</strong></div>
                  <div>은퇴 나이: <strong>{retirementAge}세</strong></div>
                  <div>기대수명: <strong>{lifeExpectancy}세</strong></div>
                </div>
              </div>

              {/* 은퇴설계 */}
              <div className="bg-blue-50 rounded-lg p-3">
                <h3 className="text-sm font-bold text-blue-700 mb-2">🏖️ 은퇴설계</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span>필요자금(월)</span><span className="font-bold">{retireNeeds > 0 ? `${retireNeeds}만원` : '-'}</span></div>
                  <div className="flex justify-between"><span>준비자금(월)</span><span className="font-bold">{retirePrep > 0 ? `${retirePrep}만원` : '-'}</span></div>
                  <div className="flex justify-between text-red-600"><span>부족자금(월)</span><span className="font-bold">{retireShortage > 0 ? `${retireShortage}만원` : '-'}</span></div>
                  <div className="flex justify-between"><span>순은퇴일시금</span><span className="font-bold">{retireLumpSum > 0 ? formatEok(retireLumpSum) : '-'}</span></div>
                  <div className="flex justify-between"><span>월저축연금액</span><span className="font-bold">{monthlySavingsForRetire > 0 ? `${monthlySavingsForRetire}만원` : '-'}</span></div>
                  <div className="flex justify-between text-blue-700"><span>은퇴준비율</span><span className="font-bold">{retireReadiness > 0 ? `${retireReadiness}%` : '-'}</span></div>
                </div>
              </div>

              {/* 부채설계 */}
              <div className="bg-yellow-50 rounded-lg p-3">
                <h3 className="text-sm font-bold text-yellow-700 mb-2">💳 부채설계</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span>총부채</span><span className="font-bold">{totalDebt > 0 ? formatManwon(totalDebt) : '-'}</span></div>
                  <div className="flex justify-between"><span>부채비율</span><span className="font-bold">{debtRatio > 0 ? `${debtRatio}%` : '-'}</span></div>
                </div>
              </div>

              {/* 저축설계 */}
              <div className="bg-amber-50 rounded-lg p-3">
                <h3 className="text-sm font-bold text-amber-700 mb-2">💰 저축설계</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span>목적</span><span className="font-bold">{savePurpose || '-'}</span></div>
                  <div className="flex justify-between"><span>기간</span><span className="font-bold">{savePeriod > 0 ? `${savePeriod}년` : '-'}</span></div>
                  <div className="flex justify-between"><span>목표금액</span><span className="font-bold">{saveAmount > 0 ? formatManwon(saveAmount) : '-'}</span></div>
                  <div className="flex justify-between"><span>월필요저축액</span><span className="font-bold">{saveMonthlySavings > 0 ? `${saveMonthlySavings}만원` : '-'}</span></div>
                </div>
              </div>

              {/* 투자설계 */}
              <div className="bg-green-50 rounded-lg p-3">
                <h3 className="text-sm font-bold text-green-700 mb-2">📈 투자설계</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span>부자지수</span><span className="font-bold">{wealthIndex > 0 ? `${wealthIndex}%` : '-'}</span></div>
                  <div className="flex justify-between"><span>순자산</span><span className="font-bold">{netAsset !== 0 ? formatManwon(netAsset) : '-'}</span></div>
                </div>
              </div>

              {/* 세금설계 */}
              <div className="bg-red-50 rounded-lg p-3">
                <h3 className="text-sm font-bold text-red-700 mb-2">💸 세금설계</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span>결정세액</span><span className="font-bold">{taxAmount > 0 ? formatManwon(taxAmount) : '-'}</span></div>
                  <div className="flex justify-between"><span>예상상속세</span><span className="font-bold">{inheritanceTax > 0 ? formatManwon(inheritanceTax) : '-'}</span></div>
                </div>
              </div>

              {/* 부동산설계 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-bold text-gray-700 mb-2">🏠 부동산설계</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span>거주용 부동산</span><span className="font-bold">{realEstateValue > 0 ? formatManwon(realEstateValue) : '-'}</span></div>
                </div>
              </div>

              {/* 보험설계 */}
              <div className="bg-purple-50 rounded-lg p-3">
                <h3 className="text-sm font-bold text-purple-700 mb-2">🛡️ 보장성 보험 (8대 보장)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="bg-purple-100">
                        <th className="px-1 py-1 text-left">구분</th>
                        {insuranceData.map((item, i) => (
                          <th key={i} className="px-1 py-1 text-center whitespace-nowrap">{item.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-1 py-0.5 font-medium">필요</td>
                        {insuranceData.map((item, i) => (
                          <td key={i} className="px-1 py-0.5 text-center">{item.need > 0 ? formatManwon(item.need) : '-'}</td>
                        ))}
                      </tr>
                      <tr className="bg-yellow-50">
                        <td className="px-1 py-0.5 font-medium">준비</td>
                        {insuranceData.map((item, i) => (
                          <td key={i} className="px-1 py-0.5 text-center">{item.prep > 0 ? formatManwon(item.prep) : (item.isSpecialRequired ? '특약필요' : '-')}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-1 py-0.5 font-medium text-red-600">부족</td>
                        {insuranceData.map((item, i) => (
                          <td key={i} className="px-1 py-0.5 text-center text-red-600">{item.shortage > 0 ? formatManwon(item.shortage) : (item.isNotJoined ? '미가입' : '-')}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 자격증 모달 ===== */}
      {showCertificate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowCertificate(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-[90%] max-h-[80vh] overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">📜 관련 자격증</h2>
              <button onClick={() => setShowCertificate(false)} className="text-2xl text-gray-400">×</button>
            </div>
            <img src={CERTIFICATE_IMAGE_URL} alt="자격증" className="w-full rounded-lg" />
          </div>
        </div>
      )}

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
