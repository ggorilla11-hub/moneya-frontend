// src/context/FinancialHouseContext.tsx
// 금융집짓기 데이터 전역 상태 관리 (중앙 창고)

import React, { createContext, useContext, useState, useEffect } from 'react';

// ============================================
// 타입 정의
// ============================================

// 인적사항
interface PersonalInfo {
  name: string;
  age: number;
  gender: 'male' | 'female' | '';
  married: boolean;
  familyCount: number;
  dualIncome: boolean;
  job: 'employee' | 'business' | 'freelancer' | 'public' | 'homemaker' | 'student' | 'other' | '';
}

// 재무사항
interface FinancialInfo {
  monthlyIncome: number;
  monthlyExpense: number;
  irregularIncome: number; // 비정기수입 (상여금, 보너스 등)
  totalAssets: number;
  totalDebt: number;
}

// 은퇴설계
interface RetirePlan {
  currentAge: number;
  retireAge: number;
  expectedLifespan: number; // 예상수명 (기본값 90)
  monthlyRetireExpense: number;
  currentRetireSavings: number;
}

// 부채설계
interface DebtPlan {
  hasDebt: boolean;
  debtList: {
    type: string;
    amount: number;
    interestRate: number;
    monthlyPayment: number;
  }[];
}

// 저축설계
interface SavingsPlan {
  monthlySavings: number;
  savingsGoal: number;
  emergencyFund: number; // 비상금
}

// 투자설계
interface InvestPlan {
  monthlyInvestment: number;
  investmentGoal: number;
  riskTolerance: 'low' | 'medium' | 'high' | '';
}

// 세금설계
interface TaxPlan {
  annualIncome: number;
  taxDeductions: number;
  hasTaxSavingsProducts: boolean;
}

// 부동산설계
interface EstatePlan {
  hasProperty: boolean;
  propertyValue: number;
  mortgageBalance: number;
  // 주택구입 계산용
  annualSalary: number;
  availableLoan: number;
  ownFunds: number;
  affordableHousePrice: number; // 계산 결과
}

// 보험설계
interface InsurancePlan {
  hasInsurance: boolean;
  insuranceList: {
    type: string;
    company: string;
    monthlyPremium: number;
    coverage: number;
  }[];
}

// DESIRE 단계 (1~6)
type DesireStage = 1 | 2 | 3 | 4 | 5 | 6;

// 전체 금융집짓기 데이터
interface FinancialHouseData {
  personalInfo: PersonalInfo;
  financialInfo: FinancialInfo;
  retirePlan: RetirePlan;
  debtPlan: DebtPlan;
  savingsPlan: SavingsPlan;
  investPlan: InvestPlan;
  taxPlan: TaxPlan;
  estatePlan: EstatePlan;
  insurancePlan: InsurancePlan;
  desireStage: DesireStage;
  currentStep: number; // 현재 진행 단계 (1단계, 2단계, 3단계)
  completedAt: Date | null; // 완료 시점
}

// ============================================
// 초기값 정의
// ============================================

const initialPersonalInfo: PersonalInfo = {
  name: '',
  age: 0,
  gender: '',
  married: false,
  familyCount: 1,
  dualIncome: false,
  job: '',
};

const initialFinancialInfo: FinancialInfo = {
  monthlyIncome: 0,
  monthlyExpense: 0,
  irregularIncome: 0,
  totalAssets: 0,
  totalDebt: 0,
};

const initialRetirePlan: RetirePlan = {
  currentAge: 0,
  retireAge: 60,
  expectedLifespan: 90,
  monthlyRetireExpense: 0,
  currentRetireSavings: 0,
};

const initialDebtPlan: DebtPlan = {
  hasDebt: false,
  debtList: [],
};

const initialSavingsPlan: SavingsPlan = {
  monthlySavings: 0,
  savingsGoal: 0,
  emergencyFund: 0,
};

const initialInvestPlan: InvestPlan = {
  monthlyInvestment: 0,
  investmentGoal: 0,
  riskTolerance: '',
};

const initialTaxPlan: TaxPlan = {
  annualIncome: 0,
  taxDeductions: 0,
  hasTaxSavingsProducts: false,
};

const initialEstatePlan: EstatePlan = {
  hasProperty: false,
  propertyValue: 0,
  mortgageBalance: 0,
  annualSalary: 0,
  availableLoan: 0,
  ownFunds: 0,
  affordableHousePrice: 0,
};

const initialInsurancePlan: InsurancePlan = {
  hasInsurance: false,
  insuranceList: [],
};

const initialFinancialHouseData: FinancialHouseData = {
  personalInfo: initialPersonalInfo,
  financialInfo: initialFinancialInfo,
  retirePlan: initialRetirePlan,
  debtPlan: initialDebtPlan,
  savingsPlan: initialSavingsPlan,
  investPlan: initialInvestPlan,
  taxPlan: initialTaxPlan,
  estatePlan: initialEstatePlan,
  insurancePlan: initialInsurancePlan,
  desireStage: 1,
  currentStep: 1,
  completedAt: null,
};

// ============================================
// Context 타입 정의
// ============================================

interface FinancialHouseContextType {
  // 데이터
  data: FinancialHouseData;
  
  // 데이터 업데이트 함수들
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateFinancialInfo: (info: Partial<FinancialInfo>) => void;
  updateRetirePlan: (plan: Partial<RetirePlan>) => void;
  updateDebtPlan: (plan: Partial<DebtPlan>) => void;
  updateSavingsPlan: (plan: Partial<SavingsPlan>) => void;
  updateInvestPlan: (plan: Partial<InvestPlan>) => void;
  updateTaxPlan: (plan: Partial<TaxPlan>) => void;
  updateEstatePlan: (plan: Partial<EstatePlan>) => void;
  updateInsurancePlan: (plan: Partial<InsurancePlan>) => void;
  
  // 단계 관리
  setCurrentStep: (step: number) => void;
  setDesireStage: (stage: DesireStage) => void;
  
  // 계산 함수들
  calculateAffordableHousePrice: () => number;
  calculateDesireStage: () => DesireStage;
  
  // 초기화
  resetAll: () => void;
}

// ============================================
// Context 생성
// ============================================

const FinancialHouseContext = createContext<FinancialHouseContextType | undefined>(undefined);

// ============================================
// Provider 컴포넌트
// ============================================

interface FinancialHouseProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export function FinancialHouseProvider({ children, userId = 'default' }: FinancialHouseProviderProps) {
  const [data, setData] = useState<FinancialHouseData>(initialFinancialHouseData);
  const storageKey = `moneya_financial_house_${userId}`;

  // localStorage에서 데이터 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // completedAt 날짜 변환
        if (parsed.completedAt) {
          parsed.completedAt = new Date(parsed.completedAt);
        }
        setData(parsed);
      }
    } catch (e) {
      console.error('금융집짓기 데이터 로드 실패:', e);
    }
  }, [storageKey]);

  // localStorage에 데이터 저장
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('금융집짓기 데이터 저장 실패:', e);
    }
  }, [data, storageKey]);

  // 인적사항 업데이트
  const updatePersonalInfo = (info: Partial<PersonalInfo>) => {
    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info },
    }));
  };

  // 재무사항 업데이트
  const updateFinancialInfo = (info: Partial<FinancialInfo>) => {
    setData(prev => ({
      ...prev,
      financialInfo: { ...prev.financialInfo, ...info },
    }));
  };

  // 은퇴설계 업데이트
  const updateRetirePlan = (plan: Partial<RetirePlan>) => {
    setData(prev => ({
      ...prev,
      retirePlan: { ...prev.retirePlan, ...plan },
    }));
  };

  // 부채설계 업데이트
  const updateDebtPlan = (plan: Partial<DebtPlan>) => {
    setData(prev => ({
      ...prev,
      debtPlan: { ...prev.debtPlan, ...plan },
    }));
  };

  // 저축설계 업데이트
  const updateSavingsPlan = (plan: Partial<SavingsPlan>) => {
    setData(prev => ({
      ...prev,
      savingsPlan: { ...prev.savingsPlan, ...plan },
    }));
  };

  // 투자설계 업데이트
  const updateInvestPlan = (plan: Partial<InvestPlan>) => {
    setData(prev => ({
      ...prev,
      investPlan: { ...prev.investPlan, ...plan },
    }));
  };

  // 세금설계 업데이트
  const updateTaxPlan = (plan: Partial<TaxPlan>) => {
    setData(prev => ({
      ...prev,
      taxPlan: { ...prev.taxPlan, ...plan },
    }));
  };

  // 부동산설계 업데이트
  const updateEstatePlan = (plan: Partial<EstatePlan>) => {
    setData(prev => ({
      ...prev,
      estatePlan: { ...prev.estatePlan, ...plan },
    }));
  };

  // 보험설계 업데이트
  const updateInsurancePlan = (plan: Partial<InsurancePlan>) => {
    setData(prev => ({
      ...prev,
      insurancePlan: { ...prev.insurancePlan, ...plan },
    }));
  };

  // 현재 단계 설정
  const setCurrentStep = (step: number) => {
    setData(prev => ({ ...prev, currentStep: step }));
  };

  // DESIRE 단계 설정
  const setDesireStage = (stage: DesireStage) => {
    setData(prev => ({ ...prev, desireStage: stage }));
  };

  // 구입가능 주택가격 계산 (단순 계산)
  const calculateAffordableHousePrice = (): number => {
    const { availableLoan, ownFunds } = data.estatePlan;
    return availableLoan + ownFunds;
  };

  // DESIRE 단계 자동 계산
  const calculateDesireStage = (): DesireStage => {
    const { totalDebt } = data.financialInfo;
    const { emergencyFund, monthlySavings } = data.savingsPlan;
    const { monthlyInvestment } = data.investPlan;
    const { currentRetireSavings } = data.retirePlan;
    const monthlyExpense = data.financialInfo.monthlyExpense;

    // 1단계: Debt Free - 신용대출이 있으면
    if (totalDebt > 0) return 1;

    // 2단계: Emergency Fund - 비상금이 월지출의 3~6개월 미만
    if (emergencyFund < monthlyExpense * 3) return 2;

    // 3단계: Savings - 저축 목표 달성 전
    if (monthlySavings === 0) return 3;

    // 4단계: Investment - 투자 시작 전
    if (monthlyInvestment === 0) return 4;

    // 5단계: Retirement - 은퇴자금 준비 중
    if (currentRetireSavings < monthlyExpense * 12 * 10) return 5;

    // 6단계: Enjoy - 모든 단계 완료
    return 6;
  };

  // 전체 초기화
  const resetAll = () => {
    setData(initialFinancialHouseData);
    localStorage.removeItem(storageKey);
  };

  return (
    <FinancialHouseContext.Provider
      value={{
        data,
        updatePersonalInfo,
        updateFinancialInfo,
        updateRetirePlan,
        updateDebtPlan,
        updateSavingsPlan,
        updateInvestPlan,
        updateTaxPlan,
        updateEstatePlan,
        updateInsurancePlan,
        setCurrentStep,
        setDesireStage,
        calculateAffordableHousePrice,
        calculateDesireStage,
        resetAll,
      }}
    >
      {children}
    </FinancialHouseContext.Provider>
  );
}

// ============================================
// 사용하기 쉽게 만든 Hook
// ============================================

export function useFinancialHouse() {
  const context = useContext(FinancialHouseContext);
  if (!context) {
    throw new Error('useFinancialHouse must be used within a FinancialHouseProvider');
  }
  return context;
}
