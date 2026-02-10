// src/pages/DetailReportPage.tsx
// 상세 리포트 페이지
// v2.1 긴급 복구: 기존 props 구조 유지 + AI인사이트 OpenAI 연동
// ★★★ 기존 인터페이스: { adjustedBudget, onBack } 그대로 유지 ★★★

import { useState, useEffect } from 'react';
import type { AdjustedBudget } from './BudgetAdjustPage';
import { useSpend } from '../context/SpendContext';
import { getAIInsightAdvice, getGoalAdvice } from '../services/aiService';

interface DetailReportPageProps {
  adjustedBudget: AdjustedBudget | null;
  onBack: () => void;
}

function DetailReportPage({ adjustedBudget, onBack }: DetailReportPageProps) {
  const { spendItems } = useSpend();
  const [periodTab, setPeriodTab] = useState<'1m' | '3m' | '6m' | '1y'>('3m');

  // ★★★ AI 인사이트 상태 ★★★
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipContent, setTipContent] = useState('');
  const [isLoadingTip, setIsLoadingTip] = useState(false);

  // ★★★ 목표 수정 상태 ★★★
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalSavingsRate, setGoalSavingsRate] = useState(30);
  const [goalAdvice, setGoalAdvice] = useState('');
  const [isLoadingGoal, setIsLoadingGoal] = useState(false);

  const totalIncome = adjustedBudget?.totalIncome || 500;
  const totalExpense = adjustedBudget ? (adjustedBudget.livingExpense + adjustedBudget.loanPayment + adjustedBudget.insurance + adjustedBudget.pension) : 400;
  const totalSaving = adjustedBudget?.savings || 100;
  const savingsRate = totalIncome > 0 ? Math.round((totalSaving / totalIncome) * 100) : 0;

  // ★★★ 실제 지출/저축 데이터 ★★★
  const actualSpentTotal = spendItems
    .filter(item => item.type === 'spent')
    .reduce((sum, item) => sum + item.amount, 0);
  const actualSavedTotal = spendItems
    .filter(item => item.type === 'saved' || item.category === '저축투자' || item.category === '노후연금')
    .reduce((sum, item) => sum + item.amount, 0);
  const toManwon = (v: number) => (v >= 10000 ? Math.round(v / 10000) : v);
  const displayExpense = actualSpentTotal > 0 ? toManwon(actualSpentTotal) : totalExpense;
  const displaySaving = actualSavedTotal > 0 ? toManwon(actualSavedTotal) : totalSaving;

  // ★★★ 페이지 로드 시 AI 인사이트 자동 조회 ★★★
  useEffect(() => {
    loadAIInsight();
  }, []);

  const getFinancialContext = () => ({
    name: '고객',
    age: 44,
    income: totalIncome,
    savingsRate,
    wealthIndex: 95,
    netAssets: 12400,
    totalDebt: 15600,
    totalExpense: displayExpense,
    totalSaving: displaySaving,
    daysSinceJoin: 30,
    cumulativeNetSavings: displaySaving * 10000,
  });

  const loadAIInsight = async () => {
    setIsLoadingAI(true);
    try {
      const result = await getAIInsightAdvice(getFinancialContext());
      setAiInsight(result);
    } catch (e) {
      setAiInsight('인사이트를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleGetTip = async () => {
    setShowTipModal(true);
    setIsLoadingTip(true);
    try {
      const result = await getAIInsightAdvice(getFinancialContext());
      setTipContent(result);
    } catch (e) {
      setTipContent('절약 팁을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingTip(false);
    }
  };

  const handleGoalAdvice = async () => {
    setIsLoadingGoal(true);
    try {
      const result = await getGoalAdvice(getFinancialContext(), goalSavingsRate);
      setGoalAdvice(result);
    } catch (e) {
      setGoalAdvice('조언을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingGoal(false);
    }
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
      </div>

      {/* 기간 선택 */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-400">조회 기간</p>
          <p className="font-bold text-gray-800 flex items-center gap-1">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
            </svg>
            최근 {periodTab === '1m' ? '1개월' : periodTab === '3m' ? '3개월' : periodTab === '6m' ? '6개월' : '1년'}
          </p>
        </div>
        <div className="flex gap-1">
          {[
            { id: '1m', label: '1개월' },
            { id: '3m', label: '3개월' },
            { id: '6m', label: '6개월' },
            { id: '1y', label: '1년' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriodTab(tab.id as '1m' | '3m' | '6m' | '1y')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold ${
                periodTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="p-4 space-y-4 pb-8">

        {/* 자산 요약 카드 */}
        <div className="bg-gradient-to-br from-slate-700 to-blue-600 rounded-2xl p-5 text-white">
          <p className="text-sm opacity-80 mb-4">💎 자산 요약</p>
          <div className="text-center mb-5">
            <p className="text-xs opacity-70 mb-1">순자산</p>
            <p className="text-4xl font-extrabold">₩1.24억</p>
            <p className="text-sm text-green-300 mt-2">▲ +₩820만 (+12.5%) 3개월 전 대비</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xs opacity-70 mb-1">총 자산</p>
              <p className="text-xl font-bold">₩2.8억</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xs opacity-70 mb-1">총 부채</p>
              <p className="text-xl font-bold text-red-300">₩1.56억</p>
            </div>
          </div>
        </div>

        {/* 순자산 추이 차트 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-800">📈 순자산 추이</span>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold">▲ 12.5%</span>
          </div>
          <div className="h-24 bg-gradient-to-b from-green-50 to-transparent rounded-xl relative mb-2">
            <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
              <path d="M0,70 Q50,65 75,58 T150,45 T225,30 T300,15" fill="none" stroke="#10B981" strokeWidth="3"/>
              <path d="M0,75 Q50,72 75,68 T150,60 T225,55 T300,50" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5,5"/>
            </svg>
          </div>
          <div className="flex justify-between text-xs text-gray-400 px-2">
            <span>10월</span><span>11월</span><span>12월</span><span>1월</span>
          </div>
          <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>순자산
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>목표
            </div>
          </div>
        </div>

        {/* 수입/지출 분석 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-800">💰 이번 달 수입/지출</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-xl block mb-1">💵</span>
              <p className="text-xs text-gray-400 mb-1">수입</p>
              <p className="font-bold text-blue-600">{totalIncome}만</p>
              <p className="text-xs text-gray-400 mt-1">전월 동일</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-xl block mb-1">💳</span>
              <p className="text-xs text-gray-400 mb-1">지출</p>
              <p className="font-bold text-red-500">{displayExpense}만</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-xl block mb-1">🏦</span>
              <p className="text-xs text-gray-400 mb-1">저축</p>
              <p className="font-bold text-green-600">{displaySaving}만</p>
            </div>
          </div>
        </div>

        {/* 예산 실행율 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-gray-800">📋 예산 실행율</span>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold">조회기간 기준</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">예산 대비 실제 지출/저축 현황입니다</p>
          
          <div className="space-y-2">
            {[
              { icon: '🛒', name: '생활비', budget: adjustedBudget?.livingExpense || 500, actual: actualSpentTotal > 0 ? toManwon(actualSpentTotal) : (adjustedBudget?.livingExpense || 340), status: 'good' as const },
              { icon: '💰', name: '저축/투자', budget: adjustedBudget?.savings || 100, actual: actualSavedTotal > 0 ? toManwon(actualSavedTotal) : (adjustedBudget?.savings || 126), status: 'good' as const },
              { icon: '🏦', name: '노후연금', budget: adjustedBudget?.pension || 50, actual: adjustedBudget?.pension || 30, status: 'bad' as const },
              { icon: '🛡️', name: '보장성보험', budget: adjustedBudget?.insurance || 30, actual: adjustedBudget?.insurance || 30, status: 'normal' as const },
              { icon: '💳', name: '대출원리금', budget: adjustedBudget?.loanPayment || 80, actual: adjustedBudget?.loanPayment || 80, status: 'normal' as const },
            ].map((item, index) => {
              const rate = item.budget > 0 ? Math.round((item.actual / item.budget) * 100) : 0;
              return (
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
                    }`}>{rate}%</p>
                    <p className={`text-xs font-semibold ${
                      item.status === 'good' ? 'text-green-600' : 
                      item.status === 'bad' ? 'text-red-500' : 'text-amber-500'
                    }`}>
                      {item.status === 'good' ? '✓ 절약' : item.status === 'bad' ? '⚠ 부족' : '● 적정'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">잘한 항목</p>
              <p className="text-xl font-bold text-green-600">2개</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">적정 항목</p>
              <p className="text-xl font-bold text-amber-500">2개</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">주의 항목</p>
              <p className="text-xl font-bold text-red-500">1개</p>
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
            <p className="text-4xl font-extrabold text-green-600">{savingsRate}%</p>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-2 relative">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: `${Math.min(savingsRate / 30 * 100, 100)}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-4">
            <span>0%</span>
            <span>목표 30%</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">3개월 전</p>
              <p className="font-bold text-gray-800">8%</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">동년배 평균</p>
              <p className="font-bold text-gray-800">18%</p>
            </div>
          </div>
        </div>

        {/* 전월 대비 변화 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-800">📅 전월 대비 변화</span>
          </div>
          <div className="space-y-3">
            {[
              { label: '순자산', prev: '₩1.19억', current: '₩1.24억', change: '+₩500만', up: true },
              { label: '저축률', prev: '20%', current: `${savingsRate}%`, change: `+${savingsRate - 20}%p`, up: true },
              { label: '월 저축액', prev: '₩104만', current: `₩${displaySaving}만`, change: `+₩${displaySaving - 104}만`, up: displaySaving >= 104 },
              { label: '월 지출', prev: '₩382만', current: `₩${displayExpense}만`, change: `${displayExpense >= 382 ? '+' : ''}₩${displayExpense - 382}만`, up: displayExpense > 382 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 line-through text-sm">{item.prev}</span>
                  <span className="font-bold text-gray-800">{item.current}</span>
                  <span className={`text-xs px-2 py-1 rounded-md font-semibold ${
                    (item.label === '월 지출' ? !item.up : item.up) ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                  }`}>{item.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 빅데이터 비교 분석 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-gray-800">📊 나의 위치 분석</span>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold">비식별 통계</span>
          </div>
          <p className="text-xs text-gray-400 text-center mb-4">익명화된 회원 데이터 기반 비교 분석</p>
          
          <div className="space-y-2 mb-4">
            {[
              { icon: '💰', label: '소득 대비', sub: `연 ${totalIncome * 12 / 100}천만원 구간`, rank: '12%', level: 'top' },
              { icon: '🎂', label: '나이 대비', sub: '40대 회원 중', rank: '15%', level: 'top' },
              { icon: '🏠', label: '가구형태 대비', sub: '맞벌이 가구 중', rank: '8%', level: 'excellent' },
              { icon: '📅', label: '시작월 대비', sub: '가입자 중', rank: '5%', level: 'excellent' },
              { icon: '🎯', label: '관심사 대비', sub: '저축 목표 회원 중', rank: '7%', level: 'excellent' },
              { icon: '📍', label: '지역 대비', sub: '서울 거주자 중', rank: '23%', level: 'normal' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                  item.level === 'excellent' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700' :
                  item.level === 'top' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  상위 <span className="text-lg">{item.rank}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 종합 평가 */}
          <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl p-4 mb-4">
            <p className="text-center font-bold text-amber-800 mb-3">🏆 종합 평가</p>
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-xl px-4 py-2 text-center">
                <p className="text-xs text-gray-400">전체 회원 중</p>
                <p className="text-xl font-extrabold text-green-600">상위 11%</p>
              </div>
              <p className="flex-1 text-sm text-amber-800 leading-relaxed">
                고객님은 <strong>상위 11%</strong>의 재무 관리 실력을 보여주고 계세요!
              </p>
            </div>
          </div>
        </div>

        {/* ★★★ AI 인사이트 - OpenAI 실시간 연동 ★★★ */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
              </svg>
            </div>
            <span className="font-bold text-purple-700">💡 AI 머니야 인사이트</span>
          </div>
          <div className="text-gray-700 leading-relaxed text-sm mb-4 whitespace-pre-line min-h-[60px]">
            {isLoadingAI ? (
              <div className="flex items-center gap-2 text-purple-500">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <span className="ml-1 text-sm">AI가 분석 중...</span>
              </div>
            ) : (
              aiInsight || '인사이트를 불러오려면 아래 버튼을 눌러주세요.'
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleGetTip}
              disabled={isLoadingTip}
              className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50"
            >
              {isLoadingTip ? '⏳ 불러오는 중...' : '절약 팁 보기'}
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

      {/* ★★★ 절약 팁 모달 ★★★ */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTipModal(false)}>
          <div className="bg-white rounded-2xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-purple-700">💡 AI 절약 팁</h3>
              <button onClick={() => setShowTipModal(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">✕</button>
            </div>
            <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line min-h-[80px]">
              {isLoadingTip ? (
                <div className="flex items-center gap-2 text-purple-500 py-4">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <span className="ml-1">AI가 맞춤 절약 팁을 분석 중...</span>
                </div>
              ) : tipContent}
            </div>
            <button 
              onClick={() => setShowTipModal(false)}
              className="w-full mt-4 py-2.5 bg-purple-600 text-white font-semibold rounded-xl text-sm"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* ★★★ 목표 수정 모달 ★★★ */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowGoalModal(false)}>
          <div className="bg-white rounded-2xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-purple-700">🎯 목표 수정</h3>
              <button onClick={() => setShowGoalModal(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">✕</button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">현재 저축률: <span className="font-bold text-green-600">{savingsRate}%</span></p>
              <p className="text-sm text-gray-600 mb-3">새 목표 저축률:</p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={goalSavingsRate}
                  onChange={(e) => setGoalSavingsRate(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-purple-700 w-16 text-right">{goalSavingsRate}%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">월 저축 목표: {Math.round(totalIncome * goalSavingsRate / 100)}만원</p>
            </div>

            <button
              onClick={handleGoalAdvice}
              disabled={isLoadingGoal}
              className="w-full py-2.5 bg-purple-100 text-purple-700 font-semibold rounded-xl text-sm mb-3 disabled:opacity-50"
            >
              {isLoadingGoal ? '⏳ AI 분석 중...' : '🤖 AI 조언 받기'}
            </button>

            {goalAdvice && (
              <div className="bg-purple-50 rounded-xl p-3 mb-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {goalAdvice}
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={() => setShowGoalModal(false)}
                className="flex-1 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm"
              >
                취소
              </button>
              <button 
                onClick={() => {
                  alert(`저축률 목표가 ${goalSavingsRate}%로 변경되었습니다!`);
                  setShowGoalModal(false);
                }}
                className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-xl text-sm"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailReportPage;
