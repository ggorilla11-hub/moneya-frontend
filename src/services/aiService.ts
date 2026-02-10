// src/services/aiService.ts
// AI 인사이트 서비스 - OpenAI API 연동
// v2.0: 절약팁, 인사이트, 월간리포트 AI코멘트 통합

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

interface FinancialContext {
  name?: string;
  age?: number;
  income?: number;
  savingsRate?: number;
  wealthIndex?: number;
  netAssets?: number;
  totalDebt?: number;
  daysSinceJoin?: number;
  cumulativeNetSavings?: number;
  totalExpense?: number;
  totalSaving?: number;
}

interface MonthlyReportContext {
  month?: string;
  totalIncome?: number;
  totalExpense?: number;
  totalSaving?: number;
  budgetTotal?: number;
  budgetDiff?: number;
  categories?: { name: string; amount: number; percent: number }[];
  lastMonthDiff?: number;
}

// ★ AI 인사이트 + 절약팁 조회
export const getAIInsightAdvice = async (context: FinancialContext): Promise<string> => {
  const systemPrompt = `당신은 AI 머니야입니다. 따뜻하고 친근한 재무 코치입니다.

역할: 사용자의 재무 상황을 분석하고 실질적인 절약 팁과 격려를 제공합니다.

응답 원칙:
1. 이모지를 적절히 사용해 친근하게
2. 3-4문장으로 간결하게
3. 구체적인 숫자 기반 조언
4. 긍정적이고 격려하는 톤
5. 한국어로 답변`;

  const userPrompt = `[사용자 재무 현황]
- 이름: ${context.name || '고객'}님
- 나이: ${context.age || 40}세
- 월 소득: ${context.income || 500}만원
- 저축률: ${context.savingsRate || 20}%
- 부자지수: ${context.wealthIndex || 100}점
- 순자산: ${context.netAssets || 10000}만원
- 총 부채: ${context.totalDebt || 5000}만원
- 월 지출: ${context.totalExpense || 300}만원
- 월 저축: ${context.totalSaving || 100}만원
- 가입 후: ${context.daysSinceJoin || 0}일
- 누적 순저축: ${context.cumulativeNetSavings || 0}원

이 사용자에게 맞춤형 절약 팁과 격려 메시지를 3-4문장으로 작성해주세요.`;

  try {
    if (!OPENAI_API_KEY) {
      console.error('[aiService] VITE_OPENAI_API_KEY가 설정되지 않았습니다.');
      return '⚠️ AI 서비스 설정을 확인해주세요.';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('API 오류: ' + response.status);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('[aiService] AI Insight Error:', error);
    return '절약 팁을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
};

// ★ 목표 수정 AI 조언
export const getGoalAdvice = async (context: FinancialContext, newGoalRate: number): Promise<string> => {
  const systemPrompt = `당신은 AI 머니야입니다. 사용자가 저축률 목표를 변경하려 합니다.
현실적이고 구체적인 조언을 2-3문장으로 해주세요. 이모지를 사용하여 친근하게 답변해주세요. 한국어로 답변합니다.`;

  const userPrompt = `[사용자 정보]
- 월 소득: ${context.income || 500}만원
- 현재 저축률: ${context.savingsRate || 20}%
- 새 목표 저축률: ${newGoalRate}%
- 월 지출: ${context.totalExpense || 300}만원

이 목표가 현실적인지 평가하고, 달성을 위한 구체적 조언을 해주세요.`;

  try {
    if (!OPENAI_API_KEY) return '⚠️ AI 서비스 설정을 확인해주세요.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error('API 오류: ' + response.status);
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('[aiService] Goal Advice Error:', error);
    return '목표 조언을 불러오는 중 오류가 발생했습니다.';
  }
};

// ★ 월간리포트 AI 코멘트
export const getMonthlyAIComment = async (context: MonthlyReportContext): Promise<string> => {
  const systemPrompt = `당신은 AI 머니야입니다. 사용자의 월간 지출 리포트를 분석하여 코멘트를 작성합니다.

응답 원칙:
1. 이모지를 적절히 사용
2. 3-4문장으로 간결하게
3. 구체적인 숫자 기반 분석
4. 칭찬할 부분은 칭찬, 개선점은 부드럽게
5. 한국어로 답변`;

  const categoryText = context.categories && context.categories.length > 0
    ? context.categories.map(c => `${c.name}: ${c.amount}만원 (${c.percent}%)`).join(', ')
    : '데이터 없음';

  const userPrompt = `[${context.month || '이번 달'} 지출 리포트]
- 총 수입: ${context.totalIncome || 500}만원
- 총 지출: ${context.totalExpense || 300}만원
- 총 저축: ${context.totalSaving || 100}만원
- 예산 총액: ${context.budgetTotal || 300}만원
- 예산 대비: ${context.budgetDiff !== undefined ? (context.budgetDiff > 0 ? `${context.budgetDiff}만원 초과` : `${Math.abs(context.budgetDiff)}만원 절약`) : '확인 불가'}
- 전월 대비: ${context.lastMonthDiff !== undefined ? (context.lastMonthDiff > 0 ? `${context.lastMonthDiff}만원 증가` : `${Math.abs(context.lastMonthDiff)}만원 감소`) : '비교 불가'}
- 카테고리별: ${categoryText}

이 데이터를 바탕으로 맞춤형 월간 리포트 코멘트를 3-4문장으로 작성해주세요.`;

  try {
    if (!OPENAI_API_KEY) return '⚠️ AI 서비스 설정을 확인해주세요.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error('API 오류: ' + response.status);
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('[aiService] Monthly Comment Error:', error);
    return '월간 코멘트를 불러오는 중 오류가 발생했습니다.';
  }
};
