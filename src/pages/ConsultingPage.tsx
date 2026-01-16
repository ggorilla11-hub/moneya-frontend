interface ConsultingPageProps {
  onBack: () => void;
}

// Payple 결제 URL
const PAYPLE_URLS = {
  consultOnline: 'https://link.payple.kr/NzcxOjc2ODQ3NzU4NjYzMDE4', // 비대면 상담 33만원
  consultOffline: 'https://link.payple.kr/NzcxOjc2ODQ3NzU4NjYzMDE4', // 대면 상담 55만원 (동일 링크)
  consultVIP: 'https://link.payple.kr/NzcxOjc2ODQ3NzY3MzM3NjA0', // 자산가 상담 110만원
  classOnline: 'https://link.payple.kr/NzcxOjc2ODQ3NzcyMjc4MzY3', // 일반인 비대면 강의 55만원
  classPro: 'https://link.payple.kr/NzcxOjc2MTU0NTgyMDA0MDQ4', // 전문가 대면 강의 110만원
};

export default function ConsultingPage({ onBack }: ConsultingPageProps) {
  // 결제 페이지로 이동
  const handlePayment = (url: string) => {
    window.open(url, '_blank');
  };

  // 전화 연결
  const handleCall = () => {
    window.location.href = 'tel:010-5424-5332';
  };

  // 이메일 연결
  const handleEmail = () => {
    window.location.href = 'mailto:ggorilla11@gmail.com?subject=[AI머니야] 상담/강의 문의';
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
        <h1 className="flex-1 text-lg font-bold text-gray-900">전문가 상담 · 강의</h1>
      </div>

      <div className="p-4">
        {/* 전문가 배너 */}
        <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-5 mb-5 flex gap-4 items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-lg flex-shrink-0 bg-gradient-to-br from-yellow-300 to-yellow-400 flex items-center justify-center text-3xl">
            👨‍💼
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-lg font-extrabold text-gray-900">오상열 대표</h2>
              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">CFP</span>
            </div>
            <p className="text-xs text-yellow-700 font-bold mb-2">금융집짓기® 창시자 · 20년 경력</p>
            <p className="text-[11px] text-gray-600 leading-relaxed italic">
              "당신의 재무 상황을 정확히 진단하고,<br/>맞춤형 솔루션을 제안해 드립니다"
            </p>
          </div>
        </div>

        {/* 1:1 재무상담 섹션 */}
        <h2 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-1.5">
          💼 1:1 재무상담
        </h2>

        {/* 비대면 상담 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-lg">
              📹
            </div>
            <span className="text-base font-bold text-gray-900">비대면 상담</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            화상으로 진행되는 1:1 맞춤 재무상담<br/>2회 진행 · 일정 별도 협의
          </p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-extrabold text-gray-900">33만원</span>
            <button 
              onClick={() => handlePayment(PAYPLE_URLS.consultOnline)}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-400 to-teal-600 text-white font-bold rounded-xl text-sm"
            >
              신청하기
            </button>
          </div>
        </div>

        {/* 대면 상담 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-lg">
              🤝
            </div>
            <span className="text-base font-bold text-gray-900">대면 상담</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            직접 만나서 진행하는 심층 재무상담<br/>2회 진행 · 일정 별도 협의
          </p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-extrabold text-gray-900">55만원</span>
            <button 
              onClick={() => handlePayment(PAYPLE_URLS.consultOffline)}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-400 to-teal-600 text-white font-bold rounded-xl text-sm"
            >
              신청하기
            </button>
          </div>
        </div>

        {/* 자산가 상담 (프리미엄) */}
        <div className="relative bg-white border-2 border-yellow-500 rounded-2xl p-4 mb-3">
          <div className="absolute -top-2 right-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2 py-0.5 rounded-lg text-[9px] font-bold">
            💎 PREMIUM
          </div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-lg">
              👑
            </div>
            <span className="text-base font-bold text-gray-900">자산가 상담</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            금융자산 10억원 초과 고객 전용 VIP 상담<br/>3회 진행 · 일정 별도 협의
          </p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-extrabold text-gray-900">110만원</span>
            <button 
              onClick={() => handlePayment(PAYPLE_URLS.consultVIP)}
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold rounded-xl text-sm"
            >
              신청하기
            </button>
          </div>
        </div>

        {/* 강의 섹션 */}
        <h2 className="text-sm font-extrabold text-gray-900 mb-3 mt-6 flex items-center gap-1.5">
          📚 재테크 & 재무설계 강의
        </h2>

        {/* 일반인 비대면 수업 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-lg">
              🎓
            </div>
            <span className="text-base font-bold text-gray-900">일반인 비대면 수업</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            주 1회 · 매주 2시간 · 4주간 총 8시간<br/>수강 종료 후 월 1회 월례교육 포함
          </p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-extrabold text-gray-900">55만원</span>
            <button 
              onClick={() => handlePayment(PAYPLE_URLS.classOnline)}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-400 to-teal-600 text-white font-bold rounded-xl text-sm"
            >
              신청하기
            </button>
          </div>
        </div>

        {/* 전문가 수업 (어드밴스드) */}
        <div className="relative bg-white border-2 border-yellow-500 rounded-2xl p-4 mb-3">
          <div className="absolute -top-2 right-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2 py-0.5 rounded-lg text-[9px] font-bold">
            🏆 ADVANCED
          </div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-lg">
              🎖️
            </div>
            <span className="text-base font-bold text-gray-900">전문가 수업</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            대면 4주 + 비대면 1년간 수업<br/>매주 토요일 오후 1-6시 (5시간)<br/>📍 선릉역 강의장
          </p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-extrabold text-gray-900">110만원</span>
            <button 
              onClick={() => handlePayment(PAYPLE_URLS.classPro)}
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold rounded-xl text-sm"
            >
              신청하기
            </button>
          </div>
        </div>

        {/* 안내 박스 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mt-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
            💡 상담/강의 안내
          </h3>
          <div className="space-y-1.5 text-xs text-gray-600">
            <p className="pl-4 relative before:content-['•'] before:absolute before:left-1">
              신청 후 24시간 내 연락드립니다
            </p>
            <p className="pl-4 relative before:content-['•'] before:absolute before:left-1">
              일정은 개별 협의로 진행됩니다
            </p>
            <p className="pl-4 relative before:content-['•'] before:absolute before:left-1">
              환불 규정: 수업 시작 전 100% 환불
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-2">
            <button 
              onClick={handleCall}
              className="flex items-center gap-2 text-xs"
            >
              <span>📞 문의:</span>
              <strong className="text-gray-900">010-5424-5332</strong>
            </button>
            <button 
              onClick={handleEmail}
              className="flex items-center gap-2 text-xs"
            >
              <span>📧 이메일:</span>
              <strong className="text-gray-900">ggorilla11@gmail.com</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
