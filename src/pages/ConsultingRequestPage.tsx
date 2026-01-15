// src/pages/ConsultingRequestPage.tsx
// 강의/상담 신청 폼 + 구글시트 연동 + 페이플 결제

import { useState } from 'react';

// 상품 정보 타입
interface Product {
  id: string;
  name: string;
  category: '상담' | '강의';
  price: number;
  priceLabel: string;
  description: string;
  paypleUrl: string;
}

// 상품 목록 (페이플 URL 포함)
const PRODUCTS: Product[] = [
  {
    id: 'consult-online',
    name: '비대면 상담',
    category: '상담',
    price: 330000,
    priceLabel: '33만원',
    description: '화상으로 진행되는 1:1 맞춤 재무상담 (2회)',
    paypleUrl: 'https://link.payple.kr/NzcxOjc2MTU0NzE0MjE5Mzk1',
  },
  {
    id: 'consult-offline',
    name: '대면 상담',
    category: '상담',
    price: 550000,
    priceLabel: '55만원',
    description: '직접 만나서 진행하는 심층 재무상담 (2회)',
    paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzU4NjYzMDE4',
  },
  {
    id: 'consult-vip',
    name: '자산가 상담',
    category: '상담',
    price: 1100000,
    priceLabel: '110만원',
    description: '금융자산 10억원 초과 고객 전용 VIP 상담 (3회)',
    paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzY3MzM3NjA0',
  },
  {
    id: 'lecture-online',
    name: '일반인 비대면 수업',
    category: '강의',
    price: 550000,
    priceLabel: '55만원',
    description: '주 1회 · 매주 2시간 · 4주간 총 8시간\n수강 종료 후 월 1회 월례교육 포함',
    paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzcyMjc4MzY3',
  },
  {
    id: 'lecture-offline',
    name: '전문가 대면 수업',
    category: '강의',
    price: 1100000,
    priceLabel: '110만원',
    description: '대면 4주 + 비대면 1년간 수업\n매주 토요일 오후 1-6시 (5시간)\n📍 선릉역 강의장',
    paypleUrl: 'https://link.payple.kr/NzcxOjc2MTU0NTgyMDA0MDQ4',
  },
];

// 구글시트 웹앱 URL (Apps Script 배포 후 설정 필요)
const GOOGLE_SHEET_WEBAPP_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL';

interface ConsultingRequestPageProps {
  onBack: () => void;
  preSelectedProductId?: string;
}

function ConsultingRequestPage({ onBack, preSelectedProductId }: ConsultingRequestPageProps) {
  // 상태 관리
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    preSelectedProductId ? PRODUCTS.find(p => p.id === preSelectedProductId) || null : null
  );
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 상품 선택
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setStep('form');
  };

  // 폼 입력 변경
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // 전화번호 포맷팅
  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.replace(/[^0-9]/g, '').length < 10) {
      setError('올바른 연락처를 입력해주세요');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('올바른 이메일을 입력해주세요');
      return false;
    }
    if (!agreePrivacy) {
      setError('개인정보 수집 및 이용에 동의해주세요');
      return false;
    }
    return true;
  };

  // 구글시트 저장 + 결제 페이지 이동
  const handleSubmit = async () => {
    if (!selectedProduct || !validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 구글시트에 데이터 저장
      const sheetData = {
        timestamp: new Date().toISOString(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        price: selectedProduct.price,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        status: '결제대기',
      };

      // Apps Script 웹앱으로 데이터 전송
      if (GOOGLE_SHEET_WEBAPP_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL') {
        await fetch(GOOGLE_SHEET_WEBAPP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sheetData),
        });
      }

      // localStorage에도 임시 저장 (백업용)
      const localKey = `moneya_consulting_${Date.now()}`;
      localStorage.setItem(localKey, JSON.stringify(sheetData));

      // 페이플 결제 페이지로 이동
      window.location.href = selectedProduct.paypleUrl;

    } catch (err) {
      console.error('신청 처리 중 오류:', err);
      // 오류가 나도 결제 페이지로 이동 (구글시트 저장 실패해도 결제는 진행)
      window.location.href = selectedProduct.paypleUrl;
    }
  };

  // 상품 선택 화면
  const renderProductSelect = () => (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100"
        >
          <span className="text-gray-600">←</span>
        </button>
        <h1 className="text-lg font-bold text-gray-800">전문가 상담 · 강의</h1>
      </div>

      {/* 전문가 배너 */}
      <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-4 mx-4 mt-4 rounded-xl flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          오
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">오상열 대표</span>
            <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">CFP</span>
          </div>
          <p className="text-xs text-amber-700 font-semibold">금융집짓기® 창시자</p>
          <p className="text-xs text-gray-600 mt-1">20년 경력 재무설계 전문가</p>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* 상담 섹션 */}
        <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          💼 1:1 재무상담
        </h2>
        <div className="space-y-3 mb-6">
          {PRODUCTS.filter(p => p.category === '상담').map(product => (
            <div
              key={product.id}
              onClick={() => handleSelectProduct(product)}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm cursor-pointer hover:border-purple-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {product.id === 'consult-online' ? '📹' : product.id === 'consult-offline' ? '🤝' : '👑'}
                  </span>
                  <span className="font-bold text-gray-800">{product.name}</span>
                </div>
                <span className="text-lg font-bold text-gray-800">{product.priceLabel}</span>
              </div>
              <p className="text-xs text-gray-500">{product.description}</p>
            </div>
          ))}
        </div>

        {/* 강의 섹션 */}
        <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          📚 재테크 & 재무설계 강의
        </h2>
        <div className="space-y-3">
          {PRODUCTS.filter(p => p.category === '강의').map(product => (
            <div
              key={product.id}
              onClick={() => handleSelectProduct(product)}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm cursor-pointer hover:border-purple-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {product.id === 'lecture-online' ? '🎓' : '🎖️'}
                  </span>
                  <span className="font-bold text-gray-800">{product.name}</span>
                </div>
                <span className="text-lg font-bold text-gray-800">{product.priceLabel}</span>
              </div>
              <p className="text-xs text-gray-500 whitespace-pre-line">{product.description}</p>
            </div>
          ))}
        </div>

        {/* 안내 */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-xs font-bold text-gray-700 mb-2">💡 상담/강의 안내</p>
          <p className="text-xs text-gray-500">• 신청 후 24시간 내 연락드립니다</p>
          <p className="text-xs text-gray-500">• 일정은 개별 협의로 진행됩니다</p>
          <p className="text-xs text-gray-500">• 환불 규정: 수업 시작 전 100% 환불</p>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">📞 문의: <strong>010-5424-5332</strong></p>
            <p className="text-xs text-gray-600">📧 이메일: <strong>osy0551@naver.com</strong></p>
          </div>
        </div>
      </div>
    </div>
  );

  // 신청 폼 화면
  const renderForm = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setStep('select')}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100"
        >
          <span className="text-gray-600">←</span>
        </button>
        <h1 className="text-lg font-bold text-gray-800">신청 정보 입력</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* 선택한 상품 */}
        {selectedProduct && (
          <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">선택한 상품</p>
                <p className="font-bold text-gray-800">{selectedProduct.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-purple-600">{selectedProduct.priceLabel}</p>
              </div>
            </div>
          </div>
        )}

        {/* 신청 폼 */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-3xl">📋</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800">신청 정보 입력</h2>
            <p className="text-sm text-gray-500 mt-1">연락 가능한 정보를 입력해주세요</p>
          </div>

          {/* 이름 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="홍길동"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
              placeholder="010-1234-5678"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* 개인정보 동의 */}
          <div 
            onClick={() => setAgreePrivacy(!agreePrivacy)}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer"
          >
            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
              agreePrivacy ? 'bg-purple-600' : 'border-2 border-gray-300'
            }`}>
              {agreePrivacy && <span className="text-white text-xs">✓</span>}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-semibold">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
              <br />
              <span className="text-gray-400">수집항목: 이름, 연락처, 이메일 | 이용목적: 상담/강의 신청 및 안내</span>
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* 결제 버튼 */}
      <div className="p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            isSubmitting
              ? 'bg-gray-300 text-gray-500'
              : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> 처리 중...
            </span>
          ) : (
            `결제하기 ${selectedProduct?.price.toLocaleString()}원`
          )}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">
          결제 완료 후 24시간 내 연락드립니다
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 'select' ? renderProductSelect() : renderForm()}
    </div>
  );
}

export default ConsultingRequestPage;
