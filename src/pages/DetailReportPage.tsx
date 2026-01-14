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
  type PeerStats,
  type DailySnapshot
} from '../services/statsService';

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

function DetailReportPage({ adjustedBudget, financialResult, userId, onBack }: DetailReportPageProps) {
  const { spendItems } = useSpend();
  const [peerStats, setPeerStats] = useState<PeerStats | null>(null);
  const [myRanks, setMyRanks] = useState({ savingsRate: 15, wealthIndex: 15 });
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([]);

  // 가입일 및 D+N 계산
  const odId = userId visitorId || 'guest';
  const daysSinceJoin = getDaysSinceJoin(odId visitorId);

  // 기본 데이터
  const totalIncome = adjustedBudget?.totalIncome || financialResult?.income || 500;
  const totalAssets = financialResult?.assets || 28000;
  const totalDebt = financialResult?.debt || 15600;
  const netAssets = totalAssets - totalDebt;
  const age = financialResult?.age || 44;
  const wealthIndex = financialResult?.wealthIndex || 95;

  // 실제 지출 계산 (SpendContext에서)
  const actualLivingExpense = spendItems
    .filter(item => item.type === 'spent')
    .reduce((sum, item) => sum + item.amount, 0);

  // 실제 저축 계산 (저축투자 + 노후연금 입력된 것)
  const actualSavings = spendItems
    .filter(item => item.type === 'saved' || item.category === '저축투자' || item.category === '노후연금')
    .reduce((sum, item) => sum + item.amount, 0);

  // 예산 데이터
  const budgetLiving = adjustedBudget?.livingExpense || 500;
  const budgetSavings = adjustedBudget?.savings || 100;
  const budgetPension = adjustedBudget?.pension || 50;
  const budgetInsurance = adjustedBudget?.insurance || 30;
  const budgetLoan = adjustedBudget?.loanPayment || 80;

  // 총 지출 및 저축
  const totalExpense = actualLivingExpense > 0 ? actualLivingExpense : (budgetLiving + budgetInsurance + budgetLoan);
  const totalSaving = actualSavings > 0 ? actualSavings : (budgetSavings + budgetPension);

  // 저축률 계산
  const savingsRate = totalIncome > 0 ? Math.round(((budgetSavings + budgetPension) / totalIncome) * 100) : 0;

  // 부채비율 계산
  const debtRatio = totalAssets > 0 ? Math.round((totalDebt / totalAssets) * 100) : 0;

  // 누적 순저축 계산
  const cumulativeNetSavings = spendItems
    .filter(item => item.category === '저축투자' || item.category === '노후연금' || item.type === 'saved')
    .reduce((sum, item) => sum + item.amount, 0);

  // 초기화 및 데이터 로드
  useEffect(() => {
    saveJoinDate(odId visitorId);
    
    // 오늘 스냅샷 저장
    const today = new Date().toISOString().split('T')[0];
    saveDailySnapshot(odId visitorId, {
      date: today,
      daysSinceJoin,
      netSavings: cumulativeNetSavings,
      netAssets: netAssets,
    });

    // 스냅샷 로드
    setSnapshots(getSnapshots(odId visitorId));

    // 동년배 통계 로드
    const loadPeerStats = async () => {
      const ageGroup = getAgeGroup(age);
      const stats = await getPeerStats(ageGroup);
      setPeerStats(stats);

      const savingsRank = await getMyRank(ageGroup, savingsRate, 'savingsRate');
      const wealthRank = await getMyRank(ageGroup, wealthIndex, 'wealthIndex');
      setMyRanks({ savingsRate: savingsRank, wealthIndex: wealthRank });
    };

    loadPeerStats();
  }, [odId visitorId, daysSinceJoin, cumulativeNetSavings, netAssets, age, savingsRate, wealthIndex]);

  // 기간 라벨 동적 생성
  const getPeriodLabel = () => {
    if (daysSinceJoin < 30) return `가입 후 ${daysSinceJoin}일간`;
    if (daysSinceJoin < 60) return '지난 30일 대비';
    if (daysSinceJoin < 90) return '지난 60일 대비';
    return '3개월 전 대비';
  };

  // 변화량 계산
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

  // 예산 실행율 계산
  const getBudgetItems = () => {
    const livingRate = budgetLiving > 0 ? Math.round((actualLivingExpense / budgetLiving) * 100) : 0;
    const actualLivingForDisplay = actualLivingExpense > 0 ? Math.round(actualLivingExpense / 10000) : budgetLiving;

    return [
      { 
        icon: '🛒', 
        name: '생활비', 
        budget: budgetLiving, 
        actual: actualLivingForDisplay,
        rate: actualLivingExpense > 0 ? livingRate : 68,
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

  // AI 인사이트 메시지 생성
  const getAIInsight = () => {
    const messages = [];
    
    if (daysSinceJoin === 0) {
      messages.push(`환영합니다! 오늘부터 재무 여정을 시작하셨네요. 🎉`);
    } else if (daysSinceJoin < 7) {
      messages.push(`가입 ${daysSinceJoin}일차! 좋은 시작이에요. 꾸준히 기록해보세요. 💪`);
    } else {
      messages.push(`${daysSinceJoin}일간 꾸준히 관리하고 계시네요! 👏`);
    }

    if (cumulativeNetSavings > 0) {
      messages.push(`지금까지 총 ${Math.round(cumulativeNetSavings / 10000)}만원을 저축하셨어요!`);
    }

    if (savingsRate >= 30) {
      messages.push(`저축률 ${savingsRate}%는 매우 우수해요! 이 페이스 유지하세요. 🎯`);
    } else if (savingsRate >= 20) {
      messages.push(`저축률 ${savingsRate}%로 양호해요. 조금만 더 노력하면 30% 달성! 💰`);
    } else {
      messages.push(`저축률을 높이면 순자산 증가 속도가 빨라져요. 📈`);
    }

    if (peerStats && savingsRate > peerStats.avgSavingsRate) {
      messages.push(`동년배 평균(${peerStats.avgSavingsRate}%)보다 ${savingsRate - peerStats.avgSavingsRate}%p 높아요!`);
    }

    return messages.join('\n\n');
  };

  // 순저축 그래프 데이터
  const getGraphPoints = () => {
    if (snapshots.length === 0) return [];
    
    const maxValue = Math.max(...snapshots.map(s => s.netSavings), 1);
    return snapshots.map((s, i) => ({
      x: (i / Math.max(snapshots.length - 1, 1)) * 280 + 10,
      y: 70 - (s.netSavings / maxValue) * 60,
      value: s.netSavings,
      day: s.daysSinceJoin,
    }));
  };

  const graphPoints = getGraphPoints();

  // 금액 포맷
  const formatMoney = (amount: number) => {
    if (amount >= 10000) return `${(amount / 10000).toFixed(2)}억`;
    return `${amount}만`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 헤더 */}
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

      {/* 스크롤 영역 */}
      <div className="p-4 space-y-4 pb-8">

        {/* 자산 요약 카드 */}
        <div className="bg-gradient-to-br from-slate-700 to-blue-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm opacity-80">💎 자산 요약</p>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">{getPeriodLabel()}</span>
          </div>
          <div className="text-center mb-5">
            <p className="text-xs opacity-70 mb-1">순자산</p>
            <p className="text-4xl font-extrabold">₩{formatMoney(netAssets)}</p>
            {changes.netAssets !== 0 && (
              <p className={`text-sm mt-2 ${changes.netAssets > 0 ? 'text-green-300' : 'text-red-300'}`}>
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

        {/* 순저축 추이 차트 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-800">📈 순저축 추이</span>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              cumulativeNetSavings > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {cumulativeNetSavings > 0 ? `+${Math.round(cumulativeNetSavings / 10000)}만` : '시작'}
            </span>
          </div>
          
          {snapshots.length > 1 ? (
            <>
              <div className="h-24 bg-gradient-to-b from-green-50 to-transparent rounded-xl relative mb-2">
                <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <path 
                    d={`M${graphPoints.map(p => `${p.x},${p.y}`).join(' L')}`} 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="3"
                  />
                  {graphPoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="#10B981" />
                  ))}
                </svg>
              </div>
              <div className="flex justify-between text-xs text-gray-400 px-2">
                <span>D+0</span>
                <span>D+{daysSinceJoin}</span>
              </div>
            </>
          ) : (
            <div className="h-24 bg-gray-50 rounded-xl flex items-center justify-center">
              <p className="text-gray-400 text-sm">저축 기록이 쌓이면 그래프가 표시됩니다</p>
            </div>
          )}
          
          <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>누적 순저축
            </div>
          </div>
        </div>

        {/* 수입/지출 분석 */}
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
              <p className="font-bold text-red-500">{Math.round(totalExpense / 10000) || totalExpense}만</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-xl block mb-1">🏦</span>
              <p className="text-xs text-gray-400 mb-1">저축</p>
              <p className="font-bold text-green-600">{Math.round(totalSaving / 10000) || totalSaving}만</p>
            </div>
          </div>
        </div>

        {/* 예산 실행율 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-gray-800">📋 예산 실행율</span>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold">D+{daysSinceJoin} 기준</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">예산 대비 실제 지출/저축 현황입니다</p>
          
          <div className="space-y-2">
            {budgetItems.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 bg-gray-50 rounded-xl border-l-4 ${
                  item.status === 'good' ? 'border-green-500' : 
                  item.status === 'bad' ? 'border-red-500' : 'border-amber-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400">예산 ₩{item.budget}만 → 실제 ₩{item.actual}만</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    item.status === 'good' ? 'text-green-600' : 
                    item.status === 'bad' ? 'text-red-500' : 'text-amber-500'
                  }`}>{item.rate}%</p>
                  <p className={`text-xs font-semibold ${
                    item.status === 'good' ? 'text-green-600' : 
                    item.status === 'bad' ? 'text-red-500' : 'text-amber-500'
                  }`}>
                    {item.status === 'good' ? '✓ 절약' : item.status === 'bad' ? '⚠ 부족' : '● 적정'}
                  </p>
                </div>
              </div>
            ))}
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

        {/* 저축률 분석 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-800">🎯 저축률 분석</span>
          </div>
          <div className="text-center mb-4">
            <p className="text-xs text-gray-400 mb-1">현재 저축률</p>
            <p className={`text-4xl font-extrabold ${savingsRate >= 30 ? 'text-green-600' : savingsRate >= 20 ? 'text-amber-500' : 'text-red-500'}`}>
              {savingsRate}%
            </p>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-2 relative">
            <div 
              className={`h-full rounded-full ${savingsRate >= 30 ? 'bg-green-500' : savingsRate >= 20 ? 'bg-amber-500' : 'bg-red-500'}`} 
              style={{ width: `${Math.min((savingsRate / 30) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-4">
            <span>0%</span>
            <span>목표 30%</span>
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

        {/* 동년배 비교 */}
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
              <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                savingsRate > (peerStats?.avgSavingsRate || 18) ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
              }`}>
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
              <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                wealthIndex > (peerStats?.avgWealthIndex || 142) ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
              }`}>
                상위 {myRanks.wealthIndex}%
              </div>
            </div>
          </div>
        </div>

        {/* AI 인사이트 */}
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
            <button className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-xl text-sm">
              절약 팁 보기
            </button>
            <button className="flex-1 py-2.5 bg-white text-purple-600 font-semibold rounded-xl text-sm border border-purple-300">
              목표 수정
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DetailReportPage;
