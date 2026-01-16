// src/pages/FinancialHouseBasic.tsx
// 금융집짓기 - 1단계 기본정보 입력 (5개 스텝)
// C시리즈 UI 기반

import { useState } from 'react';
import { useFinancialHouse } from '../context/FinancialHouseContext';

interface FinancialHouseBasicProps {
  userName: string;
  onComplete: () => void;
  onBack: () => void;
}

// 경제적 관심사 옵션
const interestOptions = [
  { id: 'saving', label: '💰 돈 모으기' },
  { id: 'house', label: '🏠 내집 마련' },
  { id: 'retire', label: '🏖️ 노후 준비' },
  { id: 'education', label: '👶 자녀 교육비' },
  { id: 'debt', label: '💳 빚 갚기' },
  { id: 'invest', label: '📈 투자 시작' },
  { id: 'insurance', label: '🛡️ 보험 점검' },
  { id: 'tax', label: '💸 세금 절약' },
];

// 재무 목표 옵션
const goalOptions = [
  { id: 'billion', label: '10억 만들기', icon: '💵' },
  { id: 'house', label: '내집 마련', icon: '🏠' },
  { id: 'early-retire', label: '조기 은퇴', icon: '🏖️' },
  { id: 'children', label: '자녀 독립', icon: '🎓' },
];

// 직업 옵션
const jobOptions = [
  { id: 'employee', label: '직장인', icon: '👔' },
  { id: 'business', label: '자영업', icon: '🏪' },
  { id: 'freelancer', label: '프리랜서', icon: '💻' },
  { id: 'public', label: '공무원', icon: '🏛️' },
  { id: 'homemaker', label: '전업주부', icon: '🏠' },
  { id: 'student', label: '학생', icon: '📚' },
  { id: 'other', label: '기타', icon: '👤' },
];

export default function FinancialHouseBasic({ 
  userName, 
  onComplete, 
  onBack 
}: FinancialHouseBasicProps) {
  const { data, updatePersonalInfo, updateFinancialInfo } = useFinancialHouse();
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Step 1: 인적사항
  const [name, setName] = useState(data.personalInfo.name || userName);
  const [age, setAge] = useState(data.personalInfo.age || 35);
  const [married, setMarried] = useState(data.personalInfo.married);
  const [job, setJob] = useState(data.personalInfo.job || '');
  const [familyCount, setFamilyCount] = useState(data.personalInfo.familyCount || 1);
  const [retireAge, setRetireAge] = useState(data.retirePlan.retireAge || 65);
  const [dualIncome, setDualIncome] = useState(data.personalInfo.dualIncome);

  // Step 2: 관심사/목표
  const [interests, setInterests] = useState<string[]>([]);
  const [goal, setGoal] = useState('');

  // Step 3: 수입/지출
  const [myIncome, setMyIncome] = useState(0);
  const [spouseIncome, setSpouseIncome] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);
  const [livingExpense, setLivingExpense] = useState(0);
  const [savingAmount, setSavingAmount] = useState(0);
  const [investAmount, setInvestAmount] = useState(0);
  const [pensionAmount, setPensionAmount] = useState(0);
  const [insuranceAmount, setInsuranceAmount] = useState(0);

  // Step 4: 자산
  const [depositAsset, setDepositAsset] = useState(0);
  const [investAsset, setInvestAsset] = useState(0);
  const [pensionAsset, setPensionAsset] = useState(0);
  const [realEstateAsset, setRealEstateAsset] = useState(0);
  const [otherAsset, setOtherAsset] = useState(0);

  // Step 5: 부채
  const [mortgageDebt, setMortgageDebt] = useState(0);
  const [creditDebt, setCreditDebt] = useState(0);
  const [otherDebt, setOtherDebt] = useState(0);
  const [emergencyFund, setEmergencyFund] = useState(0);

  // 계산된 값들
  const totalIncome = myIncome + spouseIncome + otherIncome;
  const totalExpense = livingExpense + savingAmount + investAmount + pensionAmount + insuranceAmount;
  const totalAsset = depositAsset + investAsset + pensionAsset + realEstateAsset + otherAsset;
  const totalDebt = mortgageDebt + creditDebt + otherDebt;
  const netWorth = totalAsset - totalDebt;

  // 진행률 계산
  const progress = (currentStep / totalSteps) * 100;

  // 스텝 이동
  const goNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // 데이터 저장 후 완료
      saveAllData();
      onComplete();
    }
  };

  const goPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  // 데이터 저장
  const saveAllData = () => {
    updatePersonalInfo({
      name,
      age,
      married,
      job: job as any,
      familyCount,
      dualIncome,
    });
    updateFinancialInfo({
      monthlyIncome: totalIncome,
      monthlyExpense: totalExpense,
      totalAssets: totalAsset,
      totalDebt: totalDebt,
    });
  };

  // 관심사 토글
  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      setInterests(interests.filter(i => i !== id));
    } else {
      setInterests([...interests, id]);
    }
  };

  // 스텝 라벨
  const stepLabels = [
    '인적사항 입력 중...',
    '경제적 관심사 선택 중...',
    '수입/지출 입력 중...',
    '자산 입력 중...',
    '부채/요약 확인 중...',
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button 
          onClick={goPrev}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600"
        >
          ←
        </button>
        <h1 className="flex-1 text-lg font-bold text-gray-900">기본정보 입력</h1>
        <span className="text-sm text-gray-400 font-semibold">{currentStep}/{totalSteps}</span>
      </div>

      {/* 진행바 */}
      <div className="bg-white px-4 py-3">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-gray-500 font-semibold">{stepLabels[currentStep - 1]}</span>
          <span className="text-xs text-teal-500 font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 스텝 도트 */}
      <div className="flex justify-center gap-2 py-3 bg-white">
        {[1, 2, 3, 4, 5].map(step => (
          <div 
            key={step}
            className={`h-2 rounded-full transition-all ${
              step === currentStep 
                ? 'w-6 bg-teal-500' 
                : step < currentStep 
                  ? 'w-2 bg-emerald-500' 
                  : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Step 1: 인적사항 */}
        {currentStep === 1 && (
          <>
            {/* AI 메시지 */}
            <div className="flex gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">
                👨‍🏫
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1">
                <p className="text-sm text-gray-700 leading-relaxed">
                  먼저 <span className="text-teal-600 font-bold">인적사항</span>부터 입력해 주세요. 정확한 재무설계를 위해 필요해요! 😊
                </p>
              </div>
            </div>

            {/* 인적사항 카드 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">👤</div>
                <div>
                  <h3 className="font-bold text-gray-900">인적사항</h3>
                  <p className="text-xs text-gray-400">기본적인 정보를 입력해 주세요</p>
                </div>
              </div>

              {/* 이름, 나이 */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    나이 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">세</span>
                  </div>
                </div>
              </div>

              {/* 결혼 여부 */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-2">결혼 여부</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMarried(true)}
                    className={`py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                      married 
                        ? 'border-teal-500 bg-teal-50 text-teal-700' 
                        : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    <span className="block text-lg mb-1">💑</span>
                    기혼
                  </button>
                  <button
                    onClick={() => { setMarried(false); setDualIncome(false); }}
                    className={`py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                      !married 
                        ? 'border-teal-500 bg-teal-50 text-teal-700' 
                        : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    <span className="block text-lg mb-1">👤</span>
                    미혼
                  </button>
                </div>
              </div>

              {/* 직업 */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-2">직업</label>
                <div className="grid grid-cols-4 gap-2">
                  {jobOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setJob(option.id)}
                      className={`py-2 rounded-lg border-2 text-xs font-semibold transition-all ${
                        job === option.id 
                          ? 'border-teal-500 bg-teal-50 text-teal-700' 
                          : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      <span className="block text-base mb-0.5">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 가족 수, 은퇴 예정 나이 */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">가족 수</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={familyCount}
                      onChange={(e) => setFamilyCount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">명</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">은퇴 예정 나이</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={retireAge}
                      onChange={(e) => setRetireAge(Number(e.target.value))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">세</span>
                  </div>
                </div>
              </div>

              {/* 맞벌이 여부 (기혼인 경우만) */}
              {married && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">맞벌이 여부</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDualIncome(true)}
                      className={`py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                        dualIncome 
                          ? 'border-teal-500 bg-teal-50 text-teal-700' 
                          : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      <span className="block text-lg mb-1">👫</span>
                      맞벌이
                    </button>
                    <button
                      onClick={() => setDualIncome(false)}
                      className={`py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                        !dualIncome 
                          ? 'border-teal-500 bg-teal-50 text-teal-700' 
                          : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      <span className="block text-lg mb-1">👤</span>
                      외벌이
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Step 2: 관심사/목표 */}
        {currentStep === 2 && (
          <>
            <div className="flex gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">
                👨‍🏫
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1">
                <p className="text-sm text-gray-700 leading-relaxed">
                  좋아요! 이제 <span className="text-teal-600 font-bold">경제적 고민이나 관심사</span>를 알려주세요. 여러 개 선택해도 돼요! 🎯
                </p>
              </div>
            </div>

            {/* 관심사 카드 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl">🎯</div>
                <div>
                  <h3 className="font-bold text-gray-900">경제적 관심사</h3>
                  <p className="text-xs text-gray-400">해당하는 것을 모두 선택해 주세요</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => toggleInterest(option.id)}
                    className={`px-3 py-2 rounded-full border-2 text-xs font-semibold transition-all ${
                      interests.includes(option.id)
                        ? 'border-teal-500 bg-teal-500 text-white'
                        : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 목표 카드 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl">🌟</div>
                <div>
                  <h3 className="font-bold text-gray-900">재무 목표</h3>
                  <p className="text-xs text-gray-400">가장 중요한 목표를 선택해 주세요</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {goalOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setGoal(option.id)}
                    className={`py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                      goal === option.id
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    <span className="block text-xl mb-1">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 3: 수입/지출 */}
        {currentStep === 3 && (
          <>
            <div className="flex gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">
                👨‍🏫
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="text-teal-600 font-bold">수입과 지출</span>을 알려주시면 더 정확한 분석이 가능해요! 💰
                </p>
              </div>
            </div>

            {/* 수입 카드 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">💵</div>
                <div>
                  <h3 className="font-bold text-gray-900">월 수입</h3>
                  <p className="text-xs text-gray-400">세후 기준으로 입력해 주세요</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">👨‍💼 본인 소득</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={myIncome || ''}
                      onChange={(e) => setMyIncome(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                  </div>
                </div>
                {(married && dualIncome) && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-24">👩‍💼 배우자 소득</span>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        value={spouseIncome || ''}
                        onChange={(e) => setSpouseIncome(Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">💼 기타 소득</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={otherIncome || ''}
                      onChange={(e) => setOtherIncome(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">월 수입 합계</span>
                <span className="text-lg font-bold text-teal-600">{totalIncome.toLocaleString()}만원</span>
              </div>
            </div>

            {/* 지출 카드 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl">💸</div>
                <div>
                  <h3 className="font-bold text-gray-900">월 지출</h3>
                  <p className="text-xs text-gray-400">항목별로 입력해 주세요</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">🏠 생활비</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={livingExpense || ''}
                      onChange={(e) => setLivingExpense(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">💰 저축</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={savingAmount || ''}
                      onChange={(e) => setSavingAmount(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">📈 투자</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={investAmount || ''}
                      onChange={(e) => setInvestAmount(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">🏖️ 연금</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={pensionAmount || ''}
                      onChange={(e) => setPensionAmount(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">🛡️ 보험료</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={insuranceAmount || ''}
                      onChange={(e) => setInsuranceAmount(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">월 지출 합계</span>
                <span className="text-lg font-bold text-red-500">{totalExpense.toLocaleString()}만원</span>
              </div>
            </div>
          </>
        )}

        {/* Step 4: 자산 */}
        {currentStep === 4 && (
          <>
            <div className="flex gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">
                👨‍🏫
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1">
                <p className="text-sm text-gray-700 leading-relaxed">
                  현재 보유하신 <span className="text-teal-600 font-bold">자산</span>을 입력해 주세요. 대략적인 금액도 괜찮아요! 💎
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">💎</div>
                <div>
                  <h3 className="font-bold text-gray-900">자산</h3>
                  <p className="text-xs text-gray-400">현재 보유 자산을 입력해 주세요</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28">🏦 예적금</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={depositAsset || ''}
                      onChange={(e) => setDepositAsset(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28">📈 투자자산</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={investAsset || ''}
                      onChange={(e) => setInvestAsset(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28">🏖️ 연금자산</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={pensionAsset || ''}
                      onChange={(e) => setPensionAsset(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28">🏠 부동산</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={realEstateAsset || ''}
                      onChange={(e) => setRealEstateAsset(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28">📦 기타자산</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={otherAsset || ''}
                      onChange={(e) => setOtherAsset(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">총 자산</span>
                <span className="text-lg font-bold text-indigo-600">{totalAsset.toLocaleString()}만원</span>
              </div>
            </div>
          </>
        )}

        {/* Step 5: 부채/요약 */}
        {currentStep === 5 && (
          <>
            <div className="flex gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">
                👨‍🏫
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1">
                <p className="text-sm text-gray-700 leading-relaxed">
                  마지막으로 <span className="text-teal-600 font-bold">부채</span>와 <span className="text-teal-600 font-bold">비상예비자금</span>을 입력해 주세요! 📋
                </p>
              </div>
            </div>

            {/* 부채 카드 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl">💳</div>
                <div>
                  <h3 className="font-bold text-gray-900">부채</h3>
                  <p className="text-xs text-gray-400">현재 남은 대출 잔액을 입력해 주세요</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28">🏠 담보대출</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={mortgageDebt || ''}
                      onChange={(e) => setMortgageDebt(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28">💳 신용대출</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={creditDebt || ''}
                      onChange={(e) => setCreditDebt(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28">📦 기타부채</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={otherDebt || ''}
                      onChange={(e) => setOtherDebt(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">총 부채</span>
                <span className="text-lg font-bold text-red-500">{totalDebt.toLocaleString()}만원</span>
              </div>
            </div>

            {/* 비상예비자금 카드 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">🆘</div>
                <div>
                  <h3 className="font-bold text-gray-900">비상예비자금</h3>
                  <p className="text-xs text-gray-400">즉시 사용 가능한 현금성 자산</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-28">비상예비자금</span>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={emergencyFund || ''}
                    onChange={(e) => setEmergencyFund(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                <span>💡</span>
                <p className="text-xs text-blue-700">
                  비상예비자금은 월 소득의 3~6배를 권장해요! (현재 권장: {(totalIncome * 3).toLocaleString()}~{(totalIncome * 6).toLocaleString()}만원)
                </p>
              </div>
            </div>

            {/* 최종 요약 카드 */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-4 border border-teal-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-xl text-white">✓</div>
                <div>
                  <h3 className="font-bold text-gray-900">📋 기본정보 요약</h3>
                  <p className="text-xs text-gray-400">입력하신 정보를 확인해 주세요</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5">
                  <span className="text-sm text-gray-600">이름 / 나이</span>
                  <span className="text-sm font-semibold text-gray-900">{name} / {age}세</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-sm text-gray-600">가족 구성</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {familyCount}명 ({married ? (dualIncome ? '맞벌이' : '외벌이') : '미혼'})
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-sm text-gray-600">월 수입</span>
                  <span className="text-sm font-semibold text-gray-900">{totalIncome.toLocaleString()}만원</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-sm text-gray-600">총 자산</span>
                  <span className="text-sm font-semibold text-gray-900">{totalAsset.toLocaleString()}만원</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-sm text-gray-600">총 부채</span>
                  <span className="text-sm font-semibold text-red-500">{totalDebt.toLocaleString()}만원</span>
                </div>
                <div className="flex justify-between py-2 border-t border-teal-200 mt-2">
                  <span className="text-sm font-bold text-gray-900">💎 순자산</span>
                  <span className="text-lg font-bold text-teal-600">{netWorth.toLocaleString()}만원</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="p-4 bg-white border-t border-gray-200 flex gap-3">
        <button
          onClick={goPrev}
          className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-600 font-semibold"
        >
          이전
        </button>
        <button
          onClick={goNext}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-teal-400 to-teal-600 text-white font-bold shadow-lg shadow-teal-500/30"
        >
          {currentStep === totalSteps ? '재무설계 시작 →' : '다음'}
        </button>
      </div>
    </div>
  );
}
