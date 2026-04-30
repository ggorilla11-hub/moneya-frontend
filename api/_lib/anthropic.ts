// ════════════════════════════════════════════════════════════════
// 제니야 Anthropic API 라이브러리
// Claude Opus 4.7 (중요 작업) + Sonnet 4 (일상 작업) 하이브리드
// 작성: 2026-04-29
// 위치: api/_lib/anthropic.ts
// ════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk';

// ─── 환경 변수 검증 ────────────────────────────────────────────
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다.');
}

// ─── Anthropic 클라이언트 초기화 ───────────────────────────────
const anthropic = new Anthropic({
  apiKey: apiKey,
});

// ─── 모델 상수 ─────────────────────────────────────────────────
export const MODELS = {
  OPUS: 'claude-opus-4-7',     // 중요 결정, 압축 작업
  SONNET: 'claude-sonnet-4-6',   // 일상 대화, 빠른 응답
} as const;

export type ModelType = typeof MODELS[keyof typeof MODELS];

// ─── 메시지 타입 ───────────────────────────────────────────────
export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// ─── 응답 타입 ─────────────────────────────────────────────────
export type ChatResponse = {
  content: string;
  rawContent: any[];
  stopReason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  model: string;
};

// ─── 1. 일반 대화 호출 (Sonnet 기본) ───────────────────────────
export async function chat(params: {
  systemPrompt: string;
  messages: Message[];
  model?: ModelType;
  maxTokens?: number;
  temperature?: number;
  tools?: any[];
}): Promise<ChatResponse> {
  const {
    systemPrompt,
    messages,
    model = MODELS.SONNET,
    maxTokens = 4096,
    temperature = 0.7,
    tools,
  } = params;

  try {
    const requestParams: any = {
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    };

    if (tools && tools.length > 0) {
      requestParams.tools = tools;
    }

    const response = await anthropic.messages.create(requestParams);

    // 응답 텍스트 추출
    const textContent = response.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n');

    return {
      content: textContent,
      rawContent: response.content,
      stopReason: response.stop_reason || '',
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
      model: response.model,
    };
  } catch (error: any) {
    console.error('[Anthropic API 에러]', error.message);
    throw new Error(`Anthropic API 호출 실패: ${error.message}`);
  }
}

// ─── 2. 압축 / 요약 호출 (Opus 사용) ───────────────────────────
export async function compress(params: {
  content: string;
  instruction: string;
}): Promise<ChatResponse> {
  const { content, instruction } = params;

  const systemPrompt = `당신은 대표님 사업 매니저 제니야의 메모리 압축 시스템입니다.
대화 내용을 분석하여 핵심 정보만 추출하고 정확하게 요약합니다.

원칙:
1. 사실만 보존 (추측 X)
2. 결정 사항 우선
3. 진행 중 작업 명시
4. 대표님 의사결정 패턴 기록`;

  const userMessage = `${instruction}

원본 내용:
${content}

JSON 형식으로 응답하세요:
{
  "summary": "한 줄 요약 (50자 이내)",
  "topics": ["주요 토픽 3-5개"],
  "key_decisions": ["대표님 결정 사항"],
  "pending_actions": ["남은 작업"],
  "importance": 1-5
}`;

  return chat({
    systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    model: MODELS.OPUS,    // 정확도 우선
    maxTokens: 2048,
    temperature: 0.3,       // 일관성 우선
  });
}

// ─── 3. 중요도 평가 (Sonnet 사용) ──────────────────────────────
export async function evaluateImportance(content: string): Promise<number> {
  const systemPrompt = `당신은 메모리 중요도 평가자입니다. 1-5 정수만 응답합니다.

평가 기준:
5: 사업 핵심 결정 / 가격 정책 / 음성 22 같은 절대 규칙
4: 중요 결정 / 큰 작업 완료 / 시스템 변경
3: 일반 작업 / 일상 보고 / 소소한 결정
2: 사소한 대화 / 확인성 메시지
1: 인사 / 잡담 / 일회성`;

  const response = await chat({
    systemPrompt,
    messages: [{ role: 'user', content: `다음 내용의 중요도는?\n\n${content}` }],
    model: MODELS.SONNET,
    maxTokens: 10,
    temperature: 0.1,
  });

  const num = parseInt(response.content.trim());
  return isNaN(num) ? 3 : Math.min(5, Math.max(1, num));   // 1-5 범위로 제한
}

// ─── 4. 토큰 카운팅 (대략적) ───────────────────────────────────
export function estimateTokens(text: string): number {
  // 한국어 + 영어 혼합 추정: 평균 2.5 글자 = 1 토큰
  return Math.ceil(text.length / 2.5);
}

// ─── 5. 비용 계산 (디버깅용) ───────────────────────────────────
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: ModelType
): number {
  // 단위: USD
  const PRICES = {
    [MODELS.OPUS]: { input: 15 / 1_000_000, output: 75 / 1_000_000 },
    [MODELS.SONNET]: { input: 3 / 1_000_000, output: 15 / 1_000_000 },
  };

  const price = PRICES[model] || PRICES[MODELS.SONNET];
  return inputTokens * price.input + outputTokens * price.output;
}

// ─── 6. 내보내기 ───────────────────────────────────────────────
export default {
  chat,
  compress,
  evaluateImportance,
  estimateTokens,
  calculateCost,
  MODELS,
};
