// 수입지출 데이터 타입
export interface IncomeExpenseData {
  familySize: number;
  income: number;
  loanPayment: number;
  insurance: number;
  pension: number;
  savings: number;
  surplus: number;
  livingExpense: number;
}

// 가족수별 예산 비율 (오원트 공식)
export const BUDGET_RATIOS: { [key: number]: { living: number; savings: number; pension: number; insurance: number; loan: number } } = {
  1: { living: 25, savings: 50, pension: 10, insurance: 5, loan: 10 },
  2: { living: 30, savings: 40, pension: 10, insurance: 10, loan: 10 },
  3: { living: 40, savings: 30, pension: 10, insurance: 10, loan: 10 },
  4: { living: 50, savings: 20, pension: 10, insurance: 10, loan: 10 },
  5: { living: 60, savings: 10, pension: 10, insurance: 10, loan: 10 },
};
