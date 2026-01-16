// MonthlyReportPage.tsx
// 월간 리포트 페이지 - PDF oklch 색상 에러 수정
// html2canvas가 oklch를 지원하지 않아 RGB 색상으로 직접 지정

import { useState, useRef } from 'react';
import type { AdjustedBudget } from './BudgetAdjustPage';
import { useSpend } from '../context/SpendContext';

interface MonthlyReportPageProps {
  onBack: () => void;
  adjustedBudget?: AdjustedBudget | null;
}

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

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    const now = new Date();
    if (currentMonth.getMonth() < now.getMonth() || currentMonth.getFullYear() < now.getFullYear()) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    }
  };

  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  const currentMonthItems = spendItems.filter(item => {
    const itemDate = new Date(item.timestamp);
    return (
      itemDate.getMonth() === currentMonth.getMonth() &&
      itemDate.getFullYear() === currentMonth.getFullYear()
    );
  });

  const lastMonth = currentMonth.getMonth() === 0 ? 11 : currentMonth.getMonth() - 1;
  const lastMonthYear = currentMonth.getMonth() === 0 ? currentMonth.getFullYear() - 1 : currentMonth.getFullYear();
  const lastMonthItems = spendItems.filter(item => {
    const itemDate = new Date(item.timestamp);
    return (
      itemDate.getMonth() === lastMonth &&
      itemDate.getFullYear() === lastMonthYear
    );
  });

  const actualSpentItems = currentMonthItems.filter(item => item.type === 'spent');
  const actualSpentTotal = actualSpentItems.reduce((sum, item) => sum + item.amount, 0);

  const actualSavedItems = currentMonthItems.filter(
    item => item.type === 'saved' || item.category === '저축투자' || item.category === '노후연금'
  );
  const actualSavedTotal = actualSavedItems.reduce((sum, item) => sum + item.amount, 0);

  const lastMonthSpentTotal = lastMonthItems
    .filter(item => item.type === 'spent')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalIncome = adjustedBudget?.totalIncome || 500;
  const budgetLivingExpense = adjustedBudget?.livingExpense || 250;
  const budgetSavings = adjustedBudget?.savings || 100;
  const budgetPension = adjustedBudget?.pension || 50;
  const budgetInsurance = adjustedBudget?.insurance || 35;
  const budgetLoanPayment = adjustedBudget?.loanPayment || 50;
  const surplus = adjustedBudget?.surplus || 15;

  const toManwon = (value: number): number => {
    if (value >= 10000) {
      return Math.round(value / 10000);
    }
    return value;
  };

  const actualSpentInManwon = toManwon(actualSpentTotal);
  const actualSavedInManwon = toManwon(actualSavedTotal);
  const lastMonthSpentInManwon = toManwon(lastMonthSpentTotal);

  const displaySpent = actualSpentTotal > 0 ? actualSpentInManwon : budgetLivingExpense + budgetInsurance + budgetLoanPayment;
  const displaySaved = actualSavedTotal > 0 ? actualSavedInManwon : budgetSavings + budgetPension;

  const budgetTotal = budgetLivingExpense + budgetInsurance + budgetLoanPayment;
  const budgetDiff = displaySpent - budgetTotal;
  const lastMonthDiff = lastMonthSpentInManwon > 0 ? displaySpent - lastMonthSpentInManwon : 0;
  const budgetRate = budgetTotal > 0 ? Math.round((displaySpent / budgetTotal) * 100) : 0;

  const categoryMap: Record<string, { amount: number; count: number }> = {};
  actualSpentItems.forEach(item => {
    const cat = item.category || '기타';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { amount: 0, count: 0 };
    }
    categoryMap[cat].amount += item.amount;
    categoryMap[cat].count += 1;
  });

  const categoryConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
    '식비': { icon: '🍽️', color: '#EF4444', bgColor: '#FEE2E2' },
    'food': { icon: '🍽️', color: '#EF4444', bgColor: '#FEE2E2' },
    '교통': { icon: '🚗', color: '#F59E0B', bgColor: '#FEF3C7' },
    '교통비': { icon: '🚗', color: '#F59E0B', bgColor: '#FEF3C7' },
    '쇼핑': { icon: '🛍️', color: '#3B82F6', bgColor: '#DBEAFE' },
    '문화/여가': { icon: '🎮', color: '#10B981', bgColor: '#D1FAE5' },
    '문화여가': { icon: '🎮', color: '#10B981', bgColor: '#D1FAE5' },
    '건강': { icon: '💊', color: '#8B5CF6', bgColor: '#EDE9FE' },
    '건강의료': { icon: '💊', color: '#8B5CF6', bgColor: '#EDE9FE' },
    '기타': { icon: '📦', color: '#EC4899', bgColor: '#FCE7F3' },
    '생활비': { icon: '🏠', color: '#14B8A6', bgColor: '#CCFBF1' },
    'cafe': { icon: '☕', color: '#D97706', bgColor: '#FEF3C7' },
    'telecom': { icon: '📱', color: '#6366F1', bgColor: '#E0E7FF' },
  };

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

  const displayCategories = categories.length > 0 ? categories : [
    { id: 'food', name: '식비', icon: '🍽️', color: '#EF4444', bgColor: '#FEE2E2', amount: Math.round(budgetLivingExpense * 0.35), percent: 35, count: 0 },
    { id: 'transport', name: '교통', icon: '🚗', color: '#F59E0B', bgColor: '#FEF3C7', amount: Math.round(budgetLivingExpense * 0.15), percent: 15, count: 0 },
    { id: 'shopping', name: '쇼핑', icon: '🛍️', color: '#3B82F6', bgColor: '#DBEAFE', amount: Math.round(budgetLivingExpense * 0.20), percent: 20, count: 0 },
    { id: 'culture', name: '문화/여가', icon: '🎮', color: '#10B981', bgColor: '#D1FAE5', amount: Math.round(budgetLivingExpense * 0.15), percent: 15, count: 0 },
    { id: 'health', name: '건강', icon: '💊', color: '#8B5CF6', bgColor: '#EDE9FE', amount: Math.round(budgetLivingExpense * 0.08), percent: 8, count: 0 },
    { id: 'etc', name: '기타', icon: '📦', color: '#EC4899', bgColor: '#FCE7F3', amount: Math.round(budgetLivingExpense * 0.07), percent: 7, count: 0 },
  ];

  const getAIComment = (): string => {
    const messages: string[] = [];

    if (actualSpentItems.length > 0) {
      const topCategory = displayCategories[0];
      if (topCategory) {
        messages.push(`이번 달 ${topCategory.name} 비중이 ${topCategory.percent}%로 가장 높았어요.`);
      }

      if (budgetDiff > 0) {
        messages.push(`예산 대비 ${budgetDiff}만원 초과했어요. 다음 달에는 지출을 줄여보는 건 어떨까요?`);
      } else if (budgetDiff < 0) {
        messages.push(`예산 대비 ${Math.abs(budgetDiff)}만원 절약했어요! 훌륭해요! 🎉`);
      } else {
        messages.push('예산을 정확히 지켰어요! 대단해요! 👏');
      }

      if (lastMonthDiff !== 0 && lastMonthSpentInManwon > 0) {
        if (lastMonthDiff > 0) {
          messages.push(`지난달보다 ${lastMonthDiff}만원 더 썼어요.`);
        } else {
          messages.push(`지난달보다 ${Math.abs(lastMonthDiff)}만원 절약했어요! 💪`);
        }
      }
    } else {
      messages.push('아직 이번 달 지출 기록이 없어요.');
      messages.push('AI지출탭에서 지출을 기록하면 상세한 분석을 받을 수 있어요! 📝');
    }

    return messages.join(' ');
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + '만원';
  };

  // PDF 다운로드 - oklch 색상 문제 해결
  const handleDownloadPdf = async () => {
    setIsPdfLoading(true);
    
    try {
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      
      const html2canvas = html2canvasModule.default;
      const jsPDF = jsPDFModule.default;

      if (!reportRef.current) {
        alert('리포트를 찾을 수 없습니다.');
        setIsPdfLoading(false);
        return;
      }

      // oklch 색상을 RGB로 변환하기 위해 클론 생성
      const clonedElement = reportRef.current.cloneNode(true) as HTMLElement;
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      clonedElement.style.top = '0';
      document.body.appendChild(clonedElement);

      // 모든 요소의 computed style에서 oklch를 RGB로 변환
      const allElements = clonedElement.querySelectorAll('*');
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const computed = window.getComputedStyle(htmlEl);
        
        // 배경색 변환
        if (computed.backgroundColor && computed.backgroundColor.includes('oklch')) {
          htmlEl.style.backgroundColor = '#f9fafb';
        }
        // 텍스트 색상 변환
        if (computed.color && computed.color.includes('oklch')) {
          htmlEl.style.color = '#1f2937';
        }
        // 테두리 색상 변환
        if (computed.borderColor && computed.borderColor.includes('oklch')) {
          htmlEl.style.borderColor = '#e5e7eb';
        }
      });

      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#f9fafb',
      });

      // 클론 제거
      document.body.removeChild(clonedElement);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      const fileName = `AI머니야_월간리포트_${currentMonth.getFullYear()}년${currentMonth.getMonth() + 1}월.pdf`;
      pdf.save(fileName);

      alert('PDF 다운로드가 완료되었습니다!');
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      handleTextDownload();
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleTextDownload = () => {
    const content = 
      `AI머니야 월간 리포트\n` +
      `========================\n\n` +
      `📅 ${formatMonth(currentMonth)}\n\n` +
      `💰 총 수입: ${formatAmount(totalIncome)}\n` +
      `💸 총 지출: ${formatAmount(displaySpent)}\n` +
      `💵 총 저축: ${formatAmount(displaySaved)}\n` +
      `🎯 잉여자금: ${formatAmount(surplus)}\n\n` +
      `📊 카테고리별 지출:\n` +
      displayCategories.map(cat => `- ${cat.name}: ${formatAmount(cat.amount)} (${cat.percent}%)`).join('\n') +
      `\n\n🤖 AI 코멘트:\n${getAIComment()}\n\n` +
      `---\n` +
      `AI머니야 - 당신의 AI 지출 코치`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI머니야_월간리포트_${currentMonth.getFullYear()}년${currentMonth.getMonth() + 1}월.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('PDF 생성이 실패하여 텍스트 파일로 다운로드되었습니다.');
  };

  const shareChannels: ShareChannel[] = [
    { id: 'email', name: '이메일', icon: '📧', enabled: true },
    { id: 'kakao', name: '카카오톡', icon: '💬', enabled: false },
    { id: 'sms', name: '문자', icon: '📱', enabled: false },
    { id: 'link', name: '링크 복사', icon: '🔗', enabled: false },
  ];

  const getEmailContent = () => {
    return (
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
  };

  const handleShare = async (channelId: string) => {
    if (channelId === 'email') {
      const subject = `[AI머니야] ${formatMonth(currentMonth)} 월간 리포트`;
      const body = getEmailContent();

      if (navigator.share) {
        try {
          await navigator.share({
            title: subject,
            text: body,
          });
          setShowShareModal(false);
          return;
        } catch (err) {
          console.log('Web Share failed, falling back to mailto');
        }
      }

      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const newWindow = window.open(mailtoUrl, '_blank');
      
      if (!newWindow || newWindow.closed) {
        try {
          await navigator.clipboard.writeText(body);
          alert('이메일 앱을 열 수 없습니다.\n리포트 내용이 클립보드에 복사되었습니다.');
        } catch {
          const textArea = document.createElement('textarea');
          textArea.value = body;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('이메일 앱을 열 수 없습니다.\n리포트 내용이 클립보드에 복사되었습니다.');
        }
      }
      
      setShowShareModal(false);
    } else {
      alert(`${shareChannels.find(c => c.id === channelId)?.name} 공유 기능은 준비 중입니다.`);
    }
  };

  // RGB 색상 직접 지정 (oklch 대신)
  const colors = {
    teal500: '#14b8a6',
    teal600: '#0d9488',
    teal400: '#2dd4bf',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray700: '#374151',
    gray900: '#111827',
    white: '#ffffff',
    red500: '#ef4444',
    red400: '#f87171',
    red600: '#dc2626',
    green500: '#22c55e',
    green600: '#16a34a',
    blue600: '#2563eb',
    amber50: '#fffbeb',
    amber200: '#fde68a',
    amber600: '#d97706',
    amber700: '#b45309',
    amber800: '#92400e',
    yellow50: '#fefce8',
    purple50: '#faf5ff',
    purple100: '#f3e8ff',
    purple700: '#7c3aed',
    indigo50: '#eef2ff',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.gray50, paddingBottom: '32px' }}>
      {/* 헤더 */}
      <div style={{ 
        background: `linear-gradient(to right, ${colors.teal500}, ${colors.teal600})`, 
        color: colors.white, 
        padding: '48px 20px 24px 20px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <button onClick={onBack} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg style={{ width: '24px', height: '24px', color: colors.white }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.white, margin: 0 }}>월간 리포트</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
          <button onClick={prevMonth} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%' }}>
            <svg style={{ width: '20px', height: '20px', color: colors.white }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span style={{ fontSize: '18px', fontWeight: '600', minWidth: '120px', textAlign: 'center', color: colors.white }}>{formatMonth(currentMonth)}</span>
          <button onClick={nextMonth} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%' }}>
            <svg style={{ width: '20px', height: '20px', color: colors.white }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 리포트 내용 (PDF 캡처 영역) - 인라인 스타일 사용 */}
      <div ref={reportRef} style={{ padding: '0 20px', marginTop: '-16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 총 지출 카드 */}
        <div style={{ backgroundColor: colors.white, borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: colors.gray500, fontSize: '14px', marginBottom: '4px' }}>이번 달 총 지출</p>
          <p style={{ fontSize: '30px', fontWeight: 'bold', color: colors.gray900, margin: 0 }}>{formatAmount(displaySpent)}</p>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: budgetDiff > 0 ? colors.red500 : colors.green500 }}>
              <span>{budgetDiff > 0 ? '▲' : budgetDiff < 0 ? '▼' : '•'}</span>
              <span>예산 대비 {budgetDiff === 0 ? '동일' : `${Math.abs(budgetDiff)}만원 ${budgetDiff > 0 ? '초과' : '절약'}`}</span>
            </div>
            {lastMonthSpentInManwon > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: lastMonthDiff > 0 ? colors.red500 : colors.green500 }}>
                <span>{lastMonthDiff > 0 ? '▲' : '▼'}</span>
                <span>지난달 대비 {Math.abs(lastMonthDiff)}만원</span>
              </div>
            )}
          </div>
        </div>

        {/* 예산 현황 카드 */}
        <div style={{ backgroundColor: colors.white, borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontWeight: '600', color: colors.gray900, margin: 0 }}>예산 현황</p>
            <p style={{ fontWeight: 'bold', color: budgetRate <= 100 ? colors.teal600 : colors.red500, margin: 0 }}>{budgetRate}% 사용</p>
          </div>
          
          <div style={{ height: '12px', backgroundColor: colors.gray100, borderRadius: '9999px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                borderRadius: '9999px',
                background: budgetRate <= 100 
                  ? `linear-gradient(to right, ${colors.teal400}, ${colors.teal600})` 
                  : `linear-gradient(to right, ${colors.red400}, ${colors.red600})`,
                width: `${Math.min(budgetRate, 100)}%`,
                transition: 'width 0.5s'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '14px', color: colors.gray500 }}>
            <span>0</span>
            <span>예산 {formatAmount(budgetTotal)}</span>
          </div>
        </div>

        {/* 수입/지출/저축 요약 */}
        <div style={{ backgroundColor: colors.white, borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontWeight: '600', color: colors.gray900, marginBottom: '16px' }}>이번 달 요약</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: colors.gray500, marginBottom: '4px' }}>수입</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: colors.blue600, margin: 0 }}>{formatAmount(totalIncome)}</p>
            </div>
            <div style={{ textAlign: 'center', borderLeft: `1px solid ${colors.gray100}`, borderRight: `1px solid ${colors.gray100}` }}>
              <p style={{ fontSize: '12px', color: colors.gray500, marginBottom: '4px' }}>지출</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: colors.red500, margin: 0 }}>{formatAmount(displaySpent)}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: colors.gray500, marginBottom: '4px' }}>저축</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: colors.green600, margin: 0 }}>{formatAmount(displaySaved)}</p>
            </div>
          </div>
        </div>

        {/* 잉여자금 카드 */}
        <div style={{ 
          background: `linear-gradient(to right, ${colors.amber50}, ${colors.yellow50})`, 
          borderRadius: '16px', 
          padding: '20px', 
          border: `1px solid ${colors.amber200}` 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', color: colors.amber700, fontWeight: '500' }}>💰 이번 달 잉여자금</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: colors.amber800, marginTop: '4px' }}>{formatAmount(surplus)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', color: colors.amber600 }}>추가 저축 가능 금액</p>
            </div>
          </div>
        </div>

        {/* 카테고리별 지출 */}
        <div style={{ backgroundColor: colors.white, borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontWeight: '600', color: colors.gray900, marginBottom: '16px' }}>카테고리별 지출</p>
          
          {actualSpentItems.length === 0 && (
            <p style={{ fontSize: '14px', color: colors.gray400, textAlign: 'center', padding: '16px 0' }}>아직 지출 기록이 없습니다</p>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayCategories.map((cat) => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '18px',
                    backgroundColor: cat.bgColor 
                  }}
                >
                  {cat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: colors.gray700 }}>{cat.name}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: colors.gray900 }}>{formatAmount(cat.amount)}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: colors.gray100, borderRadius: '9999px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        borderRadius: '9999px',
                        backgroundColor: cat.color,
                        width: `${cat.percent}%`,
                        transition: 'width 0.5s'
                      }}
                    />
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: colors.gray400, width: '32px', textAlign: 'right' }}>{cat.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI 코멘트 */}
        <div style={{ 
          background: `linear-gradient(to right, ${colors.purple50}, ${colors.indigo50})`, 
          borderRadius: '16px', 
          padding: '20px', 
          border: `1px solid ${colors.purple100}` 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px' }}>🤖</span>
            <span style={{ fontWeight: '600', color: colors.purple700 }}>AI 머니야 코멘트</span>
          </div>
          <p style={{ color: colors.gray700, fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
            {getAIComment()}
          </p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div style={{ padding: '0 20px', marginTop: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleDownloadPdf}
            disabled={isPdfLoading}
            style={{ 
              flex: 1, 
              padding: '14px', 
              backgroundColor: colors.white, 
              border: `1px solid ${colors.gray200}`, 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: 'bold', 
              color: colors.gray700, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              cursor: isPdfLoading ? 'not-allowed' : 'pointer',
              opacity: isPdfLoading ? 0.5 : 1
            }}
          >
            {isPdfLoading ? (
              <>⏳ 생성 중...</>
            ) : (
              <>📄 PDF 다운로드</>
            )}
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            style={{ 
              flex: 1, 
              padding: '14px', 
              backgroundColor: colors.teal500, 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: 'bold', 
              color: colors.white, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            📤 공유하기
          </button>
        </div>
      </div>

      {/* 공유 모달 */}
      {showShareModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'center', 
          zIndex: 50 
        }}>
          <div style={{ 
            backgroundColor: colors.white, 
            borderRadius: '24px 24px 0 0', 
            width: '100%', 
            maxWidth: '512px', 
            padding: '24px',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>공유하기</h3>
              <button onClick={() => setShowShareModal(false)} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg style={{ width: '24px', height: '24px', color: colors.gray400 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {shareChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleShare(channel.id)}
                  disabled={!channel.enabled}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '16px', 
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: channel.enabled ? 'pointer' : 'not-allowed',
                    opacity: channel.enabled ? 1 : 0.4
                  }}
                >
                  <span style={{ fontSize: '30px' }}>{channel.icon}</span>
                  <span style={{ fontSize: '12px', color: colors.gray700 }}>{channel.name}</span>
                  {!channel.enabled && (
                    <span style={{ fontSize: '10px', color: colors.gray400 }}>준비중</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
