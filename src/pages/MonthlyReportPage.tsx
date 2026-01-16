// MonthlyReportPage.tsx
// 월간 리포트 페이지 - 실제 데이터 연동 + PDF 다운로드 + 이메일 공유
// 데이터 흐름: AI지출탭 → 지출타임라인 → 홈대시보드 → 월간리포트

import { useState, useRef } from 'react';
import type { AdjustedBudget } from './BudgetAdjustPage';
import { useSpend } from '../context/SpendContext';

interface MonthlyReportPageProps {
  onBack: () => void;
  adjustedBudget?: AdjustedBudget | null;
}

// 공유 채널 타입
interface ShareChannel {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export default function MonthlyReportPage({ onBack, adjustedBudget }: MonthlyReportPageProps) {
  const { spendItems } = useSpend();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showShareModal, setShowShareModal] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // 월 이동
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    const now = new Date();
    if (currentMonth.getMonth() < now.getMonth() || currentMonth.getFullYear() < now.getFullYear()) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    }
  };

  // 월 표시
  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  // 현재 월 데이터 필터링
  const currentMonthItems = spendItems.filter(item => {
    const itemDate = new Date(item.timestamp);
    return (
      itemDate.getMonth() === currentMonth.getMonth() &&
      itemDate.getFullYear() === currentMonth.getFullYear()
    );
  });

  // 지난 달 데이터 필터링
  const lastMonth = currentMonth.getMonth() === 0 ? 11 : currentMonth.getMonth() - 1;
  const lastMonthYear = currentMonth.getMonth() === 0 ? currentMonth.getFullYear() - 1 : currentMonth.getFullYear();
  const lastMonthItems = spendItems.filter(item => {
    const itemDate = new Date(item.timestamp);
    return (
      itemDate.getMonth() === lastMonth &&
      itemDate.getFullYear() === lastMonthYear
    );
  });

  // 실제 지출 계산 (현재 월)
  const actualSpentItems = currentMonthItems.filter(item => item.type === 'spent');
  const actualSpentTotal = actualSpentItems.reduce((sum, item) => sum + item.amount, 0);

  // 실제 저축 계산 (현재 월)
  const actualSavedItems = currentMonthItems.filter(
    item => item.type === 'saved' || item.category === '저축투자' || item.category === '노후연금'
  );
  const actualSavedTotal = actualSavedItems.reduce((sum, item) => sum + item.amount, 0);

  // 지난 달 지출 계산
  const lastMonthSpentTotal = lastMonthItems
    .filter(item => item.type === 'spent')
    .reduce((sum, item) => sum + item.amount, 0);

  // AdjustedBudget에서 예산 데이터 가져오기
  const totalIncome = adjustedBudget?.totalIncome || 500;
  const budgetLivingExpense = adjustedBudget?.livingExpense || 250;
  const budgetSavings = adjustedBudget?.savings || 100;
  const budgetPension = adjustedBudget?.pension || 50;
  const budgetInsurance = adjustedBudget?.insurance || 35;
  const budgetLoanPayment = adjustedBudget?.loanPayment || 50;
  const surplus = adjustedBudget?.surplus || 15;

  // 실제 vs 예산 데이터 (만원 단위 변환)
  const toManwon = (value: number): number => {
    if (value >= 10000) {
      return Math.round(value / 10000);
    }
    return value;
  };

  const displaySpent = actualSpentTotal > 0 ? toManwon(actualSpentTotal) : budgetLivingExpense + budgetInsurance + budgetLoanPayment;
  const displaySaved = actualSavedTotal > 0 ? toManwon(actualSavedTotal) : budgetSavings + budgetPension;
  const displayLastMonthSpent = lastMonthSpentTotal > 0 ? toManwon(lastMonthSpentTotal) : 0;

  // 예산 대비 차이
  const budgetTotal = budgetLivingExpense + budgetInsurance + budgetLoanPayment;
  const budgetDiff = displaySpent - budgetTotal;
  
  // 지난달 대비 차이
  const lastMonthDiff = displayLastMonthSpent > 0 ? displaySpent - displayLastMonthSpent : 0;

  // 예산 달성률
  const budgetRate = budgetTotal > 0 ? Math.round((displaySpent / budgetTotal) * 100) : 0;

  // 카테고리별 지출 계산 (실제 데이터)
  const categoryMap: Record<string, { amount: number; count: number }> = {};
  actualSpentItems.forEach(item => {
    const cat = item.category || '기타';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { amount: 0, count: 0 };
    }
    categoryMap[cat].amount += item.amount;
    categoryMap[cat].count += 1;
  });

  // 카테고리 설정
  const categoryConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
    '식비': { icon: '🍽️', color: '#EF4444', bgColor: '#FEE2E2' },
    '교통': { icon: '🚗', color: '#F59E0B', bgColor: '#FEF3C7' },
    '교통비': { icon: '🚗', color: '#F59E0B', bgColor: '#FEF3C7' },
    '쇼핑': { icon: '🛍️', color: '#3B82F6', bgColor: '#DBEAFE' },
    '문화/여가': { icon: '🎮', color: '#10B981', bgColor: '#D1FAE5' },
    '문화여가': { icon: '🎮', color: '#10B981', bgColor: '#D1FAE5' },
    '건강': { icon: '💊', color: '#8B5CF6', bgColor: '#EDE9FE' },
    '건강의료': { icon: '💊', color: '#8B5CF6', bgColor: '#EDE9FE' },
    '기타': { icon: '📦', color: '#EC4899', bgColor: '#FCE7F3' },
    '생활비': { icon: '🏠', color: '#14B8A6', bgColor: '#CCFBF1' },
  };

  // 카테고리별 데이터 생성
  const categories = Object.entries(categoryMap)
    .map(([name, data]) => {
      const config = categoryConfig[name] || categoryConfig['기타'];
      const amountInManwon = toManwon(data.amount);
      const percent = displaySpent > 0 ? Math.round((amountInManwon / displaySpent) * 100) : 0;
      return {
        id: name,
        name,
        icon: config.icon,
        color: config.color,
        bgColor: config.bgColor,
        amount: amountInManwon,
        percent,
        count: data.count,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // 데이터가 없을 경우 샘플 카테고리
  const displayCategories = categories.length > 0 ? categories : [
    { id: 'food', name: '식비', icon: '🍽️', color: '#EF4444', bgColor: '#FEE2E2', amount: Math.round(budgetLivingExpense * 0.35), percent: 35, count: 0 },
    { id: 'transport', name: '교통', icon: '🚗', color: '#F59E0B', bgColor: '#FEF3C7', amount: Math.round(budgetLivingExpense * 0.15), percent: 15, count: 0 },
    { id: 'shopping', name: '쇼핑', icon: '🛍️', color: '#3B82F6', bgColor: '#DBEAFE', amount: Math.round(budgetLivingExpense * 0.20), percent: 20, count: 0 },
    { id: 'culture', name: '문화/여가', icon: '🎮', color: '#10B981', bgColor: '#D1FAE5', amount: Math.round(budgetLivingExpense * 0.15), percent: 15, count: 0 },
    { id: 'health', name: '건강', icon: '💊', color: '#8B5CF6', bgColor: '#EDE9FE', amount: Math.round(budgetLivingExpense * 0.08), percent: 8, count: 0 },
    { id: 'etc', name: '기타', icon: '📦', color: '#EC4899', bgColor: '#FCE7F3', amount: Math.round(budgetLivingExpense * 0.07), percent: 7, count: 0 },
  ];

  // AI 코멘트 생성 (DetailReportPage의 getAIInsight 로직 활용)
  const getAIComment = (): string => {
    const messages: string[] = [];

    // 지출 데이터가 있는 경우
    if (actualSpentItems.length > 0) {
      const topCategory = displayCategories[0];
      if (topCategory) {
        messages.push(`이번 달 ${topCategory.name} 비중이 ${topCategory.percent}%로 가장 높았어요.`);
      }

      // 예산 대비 분석
      if (budgetDiff > 0) {
        messages.push(`예산 대비 ${budgetDiff}만원 초과했어요. 다음 달에는 ${displayCategories[0]?.name || '지출'}을 줄여보는 건 어떨까요?`);
      } else if (budgetDiff < 0) {
        messages.push(`예산 대비 ${Math.abs(budgetDiff)}만원 절약했어요! 훌륭해요! 🎉`);
      } else {
        messages.push('예산을 정확히 지켰어요! 대단해요! 👏');
      }

      // 지난달 대비 분석
      if (lastMonthDiff !== 0 && displayLastMonthSpent > 0) {
        if (lastMonthDiff > 0) {
          messages.push(`지난달보다 ${lastMonthDiff}만원 더 썼어요. 소비 습관을 점검해보세요.`);
        } else {
          messages.push(`지난달보다 ${Math.abs(lastMonthDiff)}만원 절약했어요! 잘하고 있어요! 💪`);
        }
      }
    } else {
      // 데이터가 없는 경우
      messages.push('아직 이번 달 지출 기록이 없어요.');
      messages.push('AI지출탭에서 지출을 기록하면 상세한 분석을 받을 수 있어요! 📝');
    }

    return messages.join(' ');
  };

  // 금액 포맷 (만원 단위)
  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + '만원';
  };

  // PDF 다운로드 (html2canvas + jsPDF 방식)
  const handleDownloadPdf = async () => {
    setIsPdfLoading(true);
    
    try {
      // 동적 import로 라이브러리 로드
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;

      if (!reportRef.current) {
        alert('리포트를 찾을 수 없습니다.');
        return;
      }

      // 캔버스 생성
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f9fafb',
      });

      // PDF 생성
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // 파일명 생성
      const fileName = `AI머니야_월간리포트_${currentMonth.getFullYear()}년${currentMonth.getMonth() + 1}월.pdf`;
      pdf.save(fileName);

      alert('PDF 다운로드가 완료되었습니다!');
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  // 공유 채널 목록
  const shareChannels: ShareChannel[] = [
    { id: 'email', name: '이메일', icon: '📧', enabled: true },
    { id: 'kakao', name: '카카오톡', icon: '💬', enabled: false },
    { id: 'sms', name: '문자', icon: '📱', enabled: false },
    { id: 'link', name: '링크 복사', icon: '🔗', enabled: false },
  ];

  // 공유하기 (이메일만 활성화)
  const handleShare = (channelId: string) => {
    if (channelId === 'email') {
      const subject = encodeURIComponent(`[AI머니야] ${formatMonth(currentMonth)} 월간 리포트`);
      const body = encodeURIComponent(
        `AI머니야 월간 리포트\n\n` +
        `📅 ${formatMonth(currentMonth)}\n\n` +
        `💰 총 수입: ${formatAmount(totalIncome)}\n` +
        `💸 총 지출: ${formatAmount(displaySpent)}\n` +
        `💵 총 저축: ${formatAmount(displaySaved)}\n` +
        `🎯 잉여자금: ${formatAmount(surplus)}\n\n` +
        `📊 카테고리별 지출:\n` +
        displayCategories.map(cat => `- ${cat.name}: ${formatAmount(cat.amount)} (${cat.percent}%)`).join('\n') +
        `\n\n🤖 AI 코멘트:\n${getAIComment()}\n\n` +
        `---\n` +
        `AI머니야 - 당신의 AI 지출 코치\n` +
        `https://moneya-frontend.vercel.app`
      );
      
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      setShowShareModal(false);
    } else {
      alert(`${shareChannels.find(c => c.id === channelId)?.name} 공유 기능은 준비 중입니다.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">월간 리포트</h1>
        </div>
        
        {/* 월 선택 */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button onClick={prevMonth} className="p-2 hover:bg-white/20 rounded-full transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-semibold min-w-[120px] text-center">{formatMonth(currentMonth)}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-white/20 rounded-full transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 리포트 내용 (PDF 캡처 영역) */}
      <div ref={reportRef} className="px-5 -mt-4 space-y-4">
        {/* 총 지출 카드 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">이번 달 총 지출</p>
          <p className="text-3xl font-bold text-gray-900">{formatAmount(displaySpent)}</p>
          
          <div className="flex gap-4 mt-3 text-sm">
            <div className={`flex items-center gap-1 ${budgetDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
              <span>{budgetDiff > 0 ? '▲' : budgetDiff < 0 ? '▼' : '•'}</span>
              <span>예산 대비 {budgetDiff === 0 ? '동일' : `${Math.abs(budgetDiff)}만원 ${budgetDiff > 0 ? '초과' : '절약'}`}</span>
            </div>
            {displayLastMonthSpent > 0 && (
              <div className={`flex items-center gap-1 ${lastMonthDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                <span>{lastMonthDiff > 0 ? '▲' : '▼'}</span>
                <span>지난달 대비 {Math.abs(lastMonthDiff)}만원</span>
              </div>
            )}
          </div>
        </div>

        {/* 예산 현황 카드 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold text-gray-900">예산 현황</p>
            <p className={`font-bold ${budgetRate <= 100 ? 'text-teal-600' : 'text-red-500'}`}>{budgetRate}% 사용</p>
          </div>
          
          {/* 프로그레스 바 */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${budgetRate <= 100 ? 'bg-gradient-to-r from-teal-400 to-teal-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
              style={{ width: `${Math.min(budgetRate, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>0</span>
            <span>예산 {formatAmount(budgetTotal)}</span>
          </div>
        </div>

        {/* 수입/지출/저축 요약 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="font-semibold text-gray-900 mb-4">이번 달 요약</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">수입</p>
              <p className="text-lg font-bold text-blue-600">{formatAmount(totalIncome)}</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-xs text-gray-500 mb-1">지출</p>
              <p className="text-lg font-bold text-red-500">{formatAmount(displaySpent)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">저축</p>
              <p className="text-lg font-bold text-green-600">{formatAmount(displaySaved)}</p>
            </div>
          </div>
        </div>

        {/* 잉여자금 카드 */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-amber-700 font-medium">💰 이번 달 잉여자금</p>
              <p className="text-2xl font-bold text-amber-800 mt-1">{formatAmount(surplus)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-amber-600">추가 저축 가능 금액</p>
            </div>
          </div>
        </div>

        {/* 카테고리별 지출 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="font-semibold text-gray-900 mb-4">카테고리별 지출</p>
          
          {actualSpentItems.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">아직 지출 기록이 없습니다</p>
          )}
          
          <div className="space-y-3">
            {displayCategories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: cat.bgColor }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatAmount(cat.amount)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{cat.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI 코멘트 */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🤖</span>
            <span className="font-semibold text-purple-700">AI 머니야 코멘트</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            {getAIComment()}
          </p>
        </div>
      </div>

      {/* 액션 버튼 (PDF 캡처 영역 외부) */}
      <div className="px-5 mt-4">
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isPdfLoading}
            className="flex-1 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPdfLoading ? (
              <>
                <span className="animate-spin">⏳</span> 생성 중...
              </>
            ) : (
              <>📄 PDF 다운로드</>
            )}
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex-1 py-3.5 bg-teal-500 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
          >
            📤 공유하기
          </button>
        </div>
      </div>

      {/* 공유 모달 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">공유하기</h3>
              <button onClick={() => setShowShareModal(false)} className="p-2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {shareChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleShare(channel.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition ${
                    channel.enabled 
                      ? 'hover:bg-gray-100 active:bg-gray-200' 
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                  disabled={!channel.enabled}
                >
                  <span className="text-3xl">{channel.icon}</span>
                  <span className="text-xs text-gray-600">{channel.name}</span>
                  {!channel.enabled && (
                    <span className="text-[10px] text-gray-400">준비중</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
