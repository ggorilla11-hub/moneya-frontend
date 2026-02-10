// src/pages/FinancialHouseResult.tsx
// Phase 9-13: 금융집짓기 3단계 - 재무설계도 결과 화면
// v2.0: 탭 클릭 시 해당 2단계로 이동 기능 추가
// v3.0: 종합재무설계 리포트 모달 추가 (고객 데이터 연동)
// v4.0: 슬라이드1을 SVG 기반 금융집 다이어그램으로 전면 교체 (시뮬레이터 스타일)
// v5.0~v5.5.2: localStorage 동적 데이터, 색상/레이아웃 개선, 데이터 매핑 수정
// ★★★ v5.6: 기존 인라인 리포트 모달 → FinancialReport v3.0 컴포넌트로 교체 ★★★
//       - import FinancialReport from '../components/FinancialReport'
//       - 기존 showReportModal 내부의 인라인 JSX 전체를 <FinancialReport /> 한 줄로 대체
//       - 기존 데이터 로직/슬라이드/탭/저작권 등은 모두 유지
// ★★★ v5.7: 은퇴 영역에 임대소득(rentalIncome), 금융소득(financialIncome) 반영 ★★★

import { useState, useRef, useEffect } from 'react';
import FinancialReport from '../components/FinancialReport';

// AI머니야 로고 URL (Firebase Storage)
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a";

// 오상열 대표 사진 URL (Firebase Storage)
const PROFILE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%98%A4%EC%83%81%EC%97%B4%20%EC%82%AC%EC%A7%84.png?alt=media&token=63eaf15e-9d0b-4d72-8fbb-ee03d6ecc8e5';

// 금융집 이미지 URL (Firebase Storage)
const EXTERIOR_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/financial-house-exterior.png.png?alt=media&token=e1651823-af8e-4ed3-9b3d-557a1bf0eb10';

// 저작권/상표권/특허권 자격증 이미지 URL (Firebase Storage)
const CERTIFICATE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%A0%80%EC%9E%91%EA%B6%8C%EC%83%81%ED%91%9C%EA%B6%8C%ED%8A%B9%ED%97%88%EA%B6%8C.png?alt=media&token=2ad30230-ccc5-481d-89d7-82c421ee3759';

// 금융집짓기 애니메이션 영상 URL (Firebase Storage)
const ANIMATION_VIDEO_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EA%B8%88%EC%9C%B5%EC%A7%91%EC%A7%93%EA%B8%B0%20%EC%97%90%EB%8B%88%EB%A9%94%EC%9D%B4%EC%85%98.mp4?alt=media&token=7b052cb9-4c71-407a-bddd-e8d60e96e95c';

// localStorage 키 상수
const BASIC_DRAFT_KEY = 'financialHouseBasicDraft';
const BASIC_FINAL_KEY = 'financialHouseData';
const DESIGN_KEY = 'financialHouseDesignData';

// 금액 포맷팅 유틸
const formatManwon = (val: number): string => {
  if (val >= 10000) {
    const eok = Math.floor(val / 10000);
    const remain = val % 10000;
    if (remain === 0) return `${eok}억`;
    return `${eok}억${remain.toLocaleString()}만`;
  }
  return `${val.toLocaleString()}만원`;
};

const formatEok = (val: number): string => {
  if (val >= 10000) {
    const eok = (val / 10000).toFixed(1);
    return `${eok}억원`;
  }
  return `${val.toLocaleString()}만원`;
};

// localStorage에서 동적 데이터 로드
const loadFinancialDataFromStorage = () => {
  try {
    let basic: any = null;
    const basicFinal = localStorage.getItem(BASIC_FINAL_KEY);
    const basicDraft = localStorage.getItem(BASIC_DRAFT_KEY);
    if (basicFinal) {
      basic = JSON.parse(basicFinal);
    } else if (basicDraft) {
      basic = JSON.parse(basicDraft);
    }

    let design: any = null;
    const designData = localStorage.getItem(DESIGN_KEY);
    if (designData) {
      design = JSON.parse(designData);
    }

    console.log('[FinancialHouseResult] 1단계 데이터:', basic);
    console.log('[FinancialHouseResult] 2단계 데이터:', design);

    return { basic, design };
  } catch (e) {
    console.error('[FinancialHouseResult] 데이터 로드 실패:', e);
    return { basic: null, design: null };
  }
};

interface FinancialHouseResultProps {
  userName?: string;
  onRestart?: () => void;
  onNavigate?: (path: string) => void;
  onBack?: () => void;
  onTabClick?: (tabId: string) => void;
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
  const [showCertificates, setShowCertificates] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // localStorage에서 동적 데이터 로드
  const [storageData, setStorageData] = useState<{ basic: any; design: any }>({ basic: null, design: null });
  
  useEffect(() => {
    const loaded = loadFinancialDataFromStorage();
    setStorageData(loaded);
  }, []);

  // 데이터 우선순위 로직 (props > 1단계 > 2단계 > 기본값)
  const b = storageData.basic;
  const d = storageData.design;

  // === 기본 개인정보 ===
  const currentAge = financialData.currentAge || b?.personalInfo?.age || d?.retire?.currentAge || 37;
  const retirementAge = financialData.retirementAge || b?.personalInfo?.retireAge || d?.retire?.retireAge || 65;
  const lifeExpectancy = financialData.lifeExpectancy || 90;

  // === 은퇴 영역 ===
  const retireDesign = d?.retire;
  const retireMonthlyExpense = retireDesign?.monthlyLivingExpense || retireDesign?.monthlyExpense || 300;
  const retireNationalPension = retireDesign?.expectedNationalPension || retireDesign?.nationalPension || 80;
  const retirePersonalPension = retireDesign?.currentPersonalPension || retireDesign?.personalPension || 50;
  // ★★★ v5.7 추가: 임대소득, 금융소득 읽기 ★★★
  const retireRentalIncome = retireDesign?.rentalIncome ?? 0;
  const retireFinancialIncome = retireDesign?.financialIncome ?? 0;
  const retireExpectedLumpSum = retireDesign?.expectedRetirementLumpSum || 10000;
  const requiredMonthly = financialData.requiredMonthly || retireMonthlyExpense;
  // ★★★ v5.7 수정: 준비자금에 임대소득 + 금융소득 포함 ★★★
  const preparedMonthly = financialData.preparedMonthly || (retireNationalPension + retirePersonalPension + retireRentalIncome + retireFinancialIncome);
  const shortfallMonthly = financialData.shortfallMonthly
    || (requiredMonthly - preparedMonthly > 0 ? requiredMonthly - preparedMonthly : 0);
  const retirePeriod = lifeExpectancy - retirementAge;
  const totalRetirementNeeded = shortfallMonthly * 12 * retirePeriod;
  const netRetirementNeeded = Math.max(0, totalRetirementNeeded - retireExpectedLumpSum);
  const retireLumpSum = netRetirementNeeded;
  const economicPeriod = retirementAge - currentAge;
  const monthlySavingForRetire = economicPeriod > 0 ? Math.round(netRetirementNeeded / (economicPeriod * 12)) : 0;
  const retirementReadyRate = financialData.retirementReadyRate
    || (requiredMonthly > 0 ? Math.round((preparedMonthly / requiredMonthly) * 100) : 0);

  // === 부채 영역 ===
  const totalDebt = b?.debts?.totalDebt
    || (financialData.debtAmount ? financialData.debtAmount * 10000 : 0);
  const totalAsset = b?.totalAsset || d?.invest?.totalAssets || 0;
  const debtRatio = financialData.debtRatio
    || (totalAsset > 0 ? Math.round((totalDebt / totalAsset) * 100) : 0);

  // === 저축 영역 ===
  const saveDesign = d?.save;
  const savingPurpose = saveDesign?.purpose || 'house';
  const savingTargetAmount = saveDesign?.targetAmount || 0;
  const savingTargetYears = saveDesign?.targetYears || 5;
  const savingPeriod = `${savingTargetYears}년`;
  const savingTargetMonths = savingTargetYears * 12;
  const monthlySavingRequired = savingTargetMonths > 0 ? Math.round(savingTargetAmount / savingTargetMonths) : 0;

  // === 투자 영역 ===
  const investDesign = d?.invest;
  const monthlyIncomeFromBasic = b?.income
    ? ((b.income.myIncome || 0) + (b.income.spouseIncome || 0) + (b.income.otherIncome || 0))
    : 0;
  const investTotalAssets = investDesign?.totalAssets || b?.totalAsset || 0;
  const investTotalDebt = investDesign?.totalDebt || totalDebt || 0;
  const investMonthlyIncome = investDesign?.monthlyIncome || monthlyIncomeFromBasic || 500;
  const investAge = investDesign?.currentAge || currentAge;
  const netAsset = investTotalAssets - investTotalDebt;
  const annualIncome = investMonthlyIncome * 12;
  const wealthIndex = financialData.wealthIndex
    || (investAge > 0 && annualIncome > 0
      ? Math.round(((netAsset * 10) / (investAge * annualIncome)) * 100)
      : 0);

  // === 세금 영역 ===
  const taxDesign = d?.tax;
  const taxIncomeData = taxDesign?.incomeData;
  const taxInheritData = taxDesign?.inheritData;
  const taxAmount = financialData.taxAmount
    || taxIncomeData?.determinedTax
    || 0;
  const calcInheritanceTaxForResult = (base: number): number => {
    if (base <= 0) return 0;
    if (base <= 10000) return Math.round(base * 0.1);
    if (base <= 50000) return Math.round(1000 + (base - 10000) * 0.2);
    if (base <= 100000) return Math.round(9000 + (base - 50000) * 0.3);
    if (base <= 300000) return Math.round(24000 + (base - 100000) * 0.4);
    return Math.round(104000 + (base - 300000) * 0.5);
  };
  const inheritNetAssets = (taxInheritData?.totalAssets || 0) - (taxInheritData?.totalDebts || 0);
  const inheritSpouseDeduction = taxInheritData?.hasSpouse ? 50000 : 0;
  const inheritChildDeduction = (taxInheritData?.childrenCount || 0) * 5000;
  const inheritBasicDeduction = 20000;
  const inheritLumpSumDeduction = Math.max(50000, inheritBasicDeduction + inheritChildDeduction);
  const inheritTaxBase = Math.max(0, inheritNetAssets - inheritSpouseDeduction - inheritLumpSumDeduction);
  const estimatedInheritanceTax = calcInheritanceTaxForResult(inheritTaxBase);

  // === 부동산 영역 ===
  const estateDesign = d?.estate;
  const residentialRealEstate = estateDesign?.residentialProperty
    || b?.realEstateAssets?.residentialRealEstate
    || (financialData.realEstateValue ? financialData.realEstateValue * 10000 : 0);

  // === 보험 영역 ===
  const insuranceDesign = d?.insurance;
  const insAnnualIncome = insuranceDesign?.annualIncome || 6000;
  const insTotalDebt = insuranceDesign?.totalDebt || totalDebt || 40000;
  const insuranceRequired: Record<string, number> = {
    death: insAnnualIncome * 3 + insTotalDebt,
    disability: insAnnualIncome * 3 + insTotalDebt,
    cancer: insAnnualIncome * 2,
    brain: insAnnualIncome,
    heart: insAnnualIncome,
    medical: 5000,
  };
  const insurancePrepared = insuranceDesign?.prepared || {};
  const insuranceItems = [
    { label: '사망', key: 'death' },
    { label: '장해', key: 'disability' },
    { label: '암진단', key: 'cancer' },
    { label: '뇌질환', key: 'brain' },
    { label: '심질환', key: 'heart' },
    { label: '실비', key: 'medical' },
    { label: '입원\n수술', key: 'hospital' },
    { label: '치매\n간병', key: 'dementia' },
  ];
  
  const getInsuranceData = (key: string) => {
    if (key === 'hospital' || key === 'dementia') {
      const val = insurancePrepared?.[key] || 'X';
      const isInsured = ['O', 'o', '유', 'Y', 'y'].includes(String(val));
      return {
        needed: 1,
        prepared: isInsured ? 1 : 0,
        isSpecial: true,
        specialValue: String(val),
      };
    }
    const needed = insuranceRequired[key] || 0;
    const prepared = insurancePrepared?.[key] || 0;
    return { needed, prepared, isSpecial: false };
  };

  // 탭 정의
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

  const handleSlideNext = () => {
    if (currentSlide < 2) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      if (nextSlide === 2 && videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    }
  };

  const handleSlidePrev = () => {
    if (currentSlide > 0) {
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

      {/* 탭 네비게이션 - 클릭 시 2단계로 이동 */}
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
        {/* 이미지 스와이프 영역 - 3개 슬라이드 */}
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
              <button
                onClick={handleSlideNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <span className="text-gray-600 font-bold">›</span>
              </button>
              <button
                onClick={handleRestart}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-white/95 hover:bg-white text-gray-700 text-sm font-bold rounded-lg border border-gray-300 shadow-md transition-colors flex items-center gap-1.5"
              >
                <span>🔄</span>
                <span>다시 설계하기</span>
              </button>
            </div>

            {/* 슬라이드 1: 내부 SVG 금융집 다이어그램 */}
            <div className="min-w-full h-full relative flex items-center justify-center bg-gradient-to-b from-teal-400 to-teal-500 p-3 overflow-hidden">
              
              <div className="w-full max-w-[340px] mx-auto">
                
                {/* ===== 지붕 섹션 ===== */}
                <div className="relative">
                  <svg viewBox="0 0 340 90" className="w-full" preserveAspectRatio="xMidYMid meet">
                    <polygon points="255,10 295,10 295,66 255,45" fill="#E8E8E8" stroke="#333" strokeWidth="1.5"/>
                    <polygon points="170,0 0,90 170,90" fill="#C0392B" stroke="#333" strokeWidth="1.5"/>
                    <polygon points="170,0 340,90 170,90" fill="#27AE60" stroke="#333" strokeWidth="1.5"/>
                    <line x1="170" y1="0" x2="170" y2="90" stroke="#333" strokeWidth="1"/>
                  </svg>
                  
                  <div className="absolute inset-0 flex">
                    <div className="flex-1 flex flex-col items-end justify-center pt-6 pr-3">
                      <p className="text-[11px] font-extrabold text-white">📈 투자</p>
                      <p className="text-[9px] text-white/90 mt-0.5">부자지수 <span className="font-bold">{wealthIndex > 0 ? `${wealthIndex}%` : '-'}</span></p>
                      <p className="text-[8px] text-white/80">순자산 <span className="font-bold">{netAsset > 0 ? formatEok(netAsset) : '-'}</span></p>
                    </div>
                    <div className="flex-1 flex flex-col items-start justify-center pt-6 pl-3">
                      <p className="text-[11px] font-extrabold text-white">💸 세금</p>
                      <p className="text-[9px] text-white/90 mt-0.5">결정세액 <span className="font-bold">{taxAmount > 0 ? formatManwon(taxAmount) : '-'}</span></p>
                      <p className="text-[8px] text-white/80">예상상속세 <span className="font-bold">{estimatedInheritanceTax > 0 ? formatManwon(estimatedInheritanceTax) : '-'}</span></p>
                    </div>
                  </div>
                  
                  <div className="absolute right-[38px] top-[20px] text-center">
                    <p className="text-[9px] font-bold text-gray-700">🏠 부동산</p>
                    <p className="text-[7px] text-gray-600">{residentialRealEstate > 0 ? formatEok(residentialRealEstate) : '-'}</p>
                  </div>
                </div>
                
                {/* ===== 처마보 ===== */}
                <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-x-2 border-gray-800 px-2 py-1.5 flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-[13px] font-extrabold text-gray-800">{currentAge}</p>
                    <p className="text-[7px] text-gray-500">현재</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center mx-1">
                    <div className="flex items-center gap-0.5">
                      <span className="text-red-500 text-[8px]">◀</span>
                      <div className="flex-1 h-[1px] bg-red-400 min-w-[20px]"></div>
                      <span className="text-[9px] font-bold text-red-500 px-1">{economicPeriod}년</span>
                      <div className="flex-1 h-[1px] bg-red-400 min-w-[20px]"></div>
                      <span className="text-red-500 text-[8px]">▶</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-extrabold text-gray-800">{retirementAge}</p>
                    <p className="text-[7px] text-gray-500">은퇴</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center mx-1">
                    <div className="flex items-center gap-0.5">
                      <span className="text-red-500 text-[8px]">◀</span>
                      <div className="flex-1 h-[1px] bg-red-400 min-w-[15px]"></div>
                      <span className="text-[9px] font-bold text-red-500 px-1">{retirePeriod}년</span>
                      <div className="flex-1 h-[1px] bg-red-400 min-w-[15px]"></div>
                      <span className="text-red-500 text-[8px]">▶</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-extrabold text-gray-800">{lifeExpectancy}</p>
                    <p className="text-[7px] text-gray-500">기대수명</p>
                  </div>
                </div>
                
                {/* ===== 기둥 섹션 ===== */}
                <div className="flex border-x-2 border-gray-800" style={{ height: '110px' }}>
                  <div className="relative border-r-2 border-gray-800" style={{ flex: '50' }}>
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                      <polygon points="0,0 100,0 0,100" fill="#F1C40F"/>
                      <polygon points="100,0 100,100 0,100" fill="#8B4513"/>
                      <line x1="0" y1="100" x2="100" y2="0" stroke="#333" strokeWidth="0.5"/>
                    </svg>
                    <div className="absolute top-2 left-2 text-left">
                      <p className="text-[10px] font-extrabold text-gray-800">💳 부채 <span className="text-red-500">↓</span></p>
                      <p className="text-[8px] text-gray-700">총부채 <span className="font-bold">{totalDebt > 0 ? formatEok(totalDebt) : '-'}</span></p>
                      <p className="text-[8px] text-gray-700">부채비율 <span className="font-bold text-red-600">{debtRatio > 0 ? `${debtRatio}%` : '-'}</span></p>
                    </div>
                    <div className="absolute bottom-2 right-2 text-right">
                      <p className="text-[10px] font-extrabold text-white"><span className="text-green-300">↑</span> 💰 저축</p>
                      <p className="text-[8px] text-white/90">목적: {savingPurpose}</p>
                      <p className="text-[8px] text-white/90">기간: {savingPeriod}</p>
                      <p className="text-[8px] text-white/90">목표금액: <span className="font-bold">{savingTargetAmount > 0 ? formatManwon(savingTargetAmount) : '-'}</span></p>
                      <p className="text-[8px] text-white/90">월저축 <span className="font-bold">{monthlySavingRequired > 0 ? formatManwon(monthlySavingRequired) : '-'}</span></p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col bg-gradient-to-b from-blue-100 to-blue-200" style={{ flex: '50' }}>
                    <div className="flex-1 px-2 py-1.5 flex flex-col justify-center gap-0.5">
                      <p className="text-[10px] font-extrabold text-blue-700 mb-0.5">🏖️ 은퇴</p>
                      <div className="flex justify-between">
                        <span className="text-[8px] text-gray-600">필요자금(월)</span>
                        <span className="text-[9px] font-semibold text-gray-800">{formatManwon(requiredMonthly)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[8px] text-gray-600">준비자금(월)</span>
                        <span className="text-[9px] font-semibold text-gray-800">{formatManwon(preparedMonthly)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[8px] text-gray-600">부족자금(월)</span>
                        <span className="text-[9px] font-bold text-red-500">{formatManwon(shortfallMonthly)}</span>
                      </div>
                      <div className="border-t border-gray-300 mt-0.5 pt-0.5">
                        <div className="flex justify-between">
                          <span className="text-[7px] text-gray-500">순은퇴일시금</span>
                          <span className="text-[8px] font-bold text-red-500">{formatEok(retireLumpSum)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[7px] text-gray-500">월저축연금액</span>
                          <span className="text-[8px] font-semibold text-gray-800">{formatManwon(monthlySavingForRetire)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[7px] text-gray-500">은퇴준비율</span>
                          <span className="text-[8px] font-bold text-blue-600">{retirementReadyRate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 보험 섹션 */}
                <div className="border-2 border-t-0 border-gray-800 px-2 py-2" style={{ backgroundColor: '#3E2723' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-extrabold text-amber-300">🛡️ 보장성 보험 (8대 보장)</p>
                  </div>
                  
                  <div className="flex gap-1">
                    {insuranceItems.map((item, idx) => {
                      const ins = getInsuranceData(item.key);
                      const ratio = ins.needed > 0 ? (ins.prepared / ins.needed) * 100 : 0;
                      const hasData = ins.needed > 0 || ins.prepared > 0;
                      const barPercent = Math.min((ratio / 200) * 100, 100);
                      const isOver = ratio > 100;
                      
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                          <div className="w-full h-12 rounded-sm overflow-hidden flex flex-col justify-end relative" style={{ backgroundColor: '#5D4037' }}>
                            <div className="absolute left-0 right-0 h-[2px] bg-red-500 z-10" style={{ bottom: '50%' }}></div>
                            {hasData && (
                              <div 
                                className="w-full rounded-t-sm" 
                                style={{ 
                                  height: `${barPercent}%`, 
                                  backgroundColor: isOver ? '#F39C12' : '#F1C40F',
                                  minHeight: barPercent > 0 ? '2px' : '0'
                                }}
                              ></div>
                            )}
                            {!hasData && (
                              <div className="flex items-center justify-center h-full">
                                <p className="text-[5px] text-gray-400">미입력</p>
                              </div>
                            )}
                          </div>
                          <p className={`text-[7px] font-semibold mt-0.5 ${ratio >= 100 ? 'text-green-400' : ratio > 0 ? 'text-amber-300' : 'text-gray-500'}`}>
                            {hasData ? `${Math.round(ratio)}%` : '-'}
                          </p>
                          <p className="text-[6px] text-amber-200/80 leading-tight text-center whitespace-pre-line">{item.label}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 justify-center">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#F1C40F' }}></div>
                      <span className="text-[6px] text-amber-200/70">준비자금</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-[2px] bg-red-500"></div>
                      <span className="text-[6px] text-amber-200/70">필요자금(기준)</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-[8px] text-white/80 text-center mt-2">출처: 한국FPSB, 오원트금융연구소</p>
              </div>
              
              <button
                onClick={handleSlidePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <span className="text-gray-600 font-bold">‹</span>
              </button>
              <button
                onClick={handleSlideNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <span className="text-gray-600 font-bold">›</span>
              </button>
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
              <button
                onClick={handleSlidePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform z-10"
              >
                <span className="text-gray-600 font-bold">‹</span>
              </button>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 rounded-full z-10">
                <p className="text-white text-xs font-semibold">🎬 금융집짓기® 애니메이션</p>
              </div>
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
          
          {/* 두 버튼 나란히 배치 */}
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

      {/* ★★★ v5.6 변경: 종합재무설계 리포트 → FinancialReport v3.0 컴포넌트 사용 ★★★ */}
      {showReportModal && (
        <FinancialReport
          userName={userName || '고객'}
          onClose={() => setShowReportModal(false)}
        />
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
