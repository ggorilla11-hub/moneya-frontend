// src/pages/FinancialPlanCards/index.ts
// 7개 재무설계 카드 re-export
// 기존 FinancialPlanCards.tsx v4.4의 export와 동일한 API 유지
//
// 사용법 (FinancialHouseDesign.tsx에서):
//   변경 전: import { RetirePlanCard, DebtPlanCard, ... } from './FinancialPlanCards';
//   변경 후: import { RetirePlanCard, DebtPlanCard, ... } from './FinancialPlanCards/index';
//   또는:   import { RetirePlanCard, DebtPlanCard, ... } from './FinancialPlanCards';
//
// ※ 기존 FinancialPlanCards.tsx 파일은 테스트 완료 전까지 절대 삭제하지 않음

export { RetirePlanCard } from './RetirePlanCard';
export { DebtPlanCard } from './DebtPlanCard';
export { SavePlanCard } from './SavePlanCard';
export { InvestPlanCard } from './InvestPlanCard';
export { TaxPlanCard } from './TaxPlanCard';
export { EstatePlanCard } from './EstatePlanCard';
export { InsurancePlanCard } from './InsurancePlanCard';

// 공통 타입도 re-export (필요한 경우)
export type { CardProps } from './shared';
