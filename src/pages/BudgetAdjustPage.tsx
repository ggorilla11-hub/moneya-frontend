import { useState, useCallback, useRef } from 'react';
import type { IncomeExpenseData } from '../types/incomeExpense';
import { BUDGET_RATIOS } from '../types/incomeExpense';

interface BudgetAdjustPageProps {
  incomeExpenseData: IncomeExpenseData;
  onConfirm: (adjustedBudget: AdjustedBudget) => void;
  onBack: () => void;
  isFromHome?: boolean;
  onReAnalysis?: () => void;
}

export interface AdjustedBudget {
  livingExpense: number;
  savings: number;
  pension: number;
  insurance: number;
  loanPayment: number;
  surplus: number;
  totalIncome: number;
}

type BudgetField = 'livingExpense' | 'savings' | 'pension' | 'insurance' | 'loanPayment';

function BudgetAdjustPage({ incomeExpenseData, onConfirm, onBack, isFromHome = false, onReAnalysis }: BudgetAdjustPageProps) {
  const { income, familySize } = incomeExpenseData;
  
  // AudioContext 참조 (터치 시점에 활성화)
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const recommendedRatios = BUDGET_RATIOS[Math.min(familySize, 5)] || BUDGET_RATIOS[2];
  
  const recommendedBudget = {
    livingExpense: Math.round(income * recommendedRatios.living / 100),
    savings: Math.round(income * recommendedRatios.savings / 100),
    pension: Math.round(income * recommendedRatios.pension / 100),
    insurance: Math.round(income * recommendedRatios.insurance / 100),
    loanPayment: Math.round(income * recommendedRatios.loan / 100),
  };

  // 현재 지출 금액 (2차 재무분석에서 입력한 값) - 0도 유효한 값으로 처리
  const currentExpense = {
    livingExpense: incomeExpenseData.livingExpense ?? 0,
    savings: incomeExpenseData.savings ?? 0,
    pension: incomeExpenseData.pension ?? 0,
    insurance: incomeExpenseData.insurance ?? 0,
    loanPayment: incomeExpenseData.loanPayment ?? 0,
  };

  // 초기값: 입력된 값이 있으면 그 값 사용 (0 포함), undefined면 0으로 시작
  const [budget, setBudget] = useState({
    livingExpense: incomeExpenseData.livingExpense ?? 0,
    savings: incomeExpenseData.savings ?? 0,
    pension: incomeExpenseData.pension ?? 0,
    insurance: incomeExpenseData.insurance ?? 0,
    loanPayment: incomeExpenseData.loanPayment ?? 0,
  });

  const [confirmed, setConfirmed] = useState({
    livingExpense: isFromHome,
    savings: isFromHome,
    pension: isFromHome,
    insurance: isFromHome,
    loanPayment: isFromHome,
  });

  const [activeSlider, setActiveSlider] = useState<string | null>(null);
  
  // 스냅 효과 상태
  const [snappedFields, setSnappedFields] = useState<Set<string>>(new Set());
  
  // 예산 시작일 설정
  const [budgetStartDate, setBudgetStartDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  });

  const usedBudget = budget.livingExpense + budget.savings + budget.pension + budget.insurance + budget.loanPayment;
  const surplus = income - usedBudget;

  const allConfirmed = confirmed.livingExpense && confirmed.savings && confirmed.pension && confirmed.insurance && confirmed.loanPayment;
  const isValidBudget = surplus >= 0;
  const canStart = allConfirmed && isValidBudget;

  // 1만원 단위 조정
  const STEP = 1;
  
  // 스냅 허용 오차: 5만원 (원 단위이므로 50000)
  const SNAP_TOLERANCE = 50000;

  // AudioContext 초기화 (터치 시점에 호출)
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // suspended 상태면 resume
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  // 스냅 소리 재생 (더 길고 명쾌한 소리)
  const playSnapSound = useCallback(() => {
    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // 더 높고 명쾌한 소리
      oscillator.frequency.value = 1200;
      oscillator.type = 'sine';
      
      // 볼륨 강화, 더 긴 지속시간
      gainNode.gain.setValueAtTime(0.6, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, []);

  const handleSliderChange = (field: BudgetField, newValue: number) => {
    if (confirmed[field]) return;
    
    // 1만원 단위로 반올림
    newValue = Math.round(newValue / STEP) * STEP;
    newValue = Math.max(0, Math.min(newValue, income));
    
    const recommended = recommendedBudget[field];
    
    // 권장값에 스냅 (허용 오차 5만원 = 50000원)
    if (Math.abs(newValue - recommended) <= SNAP_TOLERANCE) {
      newValue = recommended;
      
      // 스냅 효과 (처음 스냅될 때만)
      if (!snappedFields.has(field)) {
        setSnappedFields(prev => new Set(prev).add(field));
        playSnapSound();
        
        // 0.8초 후 스냅 효과 제거
        setTimeout(() => {
          setSnappedFields(prev => {
            const newSet = new Set(prev);
            newSet.delete(field);
            return newSet;
          });
        }, 800);
      }
    } else {
      // 권장값에서 벗어나면 스냅 상태 제거
      setSnappedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
    
    setBudget(prev => ({ ...prev, [field]: newValue }));
  };

  const handleConfirmToggle = (field: BudgetField) => {
    setConfirmed(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getPercent = (value: number) => income > 0 ? Math.round((value / income) * 100) : 0;
  
  // 금액 표시 (원 단위)
  const formatManwon = (manwon: number) => `₩${manwon.toLocaleString()}원`;
  
  // 차이 금액 표시 (원 단위)
  const formatWonDiff = (manwon: number) => `${manwon.toLocaleString()}원`;

  const monthlySavingsIncrease = budget.savings - currentExpense.savings;
  const yearlySavingsIncrease = monthlySavingsIncrease * 12;

  const handleConfirm = () => {
    const adjustedBudget: AdjustedBudget = {
      livingExpense: budget.livingExpense,
      savings: budget.savings,
      pension: budget.pension,
      insurance: budget.insurance,
      loanPayment: budget.loanPayment,
      surplus: surplus,
      totalIncome: income,
    };
    onConfirm(adjustedBudget);
  };

  const confirmedCount = Object.values(confirmed).filter(v => v).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-green-50 to-amber-50 flex flex-col">
      
      <div className="flex items-center gap-3 p-4 pt-6">
        <button onClick={onBack} className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">
          {isFromHome ? '📈 예산 분석 결과' : '📋 예산 조정'}
        </h1>
        {!isFromHome && (
          <div className="ml-auto flex items-center gap-2">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '83%' }}></div>
            </div>
            <span className="text-xs font-semibold text-gray-400">5/6</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-40">
        
        {!isFromHome && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 mb-4 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                </svg>
              </div>
              <span className="font-bold text-base">AI 머니야 권장안 📊</span>
            </div>
            <p className="text-sm leading-relaxed opacity-95">
              {familySize}인 가구 기준으로 예산을 추천해드려요.<br/>
              <span className="bg-white/20 px-2 py-0.5 rounded font-bold">각 항목을 조정한 후 [확정/조정] 버튼</span>을 눌러주세요!
            </p>
          </div>
        )}

        {!isFromHome && (
          <div className="bg-white rounded-xl p-3 mb-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">확정 진행률</span>
              <span className="text-sm font-bold text-blue-600">{confirmedCount}/5 항목 확정</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${(confirmedCount / 5) * 100}%` }}></div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800">🎯 예산 조정 (월 기준)</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isFromHome ? '수정하려면 확정을 해제하고 조정하세요' : '슬라이더 조정 후 [확정/조정] 버튼을 눌러주세요'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">총 수입</div>
              <div className="font-bold text-blue-600">{formatManwon(income)}</div>
            </div>
          </div>

          <SliderItem 
            icon="🏠" 
            label="생활비" 
            value={budget.livingExpense} 
            currentValue={currentExpense.livingExpense}
            recommended={recommendedBudget.livingExpense} 
            maxValue={income} 
            percent={getPercent(budget.livingExpense)} 
            onChange={(v) => handleSliderChange('livingExpense', v)} 
            isConfirmed={confirmed.livingExpense} 
            onConfirmToggle={() => handleConfirmToggle('livingExpense')} 
            isActive={activeSlider === 'livingExpense'} 
            onFocus={() => setActiveSlider('livingExpense')} 
            onBlur={() => setActiveSlider(null)} 
            color="amber" 
            formatManwon={formatManwon}
            formatWonDiff={formatWonDiff}
            step={STEP}
            isSnapped={snappedFields.has('livingExpense')}
            onTouchInit={initAudio}
          />

          <SliderItem 
            icon="💰" 
            label="저축/투자" 
            value={budget.savings} 
            currentValue={currentExpense.savings}
            recommended={recommendedBudget.savings} 
            maxValue={income} 
            percent={getPercent(budget.savings)} 
            onChange={(v) => handleSliderChange('savings', v)} 
            isConfirmed={confirmed.savings} 
            onConfirmToggle={() => handleConfirmToggle('savings')} 
            isActive={activeSlider === 'savings'} 
            onFocus={() => setActiveSlider('savings')} 
            onBlur={() => setActiveSlider(null)} 
            color="green" 
            formatManwon={formatManwon}
            formatWonDiff={formatWonDiff}
            step={STEP}
            isSnapped={snappedFields.has('savings')}
            onTouchInit={initAudio}
          />

          <SliderItem 
            icon="🏦" 
            label="노후연금" 
            value={budget.pension} 
            currentValue={currentExpense.pension}
            recommended={recommendedBudget.pension} 
            maxValue={income} 
            percent={getPercent(budget.pension)} 
            onChange={(v) => handleSliderChange('pension', v)} 
            isConfirmed={confirmed.pension} 
            onConfirmToggle={() => handleConfirmToggle('pension')} 
            isActive={activeSlider === 'pension'} 
            onFocus={() => setActiveSlider('pension')} 
            onBlur={() => setActiveSlider(null)} 
            color="blue" 
            formatManwon={formatManwon}
            formatWonDiff={formatWonDiff}
            step={STEP}
            isSnapped={snappedFields.has('pension')}
            onTouchInit={initAudio}
          />

          <SliderItem 
            icon="🛡️" 
            label="보장성보험" 
            value={budget.insurance} 
            currentValue={currentExpense.insurance}
            recommended={recommendedBudget.insurance} 
            maxValue={income} 
            percent={getPercent(budget.insurance)} 
            onChange={(v) => handleSliderChange('insurance', v)} 
            isConfirmed={confirmed.insurance} 
            onConfirmToggle={() => handleConfirmToggle('insurance')} 
            isActive={activeSlider === 'insurance'} 
            onFocus={() => setActiveSlider('insurance')} 
            onBlur={() => setActiveSlider(null)} 
            color="purple" 
            formatManwon={formatManwon}
            formatWonDiff={formatWonDiff}
            step={STEP}
            isSnapped={snappedFields.has('insurance')}
            onTouchInit={initAudio}
          />

          <SliderItem 
            icon="💳" 
            label="대출원리금" 
            value={budget.loanPayment} 
            currentValue={currentExpense.loanPayment}
            recommended={recommendedBudget.loanPayment} 
            maxValue={income} 
            percent={getPercent(budget.loanPayment)} 
            onChange={(v) => handleSliderChange('loanPayment', v)} 
            isConfirmed={confirmed.loanPayment} 
            onConfirmToggle={() => handleConfirmToggle('loanPayment')} 
            isActive={activeSlider === 'loanPayment'} 
            onFocus={() => setActiveSlider('loanPayment')} 
            onBlur={() => setActiveSlider(null)} 
            color="gray" 
            formatManwon={formatManwon}
            formatWonDiff={formatWonDiff}
            step={STEP}
            isSnapped={snappedFields.has('loanPayment')}
            onTouchInit={initAudio}
          />

          <div className="pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><span>💵</span> 잉여자금</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-extrabold ${surplus >= 0 ? 'text-blue-600' : 'text-red-500'}`}>{formatManwon(Math.abs(surplus))}</span>
                <span className="text-sm text-gray-400">({Math.abs(getPercent(surplus))}%)</span>
              </div>
            </div>
            <div className={`text-right text-xs mt-1 ${surplus >= 0 ? 'text-blue-500' : 'text-red-500 font-bold'}`}>
              {surplus > 0 ? '✨ 추가 저축 또는 여유자금으로 활용' : surplus < 0 ? '⚠️ 예산 초과! 다른 항목을 줄여주세요' : '✅ 딱 맞게 배분되었습니다'}
            </div>
          </div>
        </div>

        {/* 예산 시작일 설정 (isFromHome일 때만 표시) */}
        {isFromHome && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
            <h3 className="font-bold text-gray-800 mb-2">📅 예산 시작일 설정</h3>
            <p className="text-xs text-gray-500 mb-3">월예산을 새로 적용할 시작 날짜를 선택하세요</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={budgetStartDate}
                onChange={(e) => setBudgetStartDate(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-3 bg-green-500 text-white font-bold rounded-xl">
                적용
              </button>
            </div>
          </div>
        )}

        {!isFromHome && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
            <h3 className="font-bold text-green-700 mb-3">✨ 조정 효과 요약</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className={`text-2xl font-extrabold ${monthlySavingsIncrease >= 0 ? 'text-green-600' : 'text-red-500'}`}>{monthlySavingsIncrease >= 0 ? '+' : ''}{formatWonDiff(monthlySavingsIncrease)}</div>
                <div className="text-xs text-gray-500 mt-1">월 저축 변화</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className={`text-2xl font-extrabold ${yearlySavingsIncrease >= 0 ? 'text-green-600' : 'text-red-500'}`}>{yearlySavingsIncrease >= 0 ? '+' : ''}{formatWonDiff(yearlySavingsIncrease)}</div>
                <div className="text-xs text-gray-500 mt-1">연간 저축 변화</div>
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-6">
        {!isFromHome && !allConfirmed && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-3">
            <p className="text-center text-base text-amber-700 font-bold">
              ⚠️ 모든 항목을 확정해주세요 ({confirmedCount}/5)
            </p>
          </div>
        )}
        {!isFromHome && allConfirmed && !isValidBudget && (
          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 mb-3">
            <p className="text-center text-xl text-red-600 font-extrabold">
              🚫 예산이 {formatManwon(Math.abs(surplus))} 초과!
            </p>
            <p className="text-center text-sm text-red-500 mt-1">
              다른 항목을 줄여주세요
            </p>
          </div>
        )}
        
        {isFromHome ? (
          <div className="space-y-2">
            <button 
              onClick={handleConfirm} 
              disabled={!isValidBudget}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl transition-all ${isValidBudget ? 'bg-gradient-to-r from-green-500 to-green-600 text-white active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              ✓ 이 예산으로 시작하기
            </button>
            <button 
              onClick={onReAnalysis}
              className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl flex items-center justify-center gap-2"
            >
              🔄 다시 분석하기
            </button>
          </div>
        ) : (
          <button 
            onClick={handleConfirm} 
            disabled={!canStart} 
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl transition-all ${canStart ? 'bg-gradient-to-r from-green-500 to-green-600 text-white active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {canStart ? '이 예산으로 시작하기' : '모든 항목을 확정해주세요'}
            {canStart && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
          </button>
        )}
      </div>

    </div>
  );
}

interface SliderItemProps {
  icon: string;
  label: string;
  value: number;
  currentValue: number;
  recommended: number;
  maxValue: number;
  percent: number;
  onChange: (value: number) => void;
  isConfirmed: boolean;
  onConfirmToggle: () => void;
  isActive: boolean;
  onFocus: () => void;
  onBlur: () => void;
  color: 'green' | 'amber' | 'blue' | 'purple' | 'gray';
  formatManwon: (v: number) => string;
  formatWonDiff: (v: number) => string;
  step: number;
  isSnapped: boolean;
  onTouchInit: () => void;
}

function SliderItem({ 
  icon, 
  label, 
  value, 
  currentValue,
  recommended, 
  maxValue, 
  percent, 
  onChange, 
  isConfirmed, 
  onConfirmToggle, 
  isActive, 
  onFocus, 
  onBlur, 
  color, 
  formatManwon,
  formatWonDiff,
  step,
  isSnapped,
  onTouchInit
}: SliderItemProps) {
  const colorMap = {
    green: { fill: 'bg-green-500', border: 'border-green-500', text: 'text-green-600', bg: '#22c55e' },
    amber: { fill: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-600', bg: '#f59e0b' },
    blue: { fill: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-600', bg: '#3b82f6' },
    purple: { fill: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-600', bg: '#a855f7' },
    gray: { fill: 'bg-gray-500', border: 'border-gray-500', text: 'text-gray-600', bg: '#6b7280' },
  };
  const colors = colorMap[color];
  const difference = value - recommended;
  const recommendedPercent = maxValue > 0 ? (recommended / maxValue) * 100 : 0;

  // 슬라이더 터치/클릭 시 AudioContext 초기화
  const handleInteractionStart = () => {
    onTouchInit();
    onFocus();
  };

  return (
    <div className={`mb-4 pb-4 border-b border-gray-100 ${isConfirmed ? 'opacity-75' : ''}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><span>{icon}</span> {label}</span>
        <div className="flex items-center gap-2">
          <span className={`font-extrabold transition-all duration-200 ${colors.text} ${isActive && !isConfirmed ? 'text-2xl' : 'text-xl'}`}>{formatManwon(value)}</span>
          <span className="text-sm text-gray-400">({percent}%)</span>
          <button onClick={onConfirmToggle} className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${isConfirmed ? 'bg-green-100 text-green-600 border border-green-300' : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'}`}>
            {isConfirmed ? '✓ 확정됨' : '확정/조정'}
          </button>
        </div>
      </div>
      
      {/* 현재 지출 금액 표시 */}
      <div className="text-xs text-gray-400 mb-2 text-right">
        현재 지출: <span className="font-semibold text-gray-600">{formatManwon(currentValue)}</span>
      </div>
      
      <div className="relative h-10">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-3 bg-gray-200 rounded-full"></div>
        <div className={`absolute top-1/2 -translate-y-1/2 left-0 h-3 rounded-full transition-all ${isConfirmed ? 'bg-gray-400' : colors.fill}`} style={{ width: `${percent}%` }}></div>
        
        {/* 권장값 세로 라인 - 더 두껍게 */}
        {!isConfirmed && (
          <div 
            className="absolute top-1/2 w-1 h-10 bg-gray-600 -translate-y-1/2 rounded-full" 
            style={{ left: `${recommendedPercent}%` }}
          />
        )}
        
        {!isConfirmed && (
          <input 
            type="range" 
            min={0} 
            max={maxValue} 
            step={step} 
            value={value} 
            onChange={(e) => onChange(Number(e.target.value))} 
            onFocus={handleInteractionStart} 
            onBlur={onBlur} 
            onTouchStart={handleInteractionStart} 
            onTouchEnd={onBlur}
            onMouseDown={handleInteractionStart}
            className="absolute top-0 left-0 w-full h-10 opacity-0 cursor-pointer z-10" 
          />
        )}
        
        {/* 슬라이더 동그라미 - 스냅 효과 강화 */}
        <div 
          className={`absolute top-1/2 w-7 h-7 border-4 rounded-full shadow-lg pointer-events-none transition-all duration-200 ${isConfirmed ? 'border-gray-400 bg-white' : colors.border} ${isActive && !isConfirmed ? 'scale-125' : ''} ${isSnapped ? 'scale-150' : ''}`} 
          style={{ 
            left: `${percent}%`, 
            transform: 'translate(-50%, -50%)',
            backgroundColor: isSnapped ? colors.bg : 'white',
          }}
        >
          {/* 스냅 시 펄스 애니메이션 */}
          {isSnapped && (
            <div 
              className="absolute inset-0 rounded-full animate-ping"
              style={{ backgroundColor: colors.bg, opacity: 0.75 }}
            ></div>
          )}
        </div>
      </div>
      
      <div className={`text-right text-xs font-semibold mt-1 ${isConfirmed ? 'text-green-600' : difference > 0 ? 'text-red-500' : difference < 0 ? 'text-green-500' : 'text-gray-400'}`}>
        {isConfirmed ? '✓ 금액이 확정되었습니다' : difference > 0 ? `▲ ${formatWonDiff(difference)} 증가 (권장보다 높음)` : difference < 0 ? `▼ ${formatWonDiff(Math.abs(difference))} 절감` : '✓ 권장 금액과 일치'}
      </div>
    </div>
  );
}

export default BudgetAdjustPage;
