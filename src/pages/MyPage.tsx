// src/pages/MyPage.tsx
// v2.4: 마이페이지
// v2.0: 전체 개편 (구독상태, 뱃지, 성장기록, 개인정보 등)
// v2.2: 온라인강좌 페이지 연결 추가
// v2.3 변경사항:
// - C-1: "전문가 상담 · 강의 신청" → "오상열 대표 강의·상담 신청" 제목 변경
// - C-2: 공유하기 모달 내 모든 URL을 stable 브랜치 URL로 변경
// v2.4 변경사항:
// - DESIRE 로드맵 모달을 실제 localStorage 데이터 연동 버전으로 전면 교체
// - financialHouseData / financialHouseDesignData 에서 실제 데이터 읽기
// - 1~5단계 자유 열람, 6단계 선물함만 전단계 완료 시 열림
// - 완료 체크/대출 체크 상태 localStorage 영속 저장

import { useState, useEffect, useRef, useCallback } from 'react';

// AI머니야 로고 URL (Firebase Storage)
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a";

// 오상열 대표 사진 URL (Firebase Storage)
const PROFILE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%98%A4%EC%83%81%EC%97%B4%20%EC%82%AC%EC%A7%84.png?alt=media&token=63eaf15e-9d0b-4d72-8fbb-ee03d6ecc8e5';

// 금융집짓기 V2.0 전자책 표지 (임시)
const EBOOK_COVER_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/financial-house-exterior.png.png?alt=media&token=e1651823-af8e-4ed3-9b3d-557a1bf0eb10';

// ★★★ v2.3: stable 브랜치 공유 URL (C-2) ★★★
const SHARE_URL = 'https://moneya-frontend.vercel.app';

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

// DESIRE 단계별 집/날씨 정의
const DESIRE_STAGES = [
  { stage: 1, label: 'D', name: 'Debt Free', fullName: '신용대출 상환', house: '🏚️', houseName: '초가집', weather: '⛈️', weatherName: '폭풍우', color: 'text-red-600', bgColor: 'from-red-100 to-red-200' },
  { stage: 2, label: 'E', name: 'Emergency Fund', fullName: '비상예비자금', house: '🏡', houseName: '나무집', weather: '☁️', weatherName: '흐림', color: 'text-orange-600', bgColor: 'from-orange-100 to-orange-200' },
  { stage: 3, label: 'S', name: 'Savings', fullName: '저축투자', house: '🏠', houseName: '벽돌집', weather: '⛅', weatherName: '구름', color: 'text-yellow-600', bgColor: 'from-yellow-100 to-yellow-200' },
  { stage: 4, label: 'I', name: 'Investment', fullName: '금융자산 10억', house: '🏢', houseName: '콘크리트', weather: '☀️', weatherName: '맑음', color: 'text-blue-600', bgColor: 'from-blue-100 to-blue-200' },
  { stage: 5, label: 'R', name: 'Retirement', fullName: '담보대출 상환', house: '🏛️', houseName: '대리석', weather: '🌤️', weatherName: '화창', color: 'text-purple-600', bgColor: 'from-purple-100 to-purple-200' },
  { stage: 6, label: 'E', name: 'Enjoy & Estate', fullName: '경제적 자유', house: '🏰', houseName: '고급주택', weather: '🌈', weatherName: '무지개', color: 'text-emerald-600', bgColor: 'from-emerald-100 to-emerald-200' },
];

// 뱃지 정의
const ALL_BADGES = [
  { id: 'streak7', emoji: '🔥', name: '7일 연속', description: '7일 연속 앱 접속' },
  { id: 'firstSave', emoji: '💰', name: '첫 저축', description: '첫 저축 기록' },
  { id: 'analyst', emoji: '📊', name: '분석왕', description: '재무분석 완료' },
  { id: 'goalAchieve', emoji: '🎯', name: '목표달성', description: '월간 목표 달성' },
  { id: 'streak30', emoji: '💎', name: '30일 연속', description: '30일 연속 접속' },
  { id: 'saver', emoji: '🏦', name: '저축왕', description: '월 100만원 이상 저축' },
  { id: 'budgetMaster', emoji: '📈', name: '예산마스터', description: '3개월 연속 예산 달성' },
  { id: 'investor', emoji: '📉', name: '투자시작', description: '첫 투자 기록' },
  { id: 'debtFree', emoji: '🆓', name: '무채무', description: '신용대출 완납' },
  { id: 'millionaire', emoji: '💵', name: '천만장자', description: '순자산 1천만원 달성' },
];

// 로마숫자 변환
const toRoman = (num: number): string => {
  const romans = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ'];
  return romans[num - 1] || '';
};

// FAQ 데이터 (100개 중 일부)
const FAQ_DATA = [
  { q: 'AI머니야는 무엇인가요?', a: 'AI머니야는 AI 기반 개인 재무관리 앱으로, 금융집짓기® 방법론을 통해 체계적인 재무설계를 도와드립니다.' },
  { q: '금융집짓기®란 무엇인가요?', a: '금융집짓기®는 오상열 CFP가 개발한 특허받은 재무설계 방법론으로, 집을 짓는 것처럼 단계별로 재무 기반을 쌓아가는 방식입니다.' },
  { q: 'DESIRE 6단계란?', a: 'Debt Free(신용대출상환) → Emergency Fund(비상예비자금) → Savings(저축투자) → Investment(금융자산10억) → Retirement(담보대출상환) → Enjoy&Estate(경제적자유)의 6단계입니다.' },
  { q: '무료 체험 기간은 얼마나 되나요?', a: '로그인 후 14일간 프리미엄급 서비스를 무료로 이용하실 수 있습니다.' },
  { q: '유료 구독 요금은 얼마인가요?', a: '일반인용: 베이직 12,900원, 스탠다드 29,000원, 프리미엄 59,000원 / FP용: 베이직 33,000원, 스탠다드 59,000원, 프리미엄 99,000원입니다.' },
  { q: 'AI 지출 상담은 어떻게 이용하나요?', a: 'AI지출 탭에서 음성 또는 텍스트로 지출에 대해 상담받으실 수 있습니다. 무료 이용은 월 5회입니다.' },
  { q: '재무설계 리포트는 어디서 볼 수 있나요?', a: '더보기 > 월간 리포트에서 확인하실 수 있습니다.' },
  { q: '전문가 상담은 어떻게 신청하나요?', a: '더보기 > 오상열 대표 강의·상담 신청에서 원하시는 상담 유형을 선택하여 신청하실 수 있습니다.' },
  { q: '개인정보는 안전하게 보호되나요?', a: '네, 모든 개인정보는 암호화되어 안전하게 보관됩니다. 자세한 내용은 개인정보처리방침을 확인해주세요.' },
  { q: '회원 탈퇴는 어떻게 하나요?', a: '더보기 > 회원탈퇴에서 탈퇴 신청하실 수 있습니다. 탈퇴 시 모든 데이터가 삭제됩니다.' },
];

// ═══════════════════════════════════════════════════════════════
// ★★★ v2.4: DESIRE 로드맵 실제 데이터 연동 (시작) ★★★
// ═══════════════════════════════════════════════════════════════

const DESIRE_ROADMAP_STAGES = [
  { stage: 1, letter: 'D', name: 'Debt Free', fullName: '신용대출 상환', house: '🏚️', houseName: '초가집', color: '#dc2626', bgGradient: 'linear-gradient(135deg, #fef2f2, #fecaca)', borderColor: '#fca5a5', description: '신용대출을 모두 상환하세요', dataSource: '금융집짓기 > 부채설계 > 신용대출', certGuide: '신용대출 상환 완료 인증샷을 첨부하세요' },
  { stage: 2, letter: 'E', name: 'Emergency Fund', fullName: '비상예비자금', house: '🏡', houseName: '나무집', color: '#ea580c', bgGradient: 'linear-gradient(135deg, #fff7ed, #fed7aa)', borderColor: '#fdba74', description: '비상예비자금을 확보하세요', dataSource: '금융집짓기 > 투자설계 > 비상예비자금', certGuide: '비상예비자금 마련 금액을 인증하세요' },
  { stage: 3, letter: 'S', name: 'Savings', fullName: '저축투자', house: '🏠', houseName: '벽돌집', color: '#ca8a04', bgGradient: 'linear-gradient(135deg, #fefce8, #fef08a)', borderColor: '#fde047', description: '월 저축투자+노후연금이 예산을 초과하세요', dataSource: '금융집짓기 > 저축투자 + 노후연금', certGuide: '저축/투자 현황 인증샷을 첨부하세요' },
  { stage: 4, letter: 'I', name: 'Investment', fullName: '금융자산 10억', house: '🏢', houseName: '콘크리트', color: '#2563eb', bgGradient: 'linear-gradient(135deg, #eff6ff, #bfdbfe)', borderColor: '#93c5fd', description: '금융자산 10억원을 달성하세요', dataSource: '금융집짓기 > 투자설계 > 금융자산', certGuide: '금융자산 10억원 달성 인증샷을 첨부하세요' },
  { stage: 5, letter: 'R', name: 'Retirement', fullName: '담보대출 상환', house: '🏛️', houseName: '대리석', color: '#7c3aed', bgGradient: 'linear-gradient(135deg, #f5f3ff, #ddd6fe)', borderColor: '#c4b5fd', description: '담보대출을 모두 상환하세요', dataSource: '금융집짓기 > 부채설계 > 담보대출', certGuide: '담보대출 상환 완료 인증샷을 첨부하세요' },
  { stage: 6, letter: 'E', name: 'Enjoy & Estate', fullName: '경제적 자유', house: '🏰', houseName: '고급주택', color: '#059669', bgGradient: 'linear-gradient(135deg, #ecfdf5, #a7f3d0)', borderColor: '#6ee7b7', description: '1~5단계를 모두 완료하면 달성!', dataSource: '전 단계 자동 판정', certGuide: '' },
];

// localStorage에서 실제 금융 데이터 로드
const loadFinancialData = () => {
  let basicData: any = null;
  let designData: any = null;

  try {
    const savedBasic = localStorage.getItem('financialHouseData');
    if (savedBasic) basicData = JSON.parse(savedBasic);
  } catch (e) { console.error('[DESIRE] financialHouseData 파싱 실패:', e); }

  try {
    const savedDesign = localStorage.getItem('financialHouseDesignData');
    if (savedDesign) designData = JSON.parse(savedDesign);
  } catch (e) { console.error('[DESIRE] financialHouseDesignData 파싱 실패:', e); }

  const b = basicData;
  const d = designData;

  // 1단계: 신용대출
  const debtDesign = d?.debt;
  const rawDebtList = b?.debts?.debtList || debtDesign?.debtList || [];
  const creditLoans = rawDebtList
    .filter((item: any) => {
      const t = (item.type || item.loanType || '').toLowerCase();
      return t === 'credit' || t === '신용' || t === '신용대출' || t === 'creditloan' || t === 'credit_loan' || (!t && !item.collateral);
    })
    .map((item: any, idx: number) => ({
      id: item.id || idx + 1,
      name: item.name || item.loanName || item.institution || `신용대출 ${idx + 1}`,
      amount: Number(item.amount || item.balance || item.loanAmount || 0),
      rate: Number(item.rate || item.interestRate || 0),
    }));

  // 2단계: 비상예비자금
  const investDesign = d?.invest;
  const monthlyIncome = b?.income ? (Number(b.income.myIncome || 0) + Number(b.income.spouseIncome || 0) + Number(b.income.otherIncome || 0)) : 0;
  const emergencyTarget = investDesign?.emergencyFundTarget || investDesign?.emergencyFund?.target || (monthlyIncome > 0 ? monthlyIncome * 6 * 10000 : 10000000);
  const emergencyCurrent = investDesign?.emergencyFundCurrent || investDesign?.emergencyFund?.current || 0;
  const emergencySecured = investDesign?.emergencyFundSecured || investDesign?.emergencyFund?.secured || (emergencyCurrent >= emergencyTarget);

  // 3단계: 저축투자
  const budgetDesign = d?.budget || d?.save;
  const retireDesign = d?.retire;
  const monthlySavingCurrent = Number(budgetDesign?.monthlySaving || budgetDesign?.monthlySavingCurrent || 0);
  const monthlySavingBudget = Number(budgetDesign?.monthlySavingBudget || budgetDesign?.targetAmount || budgetDesign?.monthlyTarget || 0);
  const monthlyPensionCurrent = Number(retireDesign?.currentPersonalPension || retireDesign?.monthlyPensionCurrent || 0);
  const monthlyPensionBudget = Number(retireDesign?.monthlySaving || retireDesign?.monthlyPensionBudget || 0);
  const irregularIncome = Number(b?.income?.irregularIncome || b?.income?.otherAnnualIncome || budgetDesign?.irregularIncome || 0);

  // 4단계: 금융자산
  const totalFinancialAsset = Number(b?.totalFinancialAsset || investDesign?.totalFinancialAsset || investDesign?.financialAssets || 0);
  const financialAssets = totalFinancialAsset < 100000 ? totalFinancialAsset * 10000 : totalFinancialAsset;

  // 5단계: 담보대출
  const mortgageLoans = rawDebtList
    .filter((item: any) => {
      const t = (item.type || item.loanType || '').toLowerCase();
      return t === 'mortgage' || t === '담보' || t === '담보대출' || t === 'mortgageloan' || t === 'mortgage_loan' || t === '주택담보' || item.collateral;
    })
    .map((item: any, idx: number) => ({
      id: item.id || idx + 1,
      name: item.name || item.loanName || item.institution || `담보대출 ${idx + 1}`,
      amount: Number(item.amount || item.balance || item.loanAmount || 0),
      rate: Number(item.rate || item.interestRate || 0),
    }));

  return {
    creditLoans,
    emergencyFund: { target: emergencyTarget, current: emergencyCurrent, secured: emergencySecured },
    savings: {
      monthlySavingCurrent: monthlySavingCurrent * 10000,
      monthlySavingBudget: monthlySavingBudget * 10000,
      monthlyPensionCurrent: monthlyPensionCurrent * 10000,
      monthlyPensionBudget: monthlyPensionBudget * 10000,
      irregularIncome: irregularIncome * 10000,
      annualSavingBudget: monthlySavingBudget * 12 * 10000,
      annualPensionBudget: monthlyPensionBudget * 12 * 10000,
    },
    financialAssets,
    mortgageLoans,
    hasBasicData: !!b,
    hasDesignData: !!d,
  };
};

// 빵빠레 파티클 컴포넌트
function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ['#ff0000', '#ff8800', '#ffdd00', '#00cc44', '#0088ff', '#8800ff', '#ff00aa', '#00ddff'];
    const particles: any[] = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 100,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: Math.random() * -18 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 3,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.25,
        opacity: 1,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }
    particlesRef.current = particles;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particlesRef.current.forEach((p) => {
        p.x += p.vx; p.vy += p.gravity; p.y += p.vy;
        p.rotation += p.rotSpeed; p.opacity -= 0.005;
        if (p.opacity > 0) {
          alive = true;
          ctx.save(); ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
          ctx.restore();
        }
      });
      if (alive) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }} />;
}

// DESIRE 로드맵 전체화면 모달 컴포넌트
function DesireRoadmapModal({ onClose }: { onClose: () => void }) {
  const [financialData, setFinancialData] = useState(() => loadFinancialData());
  const [selectedStage, setSelectedStage] = useState<any>(null);
  const [completed, setCompleted] = useState<Record<number, boolean>>(() => {
    try { const s = localStorage.getItem('desireChallengeProgress'); if (s) return JSON.parse(s); } catch {}
    return { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
  });
  const [attachments, setAttachments] = useState<Record<number, string[]>>({ 1: [], 2: [], 3: [], 4: [], 5: [] });
  const [loanChecks, setLoanChecks] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem('desireLoanChecks'); if (s) return JSON.parse(s); } catch {}
    return {};
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [giftOpened, setGiftOpened] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingStage, setUploadingStage] = useState<number | null>(null);

  // localStorage 저장
  useEffect(() => { try { localStorage.setItem('desireChallengeProgress', JSON.stringify(completed)); } catch {} }, [completed]);
  useEffect(() => { try { localStorage.setItem('desireLoanChecks', JSON.stringify(loanChecks)); } catch {} }, [loanChecks]);

  // 데이터 리프레시
  useEffect(() => { if (selectedStage) setFinancialData(loadFinancialData()); }, [selectedStage]);

  // 6단계 자동 완료
  useEffect(() => {
    const allDone = [1, 2, 3, 4, 5].every((s) => completed[s]);
    if (allDone && !completed[6]) setCompleted((prev) => ({ ...prev, 6: true }));
  }, [completed]);

  const getCurrentStage = useCallback(() => {
    for (let i = 1; i <= 5; i++) { if (!completed[i]) return i; }
    return 6;
  }, [completed]);

  // 6단계만 잠금 (1~5 전부 완료해야 열림)
  const isLocked = useCallback((stage: number) => {
    if (stage === 6) return ![1, 2, 3, 4, 5].every((s) => completed[s]);
    return false;
  }, [completed]);

  const handleComplete = (stage: number) => {
    if (isLocked(stage)) return;
    setCompleted((prev) => ({ ...prev, [stage]: !prev[stage] }));
  };

  const handleAttachClick = (stage: number) => {
    if (stage === 6) { setShowCelebration(true); setTimeout(() => setShowCelebration(false), 4000); return; }
    setUploadingStage(stage);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || uploadingStage === null) return;
    const newUrls = files.map((f) => URL.createObjectURL(f));
    setAttachments((prev) => ({ ...prev, [uploadingStage]: [...(prev[uploadingStage] || []), ...newUrls] }));
    e.target.value = '';
  };

  const currentStage = getCurrentStage();
  const fd = financialData;

  const getStageData = (stageNum: number) => {
    switch (stageNum) {
      case 1: {
        const totalDebt = fd.creditLoans.reduce((s: number, l: any) => s + l.amount, 0);
        return { items: fd.creditLoans, total: totalDebt, passed: totalDebt === 0,
          summary: fd.creditLoans.length > 0 ? `신용대출 ${fd.creditLoans.length}건 · 총 ${(totalDebt / 10000).toLocaleString()}만원` : '신용대출 없음 ✓' };
      }
      case 2:
        return { target: fd.emergencyFund.target, current: fd.emergencyFund.current, passed: fd.emergencyFund.secured,
          summary: fd.emergencyFund.secured ? '비상예비자금 확보 완료 ✓' : `현재 ${(fd.emergencyFund.current / 10000).toLocaleString()}만원 / 목표 ${(fd.emergencyFund.target / 10000).toLocaleString()}만원` };
      case 3: {
        const sc = fd.savings.monthlySavingCurrent + fd.savings.monthlyPensionCurrent;
        const sb = fd.savings.monthlySavingBudget + fd.savings.monthlyPensionBudget;
        const byM = sc >= sb && sb > 0;
        const byI = fd.savings.irregularIncome >= (fd.savings.annualSavingBudget + fd.savings.annualPensionBudget) && (fd.savings.annualSavingBudget + fd.savings.annualPensionBudget) > 0;
        return { passed: byM || byI,
          summary: sc === 0 && sb === 0 ? '저축/연금 데이터를 입력해주세요' : byM ? '월 저축+연금이 예산 초과 ✓' : byI ? '비정기수입으로 연간예산 충족 ✓' : `현재 월 ${(sc / 10000).toLocaleString()}만원 / 예산 ${(sb / 10000).toLocaleString()}만원` };
      }
      case 4:
        return { passed: fd.financialAssets >= 1000000000,
          summary: fd.financialAssets === 0 ? '금융자산 데이터를 입력해주세요' : fd.financialAssets >= 1000000000 ? '금융자산 10억원 달성 ✓' : `현재 ${(fd.financialAssets / 100000000).toFixed(1)}억원 / 목표 10억원` };
      case 5: {
        const totalM = fd.mortgageLoans.reduce((s: number, l: any) => s + l.amount, 0);
        return { items: fd.mortgageLoans, total: totalM, passed: totalM === 0,
          summary: fd.mortgageLoans.length > 0 ? `담보대출 ${fd.mortgageLoans.length}건 · 총 ${(totalM / 100000000).toFixed(1)}억원` : '담보대출 없음 ✓' };
      }
      case 6:
        return { passed: [1, 2, 3, 4, 5].every((s) => completed[s]),
          summary: [1, 2, 3, 4, 5].every((s) => completed[s]) ? '🎉 경제적 자유 달성!' : '1~5단계를 모두 완료하세요' };
      default: return { passed: false, summary: '' };
    }
  };

  // ── 렌더링 ──
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#f8f9fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <ConfettiCanvas active={showCelebration} />
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" multiple style={{ display: 'none' }} onChange={handleFileChange} />

      {/* 이미지 미리보기 */}
      {previewImage && (
        <div onClick={() => setPreviewImage(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <img src={previewImage} alt="미리보기" style={{ maxWidth: '90%', maxHeight: '85vh', borderRadius: 12 }} />
        </div>
      )}

      {/* ===== 목록 뷰 ===== */}
      {!selectedStage && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {/* 헤더 */}
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '16px 16px 28px', position: 'relative' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: 18, width: 36, height: 36, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>🗺️ 도전! DESIRE 로드맵</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' }}>6단계 재무 목표를 달성하세요</p>
            <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.2)', borderRadius: 10, height: 8 }}>
              <div style={{ width: `${(Object.values(completed).filter(Boolean).length / 6) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #fbbf24, #22c55e)', borderRadius: 10, transition: 'width 0.5s ease' }} />
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 6, textAlign: 'right' }}>{Object.values(completed).filter(Boolean).length}/6 완료</p>
          </div>

          {/* 데이터 없음 안내 */}
          {(!fd.hasBasicData || !fd.hasDesignData) && (
            <div style={{ margin: '12px 16px 0', padding: '14px 16px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: 14, border: '1px solid #fbbf24', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', margin: '0 0 4px' }}>금융집짓기 데이터가 {!fd.hasBasicData && !fd.hasDesignData ? '없습니다' : '부분적입니다'}</p>
                <p style={{ fontSize: 11, color: '#a16207', margin: 0, lineHeight: 1.5 }}>
                  {!fd.hasBasicData && '1단계 재무정보를 먼저 입력해주세요. '}
                  {!fd.hasDesignData && '2단계 재무설계를 완료해주세요. '}
                  데이터 입력 후 로드맵이 자동 업데이트됩니다.
                </p>
              </div>
            </div>
          )}

          {/* 단계 카드 목록 */}
          <div style={{ padding: '16px 16px 100px' }}>
            {DESIRE_ROADMAP_STAGES.map((stage) => {
              const locked = isLocked(stage.stage);
              const done = completed[stage.stage];
              const isCurrent = currentStage === stage.stage && !done;
              const data = getStageData(stage.stage);
              return (
                <div key={stage.stage} onClick={() => { if (!locked) setSelectedStage(stage); }}
                  style={{ background: locked ? '#f3f4f6' : done ? '#f0fdf4' : 'white', borderRadius: 16, padding: 16, marginBottom: 12,
                    border: `2px solid ${done ? '#86efac' : isCurrent ? '#6366f1' : '#e5e7eb'}`,
                    cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.5 : 1, transition: 'all 0.2s', position: 'relative' }}>
                  {locked && <div style={{ position: 'absolute', top: 12, right: 14, fontSize: 20, opacity: 0.5 }}>🔒</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: locked ? '#e5e7eb' : stage.bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>{stage.house}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: locked ? '#9ca3af' : stage.color }}>{stage.stage}단계</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: locked ? '#9ca3af' : '#1f2937' }}>{stage.name}</span>
                        {done && <span style={{ color: '#22c55e', fontSize: 16 }}>✓</span>}
                      </div>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{stage.fullName}</p>
                      {!locked && <p style={{ fontSize: 11, margin: '4px 0 0', color: data.passed || done ? '#16a34a' : '#9ca3af', fontWeight: 600 }}>{data.summary}</p>}
                    </div>
                  </div>
                  {isCurrent && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: 'white', borderRadius: 10, border: '1px solid #e0e7ff' }}>
                      <p style={{ fontSize: 12, color: '#4f46e5', fontWeight: 700, margin: 0 }}>🎯 현재 진행 중!</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== 상세 뷰 ===== */}
      {selectedStage && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSelectedStage(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: 18, width: 36, height: 36, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>{selectedStage.stage}단계 · {selectedStage.name}</h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '2px 0 0' }}>{selectedStage.fullName}</p>
            </div>
          </div>

          <div style={{ padding: '20px 16px 100px' }}>
            {/* 상태 카드 */}
            <div style={{ background: selectedStage.bgGradient, borderRadius: 20, padding: '24px 20px', textAlign: 'center', marginBottom: 20, border: `2px solid ${selectedStage.borderColor}` }}>
              <span style={{ fontSize: 56 }}>{selectedStage.house}</span>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: selectedStage.color, margin: '8px 0 4px' }}>{selectedStage.name}</h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{selectedStage.description}</p>
              <div style={{ marginTop: 14, padding: '10px 16px', background: 'rgba(255,255,255,0.7)', borderRadius: 12 }}>
                <p style={{ fontSize: 12, color: '#374151', fontWeight: 600, margin: 0 }}>📊 {getStageData(selectedStage.stage).summary}</p>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: '4px 0 0' }}>데이터 출처: {selectedStage.dataSource}</p>
              </div>
            </div>

            {/* 1단계: 신용대출 목록 */}
            {selectedStage.stage === 1 && (
              <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', margin: '0 0 12px' }}>💳 신용대출 현황</p>
                {fd.creditLoans.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <span style={{ fontSize: 36 }}>🎉</span>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', margin: '8px 0 4px' }}>신용대출이 없습니다!</p>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>이미 1단계를 달성한 상태입니다</p>
                  </div>
                ) : (
                  <>
                    {[...fd.creditLoans].sort((a: any, b: any) => b.rate - a.rate).map((loan: any) => (
                      <div key={loan.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', margin: 0 }}>{loan.name}</p>
                          <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>금리 {loan.rate}%</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>{(loan.amount / 10000).toLocaleString()}만원</span>
                          <button onClick={(e) => { e.stopPropagation(); setLoanChecks((prev) => ({ ...prev, [`credit_${loan.id}`]: !prev[`credit_${loan.id}`] })); }}
                            style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${loanChecks[`credit_${loan.id}`] ? '#22c55e' : '#d1d5db'}`, background: loanChecks[`credit_${loan.id}`] ? '#22c55e' : 'white', color: 'white', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {loanChecks[`credit_${loan.id}`] ? '✓' : ''}
                          </button>
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef2f2', borderRadius: 10 }}>
                      <p style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, margin: 0 }}>💡 고금리 대출부터 상환하는 것이 이자 비용을 줄이는 최선의 방법입니다</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 2단계: 비상예비자금 */}
            {selectedStage.stage === 2 && (
              <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', margin: '0 0 12px' }}>🏦 비상예비자금 현황</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>현재</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ea580c' }}>{(fd.emergencyFund.current / 10000).toLocaleString()}만원</span>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: 8, height: 12, marginBottom: 8 }}>
                  <div style={{ width: `${Math.min(100, fd.emergencyFund.target > 0 ? (fd.emergencyFund.current / fd.emergencyFund.target) * 100 : 0)}%`, height: '100%', background: 'linear-gradient(90deg, #fb923c, #f97316)', borderRadius: 8, transition: 'width 0.5s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>0원</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>목표 {(fd.emergencyFund.target / 10000).toLocaleString()}만원</span>
                </div>
                <div style={{ marginTop: 12, padding: '8px 12px', background: '#fff7ed', borderRadius: 10 }}>
                  <p style={{ fontSize: 11, color: '#ea580c', fontWeight: 600, margin: 0 }}>💡 비상예비자금은 월소득의 3~6개월분을 권장합니다</p>
                </div>
              </div>
            )}

            {/* 3단계: 저축 현황 */}
            {selectedStage.stage === 3 && (
              <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', margin: '0 0 12px' }}>💰 월 저축·연금 현황</p>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1, background: '#fefce8', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: '#a16207', margin: '0 0 4px', fontWeight: 600 }}>월 저축투자</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#ca8a04', margin: 0 }}>{(fd.savings.monthlySavingCurrent / 10000).toLocaleString()}만</p>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0' }}>예산 {(fd.savings.monthlySavingBudget / 10000).toLocaleString()}만</p>
                  </div>
                  <div style={{ flex: 1, background: '#f0fdf4', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: '#15803d', margin: '0 0 4px', fontWeight: 600 }}>월 노후연금</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#16a34a', margin: 0 }}>{(fd.savings.monthlyPensionCurrent / 10000).toLocaleString()}만</p>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0' }}>예산 {(fd.savings.monthlyPensionBudget / 10000).toLocaleString()}만</p>
                  </div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: '#6b7280', margin: '0 0 2px' }}>비정기수입 (연간)</p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#2563eb', margin: 0 }}>{(fd.savings.irregularIncome / 10000).toLocaleString()}만원</p>
                </div>
              </div>
            )}

            {/* 4단계: 금융자산 게이지 */}
            {selectedStage.stage === 4 && (
              <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', margin: '0 0 12px' }}>📊 금융자산 현황</p>
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#2563eb' }}>{(fd.financialAssets / 100000000).toFixed(1)}</span>
                  <span style={{ fontSize: 16, color: '#6b7280' }}>억원</span>
                  <span style={{ fontSize: 14, color: '#9ca3af' }}> / 10억원</span>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: 8, height: 14 }}>
                  <div style={{ width: `${Math.min(100, (fd.financialAssets / 1000000000) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #2563eb)', borderRadius: 8 }} />
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 4 }}>{((fd.financialAssets / 1000000000) * 100).toFixed(0)}% 달성</p>
              </div>
            )}

            {/* 5단계: 담보대출 */}
            {selectedStage.stage === 5 && (
              <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', margin: '0 0 12px' }}>🏦 담보대출 현황</p>
                {fd.mortgageLoans.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <span style={{ fontSize: 36 }}>🎉</span>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', margin: '8px 0 4px' }}>담보대출이 없습니다!</p>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>이미 5단계를 달성한 상태입니다</p>
                  </div>
                ) : (
                  fd.mortgageLoans.map((loan: any) => (
                    <div key={loan.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', margin: 0 }}>{loan.name}</p>
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>금리 {loan.rate}%</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed' }}>{(loan.amount / 100000000).toFixed(1)}억원</span>
                        <button onClick={(e) => { e.stopPropagation(); setLoanChecks((prev) => ({ ...prev, [`mortgage_${loan.id}`]: !prev[`mortgage_${loan.id}`] })); }}
                          style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${loanChecks[`mortgage_${loan.id}`] ? '#22c55e' : '#d1d5db'}`, background: loanChecks[`mortgage_${loan.id}`] ? '#22c55e' : 'white', color: 'white', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {loanChecks[`mortgage_${loan.id}`] ? '✓' : ''}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 6단계: 축하 + 선물 */}
            {selectedStage.stage === 6 && (
              <div style={{ position: 'relative' }}>
                <ConfettiCanvas active={showCelebration} />
                <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: 20, padding: '32px 24px', textAlign: 'center', marginBottom: 20, border: '2px solid #fbbf24' }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🎉🏰🎉</div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: '#92400e', margin: '0 0 10px' }}>축하드립니다!</h3>
                  <p style={{ fontSize: 14, color: '#a16207', margin: 0, lineHeight: 1.8 }}>DESIRE 6단계를 모두 완료하셨습니다!<br/>초가집에서 시작한 당신의 금융 여정이<br/>마침내 <strong>고급주택</strong>에 도달했습니다!</p>
                </div>
                <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', margin: '0 0 14px', textAlign: 'center' }}>🏠 나의 금융집 성장 여정</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                    {[{ h: '🏚️', n: '초가집' }, { h: '🏡', n: '나무집' }, { h: '🏠', n: '벽돌집' }, { h: '🏢', n: '콘크리트' }, { h: '🏛️', n: '대리석' }, { h: '🏰', n: '고급주택' }].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: 28, display: 'block' }}>{item.h}</span>
                          <span style={{ fontSize: 9, color: '#6b7280' }}>{item.n}</span>
                        </div>
                        {i < 5 && <span style={{ fontSize: 14, color: '#d1d5db', margin: '0 2px' }}>→</span>}
                      </div>
                    ))}
                  </div>
                </div>
                {/* 달성 요약 */}
                <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', margin: '0 0 12px' }}>✅ 달성 현황</p>
                  {DESIRE_ROADMAP_STAGES.slice(0, 5).map((s) => (
                    <div key={s.stage} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: s.stage < 5 ? '1px solid #f3f4f6' : 'none' }}>
                      <span style={{ fontSize: 20 }}>{s.house}</span>
                      <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{s.stage}단계 {s.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: completed[s.stage] ? '#16a34a' : '#d1d5db' }}>{completed[s.stage] ? '✓ 완료' : '미완료'}</span>
                    </div>
                  ))}
                </div>
                {/* 선물 열기 */}
                {!giftOpened ? (
                  <button onClick={() => { setGiftOpened(true); setShowCelebration(true); setTimeout(() => setShowCelebration(false), 5000); }}
                    style={{ width: '100%', padding: '20px 0', border: 'none', borderRadius: 18, fontSize: 18, fontWeight: 800, cursor: 'pointer', color: 'white', background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 6px 20px rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28 }}>🎁</span> 선물 열기
                  </button>
                ) : (
                  <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', borderRadius: 18, padding: '24px 20px', textAlign: 'center', border: '2px solid #86efac' }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
                    <h4 style={{ fontSize: 18, fontWeight: 800, color: '#065f46', margin: '0 0 8px' }}>경제적 자유 달성 인증!</h4>
                    <p style={{ fontSize: 13, color: '#047857', margin: '0 0 4px', lineHeight: 1.6 }}>당신은 DESIRE 6단계를 모두 완료한<br/><strong>금융집짓기® 마스터</strong>입니다!</p>
                    <p style={{ fontSize: 11, color: '#6b7280', margin: '8px 0 0' }}>이 업적은 마이페이지 뱃지에 기록됩니다 🏅</p>
                  </div>
                )}
              </div>
            )}

            {/* 인증 첨부 (1~5단계) */}
            {selectedStage.stage <= 5 && (
              <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', margin: '0 0 8px' }}>📎 인증 첨부</p>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px' }}>{selectedStage.certGuide}</p>
                {(attachments[selectedStage.stage] || []).length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {attachments[selectedStage.stage].map((url: string, i: number) => (
                      <div key={i} onClick={() => setPreviewImage(url)} style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', border: '2px solid #e5e7eb' }}>
                        <img src={url} alt={`인증 ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => handleAttachClick(selectedStage.stage)}
                  style={{ width: '100%', padding: '14px 0', border: '2px dashed #d1d5db', borderRadius: 14, background: '#fafafa', color: '#6b7280', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  📷 인증샷 첨부하기
                </button>
              </div>
            )}

            {/* 완료 체크 버튼 (1~5단계) */}
            {selectedStage.stage <= 5 && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => handleComplete(selectedStage.stage)}
                  style={{ flex: 1, padding: '16px 0', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', color: 'white',
                    background: completed[selectedStage.stage] ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 4px 12px rgba(99,102,241,0.3)', transition: 'all 0.2s' }}>
                  {completed[selectedStage.stage] ? '✓ 완료됨' : '완료 체크 ✓'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 빵빠레 축하 오버레이 */}
      {showCelebration && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ background: 'white', borderRadius: 28, padding: '40px 32px', textAlign: 'center', maxWidth: 320, width: '90%', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 72, marginBottom: 12 }}>🎊🏆🎊</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1f2937', margin: '0 0 8px' }}>경제적 자유 달성!</h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px', lineHeight: 1.6 }}>DESIRE 6단계를 모두 완료했습니다!<br/>당신의 금융집이 완성되었어요! 🏰</p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20, fontSize: 28 }}>
              <span>🏚️</span><span>→</span><span>🏡</span><span>→</span><span>🏠</span><span>→</span><span>🏢</span><span>→</span><span>🏛️</span><span>→</span><span>🏰</span>
            </div>
            <button onClick={() => setShowCelebration(false)}
              style={{ padding: '14px 48px', border: 'none', borderRadius: 14, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}>
              감사합니다! 🙏
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ★★★ v2.4: DESIRE 로드맵 실제 데이터 연동 (끝) ★★★
// ═══════════════════════════════════════════════════════════════

interface MyPageProps {
  userName: string;
  userEmail: string;
  userPhoto: string | null;
  financialResult: FinancialResult | null;
  onNavigate: (page: 'subscription' | 'consulting' | 'monthly-report' | 'online-course') => void;
  onLogout: () => void;
  onReset: () => void;
}

export default function MyPage({
  userName,
  userEmail,
  userPhoto: _userPhoto,
  financialResult: _financialResult,
  onNavigate,
  onLogout,
  onReset
}: MyPageProps) {
  // 모달 상태
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

  // 프로필 편집 상태
  const [editName, setEditName] = useState(userName);
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState(userEmail);

  // 설정 상태
  const [pushNotification, setPushNotification] = useState(true);
  const [emailNotification, setEmailNotification] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // DESIRE 단계 상태
  const [desireStage, setDesireStage] = useState<number | null>(null);

  const [earnedBadges] = useState<string[]>(['streak7', 'firstSave', 'analyst']);

  const [growthData] = useState({
    attendanceDays: 27,
    totalDays: 30,
    budgetAchieveDays: 23,
    monthlySavings: 127000,
  });

  // 금융집짓기 DESIRE 단계 데이터 로드
  useEffect(() => {
    const loadDesireStage = () => {
      try {
        const savedData = localStorage.getItem('financialHouseData');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.desireStage && parsed.desireStage.stage) {
            setDesireStage(parsed.desireStage.stage);
          }
        }
      } catch (error) {
        console.error('DESIRE 단계 로드 오류:', error);
      }
    };
    loadDesireStage();
  }, []);

  const currentStageInfo = desireStage ? DESIRE_STAGES[desireStage - 1] : null;

  const handleInquiry = () => {
    window.location.href = 'mailto:ggorilla11@gmail.com?subject=[AI머니야] 1:1 문의&body=문의 내용을 작성해주세요.';
  };

  const handleResetClick = () => setShowResetConfirm(true);
  const handleResetConfirm = () => { setShowResetConfirm(false); onReset(); };
  const handleResetCancel = () => setShowResetConfirm(false);

  const handleProfileSave = () => {
    alert('개인정보가 저장되었습니다.');
    setShowProfileEdit(false);
  };

  const handleWithdrawConfirm = () => {
    alert('회원 탈퇴가 완료되었습니다.');
    setShowWithdraw(false);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 프로필 영역 */}
      <div className="bg-white p-5 border-b border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <img src={LOGO_URL} alt="AI머니야 로고" className="w-14 h-14" />
              <div>
                <p className="font-extrabold text-lg text-gray-900">{userName}님</p>
                <p className="text-sm text-gray-500">{userEmail}</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl self-start">
              <span className="text-base">👑</span>
              <span className="text-sm font-bold text-purple-600">프리미엄급 이용 중</span>
              <span className="text-xs text-gray-500 ml-1">무료체험</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-32">
            {currentStageInfo ? (
              <>
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${currentStageInfo.bgColor} flex flex-col items-center justify-center shadow-md border border-gray-100`}>
                  <span className="text-base mb-0.5">{currentStageInfo.weather}</span>
                  <span className="text-4xl">{currentStageInfo.house}</span>
                  <span className="text-[10px] text-gray-600 font-semibold mt-0.5">{currentStageInfo.houseName}</span>
                </div>
                <div className="w-full mt-2">
                  <div className="flex items-center justify-center gap-1 mb-1.5">
                    <span className={`text-xs font-bold ${currentStageInfo.color}`}>DESIRE</span>
                    <span className="text-xs text-gray-600 font-semibold">{desireStage}단계</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                      <div key={step} className={`h-2 flex-1 rounded-full ${step <= (desireStage || 0) ? step <= 2 ? 'bg-red-400' : step <= 4 ? 'bg-yellow-400' : 'bg-emerald-400' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                      <span key={step} className={`text-[9px] ${step === desireStage ? 'font-bold text-gray-700' : 'text-gray-400'}`}>{toRoman(step)}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                <span className="text-3xl mb-1">🏠</span>
                <span className="text-[10px] text-gray-500 text-center font-medium px-2">재무설계<br/>필요</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 오상열 대표 배너 */}
      <div className="mx-4 mt-4">
        <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-4 flex gap-4 items-center cursor-pointer" onClick={() => onNavigate('consulting')}>
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
            <img src={PROFILE_IMAGE_URL} alt="오상열 대표" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-extrabold text-gray-900">오상열 대표</h3>
              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">CFP</span>
            </div>
            <p className="text-xs text-yellow-700 font-bold mb-1">금융집짓기® 창시자 · 20년 경력</p>
            <p className="text-xs text-gray-600">전문가 1:1 재무상담 받아보세요 →</p>
          </div>
        </div>
      </div>

      {/* 획득한 뱃지 */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">🏆 획득한 뱃지</h3>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
            {ALL_BADGES.map((badge) => {
              const isEarned = earnedBadges.includes(badge.id);
              return (
                <div key={badge.id} className="flex flex-col items-center gap-1.5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${isEarned ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-md' : 'bg-gray-100 opacity-40'}`}>
                    {isEarned ? badge.emoji : '🔒'}
                  </div>
                  <span className={`text-[10px] font-medium whitespace-nowrap ${isEarned ? 'text-gray-700' : 'text-gray-400'}`}>{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 성장 기록 */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">📈 성장 기록</h3>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">출석</span>
            <span className={`text-sm font-bold ${growthData.attendanceDays >= 25 ? 'text-green-600' : 'text-red-500'}`}>
              {growthData.attendanceDays}/{growthData.totalDays}일 {growthData.attendanceDays >= 25 ? '🔥' : '😢'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">예산 달성</span>
            <span className={`text-sm font-bold ${growthData.budgetAchieveDays >= 20 ? 'text-green-600' : 'text-red-500'}`}>
              {growthData.budgetAchieveDays}일 {growthData.budgetAchieveDays >= 20 ? '✅' : '⚠️'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">이번 달 절약</span>
            <span className={`text-sm font-bold ${growthData.monthlySavings >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {growthData.monthlySavings >= 0 ? '+' : ''}{growthData.monthlySavings.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
        <button onClick={() => onNavigate('subscription')} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-base">⭐</div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">유료 구독</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        <button onClick={() => onNavigate('consulting')} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-base">👨‍🏫</div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-gray-900">오상열 대표 강의·상담 신청</span>
            <p className="text-[10px] text-gray-400">일반인 상담 / 재테크 강의 / FP 과정</p>
          </div>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        <button onClick={() => onNavigate('monthly-report')} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-base">📊</div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">월간 리포트</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        <button onClick={() => window.open('https://www.fss.or.kr/fss/ntcn/fncsusvPrMng/view.do?dataSlno=78&dataTrgtCode=02&menuNo=200266', '_blank')} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-base">🎬</div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">금융감독원 전문가 강의영상</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* ★★★ v2.4: DESIRE 로드맵 → 전체화면 모달로 변경 ★★★ */}
        <button onClick={() => setShowDesireRoadmap(true)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center text-base">🗺️</div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-gray-900">도전! DESIRE 로드맵</span>
            <p className="text-[10px] text-gray-400">6단계 재무 목표 달성 여정</p>
          </div>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        <button onClick={() => setShowOnlineCourse(true)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center text-base">🎓</div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-gray-900">온라인강좌 107강 신청</span>
            <p className="text-[10px] text-gray-400">월 29,000원 / 연간 290,000원</p>
          </div>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        <button onClick={() => setShowEbook(true)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-base">📚</div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-gray-900">금융집짓기 V2.0 전자책</span>
            <p className="text-[10px] text-gray-400">사전신청 9,900원 (정가 12,900원)</p>
          </div>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        <button onClick={() => setShowProfileEdit(true)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-base">👤</div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">개인정보 관리</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        <button onClick={handleInquiry} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-base">💬</div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-gray-900">1:1 문의</span>
            <p className="text-[10px] text-gray-400">ggorilla11@gmail.com</p>
          </div>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        <button onClick={() => setShowShare(true)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-base">🔗</div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-gray-900">친구에게 공유하기</span>
            <p className="text-[10px] text-gray-400">카톡, 문자, 이메일로 AI머니야 공유</p>
          </div>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-base">⚙️</div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">설정</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>
      </div>

      {/* 기타 메뉴 */}
      <div className="mx-4 mt-4 space-y-1">
        <button onClick={() => setShowFAQ(true)} className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700">❓ 고객센터 / FAQ</button>
        <button onClick={() => setShowTerms(true)} className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700">📄 이용약관</button>
        <button onClick={() => setShowPrivacy(true)} className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700">🔒 개인정보처리방침</button>
        <div className="border-t border-gray-200 my-2"></div>
        <button onClick={handleResetClick} className="w-full text-left py-2.5 text-sm text-blue-500 hover:text-blue-700 font-medium">🔄 처음부터 다시하기</button>
        <button onClick={onLogout} className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700">🚪 로그아웃</button>
        <button onClick={() => setShowWithdraw(true)} className="w-full text-left py-2.5 text-sm text-red-500 hover:text-red-700">⚠️ 회원탈퇴</button>
        <p className="text-center text-xs text-gray-400 py-4">앱 버전 v2.4.0</p>
      </div>

      {/* ========== 모달들 ========== */}

      {/* 처음부터 다시하기 */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">처음부터 다시하기</h3>
            <p className="text-sm text-gray-500 mb-6">모든 데이터가 초기화됩니다.<br/>정말 처음부터 다시 시작하시겠습니까?</p>
            <div className="flex gap-3">
              <button onClick={handleResetCancel} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">취소</button>
              <button onClick={handleResetConfirm} className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl">확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보 관리 */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">개인정보 관리</h3>
              <button onClick={() => setShowProfileEdit(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">이름</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">전화번호</label>
                <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="010-0000-0000" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">이메일</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button onClick={handleProfileSave} className="w-full mt-6 py-3 bg-blue-500 text-white font-bold rounded-xl">저장</button>
          </div>
        </div>
      )}

      {/* 설정 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">설정</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-gray-700">푸시 알림</span>
                <button onClick={() => setPushNotification(!pushNotification)} className={`w-12 h-6 rounded-full transition-colors ${pushNotification ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${pushNotification ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-gray-700">이메일 알림</span>
                <button onClick={() => setEmailNotification(!emailNotification)} className={`w-12 h-6 rounded-full transition-colors ${emailNotification ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${emailNotification ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-700">다크 모드</span>
                <button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      {showFAQ && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">고객센터 / FAQ</h3>
              <button onClick={() => setShowFAQ(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="p-4 bg-blue-50 border-b">
              <p className="text-sm font-bold text-blue-700">📞 오원트금융연구소</p>
              <p className="text-sm text-blue-600 mt-1">010-5424-5332</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <h4 className="text-sm font-bold text-gray-700 mb-3">자주 묻는 질문</h4>
              <div className="space-y-3">
                {FAQ_DATA.map((faq, idx) => (
                  <details key={idx} className="bg-gray-50 rounded-xl p-3">
                    <summary className="text-sm font-semibold text-gray-800 cursor-pointer">Q. {faq.q}</summary>
                    <p className="text-sm text-gray-600 mt-2 pl-4">A. {faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 이용약관 */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">이용약관</h3>
              <button onClick={() => setShowTerms(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-sm text-gray-600 leading-relaxed">
              <h4 className="font-bold text-gray-800 mb-2">제1조 (목적)</h4>
              <p className="mb-4">이 약관은 오원트금융연구소(이하 "회사")가 제공하는 AI머니야 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
              <h4 className="font-bold text-gray-800 mb-2">제2조 (정의)</h4>
              <p className="mb-4">① "서비스"란 회사가 제공하는 AI 기반 재무관리 및 상담 서비스를 의미합니다.<br/>② "이용자"란 이 약관에 따라 서비스를 이용하는 자를 말합니다.</p>
              <h4 className="font-bold text-gray-800 mb-2">제3조 (약관의 효력)</h4>
              <p className="mb-4">① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.<br/>② 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.</p>
              <p className="text-xs text-gray-400 mt-4">시행일: 2026년 1월 1일</p>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보처리방침 */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">개인정보처리방침</h3>
              <button onClick={() => setShowPrivacy(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-sm text-gray-600 leading-relaxed">
              <h4 className="font-bold text-gray-800 mb-2">1. 개인정보의 수집 및 이용 목적</h4>
              <p className="mb-4">회사는 다음의 목적을 위하여 개인정보를 처리합니다:<br/>- 서비스 제공 및 계약의 이행<br/>- 회원 관리 및 본인 확인<br/>- 마케팅 및 광고에 활용</p>
              <h4 className="font-bold text-gray-800 mb-2">2. 수집하는 개인정보의 항목</h4>
              <p className="mb-4">- 필수항목: 이름, 이메일, 휴대전화번호<br/>- 선택항목: 생년월일, 성별, 직업</p>
              <h4 className="font-bold text-gray-800 mb-2">3. 개인정보의 보유 및 이용 기간</h4>
              <p className="mb-4">회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다. 단, 관계 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
              <p className="text-xs text-gray-400 mt-4">시행일: 2026년 1월 1일</p>
            </div>
          </div>
        </div>
      )}

      {/* 회원탈퇴 */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">회원 탈퇴</h3>
            <div className="bg-red-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-700 font-semibold mb-2">⚠️ 탈퇴 전 확인해주세요</p>
              <ul className="text-xs text-red-600 space-y-1">
                <li>• 모든 개인정보 및 이용 기록이 삭제됩니다</li>
                <li>• 유료 구독 중인 경우 환불 정책에 따라 처리됩니다</li>
                <li>• 삭제된 데이터는 복구할 수 없습니다</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-600 font-semibold mb-2">📋 환불 정책 (실리콘밸리 기준)</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 결제 후 7일 이내: 전액 환불</li>
                <li>• 결제 후 7-14일: 50% 환불</li>
                <li>• 결제 후 14일 이후: 환불 불가</li>
                <li>• 월 구독: 당월 잔여 기간 이용 가능</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowWithdraw(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">취소</button>
              <button onClick={handleWithdrawConfirm} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl">탈퇴하기</button>
            </div>
          </div>
        </div>
      )}

      {/* ★★★ v2.4: DESIRE 로드맵 전체화면 모달 (실제 데이터 연동) ★★★ */}
      {showDesireRoadmap && (
        <DesireRoadmapModal onClose={() => setShowDesireRoadmap(false)} />
      )}

      {/* 온라인강좌 */}
      {showOnlineCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">🎓 온라인강좌 109강</h3>
              <button onClick={() => setShowOnlineCourse(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="p-4">
              <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-4 mb-4">
                <h4 className="font-bold text-gray-800 mb-2">금융집짓기® 완전정복</h4>
                <p className="text-sm text-gray-600 mb-3">오상열 CFP의 20년 노하우를 109강에 담았습니다</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>✓ DESIRE 6단계 완벽 해설</li>
                  <li>✓ 실전 재무설계 사례</li>
                  <li>✓ AI머니야 스탠다드 이용권 제공</li>
                </ul>
              </div>
              <div className="space-y-3">
                <button onClick={() => { setShowOnlineCourse(false); onNavigate('online-course'); }} className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl">📺 강좌 보러가기</button>
                <button className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-xl">월 29,000원 신청하기</button>
                <button className="w-full py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold rounded-xl">연간 290,000원 신청하기<span className="block text-xs opacity-80 mt-1">2개월 무료!</span></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 전자책 */}
      {showEbook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">📚 금융집짓기 V2.0 전자책</h3>
              <button onClick={() => setShowEbook(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <img src={EBOOK_COVER_URL} alt="전자책 표지" className="w-full h-48 object-cover rounded-xl opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-500 text-white px-4 py-2 rounded-lg transform -rotate-12 shadow-lg"><span className="font-bold">발매예정</span></div>
                </div>
              </div>
              <div className="text-center mb-4">
                <p className="text-gray-400 line-through">정가 12,900원</p>
                <p className="text-2xl font-bold text-orange-500">사전신청 9,900원</p>
                <p className="text-xs text-gray-500 mt-1">출간 즉시 이메일로 발송됩니다</p>
              </div>
              <button className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl">사전신청 9,900원</button>
            </div>
          </div>
        </div>
      )}

      {/* 공유하기 */}
      {showShare && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">🔗 친구에게 공유하기</h3>
              <button onClick={() => setShowShare(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-center gap-4 mb-4">
                <img src="https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a" alt="AI머니야 로고" className="w-20 h-20" />
                <img src="https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/QR%EC%BD%94%EB%93%9C.png?alt=media&token=032255d4-cce8-4672-9a83-580c70e920f7" alt="QR코드" className="w-24 h-24 border border-gray-200 rounded-xl" />
              </div>
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">공유 링크</p>
                <div className="flex items-center gap-2">
                  <input type="text" value={SHARE_URL} readOnly className="flex-1 text-sm text-gray-700 bg-transparent outline-none" />
                  <button onClick={() => { navigator.clipboard.writeText(SHARE_URL); alert('링크가 복사되었습니다!'); }} className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg">복사</button>
                </div>
              </div>
              <div className="space-y-2">
                <button onClick={() => { const text = `💰 AI머니야 - AI 기반 재무관리 앱\n금융집짓기® 방법론으로 체계적인 재무설계를 시작하세요!\n\n👉 ${SHARE_URL}`; window.open(`https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent(text)}`, '_blank', 'width=500,height=600'); }} className="w-full py-3.5 bg-[#FEE500] text-[#3C1E1E] font-bold rounded-xl flex items-center justify-center gap-2"><span className="text-xl">💬</span> 카카오톡으로 공유</button>
                <button onClick={() => { const text = `💰 AI머니야 - AI 기반 재무관리 앱\n금융집짓기® 방법론으로 체계적인 재무설계를 시작하세요!\n\n👉 ${SHARE_URL}`; window.location.href = `sms:?body=${encodeURIComponent(text)}`; }} className="w-full py-3.5 bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"><span className="text-xl">💬</span> 문자로 공유</button>
                <button onClick={() => { const subject = '[추천] AI머니야 - AI 기반 재무관리 앱'; const body = `안녕하세요!\n\nAI머니야를 추천드립니다.\n금융집짓기® 방법론으로 체계적인 재무설계를 시작하세요!\n\n👉 ${SHARE_URL}\n\nQR코드로도 접속 가능합니다.`; window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; }} className="w-full py-3.5 bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"><span className="text-xl">📧</span> 이메일로 공유</button>
                <button onClick={async () => { if (navigator.share) { try { await navigator.share({ title: 'AI머니야 - AI 기반 재무관리 앱', text: '금융집짓기® 방법론으로 체계적인 재무설계를 시작하세요!', url: SHARE_URL }); } catch {} } else { alert('이 브라우저에서는 공유 기능을 지원하지 않습니다.'); } }} className="w-full py-3.5 bg-gray-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"><span className="text-xl">📤</span> 다른 앱으로 공유</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
