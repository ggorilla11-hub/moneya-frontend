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
      
      {/* 버튼 */}
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm hover:from-teal-600 hover:to-teal-700 transition-colors">다음 →</button>
      </div>
    </div>
  );
}


// ============================================
// 3. 저축설계 카드 (기존 유지 - 다음 작업에서 수정)
// ============================================
export function SavePlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({ monthlyIncome: 500, monthlySaving: 100, targetRate: 20 });
  useEffect(() => { const saved = loadDesignData('save'); if (saved) setFormData(saved); }, []);
  useEffect(() => { saveDesignData('save', formData); }, [formData]);
  const currentRate = formData.monthlyIncome > 0 ? (formData.monthlySaving / formData.monthlyIncome * 100) : 0;
  const yearlyAmount = formData.monthlySaving * 12;
  let rateColor = currentRate >= 20 ? 'text-green-600' : currentRate >= 10 ? 'text-yellow-600' : 'text-red-600';
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">💰</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>세 번째는 <span className="text-teal-600 font-bold">저축설계</span>입니다.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">저축 정보 입력</h3>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">월 소득</label><div className="flex items-center gap-2"><input type="number" value={formData.monthlyIncome} onChange={(e) => setFormData({...formData, monthlyIncome: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">월 저축액</label><div className="flex items-center gap-2"><input type="number" value={formData.monthlySaving} onChange={(e) => setFormData({...formData, monthlySaving: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">목표 저축률</label><div className="flex items-center gap-2"><input type="number" value={formData.targetRate} onChange={(e) => setFormData({...formData, targetRate: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-8">%</span></div></div>
      </div>
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-blue-800 mb-2">저축 분석 결과</h3>
        <div className="flex justify-between text-sm"><span className="text-gray-700">현재 저축률</span><span className={`font-bold ${rateColor}`}>{currentRate.toFixed(1)}%</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-700">연간 저축액</span><span className="font-bold text-blue-700">{yearlyAmount}만원</span></div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 4. 투자설계 카드 (v2.0 - 부자지수 + 자산배분 테이블)
// ============================================
export function InvestPlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({
    currentAge: 37,
    monthlyIncome: 500,           // 월 소득 (만원)
    totalAssets: 25000,           // 총 자산 (만원)
    totalDebt: 10000,             // 총 부채 (만원)
    liquidAssets: 1500,           // 유동성 자산 (CMA, 파킹, 금 등)
    safeAssets: 10000,            // 안전성 자산 (예금, 채권, 연금)
    growthAssets: 2500,           // 수익성 자산 (펀드, ETF)
    highRiskAssets: 1000,         // 고수익성 자산 (주식, 코인)
  });
  
  const [showFormula, setShowFormula] = useState(false);

  useEffect(() => { 
    const saved = loadDesignData('invest'); 
    if (saved) setFormData(saved); 
  }, []);
  
  useEffect(() => { 
    saveDesignData('invest', formData); 
  }, [formData]);

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
  
  // 자산배분 계산
  const totalInvestAssets = formData.liquidAssets + formData.safeAssets + formData.growthAssets + formData.highRiskAssets;
  const liquidRatio = totalInvestAssets > 0 ? (formData.liquidAssets / totalInvestAssets * 100) : 0;
  const safeRatio = totalInvestAssets > 0 ? (formData.safeAssets / totalInvestAssets * 100) : 0;
  const growthRatio = totalInvestAssets > 0 ? (formData.growthAssets / totalInvestAssets * 100) : 0;
  const highRiskRatio = totalInvestAssets > 0 ? (formData.highRiskAssets / totalInvestAssets * 100) : 0;
  
  // 기준 비율 (추천)
  const targetLiquid = 20;
  const targetSafe = 50;
  const targetGrowth = 20;
  const targetHighRisk = 10;
  
  // 비상예비자금 (소득의 3~6배)
  const emergencyFundMin = formData.monthlyIncome * 3;
  const emergencyFundMax = formData.monthlyIncome * 6;
  const hasEmergencyFund = formData.liquidAssets >= emergencyFundMin;
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      {/* AI 메시지 */}
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">📈</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>네 번째는 <span className="text-teal-600 font-bold">투자설계</span>입니다. 부자지수와 자산배분을 분석해 드릴게요.</p>
        </div>
      </div>
      
      {/* 입력 폼 */}
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">📈 투자설계</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">현재 나이</label>
            <div className="flex items-center gap-1">
              <input type="number" value={formData.currentAge} onChange={(e) => setFormData({...formData, currentAge: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
              <span className="text-xs text-gray-500 w-6">세</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">월 소득</label>
            <div className="flex items-center gap-1">
              <input type="number" value={formData.monthlyIncome} onChange={(e) => setFormData({...formData, monthlyIncome: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
              <span className="text-xs text-gray-500 w-8">만원</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">총 자산</label>
            <div className="flex items-center gap-1">
              <input type="number" value={formData.totalAssets} onChange={(e) => setFormData({...formData, totalAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
              <span className="text-xs text-gray-500 w-8">만원</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">총 부채</label>
            <div className="flex items-center gap-1">
              <input type="number" value={formData.totalDebt} onChange={(e) => setFormData({...formData, totalDebt: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
              <span className="text-xs text-gray-500 w-8">만원</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-3 mt-3">
          <h4 className="text-sm font-bold text-gray-700 mb-2">자산 배분 입력</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">💧 유동성</label>
              <div className="flex items-center gap-1">
                <input type="number" value={formData.liquidAssets} onChange={(e) => setFormData({...formData, liquidAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                <span className="text-xs text-gray-500 w-8">만원</span>
              </div>
              <p className="text-[10px] text-gray-400">CMA, 파킹통장, 금</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">🔒 안전성</label>
              <div className="flex items-center gap-1">
                <input type="number" value={formData.safeAssets} onChange={(e) => setFormData({...formData, safeAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                <span className="text-xs text-gray-500 w-8">만원</span>
              </div>
              <p className="text-[10px] text-gray-400">예금, 채권, 연금</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">📊 수익성</label>
              <div className="flex items-center gap-1">
                <input type="number" value={formData.growthAssets} onChange={(e) => setFormData({...formData, growthAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                <span className="text-xs text-gray-500 w-8">만원</span>
              </div>
              <p className="text-[10px] text-gray-400">펀드, ETF</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">🔥 고수익</label>
              <div className="flex items-center gap-1">
                <input type="number" value={formData.highRiskAssets} onChange={(e) => setFormData({...formData, highRiskAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                <span className="text-xs text-gray-500 w-8">만원</span>
              </div>
              <p className="text-[10px] text-gray-400">주식, 코인</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 부자지수 카드 */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center border border-amber-200">
        <p className="text-sm font-semibold text-amber-800 mb-1">💎 나의 부자지수</p>
        <p className="text-4xl font-black text-amber-900">{wealthIndex.toFixed(0)}%</p>
        <div className={`inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full ${wealthGrade.bgColor}`}>
          <span className="text-lg">{wealthGrade.icon}</span>
          <span className={`font-bold ${wealthGrade.color}`}>{wealthGrade.grade}</span>
        </div>
        <p className="text-xs text-amber-700 mt-2">
          순자산 {(netAssets / 10000).toFixed(1)}억 기준
        </p>
      </div>
      
      {/* 부자지수 등급 안내 */}
      <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600 flex flex-wrap gap-2 justify-center">
        <span>🏕️ 0%↓</span>
        <span>🏠 50%↓</span>
        <span>🏡 100%↓</span>
        <span>🏘️ 200%↓</span>
        <span>🏰 200%↑</span>
      </div>
      
      {/* 자산배분 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 px-3 py-2 flex items-center justify-between border-b border-gray-200">
          <span className="text-sm font-bold text-teal-800">📊 자산배분 포트폴리오</span>
          <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">⚠️ 예시</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[320px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 text-left font-semibold text-gray-600">자산유형</th>
                <th className="px-2 py-2 text-right font-semibold text-gray-600">현재금액</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-600">현재</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-600">기준</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-600">상태</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100">
                <td className="px-2 py-2 font-medium">💧 유동성</td>
                <td className="px-2 py-2 text-right">{formData.liquidAssets.toLocaleString()}만</td>
                <td className="px-2 py-2 text-center">{liquidRatio.toFixed(0)}%</td>
                <td className="px-2 py-2 text-center text-gray-500">{targetLiquid}%</td>
                <td className={`px-2 py-2 text-center font-bold ${liquidRatio < targetLiquid ? 'text-red-500' : 'text-green-500'}`}>
                  {liquidRatio < targetLiquid ? '부족' : '양호'}
                </td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="px-2 py-2 font-medium">🔒 안전성</td>
                <td className="px-2 py-2 text-right">{formData.safeAssets.toLocaleString()}만</td>
                <td className="px-2 py-2 text-center">{safeRatio.toFixed(0)}%</td>
                <td className="px-2 py-2 text-center text-gray-500">{targetSafe}%</td>
                <td className={`px-2 py-2 text-center font-bold ${safeRatio > targetSafe + 10 ? 'text-yellow-500' : 'text-green-500'}`}>
                  {safeRatio > targetSafe + 10 ? '과다' : '양호'}
                </td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="px-2 py-2 font-medium">📊 수익성</td>
                <td className="px-2 py-2 text-right">{formData.growthAssets.toLocaleString()}만</td>
                <td className="px-2 py-2 text-center">{growthRatio.toFixed(0)}%</td>
                <td className="px-2 py-2 text-center text-gray-500">{targetGrowth}%</td>
                <td className={`px-2 py-2 text-center font-bold ${growthRatio < targetGrowth ? 'text-red-500' : 'text-green-500'}`}>
                  {growthRatio < targetGrowth ? '부족' : '양호'}
                </td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="px-2 py-2 font-medium">🔥 고수익</td>
                <td className="px-2 py-2 text-right">{formData.highRiskAssets.toLocaleString()}만</td>
                <td className="px-2 py-2 text-center">{highRiskRatio.toFixed(0)}%</td>
                <td className="px-2 py-2 text-center text-gray-500">{targetHighRisk}%</td>
                <td className={`px-2 py-2 text-center font-bold ${highRiskRatio > targetHighRisk + 5 ? 'text-red-500' : 'text-green-500'}`}>
                  {highRiskRatio > targetHighRisk + 5 ? '과다' : '양호'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 비상예비자금 */}
      <div className={`rounded-xl p-3 flex items-center gap-3 ${hasEmergencyFund ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <span className="text-2xl">{hasEmergencyFund ? '✅' : '⚠️'}</span>
        <div className="flex-1">
          <p className={`text-sm font-bold ${hasEmergencyFund ? 'text-green-700' : 'text-red-700'}`}>
            비상예비자금 {hasEmergencyFund ? '확보' : '부족'}
          </p>
          <p className="text-xs text-gray-600">
            권장: {emergencyFundMin.toLocaleString()}~{emergencyFundMax.toLocaleString()}만원 (소득의 3~6배)
          </p>
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
          <p>유동성 20% / 안전성 50% / 수익성 20% / 고수익 10%</p>
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
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">{isLast ? '금융집 완성 🎉' : '다음 →'}</button>
      </div>
    </div>
  );
}
