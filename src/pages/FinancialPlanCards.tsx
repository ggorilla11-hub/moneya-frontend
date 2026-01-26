// DebtPlanCard v2.0 - 대출상환 우선순위 리스트 생성
// FinancialHouseBasic에서 저장된 부채 데이터를 불러와서 상환 우선순위 표시

import { useState, useEffect } from 'react';
import { saveDesignData, loadDesignData } from './FinancialHouseDesign';

interface CardProps {
  onNext: () => void;
  onPrev: () => void;
  isLast?: boolean;
}

interface DebtItem {
  id: string;
  name: string;
  amount: number;
  rate: number;
  type: 'mortgage' | 'credit' | 'other';
}

// ============================================
// 2. 부채설계 카드 (v2.0 - 대출상환 우선순위 리스트)
// ============================================
export function DebtPlanCard({ onNext, onPrev }: CardProps) {
  const [showFormula, setShowFormula] = useState(false);
  
  // 기본정보 입력에서 저장된 부채 데이터 불러오기
  const [debtData, setDebtData] = useState<{
    mortgageDebts: DebtItem[];
    creditDebts: DebtItem[];
    otherDebts: DebtItem[];
    emergencyFund: number;
    totalMortgageDebt: number;
    totalCreditDebt: number;
    totalOtherDebt: number;
    totalDebt: number;
  }>({
    mortgageDebts: [],
    creditDebts: [],
    otherDebts: [],
    emergencyFund: 0,
    totalMortgageDebt: 0,
    totalCreditDebt: 0,
    totalOtherDebt: 0,
    totalDebt: 0,
  });
  
  const [monthlyIncome, setMonthlyIncome] = useState(500);

  useEffect(() => {
    // financialHouseData에서 부채 정보 불러오기
    const savedHouseData = localStorage.getItem('financialHouseData');
    if (savedHouseData) {
      try {
        const parsed = JSON.parse(savedHouseData);
        if (parsed.debts) {
          setDebtData({
            mortgageDebts: (parsed.debts.mortgageDebts || []).map((d: any) => ({ ...d, type: 'mortgage' })),
            creditDebts: (parsed.debts.creditDebts || []).map((d: any) => ({ ...d, type: 'credit' })),
            otherDebts: (parsed.debts.otherDebts || []).map((d: any) => ({ ...d, type: 'other' })),
            emergencyFund: parsed.debts.emergencyFund || 0,
            totalMortgageDebt: parsed.debts.totalMortgageDebt || 0,
            totalCreditDebt: parsed.debts.totalCreditDebt || 0,
            totalOtherDebt: parsed.debts.totalOtherDebt || 0,
            totalDebt: parsed.debts.totalDebt || 0,
          });
        }
        if (parsed.income?.myIncome) {
          setMonthlyIncome(parsed.income.myIncome + (parsed.income.spouseIncome || 0) + (parsed.income.otherIncome || 0));
        }
      } catch (e) {
        console.error('Failed to parse financialHouseData:', e);
      }
    }
    
    // 기존 부채설계 데이터도 확인 (호환성)
    const savedDebtDesign = loadDesignData('debt');
    if (savedDebtDesign?.monthlyIncome) {
      setMonthlyIncome(savedDebtDesign.monthlyIncome);
    }
  }, []);

  // 대출상환 우선순위 생성
  // 1. 신용대출 (금액 작은 것 → 큰 것)
  // 2. 기타부채
  // 3. 담보대출 (이자율 높은 것 → 낮은 것)
  const generateRepaymentPriority = (): DebtItem[] => {
    const allDebts: DebtItem[] = [];
    
    // 신용대출: 금액 작은 순
    const sortedCreditDebts = [...debtData.creditDebts]
      .filter(d => d.amount > 0)
      .sort((a, b) => a.amount - b.amount);
    allDebts.push(...sortedCreditDebts);
    
    // 기타부채: 금액 작은 순
    const sortedOtherDebts = [...debtData.otherDebts]
      .filter(d => d.amount > 0)
      .sort((a, b) => a.amount - b.amount);
    allDebts.push(...sortedOtherDebts);
    
    // 담보대출: 이자율 높은 순
    const sortedMortgageDebts = [...debtData.mortgageDebts]
      .filter(d => d.amount > 0)
      .sort((a, b) => b.rate - a.rate);
    allDebts.push(...sortedMortgageDebts);
    
    return allDebts;
  };

  const repaymentPriority = generateRepaymentPriority();
  const totalDebt = debtData.totalDebt;
  
  // DSR 계산 (간이)
  const estimatedMonthlyPayment = Math.round(totalDebt / 240); // 20년 상환 가정
  const dsr = monthlyIncome > 0 ? (estimatedMonthlyPayment / monthlyIncome * 100) : 0;
  
  let dsrLevel = '', dsrColor = '', dsrBgColor = '';
  if (dsr < 40) { 
    dsrLevel = '안전'; 
    dsrColor = 'text-green-600'; 
    dsrBgColor = 'bg-green-50 border-green-200';
  } else if (dsr < 50) { 
    dsrLevel = '주의'; 
    dsrColor = 'text-yellow-600'; 
    dsrBgColor = 'bg-yellow-50 border-yellow-200';
  } else { 
    dsrLevel = '위험'; 
    dsrColor = 'text-red-600'; 
    dsrBgColor = 'bg-red-50 border-red-200';
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'mortgage': return '담보';
      case 'credit': return '신용';
      case 'other': return '기타';
      default: return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mortgage': return 'bg-blue-100 text-blue-700';
      case 'credit': return 'bg-red-100 text-red-700';
      case 'other': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-3">
      {/* AI 메시지 */}
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">💳</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>두 번째는 <span className="text-teal-600 font-bold">부채설계</span>입니다. 대출상환 우선순위를 분석해 드릴게요.</p>
        </div>
      </div>
      
      {/* 부채 현황 요약 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">💳 부채 현황</h3>
        
        <div className="space-y-2">
          {debtData.totalCreditDebt > 0 && (
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-600">💳 신용대출 ({debtData.creditDebts.length}건)</span>
              <span className="font-bold text-red-600">{debtData.totalCreditDebt.toLocaleString()}만원</span>
            </div>
          )}
          {debtData.totalOtherDebt > 0 && (
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-600">📦 기타부채 ({debtData.otherDebts.length}건)</span>
              <span className="font-bold text-gray-600">{debtData.totalOtherDebt.toLocaleString()}만원</span>
            </div>
          )}
          {debtData.totalMortgageDebt > 0 && (
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-600">🏠 담보대출 ({debtData.mortgageDebts.length}건)</span>
              <span className="font-bold text-blue-600">{debtData.totalMortgageDebt.toLocaleString()}만원</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm py-2 border-t border-gray-200 mt-2">
            <span className="font-bold text-gray-800">총 부채</span>
            <span className="font-bold text-purple-700 text-lg">{(totalDebt / 10000).toFixed(1)}억원</span>
          </div>
        </div>
      </div>
      
      {/* DSR 분석 */}
      <div className={`rounded-xl p-4 border ${dsrBgColor}`}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">📊 DSR (추정)</span>
          <span className={`font-bold text-lg ${dsrColor}`}>{dsr.toFixed(1)}% ({dsrLevel})</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">월소득 {monthlyIncome.toLocaleString()}만원 기준</p>
      </div>
      
      {/* 대출상환 우선순위 */}
      {repaymentPriority.length > 0 ? (
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <h3 className="text-sm font-bold text-purple-800 mb-3">📋 대출상환 우선순위</h3>
          
          <div className="space-y-2">
            {repaymentPriority.map((debt, index) => (
              <div key={debt.id} className="flex items-center gap-2 bg-white rounded-lg p-2.5">
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${getTypeColor(debt.type)}`}>
                      {getTypeLabel(debt.type)}
                    </span>
                    <span className="text-sm font-medium text-gray-800 truncate">{debt.name || '무명'}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-gray-800">{debt.amount.toLocaleString()}만원</div>
                  <div className="text-[10px] text-gray-500">{debt.rate}%</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 상환 전략 안내 */}
          <div className="mt-3 p-3 bg-white/70 rounded-lg">
            <p className="text-xs text-purple-800 font-semibold mb-1">💡 상환 전략</p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              1️⃣ <strong>신용대출</strong>부터 상환 (금액 작은 순)<br/>
              2️⃣ <strong>기타부채</strong> 상환<br/>
              3️⃣ <strong>담보대출</strong>은 이자율 높은 순으로 상환
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 text-center">
          <span className="text-4xl">🎉</span>
          <p className="text-sm font-bold text-green-700 mt-2">부채가 없습니다!</p>
          <p className="text-xs text-green-600">건전한 재무 상태입니다.</p>
        </div>
      )}
      
      {/* 공식 보기 */}
      <button 
        onClick={() => setShowFormula(!showFormula)}
        className="w-full text-left text-xs text-teal-600 font-medium flex items-center gap-1 hover:text-teal-800 transition-colors"
      >
        <span>📐 상환 우선순위 기준 보기</span>
        <span>{showFormula ? '▲' : '▼'}</span>
      </button>
      
      {showFormula && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1 border border-gray-200">
          <p><strong>상환 우선순위 기준:</strong></p>
          <p>① 신용대출: 금액이 작은 것부터 (스노우볼 효과)</p>
          <p>② 기타부채: 금액이 작은 것부터</p>
          <p>③ 담보대출: 이자율이 높은 것부터 (이자 절감)</p>
          <p className="mt-2 text-gray-400">* DSR = (연간 원리금 상환액 / 연소득) × 100</p>
        </div>
      )}
      
      {/* 버튼 */}
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm hover:from-teal-600 hover:to-teal-700 transition-colors">다음 →</button>
      </div>
    </div>
  );
}
