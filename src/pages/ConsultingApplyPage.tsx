import { useState } from 'react';

// 상품 정보 타입
export interface ConsultingProduct {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  paypleUrl: string;
}

interface ConsultingApplyPageProps {
  product: ConsultingProduct;
  onBack: () => void;
}

export default function ConsultingApplyPage({ product, onBack }: ConsultingApplyPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    inquiry: '',
  });
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google Apps Script 웹앱 URL
  const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwMsuhJl6qWHCzgiCDs-Jx2zO1F4yyLHIgGw_JNCn1o5POi1blwAjZtu3izjxV8cyOvFg/exec';

  // 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 전화번호 포맷팅
  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  // 유효성 검사
  const isFormValid = () => {
    return (
      formData.name.trim().length >= 2 &&
      formData.phone.replace(/-/g, '').length >= 10 &&
      formData.email.includes('@') &&
      agreePrivacy
    );
  };

  // 결제하기 클릭
  const handleSubmit = async () => {
    if (!isFormValid() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 구글시트에 데이터 저장
      const sheetData = {
        productId: product.id,
        productName: product.name,
        price: product.price,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      };

      // Google Apps Script로 데이터 전송
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sheetData),
      });

      // 페이플 결제 페이지로 이동
      window.open(product.paypleUrl, '_blank');

    } catch (err) {
      console.error('신청 처리 중 오류:', err);
      // 오류가 나도 결제 페이지로 이동
      window.open(product.paypleUrl, '_blank');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-lg"
        >
          ←
        </button>
        <h1 className="flex-1 text-lg font-bold text-gray-900">신청하기</h1>
      </div>

      <div className="p-4">
        {/* 선택한 상품 정보 */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 mb-6">
          <p className="text-xs text-purple-600 font-semibold mb-1">선택한 서비스</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-base font-bold text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{product.description}</p>
            </div>
            <p className="text-xl font-extrabold text-purple-600">{product.priceLabel}</p>
          </div>
        </div>

        {/* 신청자 정보 입력 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-4">신청자 정보</h2>

          {/* 이름 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="홍길동"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />
          </div>

          {/* 연락처 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="010-1234-5678"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />
          </div>

          {/* 이메일 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />
          </div>

          {/* 문의사항 (선택) */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              문의사항 <span className="text-gray-400">(선택)</span>
            </label>
            <textarea
              name="inquiry"
              value={formData.inquiry}
              onChange={handleChange}
              placeholder="상담 전 궁금한 점이 있으시면 적어주세요."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
            />
          </div>

          {/* 개인정보 동의 */}
          <div className="flex items-start gap-2 mt-6 p-3 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              id="agreePrivacy"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="agreePrivacy" className="text-xs text-gray-600 leading-relaxed">
              <span className="font-medium text-gray-900">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
              <br />
              <span className="text-gray-400">수집항목: 이름, 연락처, 이메일 / 이용목적: 상담·강의 신청 및 안내</span>
            </label>
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-xs text-yellow-800 leading-relaxed">
            💡 결제 완료 후 24시간 내 연락드립니다.<br />
            문의: 010-5424-5332 / ggorilla11@gmail.com
          </p>
        </div>

        {/* 결제하기 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid() || isSubmitting}
          className={`w-full mt-6 py-4 rounded-2xl text-base font-bold transition-all ${
            isFormValid() && !isSubmitting
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? '처리 중...' : `${product.priceLabel} 결제하기`}
        </button>

        <p className="text-center text-[10px] text-gray-400 mt-3">
          결제는 페이플(Payple) 안전결제로 진행됩니다
        </p>
      </div>
    </div>
  );
}
