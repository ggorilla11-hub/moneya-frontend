// src/pages/FinancialHouseBasic.tsx
// 금융집짓기 - 1단계 기본정보 입력 (5개 스텝)
// v5.0: initialStep props 추가 - back 버튼 시 마지막 스텝(Step 5)에서 시작
// v4.1: 2단계 복귀 시 데이터 유지 (localStorage 삭제 제거)
// v4.0: useState 초기값에서 localStorage 로딩 (탭 이동/스텝 이동 시 데이터 유지 완벽 해결)
// v3.0: 각 스텝 이동 시 localStorage 저장 + 마운트 시 복원 (데이터 유지 문제 해결)
// v2.0: 부채 입력 UI 개선 - 다중 대출 입력 지원 (+버튼으로 추가)
// 전략 1 적용: InputRow, AutoCalcRow를 컴포넌트 외부에 정의
// 기존 데이터: 합계에만 참고값으로 표시, 세부항목은 직접 입력
// 수정: normalizeToManwon 함수로 금액 단위 정규화 (수입/지출/자산/부채 모두 적용)
// 추가: DESIRE 6단계 결과 표시
// 수정 (2026-01-22): 자산 구조 변경 - 금융자산/부동산자산 분리, 예적금→예금+적금/적립금 분리
// 수정 (2026-01-26): 부채 입력 UI 개선 - 담보대출/신용대출/기타부채 다중 입력 지원
// 수정 (2026-01-30): v3.0 - 각 스텝 이동 시 자동 저장 + 복원 기능 추가
// 수정 (2026-01-31): v4.0 - useState 초기값에서 localStorage 직접 로딩으로 변경
// 수정 (2026-01-31): v4.1 - 2단계 복귀 시 데이터 유지 (onComplete 시 localStorage 삭제 제거)

import { useState, useEffect, useCallback } from 'react';
import { useFinancialHouse } from '../context/FinancialHouseContext';

// ============================================
// v3.0 신규: localStorage 키
// ============================================
const BASIC_STORAGE_KEY = 'financialHouseBasicDraft';

// ============================================
// v4.0 신규: localStorage에서 저장된 데이터 로딩 함수
// ============================================
const loadSavedData = () => {
  try {
    const saved = localStorage.getItem(BASIC_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      console.log('[FinancialHouseBasic] 저장된 데이터 로딩:', data);
      return data;
    }
  } catch (e) {
    console.error('[FinancialHouseBasic] 데이터 로딩 실패:', e);
  }
  return null;
};

// ============================================
// 인터페이스 정의
// ============================================
interface FinancialHouseBasicProps {
  userName: string;
  onComplete: () => void;
  onBack: () => void;
  existingFinancialResult?: { name: string; age: number; income: number; assets: number; debt: number; } | null;
  existingIncomeExpense?: { 
    familySize: number;
    income: number;
    loanPayment: number;
    insurance: number;
    pension: number;
    savings: number;
    surplus: number;
    livingExpense: number;
  } | null;
  initialStep?: number; // ★★★ v5.0 추가: 초기 스텝 설정 (1~5) ★★★
}

interface InputRowProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  icon: string;
}

interface AutoCalcRowProps {
  label: string;
  value: number;
  icon: string;
}

// ============================================
// 대출 항목 인터페이스 (신규)
// ============================================
interface DebtItem {
  id: string;
  name: string;
  amount: number;
  rate: number;
}

// ============================================
// InputRow 컴포넌트 (외부 정의 - 재생성 방지)
// ============================================
const InputRow = ({ label, value, onChange, icon }: InputRowProps) => (
  <div className="flex items-center gap-3 py-2">
    <span className="text-sm text-gray-600 w-32 flex items-center gap-1">
      <span>{icon}</span> {label}
    </span>
    <div className="flex-1 relative">
      <input 
        type="text" 
        inputMode="numeric" 
        pattern="[0-9]*"
        value={value === 0 ? '' : String(value)} 
        onChange={(e) => {
          const val = e.target.value.replace(/[^0-9]/g, '');
          onChange(val ? parseInt(val, 10) : 0);
        }} 
        placeholder="0" 
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500" 
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
    </div>
  </div>
);

// ============================================
// AutoCalcRow 컴포넌트 (외부 정의 - 재생성 방지)
// ============================================
const AutoCalcRow = ({ label, value, icon }: AutoCalcRowProps) => (
  <div className="flex items-center gap-3 py-2 bg-teal-50 rounded-lg px-2">
    <span className="text-sm text-teal-700 w-32 flex items-center gap-1 font-semibold">
      <span>{icon}</span> {label}
    </span>
    <div className="flex-1 text-right">
      <span className="text-sm font-bold text-teal-600">{value.toLocaleString()}만원</span>
      <span className="text-xs text-teal-500 ml-1">(자동)</span>
    </div>
  </div>
);

// ============================================
// DebtItemRow 컴포넌트 (신규 - 개별 대출 항목)
// ============================================
interface DebtItemRowProps {
  item: DebtItem;
  onUpdate: (id: string, field: 'name' | 'amount' | 'rate', value: string | number) => void;
  onDelete: (id: string) => void;
}

const DebtItemRow = ({ item, onUpdate, onDelete }: DebtItemRowProps) => (
  <div className="flex items-center gap-2 py-2 px-2 bg-gray-50 rounded-lg mb-2">
    <input
      type="text"
      value={item.name}
      onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
      placeholder="대출명"
      className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-teal-500"
    />
    <div className="flex-1 relative">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={item.amount === 0 ? '' : String(item.amount)}
        onChange={(e) => {
          const val = e.target.value.replace(/[^0-9]/g, '');
          onUpdate(item.id, 'amount', val ? parseInt(val, 10) : 0);
        }}
        placeholder="0"
        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-right pr-8 focus:outline-none focus:border-teal-500"
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">만원</span>
    </div>
    <div className="w-16 relative">
      <input
        type="text"
        inputMode="decimal"
        value={item.rate === 0 ? '' : String(item.rate)}
        onChange={(e) => {
          const val = e.target.value.replace(/[^0-9.]/g, '');
          onUpdate(item.id, 'rate', val ? parseFloat(val) : 0);
        }}
        placeholder="0"
        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-right pr-5 focus:outline-none focus:border-teal-500"
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">%</span>
    </div>
    <button
      onClick={() => onDelete(item.id)}
      className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-500 text-xs hover:bg-red-200"
    >
      ×
    </button>
  </div>
);

// ============================================
// DebtSection 컴포넌트 (신규 - 대출 섹션)
// ============================================
interface DebtSectionProps {
  title: string;
  icon: string;
  items: DebtItem[];
  onAdd: () => void;
  onUpdate: (id: string, field: 'name' | 'amount' | 'rate', value: string | number) => void;
  onDelete: (id: string) => void;
  totalAmount: number;
}

const DebtSection = ({ title, icon, items, onAdd, onUpdate, onDelete, totalAmount }: DebtSectionProps) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-semibold text-gray-700">{title}</span>
      </div>
      <button
        onClick={onAdd}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 text-lg font-bold hover:bg-teal-200 transition-colors"
      >
        +
      </button>
    </div>
    
    {items.length === 0 ? (
      <div className="text-center py-3 text-xs text-gray-400 bg-gray-50 rounded-lg">
        + 버튼을 눌러 {title}을 추가하세요
      </div>
    ) : (
      <>
        <div className="text-[10px] text-gray-400 mb-1 px-2 flex">
          <span className="w-24">대출명</span>
          <span className="flex-1 text-right pr-8">금액</span>
          <span className="w-16 text-right pr-5">이자율</span>
          <span className="w-6"></span>
        </div>
        {items.map(item => (
          <DebtItemRow
            key={item.id}
            item={item}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </>
    )}
    
    {items.length > 0 && (
      <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2 px-2">
        <span className="text-xs text-gray-500">{title} 합계</span>
        <span className="text-sm font-bold text-red-500">{totalAmount.toLocaleString()}만원</span>
      </div>
    )}
  </div>
);

// ============================================
// 옵션 데이터
// ============================================
const interestOptions = [
  { id: 'saving', label: '💰 돈 모으기' }, { id: 'house', label: '🏠 내집 마련' },
  { id: 'retire', label: '🏖️ 노후 준비' }, { id: 'education', label: '👶 자녀 교육비' },
  { id: 'debt', label: '💳 빚 갚기' }, { id: 'invest', label: '📈 투자 시작' },
  { id: 'insurance', label: '🛡️ 보험 점검' }, { id: 'tax', label: '💸 세금 절약' },
];

const goalOptions = [
  { id: 'billion', label: '10억 만들기', icon: '💵' }, { id: 'house', label: '내집 마련', icon: '🏠' },
  { id: 'early-retire', label: '조기 은퇴', icon: '🏖️' }, { id: 'children', label: '자녀 독립', icon: '🎓' },
];

const jobOptions = [
  { id: 'employee', label: '직장인', icon: '👔' }, { id: 'business', label: '자영업', icon: '🏪' },
  { id: 'freelancer', label: '프리랜서', icon: '💻' }, { id: 'public', label: '공무원', icon: '🏛️' },
  { id: 'homemaker', label: '전업주부', icon: '🏠' }, { id: 'student', label: '학생', icon: '📚' },
  { id: 'other', label: '기타', icon: '👤' },
];

// ============================================
// 단위 정규화 함수: 어떤 단위로 들어오든 만원 단위로 변환
// 100000 이상이면 원 단위로 간주하여 변환
// (월수입 10만 만원 = 10억 이상은 현실적으로 없음)
// ============================================
const normalizeToManwon = (value: number): number => {
  if (!value || value === 0) return 0;
  if (value >= 100000) {
    return Math.round(value / 10000);
  }
  return value;
};

// ============================================
// UUID 생성 함수
// ============================================
const generateId = () => Math.random().toString(36).substr(2, 9);

// ============================================
// 메인 컴포넌트
// ============================================
export default function FinancialHouseBasic({ userName, onComplete, onBack, existingFinancialResult, existingIncomeExpense, initialStep = 1 }: FinancialHouseBasicProps) {
  const { data, updatePersonalInfo, updateFinancialInfo } = useFinancialHouse();
  
  // ============================================
  // v4.0: 컴포넌트 외부에서 저장된 데이터 로딩 (초기값으로 사용)
  // ============================================
  const savedData = loadSavedData();
  
  // ★★★ v5.0 수정: initialStep props로 초기 스텝 설정 ★★★
  const [currentStep, setCurrentStep] = useState(initialStep);
  const totalSteps = 5;

  // ============================================
  // Step 1: 인적사항 (v4.0: localStorage 우선, 없으면 기존값/기본값)
  // ============================================
  const [name, setName] = useState(
    savedData?.personalInfo?.name || existingFinancialResult?.name || data.personalInfo.name || userName
  );
  const [age, setAge] = useState(
    savedData?.personalInfo?.age || existingFinancialResult?.age || data.personalInfo.age || 35
  );
  const [married, setMarried] = useState(
    savedData?.personalInfo?.married ?? data.personalInfo.married
  );
  const [job, setJob] = useState(
    savedData?.personalInfo?.job || data.personalInfo.job || ''
  );
  const [familyCount, setFamilyCount] = useState(
    savedData?.personalInfo?.familyCount || existingIncomeExpense?.familySize || data.personalInfo.familyCount || 1
  );
  const [retireAge, setRetireAge] = useState(
    savedData?.personalInfo?.retireAge || data.retirePlan.retireAge || 65
  );
  const [dualIncome, setDualIncome] = useState(
    savedData?.personalInfo?.dualIncome ?? data.personalInfo.dualIncome
  );

  // ============================================
  // Step 2: 관심사/목표 (v4.0: localStorage 우선)
  // ============================================
  const [interests, setInterests] = useState<string[]>(savedData?.interests || []);
  const [goal, setGoal] = useState(savedData?.goal || '');

  // ============================================
  // Step 3: 수입 (v4.0: localStorage 우선)
  // ============================================
  const [myIncome, setMyIncome] = useState(savedData?.income?.myIncome || 0);
  const [spouseIncome, setSpouseIncome] = useState(savedData?.income?.spouseIncome || 0);
  const [otherIncome, setOtherIncome] = useState(savedData?.income?.otherIncome || 0);
  const [bonusIncome, setBonusIncome] = useState(savedData?.irregularIncome?.bonusIncome || 0);
  const [incentiveIncome, setIncentiveIncome] = useState(savedData?.irregularIncome?.incentiveIncome || 0);
  const [otherIrregularIncome, setOtherIrregularIncome] = useState(savedData?.irregularIncome?.otherIrregularIncome || 0);

  // ============================================
  // Step 3: 지출 (v4.0: localStorage 우선)
  // ============================================
  const [cmaAmount, setCmaAmount] = useState(savedData?.expense?.cmaAmount || 0);
  const [savingsAmount, setSavingsAmount] = useState(savedData?.expense?.savingsAmount || 0);
  const [fundAmount, setFundAmount] = useState(savedData?.expense?.fundAmount || 0);
  const [housingSubAmount, setHousingSubAmount] = useState(savedData?.expense?.housingSubAmount || 0);
  const [isaAmount, setIsaAmount] = useState(savedData?.expense?.isaAmount || 0);
  const [pensionAmount, setPensionAmount] = useState(savedData?.expense?.pensionAmount || 0);
  const [taxFreePensionAmount, setTaxFreePensionAmount] = useState(savedData?.expense?.taxFreePensionAmount || 0);
  const [insuranceAmount, setInsuranceAmount] = useState(savedData?.expense?.insuranceAmount || 0);
  const [loanPaymentAmount, setLoanPaymentAmount] = useState(savedData?.expense?.loanPaymentAmount || 0);
  const [surplusAmount, setSurplusAmount] = useState(savedData?.expense?.surplusAmount || 0);

  // ============================================
  // Step 4: 금융자산 (v4.0: localStorage 우선)
  // ============================================
  const [cmaAsset, setCmaAsset] = useState(savedData?.financialAssets?.cmaAsset || 0);
  const [goldAsset, setGoldAsset] = useState(savedData?.financialAssets?.goldAsset || 0);
  const [bondAsset, setBondAsset] = useState(savedData?.financialAssets?.bondAsset || 0);
  const [depositAsset, setDepositAsset] = useState(savedData?.financialAssets?.depositAsset || 0);
  const [installmentAsset, setInstallmentAsset] = useState(savedData?.financialAssets?.installmentAsset || 0);
  const [pensionAsset, setPensionAsset] = useState(savedData?.financialAssets?.pensionAsset || 0);
  const [savingsAsset, setSavingsAsset] = useState(savedData?.financialAssets?.savingsAsset || 0);
  const [fundSavingsAsset, setFundSavingsAsset] = useState(savedData?.financialAssets?.fundSavingsAsset || 0);
  const [etfAsset, setEtfAsset] = useState(savedData?.financialAssets?.etfAsset || 0);
  const [stockAsset, setStockAsset] = useState(savedData?.financialAssets?.stockAsset || 0);
  const [cryptoAsset, setCryptoAsset] = useState(savedData?.financialAssets?.cryptoAsset || 0);
  const [insuranceRefundAsset, setInsuranceRefundAsset] = useState(savedData?.financialAssets?.insuranceRefundAsset || 0);

  // ============================================
  // Step 4: 부동산자산 (v4.0: localStorage 우선)
  // ============================================
  const [residentialRealEstate, setResidentialRealEstate] = useState(savedData?.realEstateAssets?.residentialRealEstate || 0);
  const [investmentRealEstate, setInvestmentRealEstate] = useState(savedData?.realEstateAssets?.investmentRealEstate || 0);

  // ============================================
  // Step 5: 부채 (v4.0: localStorage 우선)
  // ============================================
  const [mortgageDebts, setMortgageDebts] = useState<DebtItem[]>(savedData?.debts?.mortgageDebts || []);
  const [creditDebts, setCreditDebts] = useState<DebtItem[]>(savedData?.debts?.creditDebts || []);
  const [otherDebts, setOtherDebts] = useState<DebtItem[]>(savedData?.debts?.otherDebts || []);
  const [emergencyFund, setEmergencyFund] = useState(savedData?.debts?.emergencyFund || 0);
  const [showSummary, setShowSummary] = useState(false);

  // ============================================
  // v4.0: 현재 입력값을 localStorage에 저장하는 함수 (useCallback으로 최적화)
  // ============================================
  const saveDraftToStorage = useCallback(() => {
    try {
      const draftData = {
        lastUpdated: new Date().toISOString(),
        personalInfo: { name, age, married, job, familyCount, retireAge, dualIncome },
        interests,
        goal,
        income: { myIncome, spouseIncome, otherIncome },
        irregularIncome: { bonusIncome, incentiveIncome, otherIrregularIncome },
        expense: { cmaAmount, savingsAmount, fundAmount, housingSubAmount, isaAmount, pensionAmount, taxFreePensionAmount, insuranceAmount, loanPaymentAmount, surplusAmount },
        financialAssets: { cmaAsset, goldAsset, bondAsset, depositAsset, installmentAsset, pensionAsset, savingsAsset, fundSavingsAsset, etfAsset, stockAsset, cryptoAsset, insuranceRefundAsset },
        realEstateAssets: { residentialRealEstate, investmentRealEstate },
        debts: { mortgageDebts, creditDebts, otherDebts, emergencyFund }
      };
      localStorage.setItem(BASIC_STORAGE_KEY, JSON.stringify(draftData));
      console.log('[FinancialHouseBasic] 임시 저장 완료:', draftData);
    } catch (e) {
      console.error('[FinancialHouseBasic] 임시 저장 실패:', e);
    }
  }, [
    name, age, married, job, familyCount, retireAge, dualIncome,
    interests, goal,
    myIncome, spouseIncome, otherIncome,
    bonusIncome, incentiveIncome, otherIrregularIncome,
    cmaAmount, savingsAmount, fundAmount, housingSubAmount, isaAmount, pensionAmount, taxFreePensionAmount, insuranceAmount, loanPaymentAmount, surplusAmount,
    cmaAsset, goldAsset, bondAsset, depositAsset, installmentAsset, pensionAsset, savingsAsset, fundSavingsAsset, etfAsset, stockAsset, cryptoAsset, insuranceRefundAsset,
    residentialRealEstate, investmentRealEstate,
    mortgageDebts, creditDebts, otherDebts, emergencyFund
  ]);

  // ============================================
  // v4.0 신규: 값이 변경될 때마다 자동 저장 (debounce 효과)
  // ============================================
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraftToStorage();
    }, 500); // 500ms 후 저장 (타이핑 중 과도한 저장 방지)
    
    return () => clearTimeout(timer);
  }, [saveDraftToStorage]);

  // ============================================
  // v5.0 추가: initialStep이 변경되면 currentStep 업데이트
  // ============================================
  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  // ============================================
  // 부채 항목 추가/수정/삭제 함수
  // ============================================
  const addMortgageDebt = () => {
    setMortgageDebts([...mortgageDebts, { id: generateId(), name: '', amount: 0, rate: 0 }]);
  };
  
  const addCreditDebt = () => {
    setCreditDebts([...creditDebts, { id: generateId(), name: '', amount: 0, rate: 0 }]);
  };
  
  const addOtherDebt = () => {
    setOtherDebts([...otherDebts, { id: generateId(), name: '', amount: 0, rate: 0 }]);
  };
  
  const updateMortgageDebt = (id: string, field: 'name' | 'amount' | 'rate', value: string | number) => {
    setMortgageDebts(mortgageDebts.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  const updateCreditDebt = (id: string, field: 'name' | 'amount' | 'rate', value: string | number) => {
    setCreditDebts(creditDebts.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  const updateOtherDebt = (id: string, field: 'name' | 'amount' | 'rate', value: string | number) => {
    setOtherDebts(otherDebts.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  const deleteMortgageDebt = (id: string) => {
    setMortgageDebts(mortgageDebts.filter(item => item.id !== id));
  };
  
  const deleteCreditDebt = (id: string) => {
    setCreditDebts(creditDebts.filter(item => item.id !== id));
  };
  
  const deleteOtherDebt = (id: string) => {
    setOtherDebts(otherDebts.filter(item => item.id !== id));
  };

  // ============================================
  // 계산값
  // ============================================
  const totalMonthlyIncome = myIncome + spouseIncome + otherIncome;
  const totalIrregularIncome = bonusIncome + incentiveIncome + otherIrregularIncome;
  const totalExpenseWithoutLiving = cmaAmount + savingsAmount + fundAmount + housingSubAmount + isaAmount + pensionAmount + taxFreePensionAmount + insuranceAmount + loanPaymentAmount + surplusAmount;
  const livingExpense = Math.max(0, totalMonthlyIncome - totalExpenseWithoutLiving);
  const totalExpense = totalExpenseWithoutLiving + livingExpense;
  
  // 금융자산 합계
  const totalFinancialAsset = cmaAsset + goldAsset + bondAsset + depositAsset + installmentAsset + pensionAsset + savingsAsset + fundSavingsAsset + etfAsset + stockAsset + cryptoAsset + insuranceRefundAsset;
  
  // 부동산자산 합계
  const totalRealEstateAsset = residentialRealEstate + investmentRealEstate;
  
  // 총 자산 = 금융자산 + 부동산자산
  const totalAsset = totalFinancialAsset + totalRealEstateAsset;
  
  // 부채 합계
  const totalMortgageDebt = mortgageDebts.reduce((sum, item) => sum + item.amount, 0);
  const totalCreditDebt = creditDebts.reduce((sum, item) => sum + item.amount, 0);
  const totalOtherDebt = otherDebts.reduce((sum, item) => sum + item.amount, 0);
  const totalDebt = totalMortgageDebt + totalCreditDebt + totalOtherDebt;
  
  const progress = (currentStep / totalSteps) * 100;

  // ============================================
  // 합계 표시값
  // ============================================
  const existingIncome = normalizeToManwon(existingIncomeExpense?.income || existingFinancialResult?.income || 0);
  const existingExpenseRaw = existingIncomeExpense ? 
    (existingIncomeExpense.loanPayment + existingIncomeExpense.insurance + existingIncomeExpense.pension + existingIncomeExpense.savings + existingIncomeExpense.surplus + existingIncomeExpense.livingExpense) : 0;
  const existingExpense = normalizeToManwon(existingExpenseRaw);
  const existingAssets = normalizeToManwon(existingFinancialResult?.assets || 0);
  const existingDebt = normalizeToManwon(existingFinancialResult?.debt || 0);

  const displayIncome = totalMonthlyIncome > 0 ? totalMonthlyIncome : existingIncome;
  const displayExpense = totalExpense > 0 ? totalExpense : existingExpense;
  const displayAsset = totalAsset > 0 ? totalAsset : existingAssets;
  const displayDebt = totalDebt > 0 ? totalDebt : existingDebt;

  // ============================================
  // DESIRE 6단계 판별 로직
  // ============================================
  const getDesireStage = (): { stage: number; label: string; description: string; color: string } => {
    if (totalCreditDebt > 0) {
      return { stage: 1, label: 'D단계 (Debt Free)', description: '신용대출 상환이 필요합니다', color: 'text-red-600' };
    }
    if (emergencyFund === 0) {
      return { stage: 2, label: 'E단계 (Emergency Fund)', description: '비상예비자금 마련이 필요합니다', color: 'text-orange-600' };
    }
    const savingsTotal = savingsAmount + fundAmount + pensionAmount + taxFreePensionAmount;
    const savingsTarget = displayIncome * 0.2;
    if (savingsTotal < savingsTarget) {
      return { stage: 3, label: 'S단계 (Savings)', description: '적립식 저축투자 확대가 필요합니다', color: 'text-yellow-600' };
    }
    if (displayAsset <= 100000) {
      return { stage: 4, label: 'I단계 (Investment)', description: '금융자산 10억 목표 달성 중', color: 'text-blue-600' };
    }
    if (totalMortgageDebt > 0) {
      return { stage: 5, label: 'R단계 (Retirement)', description: '담보대출 상환이 필요합니다', color: 'text-purple-600' };
    }
    return { stage: 6, label: 'E단계 (Enjoy)', description: '경제적 자유 달성! 🎉', color: 'text-emerald-600' };
  };

  const desireResult = getDesireStage();

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) setInterests(interests.filter(i => i !== id));
    else if (interests.length < 2) setInterests([...interests, id]);
    else alert('경제적 관심사는 최대 2개까지 선택 가능합니다.');
  };

  // ============================================
  // goNext (v4.1: localStorage 삭제 제거 - 2단계 복귀 시 데이터 유지)
  // ============================================
  const goNext = () => {
    if (currentStep === 2) {
      if (interests.length < 1) { alert('경제적 관심사를 1개 이상 선택해 주세요.'); return; }
      if (!goal) { alert('재무 목표를 선택해 주세요.'); return; }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      if (currentStep === totalSteps - 1) setTimeout(() => setShowSummary(true), 300);
    } else { 
      saveAllData(); 
      // v4.1: 임시 저장 데이터 삭제하지 않음 (2단계에서 돌아올 때 데이터 유지 필요)
      // localStorage.removeItem(BASIC_STORAGE_KEY);
      onComplete(); 
    }
  };

  // ============================================
  // goPrev
  // ============================================
  const goPrev = () => {
    setShowSummary(false);
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else onBack();
  };

  const saveAllData = () => {
    updatePersonalInfo({ name, age, married, job: job as 'employee' | 'business' | 'freelancer' | 'public' | 'homemaker' | 'student' | 'other' | '', familyCount, dualIncome });
    updateFinancialInfo({ monthlyIncome: displayIncome, irregularIncome: totalIrregularIncome, monthlyExpense: displayExpense, totalAssets: displayAsset, totalDebt: displayDebt });
    localStorage.setItem('financialHouseCompleted', 'true');
    localStorage.setItem('financialHouseData', JSON.stringify({
      interests, goal, personalInfo: { name, age, married, job, familyCount, retireAge, dualIncome },
      income: { myIncome, spouseIncome, otherIncome }, irregularIncome: { bonusIncome, incentiveIncome, otherIrregularIncome },
      expense: { cmaAmount, savingsAmount, fundAmount, housingSubAmount, isaAmount, pensionAmount, taxFreePensionAmount, insuranceAmount, loanPaymentAmount, surplusAmount, livingExpense },
      financialAssets: { cmaAsset, goldAsset, bondAsset, depositAsset, installmentAsset, pensionAsset, savingsAsset, fundSavingsAsset, etfAsset, stockAsset, cryptoAsset, insuranceRefundAsset },
      realEstateAssets: { residentialRealEstate, investmentRealEstate },
      totalFinancialAsset, totalRealEstateAsset, totalAsset,
      debts: { 
        mortgageDebts,
        creditDebts,
        otherDebts,
        emergencyFund,
        totalMortgageDebt,
        totalCreditDebt,
        totalOtherDebt,
        totalDebt
      },
      desireStage: desireResult,
    }));
  };

  const stepLabels = ['인적사항 입력 중...', '경제적 관심사 선택 중...', '수입/지출 입력 중...', '자산 입력 중...', '부채/요약 확인 중...'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={goPrev} className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600">←</button>
        <h1 className="flex-1 text-lg font-bold text-gray-900">기본정보 입력</h1>
        <span className="text-sm text-gray-400 font-semibold">{currentStep}/{totalSteps}</span>
      </div>
      <div className="bg-white px-4 py-3">
        <div className="flex justify-between mb-2"><span className="text-xs text-gray-500 font-semibold">{stepLabels[currentStep - 1]}</span><span className="text-xs text-teal-500 font-bold">{Math.round(progress)}%</span></div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="flex justify-center gap-2 py-3 bg-white">
        {[1,2,3,4,5].map(s => <div key={s} className={`h-2 rounded-full transition-all ${s === currentStep ? 'w-6 bg-teal-500' : s < currentStep ? 'w-2 bg-emerald-500' : 'w-2 bg-gray-300'}`} />)}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Step 1: 인적사항 */}
        {currentStep === 1 && (
          <>
            <div className="flex gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1"><p className="text-sm text-gray-700">먼저 <span className="text-teal-600 font-bold">인적사항</span>부터 입력해 주세요! 😊</p></div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">👤</div><div><h3 className="font-bold text-gray-900">인적사항</h3><p className="text-xs text-gray-400">기본 정보 입력</p></div></div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">이름 <span className="text-red-500">*</span></label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">나이 <span className="text-red-500">*</span></label><div className="relative"><input type="text" inputMode="numeric" pattern="[0-9]*" value={age === 0 ? '' : String(age)} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); setAge(val ? parseInt(val, 10) : 0); }} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 pr-8" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">세</span></div></div>
              </div>
              <div className="mb-3"><label className="block text-xs font-semibold text-gray-500 mb-2">결혼 여부</label><div className="grid grid-cols-2 gap-2"><button onClick={() => setMarried(true)} className={`py-3 rounded-lg border-2 text-sm font-semibold ${married ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}><span className="block text-lg mb-1">💑</span>기혼</button><button onClick={() => { setMarried(false); setDualIncome(false); }} className={`py-3 rounded-lg border-2 text-sm font-semibold ${!married ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}><span className="block text-lg mb-1">👤</span>미혼</button></div></div>
              <div className="mb-3"><label className="block text-xs font-semibold text-gray-500 mb-2">직업</label><div className="grid grid-cols-4 gap-2">{jobOptions.map(o => <button key={o.id} onClick={() => setJob(o.id)} className={`py-2 rounded-lg border-2 text-xs font-semibold ${job === o.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}><span className="block text-base mb-0.5">{o.icon}</span>{o.label}</button>)}</div></div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">가족 수</label><div className="relative"><input type="text" inputMode="numeric" pattern="[0-9]*" value={familyCount === 0 ? '' : String(familyCount)} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); setFamilyCount(val ? parseInt(val, 10) : 0); }} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 pr-8" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">명</span></div></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">은퇴 예정 나이</label><div className="relative"><input type="text" inputMode="numeric" pattern="[0-9]*" value={retireAge === 0 ? '' : String(retireAge)} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); setRetireAge(val ? parseInt(val, 10) : 0); }} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 pr-8" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">세</span></div></div>
              </div>
              {married && <div><label className="block text-xs font-semibold text-gray-500 mb-2">맞벌이 여부</label><div className="grid grid-cols-2 gap-2"><button onClick={() => setDualIncome(true)} className={`py-3 rounded-lg border-2 text-sm font-semibold ${dualIncome ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}><span className="block text-lg mb-1">👫</span>맞벌이</button><button onClick={() => setDualIncome(false)} className={`py-3 rounded-lg border-2 text-sm font-semibold ${!dualIncome ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}><span className="block text-lg mb-1">👤</span>외벌이</button></div></div>}
            </div>
          </>
        )}

        {/* Step 2: 관심사/목표 */}
        {currentStep === 2 && (
          <>
            <div className="flex gap-3 mb-4"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div><div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1"><p className="text-sm text-gray-700"><span className="text-teal-600 font-bold">관심사 1-2개</span>와 <span className="text-teal-600 font-bold">목표 1개</span>를 선택! 🎯</p></div></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl">🎯</div><div><h3 className="font-bold text-gray-900">경제적 관심사</h3><p className="text-xs text-gray-400">1-2개 선택 ({interests.length}/2)</p></div></div>
              <div className="flex flex-wrap gap-2">{interestOptions.map(o => <button key={o.id} onClick={() => toggleInterest(o.id)} className={`px-3 py-2 rounded-full border-2 text-xs font-semibold ${interests.includes(o.id) ? 'border-teal-500 bg-teal-500 text-white' : 'border-gray-200 text-gray-500'}`}>{o.label}</button>)}</div>
              {interests.length < 1 && <p className="text-xs text-amber-600 mt-2">※ 최소 1개 이상 선택</p>}
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl">🌟</div><div><h3 className="font-bold text-gray-900">재무 목표</h3><p className="text-xs text-gray-400">1개 선택</p></div></div>
              <div className="grid grid-cols-2 gap-2">{goalOptions.map(o => <button key={o.id} onClick={() => setGoal(o.id)} className={`py-3 rounded-lg border-2 text-sm font-semibold ${goal === o.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}><span className="block text-xl mb-1">{o.icon}</span>{o.label}</button>)}</div>
            </div>
          </>
        )}

        {/* Step 3: 수입/지출 */}
        {currentStep === 3 && (
          <>
            <div className="flex gap-3 mb-4"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div><div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1"><p className="text-sm text-gray-700"><span className="text-teal-600 font-bold">수입과 지출</span> 입력! 생활비는 자동계산 💰</p></div></div>
            
            {/* 월수입 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">💵</div><div><h3 className="font-bold text-gray-900">월 수입</h3><p className="text-xs text-gray-400">세후 기준</p></div></div>
              <InputRow label="본인 소득" value={myIncome} onChange={setMyIncome} icon="👨‍💼" />
              {(married && dualIncome) && <InputRow label="배우자 소득" value={spouseIncome} onChange={setSpouseIncome} icon="👩‍💼" />}
              <InputRow label="기타 소득" value={otherIncome} onChange={setOtherIncome} icon="💼" />
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
                <span className="text-sm font-semibold text-gray-700">월 수입 합계</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-600">{displayIncome.toLocaleString()}만원</span>
                  {totalMonthlyIncome === 0 && existingIncome > 0 && <span className="text-xs text-gray-400 ml-1">(기존)</span>}
                </div>
              </div>
            </div>
            
            {/* 비정기수입 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl">🎁</div><div><h3 className="font-bold text-gray-900">비정기 수입</h3><p className="text-xs text-gray-400">연간 기준</p></div></div>
              <InputRow label="상여금" value={bonusIncome} onChange={setBonusIncome} icon="🎉" />
              <InputRow label="인센티브" value={incentiveIncome} onChange={setIncentiveIncome} icon="🏆" />
              <InputRow label="기타" value={otherIrregularIncome} onChange={setOtherIrregularIncome} icon="📦" />
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between"><span className="text-sm font-semibold text-gray-700">비정기 수입 합계</span><span className="text-lg font-bold text-purple-600">{totalIrregularIncome.toLocaleString()}만원/년</span></div>
            </div>
            
            {/* 월지출 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl">💸</div><div><h3 className="font-bold text-gray-900">월 지출</h3><p className="text-xs text-gray-400">생활비 자동계산</p></div></div>
              <InputRow label="CMA(파킹통장)" value={cmaAmount} onChange={setCmaAmount} icon="🏦" />
              <InputRow label="적금" value={savingsAmount} onChange={setSavingsAmount} icon="💰" />
              <InputRow label="펀드(ETF)" value={fundAmount} onChange={setFundAmount} icon="📊" />
              <InputRow label="청약저축" value={housingSubAmount} onChange={setHousingSubAmount} icon="🏠" />
              <InputRow label="ISA" value={isaAmount} onChange={setIsaAmount} icon="📈" />
              <InputRow label="개인연금" value={pensionAmount} onChange={setPensionAmount} icon="🏖️" />
              <InputRow label="비과세연금보험" value={taxFreePensionAmount} onChange={setTaxFreePensionAmount} icon="🛡️" />
              <InputRow label="보장성보험료" value={insuranceAmount} onChange={setInsuranceAmount} icon="🩺" />
              <InputRow label="대출원리금" value={loanPaymentAmount} onChange={setLoanPaymentAmount} icon="💳" />
              <InputRow label="잉여자금" value={surplusAmount} onChange={setSurplusAmount} icon="💎" />
              <div className="mt-2"><AutoCalcRow label="생활비" value={livingExpense} icon="🛒" /></div>
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
                <span className="text-sm font-semibold text-gray-700">월 지출 합계</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-red-500">{displayExpense.toLocaleString()}만원</span>
                  {totalExpense === 0 && existingExpense > 0 && <span className="text-xs text-gray-400 ml-1">(기존)</span>}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 4: 자산 (금융자산 + 부동산자산) */}
        {currentStep === 4 && (
          <>
            <div className="flex gap-3 mb-4"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div><div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1"><p className="text-sm text-gray-700">현재 보유 <span className="text-teal-600 font-bold">자산</span> 입력! 💎</p></div></div>
            
            {/* 금융자산 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">💰</div><div><h3 className="font-bold text-gray-900">금융자산</h3><p className="text-xs text-gray-400">현금, 예금, 투자자산 등</p></div></div>
              <InputRow label="CMA(현금)" value={cmaAsset} onChange={setCmaAsset} icon="💵" />
              <InputRow label="금(GOLD)" value={goldAsset} onChange={setGoldAsset} icon="🥇" />
              <InputRow label="채권" value={bondAsset} onChange={setBondAsset} icon="📜" />
              <InputRow label="예금" value={depositAsset} onChange={setDepositAsset} icon="🏦" />
              <InputRow label="적금/적립금" value={installmentAsset} onChange={setInstallmentAsset} icon="📥" />
              <InputRow label="연금적립금" value={pensionAsset} onChange={setPensionAsset} icon="🏖️" />
              <InputRow label="저축적립금" value={savingsAsset} onChange={setSavingsAsset} icon="💰" />
              <InputRow label="펀드적립금" value={fundSavingsAsset} onChange={setFundSavingsAsset} icon="📊" />
              <InputRow label="ETF(펀드)" value={etfAsset} onChange={setEtfAsset} icon="📈" />
              <InputRow label="주식" value={stockAsset} onChange={setStockAsset} icon="📉" />
              <InputRow label="가상화폐" value={cryptoAsset} onChange={setCryptoAsset} icon="₿" />
              <InputRow label="보험해약환급금" value={insuranceRefundAsset} onChange={setInsuranceRefundAsset} icon="🛡️" />
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
                <span className="text-sm font-semibold text-gray-700">금융자산 소계</span>
                <span className="text-lg font-bold text-indigo-600">{totalFinancialAsset.toLocaleString()}만원</span>
              </div>
            </div>
            
            {/* 부동산자산 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl">🏠</div><div><h3 className="font-bold text-gray-900">부동산자산</h3><p className="text-xs text-gray-400">주거용, 투자용 부동산</p></div></div>
              <InputRow label="주거용부동산" value={residentialRealEstate} onChange={setResidentialRealEstate} icon="🏡" />
              <InputRow label="투자용부동산" value={investmentRealEstate} onChange={setInvestmentRealEstate} icon="🏢" />
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
                <span className="text-sm font-semibold text-gray-700">부동산자산 소계</span>
                <span className="text-lg font-bold text-amber-600">{totalRealEstateAsset.toLocaleString()}만원</span>
              </div>
            </div>
            
            {/* 총 자산 */}
            <div className="bg-gradient-to-r from-indigo-50 to-amber-50 rounded-2xl p-4 border border-indigo-200">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">💎 총 자산</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-indigo-600">{displayAsset.toLocaleString()}만원</span>
                  {totalAsset === 0 && existingAssets > 0 && <span className="text-xs text-gray-400 ml-1">(기존)</span>}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">= 금융자산 {totalFinancialAsset.toLocaleString()}만원 + 부동산자산 {totalRealEstateAsset.toLocaleString()}만원</div>
            </div>
          </>
        )}

        {/* Step 5: 부채/요약 */}
        {currentStep === 5 && (
          <>
            <div className="flex gap-3 mb-4"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div><div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1"><p className="text-sm text-gray-700">마지막 <span className="text-teal-600 font-bold">부채</span> 입력! 📋</p></div></div>
            
            {/* 부채 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl">💳</div>
                <div>
                  <h3 className="font-bold text-gray-900">부채</h3>
                  <p className="text-xs text-gray-400">현재 대출 잔액</p>
                </div>
              </div>
              
              <DebtSection
                title="담보대출"
                icon="🏠"
                items={mortgageDebts}
                onAdd={addMortgageDebt}
                onUpdate={updateMortgageDebt}
                onDelete={deleteMortgageDebt}
                totalAmount={totalMortgageDebt}
              />
              
              <DebtSection
                title="신용대출"
                icon="💳"
                items={creditDebts}
                onAdd={addCreditDebt}
                onUpdate={updateCreditDebt}
                onDelete={deleteCreditDebt}
                totalAmount={totalCreditDebt}
              />
              
              <DebtSection
                title="기타부채(보증금)"
                icon="📦"
                items={otherDebts}
                onAdd={addOtherDebt}
                onUpdate={updateOtherDebt}
                onDelete={deleteOtherDebt}
                totalAmount={totalOtherDebt}
              />
              
              <div className="mt-4 pt-3 border-t-2 border-gray-300 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-700">총 부채</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-red-500">{displayDebt.toLocaleString()}만원</span>
                  {totalDebt === 0 && existingDebt > 0 && <span className="text-xs text-gray-400 ml-1">(기존)</span>}
                </div>
              </div>
            </div>
            
            {/* 비상예비자금 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">🆘</div><div><h3 className="font-bold text-gray-900">비상예비자금</h3><p className="text-xs text-gray-400">즉시 사용 가능 현금</p></div></div>
              <InputRow label="비상예비자금" value={emergencyFund} onChange={setEmergencyFund} icon="💵" />
              <div className="mt-2 p-3 bg-blue-50 rounded-lg"><p className="text-xs text-blue-700">💡 권장: 월소득 3~6배 ({(displayIncome*3).toLocaleString()}~{(displayIncome*6).toLocaleString()}만원)</p></div>
            </div>
            
            {/* 요약 카드 */}
            <div className={`transform transition-all duration-500 ${showSummary ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-4 border border-teal-200">
                <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-xl text-white">✓</div><div><h3 className="font-bold text-gray-900">📋 기본정보 요약</h3><p className="text-xs text-gray-400">입력 정보 확인</p></div></div>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5"><span className="text-sm text-gray-600">이름/나이</span><span className="text-sm font-semibold text-gray-900">{name}/{age}세</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-sm text-gray-600">가족구성</span><span className="text-sm font-semibold text-gray-900">{familyCount}명 ({married ? (dualIncome ? '맞벌이' : '외벌이') : '미혼'})</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-sm text-gray-600">월 수입</span><span className="text-sm font-semibold text-emerald-600">{displayIncome.toLocaleString()}만원</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-sm text-gray-600">월 지출</span><span className="text-sm font-semibold text-red-500">{displayExpense.toLocaleString()}만원</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-sm text-gray-600">금융자산</span><span className="text-sm font-semibold text-indigo-600">{totalFinancialAsset.toLocaleString()}만원</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-sm text-gray-600">부동산자산</span><span className="text-sm font-semibold text-amber-600">{totalRealEstateAsset.toLocaleString()}만원</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-sm text-gray-600">총 자산</span><span className="text-sm font-semibold text-indigo-600">{displayAsset.toLocaleString()}만원</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-sm text-gray-600">총 부채</span><span className="text-sm font-semibold text-red-500">{displayDebt.toLocaleString()}만원</span></div>
                  
                  {(mortgageDebts.length > 0 || creditDebts.length > 0 || otherDebts.length > 0) && (
                    <div className="pt-2 border-t border-teal-200 mt-2">
                      <p className="text-xs text-gray-500 mb-1">부채 상세:</p>
                      {mortgageDebts.length > 0 && <p className="text-xs text-gray-600 pl-2">• 담보대출 {mortgageDebts.length}건 ({totalMortgageDebt.toLocaleString()}만원)</p>}
                      {creditDebts.length > 0 && <p className="text-xs text-gray-600 pl-2">• 신용대출 {creditDebts.length}건 ({totalCreditDebt.toLocaleString()}만원)</p>}
                      {otherDebts.length > 0 && <p className="text-xs text-gray-600 pl-2">• 기타부채 {otherDebts.length}건 ({totalOtherDebt.toLocaleString()}만원)</p>}
                    </div>
                  )}
                  
                  <div className="flex justify-between py-2 border-t border-teal-200 mt-2"><span className="text-sm font-bold text-gray-900">💎 순자산</span><span className="text-lg font-bold text-teal-600">{(displayAsset - displayDebt).toLocaleString()}만원</span></div>
                  
                  {/* DESIRE 6단계 결과 */}
                  <div className="mt-3 pt-3 border-t border-teal-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎯</span>
                      <span className="text-sm font-bold text-gray-900">DESIRE 로드맵 현재 단계</span>
                    </div>
                    <div className={`p-3 rounded-xl ${desireResult.stage <= 2 ? 'bg-red-50 border border-red-200' : desireResult.stage <= 4 ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-base font-bold ${desireResult.color}`}>{desireResult.label}</span>
                        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">{desireResult.stage}/6단계</span>
                      </div>
                      <p className="text-xs text-gray-600">{desireResult.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* 하단 버튼 */}
      <div className="p-4 bg-white border-t border-gray-200 flex gap-3">
        <button onClick={goPrev} className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-600 font-semibold">이전</button>
        <button onClick={goNext} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-teal-400 to-teal-600 text-white font-bold shadow-lg shadow-teal-500/30">{currentStep === totalSteps ? '재무설계 시작 →' : '다음'}</button>
      </div>
    </div>
  );
}
