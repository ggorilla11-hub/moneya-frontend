// src/pages/FinancialPlanCards.tsx
// v2.0: 7개 재무설계 카드 컴포넌트 - 신규버전 UI 적용
// ★★★ 음성/대화 코드는 FinancialHouseDesign.tsx에 있음 - 이 파일은 입력 UI만 ★★★

import { useState, useEffect } from 'react';
import { saveDesignData, loadDesignData } from './FinancialHouseDesign';

// ============================================
// 인터페이스
// ============================================
interface CardProps {
  onNext: () => void;
  onPrev: () => void;
  isLast?: boolean;
}

// ============================================
// 면책조항 컴포넌트 (7개 탭 공통)
// ============================================
const DisclaimerBox = () => (
  <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
    <p className="text-[10px] text-amber-700 text-center">
      ⚠️ 본 설계는 이해를 돕기 위한 일반적인 예시이므로 참고만 하시기 바랍니다. 이해를 돕기 위해 원가계산방식을 사용하였습니다.
    </p>
  </div>
);

// ============================================
// 1. 은퇴설계 카드 (v2.0 - 용어 변경 + 공식 접기/펼치기)
// ============================================
export function RetirePlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({
    currentAge: 37,
    retireAge: 65,
    monthlyLivingExpense: 300,      // 예상 노후생활비(월)
    expectedNationalPension: 80,    // 예상 국민연금(월)
    currentPersonalPension: 50,     // 납입중인 개인연금(월)
    expectedRetirementLumpSum: 10000, // 예상 퇴직연금 일시금(만원)
  });
  
  const [showFormula, setShowFormula] = useState(false);

  useEffect(() => { 
    const saved = loadDesignData('retire'); 
    if (saved) {
      // 데이터 마이그레이션: 기존 변수명과 새 변수명 모두 지원
      setFormData({
        currentAge: saved.currentAge ?? 37,
        retireAge: saved.retireAge ?? 65,
        monthlyLivingExpense: saved.monthlyLivingExpense ?? saved.monthlyExpense ?? 300,
        expectedNationalPension: saved.expectedNationalPension ?? saved.nationalPension ?? 80,
        currentPersonalPension: saved.currentPersonalPension ?? saved.personalPension ?? 50,
        expectedRetirementLumpSum: saved.expectedRetirementLumpSum ?? 10000,
      });
    }
  }, []);
  
  useEffect(() => { 
    saveDesignData('retire', formData); 
  }, [formData]);

  // 계산 로직
  const economicYears = formData.retireAge - formData.currentAge; // 경제활동기간
  const monthlyGap = formData.monthlyLivingExpense - formData.expectedNationalPension - formData.currentPersonalPension; // 월 부족액
  const retirementYears = 90 - formData.retireAge; // 은퇴 후 기간 (90세 기준)
  const totalRetirementNeeded = monthlyGap * 12 * retirementYears; // 은퇴일시금 필요액 (만원)
  const netRetirementNeeded = totalRetirementNeeded - formData.expectedRetirementLumpSum; // 순 은퇴일시금
  const monthlyRequiredSaving = netRetirementNeeded > 0 
    ? Math.round(netRetirementNeeded / economicYears / 12) 
    : 0; // 월 저축연금액

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      {/* AI 메시지 */}
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">🏖️</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>첫 번째는 <span className="text-teal-600 font-bold">은퇴설계</span>입니다. 노후 준비 상태를 분석해 드릴게요.</p>
        </div>
      </div>
      
      {/* 입력 폼 */}
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">🏖️ 은퇴설계</h3>
        
        {/* 현재 나이 */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">현재 나이</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={formData.currentAge} 
              onChange={(e) => setFormData({...formData, currentAge: Number(e.target.value)})} 
              onFocus={handleFocus} 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" 
            />
            <span className="text-sm text-gray-500 font-medium w-8">세</span>
          </div>
        </div>
        
        {/* 은퇴 예정 나이 */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">은퇴 예정 나이</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={formData.retireAge} 
              onChange={(e) => setFormData({...formData, retireAge: Number(e.target.value)})} 
              onFocus={handleFocus} 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" 
            />
            <span className="text-sm text-gray-500 font-medium w-8">세</span>
          </div>
        </div>
        
        {/* 예상 노후생활비(월) */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">예상 노후생활비 (월)</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={formData.monthlyLivingExpense} 
              onChange={(e) => setFormData({...formData, monthlyLivingExpense: Number(e.target.value)})} 
              onFocus={handleFocus} 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" 
            />
            <span className="text-sm text-gray-500 font-medium w-10">만원</span>
          </div>
        </div>
        
        {/* 예상 국민연금(월) */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">예상 국민연금 (월)</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={formData.expectedNationalPension} 
              onChange={(e) => setFormData({...formData, expectedNationalPension: Number(e.target.value)})} 
              onFocus={handleFocus} 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" 
            />
            <span className="text-sm text-gray-500 font-medium w-10">만원</span>
          </div>
        </div>
        
        {/* 납입중인 개인연금(월) */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">납입중인 개인연금 (월)</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={formData.currentPersonalPension} 
              onChange={(e) => setFormData({...formData, currentPersonalPension: Number(e.target.value)})} 
              onFocus={handleFocus} 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" 
            />
            <span className="text-sm text-gray-500 font-medium w-10">만원</span>
          </div>
        </div>
        
        {/* 예상 퇴직연금 일시금 */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">예상 퇴직연금 일시금</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={formData.expectedRetirementLumpSum} 
              onChange={(e) => setFormData({...formData, expectedRetirementLumpSum: Number(e.target.value)})} 
              onFocus={handleFocus} 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" 
            />
            <span className="text-sm text-gray-500 font-medium w-10">만원</span>
          </div>
        </div>
      </div>
      
      {/* 분석 결과 */}
      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 space-y-2 border border-teal-200">
        <h3 className="text-sm font-bold text-teal-800 mb-2">📊 은퇴설계 분석 결과</h3>
        
        <div className="flex justify-between text-sm py-1">
          <span className="text-gray-700">경제활동 기간</span>
          <span className="font-bold text-teal-700">{economicYears}년</span>
        </div>
        
        <div className="flex justify-between text-sm py-1">
          <span className="text-gray-700">은퇴 후 기간</span>
          <span className="font-bold text-teal-700">{retirementYears}년</span>
        </div>
        
        <div className="flex justify-between text-sm py-1">
          <span className="text-gray-700">월 부족액</span>
          <span className="font-bold text-red-600">{monthlyGap.toLocaleString()}만원</span>
        </div>
        
        <div className="flex justify-between text-sm py-1">
          <span className="text-gray-700">은퇴일시금 필요액</span>
          <span className="font-bold text-red-600">{(totalRetirementNeeded / 10000).toFixed(1)}억원</span>
        </div>
        
        <div className="flex justify-between text-sm py-1">
          <span className="text-gray-700">예상 퇴직연금 일시금</span>
          <span className="font-bold text-teal-700">{(formData.expectedRetirementLumpSum / 10000).toFixed(1)}억원</span>
        </div>
        
        <div className="flex justify-between text-sm py-1 border-t border-teal-200 pt-2">
          <span className="text-gray-700 font-bold">순 은퇴일시금</span>
          <span className="font-bold text-red-600">{(netRetirementNeeded / 10000).toFixed(1)}억원</span>
        </div>
        
        {/* 핵심 결과: 월 저축연금액 */}
        <div className="bg-white rounded-lg p-3 mt-2 border border-teal-300">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 font-bold">💰 월 저축연금액</span>
            <span className="font-bold text-teal-600 text-lg">{monthlyRequiredSaving.toLocaleString()}만원</span>
          </div>
        </div>
        
        {/* 공식 보기 (접기/펼치기) */}
        <button 
          onClick={() => setShowFormula(!showFormula)}
          className="w-full text-left text-xs text-teal-600 font-medium mt-2 flex items-center gap-1 hover:text-teal-800 transition-colors"
        >
          <span>📐 계산 방법 보기</span>
          <span className="text-sm">{showFormula ? '▲' : '▼'}</span>
        </button>
        
        {showFormula && (
          <div className="bg-white/70 rounded-lg p-3 mt-1 text-xs text-gray-600 space-y-1 border border-teal-200">
            <p><strong>공식:</strong></p>
            <p>① 월 부족액 = 노후생활비({formData.monthlyLivingExpense}) - 국민연금({formData.expectedNationalPension}) - 개인연금({formData.currentPersonalPension}) = {monthlyGap}만원</p>
            <p>② 은퇴일시금 = {monthlyGap}만원 × 12개월 × {retirementYears}년 = {(totalRetirementNeeded / 10000).toFixed(1)}억원</p>
            <p>③ 순 은퇴일시금 = {(totalRetirementNeeded / 10000).toFixed(1)}억 - {(formData.expectedRetirementLumpSum / 10000).toFixed(1)}억 = {(netRetirementNeeded / 10000).toFixed(1)}억원</p>
            <p>④ 월 저축연금액 = {(netRetirementNeeded / 10000).toFixed(1)}억 ÷ {economicYears}년 ÷ 12 = {monthlyRequiredSaving}만원</p>
            <p className="text-gray-400 mt-2">* 은퇴 후 기간은 90세 기준으로 계산</p>
          </div>
        )}
      </div>
      
      {/* 면책조항 */}
      <DisclaimerBox />
      
      {/* 버튼 */}
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm hover:from-teal-600 hover:to-teal-700 transition-colors">다음 →</button>
      </div>
    </div>
  );
}


// ============================================
// 2. 부채설계 카드 (v2.0 - 대출상환 우선순위 리스트)
// ============================================
interface DebtItem {
  id: string;
  name: string;
  amount: number;
  rate: number;
  type: 'mortgage' | 'credit' | 'other';
}

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
            mortgageDebts: (parsed.debts.mortgageDebts || []).map((d: DebtItem) => ({ ...d, type: 'mortgage' as const })),
            creditDebts: (parsed.debts.creditDebts || []).map((d: DebtItem) => ({ ...d, type: 'credit' as const })),
            otherDebts: (parsed.debts.otherDebts || []).map((d: DebtItem) => ({ ...d, type: 'other' as const })),
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
  const estimatedMonthlyPayment = Math.round(totalDebt / 240);
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
            <span className="font-bold text-purple-700 text-lg">{totalDebt > 0 ? (totalDebt / 10000).toFixed(1) + '억원' : '0원'}</span>
          </div>
        </div>
      </div>
      
      {/* DSR 분석 */}
      {totalDebt > 0 && (
        <div className={`rounded-xl p-4 border ${dsrBgColor}`}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">📊 DSR (추정)</span>
            <span className={`font-bold text-lg ${dsrColor}`}>{dsr.toFixed(1)}% ({dsrLevel})</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">월소득 {monthlyIncome.toLocaleString()}만원 기준</p>
        </div>
      )}
      
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
      
      {/* 면책조항 */}
      <DisclaimerBox />
      
      {/* 버튼 */}
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm hover:from-teal-600 hover:to-teal-700 transition-colors">다음 →</button>
      </div>
    </div>
  );
}



// ============================================
// 3. 저축설계 카드 (v2.1 - 단순화된 로직 + 기간별 포트폴리오)
// ============================================

// 저축 목적 옵션
const savingPurposeOptions = [
  { id: 'house', label: '🏠 내집마련', icon: '🏠' },
  { id: 'education', label: '🎓 자녀교육', icon: '🎓' },
  { id: 'car', label: '🚗 자동차', icon: '🚗' },
  { id: 'travel', label: '✈️ 여행', icon: '✈️' },
  { id: 'wedding', label: '💍 결혼', icon: '💍' },
  { id: 'emergency', label: '🆘 비상금', icon: '🆘' },
  { id: 'retirement', label: '🏖️ 노후자금', icon: '🏖️' },
  { id: 'other', label: '📝 기타목적', icon: '📝' },
];

export function SavePlanCard({ onNext, onPrev }: CardProps) {
  const [showFormula, setShowFormula] = useState(false);
  
  // 입력 데이터
  const [formData, setFormData] = useState({
    purpose: 'house',
    targetAmount: 10000, // 목표금액 (만원)
    targetYears: 5,      // 목표기간 (년)
  });
  
  // 기본정보에서 가져온 데이터 (연금 제외한 모든 저축)
  const [basicData, setBasicData] = useState({
    age: 37,
    cmaAmount: 0,        // CMA (수시)
    savingsAmount: 0,    // 적금 (1~3년)
    fundAmount: 0,       // 펀드/ETF
    housingSubAmount: 0, // 청약저축
    isaAmount: 0,        // ISA (3~5년)
    pensionAmount: 0,    // 개인연금 (장기, 제외됨)
  });

  // 기본정보 데이터 불러오기
  useEffect(() => {
    const savedHouseData = localStorage.getItem('financialHouseData');
    if (savedHouseData) {
      try {
        const parsed = JSON.parse(savedHouseData);
        setBasicData({
          age: parsed.personalInfo?.age || 37,
          cmaAmount: parsed.expense?.cmaAmount || 0,
          savingsAmount: parsed.expense?.savingsAmount || 0,
          fundAmount: parsed.expense?.fundAmount || 0,
          housingSubAmount: parsed.expense?.housingSubAmount || 0,
          isaAmount: parsed.expense?.isaAmount || 0,
          pensionAmount: parsed.expense?.pensionAmount || 0,
        });
      } catch (e) {
        console.error('Failed to parse financialHouseData:', e);
      }
    }
    
    // 기존 저축설계 데이터 불러오기
    const saved = loadDesignData('save');
    if (saved?.purpose) {
      setFormData(saved);
    }
  }, []);

  // 데이터 저장
  useEffect(() => {
    saveDesignData('save', formData);
  }, [formData]);

  // 계산 로직 (v2.1 - 단순화)
  const targetMonths = formData.targetYears * 12;
  const monthlyRequired = Math.round(formData.targetAmount / targetMonths); // 월 필요 저축액
  
  // 현재 월 저축액 = 연금 제외한 모든 저축 합계
  const currentTotalSaving = basicData.cmaAmount + basicData.savingsAmount + basicData.fundAmount + basicData.housingSubAmount + basicData.isaAmount;
  
  // 월 추가 필요액
  const additionalRequired = Math.max(0, monthlyRequired - currentTotalSaving);

  // 목표기간에 따른 분류
  const getTermCategory = (years: number) => {
    if (years <= 1) return 'immediate'; // 수시
    if (years <= 3) return 'short';     // 단기
    if (years <= 5) return 'mid';       // 중기
    return 'long';                       // 장기
  };
  
  const termCategory = getTermCategory(formData.targetYears);

  // 포트폴리오 생성 (기존 금액 파랑 + 추가 금액 빨강)
  const generatePortfolio = () => {
    const items = [];
    
    // 초단기: 수시 (CMA)
    items.push({
      term: '수시',
      product: 'CMA',
      existing: basicData.cmaAmount,
      additional: termCategory === 'immediate' ? additionalRequired : 0,
    });
    
    // 단기: 1~3년 (적금)
    items.push({
      term: '1~3년',
      product: '적금',
      existing: basicData.savingsAmount,
      additional: termCategory === 'short' ? additionalRequired : 0,
    });
    
    // 중기: 3~5년 (ISA)
    items.push({
      term: '3~5년',
      product: 'ISA',
      existing: basicData.isaAmount,
      additional: termCategory === 'mid' ? additionalRequired : 0,
    });
    
    // 장기: 5년+ (연금, 펀드, ETF)
    items.push({
      term: '5년+',
      product: '연금/펀드/ETF',
      existing: basicData.pensionAmount + basicData.fundAmount,
      additional: termCategory === 'long' ? additionalRequired : 0,
    });
    
    return items;
  };

  const portfolio = generatePortfolio();
  
  // 목표금액 표시 (억원/만원)
  const formatTargetAmount = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}억원`;
    }
    return `${amount.toLocaleString()}만원`;
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      {/* AI 메시지 */}
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">💰</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>세 번째는 <span className="text-teal-600 font-bold">저축설계</span>입니다. 목적자금별로 저축 계획을 세워볼까요?</p>
        </div>
      </div>
      
      {/* 입력 폼 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">💰 저축설계</h3>
        
        {/* 저축 목적 선택 */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 block mb-2">🎯 저축 목적</label>
          <div className="flex flex-wrap gap-2">
            {savingPurposeOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setFormData({...formData, purpose: option.id})}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors ${
                  formData.purpose === option.id
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 목표 금액 */}
        <div className="mb-3">
          <label className="text-sm font-semibold text-gray-700 block mb-1">💵 목표 금액</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={formData.targetAmount}
              onChange={(e) => setFormData({...formData, targetAmount: Number(e.target.value)})}
              onFocus={handleFocus}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
            <span className="text-sm text-gray-500 font-medium w-10">만원</span>
          </div>
        </div>
        
        {/* 목표 기간 */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">📅 목표 기간</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={formData.targetYears}
              onChange={(e) => setFormData({...formData, targetYears: Number(e.target.value)})}
              onFocus={handleFocus}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
            <span className="text-sm text-gray-500 font-medium w-8">년</span>
          </div>
        </div>
      </div>
      
      {/* 저축 계획 분석 결과 */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
        <h3 className="text-sm font-bold text-blue-800 mb-3">📊 저축 계획 분석</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-700">목표 금액</span>
            <span className="font-bold text-blue-700">{formatTargetAmount(formData.targetAmount)}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-700">목표 기간</span>
            <span className="font-bold text-blue-700">{formData.targetYears}년 ({targetMonths}개월)</span>
          </div>
          <div className="flex justify-between text-sm py-1 border-t border-blue-200 pt-2">
            <span className="text-gray-700">월 필요 저축액</span>
            <span className="font-bold text-blue-600 text-lg">약 {monthlyRequired.toLocaleString()}만원</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-700">현재 월 저축액</span>
            <span className="font-bold text-gray-700">{currentTotalSaving.toLocaleString()}만원</span>
          </div>
          <div className="flex justify-between text-sm py-1 border-t border-blue-200 pt-2">
            <span className="text-gray-700 font-bold">월 추가 필요액</span>
            <span className={`font-bold text-lg ${additionalRequired > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {additionalRequired > 0 ? `${additionalRequired.toLocaleString()}만원` : '충분함 ✓'}
            </span>
          </div>
        </div>
      </div>
      
      {/* 추천 배분 포트폴리오 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-3">📊 추천 배분</h3>
        
        <div className="space-y-2">
          {portfolio.map((item, index) => {
            const hasExisting = item.existing > 0;
            const hasAdditional = item.additional > 0;
            if (!hasExisting && !hasAdditional) return null;
            
            return (
              <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  index < 2 ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {index < 2 ? '저축' : '투자'}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{item.term} · {item.product}</div>
                </div>
                <div className="text-right">
                  {hasExisting && (
                    <span className="text-sm font-bold text-blue-600">{item.existing.toLocaleString()}만원</span>
                  )}
                  {hasExisting && hasAdditional && <span className="text-gray-400 mx-1">+</span>}
                  {hasAdditional && (
                    <span className="text-sm font-bold text-red-600">{item.additional.toLocaleString()}만원</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 범례 */}
        <div className="flex justify-center gap-4 mt-3 pt-2 border-t border-gray-100">
          <span className="text-[10px] text-blue-600">● 기존 유지</span>
          <span className="text-[10px] text-red-600">● 신규 추가</span>
        </div>
      </div>
      
      {/* 공식 보기 */}
      <button 
        onClick={() => setShowFormula(!showFormula)}
        className="w-full text-left text-xs text-teal-600 font-medium flex items-center gap-1 hover:text-teal-800 transition-colors"
      >
        <span>📐 계산 방법 보기</span>
        <span>{showFormula ? '▲' : '▼'}</span>
      </button>
      
      {showFormula && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1 border border-gray-200">
          <p><strong>월 필요 저축액:</strong></p>
          <p>= 목표금액 ÷ 목표기간(개월)</p>
          <p className="mt-2"><strong>현재 월 저축액:</strong></p>
          <p>= CMA + 적금 + 펀드 + 청약 + ISA (연금 제외)</p>
          <p className="mt-2"><strong>기간별 상품 배분:</strong></p>
          <p>• 수시: CMA</p>
          <p>• 1~3년: 적금</p>
          <p>• 3~5년: ISA</p>
          <p>• 5년+: 연금/펀드/ETF</p>
        </div>
      )}
      
      {/* 면책조항 */}
      <DisclaimerBox />
      
      {/* 버튼 */}
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm hover:from-teal-600 hover:to-teal-700 transition-colors">다음 →</button>
      </div>
    </div>
  );
}


// ============================================
// 4. 투자설계 카드 (v2.2 - UI 정리 + 안전성 자산 로직 수정)
// ============================================
export function InvestPlanCard({ onNext, onPrev }: CardProps) {
  const [showFormula, setShowFormula] = useState(false);
  
  // 직접 입력 데이터
  const [formData, setFormData] = useState({
    currentAge: 37,
    monthlyIncome: 500,
    totalAssets: 25000,
    totalDebt: 10000,
    // 유동성 (CMA, 파킹통장, 금)
    liquidAssets: 1500,
    // 안전성 (예금, 채권, 연금적립금, 저축적립금, 적금적립금)
    safeAssets: 10000,
    // 수익성 (펀드, ETF)
    growthAssets: 2500,
    // 고수익 (주식, 가상화폐)
    highRiskAssets: 1000,
  });

  // 기본정보에서 데이터 불러오기 (v2.2 수정: financialAssets 경로 사용)
  useEffect(() => {
    const savedHouseData = localStorage.getItem('financialHouseData');
    if (savedHouseData) {
      try {
        const parsed = JSON.parse(savedHouseData);
        const fa = parsed.financialAssets || {};
        
        // 유동성 = CMA + 금
        const liquidAssets = (fa.cmaAsset || 0) + (fa.goldAsset || 0);
        
        // 안전성 = 예금 + 채권 + 적금/적립금 + 연금적립금 + 저축적립금
        const safeAssets = 
          (fa.depositAsset || 0) +      // 예금
          (fa.bondAsset || 0) +         // 채권
          (fa.installmentAsset || 0) +  // 적금/적립금
          (fa.pensionAsset || 0) +      // 연금적립금
          (fa.savingsAsset || 0);       // 저축적립금
        
        // 수익성 = 펀드적립금 + ETF
        const growthAssets = 
          (fa.fundSavingsAsset || 0) + 
          (fa.etfAsset || 0);
        
        // 고수익 = 주식 + 가상화폐
        const highRiskAssets = 
          (fa.stockAsset || 0) + 
          (fa.cryptoAsset || 0);
        
        // 월수입 계산 (본인 + 배우자)
        const monthlyIncome = 
          (parsed.income?.myIncome || 0) + 
          (parsed.income?.spouseIncome || 0) + 
          (parsed.income?.otherIncome || 0);
        
        setFormData(prev => ({
          ...prev,
          currentAge: parsed.personalInfo?.age || prev.currentAge,
          monthlyIncome: monthlyIncome || prev.monthlyIncome,
          totalAssets: parsed.totalAsset || prev.totalAssets,
          totalDebt: parsed.debts?.totalDebt || prev.totalDebt,
          liquidAssets: liquidAssets || prev.liquidAssets,
          safeAssets: safeAssets || prev.safeAssets,
          growthAssets: growthAssets || prev.growthAssets,
          highRiskAssets: highRiskAssets || prev.highRiskAssets,
        }));
      } catch (e) {
        console.error('Failed to parse financialHouseData:', e);
      }
    }
    
    // 기존 투자설계 데이터 불러오기
    const saved = loadDesignData('invest');
    if (saved?.currentAge) {
      setFormData(saved);
    }
  }, []);

  // 데이터 저장
  useEffect(() => {
    saveDesignData('invest', formData);
  }, [formData]);

  // 금융전체자산 (투자자산 합계)
  const totalFinancialAssets = formData.liquidAssets + formData.safeAssets + formData.growthAssets + formData.highRiskAssets;
  
  // 순자산 계산
  const netAssets = formData.totalAssets - formData.totalDebt;
  
  // 부자지수 계산: ((순자산 × 10) ÷ (나이 × 소득 × 12)) × 100
  const wealthIndex = formData.currentAge > 0 && formData.monthlyIncome > 0 
    ? ((netAssets * 10) / (formData.currentAge * formData.monthlyIncome * 12)) * 100 
    : 0;
  
  // 부자지수 등급 및 아이콘
  const getWealthGrade = (index: number) => {
    if (index >= 200) return { grade: '궁전', icon: '🏰', color: 'text-purple-600', bgColor: 'bg-purple-100' };
    if (index >= 100) return { grade: '4단계', icon: '🏘️', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (index >= 50) return { grade: '3단계', icon: '🏡', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (index >= 0) return { grade: '2단계', icon: '🏠', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { grade: '텐트', icon: '🏕️', color: 'text-red-600', bgColor: 'bg-red-100' };
  };
  
  const wealthGrade = getWealthGrade(wealthIndex);
  
  // 기준 비율 및 기준금액
  const targetRatios = { liquid: 20, safe: 50, growth: 20, highRisk: 10 };
  const targetAmounts = {
    liquid: Math.round(totalFinancialAssets * 0.20),
    safe: Math.round(totalFinancialAssets * 0.50),
    growth: Math.round(totalFinancialAssets * 0.20),
    highRisk: Math.round(totalFinancialAssets * 0.10),
  };
  
  // 비상예비자금 (소득의 3~6배)
  const emergencyFundMin = formData.monthlyIncome * 3;
  const emergencyFundMax = formData.monthlyIncome * 6;
  const emergencyGap = emergencyFundMin - formData.liquidAssets;
  const hasEmergencyFund = formData.liquidAssets >= emergencyFundMin;

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    if (amount >= 10000) return `${(amount / 10000).toFixed(1)}억`;
    return `${amount.toLocaleString()}만`;
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  // 자산배분 데이터
  const assetAllocation = [
    { type: '유동성', icon: '💧', iconBg: 'bg-blue-100', current: formData.liquidAssets, ratio: targetRatios.liquid, target: targetAmounts.liquid, note: 'CMA, 파킹통장, 금', status: formData.liquidAssets >= targetAmounts.liquid ? 'ok' : 'under' },
    { type: '안전성', icon: '🔒', iconBg: 'bg-green-100', current: formData.safeAssets, ratio: targetRatios.safe, target: targetAmounts.safe, note: '예금, 채권, 연금', status: formData.safeAssets > targetAmounts.safe * 1.1 ? 'over' : 'ok' },
    { type: '수익성', icon: '📊', iconBg: 'bg-orange-100', current: formData.growthAssets, ratio: targetRatios.growth, target: targetAmounts.growth, note: '펀드, ETF', status: formData.growthAssets >= targetAmounts.growth ? 'ok' : 'under' },
    { type: '고수익', icon: '🚀', iconBg: 'bg-red-100', current: formData.highRiskAssets, ratio: targetRatios.highRisk, target: targetAmounts.highRisk, note: '주식, 가상화폐', status: formData.highRiskAssets > targetAmounts.highRisk * 1.5 ? 'over' : 'ok' },
  ];

  return (
    <div className="space-y-3">
      {/* AI 메시지 */}
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">📈</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>네 번째는 <span className="text-teal-600 font-bold">투자설계</span>입니다. 부자지수와 자산배분 포트폴리오를 분석해 드릴게요.</p>
        </div>
      </div>
      
      {/* 입력 폼 - 한 줄씩 정리 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">📈 투자설계</h3>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <label className="text-sm font-semibold text-gray-700 w-20">현재 나이</label>
            <input type="number" value={formData.currentAge} onChange={(e) => setFormData({...formData, currentAge: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" />
            <span className="text-sm text-gray-500 w-12 text-right">세</span>
          </div>
          <div className="flex items-center">
            <label className="text-sm font-semibold text-gray-700 w-20">월 소득</label>
            <input type="number" value={formData.monthlyIncome} onChange={(e) => setFormData({...formData, monthlyIncome: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" />
            <span className="text-sm text-gray-500 w-12 text-right">만원</span>
          </div>
          <div className="flex items-center">
            <label className="text-sm font-semibold text-gray-700 w-20">총 자산</label>
            <input type="number" value={formData.totalAssets} onChange={(e) => setFormData({...formData, totalAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" />
            <span className="text-sm text-gray-500 w-12 text-right">만원</span>
          </div>
          <div className="flex items-center">
            <label className="text-sm font-semibold text-gray-700 w-20">총 부채</label>
            <input type="number" value={formData.totalDebt} onChange={(e) => setFormData({...formData, totalDebt: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" />
            <span className="text-sm text-gray-500 w-12 text-right">만원</span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-3 mt-3">
          <h4 className="text-sm font-bold text-gray-700 mb-2">자산 배분 입력</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <label className="text-sm text-gray-700 w-20">💧 유동성</label>
              <input type="number" value={formData.liquidAssets} onChange={(e) => setFormData({...formData, liquidAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" />
              <span className="text-sm text-gray-500 w-12 text-right">만원</span>
            </div>
            <p className="text-[10px] text-gray-400 ml-20">CMA, 파킹통장, 금</p>
            
            <div className="flex items-center">
              <label className="text-sm text-gray-700 w-20">🔒 안전성</label>
              <input type="number" value={formData.safeAssets} onChange={(e) => setFormData({...formData, safeAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" />
              <span className="text-sm text-gray-500 w-12 text-right">만원</span>
            </div>
            <p className="text-[10px] text-gray-400 ml-20">예금, 채권, 연금</p>
            
            <div className="flex items-center">
              <label className="text-sm text-gray-700 w-20">📊 수익성</label>
              <input type="number" value={formData.growthAssets} onChange={(e) => setFormData({...formData, growthAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" />
              <span className="text-sm text-gray-500 w-12 text-right">만원</span>
            </div>
            <p className="text-[10px] text-gray-400 ml-20">펀드, ETF</p>
            
            <div className="flex items-center">
              <label className="text-sm text-gray-700 w-20">🔥 고수익</label>
              <input type="number" value={formData.highRiskAssets} onChange={(e) => setFormData({...formData, highRiskAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" />
              <span className="text-sm text-gray-500 w-12 text-right">만원</span>
            </div>
            <p className="text-[10px] text-gray-400 ml-20">주식, 코인</p>
          </div>
        </div>
      </div>
      
      {/* 부자지수 카드 */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
        <div className="text-center">
          <p className="text-sm font-bold text-purple-800 mb-2">💎 나의 부자지수</p>
          <p className={`text-4xl font-bold ${wealthGrade.color}`}>{wealthIndex.toFixed(0)}%</p>
          <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full ${wealthGrade.bgColor}`}>
            <span className="text-xl">{wealthGrade.icon}</span>
            <span className={`font-bold ${wealthGrade.color}`}>{wealthGrade.grade}</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">
            순자산 {formatAmount(netAssets)} 기준
          </p>
        </div>
      </div>
      
      {/* 부자지수 등급 안내 */}
      <div className="bg-gray-50 rounded-lg p-2 text-[10px] text-gray-600 flex flex-wrap gap-2 justify-center">
        <span>🏕️ 0%↓</span>
        <span>🏠 50%↓</span>
        <span>🏡 100%↓</span>
        <span>🏘️ 200%↓</span>
        <span>🏰 200%↑</span>
      </div>
      
      {/* 자산배분 포트폴리오 테이블 (가로 스크롤) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 px-3 py-2 border-b border-gray-200">
          <span className="text-sm font-bold text-teal-800">📊 자산배분 포트폴리오</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: '420px' }}>
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">자산유형</th>
                <th className="px-2 py-2 text-right font-semibold text-gray-600 whitespace-nowrap">현재금액</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-600 whitespace-nowrap">기준비율</th>
                <th className="px-2 py-2 text-right font-semibold text-gray-600 whitespace-nowrap">기준금액</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">비고</th>
              </tr>
            </thead>
            <tbody>
              {assetAllocation.map((item, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-6 h-6 rounded-full ${item.iconBg} flex items-center justify-center text-sm`}>{item.icon}</span>
                      <span className="font-medium whitespace-nowrap">{item.type}</span>
                    </div>
                  </td>
                  <td className={`px-2 py-2 text-right font-bold whitespace-nowrap ${
                    item.status === 'under' ? 'text-red-500' : item.status === 'over' ? 'text-yellow-600' : 'text-gray-800'
                  }`}>
                    {formatAmount(item.current)}
                  </td>
                  <td className="px-2 py-2 text-center text-gray-600 whitespace-nowrap">{item.ratio}%</td>
                  <td className="px-2 py-2 text-right text-gray-600 whitespace-nowrap">{formatAmount(item.target)}</td>
                  <td className="px-2 py-2 text-left text-gray-500 text-[10px] whitespace-nowrap">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center py-1 bg-gray-50 border-t border-gray-100">
          <span className="text-[10px] text-gray-400">← 좌우로 스크롤하세요 →</span>
        </div>
      </div>
      
      {/* 비상예비자금 체크 */}
      <div className={`rounded-xl p-3 flex items-center gap-3 ${hasEmergencyFund ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <span className="text-2xl">🆘</span>
        <div className="flex-1">
          <p className={`text-sm font-bold ${hasEmergencyFund ? 'text-green-700' : 'text-red-700'}`}>
            비상예비자금: {hasEmergencyFund ? '확보 ✅' : '없음 ❌'}
          </p>
          <p className="text-xs text-gray-600">
            필요액: {emergencyFundMin.toLocaleString()}~{emergencyFundMax.toLocaleString()}만원 (소득의 3~6배)
          </p>
          {!hasEmergencyFund && (
            <p className="text-xs mt-1">
              현재 유동성: {formData.liquidAssets.toLocaleString()}만원 → <span className="font-bold text-red-600">{emergencyGap.toLocaleString()}만원 부족</span>
            </p>
          )}
        </div>
      </div>
      
      {/* 공식 보기 */}
      <button 
        onClick={() => setShowFormula(!showFormula)}
        className="w-full text-left text-xs text-teal-600 font-medium flex items-center gap-1 hover:text-teal-800 transition-colors"
      >
        <span>📐 계산 방법 보기</span>
        <span>{showFormula ? '▲' : '▼'}</span>
      </button>
      
      {showFormula && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1 border border-gray-200">
          <p><strong>부자지수 공식:</strong></p>
          <p>((순자산 × 10) ÷ (나이 × 월소득 × 12)) × 100</p>
          <p className="mt-2"><strong>자산배분 기준:</strong></p>
          <p>• 유동성 20%: CMA, 파킹통장, 금</p>
          <p>• 안전성 50%: 예금, 채권, 연금적립금, 저축적립금, 적금적립금</p>
          <p>• 수익성 20%: 펀드, ETF</p>
          <p>• 고수익 10%: 주식, 가상화폐</p>
        </div>
      )}
      
      {/* 면책조항 */}
      <DisclaimerBox />
      
      {/* 버튼 */}
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm hover:from-teal-600 hover:to-teal-700 transition-colors">다음 →</button>
      </div>
    </div>
  );
}
// ============================================
// 5. 세금설계 카드 (기존 유지 - 다음 작업에서 수정)
// ============================================
export function TaxPlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({ annualIncome: 6000, pensionSaving: 400, irpContribution: 0, housingSubscription: 240 });
  useEffect(() => { const saved = loadDesignData('tax'); if (saved) setFormData(saved); }, []);
  useEffect(() => { saveDesignData('tax', formData); }, [formData]);
  const totalDeduction = Math.min(formData.pensionSaving, 400) * 0.165 + Math.min(formData.irpContribution, 300) * 0.165 + Math.min(formData.housingSubscription, 240) * 0.165;
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">💸</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>다섯 번째는 <span className="text-teal-600 font-bold">세금설계</span>입니다.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">세금 정보 입력</h3>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">연간 소득</label><div className="flex items-center gap-2"><input type="number" value={formData.annualIncome} onChange={(e) => setFormData({...formData, annualIncome: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">연금저축 (연)</label><div className="flex items-center gap-2"><input type="number" value={formData.pensionSaving} onChange={(e) => setFormData({...formData, pensionSaving: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">IRP (연)</label><div className="flex items-center gap-2"><input type="number" value={formData.irpContribution} onChange={(e) => setFormData({...formData, irpContribution: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">주택청약 (연)</label><div className="flex items-center gap-2"><input type="number" value={formData.housingSubscription} onChange={(e) => setFormData({...formData, housingSubscription: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
      </div>
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-red-800 mb-2">세금 분석 결과</h3>
        <div className="flex justify-between text-sm"><span className="text-gray-700">총 세액공제</span><span className="font-bold text-green-600">{totalDeduction.toFixed(0)}만원</span></div>
      </div>
      {/* 면책조항 */}
      <DisclaimerBox />
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 6. 부동산설계 카드 (기존 유지 - 다음 작업에서 수정)
// ============================================
export function EstatePlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({ currentPrice: 50000, loanBalance: 30000, monthlyRent: 0, holdingYears: 5, expectedGrowth: 3 });
  useEffect(() => { const saved = loadDesignData('estate'); if (saved) setFormData(saved); }, []);
  useEffect(() => { saveDesignData('estate', formData); }, [formData]);
  const netEquity = formData.currentPrice - formData.loanBalance;
  const ltv = formData.currentPrice > 0 ? (formData.loanBalance / formData.currentPrice * 100) : 0;
  let ltvColor = ltv <= 40 ? 'text-green-600' : ltv <= 60 ? 'text-blue-600' : ltv <= 80 ? 'text-yellow-600' : 'text-red-600';
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">🏠</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>여섯 번째는 <span className="text-teal-600 font-bold">부동산설계</span>입니다.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">부동산 정보 입력</h3>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">주택 가격</label><div className="flex items-center gap-2"><input type="number" value={formData.currentPrice} onChange={(e) => setFormData({...formData, currentPrice: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">대출 잔액</label><div className="flex items-center gap-2"><input type="number" value={formData.loanBalance} onChange={(e) => setFormData({...formData, loanBalance: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">월세 수입</label><div className="flex items-center gap-2"><input type="number" value={formData.monthlyRent} onChange={(e) => setFormData({...formData, monthlyRent: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
      </div>
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-indigo-800 mb-2">부동산 분석 결과</h3>
        <div className="flex justify-between text-sm"><span className="text-gray-700">순자산</span><span className="font-bold text-indigo-700">{(netEquity / 10000).toFixed(1)}억원</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-700">LTV</span><span className={`font-bold ${ltvColor}`}>{ltv.toFixed(1)}%</span></div>
      </div>
      {/* 면책조항 */}
      <DisclaimerBox />
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 7. 보험설계 카드 (마지막) (기존 유지 - 다음 작업에서 수정)
// ============================================
export function InsurancePlanCard({ onNext, onPrev, isLast }: CardProps) {
  const [formData, setFormData] = useState({ monthlyPremium: 30, deathCoverage: 5, diseaseCoverage: 3, hasHealthInsurance: true, pensionInsurance: 20 });
  useEffect(() => { const saved = loadDesignData('insurance'); if (saved) setFormData(saved); }, []);
  useEffect(() => { saveDesignData('insurance', formData); }, [formData]);
  const yearlyPremium = formData.monthlyPremium * 12;
  const totalCoverage = formData.deathCoverage + formData.diseaseCoverage;
  let coverageColor = totalCoverage >= 8 ? 'text-green-600' : totalCoverage >= 5 ? 'text-blue-600' : 'text-red-600';
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">🛡️</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>마지막 일곱 번째는 <span className="text-teal-600 font-bold">보험설계</span>입니다.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">보험 정보 입력</h3>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">월 보험료</label><div className="flex items-center gap-2"><input type="number" value={formData.monthlyPremium} onChange={(e) => setFormData({...formData, monthlyPremium: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">사망보장</label><div className="flex items-center gap-2"><input type="number" step="0.1" value={formData.deathCoverage} onChange={(e) => setFormData({...formData, deathCoverage: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">억원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">질병보장</label><div className="flex items-center gap-2"><input type="number" step="0.1" value={formData.diseaseCoverage} onChange={(e) => setFormData({...formData, diseaseCoverage: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">억원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">실손보험</label>
          <div className="flex gap-3">
            <button onClick={() => setFormData({...formData, hasHealthInsurance: true})} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${formData.hasHealthInsurance ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}>가입</button>
            <button onClick={() => setFormData({...formData, hasHealthInsurance: false})} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${!formData.hasHealthInsurance ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}>미가입</button>
          </div>
        </div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">연금보험 (월)</label><div className="flex items-center gap-2"><input type="number" value={formData.pensionInsurance} onChange={(e) => setFormData({...formData, pensionInsurance: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
      </div>
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-emerald-800 mb-2">보험 분석 결과</h3>
        <div className="flex justify-between text-sm"><span className="text-gray-700">연간 보험료</span><span className="font-bold text-emerald-700">{yearlyPremium}만원</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-700">총 보장</span><span className={`font-bold ${coverageColor}`}>{totalCoverage}억원</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-700">실손보험</span><span className={`font-bold ${formData.hasHealthInsurance ? 'text-green-600' : 'text-red-600'}`}>{formData.hasHealthInsurance ? '가입 ✓' : '미가입 ✗'}</span></div>
        {!formData.hasHealthInsurance && <div className="bg-white rounded-lg p-2 mt-2"><p className="text-xs text-red-600">⚠️ 실손보험 가입을 추천합니다!</p></div>}
      </div>
      {/* 면책조항 */}
      <DisclaimerBox />
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">{isLast ? '금융집 완성 🎉' : '다음 →'}</button>
      </div>
    </div>
  );
}
