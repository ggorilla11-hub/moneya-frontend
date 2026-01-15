import { useState, useEffect } from 'react';
import type { AdjustedBudget } from './BudgetAdjustPage';
import { useSpend } from '../context/SpendContext';
import { 
  getAgeGroup, 
  getPeerStats, 
  getMyRank,
  saveDailySnapshot,
  getSnapshots,
  getDaysSinceJoin,
  saveJoinDate,
  getNetAssetsSnapshots,
  getRecentMonthLabels,
  type PeerStats,
  type DailySnapshot
} from '../services/statsService';
import { getAIInsightAdvice } from '../services/aiService';

interface FinancialResult {
  name: string;
  age: number;
  income: number;
  assets: number;
  debt: number;
  wealthIndex: number;
}

interface DetailReportPageProps {
  adjustedBudget: AdjustedBudget | null;
  financialResult?: FinancialResult | null;
  userId?: string;
  onBack: () => void;
}

// 원 단위 → 만원 단위 변환 함수
const toManwon = (value: number): number => {
  if (value >= 100000) {
    return Math.round(value / 10000);
  }
  return value;
};

function DetailReportPage({ adjustedBudget, financialResult, userId, onBack }: DetailReportPageProps) {
  const { spendItems } = useSpend();
  const [peerStats, setPeerStats] = useState<PeerStats | null>(null);
  const [myRanks, setMyRanks] = useState({ savingsRate: 15, wealthIndex: 15 });
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalSavingsRate, setGoalSavingsRate] = useState(30);
  const [graphType, setGraphType] = useState<'netAssets' | 'netSavings'>('netAssets');

  const currentUserId = userId || 'guest';
  const daysSinceJoin = getDaysSinceJoin(currentUserId);

  // 모든 금액을 만원 단위로 변환
  const totalIncome = toManwon(adjustedBudget?.totalIncome || financialResult?.income || 500);
  const totalAssets = toManwon(financialResult?.assets || 28000);
  const totalDebt = toManwon(financialResult?.debt || 15600);
  const netAssets = totalAssets - totalDebt;
  const age = financialResult?.age || 44;
  const wealthIndex = financialResult?.wealthIndex || 95;

  // 실제 지출/저축 (원 단위 → 만원 단위로 변환)
  const actualLivingExpenseRaw = spendItems
    .filter(item => item.type === 'spent')
    .reduce((sum, item) => sum + item.amount, 0);

  const actualSavingsRaw = spendItems
    .filter(item => item.type === 'saved' || item.type === 'investment' || item.category === '저축투자' || item.category === '노후연금')
    .reduce((sum, item) => sum + item.amount, 0);

  const actualLivingExpense = toManwon(actualLivingExpenseRaw);
  const actualSavings = toManwon(actualSavingsRaw);

  // 예산도 만원 단위로 변환
  const budgetLiving = toManwon(adjustedBudget?.livingExpense || 500);
  const budgetSavings = toManwon(adjustedBudget?.savings || 100);
  const budgetPension = toManwon(adjustedBudget?.pension || 50);
  const budgetInsurance = toManwon(adjustedBudget?.insurance || 30);
  const budgetLoan = toManwon(adjustedBudget?.loanPayment || 80);

  const totalExpense = actualLivingExpense > 0 ? actualLivingExpense : budgetLiving;
  const totalSaving = actualSavings > 0 ? actualSavings : (budgetSavings + budgetPension);

  const savingsRate = totalIncome > 0 ? Math.round(((budgetSavings + budgetPension) / totalIncome) * 100) : 0;

  const cumulativeNetSavingsRaw = spendItems
    .filter(item => item.category === '저축투자' || item.category === '노후연금' || item.type === 'saved' || item.type === 'investment')
    .reduce((sum, item) => sum + item.amount, 0);
  
  const cumulativeNetSavings = toManwon(cumulativeNetSavingsRaw);

  // 월별 순저축 집계 - 현재 월만 데이터 있음
  const getMonthlySavingsData = () => {
    const monthLabels = getRecentMonthLabels(4);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    const savingsItems = spendItems.filter(item => 
      item.category === '저축투자' || item.category === '노후연금' || item.type === 'saved' || item.type === 'investment'
    );
    
    return monthLabels.map(label => {
      let monthTotal = 0;
      
      if (label.year === currentYear && label.monthNum === currentMonth) {
        const monthItems = savingsItems.filter(item => {
          const itemDate = new Date(item.timestamp);
          return itemDate.getFullYear() === label.year && 
                 (itemDate.getMonth() + 1) === label.monthNum;
        });
        monthTotal = monthItems.reduce((sum, item) => sum + item.amount, 0);
        monthTotal = toManwon(monthTotal);
      }
      
      return {
        month: label.month,
        year: label.year,
        monthNum: label.monthNum,
        netSavings: monthTotal,
      };
    });
  };

  // 월별 순자산 데이터 (재무진단 입력 기록)
  const getMonthlyNetAssetsData = () => {
    const monthLabels = getRecentMonthLabels(4);
    const netAssetsSnapshots = getNetAssetsSnapshots(currentUserId);
    
    return monthLabels.map(label => {
      const snapshot = netAssetsSnapshots.find(
        s => s.year === label.year && s.month === label.monthNum
      );
      
      return {
        month: label.month,
        year: label.year,
        monthNum: label.monthNum,
        netAssets: snapshot ? toManwon(snapshot.netAssets) : 0,
      };
    });
  };

  const monthlySavingsData = getMonthlySavingsData();
  const monthlyNetAssetsData = getMonthlyNetAssetsData();

  useEffect(() => {
    const savedGoal = localStorage.getItem(`moneya_goalSavingsRate_${currentUserId}`);
    if (savedGoal) {
      setGoalSavingsRate(parseInt(savedGoal));
    }
  }, [currentUserId]);

  useEffect(() => {
    saveJoinDate(currentUserId);
    
    const today = new Date().toISOString().split('T')[0];
    saveDailySnapshot(currentUserId, {
      date: today,
      daysSinceJoin: daysSinceJoin,
      netSavings: cumulativeNetSavings,
      netAssets: netAssets,
    });

    setSnapshots(getSnapshots(currentUserId));

    const loadPeerStats = async () => {
      const ageGroup = getAgeGroup(age);
      const stats = await getPeerStats(ageGroup);
      setPeerStats(stats);

      const savingsRank = await getMyRank(ageGroup, savingsRate, 'savingsRate');
      const wealthRank = await getMyRank(ageGroup, wealthIndex, 'wealthIndex');
      setMyRanks({ savingsRate: savingsRank, wealthIndex: wealthRank });
    };

    loadPeerStats();
  }, [currentUserId, daysSinceJoin, cumulativeNetSavings, netAssets, age, savingsRate, wealthIndex]);

  const getPeriodLabel = () => {
    if (daysSinceJoin < 30) return '가입 후 ' + daysSinceJoin + '일간';
    if (daysSinceJoin < 60) return '지난 30일 대비';
    if (daysSinceJoin < 90) return '지난 60일 대비';
    return '3개월 전 대비';
  };

  const getChangeFromStart = () => {
    if (snapshots.length < 2) return { netSavings: 0, netAssets: 0 };
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    return {
      netSavings: last.netSavings - first.netSavings,
      netAssets: last.netAssets - first.netAssets,
    };
  };

  const changes = getChangeFromStart();

  const handleGetAIAdvice = async () => {
    setIsLoadingAI(true);
    setShowAIModal(true);
    
    try {
      const advice = await getAIInsightAdvice({
        name: financialResult?.name,
        age: age,
        income: totalIncome,
        savingsRate: savingsRate,
        wealthIndex: wealthIndex,
        netAssets: netAssets,
        totalDebt: totalDebt,
        daysSinceJoin: daysSinceJoin,
        cumulativeNetSavings: cumulativeNetSavings,
      });
      setAiInsight(advice);
    } catch (error) {
      setAiInsight('절약 팁을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSaveGoal = () => {
    localStorage.setItem(`moneya_goalSavingsRate_${currentUserId}`, goalSavingsRate.toString());
    setShowGoalModal(false);
  };

  const getBudgetItems = () => {
    const livingRate = budgetLiving > 0 ? Math.round((actualLivingExpense / budgetLiving) * 100) : 0;

    return [
      { 
        icon: '🛒', 
        name: '생활비', 
        budget: budgetLiving, 
        actual: actualLivingExpense > 0 ? actualLivingExpense : budgetLiving,
        rate: actualLivingExpense > 0 ? livingRate : 100,
        status: livingRate === 0 ? 'normal' : livingRate < 80 ? 'good' : livingRate > 120 ? 'bad' : 'normal'
      },
      { 
        icon: '💰', 
        name: '저축/투자', 
        budget: budgetSavings, 
        actual: budgetSavings,
        rate: 100,
        status: 'good'
      },
      { 
        icon: '🏦', 
        name: '노후연금', 
        budget: budgetPension, 
        actual: budgetPension,
        rate: 100,
        status: 'normal'
      },
      { 
        icon: '🛡️', 
        name: '보장성보험', 
        budget: budgetInsurance, 
        actual: budgetInsurance,
        rate: 100,
        status: 'normal'
      },
      { 
        icon: '💳', 
        name: '대출원리금', 
        budget: budgetLoan, 
        actual: budgetLoan,
        rate: 100,
        status: 'normal'
      },
    ];
  };

  const budgetItems = getBudgetItems();
  const goodCount = budgetItems.filter(i => i.status === 'good').length;
  const normalCount = budgetItems.filter(i => i.status === 'normal').length;
  const badCount = budgetItems.filter(i => i.status === 'bad').length;

  const getAIInsight = () => {
    const messages = [];
    
    if (daysSinceJoin === 0) {
      messages.push('환영합니다! 오늘부터 재무 여정을 시작하셨네요. 🎉');
    } else if (daysSinceJoin < 7) {
      messages.push('가입 ' + daysSinceJoin + '일차! 좋은 시작이에요. 꾸준히 기록해보세요. 💪');
    } else {
      messages.push(daysSinceJoin + '일간 꾸준히 관리하고 계시네요! 👏');
    }

    if (cumulativeNetSavings > 0) {
      messages.push('지금까지 총 ' + cumulativeNetSavings + '만원을 저축하셨어요!');
    }

    if (savingsRate >= goalSavingsRate) {
      messages.push('저축률 ' + savingsRate + '%로 목표(' + goalSavingsRate + '%)를 달성했어요! 🎯');
    } else if (savingsRate >= goalSavingsRate * 0.7) {
      messages.push('저축률 ' + savingsRate + '%로 목표(' + goalSavingsRate + '%)에 거의 도달! 💰');
    } else {
      messages.push('목표 저축률 ' + goalSavingsRate + '%까지 ' + (goalSavingsRate - savingsRate) + '%p 남았어요. 📈');
    }

    if (peerStats && savingsRate > peerStats.avgSavingsRate) {
      messages.push('동년배 평균(' + peerStats.avgSavingsRate + '%)보다 ' + (savingsRate - peerStats.avgSavingsRate) + '%p 높아요!');
    }

    return messages.join('\n\n');
  };

  // 월별 그래프 포인트 계산
  const getMonthlyGraphPoints = () => {
    const isNetAssets = graphType === 'netAssets';
    const data = isNetAssets ? monthlyNetAssetsData : monthlySavingsData;
    const values = isNetAssets 
      ? monthlyNetAssetsData.map(d => d.netAssets) 
      : monthlySavingsData.map(d => d.netSavings);
    
    const hasAnyData = values.some(v => v > 0);
    
    if (!hasAnyData) {
      return { 
        points: data.map((d, i) => ({
          x: 40 + (i * 80),
          y: 90,
          value: 0,
          month: d.month,
          hasData: false,
        })), 
        hasData: false 
      };
    }
    
    const positiveValues = values.filter(v => v > 0);
    const maxValue = Math.max(...positiveValues);
    const minValue = Math.min(...positiveValues);
    const range = maxValue - minValue || maxValue || 1;
    
    const points = data.map((d, i) => {
      const value = isNetAssets 
        ? monthlyNetAssetsData[i].netAssets 
        : monthlySavingsData[i].netSavings;
      const hasData = value > 0;
      
      let y = 90;
      if (hasData) {
        y = 85 - ((value - minValue) / range) * 60;
      }
      
      return {
        x: 40 + (i * 80),
        y: y,
        value: value,
        month: d.month,
        hasData: hasData,
      };
    });
    
    return { points, hasData: true };
  };

  const graphResult = getMonthlyGraphPoints();
  const graphPoints = graphResult.points;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _hasGraphData = graphResult.hasData;
  const dataPoints = graphPoints.filter(p => p.hasData);

  const getChangePercent = () => {
    const isNetAssets = graphType === 'netAssets';
    const values = isNetAssets 
      ? monthlyNetAssetsData.map(d => d.netAssets).filter(v => v > 0)
      : monthlySavingsData.map(d => d.netSavings).filter(v => v > 0);
    
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    if (first === 0) return 0;
    return Math.round(((last - first) / first) * 100 * 10) / 10;
  };

  const changePercent = getChangePercent();

  const formatMoney = (amount: number) => {
    if (amount >= 10000) return (amount / 10000).toFixed(2) + '억';
    return amount + '만';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🤖</span>
              </div>
              <span className="font-bold text-gray-800">AI 머니야 절약 팁</span>
            </div>
            
            {isLoadingAI ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">맞춤 절약 팁 분석 중...</p>
              </div>
            ) : (
              <div className="bg-purple-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{aiInsight}</p>
              </div>
            )}
            
            <button 
              onClick={() => setShowAIModal(false)}
              className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🎯</span>
              </div>
              <span className="font-bold text-gray-800">목표 저축률 수정</span>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-3">목표 저축률을 설정하세요</p>
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => setGoalSavingsRate(Math.max(5, goalSavingsRate - 5))}
                  className="w-12 h-12 bg-gray-100 rounded-full text-2xl font-bold text-gray-600"
                >
                  -
                </button>
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-green-600">{goalSavingsRate}%</p>
                  <p className="text-xs text-gray-400 mt-1">현재 {savingsRate}%</p>
                </div>
                <button 
                  onClick={() => setGoalSavingsRate(Math.min(80, goalSavingsRate + 5))}
                  className="w-12 h-12 bg-gray-100 rounded-full text-2xl font-bold text-gray-600"
                >
                  +
                </button>
              </div>
              
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[20, 30, 40, 50].map(rate => (
                  <button
                    key={rate}
                    onClick={() => setGoalSavingsRate(rate)}
                    className={'py-2 rounded-lg text-sm font-semibold ' + (goalSavingsRate === rate ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600')}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setShowGoalModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl"
              >
                취소
              </button>
              <button 
                onClick={handleSaveGoal}
                className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-200">
        <button 
          onClick={onBack}
          className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <span className="flex-1 font-bold text-gray-800">📊 상세 리포트</span>
        <span className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-sm font-semibold">
          D+{daysSinceJoin}
        </span>
      </div>

      <div className="p-4 space-y-4 pb-8">

        <div className="bg-gradient-to-br from-slate-700 to-blue-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm opacity-80">💎 자산 요약</p>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">{getPeriodLabel()}</span>
          </div>
          <div className="text-center mb-5">
            <p className="text-xs opacity-70 mb-1">순자산</p>
            <p className="text-4xl font-extrabold">₩{formatMoney(netAssets)}</p>
            {changes.netAssets !== 0 && (
              <p className={'text-sm mt-2 ' + (changes.netAssets > 0 ? 'text-green-300' : 'text-red-300')}>
                {changes.netAssets > 0 ? '▲' : '▼'} {changes.netAssets > 0 ? '+' : ''}₩{formatMoney(Math.abs(changes.netAssets))} {getPeriodLabel()}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xs opacity-70 mb-1">총 자산</p>
              <p className="text-xl font-bold">₩{formatMoney(totalAssets)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xs opacity-70 mb-1">총 부채</p>
              <p className="text-xl font-bold text-red-300">₩{formatMoney(totalDebt)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-800">📈 그래프 변화추이</span>
            {dataPoints.length >= 2 && (
              <span className={'text-xs px-2 py-1 rounded-full font-semibold ' + (changePercent > 0 ? 'bg-green-100 text-green-600' : changePercent < 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500')}>
                {changePercent > 0 ? '▲' : changePercent < 0 ? '▼' : ''} {Math.abs(changePercent)}%
              </span>
            )}
          </div>
          
          <div className="h-32 bg-gradient-to-b from-green-50 to-transparent rounded-xl relative mb-2">
            {dataPoints.length > 0 ? (
              <svg className="w-full h-full" viewBox="0 0 360 120" preserveAspectRatio="none">
                <line x1="30" y1="30" x2="330" y2="30" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
                
                {dataPoints.length > 1 && (
                  <path 
                    d={`M${dataPoints[0].x},${dataPoints[0].y} ${dataPoints.slice(1).map(p => `L${p.x},${p.y}`).join(' ')} L${dataPoints[dataPoints.length - 1].x},100 L${dataPoints[0].x},100 Z`}
                    fill="url(#greenGradient)"
                    opacity="0.3"
                  />
                )}
                
                {dataPoints.length > 1 && (
                  <path 
                    d={`M${dataPoints.map(p => `${p.x},${p.y}`).join(' L')}`}
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                
                {graphPoints.map((p, i) => (
                  p.hasData ? (
                    <circle key={i} cx={p.x} cy={p.y} r="6" fill="#10B981" stroke="white" strokeWidth="2" />
                  ) : (
                    <circle key={i} cx={p.x} cy={90} r="4" fill="#D1D5DB" opacity="0.5" />
                  )
                ))}
                
                <defs>
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm text-center px-4">
                  {graphType === 'netAssets' 
                    ? '재무진단을 입력하면 순자산 추이가 표시됩니다' 
                    : '저축을 기록하면 순저축 추이가 표시됩니다'}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between text-xs text-gray-400 px-6 mb-3">
            {graphPoints.map((p, i) => (
              <span key={i} className={p.hasData ? 'text-gray-600 font-medium' : ''}>{p.month}</span>
            ))}
          </div>
          
          <div className="flex justify-center gap-6 pt-3 border-t border-gray-100">
            <button 
              onClick={() => setGraphType('netAssets')}
              className="flex items-center gap-1.5 text-xs"
            >
              <div className={`w-3 h-3 rounded-full ${graphType === 'netAssets' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={graphType === 'netAssets' ? 'text-green-600 font-semibold' : 'text-gray-400'}>순자산추이</span>
            </button>
            <button 
              onClick={() => setGraphType('netSavings')}
              className="flex items-center gap-1.5 text-xs"
            >
              <div className={`w-3 h-3 rounded-full ${graphType === 'netSavings' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <span className={graphType === 'netSavings' ? 'text-blue-600 font-semibold' : 'text-gray-400'}>순저축추이</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-800">💰 이번 달 수입/지출</span>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">실시간</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-xl block mb-1">💵</span>
              <p className="text-xs text-gray-400 mb-1">수입</p>
              <p className="font-bold text-blue-600">{totalIncome}만</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-xl block mb-1">💳</span>
              <p className="text-xs text-gray-400 mb-1">지출</p>
              <p className="font-bold text-red-500">{totalExpense}만</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-xl block mb-1">🏦</span>
              <p className="text-xs text-gray-400 mb-1">저축</p>
              <p className="font-bold text-green-600">{totalSaving}만</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-gray-800">📋 예산 실행율</span>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold">D+{daysSinceJoin} 기준</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">예산 대비 실제 지출/저축 현황입니다</p>
          
          <div className="space-y-2">
            {budgetItems.map((item, index) => {
              let borderColor = 'border-amber-500';
              let textColor = 'text-amber-500';
              let statusText = '● 적정';
              
              if (item.status === 'good') {
                borderColor = 'border-green-500';
                textColor = 'text-green-600';
                statusText = '✓ 절약';
              } else if (item.status === 'bad') {
                borderColor = 'border-red-500';
                textColor = 'text-red-500';
                statusText = '⚠ 부족';
              }
              
              return (
                <div 
                  key={index} 
                  className={'flex items-center justify-between p-3 bg-gray-50 rounded-xl border-l-4 ' + borderColor}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">예산 ₩{item.budget}만 → 실제 ₩{item.actual}만</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={'font-bold text-lg ' + textColor}>{item.rate}%</p>
                    <p className={'text-xs font-semibold ' + textColor}>{statusText}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">잘한 항목</p>
              <p className="text-xl font-bold text-green-600">{goodCount}개</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">적정 항목</p>
              <p className="text-xl font-bold text-amber-500">{normalCount}개</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">주의 항목</p>
              <p className="text-xl font-bold text-red-500">{badCount}개</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-800">🎯 저축률 분석</span>
            <button 
              onClick={() => setShowGoalModal(true)}
              className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold"
            >
              목표 {goalSavingsRate}%
            </button>
          </div>
          <div className="text-center mb-4">
            <p className="text-xs text-gray-400 mb-1">현재 저축률</p>
            <p className={'text-4xl font-extrabold ' + (savingsRate >= goalSavingsRate ? 'text-green-600' : savingsRate >= goalSavingsRate * 0.7 ? 'text-amber-500' : 'text-red-500')}>
              {savingsRate}%
            </p>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-2 relative">
            <div 
              className={'h-full rounded-full ' + (savingsRate >= goalSavingsRate ? 'bg-green-500' : savingsRate >= goalSavingsRate * 0.7 ? 'bg-amber-500' : 'bg-red-500')}
              style={{ width: Math.min((savingsRate / goalSavingsRate) * 100, 100) + '%' }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-4">
            <span>0%</span>
            <span>목표 {goalSavingsRate}%</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">가입시</p>
              <p className="font-bold text-gray-800">{savingsRate}%</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">동년배 평균</p>
              <p className="font-bold text-gray-800">{peerStats?.avgSavingsRate || 18}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-gray-800">👥 동년배 비교</span>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-semibold">
              {getAgeGroup(age)}
            </span>
          </div>
          <p className="text-xs text-gray-400 text-center mb-4">
            {peerStats?.totalCount || 0}명의 동년배 데이터 기반
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-lg">💰</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">저축률</p>
                  <p className="text-xs text-gray-400">내 {savingsRate}% vs 평균 {peerStats?.avgSavingsRate || 18}%</p>
                </div>
              </div>
              <div className={'px-3 py-1.5 rounded-lg font-bold text-sm ' + (savingsRate > (peerStats?.avgSavingsRate || 18) ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600')}>
                상위 {myRanks.savingsRate}%
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">부자지수</p>
                  <p className="text-xs text-gray-400">내 {wealthIndex}점 vs 평균 {peerStats?.avgWealthIndex || 142}점</p>
                </div>
              </div>
              <div className={'px-3 py-1.5 rounded-lg font-bold text-sm ' + (wealthIndex > (peerStats?.avgWealthIndex || 142) ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600')}>
                상위 {myRanks.wealthIndex}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🤖</span>
            </div>
            <span className="font-bold text-purple-700">💡 AI 머니야 인사이트</span>
          </div>
          <p className="text-gray-700 leading-relaxed text-sm mb-4 whitespace-pre-line">
            {getAIInsight()}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={handleGetAIAdvice}
              className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-xl text-sm"
            >
              절약 팁 보기
            </button>
            <button 
              onClick={() => setShowGoalModal(true)}
              className="flex-1 py-2.5 bg-white text-purple-600 font-semibold rounded-xl text-sm border border-purple-300"
            >
              목표 수정
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DetailReportPage;
