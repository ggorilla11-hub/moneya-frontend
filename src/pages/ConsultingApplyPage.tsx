// ConsultingApplyPage.tsx
// 강의/상담 신청 정보 입력 + 결제 페이지
// 베이스캠프 5.0 - PHASE 0-2

import { useState } from 'react';
import { ServiceItem } from './ConsultingPage';

interface ConsultingApplyPageProps {
  service: ServiceItem;
  onBack: () => void;
  onComplete: () => void;
}

// Make.com Webhook URL (대표님이 설정 후 교체 필요)
const MAKE_WEBHOOK_URL = 'YOUR_MAKE_WEBHOOK_URL_HERE';

export default function ConsultingApplyPage({ 
  service, 
  onBack,
  onComplete 
}: ConsultingApplyPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 입력값 변경 핸들러
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // 전화번호 포맷팅 (010-1234-5678)
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 유효성 검사
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      setError('올바른 연락처를 입력해주세요');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('올바른 이메일을 입력해주세요');
      return false;
    }
    if (!agreed) {
      setError('개인정보 수집 및 이용에 동의해주세요');
      return false;
    }
    return true;
  };

  // Make.com Webhook으로 데이터 전송
  const sendToWebhook = async () => {
    const payload = {
      timestamp: new Date().toISOString(),
      service_id: service.id,
      service_title: service.title,
      service_price: service.price,
      customer_name: formData.name,
      customer_phone: formData.phone,
      customer_email: formData.email,
      status: 'pending_payment'
    };

    try {
      // Make.com Webhook URL이 설정되어 있을 때만 전송
      if (MAKE_WEBHOOK_URL !== 'YOUR_MAKE_WEBHOOK_URL_HERE') {
        await fetch(MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      }
      
      // 로컬스토리지에도 저장 (백업용)
      const applications = JSON.parse(localStorage.getItem('consulting_applications') || '[]');
      applications.push(payload);
      localStorage.setItem('consulting_applications', JSON.stringify(applications));
      
      return true;
    } catch (err) {
      console.error('Webhook 전송 실패:', err);
      // 실패해도 결제 페이지로 이동 (로컬 저장은 됨)
      return true;
    }
  };

  // 결제하기 버튼 클릭
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Webhook으로 데이터 전송 (구글시트 저장)
      await sendToWebhook();

      // 2. 페이플 결제 페이지로 이동
      window.location.href = service.paypleUrl;
      
    } catch (err) {
      setError('처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <button 
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-lg"
        >
          ←
        </button>
        <h1 className="flex-1 text-lg font-bold text-gray-900">강의/상담 신청</h1>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        
        {/* 선택한 상품 정보 */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-4 mb-5 border border-teal-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${service.iconBg}`}>
              {service.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">{service.title}</p>
              <p className="text-lg font-extrabold text-teal-600">{service.priceDisplay}</p>
            </div>
          </div>
        </div>

        {/* 신청 정보 입력 폼 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            📋 신청 정보 입력
          </h2>

          {/* 이름 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="홍길동"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-teal-400 transition-colors"
            />
          </div>

          {/* 연락처 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
              placeholder="010-1234-5678"
              maxLength={13}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-teal-400 transition-colors"
            />
          </div>

          {/* 이메일 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-teal-400 transition-colors"
            />
          </div>

          {/* 개인정보 동의 */}
          <div 
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer"
            onClick={() => setAgreed(!agreed)}
          >
            <div className={`
              w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-xs border-2 transition-colors
              ${agreed 
                ? 'bg-teal-500 border-teal-500 text-white' 
                : 'bg-white border-gray-300'
              }
            `}>
              {agreed && '✓'}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-900">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
              <br />
              <span className="text-gray-400">
                수집항목: 이름, 연락처, 이메일 | 이용목적: 상담/강의 신청 및 안내
              </span>
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}
        </div>

        {/* 안내 문구 */}
        <div className="mt-4 px-2">
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            결제 완료 후 24시간 내 연락드립니다.<br/>
            문의: 010-5424-5332 | osy0551@naver.com
          </p>
        </div>

        {/* 하단 여백 */}
        <div className="h-24" />
      </div>

      {/* 하단 결제 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`
            w-full py-4 rounded-2xl text-base font-bold text-white transition-all
            ${isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-teal-400 to-teal-500 active:scale-98'
            }
          `}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              처리 중...
            </span>
          ) : (
            `결제하기 ${service.price.toLocaleString()}원`
          )}
        </button>
      </div>
    </div>
  );
}

export { MAKE_WEBHOOK_URL };
