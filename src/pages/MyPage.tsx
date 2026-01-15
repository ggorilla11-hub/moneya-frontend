// MyPage.tsx
// 마이페이지 메인 - 베이스캠프 5.0
// DESIRE 단계 + 금융집 + 배지 + 성과 + 오상열 CFP 배너

import { useState, useEffect } from 'react';
import { useSpend } from '../context/SpendContext';

// DESIRE 6단계 정의
const DESIRE_STAGES = [
  { level: 1, roman: 'Ⅰ', code: 'D', name: 'Debt Free', korean: '신용대출 상환', desc: '신용대출부터 상환하세요' },
  { level: 2, roman: 'Ⅱ', code: 'E', name: 'Emergency Fund', korean: '비상예비자금', desc: '월수입 3~6개월분 마련' },
  { level: 3, roman: 'Ⅲ', code: 'S', name: 'Savings', korean: '모으기', desc: '적립식 저축투자 시작' },
  { level: 4, roman: 'Ⅳ', code: 'I', name: 'Investment', korean: '돈 불리기', desc: '본격적인 자산 형성' },
  { level: 5, roman: 'Ⅴ', code: 'R', name: 'Retirement', korean: '담보대출 상환', desc: '부채 완전 청산' },
  { level: 6, roman: 'Ⅵ', code: 'E', name: 'Enjoy & Estate', korean: '경제적 조기은퇴', desc: 'FIRE 달성!' }
];

// 금융집 레벨 정의
const HOUSE_LEVELS = [
  { level: 1, name: '텐트', emoji: '🏕️', minScore: 0 },
  { level: 2, name: '판잣집', emoji: '🏚️', minScore: 50 },
  { level: 3, name: '나무집', emoji: '🏠', minScore: 100 },
  { level: 4, name: '벽돌집', emoji: '🏢', minScore: 150 },
  { level: 5, name: '궁전', emoji: '🏰', minScore: 200 }
];

interface MyPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onReset: () => void;
}

export default function MyPage({ onNavigate, onLogout, onReset }: MyPageProps) {
  const { spendItems } = useSpend();
  
  const [userData, setUserData] = useState({
    name: '사용자',
    email: '',
    wealthIndex: 0,
    houseLevel: 1,
    houseName: '텐트',
    houseEmoji: '🏕️',
    desireStage: 1,
    daysUsed: 0,
    consecutiveDays: 0,
    budgetAchievementRate: 0,
    goalAcceleration: 0,
    savedAmount: 0,
    hasFinancialData: false
  });

  useEffect(() => {
    loadUserData();
  }, [spendItems]);

  const loadUserData = () => {
    try {
      // 재무진단 데이터
      const financialData = JSON.parse(localStorage.getItem('financialData') || '{}');
      // 가입일 데이터
      const joinDate = localStorage.getItem('moneya_joinDate');
      // 예산 데이터
      const adjustedBudget = JSON.parse(localStorage.getItem('adjustedBudget') || '{}');
      
      const hasFinancialData = !!(financialData.income || financialData.assets);
      
      // 부자지수로 금융집 레벨 계산
      const wealthIndex = financialData.wealthIndex || 0;
      const house = HOUSE_LEVELS.slice().reverse().find(h => wealthIndex >= h.minScore) || HOUSE_LEVELS[0];
      
      // D+N일 계산
      let daysUsed = 0;
      if (joinDate) {
        const diff = Date.now() - new Date(joinDate).getTime();
        daysUsed = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
      }

      // DESIRE 단계 계산 (재무진단 데이터 기반)
      let desireStage = 1;
      const unsecuredDebt = financialData.unsecuredDebt || 0; // 신용대출
      const securedDebt = financialData.securedDebt || 0; // 담보대출
      const emergencyFund = financialData.emergencyFund || 0; // 비상예비자금
      const monthlyIncome = financialData.income || 0;
      const financialAssets = financialData.financialAssets || financialData.assets || 0;
      const monthlySavings = adjustedBudget.savings || 0;
      const monthlyPension = adjustedBudget.pension || 0;
      const budgetSavings = (adjustedBudget.savings || 0) + (adjustedBudget.pension || 0);

      // DESIRE 단계 로직
      if (unsecuredDebt > 0) {
        desireStage = 1; // D: 신용대출 있음
      } else if (emergencyFund < monthlyIncome * 3) {
        desireStage = 2; // E: 비상예비자금 부족 (3개월분 미만)
      } else if ((monthlySavings + monthlyPension) <= budgetSavings) {
        desireStage = 3; // S: 저축투자+노후연금이 예산 이하
      } else if (financialAssets < 100000) { // 10억 미만 (만원 단위)
        desireStage = 4; // I: 금융자산 10억 미만
      } else if (securedDebt > 0) {
        desireStage = 5; // R: 담보대출 있음
      } else {
        desireStage = 6; // E: FIRE 달성!
      }

      // 이번 달 성과 계산
      const now = new Date();
      const thisMonthItems = spendItems.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      });

      const savedItems = thisMonthItems.filter(item => 
        item.category === '저축투자' || item.category === '노후연금' || item.type === 'saved'
      );
      const savedAmount = savedItems.reduce((sum, item) => sum + item.amount, 0);

      // 예산 달성률 계산
      const totalBudget = (adjustedBudget.livingExpense || 0) + (adjustedBudget.savings || 0) + 
                          (adjustedBudget.pension || 0) + (adjustedBudget.insurance || 0) + 
                          (adjustedBudget.loanPayment || 0);
      const totalSpent = thisMonthItems.filter(item => item.type === 'spent').reduce((sum, item) => sum + item.amount, 0);
      const budgetAchievementRate = totalBudget > 0 ? Math.round((1 - totalSpent / totalBudget) * 100 + 50) : 0;

      setUserData({
        name: financialData.name || '사용자',
        email: localStorage.getItem('userEmail') || '',
        wealthIndex,
        houseLevel: house.level,
        houseName: house.name,
        houseEmoji: house.emoji,
        desireStage,
        daysUsed,
        consecutiveDays: Math.min(daysUsed, 30), // 임시: 가입일수와 동일하게
        budgetAchievementRate: Math.min(100, Math.max(0, budgetAchievementRate)),
        goalAcceleration: Math.floor(daysUsed * 0.7), // 임시 계산
        savedAmount,
        hasFinancialData
      });
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const currentDesire = DESIRE_STAGES.find(d => d.level === userData.desireStage) || DESIRE_STAGES[0];

  // 뱃지 계산
  const badges = [
    { emoji: '🔥', label: '7일연속', active: userData.consecutiveDays >= 7 },
    { emoji: '💰', label: '첫저축', active: userData.savedAmount > 0 },
    { emoji: '📊', label: '분석왕', active: userData.hasFinancialData },
    { emoji: '🎯', label: '목표달성', active: userData.budgetAchievementRate >= 80 },
    { emoji: '🔒', label: '???', active: false, locked: true }
  ];

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      onLogout();
    }
  };

  const handleReset = () => {
    if (window.confirm('모든 데이터를 삭제하고 처음부터 다시 시작하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
      onReset();
    }
  };

  const handleInquiry = () => {
    window.location.href = 'mailto:ggorilla11@gmail.com?subject=[AI머니야] 1:1 문의';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto pb-4">
        
        {/* 프로필 영역 */}
        <div className="bg-white px-4 py-5 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-2xl text-white font-bold">
              {userData.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-extrabold text-gray-900">{userData.name}님</h2>
              <p className="text-xs text-gray-400">{userData.email || 'jarvis@email.com'}</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <span className="text-sm">✨</span>
            <span className="text-xs font-bold text-blue-600">베이직 이용 중</span>
          </div>
        </div>

        {/* 금융집짓기 & DESIRE 단계 */}
        <div className="mx-4 mt-3 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">🏠 나의 금융집짓기</span>
            <span className="px-3 py-1 bg-gradient-to-r from-teal-400 to-teal-600 text-white text-xs font-bold rounded-full">
              DESIRE {currentDesire.roman}
            </span>
          </div>
          
          {/* 금융집 이미지 */}
          <div className="flex flex-col items-center mb-5">
            <div className="w-24 h-24 bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl flex items-center justify-center text-5xl mb-3 shadow-inner">
              {userData.houseEmoji}
            </div>
            <p className="text-base font-extrabold text-gray-800">{userData.houseName} ({userData.houseLevel}단계)</p>
            <p className="text-xs text-gray-500">부자지수 {userData.wealthIndex}점</p>
          </div>
          
          {/* DESIRE 진행바 */}
          <div className="mb-4">
            <div className="flex gap-1 mb-2">
              {DESIRE_STAGES.map((stage) => (
                <div 
                  key={stage.level}
                  className={`flex-1 h-2 rounded-full ${
                    stage.level < userData.desireStage 
                      ? 'bg-green-500' 
                      : stage.level === userData.desireStage 
                        ? 'bg-gradient-to-r from-teal-400 to-teal-600' 
                        : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between px-1">
              {DESIRE_STAGES.map((stage) => (
                <span 
                  key={stage.level}
                  className={`text-[9px] font-semibold ${
                    stage.level === userData.desireStage ? 'text-teal-600' : 'text-gray-400'
                  }`}
                >
                  {stage.roman}
                </span>
              ))}
            </div>
          </div>
          
          {/* 현재 DESIRE 단계 */}
          <div className="bg-gradient-to-r from-teal-400 to-teal-600 rounded-xl p-3 text-white text-center mb-3">
            <p className="text-[10px] opacity-90 mb-0.5">DESIRE {userData.desireStage}단계</p>
            <p className="text-sm font-bold">{currentDesire.code} · {currentDesire.name} ({currentDesire.korean})</p>
            <p className="text-[10px] opacity-85 mt-1">{currentDesire.desc}</p>
          </div>
          
          {/* 금융집짓기 이동 버튼 */}
          <button 
            onClick={() => onNavigate('financialHouse')}
            className="w-full py-3 bg-gray-50 border-2 border-dashed border-teal-400 rounded-xl text-sm font-bold text-teal-600 active:bg-teal-50 transition-colors"
          >
            👉 금융집짓기 재무설계 하러가기
          </button>
        </div>

        {/* 오상열 CFP 배너 */}
        <div 
          className="mx-4 mt-3 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform shadow-sm border border-yellow-300"
          onClick={() => onNavigate('consulting')}
        >
          <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white shadow-md flex-shrink-0 bg-gray-200 flex items-center justify-center">
            {/* TODO: Firebase 사진 URL로 교체 */}
            <span className="text-3xl">👨‍💼</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm font-extrabold text-gray-900">오상열 대표</span>
              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded">CFP</span>
            </div>
            <p className="text-[11px] text-yellow-700 font-semibold mb-1">금융집짓기® 창시자</p>
            <p className="text-[10px] text-gray-600 leading-tight">1:1 맞춤 재무설계 상담<br/>비대면 33만 / 대면 55만</p>
          </div>
          <button className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-xl shadow-sm flex-shrink-0">
            신청
          </button>
        </div>

        {/* 이번 달 성과 */}
        <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">🏆 이번 달 성과</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xl font-extrabold text-teal-600">{userData.consecutiveDays}일</p>
              <p className="text-[10px] text-gray-500">연속 출석</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xl font-extrabold text-blue-600">{userData.budgetAchievementRate}%</p>
              <p className="text-[10px] text-gray-500">예산 달성률</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xl font-extrabold text-green-600">+{userData.goalAcceleration}일</p>
              <p className="text-[10px] text-gray-500">목표 가속</p>
            </div>
          </div>
        </div>

        {/* 획득한 뱃지 */}
        <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">🏆 획득한 뱃지</p>
          <div className="flex justify-between">
            {badges.map((badge, index) => (
              <div key={index} className="flex flex-col items-center gap-1.5">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg ${
                  badge.active 
                    ? 'bg-gradient-to-br from-yellow-100 to-yellow-200' 
                    : 'bg-gray-100 border-2 border-dashed border-gray-200'
                }`}>
                  {badge.locked ? '🔒' : badge.emoji}
                </div>
                <span className="text-[10px] text-gray-500 font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <MenuItem 
            icon="⭐" 
            iconBg="bg-gradient-to-br from-yellow-100 to-yellow-200" 
            label="프리미엄 구독" 
            onClick={() => onNavigate('subscription')} 
          />
          <MenuItem 
            icon="👨‍🏫" 
            iconBg="bg-gradient-to-br from-blue-100 to-indigo-100" 
            label="전문가 상담 · 강의 신청" 
            onClick={() => onNavigate('consulting')} 
          />
          <MenuItem 
            icon="📊" 
            iconBg="bg-gradient-to-br from-green-100 to-emerald-100" 
            label="월간 리포트" 
            badge="NEW"
            onClick={() => onNavigate('monthlyReport')} 
          />
          <MenuItem 
            icon="💬" 
            iconBg="bg-gradient-to-br from-pink-100 to-rose-100" 
            label="1:1 문의하기" 
            onClick={handleInquiry} 
          />
          <MenuItem 
            icon="⚙️" 
            iconBg="bg-gray-100" 
            label="설정" 
            badge="개발중"
            badgeType="dev"
            disabled
            onClick={() => {}} 
          />
        </div>

        {/* 기타 메뉴 */}
        <div className="mx-4 mt-3 mb-4">
          <div className="text-xs text-gray-500 space-y-2 mb-3">
            <p className="py-2 cursor-pointer hover:text-gray-700">❓ 고객센터 / FAQ</p>
            <p className="py-2 cursor-pointer hover:text-gray-700">📄 이용약관</p>
            <p className="py-2 cursor-pointer hover:text-gray-700">🔒 개인정보처리방침</p>
          </div>
          <div className="h-px bg-gray-200 my-3"></div>
          <div className="flex gap-3">
            <button 
              onClick={handleLogout}
              className="flex-1 py-3 bg-gray-100 rounded-xl text-sm font-semibold text-gray-600 active:bg-gray-200 transition-colors"
            >
              🚪 로그아웃
            </button>
            <button 
              onClick={handleReset}
              className="flex-1 py-3 bg-red-50 rounded-xl text-sm font-semibold text-red-500 active:bg-red-100 transition-colors"
            >
              ⚠️ 처음부터 다시하기
            </button>
          </div>
          <p className="text-center text-[11px] text-gray-400 mt-4">
            앱 버전 v1.0.0 (베이스캠프 5.0)
          </p>
        </div>
      </div>
    </div>
  );
}

// 메뉴 아이템 컴포넌트
function MenuItem({ 
  icon, 
  iconBg, 
  label, 
  badge,
  badgeType = 'new',
  disabled = false,
  onClick 
}: { 
  icon: string; 
  iconBg: string; 
  label: string; 
  badge?: string;
  badgeType?: 'new' | 'dev';
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div 
      className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-b-0 transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:bg-gray-50'
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${iconBg}`}>
        {icon}
      </div>
      <span className="flex-1 text-sm font-semibold text-gray-900">{label}</span>
      {badge && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
          badgeType === 'new' 
            ? 'bg-green-100 text-green-600' 
            : 'bg-red-100 text-red-500'
        }`}>
          {badge}
        </span>
      )}
      <span className="text-gray-400 text-sm">›</span>
    </div>
  );
}
