interface SubscriptionPageProps {
  onBack: () => void;
}

export default function SubscriptionPage({ onBack }: SubscriptionPageProps) {
  // 현재는 UI만 표시, 실제 결제 기능은 추후 연동
  const handlePlanSelect = (plan: string) => {
    alert(`${plan} 플랜 선택 - 결제 기능은 추후 연동 예정입니다.`);
  };

  const handleManageClick = (action: string) => {
    alert(`${action} - 추후 연동 예정입니다.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <button 
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-lg"
        >
          ←
        </button>
        <h1 className="flex-1 text-lg font-bold text-gray-900">프리미엄 구독</h1>
      </div>

      <div className="p-4">
        {/* 현재 구독 상태 */}
        <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-500 rounded-2xl p-4 mb-4">
          <div className="absolute -top-2.5 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-bold">
            현재 플랜
          </div>
          <p className="text-[11px] text-blue-600 font-semibold mb-1">CURRENT PLAN</p>
          <p className="text-xl font-extrabold text-gray-900 mb-2">⭐ 베이직</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            AI지출상담, 금융집짓기, 리포트 모두<br/>
            <strong>무제한</strong>으로 이용하고 계십니다.
          </p>
          <div className="flex justify-between mt-3 pt-3 border-t border-dashed border-blue-300">
            <span className="text-xs text-gray-600">다음 결제일</span>
            <strong className="text-xs text-gray-900">무료 체험 중</strong>
          </div>
        </div>

        {/* 일반인용 플랜 */}
        <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1.5">
          👤 일반인용
        </h2>
        <p className="text-[11px] text-gray-400 mb-4">내 돈 관리를 완벽하게</p>

        {/* 무료 플랜 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-base font-extrabold text-gray-900">🆓 무료</p>
              <p className="text-[11px] text-gray-400 mt-0.5">체험 사용자</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold text-gray-900">0원</p>
              <p className="text-[11px] text-gray-400">영구 무료</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-green-500 font-bold">✓</span>
              <span>기본 지출 관리</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-amber-500 font-semibold">⚡</span>
              <span>AI 지출 상담 <strong className="text-gray-900">월 5회</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-amber-500 font-semibold">⚡</span>
              <span>금융집짓기 <strong className="text-gray-900">월 1회</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-gray-400">✗</span>
              <span>재무설계 리포트</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-gray-400">✗</span>
              <span>리포트 공유</span>
            </div>
          </div>
          <button 
            onClick={() => handlePlanSelect('무료')}
            className="w-full mt-3.5 py-3 bg-gray-100 text-gray-400 font-bold rounded-xl text-sm"
          >
            다운그레이드
          </button>
        </div>

        {/* 베이직 플랜 (현재) */}
        <div className="relative bg-white border-2 border-teal-400 rounded-2xl p-4 mb-3 shadow-[0_0_0_3px_rgba(78,205,196,0.2)]">
          <div className="absolute -top-2.5 left-4 bg-teal-400 text-white px-3 py-1 rounded-full text-[10px] font-bold">
            ✓ 이용 중
          </div>
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-base font-extrabold text-gray-900">⭐ 베이직</p>
              <p className="text-[11px] text-gray-400 mt-0.5">일반인 · 가성비 최강</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold text-gray-900">9,900원</p>
              <p className="text-[11px] text-gray-400">/월</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-green-500 font-bold">✓</span>
              <span>기본 지출 관리</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-green-500 font-bold">✓</span>
              <span>AI 지출 상담 <strong className="text-gray-900">무제한</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-green-500 font-bold">✓</span>
              <span>금융집짓기 <strong className="text-gray-900">무제한</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-green-500 font-bold">✓</span>
              <span>재무설계 리포트 <strong className="text-gray-900">무제한</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-green-500 font-bold">✓</span>
              <span>리포트 공유 <strong className="text-gray-900">무제한</strong></span>
            </div>
          </div>
          <button 
            className="w-full mt-3.5 py-3 bg-gray-100 text-gray-400 font-bold rounded-xl text-sm"
          >
            현재 이용 중
          </button>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-[11px] text-gray-400 font-semibold">금융 전문가용</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* 전문가 플랜 */}
        <div className="relative bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-400 rounded-2xl p-4 mb-3">
          <div className="absolute -top-2.5 left-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white px-3 py-1 rounded-full text-[10px] font-bold">
            🏆 EXPERT
          </div>
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-base font-extrabold text-gray-900">🏆 전문가</p>
              <p className="text-[11px] text-gray-400 mt-0.5">보험설계사 · FP · 금융권 직원</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold text-gray-900">99,000원</p>
              <p className="text-[11px] text-gray-400">/월</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-green-500 font-bold">✓</span>
              <span>베이직 모든 기능 포함</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-purple-500 font-bold">★</span>
              <span>고객 관리 <strong className="text-gray-900">최대 100명</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-purple-500 font-bold">★</span>
              <span>고객별 금융집짓기 <strong className="text-gray-900">무제한</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-purple-500 font-bold">★</span>
              <span>고객용 재무설계 리포트 <strong className="text-gray-900">무제한</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-purple-500 font-bold">★</span>
              <span>심층분석 리포트 <strong className="text-gray-900">무제한</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-purple-500 font-bold">★</span>
              <span>상담 녹음 → 자동 입력</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-purple-500 font-bold">★</span>
              <span>카카오톡 · 문자 공유</span>
            </div>
          </div>
          
          {/* 전문가 전용 기능 하이라이트 */}
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-xl p-3 mt-3">
            <p className="text-[11px] font-bold text-purple-600 mb-1.5">전문가 전용 기능</p>
            <div className="space-y-1">
              <p className="text-[11px] text-gray-600 flex items-center gap-1.5">
                <span>✨</span> 상담 녹음만 하면 리포트 자동 생성
              </p>
              <p className="text-[11px] text-gray-600 flex items-center gap-1.5">
                <span>✨</span> 고객에게 즉시 카톡으로 공유
              </p>
              <p className="text-[11px] text-gray-600 flex items-center gap-1.5">
                <span>✨</span> 전문가다운 재무설계 제안서
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => handlePlanSelect('전문가')}
            className="w-full mt-3.5 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold rounded-xl text-sm"
          >
            전문가로 업그레이드
          </button>
        </div>

        {/* 관리 섹션 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button 
            onClick={() => handleManageClick('결제 수단 변경')}
            className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl mb-2"
          >
            <span className="text-base">💳</span>
            <span className="flex-1 text-left text-sm text-gray-600">결제 수단 변경</span>
            <span className="text-sm text-gray-400">›</span>
          </button>
          <button 
            onClick={() => handleManageClick('결제 내역 확인')}
            className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl mb-2"
          >
            <span className="text-base">📜</span>
            <span className="flex-1 text-left text-sm text-gray-600">결제 내역 확인</span>
            <span className="text-sm text-gray-400">›</span>
          </button>
          <button 
            onClick={() => handleManageClick('환불 신청')}
            className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl mb-2"
          >
            <span className="text-base">🔄</span>
            <span className="flex-1 text-left text-sm text-gray-600">환불 신청</span>
            <span className="text-sm text-gray-400">›</span>
          </button>
          <button 
            onClick={() => handleManageClick('구독 취소')}
            className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl"
          >
            <span className="text-base">❌</span>
            <span className="flex-1 text-left text-sm text-gray-600">구독 취소</span>
            <span className="text-sm text-gray-400">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
