// src/pages/MyPage.tsx
// v2.6.1: 온라인강좌 107강 모달 UI 복원 (v2.2 스타일)
// - v2.2: 온라인강좌 페이지 연결
// - v2.3: 공유 URL, DESIRE 로드맵 (실제 financialHouseData 연동)
// - v2.4: 멤버십 플랜 (일반인/FP 탭, 월간/연간 선택, 카드결제 UI)
// - v2.5: mailto encodeURIComponent 수정, 전체 통합
// - v2.6: DESIRE 로드맵 → 원본 기획대로 재구현
// - v2.6.1: 온라인강좌 107강 모달 → v2.2 스타일 복원
//         (cyan/teal 그라데이션 소개 카드 + 가격 버튼 3개)

import { useState, useEffect, useRef } from 'react';

// ─── 이미지 URL 상수 ───
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a";
const PROFILE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%98%A4%EC%83%81%EC%97%B4%20%EC%82%AC%EC%A7%84.png?alt=media&token=63eaf15e-9d0b-4d72-8fbb-ee03d6ecc8e5';
const EBOOK_COVER_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/financial-house-exterior.png.png?alt=media&token=e1651823-af8e-4ed3-9b3d-557a1bf0eb10';
const SHARE_URL = 'https://moneya-frontend.vercel.app';

// ─── 타입 정의 ───
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

interface MembershipPlanItem {
  tier: string;
  price: number;
  priceDisplay: string;
  annual: number;
  annualDisplay: string;
  annualMonthly: string;
  badge: string;
  gradient: string;
  benefits: string[];
  highlight: boolean;
  current: boolean;
}

// ─── DESIRE 6단계 정의 ───
const DESIRE_STAGES = [
  { stage: 1, letter: 'D', name: 'Debt Free', title: '신용대출 상환', house: '🏚️', houseName: '초가집', color: '#dc2626', bgFrom: '#fee2e2', bgTo: '#fecaca', certGuide: '신용대출 상환 완료 인증샷을 첨부하세요', dataSource: '금융집짓기 > 부채설계 > 신용대출' },
  { stage: 2, letter: 'E', name: 'Emergency Fund', title: '비상예비자금 확보', house: '🏡', houseName: '나무집', color: '#ea580c', bgFrom: '#ffedd5', bgTo: '#fed7aa', certGuide: '비상예비자금 마련 금액을 인증하세요', dataSource: '금융집짓기 > 투자설계 > 비상예비자금' },
  { stage: 3, letter: 'S', name: 'Savings', title: '저축·연금 자동화', house: '🏠', houseName: '벽돌집', color: '#ca8a04', bgFrom: '#fef9c3', bgTo: '#fef08a', certGuide: '저축/투자 현황 인증샷을 첨부하세요', dataSource: '금융집짓기 > 예산설계 > 저축/연금' },
  { stage: 4, letter: 'I', name: 'Investment', title: '금융자산 10억', house: '🏢', houseName: '콘크리트', color: '#2563eb', bgFrom: '#dbeafe', bgTo: '#bfdbfe', certGuide: '금융자산 10억원 달성 인증샷을 첨부하세요', dataSource: '금융집짓기 > 투자설계 > 금융자산' },
  { stage: 5, letter: 'R', name: 'Retirement', title: '담보대출 상환', house: '🏛️', houseName: '대리석', color: '#7c3aed', bgFrom: '#ede9fe', bgTo: '#ddd6fe', certGuide: '담보대출 상환 완료 인증샷을 첨부하세요', dataSource: '금융집짓기 > 부채설계 > 담보대출' },
  { stage: 6, letter: 'E', name: 'Enjoy & Estate', title: '🎁 선물함', house: '🏰', houseName: '고급주택', color: '#059669', bgFrom: '#d1fae5', bgTo: '#a7f3d0', certGuide: '', dataSource: '' },
];

// ─── DESIRE 단계별 실데이터 타입 ───
interface LoanItem { id: number; name: string; amount: number; rate: number; }
interface DesireStageDetail {
  summary: string;
  creditLoans?: LoanItem[];
  mortgageLoans?: LoanItem[];
  emergencyFund?: { current: number; target: number; secured: boolean };
  savings?: { monthlySaving: number; monthlyPension: number; irregularIncome: number; budgetTotal: number };
  investment?: { financialAssets: number; target: number };
}

// ─── FAQ 데이터 ───
const FAQ_DATA = [
  { q: '금융집짓기®란 무엇인가요?', a: '오원트금융연구소에서 개발한 재무설계 방법론으로, 집을 짓듯이 체계적으로 금융 계획을 세우는 프로그램입니다.' },
  { q: '유료 구독 요금은 얼마인가요?', a: '일반인용: 베이직 12,900원, 스탠다드 29,000원, 프리미엄 59,000원 / FP용: 베이직 33,000원, 스탠다드 59,000원, 프리미엄 99,000원입니다.' },
  { q: 'AI 지출 상담은 어떻게 이용하나요?', a: 'AI지출 탭에서 음성 또는 텍스트로 지출에 대해 상담받으실 수 있습니다.' },
  { q: '재무설계 리포트는 어디서 볼 수 있나요?', a: '더보기 > 월간 리포트에서 확인하실 수 있습니다.' },
  { q: '전문가 상담은 어떻게 신청하나요?', a: '더보기 > 오상열 대표 강의·상담 신청에서 원하시는 상담 유형을 선택하여 신청하실 수 있습니다.' },
  { q: '개인정보는 안전하게 보호되나요?', a: '네, 모든 개인정보는 암호화되어 안전하게 보관됩니다.' },
  { q: '회원 탈퇴는 어떻게 하나요?', a: '더보기 > 회원탈퇴에서 탈퇴 신청하실 수 있습니다. 탈퇴 시 모든 데이터가 삭제됩니다.' },
];

// ─── 멤버십 플랜 데이터 ───
const MEMBERSHIP_PLANS: Record<string, MembershipPlanItem[]> = {
  general: [
    { tier: 'FREE', price: 0, priceDisplay: '무료', annual: 0, annualDisplay: '0', annualMonthly: '0', badge: '🆓', gradient: 'from-gray-400 to-gray-500', benefits: ['AI머니야 전체 기능 체험', '7일간 프리미엄급 이용'], highlight: false, current: true },
    { tier: 'BASIC', price: 12900, priceDisplay: '12,900', annual: 129000, annualDisplay: '129,000', annualMonthly: '10,750', badge: '🥉', gradient: 'from-blue-500 to-blue-600', benefits: ['AI머니야 전체 기능', '금융집짓기® 전자책 제공', '(12,900원 상당)'], highlight: false, current: false },
    { tier: 'STANDARD', price: 29000, priceDisplay: '29,000', annual: 290000, annualDisplay: '290,000', annualMonthly: '24,167', badge: '🥈', gradient: 'from-purple-500 to-indigo-600', benefits: ['BASIC 전체 포함', '온라인강좌 107강 무제한', '전자책 + 강좌 올인원'], highlight: true, current: false },
    { tier: 'PREMIUM', price: 59000, priceDisplay: '59,000', annual: 590000, annualDisplay: '590,000', annualMonthly: '49,167', badge: '🥇', gradient: 'from-amber-500 to-amber-600', benefits: ['STANDARD 전체 포함', '월례 ZOOM 세미나 참석', '오상열 CFP 직접 강의'], highlight: false, current: false },
  ],
  fp: [
    { tier: 'FREE', price: 0, priceDisplay: '무료', annual: 0, annualDisplay: '0', annualMonthly: '0', badge: '🆓', gradient: 'from-gray-400 to-gray-500', benefits: ['AI머니야 전체 기능 체험', '7일간 프리미엄급 이용'], highlight: false, current: true },
    { tier: 'BASIC', price: 33000, priceDisplay: '33,000', annual: 330000, annualDisplay: '330,000', annualMonthly: '27,500', badge: '🥉', gradient: 'from-blue-500 to-blue-600', benefits: ['일반인 STANDARD 전체 포함', '고객 100명 등록 관리', '전자책 + 온라인강좌 107강'], highlight: false, current: false },
    { tier: 'STANDARD', price: 59000, priceDisplay: '59,000', annual: 590000, annualDisplay: '590,000', annualMonthly: '49,167', badge: '🥈', gradient: 'from-purple-500 to-indigo-600', benefits: ['일반인 PREMIUM 전체 포함', '고객 500명 등록 관리', '월례 ZOOM 세미나 포함'], highlight: true, current: false },
    { tier: 'PREMIUM', price: 99000, priceDisplay: '99,000', annual: 990000, annualDisplay: '990,000', annualMonthly: '82,500', badge: '🥇', gradient: 'from-amber-500 to-amber-600', benefits: ['일반인 PREMIUM 전체 포함', '고객 무제한 등록 관리', '월례 ZOOM 세미나 포함'], highlight: false, current: false },
  ],
};

// ─── 카드번호 포맷 헬퍼 ───
const formatCardNumber = (v: string): string => {
  const nums = v.replace(/\D/g, '').slice(0, 16);
  return nums.replace(/(\d{4})(?=\d)/g, '$1-');
};
const formatExpiry = (v: string): string => {
  const nums = v.replace(/\D/g, '').slice(0, 4);
  if (nums.length > 2) return nums.slice(0, 2) + '/' + nums.slice(2);
  return nums;
};

// ─── Props 인터페이스 ───
interface MyPageProps {
  userName: string;
  userEmail: string;
  userPhoto: string | null;
  financialResult: FinancialResult | null;
  onNavigate: (page: 'subscription' | 'consulting' | 'monthly-report' | 'online-course') => void;
  onLogout: () => void;
  onReset: () => void;
}

// ═══════════════════════════════════════
// ▶ 메인 컴포넌트
// ═══════════════════════════════════════
export default function MyPage({
  userName,
  userEmail,
  userPhoto: _userPhoto,
  financialResult: _financialResult,
  onNavigate,
  onLogout,
  onReset
}: MyPageProps) {

  // ─── 모달 상태 ───
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDesireRoadmap, setShowDesireRoadmap] = useState(false);
  const [showOnlineCourse, setShowOnlineCourse] = useState(false);
  const [showEbook, setShowEbook] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // ─── 멤버십 플랜 상태 ───
  const [showMembership, setShowMembership] = useState(false);
  const [membershipTab, setMembershipTab] = useState<'general' | 'fp'>('general');
  const [membershipStep, setMembershipStep] = useState<'list' | 'cycle' | 'payment' | 'done'>('list');
  const [selectedMembershipPlan, setSelectedMembershipPlan] = useState<MembershipPlanItem | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual' | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isPayProcessing, setIsPayProcessing] = useState(false);

  // ─── 프로필 편집 상태 ───
  const [editName, setEditName] = useState(userName);

  // ─── FAQ 토글 ───
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // ─── DESIRE 로드맵 상태 ───
  const [desireExpandedStage, setDesireExpandedStage] = useState<number | null>(null);
  const [desireStageDetails, setDesireStageDetails] = useState<Record<number, DesireStageDetail>>({});
  const [desireCompleted, setDesireCompleted] = useState<Record<number, boolean>>({});
  const [desireLoanChecks, setDesireLoanChecks] = useState<Record<string, boolean>>({});
  const [desirePhotos, setDesirePhotos] = useState<Record<number, string>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [giftOpened, setGiftOpened] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoStage, setActivePhotoStage] = useState<number | null>(null);

  // ─── 실제 financialHouseData에서 DESIRE 상세 데이터 로드 ───
  useEffect(() => {
    const details: Record<number, DesireStageDetail> = {};

    try {
      const raw = localStorage.getItem('financialHouseData');
      if (!raw) {
        for (let i = 1; i <= 6; i++) details[i] = { summary: '금융집짓기에서 데이터를 먼저 입력해주세요' };
        setDesireStageDetails(details);
        return;
      }
      const data = JSON.parse(raw);

      // 1단계: 신용대출
      const creditLoans: LoanItem[] = (data?.debtDesign?.creditLoans || []).map((l: any, idx: number) => ({
        id: idx + 1, name: l.name || l.loanName || `신용대출 ${idx + 1}`,
        amount: Number(l.amount || l.loanAmount || 0), rate: Number(l.rate || l.interestRate || 0),
      })).sort((a: LoanItem, b: LoanItem) => b.rate - a.rate);
      const creditTotal = creditLoans.reduce((s, l) => s + l.amount, 0);
      details[1] = { summary: creditTotal > 0 ? `신용대출 ${creditLoans.length}건 · ${(creditTotal / 10000).toLocaleString()}만원` : '신용대출 없음 ✅', creditLoans };

      // 2단계: 비상예비자금
      const ef = data?.investDesign?.emergencyFund || 0;
      const efTarget = data?.investDesign?.emergencyFundTarget || (data?.budgetDesign?.monthlyExpense || 0) * 6;
      const efSecured = ef >= efTarget && efTarget > 0;
      details[2] = { summary: ef > 0 ? `비상예비자금 ${(ef / 10000).toLocaleString()}만원 확보` : '비상예비자금 미설정', emergencyFund: { current: ef, target: efTarget, secured: efSecured } };

      // 3단계: 저축/연금
      const monthlySaving = data?.budgetDesign?.monthlySavings || data?.budgetDesign?.monthlySaving || 0;
      const monthlyPension = data?.budgetDesign?.monthlyPension || 0;
      const irregularIncome = data?.budgetDesign?.irregularIncome || 0;
      const budgetTotal = data?.budgetDesign?.totalBudget || data?.budgetDesign?.monthlyIncome || 0;
      details[3] = { summary: (monthlySaving + monthlyPension) > 0 ? `월 저축+연금 ${((monthlySaving + monthlyPension) / 10000).toLocaleString()}만원` : '저축/연금 미설정', savings: { monthlySaving, monthlyPension, irregularIncome, budgetTotal } };

      // 4단계: 금융자산
      const fa = data?.investDesign?.financialAssets || 0;
      const target10 = 1000000000;
      details[4] = { summary: fa > 0 ? `금융자산 ${(fa / 100000000).toFixed(1)}억원` : '금융자산 미입력', investment: { financialAssets: fa, target: target10 } };

      // 5단계: 담보대출
      const mortgageLoans: LoanItem[] = (data?.debtDesign?.mortgageLoans || []).map((l: any, idx: number) => ({
        id: idx + 1, name: l.name || l.loanName || `담보대출 ${idx + 1}`,
        amount: Number(l.amount || l.loanAmount || 0), rate: Number(l.rate || l.interestRate || 0),
      })).sort((a: LoanItem, b: LoanItem) => b.rate - a.rate);
      const mortgageTotal = mortgageLoans.reduce((s, l) => s + l.amount, 0);
      details[5] = { summary: mortgageTotal > 0 ? `담보대출 ${mortgageLoans.length}건 · ${(mortgageTotal / 10000).toLocaleString()}만원` : '담보대출 없음 ✅', mortgageLoans };

      // 6단계: 선물함
      details[6] = { summary: '1~5단계를 모두 완료하면 열립니다' };

      setDesireStageDetails(details);
    } catch (e) { console.error('DESIRE 데이터 로드 실패:', e); }

    // 저장된 완료/체크/사진 상태 로드
    try {
      const sc = localStorage.getItem('desireCompleted'); if (sc) setDesireCompleted(JSON.parse(sc));
      const lc = localStorage.getItem('desireLoanChecks'); if (lc) setDesireLoanChecks(JSON.parse(lc));
      const ph = localStorage.getItem('desirePhotos'); if (ph) setDesirePhotos(JSON.parse(ph));
      const go = localStorage.getItem('desireGiftOpened'); if (go) setGiftOpened(true);
    } catch { /* ignore */ }
  }, [showDesireRoadmap]);

  // ─── DESIRE 핸들러들 ───
  const handleDesireComplete = (stage: number) => {
    const next = { ...desireCompleted, [stage]: !desireCompleted[stage] };
    setDesireCompleted(next); localStorage.setItem('desireCompleted', JSON.stringify(next));
  };
  const handleLoanCheck = (key: string) => {
    const next = { ...desireLoanChecks, [key]: !desireLoanChecks[key] };
    setDesireLoanChecks(next); localStorage.setItem('desireLoanChecks', JSON.stringify(next));
  };
  const handlePhotoAttach = (stage: number) => { setActivePhotoStage(stage); photoInputRef.current?.click(); };
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || activePhotoStage === null) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const url = ev.target?.result as string; const next = { ...desirePhotos, [activePhotoStage]: url }; setDesirePhotos(next); localStorage.setItem('desirePhotos', JSON.stringify(next)); };
    reader.readAsDataURL(file); e.target.value = '';
  };
  const handleOpenGift = () => { setGiftOpened(true); setShowCelebration(true); localStorage.setItem('desireGiftOpened', 'true'); };
  const isStageComplete = (stage: number): boolean => { if (stage === 6) return [1, 2, 3, 4, 5].every(s => isStageComplete(s)); return !!desireCompleted[stage]; };

  // ─── mailto 수정 (v2.5) ───
  const handleInquiry = () => {
    const to = 'ggorilla11@gmail.com';
    const subject = encodeURIComponent('[AI머니야] 1:1 문의');
    const body = encodeURIComponent('문의 내용을 작성해주세요.');
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  // ─── 멤버십 플랜 핸들러 ───
  const handleSelectPlan = (plan: MembershipPlanItem) => { if (plan.current) return; setSelectedMembershipPlan(plan); setBillingCycle(null); setMembershipStep('cycle'); };
  const handleSelectCycle = (cycle: 'monthly' | 'annual') => { setBillingCycle(cycle); setMembershipStep('payment'); setCardNumber(''); setCardExpiry(''); setCardCvc(''); setCardHolder(''); };
  const handlePay = () => { if (!cardNumber || !cardExpiry || !cardCvc || !cardHolder) { alert('모든 항목을 입력해주세요.'); return; } setIsPayProcessing(true); setTimeout(() => { setIsPayProcessing(false); setMembershipStep('done'); }, 2000); };
  const closeMembership = () => { setShowMembership(false); setMembershipStep('list'); setSelectedMembershipPlan(null); setBillingCycle(null); };

  // ─── 공유하기 ───
  const handleShare = async (method: string) => {
    const text = `AI머니야 - 나만의 AI 금융집사 🏠\n금융집짓기®로 체계적인 재무설계를 시작하세요!\n${SHARE_URL}`;
    if (method === 'copy') { try { await navigator.clipboard.writeText(SHARE_URL); alert('링크가 복사되었습니다!'); } catch { alert(SHARE_URL); } }
    else if (method === 'kakao') { window.open(`https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent(text)}`); }
    else if (method === 'native') { if (navigator.share) { try { await navigator.share({ title: 'AI머니야', text, url: SHARE_URL }); } catch { /* cancel */ } } else { try { await navigator.clipboard.writeText(text); alert('링크가 복사되었습니다!'); } catch { alert(SHARE_URL); } } }
    setShowShare(false);
  };

  const handleResetClick = () => setShowResetConfirm(true);
  const handleResetConfirm = () => { setShowResetConfirm(false); onReset(); };
  const displayName = userName.split('(')[0].trim();

  // ═══════════════════════════════════════
  // ▶ 렌더링
  // ═══════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* ─── 프로필 섹션 ─── */}
      <div className="bg-white p-5 border-b border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <img src={LOGO_URL} alt="AI머니야 로고" className="w-14 h-14 rounded-full object-cover border-2 border-gray-200" />
          <div className="flex-1">
            <p className="text-lg font-extrabold text-gray-800">{displayName}님</p>
            <p className="text-xs text-gray-400">{userEmail}</p>
          </div>
          <button onClick={() => setShowProfileEdit(true)} className="px-3 py-1.5 text-xs font-semibold text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">프로필 편집</button>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
          <span className="text-sm">✨</span>
          <span className="text-xs font-bold text-purple-600">프리미엄급 이용 중 (무료체험)</span>
        </div>
      </div>

      {/* ─── 오상열 CFP 배너 ─── */}
      <div className="mx-4 mt-3">
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <img src={PROFILE_IMAGE_URL} alt="오상열 CFP" className="w-14 h-14 rounded-full object-cover border-2 border-amber-300" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">오상열 CFP</p>
            <p className="text-xs text-amber-600">20년 경력 재무설계 전문가</p>
            <p className="text-xs text-amber-500 mt-0.5">오원트금융연구소 대표</p>
          </div>
          <button onClick={() => onNavigate('consulting')} className="px-3 py-2 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600">상담 신청</button>
        </div>
      </div>

      {/* ─── 메뉴 리스트 ─── */}
      <div className="mx-4 mt-3 bg-white rounded-xl shadow-sm overflow-hidden">
        <button onClick={() => setShowDesireRoadmap(true)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 text-left">
          <span className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white text-sm">🗺️</span>
          <span className="flex-1 text-sm font-semibold text-gray-700">DESIRE 로드맵</span>
          <span className="text-xs text-emerald-500 font-bold">NEW</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>
        <button onClick={() => setShowMembership(true)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 text-left">
          <span className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm">👑</span>
          <span className="flex-1 text-sm font-semibold text-gray-700">멤버십 플랜</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>
        <button onClick={() => setShowOnlineCourse(true)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 text-left">
          <span className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm">🎓</span>
          <span className="flex-1 text-sm font-semibold text-gray-700">온라인강좌 107강 신청</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>
        <button onClick={() => setShowEbook(true)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 text-left">
          <span className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">📖</span>
          <span className="flex-1 text-sm font-semibold text-gray-700">금융집짓기® 전자책</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>
        <button onClick={() => onNavigate('consulting')} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 text-left">
          <span className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center text-white text-sm">👨‍🏫</span>
          <span className="flex-1 text-sm font-semibold text-gray-700">오상열 대표 강의·상담 신청</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>
        <button onClick={() => onNavigate('monthly-report')} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 text-left">
          <span className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm">📊</span>
          <span className="flex-1 text-sm font-semibold text-gray-700">월간 리포트</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>
        <button onClick={handleInquiry} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 text-left">
          <span className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center text-white text-sm">💬</span>
          <span className="flex-1 text-sm font-semibold text-gray-700">1:1 문의하기</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>
        <button onClick={() => setShowShare(true)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 text-left">
          <span className="w-8 h-8 bg-gradient-to-br from-violet-400 to-violet-500 rounded-lg flex items-center justify-center text-white text-sm">🔗</span>
          <span className="flex-1 text-sm font-semibold text-gray-700">친구에게 공유하기</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>
      </div>

      {/* ─── 기타 메뉴 ─── */}
      <div className="mx-4 mt-3 mb-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 text-left">
            <span className="text-gray-400">⚙️</span><span className="flex-1 text-sm text-gray-600">설정</span><span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">개발중</span>
          </button>
          <button onClick={() => setShowFAQ(true)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 text-left">
            <span className="text-gray-400">❓</span><span className="flex-1 text-sm text-gray-600">고객센터 / FAQ</span><span className="text-gray-400 text-sm">›</span>
          </button>
          <button onClick={() => setShowTerms(true)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 text-left">
            <span className="text-gray-400">📄</span><span className="flex-1 text-sm text-gray-600">이용약관</span><span className="text-gray-400 text-sm">›</span>
          </button>
          <button onClick={() => setShowPrivacy(true)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 text-left">
            <span className="text-gray-400">🔒</span><span className="flex-1 text-sm text-gray-600">개인정보처리방침</span><span className="text-gray-400 text-sm">›</span>
          </button>
          <button onClick={() => { if (window.confirm('로그아웃 하시겠습니까?')) onLogout(); }} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 text-left">
            <span className="text-gray-400">🚪</span><span className="flex-1 text-sm text-gray-600">로그아웃</span>
          </button>
          <button onClick={() => setShowWithdraw(true)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 text-left">
            <span className="text-gray-400">🗑️</span><span className="flex-1 text-sm text-red-400">회원탈퇴</span>
          </button>
          <button onClick={handleResetClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
            <span className="text-gray-400">⚠️</span><span className="flex-1 text-sm text-red-500 font-semibold">처음부터 다시하기</span>
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">앱 버전 v2.6.1 (AI머니야)</p>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* ▶ 모달: DESIRE 로드맵 (v2.6 원본 기획)    */}
      {/* ═══════════════════════════════════════ */}
      {showDesireRoadmap && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-t-2xl flex items-center z-10">
              <button onClick={() => setShowDesireRoadmap(false)} className="text-white text-xl mr-3">←</button>
              <div className="flex-1">
                <h2 className="text-white text-lg font-bold">🏆 도전! DESIRE 로드맵</h2>
                <p className="text-emerald-100 text-xs">현재 {[1,2,3,4,5].filter(s => isStageComplete(s)).length > 0 ? `${[1,2,3,4,5].filter(s => isStageComplete(s)).length}단계 완료` : '시작 전'} · 나의 금융 자유 여정</p>
              </div>
            </div>
            <div className="px-4 py-3 bg-emerald-50">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-700 font-semibold">전체 진행률</span>
                <span className="text-emerald-600 font-bold">{[1,2,3,4,5].filter(s => isStageComplete(s)).length}/6</span>
              </div>
              <div className="w-full h-2.5 bg-emerald-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${([1,2,3,4,5].filter(s => isStageComplete(s)).length / 6) * 100}%` }} />
              </div>
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
            <div className="p-4 space-y-3">
              {DESIRE_STAGES.map((stage) => {
                const isComplete = isStageComplete(stage.stage);
                const isExpanded = desireExpandedStage === stage.stage;
                const isLocked = stage.stage === 6 && !isStageComplete(6);
                const detail = desireStageDetails[stage.stage];
                return (
                  <div key={stage.stage} className="rounded-xl overflow-hidden border-2 transition-all" style={{ borderColor: isComplete ? stage.color : '#e5e7eb' }}>
                    <button onClick={() => { if (isLocked) return; setDesireExpandedStage(isExpanded ? null : stage.stage); }} className="w-full flex items-center gap-3 p-3 text-left transition-opacity" style={{ background: `linear-gradient(135deg, ${stage.bgFrom}, ${stage.bgTo})`, opacity: isLocked ? 0.4 : 1 }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow" style={{ background: stage.color }}>{isComplete ? '✓' : stage.letter}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold" style={{ color: stage.color }}>STEP {stage.stage}</span>
                          {isComplete && <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">완료</span>}
                          {isLocked && <span className="text-xs">🔒</span>}
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{stage.title}</p>
                        {detail && <p className="text-xs text-gray-500 mt-0.5 truncate">{detail.summary}</p>}
                      </div>
                      <span className="text-xl">{stage.house}</span>
                      {!isLocked && <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>}
                    </button>
                    {isExpanded && !isLocked && (
                      <div className="bg-white p-4 border-t border-gray-100">
                        {/* 1단계: 신용대출 */}
                        {stage.stage === 1 && (
                          <div className="space-y-2">
                            {(detail?.creditLoans || []).length > 0 ? (
                              <>
                                <p className="text-xs text-gray-500 mb-2">📌 고금리 순으로 상환하세요</p>
                                {detail!.creditLoans!.map((loan) => (
                                  <label key={`cl-${loan.id}`} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition">
                                    <input type="checkbox" checked={!!desireLoanChecks[`cl-${loan.id}`]} onChange={() => handleLoanCheck(`cl-${loan.id}`)} className="w-5 h-5 rounded accent-red-500" />
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-semibold ${desireLoanChecks[`cl-${loan.id}`] ? 'line-through text-gray-400' : 'text-gray-800'}`}>{loan.name}</p>
                                      <p className="text-xs text-gray-500">{(loan.amount / 10000).toLocaleString()}만원</p>
                                    </div>
                                    <span className="text-sm font-bold text-red-600">{loan.rate}%</span>
                                  </label>
                                ))}
                                <p className="text-xs text-gray-400 text-center mt-2">진행: {Object.keys(desireLoanChecks).filter(k => k.startsWith('cl-') && desireLoanChecks[k]).length}/{detail!.creditLoans!.length}건 완료</p>
                              </>
                            ) : (<div className="text-center py-4"><p className="text-3xl mb-2">✅</p><p className="text-sm text-green-600 font-semibold">신용대출이 없습니다!</p></div>)}
                          </div>
                        )}
                        {/* 2단계: 비상예비자금 게이지 */}
                        {stage.stage === 2 && detail?.emergencyFund && (
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>현재: <strong className="text-orange-600">{(detail.emergencyFund.current / 10000).toLocaleString()}만원</strong></span>
                              <span>목표: <strong>{(detail.emergencyFund.target / 10000).toLocaleString()}만원</strong></span>
                            </div>
                            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, detail.emergencyFund.target > 0 ? (detail.emergencyFund.current / detail.emergencyFund.target) * 100 : 0)}%`, background: `linear-gradient(90deg, #ea580c, #f97316)` }} />
                            </div>
                            <p className="text-center text-xs text-gray-500">달성률 <strong className="text-orange-600">{detail.emergencyFund.target > 0 ? Math.round((detail.emergencyFund.current / detail.emergencyFund.target) * 100) : 0}%</strong>{detail.emergencyFund.secured && ' ✅'}</p>
                          </div>
                        )}
                        {stage.stage === 2 && !detail?.emergencyFund && (<div className="text-center py-4 text-gray-400 text-sm">금융집짓기에서 비상예비자금을 설정해주세요</div>)}
                        {/* 3단계: 저축/연금 */}
                        {stage.stage === 3 && detail?.savings && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-yellow-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">월 저축투자</p><p className="text-lg font-bold text-yellow-700">{(detail.savings.monthlySaving / 10000).toLocaleString()}<span className="text-xs font-normal">만원</span></p></div>
                              <div className="bg-yellow-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">월 노후연금</p><p className="text-lg font-bold text-yellow-700">{(detail.savings.monthlyPension / 10000).toLocaleString()}<span className="text-xs font-normal">만원</span></p></div>
                            </div>
                            {detail.savings.irregularIncome > 0 && (<div className="bg-amber-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">비정기 수입</p><p className="text-base font-bold text-amber-700">{(detail.savings.irregularIncome / 10000).toLocaleString()}만원</p></div>)}
                            <p className="text-xs text-gray-400 text-center">합계: 월 {((detail.savings.monthlySaving + detail.savings.monthlyPension) / 10000).toLocaleString()}만원</p>
                          </div>
                        )}
                        {stage.stage === 3 && !detail?.savings && (<div className="text-center py-4 text-gray-400 text-sm">금융집짓기에서 저축/연금을 설정해주세요</div>)}
                        {/* 4단계: 금융자산 10억 게이지 */}
                        {stage.stage === 4 && detail?.investment && (
                          <div className="space-y-3">
                            <div className="text-center mb-2"><p className="text-3xl font-bold text-blue-600">{(detail.investment.financialAssets / 100000000).toFixed(1)}<span className="text-sm font-normal text-gray-500">억원</span></p><p className="text-xs text-gray-400">목표: 10억원</p></div>
                            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (detail.investment.financialAssets / detail.investment.target) * 100)}%`, background: `linear-gradient(90deg, #2563eb, #3b82f6)` }} /></div>
                            <p className="text-center text-xs text-gray-500">달성률 <strong className="text-blue-600">{Math.round((detail.investment.financialAssets / detail.investment.target) * 100)}%</strong></p>
                          </div>
                        )}
                        {stage.stage === 4 && !detail?.investment && (<div className="text-center py-4 text-gray-400 text-sm">금융집짓기에서 금융자산을 입력해주세요</div>)}
                        {/* 5단계: 담보대출 */}
                        {stage.stage === 5 && (
                          <div className="space-y-2">
                            {(detail?.mortgageLoans || []).length > 0 ? (
                              <>
                                <p className="text-xs text-gray-500 mb-2">📌 담보대출 상환 계획</p>
                                {detail!.mortgageLoans!.map((loan) => (
                                  <label key={`ml-${loan.id}`} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition">
                                    <input type="checkbox" checked={!!desireLoanChecks[`ml-${loan.id}`]} onChange={() => handleLoanCheck(`ml-${loan.id}`)} className="w-5 h-5 rounded accent-purple-500" />
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-semibold ${desireLoanChecks[`ml-${loan.id}`] ? 'line-through text-gray-400' : 'text-gray-800'}`}>{loan.name}</p>
                                      <p className="text-xs text-gray-500">{(loan.amount / 10000).toLocaleString()}만원</p>
                                    </div>
                                    <span className="text-sm font-bold text-purple-600">{loan.rate}%</span>
                                  </label>
                                ))}
                                <p className="text-xs text-gray-400 text-center mt-2">진행: {Object.keys(desireLoanChecks).filter(k => k.startsWith('ml-') && desireLoanChecks[k]).length}/{detail!.mortgageLoans!.length}건 완료</p>
                              </>
                            ) : (<div className="text-center py-4"><p className="text-3xl mb-2">✅</p><p className="text-sm text-green-600 font-semibold">담보대출이 없습니다!</p></div>)}
                          </div>
                        )}
                        {/* 6단계: 축하 + 선물 */}
                        {stage.stage === 6 && (
                          <div className="text-center py-6">
                            {!giftOpened ? (<><p className="text-5xl mb-3 animate-bounce">🎁</p><h4 className="text-lg font-bold text-emerald-700 mb-2">축하드립니다!</h4><p className="text-sm text-gray-600 mb-1">DESIRE 6단계를 모두 완료하셨습니다!</p><p className="text-sm text-gray-600 mb-4">초가집에서 시작한 금융 여정이<br />마침내 <strong className="text-emerald-600">고급주택</strong>에 도달했습니다!</p><button onClick={handleOpenGift} className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">🎁 선물함 열기</button></>) : (<><p className="text-5xl mb-3">🏰</p><h4 className="text-lg font-bold text-emerald-700 mb-2">경제적 자유 달성!</h4><p className="text-sm text-gray-500">당신의 금융집이 완성되었습니다 🎉</p></>)}
                          </div>
                        )}
                        {/* 공통: 완료 체크 + 인증샷 (1~5단계) */}
                        {stage.stage <= 5 && (
                          <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                            <button onClick={() => handleDesireComplete(stage.stage)} className={`w-full py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${desireCompleted[stage.stage] ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{desireCompleted[stage.stage] ? '✅ 완료!' : '☐ 완료 체크'}</button>
                            <button onClick={() => handlePhotoAttach(stage.stage)} className="w-full py-2.5 rounded-xl text-xs font-semibold border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition flex items-center justify-center gap-2">📷 인증샷 첨부</button>
                            {desirePhotos[stage.stage] && (<div className="relative"><img src={desirePhotos[stage.stage]} alt="인증샷" className="w-full h-40 object-cover rounded-xl border border-gray-200" onClick={() => window.open(desirePhotos[stage.stage], '_blank')} style={{ cursor: 'pointer' }} /><button onClick={() => { const next = { ...desirePhotos }; delete next[stage.stage]; setDesirePhotos(next); localStorage.setItem('desirePhotos', JSON.stringify(next)); }} className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full text-white text-xs flex items-center justify-center">✕</button></div>)}
                            <p className="text-xs text-gray-400 text-center">📍 {stage.dataSource}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-4 pb-6"><div className="bg-gray-50 rounded-xl p-4 text-center"><p className="text-xs text-gray-500 mb-2">나의 금융집 진화</p><div className="flex items-center justify-center gap-1 text-2xl flex-wrap">{DESIRE_STAGES.map((s, i) => (<span key={i} className={`transition-opacity ${isStageComplete(s.stage) ? '' : 'opacity-30'}`}>{i > 0 && <span className="text-sm text-gray-400 mx-0.5">→</span>}{s.house}</span>))}</div></div></div>
          </div>
        </div>
      )}

      {/* 축하 모달 (빵빠레) */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={() => setShowCelebration(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 30 }).map((_, i) => (<div key={i} className="absolute w-2 h-2 rounded-full animate-ping" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, background: ['#dc2626', '#ea580c', '#ca8a04', '#2563eb', '#7c3aed', '#059669', '#f59e0b', '#ec4899'][i % 8], animationDelay: `${Math.random() * 2}s`, animationDuration: `${1 + Math.random() * 2}s` }} />))}
            </div>
            <p className="text-6xl mb-4 relative">🎊</p>
            <h3 className="text-xl font-bold text-gray-800 mb-2 relative">🎉 DESIRE 완주! 🎉</h3>
            <p className="text-sm text-gray-600 mb-2 relative">금융 자유를 향한 모든 단계를 완료하셨습니다!</p>
            <p className="text-sm text-gray-500 mb-4 relative">당신의 금융집이 완성되었어요! 🏰</p>
            <div className="flex items-center justify-center gap-1 text-2xl mb-4 relative"><span>🏚️</span><span className="text-sm">→</span><span>🏡</span><span className="text-sm">→</span><span>🏠</span><span className="text-sm">→</span><span>🏢</span><span className="text-sm">→</span><span>🏛️</span><span className="text-sm">→</span><span>🏰</span></div>
            <button onClick={() => setShowCelebration(false)} className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold rounded-xl relative">감사합니다! 🙏</button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* ▶ 모달: 멤버십 플랜                      */}
      {/* ═══════════════════════════════════════ */}
      {showMembership && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-t-2xl flex items-center">
              <button onClick={closeMembership} className="text-white text-xl mr-3">←</button>
              <div><h2 className="text-white text-lg font-bold">👑 멤버십 플랜</h2><p className="text-purple-200 text-xs">나에게 맞는 플랜을 선택하세요</p></div>
            </div>
            {membershipStep === 'list' && (<>
              <div className="flex mx-4 mt-3 bg-gray-100 rounded-xl p-1">
                <button onClick={() => setMembershipTab('general')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${membershipTab === 'general' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}>🏠 일반인</button>
                <button onClick={() => setMembershipTab('fp')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${membershipTab === 'fp' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}>💼 금융전문가(FP)</button>
              </div>
              <div className="p-4 space-y-3">
                {(MEMBERSHIP_PLANS[membershipTab] || []).map(plan => (
                  <div key={plan.tier} className={`bg-white rounded-xl border-2 p-4 ${plan.highlight ? 'border-purple-400 shadow-lg' : 'border-gray-200'} relative`}>
                    {plan.highlight && <span className="absolute -top-2.5 right-4 bg-purple-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">추천</span>}
                    <div className="flex items-center gap-2 mb-2"><span className="text-xl">{plan.badge}</span><span className="text-sm font-bold text-gray-800">{plan.tier}</span>{plan.current && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">현재</span>}</div>
                    <div className="mb-2">{plan.price === 0 ? (<span className="text-2xl font-extrabold text-gray-800">{plan.priceDisplay}</span>) : (<><span className="text-2xl font-extrabold text-gray-800">₩{plan.priceDisplay}</span><span className="text-sm text-gray-500">/월</span></>)}</div>
                    <div className="space-y-1 mb-3">{plan.benefits.map((b, i) => (<p key={i} className="text-xs text-gray-600 flex items-start gap-1"><span className="text-purple-500 mt-0.5">✓</span>{b}</p>))}</div>
                    {!plan.current && (<button onClick={() => handleSelectPlan(plan)} className={`w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${plan.gradient}`}>{plan.tier} 시작하기</button>)}
                  </div>
                ))}
                <p className="text-xs text-gray-400 leading-relaxed">💡 모든 유료 플랜은 언제든 해지 가능합니다.<br />💡 연간 결제 시 2개월 무료 혜택이 제공됩니다.<br />💡 결제 후 7일 이내 전액 환불 가능합니다.</p>
              </div>
            </>)}
            {membershipStep === 'cycle' && selectedMembershipPlan && (
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{selectedMembershipPlan.badge} {selectedMembershipPlan.tier}</h3><p className="text-sm text-gray-500 mb-4">결제 주기를 선택하세요</p>
                <div className="space-y-3">
                  <button onClick={() => handleSelectCycle('monthly')} className="w-full p-4 border-2 border-gray-200 rounded-xl text-left hover:border-purple-400"><p className="text-sm font-bold text-gray-800">월간 결제</p><p className="text-xl font-extrabold text-purple-600 mt-1">₩{selectedMembershipPlan.priceDisplay}<span className="text-sm font-normal text-gray-500">/월</span></p></button>
                  <button onClick={() => handleSelectCycle('annual')} className="w-full p-4 border-2 border-purple-400 rounded-xl text-left bg-purple-50 relative"><span className="absolute -top-2 right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">2개월 무료!</span><p className="text-sm font-bold text-gray-800">연간 결제</p><p className="text-xl font-extrabold text-purple-600 mt-1">₩{selectedMembershipPlan.annualDisplay}<span className="text-sm font-normal text-gray-500">/년</span></p><p className="text-xs text-gray-500">월 ₩{selectedMembershipPlan.annualMonthly} 상당</p></button>
                </div>
                <button onClick={() => setMembershipStep('list')} className="w-full mt-4 py-2 text-sm text-gray-500">← 플랜 선택으로 돌아가기</button>
              </div>
            )}
            {membershipStep === 'payment' && selectedMembershipPlan && (
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">💳 결제 정보 입력</h3><p className="text-xs text-gray-500 mb-4">{selectedMembershipPlan.tier} · {billingCycle === 'monthly' ? `월 ₩${selectedMembershipPlan.priceDisplay}` : `연 ₩${selectedMembershipPlan.annualDisplay}`}</p>
                <div className="space-y-3">
                  <div><label className="text-xs font-semibold text-gray-600">카드번호</label><input value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} placeholder="0000-0000-0000-0000" className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm" /></div>
                  <div className="flex gap-3"><div className="flex-1"><label className="text-xs font-semibold text-gray-600">유효기간</label><input value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm" /></div><div className="flex-1"><label className="text-xs font-semibold text-gray-600">CVC</label><input value={cardCvc} onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="000" className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm" /></div></div>
                  <div><label className="text-xs font-semibold text-gray-600">카드 소유자명</label><input value={cardHolder} onChange={e => setCardHolder(e.target.value)} placeholder="홍길동" className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm" /></div>
                </div>
                <button onClick={handlePay} disabled={isPayProcessing} className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl disabled:opacity-50">{isPayProcessing ? '결제 처리 중...' : `₩${billingCycle === 'monthly' ? selectedMembershipPlan.priceDisplay : selectedMembershipPlan.annualDisplay} 결제하기`}</button>
                <button onClick={() => setMembershipStep('cycle')} className="w-full mt-2 py-2 text-sm text-gray-500">← 결제 주기 선택으로</button>
              </div>
            )}
            {membershipStep === 'done' && selectedMembershipPlan && (
              <div className="p-6 text-center"><p className="text-5xl mb-3">🎉</p><h3 className="text-xl font-bold text-gray-800 mb-1">결제 완료!</h3><p className="text-sm text-gray-600 mb-1">{selectedMembershipPlan.badge} {selectedMembershipPlan.tier} 플랜이 활성화되었습니다.</p><p className="text-xs text-gray-400 mb-4">(데모: 실제 결제는 이루어지지 않았습니다)</p><button onClick={closeMembership} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl">확인</button></div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* ▶ ★★★ 온라인강좌 신청 모달 (v2.2 복원) ★★★ */}
      {/* ═══════════════════════════════════════ */}
      {showOnlineCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">🎓 온라인강좌 107강</h3>
              <button onClick={() => setShowOnlineCourse(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="p-4">
              <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-4 mb-4">
                <h4 className="font-bold text-gray-800 mb-2">금융집짓기® 완전정복</h4>
                <p className="text-sm text-gray-600 mb-3">오상열 CFP의 20년 노하우를 107강에 담았습니다</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>✓ DESIRE 6단계 완벽 해설</li>
                  <li>✓ 실전 재무설계 사례</li>
                  <li>✓ AI머니야 스탠다드 이용권 제공</li>
                </ul>
              </div>
              <div className="space-y-3">
                {/* ★★★ v2.2: 강좌 보러가기 버튼 ★★★ */}
                <button
                  onClick={() => {
                    setShowOnlineCourse(false);
                    onNavigate('online-course');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl"
                >
                  📺 강좌 보러가기
                </button>
                <button className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-xl">
                  월 29,000원 신청하기
                </button>
                <button className="w-full py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold rounded-xl">
                  연간 290,000원 신청하기
                  <span className="block text-xs opacity-80 mt-1">2개월 무료!</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 전자책 모달 */}
      {showEbook && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">📖 금융집짓기® 전자책</h3>
            <div className="flex justify-center mb-4"><img src={EBOOK_COVER_URL} alt="전자책 표지" className="w-32 h-40 object-cover rounded-lg shadow-md" /></div>
            <p className="text-sm text-gray-600 mb-4 text-center">금융집짓기® V2.0 전자책<br />정가 12,900원</p>
            <div className="bg-orange-50 rounded-lg p-3 mb-4"><p className="text-xs text-orange-700">✅ BASIC 이상 구독 시 무료 제공<br />✅ PDF 다운로드 가능<br />✅ 워크북 포함</p></div>
            <button onClick={() => setShowEbook(false)} className="w-full py-2.5 border border-gray-300 text-gray-600 text-sm font-bold rounded-xl">닫기</button>
          </div>
        </div>
      )}

      {/* FAQ 모달 */}
      {showFAQ && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center"><button onClick={() => setShowFAQ(false)} className="text-xl mr-3">←</button><h2 className="text-lg font-bold">❓ 고객센터 / FAQ</h2></div>
            <div className="p-4 space-y-2">
              {FAQ_DATA.map((faq, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)} className="w-full p-3 text-left flex items-center"><span className="flex-1 text-sm font-semibold text-gray-700">{faq.q}</span><span className="text-gray-400">{openFaqIndex === i ? '▲' : '▼'}</span></button>
                  {openFaqIndex === i && <div className="px-3 pb-3"><p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{faq.a}</p></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 프로필 편집 모달 */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">✏️ 프로필 편집</h3>
            <div><label className="text-xs font-semibold text-gray-600">닉네임</label><input value={editName} onChange={e => setEditName(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm" /></div>
            <div className="mt-3"><label className="text-xs font-semibold text-gray-600">이메일</label><input value={userEmail} disabled className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-400" /></div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setShowProfileEdit(false); alert('프로필이 저장되었습니다.'); }} className="flex-1 py-2.5 bg-blue-500 text-white text-sm font-bold rounded-xl">저장</button>
              <button onClick={() => setShowProfileEdit(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-bold rounded-xl">취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 설정 모달 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"><p className="text-4xl mb-3">⚙️</p><h3 className="text-lg font-bold text-gray-800 mb-2">설정</h3><p className="text-sm text-gray-500 mb-4">현재 개발 중입니다.<br />알림, 테마, 언어 설정 등이 추가될 예정입니다.</p><button onClick={() => setShowSettings(false)} className="px-8 py-2.5 border border-gray-300 text-gray-600 text-sm font-bold rounded-xl">확인</button></div>
        </div>
      )}

      {/* 이용약관 모달 */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center"><button onClick={() => setShowTerms(false)} className="text-xl mr-3">←</button><h2 className="text-lg font-bold">📄 이용약관</h2></div>
            <div className="p-4 text-sm text-gray-600 leading-relaxed">
              <p className="font-bold mb-2">제1조 (목적)</p><p className="mb-3">이 약관은 오원트금융연구소(이하 "회사")가 제공하는 AI머니야 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
              <p className="font-bold mb-2">제2조 (서비스의 내용)</p><p className="mb-3">회사는 AI 기반 재무설계 도구, 지출 관리, 금융 교육 콘텐츠 등의 서비스를 제공합니다. 서비스의 구체적인 내용은 회사의 정책에 따라 변경될 수 있습니다.</p>
              <p className="font-bold mb-2">제3조 (면책사항)</p><p>본 서비스에서 제공하는 정보는 일반적인 금융 정보이며, 특정 투자 상품에 대한 추천이나 보장이 아닙니다. 모든 금융 결정은 이용자 본인의 책임하에 이루어져야 합니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보처리방침 모달 */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center"><button onClick={() => setShowPrivacy(false)} className="text-xl mr-3">←</button><h2 className="text-lg font-bold">🔒 개인정보처리방침</h2></div>
            <div className="p-4 text-sm text-gray-600 leading-relaxed">
              <p className="font-bold mb-2">1. 개인정보의 수집·이용 목적</p><p className="mb-3">회원 가입, 서비스 제공, 재무설계 분석, 고객 상담 응대</p>
              <p className="font-bold mb-2">2. 수집하는 개인정보 항목</p><p className="mb-3">이메일, 이름, 재무 정보 (수입, 지출, 자산, 부채 등 사용자가 직접 입력한 정보)</p>
              <p className="font-bold mb-2">3. 개인정보의 보유 및 이용기간</p><p className="mb-3">회원 탈퇴 시까지. 탈퇴 시 모든 개인정보는 즉시 파기됩니다.</p>
              <p className="font-bold mb-2">4. 개인정보의 제3자 제공</p><p>회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* 회원탈퇴 모달 */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full"><p className="text-3xl text-center mb-3">⚠️</p><h3 className="text-lg font-bold text-gray-800 text-center mb-2">회원 탈퇴</h3><p className="text-sm text-gray-600 text-center mb-4">탈퇴 시 모든 데이터가 영구 삭제됩니다.<br />이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex gap-2"><button onClick={() => { setShowWithdraw(false); onReset(); }} className="flex-1 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl">탈퇴하기</button><button onClick={() => setShowWithdraw(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-bold rounded-xl">취소</button></div>
          </div>
        </div>
      )}

      {/* 공유 모달 */}
      {showShare && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">🔗 친구에게 공유하기</h3>
            <div className="space-y-3">
              <button onClick={() => handleShare('kakao')} className="w-full py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl text-sm">💬 카카오톡으로 공유</button>
              <button onClick={() => handleShare('copy')} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm">📋 링크 복사</button>
              <button onClick={() => handleShare('native')} className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl text-sm">📤 다른 앱으로 공유</button>
            </div>
            <button onClick={() => setShowShare(false)} className="w-full mt-3 py-2 text-sm text-gray-500">닫기</button>
          </div>
        </div>
      )}

      {/* 처음부터 다시하기 확인 모달 */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full"><p className="text-3xl text-center mb-3">⚠️</p><h3 className="text-lg font-bold text-gray-800 text-center mb-2">처음부터 다시하기</h3><p className="text-sm text-gray-600 text-center mb-4">모든 재무설계 데이터가 초기화됩니다.<br />이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex gap-2"><button onClick={handleResetConfirm} className="flex-1 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl">초기화</button><button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-bold rounded-xl">취소</button></div>
          </div>
        </div>
      )}

    </div>
  );
}
