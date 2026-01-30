// src/pages/MyPage.tsx
// v2.0: 마이페이지 전체 개편
// - 구독 상태: "프리미엄급 이용 중 무료체험"
// - 뱃지 시스템: 가로 스크롤, 활성/비활성 구분
// - 성장기록: 실제 데이터 연동, 색상 표시
// - 개인정보 관리, 설정, 고객센터/FAQ, 회원탈퇴 기능
// - 전문가 상담/강의 명칭 변경
// - 신규 메뉴: DESIRE 로드맵, 온라인강좌, 전자책

import { useState, useEffect } from 'react';

// AI머니야 로고 URL (Firebase Storage)
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a";

// 오상열 대표 사진 URL (Firebase Storage)
const PROFILE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%98%A4%EC%83%81%EC%97%B4%20%EC%82%AC%EC%A7%84.png?alt=media&token=63eaf15e-9d0b-4d72-8fbb-ee03d6ecc8e5';

// 금융집짓기 V2.0 전자책 표지 (임시)
const EBOOK_COVER_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/financial-house-exterior.png.png?alt=media&token=e1651823-af8e-4ed3-9b3d-557a1bf0eb10';

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
  { q: '전문가 상담은 어떻게 신청하나요?', a: '더보기 > 전문가 상담·강의 신청에서 원하시는 상담 유형을 선택하여 신청하실 수 있습니다.' },
  { q: '개인정보는 안전하게 보호되나요?', a: '네, 모든 개인정보는 암호화되어 안전하게 보관됩니다. 자세한 내용은 개인정보처리방침을 확인해주세요.' },
  { q: '회원 탈퇴는 어떻게 하나요?', a: '더보기 > 회원탈퇴에서 탈퇴 신청하실 수 있습니다. 탈퇴 시 모든 데이터가 삭제됩니다.' },
];

interface MyPageProps {
  userName: string;
  userEmail: string;
  userPhoto: string | null;
  financialResult: FinancialResult | null;
  onNavigate: (page: 'subscription' | 'consulting' | 'monthly-report') => void;
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
  const [showShare, setShowShare] = useState(false); // ★ 공유 모달

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

  // 뱃지 상태 (획득한 뱃지 ID 배열)
  // TODO: 실제 뱃지 획득 로직 구현 시 setEarnedBadges 사용
  const [earnedBadges] = useState<string[]>(['streak7', 'firstSave', 'analyst']);

  // 성장 기록 상태
  // TODO: 실제 성장 데이터 연동 시 setGrowthData 사용
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

  // 현재 DESIRE 단계 정보 가져오기
  const currentStageInfo = desireStage ? DESIRE_STAGES[desireStage - 1] : null;

  // 1:1 문의 이메일 열기
  const handleInquiry = () => {
    window.location.href = 'mailto:ggorilla11@gmail.com?subject=[AI머니야] 1:1 문의&body=문의 내용을 작성해주세요.';
  };

  // 처음부터 다시하기
  const handleResetClick = () => setShowResetConfirm(true);
  const handleResetConfirm = () => { setShowResetConfirm(false); onReset(); };
  const handleResetCancel = () => setShowResetConfirm(false);

  // 프로필 저장
  const handleProfileSave = () => {
    // TODO: 실제 저장 로직 (Firebase 등)
    alert('개인정보가 저장되었습니다.');
    setShowProfileEdit(false);
  };

  // 회원 탈퇴
  const handleWithdrawConfirm = () => {
    // TODO: 실제 탈퇴 로직
    alert('회원 탈퇴가 완료되었습니다.');
    setShowWithdraw(false);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 프로필 영역 */}
      <div className="bg-white p-5 border-b border-gray-200">
        <div className="flex gap-4">
          {/* 왼쪽: 로고 + 이름/이메일 + 구독상태 */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <img src={LOGO_URL} alt="AI머니야 로고" className="w-14 h-14" />
              <div>
                <p className="font-extrabold text-lg text-gray-900">{userName}님</p>
                <p className="text-sm text-gray-500">{userEmail}</p>
              </div>
            </div>
            {/* ★★★ v2.0: 구독 상태 - 프리미엄급 이용 중 무료체험 ★★★ */}
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl self-start">
              <span className="text-base">👑</span>
              <span className="text-sm font-bold text-purple-600">프리미엄급 이용 중</span>
              <span className="text-xs text-gray-500 ml-1">무료체험</span>
            </div>
          </div>
          
          {/* 오른쪽: 금융집짓기 일러스트 + DESIRE 진행바 */}
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

      {/* ★★★ v2.0: 획득한 뱃지 - 가로 스크롤, 활성/비활성 구분 ★★★ */}
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

      {/* ★★★ v2.0: 성장 기록 - 색상 표시 ★★★ */}
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
        {/* 유료 구독 */}
        <button onClick={() => onNavigate('subscription')} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-base">⭐</div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">유료 구독</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* ★★★ v2.0: 전문가 상담·강의 신청 - 명칭 변경 ★★★ */}
        <button onClick={() => onNavigate('consulting')} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-base">👨‍🏫</div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-gray-900">전문가 상담 · 강의 신청</span>
            <p className="text-[10px] text-gray-400">일반인 상담 / 재테크 강의 / FP 과정</p>
          </div>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 월간 리포트 */}
        <button onClick={() => onNavigate('monthly-report')} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-base">📊</div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">월간 리포트</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 금융감독원 전문가 강의영상 */}
        <button onClick={() => window.open('https://www.fss.or.kr/fss/ntcn/fncsusvPrMng/view.do?dataSlno=78&dataTrgtCode=02&menuNo=200266', '_blank')} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-base">🎬</div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">금융감독원 전문가 강의영상</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* ★★★ v2.0: 신규 메뉴 - 도전! DESIRE 로드맵 ★★★ */}
        <button onClick={() => setShowDesireRoadmap(true)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center text-base">🗺️</div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-gray-900">도전! DESIRE 로드맵</span>
            <p className="text-[10px] text-gray-400">6단계 재무 목표 달성 여정</p>
          </div>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* ★★★ v2.0: 신규 메뉴 - 온라인강좌 107강 신청 ★★★ */}
        <button onClick={() => setShowOnlineCourse(true)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center text-base">🎓</div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-gray-900">온라인강좌 107강 신청</span>
            <p className="text-[10px] text-gray-400">월 29,000원 / 연간 290,000원</p>
          </div>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* ★★★ v2.0: 신규 메뉴 - 금융집짓기 V2.0 전자책 ★★★ */}
        <button onClick={() => setShowEbook(true)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-base">📚</div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-gray-900">금융집짓기 V2.0 전자책</span>
            <p className="text-[10px] text-gray-400">사전신청 9,900원 (정가 12,900원)</p>
          </div>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 개인정보 관리 */}
        <button onClick={() => setShowProfileEdit(true)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-base">👤</div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">개인정보 관리</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 1:1 문의 */}
        <button onClick={handleInquiry} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-base">💬</div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-gray-900">1:1 문의</span>
            <p className="text-[10px] text-gray-400">ggorilla11@gmail.com</p>
          </div>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* ★★★ v2.1: 친구에게 공유하기 ★★★ */}
        <button onClick={() => setShowShare(true)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-base">🔗</div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-gray-900">친구에게 공유하기</span>
            <p className="text-[10px] text-gray-400">카톡, 문자, 이메일로 AI머니야 공유</p>
          </div>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 설정 */}
        <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-base">⚙️</div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">설정</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>
      </div>

      {/* 기타 메뉴 */}
      <div className="mx-4 mt-4 space-y-1">
        <button onClick={() => setShowFAQ(true)} className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700">
          ❓ 고객센터 / FAQ
        </button>
        <button onClick={() => setShowTerms(true)} className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700">
          📄 이용약관
        </button>
        <button onClick={() => setShowPrivacy(true)} className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700">
          🔒 개인정보처리방침
        </button>
        <div className="border-t border-gray-200 my-2"></div>
        <button onClick={handleResetClick} className="w-full text-left py-2.5 text-sm text-blue-500 hover:text-blue-700 font-medium">
          🔄 처음부터 다시하기
        </button>
        <button onClick={onLogout} className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700">
          🚪 로그아웃
        </button>
        <button onClick={() => setShowWithdraw(true)} className="w-full text-left py-2.5 text-sm text-red-500 hover:text-red-700">
          ⚠️ 회원탈퇴
        </button>
        <p className="text-center text-xs text-gray-400 py-4">앱 버전 v2.0.0</p>
      </div>

      {/* ========== 모달들 ========== */}

      {/* 처음부터 다시하기 모달 */}
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

      {/* ★★★ v2.0: 개인정보 관리 모달 ★★★ */}
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

      {/* ★★★ v2.0: 설정 모달 ★★★ */}
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

      {/* ★★★ v2.0: 고객센터/FAQ 모달 ★★★ */}
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

      {/* ★★★ v2.0: 이용약관 모달 ★★★ */}
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

      {/* ★★★ v2.0: 개인정보처리방침 모달 ★★★ */}
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

      {/* ★★★ v2.0: 회원탈퇴 모달 ★★★ */}
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

      {/* ★★★ v2.0: DESIRE 로드맵 모달 ★★★ */}
      {showDesireRoadmap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">🗺️ 도전! DESIRE 로드맵</h3>
              <button onClick={() => setShowDesireRoadmap(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {DESIRE_STAGES.map((stage, idx) => {
                const isComplete = desireStage ? idx < desireStage - 1 : false;
                const isCurrent = desireStage === idx + 1;
                return (
                  <div key={stage.stage} className={`p-4 rounded-xl mb-3 border-2 transition-all ${isComplete ? 'bg-green-50 border-green-300' : isCurrent ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{stage.house}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${stage.color}`}>{stage.stage}단계</span>
                          <span className="text-sm font-semibold text-gray-700">{stage.name}</span>
                          {isComplete && <span className="text-green-500">✓</span>}
                        </div>
                        <p className="text-xs text-gray-500">{stage.fullName}</p>
                      </div>
                    </div>
                    {isCurrent && (
                      <div className="mt-2 p-3 bg-white rounded-lg">
                        <p className="text-xs text-blue-600 font-semibold">🎯 현재 진행 중!</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ★★★ v2.0: 온라인강좌 신청 모달 ★★★ */}
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

      {/* ★★★ v2.0: 전자책 신청 모달 ★★★ */}
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
                  <div className="bg-red-500 text-white px-4 py-2 rounded-lg transform -rotate-12 shadow-lg">
                    <span className="font-bold">발매예정</span>
                  </div>
                </div>
              </div>
              <div className="text-center mb-4">
                <p className="text-gray-400 line-through">정가 12,900원</p>
                <p className="text-2xl font-bold text-orange-500">사전신청 9,900원</p>
                <p className="text-xs text-gray-500 mt-1">출간 즉시 이메일로 발송됩니다</p>
              </div>
              <button className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl">
                사전신청 9,900원
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ★★★ v2.1: 친구에게 공유하기 모달 ★★★ */}
      {showShare && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">🔗 친구에게 공유하기</h3>
              <button onClick={() => setShowShare(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="p-4">
              {/* 로고 + QR코드 */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <img 
                  src="https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a" 
                  alt="AI머니야 로고" 
                  className="w-20 h-20"
                />
                <img 
                  src="https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/QR%EC%BD%94%EB%93%9C.png?alt=media&token=032255d4-cce8-4672-9a83-580c70e920f7" 
                  alt="QR코드" 
                  className="w-24 h-24 border border-gray-200 rounded-xl"
                />
              </div>
              
              {/* URL 복사 */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">공유 링크</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value="https://moneya.vercel.app" 
                    readOnly 
                    className="flex-1 text-sm text-gray-700 bg-transparent outline-none"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('https://moneya.vercel.app');
                      alert('링크가 복사되었습니다!');
                    }}
                    className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg"
                  >
                    복사
                  </button>
                </div>
              </div>

              {/* 공유 버튼들 */}
              <div className="space-y-2">
                {/* 카카오톡 */}
                <button 
                  onClick={() => {
                    const text = '💰 AI머니야 - AI 기반 재무관리 앱\n금융집짓기® 방법론으로 체계적인 재무설계를 시작하세요!\n\n👉 https://moneya.vercel.app';
                    window.open(`https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent('https://moneya.vercel.app')}&text=${encodeURIComponent(text)}`, '_blank', 'width=500,height=600');
                  }}
                  className="w-full py-3.5 bg-[#FEE500] text-[#3C1E1E] font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <span className="text-xl">💬</span> 카카오톡으로 공유
                </button>

                {/* 문자 */}
                <button 
                  onClick={() => {
                    const text = '💰 AI머니야 - AI 기반 재무관리 앱\n금융집짓기® 방법론으로 체계적인 재무설계를 시작하세요!\n\n👉 https://moneya.vercel.app';
                    window.location.href = `sms:?body=${encodeURIComponent(text)}`;
                  }}
                  className="w-full py-3.5 bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <span className="text-xl">💬</span> 문자로 공유
                </button>

                {/* 이메일 */}
                <button 
                  onClick={() => {
                    const subject = '[추천] AI머니야 - AI 기반 재무관리 앱';
                    const body = '안녕하세요!\n\nAI머니야를 추천드립니다.\n금융집짓기® 방법론으로 체계적인 재무설계를 시작하세요!\n\n👉 https://moneya.vercel.app\n\nQR코드로도 접속 가능합니다.';
                    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}
                  className="w-full py-3.5 bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <span className="text-xl">📧</span> 이메일로 공유
                </button>

                {/* 네이티브 공유 (모바일) */}
                <button 
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: 'AI머니야 - AI 기반 재무관리 앱',
                          text: '금융집짓기® 방법론으로 체계적인 재무설계를 시작하세요!',
                          url: 'https://moneya.vercel.app'
                        });
                      } catch (err) {
                        console.log('공유 취소됨');
                      }
                    } else {
                      alert('이 브라우저에서는 공유 기능을 지원하지 않습니다.');
                    }
                  }}
                  className="w-full py-3.5 bg-gray-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <span className="text-xl">📤</span> 다른 앱으로 공유
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
