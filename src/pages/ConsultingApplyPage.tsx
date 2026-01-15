import { useState } from 'react';
import type { ServiceItem } from './ConsultingPage';

interface ConsultingApplyPageProps {
  service: ServiceItem;
  onBack: () => void;
  onComplete: () => void;
}

function ConsultingApplyPage({ service, onBack, onComplete }: ConsultingApplyPageProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleSubmit = async () => {
    if (!name || !phone || !email || !agreed) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">신청이 완료되었습니다!</h2>
          <p className="text-gray-500 text-sm mb-6">
            입력하신 연락처로 24시간 내에<br />
            상담 일정 안내를 드리겠습니다.
          </p>
          <button
            onClick={onComplete}
            className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 active:scale-95 transition-all"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="p-2 -ml-2">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-800 -ml-8">신청하기</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 선택한 서비스 정보 */}
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p className="text-sm text-purple-600 font-semibold mb-1">선택한 서비스</p>
          <h3 className="font-bold text-gray-800">{service.title}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-500">{service.duration}</span>
            <span className="font-bold text-purple-600">{formatPrice(service.price)}원</span>
          </div>
        </div>

        {/* 신청자 정보 입력 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">신청자 정보</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                문의사항 (선택)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="상담 전 궁금한 점이 있으시면 적어주세요."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* 개인정보 동의 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 mt-0.5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-600">
              <span className="text-red-500">*</span> 개인정보 수집 및 이용에 동의합니다.
              <br />
              <span className="text-xs text-gray-400">
                수집항목: 이름, 연락처, 이메일 | 이용목적: 상담 예약 및 안내
              </span>
            </span>
          </label>
        </div>

        {/* 안내 */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <p className="text-sm text-amber-800">
            💳 <strong>결제 안내</strong><br />
            신청 후 개별 연락을 통해 상담 일정 확정 및 결제가 진행됩니다.
          </p>
        </div>
      </div>

      {/* 하단 신청 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !name || !phone || !email || !agreed}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            isSubmitting || !name || !phone || !email || !agreed
              ? 'bg-gray-300 text-gray-500'
              : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'
          }`}
        >
          {isSubmitting ? '신청 중...' : `${formatPrice(service.price)}원 신청하기`}
        </button>
      </div>

      {/* 하단 버튼 영역만큼 여백 */}
      <div className="h-24"></div>
    </div>
  );
}

export default ConsultingApplyPage;
