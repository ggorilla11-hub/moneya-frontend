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
}

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
- 나이: ${context.age || 40}세
- 월 소득: ${context.income || 500}만원
- 저축률: ${context.savingsRate || 20}%
- 부자지수: ${context.wealthIndex || 100}점
- 순자산: ${context.netAssets || 10000}만원
- 총 부채: ${context.totalDebt || 5000}만원
- 가입 후: ${context.daysSinceJoin || 0}일
- 누적 순저축: ${context.cumulativeNetSavings || 0}원

이 사용자에게 맞춤형 절약 팁과 격려 메시지를 3-4문장으로 작성해주세요.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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
    console.error('AI Insight Error:', error);
    return '절약 팁을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
};
