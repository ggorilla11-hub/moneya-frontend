// src/pages/FinancialPlanCards/shared.tsx
// 7개 재무설계 카드 공통 타입 및 컴포넌트
// 기존 FinancialPlanCards.tsx v4.4에서 추출

export interface CardProps {
  onNext: () => void;
  onPrev: () => void;
  isLast?: boolean;
  onOpenOCR?: () => void;
}

export const DisclaimerBox = () => (
  <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
    <p className="text-[10px] text-amber-700 text-center">
      ⚠️ 본 설계는 이해를 돕기 위한 일반적인 예시이므로 참고만 하시기 바랍니다. 이해를 돕기 위해 원가계산방식을 사용하였습니다.
    </p>
  </div>
);

// ============================================
// TaxInputRow - 세금설계 전용 입력 행 (외부 컴포넌트)
// TaxPlanCard 밖에 정의하여 불필요한 re-mount 방지
// ============================================
export const TaxInputRow = ({ label, value, onChange, unit = '만원', badge, badgeColor }: { 
  label: string; value: number; onChange: (v: number) => void; unit?: string; badge?: string; badgeColor?: string;
}) => {
  const handleFocusInput = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();
  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-600 truncate">{label}</span>
          {badge && <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${badgeColor || 'bg-blue-100 text-blue-600'}`}>{badge}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} onFocus={handleFocusInput}
          className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-right focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
        <span className="text-[10px] text-gray-400 w-6">{unit}</span>
      </div>
    </div>
  );
};

// ============================================
// EstateInputRow - 부동산설계 입력행 컴포넌트 (외부 분리)
// ============================================
export const EstateInputRow = ({ label, value, onChange, unit = '만원', badge, badgeColor }: { 
  label: string; value: number; onChange: (v: number) => void; unit?: string; badge?: string; badgeColor?: string;
}) => {
  const handleFocusInput = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();
  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-600 truncate">{label}</span>
          {badge && <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${badgeColor || 'bg-blue-100 text-blue-600'}`}>{badge}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} onFocus={handleFocusInput}
          className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-right focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
        <span className="text-[10px] text-gray-400 w-6">{unit}</span>
      </div>
    </div>
  );
};
