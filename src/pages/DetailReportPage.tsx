import { useState } from 'react';
import type { AdjustedBudget } from './BudgetAdjustPage';

interface DetailReportPageProps {
  adjustedBudget: AdjustedBudget | null;
  onBack: () => void;
}

function DetailReportPage({ adjustedBudget, onBack }: DetailReportPageProps) {
  const [periodTab, setPeriodTab] = useState<'1m' | '3m' | '6m' | '1y'>('3m');

  const totalIncome = adjustedBudget?.totalIncome || 500;
  const totalExpense = adjustedBudget ? (adjustedBudget.livingExpense + adjustedBudget.loanPayment + adjustedBudget.insurance + adjustedBudget.pension) : 400;
  const totalSaving = adjustedBudget?.savings || 100;

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
        <button className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-sm font-semibold">
          📤 내보내기
        </button>
      </div>

      {/* 기간 선택 */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-400">조회 기간</p>
          <p className="font-bold text-gray-800 flex items-center gap-1">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
            </svg>
            2024.10.01 ~ 2025.01.07
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
              <p className="font-bold text-red-500">{totalExpense}만</p>
              <p className="text-xs text-red-400 mt-1">▲ +12만</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-xl block mb-1">🏦</span>
              <p className="text-xs text-gray-400 mb-1">저축</p>
              <p className="font-bold text-green-600">{totalSaving}만</p>
              <p className="text-xs text-green-500 mt-1">▲ +82만</p>
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
              { icon: '🛒', name: '생활비', budget: 500, actual: 340, status: 'good' },
              { icon: '💰', name: '저축/투자', budget: 100, actual: 126, status: 'good' },
              { icon: '🏦', name: '노후연금', budget: 50, actual: 30, status: 'bad' },
              { icon: '🛡️', name: '보장성보험', budget: 30, actual: 30, status: 'normal' },
              { icon: '💳', name: '대출원리금', budget: 80, actual: 80, status: 'normal' },
            ].map((item, index) => {
              const rate = Math.round((item.actual / item.budget) * 100);
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
            <p className="text-4xl font-extrabold text-green-600">24%</p>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-2 relative">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: '80%' }}></div>
            <div className="absolute top-0 bottom-0 w-0.5 bg-gray-800" style={{ left: '100%' }}></div>
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
              { label: '저축률', prev: '20%', current: '24%', change: '+4%p', up: true },
              { label: '월 저축액', prev: '₩104만', current: '₩126만', change: '+₩22만', up: true },
              { label: '월 지출', prev: '₩382만', current: '₩394만', change: '+₩12만', up: false },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 line-through text-sm">{item.prev}</span>
                  <span className="font-bold text-gray-800">{item.current}</span>
                  <span className={`text-xs px-2 py-1 rounded-md font-semibold ${
                    item.up ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
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
              { icon: '💰', label: '소득 대비', sub: '연 6,000만원 구간', rank: '12%', level: 'top' },
              { icon: '🎂', label: '나이 대비', sub: '30대 회원 중', rank: '15%', level: 'top' },
              { icon: '🏠', label: '가구형태 대비', sub: '맞벌이 가구 중', rank: '8%', level: 'excellent' },
              { icon: '📅', label: '시작월 대비', sub: '10월 가입자 중', rank: '5%', level: 'excellent' },
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
                대표님은 <strong>상위 11%</strong>의 재무 관리 실력을 보여주고 계세요!
              </p>
            </div>
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
            </svg>
            🏆 상위 11% 달성! 친구에게 공유하기
          </button>
        </div>

        {/* AI 인사이트 */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
              </svg>
            </div>
            <span className="font-bold text-purple-700">💡 AI 머니야 인사이트</span>
          </div>
          <p className="text-gray-700 leading-relaxed text-sm mb-4">
            대표님, 3개월간 <strong className="text-purple-700">저축률이 3배</strong> 성장했어요! 👏<br/><br/>
            다만, 이번 달 <strong className="text-purple-700">식비가 전월 대비 15% 증가</strong>했어요. 외식 빈도를 주 2회로 줄이면 월 <strong className="text-purple-700">₩30만 추가 저축</strong>이 가능해요.<br/><br/>
            지금 페이스라면 <strong className="text-purple-700">6개월 후 순자산 1.5억</strong> 달성 가능합니다! 🎯
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
