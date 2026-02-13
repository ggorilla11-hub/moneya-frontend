import { useState } from 'react';
import house1 from '../assets/house1.jpg';
import house2 from '../assets/house2.jpg';
import house3 from '../assets/house3.jpg';
import house4 from '../assets/house4.jpg';
import house5 from '../assets/house5.jpg';

// AI머니야 로고 URL (Firebase Storage)
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a";

interface FinancialCheckPageProps {
  onComplete: (result: FinancialResult) => void;
}

export interface FinancialResult {
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

function FinancialCheckPage({ onComplete }: FinancialCheckPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    income: '',
    assets: '',
    debt: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (field: string, value: string) => {
    // 숫자 필드는 숫자만 허용
    if (field !== 'name') {
      value = value.replace(/[^0-9]/g, '');
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateWealthIndex = () => {
    const age = parseInt(formData.age) || 0;
    const income = parseInt(formData.income) || 0;
    const assets = parseInt(formData.assets) || 0;
    const debt = parseInt(formData.debt) || 0;

    const netAssets = assets - debt;
    const denominator = age * income * 12;
    
    if (denominator === 0) return 0;
    
    const wealthIndex = Math.round((netAssets * 10) / denominator * 100);
    return wealthIndex;
  };

  const getHouseInfo = (wealthIndex: number) => {
    if (wealthIndex <= 0) {
      return { level: 1, name: '텐트', image: house1, message: '지금부터 시작입니다! 함께 금융 집을 지어봐요!' };
    } else if (wealthIndex <= 50) {
      return { level: 2, name: '초가집', image: house2, message: '좋은 시작이에요! 조금씩 성장하고 있어요!' };
    } else if (wealthIndex <= 100) {
      return { level: 3, name: '한옥', image: house3, message: '잘하고 계세요! 안정적인 재무 상태입니다!' };
    } else if (wealthIndex <= 200) {
      return { level: 4, name: '고급양옥', image: house4, message: '훌륭해요! 재무적으로 여유가 있으시네요!' };
    } else {
      return { level: 5, name: '궁전', image: house5, message: '축하합니다! 금융 부자예요!' };
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요';
    if (!formData.age) newErrors.age = '나이를 입력해주세요';
    if (!formData.income) newErrors.income = '월수입을 입력해주세요';
    if (!formData.assets) newErrors.assets = '총자산을 입력해주세요';
    if (!formData.debt) newErrors.debt = '총부채를 입력해주세요';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const wealthIndex = calculateWealthIndex();
    const houseInfo = getHouseInfo(wealthIndex);

    const result: FinancialResult = {
      name: formData.name,
      age: parseInt(formData.age),
      income: parseInt(formData.income),
      assets: parseInt(formData.assets),
      debt: parseInt(formData.debt),
      wealthIndex,
      level: houseInfo.level,
      houseName: houseInfo.name,
      houseImage: houseInfo.image,
      message: houseInfo.message,
    };

    onComplete(result);
  };

  const previewWealthIndex = () => {
    if (formData.age && formData.income && formData.assets && formData.debt) {
      return calculateWealthIndex();
    }
    return null;
  };

  const preview = previewWealthIndex();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-green-50 to-amber-50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">기본 재무진단</h1>
        <span className="text-sm text-purple-600 font-semibold">1/2</span>
      </div>

      <div className="bg-gradient-to-r from-purple-100 to-purple-50 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <img 
            src={LOGO_URL}
            alt="AI머니야 로고"
            className="w-12 h-12 flex-shrink-0"
          />
          <div>
            <p className="font-bold text-gray-800">안녕하세요! 👋</p>
            <p className="text-sm text-gray-600">5가지만 알려주시면</p>
            <p className="text-sm text-purple-600 font-semibold">나의 금융집을 보여드릴게요!</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">👤</span>
          <h2 className="font-bold text-gray-800">기본 정보</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="홍길동"
              className={`w-full px-4 py-3 border rounded-xl text-gray-800 ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              나이 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="37"
                className={`w-full px-4 py-3 border rounded-xl text-gray-800 pr-10 ${errors.age ? 'border-red-400' : 'border-gray-200'}`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">세</span>
            </div>
            {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💰</span>
          <h2 className="font-bold text-gray-800">재무 정보</h2>
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-1 block">
            월수입 (세후 실수령액) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.income}
              onChange={(e) => handleChange('income', e.target.value)}
              placeholder="520"
              className={`w-full px-4 py-3 border rounded-xl text-gray-800 pr-12 ${errors.income ? 'border-red-400' : 'border-gray-200'}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">만원</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">본인 + 배우자 합산 기준</p>
          {errors.income && <p className="text-xs text-red-500 mt-1">{errors.income}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              총자산 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.assets}
                onChange={(e) => handleChange('assets', e.target.value)}
                placeholder="65000"
                className={`w-full px-4 py-3 border rounded-xl text-gray-800 pr-12 ${errors.assets ? 'border-red-400' : 'border-gray-200'}`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">만원</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">부동산+금융자산</p>
            {errors.assets && <p className="text-xs text-red-500 mt-1">{errors.assets}</p>}
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              총부채 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.debt}
                onChange={(e) => handleChange('debt', e.target.value)}
                placeholder="40000"
                className={`w-full px-4 py-3 border rounded-xl text-gray-800 pr-12 ${errors.debt ? 'border-red-400' : 'border-gray-200'}`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">만원</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">대출 잔액 합계</p>
            {errors.debt && <p className="text-xs text-red-500 mt-1">{errors.debt}</p>}
          </div>
        </div>
      </div>

      {preview !== null && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-4 mb-4 border border-yellow-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">예상 부자지수</span>
            <span className="text-2xl font-bold text-purple-600">{preview}%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">* 정확한 결과는 다음 화면에서 확인하세요</p>
        </div>
      )}

      <div className="bg-purple-50 rounded-2xl p-4 mb-6 border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-500">💡</span>
          <span className="font-bold text-purple-700">부자지수란?</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          나이와 소득 대비 순자산이 얼마나 되는지를 측정하는 <strong>재무건전성 지표</strong>입니다.
        </p>
        <div className="bg-white rounded-xl p-3 text-center">
          <p className="text-sm text-gray-700">
            부자지수 = <span className="text-purple-600">(순자산 × 10)</span> ÷ <span className="text-purple-600">(나이 × 월수입 × 12)</span> × 100
          </p>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
      >
        🏠 나의 금융집 확인하기
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default FinancialCheckPage;
