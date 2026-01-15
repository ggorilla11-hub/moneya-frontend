// MyPage.tsx
// 마이페이지 메인 (일반인용)
// 베이스캠프 5.0 - PHASE 1

import { useState, useEffect } from 'react';

// DESIRE 로드맵 단계 정의
const DESIRE_STAGES = [
  { level: 1, name: '신용대출 상환', short: 'D', description: '신용대출부터 상환하세요' },
  { level: 2, name: '비상예비자금', short: 'E', description: '월수입 3~6개월분 마련' },
  { level: 3, name: '적립식 저축투자', short: 'S', description: '예산에 맞는 저축 시작' },
  { level: 4, name: '10억 목돈 마련', short: 'I', description: '본격적인 자산 형성' },
  { level: 5, name: '담보대출 상환', short: 'R', description: '부채 완전 청산' },
  { level: 6, name: '경제적 조기은퇴', short: 'E', description: 'FIRE 달성!' }
];

// 금융집 레벨 정의
const HOUSE_LEVELS = [
  { level: 1, name: '텐트', emoji: '🏕️', minScore: 0 },
  { level: 2, name: '판잣집', emoji: '🏚️', minScore: 50 },
  { level: 3, name: '단독주택', emoji: '🏠', minScore: 100 },
  { level: 4, name: '빌라', emoji: '🏢', minScore: 150 },
  { level: 5, name: '궁전', emoji: '🏰', minScore: 200 }
];

interface MyPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onReset: () => void;
}

export default function MyPage({ onNavigate, onLogout, onReset }: MyPageProps) {
  // 사용자 데이터 로드
  const [userData, setUserData] = useState({
    name: '사용자',
    wealthIndex: 0,
    houseLevel: 1,
    houseName: '텐트',
    desireStage: 1,
    daysUsed: 0,
    budgetAchieved: 0,
    savedAmount: 0
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      // 재무진단 데이터
      const financialData = JSON.parse(localStorage.getItem('financialData') || '{}');
      // 예산 데이터
      const adjustedBudget = JSON.parse(localStorage.getItem('adjustedBudget') || '{}');
      // 가입일 데이터
      const joinDate = localStorage.getItem('moneya_joinDate');
      
      // 부자지수로 금융집 레벨 계산
      const wealthIndex = financialData.wealthIndex || 0;
      const house = HOUSE_LEVELS.slice().reverse().find(h => wealthIndex >= h.minScore) || HOUSE_LEVELS[0];
      
      // D+N일 계산
      let daysUsed = 1;
      if (joinDate) {
        const diff = Date.now() - new Date(joinDate).getTime();
        daysUsed = Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
      }

      // DESIRE 단계 추정 (부채/자산 비율 기반)
      let desireStage = 1;
      const debt = financialData.debt || 0;
      const assets = financialData.assets || 0;
      if (debt === 0 && assets > 100000) desireStage = 5;
      else if (debt === 0) desireStage = 4;
      else if (assets > debt * 3) desireStage = 3;
      else if (assets > debt) desireStage = 2;

      setUserData({
        name: financialData.name || '사용자',
        wealthIndex,
        houseLevel: house.level,
        houseName: house.name,
        desireStage,
        daysUsed,
        budgetAchieved: 23, // TODO: 실제 데이터 연동
        savedAmount: 127000 // TODO: 실제 데이터 연동
      });
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const currentHouse = HOUSE_LEVELS.find(h => h.level === userData.houseLevel) || HOUSE_LEVELS[0];
  const currentDesire = DESIRE_STAGES.find(d => d.level === userData.desireStage) || DESIRE_STAGES[0];

  // 로그아웃 확인
  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      onLogout();
    }
  };

  // 처음부터 다시하기 확인
  const handleReset = () => {
    if (window.confirm('모든 데이터를 삭제하고 처음부터 다시 시작하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
      onReset();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 스크롤 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        
        {/* 프로필 영역 */}
        <div className="bg-white px-4 py-5 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {/* 금융집 이미지 */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-3xl shadow-sm">
              {currentHouse.emoji}
            </div>
            
            {/* 사용자 정보 */}
            <div className="flex-1">
              <h2 className="text-lg font-extrabold text-gray-900">{userData.name}님</h2>
              <p className="text-sm font-bold text-teal-600">
                {currentHouse.name} ({userData.houseLevel}단계)
              </p>
              <p className="text-xs text-gray-500 mt-1">
                DESIRE: {userData.desireStage}단계 - {currentDesire.name}
              </p>
            </div>

            {/* D+N 뱃지 */}
            <div className="bg-teal-50 px-3 py-1.5 rounded-full">
              <span className="text-sm font-bold text-teal-600">D+{userData.daysUsed}</span>
            </div>
          </div>

          {/* 구독 상태 */}
          <div className="mt-4 px-4 py-2.5 bg-gray-50 rounded-xl flex items-center gap-2">
            <span className="text-base">✨</span>
            <span className="text-sm font-semibold text-gray-700">베이직 이용중</span>
            <span className="text-xs text-gray-400 ml-auto">무료</span>
          </div>
        </div>

        {/* ⭐ 오상열 CFP 배너 (핵심!) */}
        <div className="px-4 pt-4">
          <div 
            className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:scale-98 transition-transform shadow-sm border border-yellow-300"
            onClick={() => onNavigate('consulting')}
          >
            {/* 프로필 사진 */}
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-gray-200">
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-2xl">
                👨‍💼
              </div>
            </div>
            
            {/* 텍스트 */}
            <div className="flex-1">
              <p className="text-sm font-extrabold text-gray-900">오상열 대표</p>
              <p className="text-xs text-yellow-700 font-semibold">금융집짓기® 창시자</p>
              <p className="text-xs text-gray-600 mt-0.5">
                1:1 맞춤 재무설계 상담
                <br />
                <span className="text-gray-500">비대면 33만 / 대면 55만</span>
              </p>
            </div>

            {/* 신청 버튼 */}
            <button className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm font-bold rounded-xl shadow-sm">
              신청
            </button>
          </div>
        </div>

        {/* 성장 기록 */}
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
              📈 성장 기록
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">출석</span>
                <span className="text-sm font-bold text-teal-600">{userData.daysUsed}일 🔥</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">예산 달성</span>
                <span className="text-sm font-bold text-gray-900">{userData.budgetAchieved}일</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">이번 달 절약</span>
                <span className="text-sm font-bold text-green-600">+{userData.savedAmount.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 획득한 뱃지 */}
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
              🏆 획득한 뱃지
            </h3>
            <div className="flex justify-between">
              <BadgeItem emoji="🔥" label="7일연속" active={userData.daysUsed >= 7} />
              <BadgeItem emoji="💰" label="첫저축" active={true} />
              <BadgeItem emoji="📊" label="분석왕" active={true} />
              <BadgeItem emoji="🎯" label="목표달성" active={userData.budgetAchieved >= 20} />
              <BadgeItem emoji="🔒" label="???" active={false} locked />
            </div>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <MenuItem 
              icon="📊" 
              iconBg="bg-green-100" 
              label="월간 리포트" 
              onClick={() => onNavigate('report')} 
            />
            <MenuItem 
              icon="👨‍🏫" 
              iconBg="bg-blue-100" 
              label="전문가 상담 · 강의 신청" 
              onClick={() => onNavigate('consulting')} 
            />
            <MenuItem 
              icon="⚙️" 
              iconBg="bg-gray-100" 
              label="설정" 
              onClick={() => onNavigate('settings')} 
            />
          </div>
        </div>

        {/* 기타 메뉴 */}
        <div className="px-4 pt-4 pb-6">
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
          
          <p className="text-center text-xs text-gray-400 mt-4">
            앱 버전 v1.0.0 (베이스캠프 5.0)
          </p>
        </div>
      </div>
    </div>
  );
}

// 뱃지 아이템 컴포넌트
function BadgeItem({ 
  emoji, 
  label, 
  active, 
  locked 
}: { 
  emoji: string; 
  label: string; 
  active: boolean; 
  locked?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`
        w-11 h-11 rounded-full flex items-center justify-center text-lg
        ${active 
          ? 'bg-gradient-to-br from-yellow-100 to-yellow-200' 
          : 'bg-gray-100 border-2 border-dashed border-gray-200'
        }
      `}>
        {locked ? '🔒' : emoji}
      </div>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
  );
}

// 메뉴 아이템 컴포넌트
function MenuItem({ 
  icon, 
  iconBg, 
  label, 
  onClick 
}: { 
  icon: string; 
  iconBg: string; 
  label: string; 
  onClick: () => void;
}) {
  return (
    <div 
      className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-b-0 cursor-pointer active:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${iconBg}`}>
        {icon}
      </div>
      <span className="flex-1 text-sm font-semibold text-gray-900">{label}</span>
      <span className="text-gray-400 text-sm">›</span>
    </div>
  );
}
