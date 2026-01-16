import { useState } from 'react';

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
  userPhoto,
  financialResult: _financialResult,
  onNavigate,
  onLogout,
  onReset
}: MyPageProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 1:1 문의 이메일 열기
  const handleInquiry = () => {
    window.location.href = 'mailto:ggorilla11@gmail.com?subject=[AI머니야] 1:1 문의';
  };

  // 처음부터 다시하기 확인
  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleResetConfirm = () => {
    setShowResetConfirm(false);
    onReset();
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
  };

  // 추후 financialResult 활용 예정
  console.log('MyPage loaded, financialResult:', _financialResult);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 프로필 영역 */}
      <div className="bg-white p-5 border-b border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          {userPhoto ? (
            <img src={userPhoto} alt="프로필" className="w-14 h-14 rounded-full" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <span className="text-white text-xl font-bold">{userName.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1">
            <p className="font-extrabold text-lg text-gray-900">{userName}님</p>
            <p className="text-sm text-gray-500">{userEmail}</p>
          </div>
        </div>
        {/* 구독 상태 배지 */}
        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <span className="text-base">⭐</span>
          <span className="text-sm font-bold text-blue-600">베이직 이용 중</span>
          <span className="text-xs text-gray-500 ml-2">무료 체험</span>
        </div>
      </div>

      {/* 오상열 대표 배너 - 상담 신청 강조 */}
      <div className="mx-4 mt-4">
        <div 
          className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-4 flex gap-4 items-center cursor-pointer"
          onClick={() => onNavigate('consulting')}
        >
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0 bg-gray-200">
            <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-yellow-300 to-yellow-400">
              👨‍💼
            </div>
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
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
          🏆 획득한 뱃지
        </h3>
        <div className="flex justify-between">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-xl">
              🔥
            </div>
            <span className="text-[10px] text-gray-500 font-medium">7일연속</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-xl">
              💰
            </div>
            <span className="text-[10px] text-gray-500 font-medium">첫저축</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-xl">
              📊
            </div>
            <span className="text-[10px] text-gray-500 font-medium">분석왕</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-xl">
              🎯
            </div>
            <span className="text-[10px] text-gray-500 font-medium">목표달성</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-xl text-gray-400">
              🔒
            </div>
            <span className="text-[10px] text-gray-400 font-medium">???</span>
          </div>
        </div>
      </div>

      {/* 성장 기록 */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
          📈 성장 기록
        </h3>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">출석</span>
            <span className="text-sm font-bold text-teal-600">27/30일 🔥</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">예산 달성</span>
            <span className="text-sm font-bold text-gray-900">23일</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">이번 달 절약</span>
            <span className="text-sm font-bold text-green-500">+127,000원</span>
          </div>
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* 프리미엄 구독 */}
        <button 
          onClick={() => onNavigate('subscription')}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-base">
            ⭐
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">프리미엄 구독</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 전문가 상담·강의 신청 */}
        <button 
          onClick={() => onNavigate('consulting')}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-base">
            👨‍🏫
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">전문가 상담 · 강의 신청</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 월간 리포트 */}
        <button 
          onClick={() => onNavigate('monthly-report')}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-base">
            📊
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">월간 리포트</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 머니야 목소리 설정 */}
        <button 
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-base">
            🎤
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">머니야 목소리 설정</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 개인정보 관리 */}
        <button 
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-base">
            👤
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">개인정보 관리</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 1:1 문의 */}
        <button 
          onClick={handleInquiry}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-base">
            💬
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">1:1 문의</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>

        {/* 설정 */}
        <button 
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-base">
            ⚙️
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">설정</span>
          <span className="text-gray-400 text-sm">›</span>
        </button>
      </div>

      {/* 기타 메뉴 */}
      <div className="mx-4 mt-4 space-y-1">
        <button className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700">
          ❓ 고객센터 / FAQ
        </button>
        <button className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700">
          📄 이용약관
        </button>
        <button className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700">
          🔒 개인정보처리방침
        </button>
        <div className="border-t border-gray-200 my-2"></div>
        <button 
          onClick={handleResetClick}
          className="w-full text-left py-2.5 text-sm text-blue-500 hover:text-blue-700 font-medium"
        >
          🔄 처음부터 다시하기
        </button>
        <button 
          onClick={onLogout}
          className="w-full text-left py-2.5 text-sm text-gray-500 hover:text-gray-700"
        >
          🚪 로그아웃
        </button>
        <button className="w-full text-left py-2.5 text-sm text-red-500 hover:text-red-700">
          ⚠️ 회원탈퇴
        </button>
        <p className="text-center text-xs text-gray-400 py-4">앱 버전 v1.0.0</p>
      </div>

      {/* 처음부터 다시하기 확인 모달 */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">처음부터 다시하기</h3>
            <p className="text-sm text-gray-500 mb-6">
              모든 데이터가 초기화됩니다.<br/>
              정말 처음부터 다시 시작하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleResetCancel}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl"
              >
                취소
              </button>
              <button
                onClick={handleResetConfirm}
                className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
