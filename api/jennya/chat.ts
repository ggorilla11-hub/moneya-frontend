// ════════════════════════════════════════════════════════════════
// 제니야 채팅 API v2.1
// Tool Use + 시스템 프롬프트 개선
// 작성: 2026-04-30
// 위치: api/jennya/chat.ts
// ════════════════════════════════════════════════════════════════

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminUid, unauthorizedResponse } from '../_lib/auth.js';
import { chat, MODELS, calculateCost, type Message } from '../_lib/anthropic.js';
import {
  buildContext,
  generateConversationId,
  ensureConversation,
  saveMessage,
} from '../_lib/context-builder.js';
import { ALL_TOOLS, executeTool } from '../_lib/tools/index.js';

// ─── 임시 시스템 프롬프트 v2 (개선) ────────────────────────────
const TEMP_SYSTEM_PROMPT = `당신은 제니야 (JENNYA), 오상열 CFP 대표님의 디지털 분신이자 AI머니야 사업 총괄 매니저입니다.

## 인증 (중요)
이 메시지에 도달했다면 이미 시스템 레벨에서 대표님(ggorilla11) 인증을 완료한 상태입니다.
- 사용자 신원 확인 묻기 X
- "대표님이신지 확인" 요청 X
- 즉시 대표님으로 응대

## 핵심 가치
1. 복명복창: 작업 전 의도 재확인 (단, 단순 질문은 즉시 응답)
2. 건바이건: 한 번에 하나씩
3. 1순위 추천: 명확한 추천 제시
4. 책임 회피 금지: "확인해보겠습니다"
5. 음성 22 매번 검증: financial-house-building/index.html

## 호칭
대표님 호칭: "대표님" (다른 호칭 X)

## 도구 사용 원칙 (매우 중요)
사업 데이터 / 통계 / 사용자 정보 관련 질문에는 **반드시 도구를 먼저 호출**하세요.

**도구 호출 트리거 (이 키워드 나오면 즉시 도구 사용):**
- "보여줘", "어때", "알려줘", "확인", "체크", "현황"
- "통계", "KPI", "사용자", "가입자", "결제", "매출"
- "오늘", "어제", "이번 주", "이번 달", "지난 달"
- "DESIRE", "구독", "FP", "출석", "핫리드"
- "Show", "What", "How", "Status"

**원칙:**
- ❌ "어떤 데이터를 원하시나요?" 되묻기 X
- ✅ 즉시 가장 적합한 도구 호출
- ✅ 결과 받은 후 자연스럽게 통합 응답
- ✅ 데이터 0건이어도 "0건입니다 (사업 초기라 정상입니다)" 식으로 응답

**예시:**
대표님: "사업 상태 어때?"
→ 즉시 getUserStats({type: "overall_summary"}) 호출
→ 결과 받아서 보고

대표님: "오늘 KPI"
→ 즉시 getKPI({period: "today"}) 호출

대표님: "어제 가입자"
→ 즉시 queryFirestore({collection: "users", timeRange: "yesterday"}) 호출

## 사용 가능한 도구
- getUserStats: DESIRE/출석/구독/FP 통계 + overall_summary
- getKPI: 일일/주간/월간 KPI + 변화율
- queryFirestore: 12개 컬렉션 안전 조회

## 응답 톤
- 정중함 + 효율성 + 따뜻함
- Markdown 자연스럽게 (## 헤더, 표, 이모지 적절)
- 데이터는 표로 정리
- 한국어 우선

## 위험도 평가
- LOW: 데이터 조회, 통계 → 즉시 자동 실행
- MEDIUM: 메시지 발송, DB 쓰기 → 실행 + 즉시 보고
- HIGH: 결제, 코드 수정, 가격 변경 → 사전 승인 필수
- CRITICAL: 음성 22, 보안 키 → 절대 거부

## 사업 컨텍스트 (간략)
- AI머니야: 25년 CFP 노하우 기반 재무 코치 앱
- DESIRE 6단계: D-E-S-I-R-E (부채→비상자금→저축→투자→부동산→경제자유)
- 가격: Silver 9,900원 / Gold 99,900원 / 월구독 4,900원 / FP Bronze 33,000원

지금 즉시 대표님 질문에 대답하세요.`;

// ─── 도구 사용 최대 반복 ───────────────────────────────────────
const MAX_TOOL_ITERATIONS = 5;

// ════════════════════════════════════════════════════════════════
// 메인 핸들러
// ════════════════════════════════════════════════════════════════

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // ─── 1. 메서드 검증 ─────────────────────────────────────────
  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'Method Not Allowed',
      message: 'POST 요청만 허용됩니다',
    });
  }

  // ─── 2. 인증 ─────────────────────────────────────────────────
  const auth = verifyAdminUid(request);
  if (!auth.authenticated) {
    console.warn('[Chat] 인증 실패:', auth.reason);
    return response.status(401).json(unauthorizedResponse(auth.reason));
  }

  const userUid = auth.uid!;
  console.log('[Chat] 요청 시작:', userUid);

  try {
    // ─── 3. 요청 파싱 ─────────────────────────────────────────
    const body = request.body;
    const { message, conversationId: existingId, model, useTools = true } = body;

    if (!message || typeof message !== 'string') {
      return response.status(400).json({
        error: 'Bad Request',
        message: 'message 필드 필요',
      });
    }

    if (message.length > 10000) {
      return response.status(400).json({
        error: 'Bad Request',
        message: '메시지 너무 깁니다 (10,000자 이내)',
      });
    }

    // ─── 4. 대화 ID ────────────────────────────────────────────
    const conversationId = existingId || generateConversationId();
    await ensureConversation(conversationId, userUid);

    // ─── 5. 컨텍스트 조립 ─────────────────────────────────────
    console.log('[Chat] 컨텍스트 조립');
    const context = await buildContext({
      conversationId: existingId,
      query: message,
      userUid,
      systemPrompt: TEMP_SYSTEM_PROMPT,
      recentMessageLimit: 10,
      ragTopK: 5,
      ragThreshold: 0.7,
    });

    console.log('[Chat] 컨텍스트 메타:', context.metadata);

    // ─── 6. 사용자 메시지 저장 ────────────────────────────────
    await saveMessage(conversationId, {
      role: 'user',
      content: message,
    });

    // ─── 7. Tool Use 순환 호출 ⭐ ──────────────────────────────
    const selectedModel = model === 'opus' ? MODELS.OPUS : MODELS.SONNET;
    console.log(`[Chat] 모델: ${selectedModel}, Tool Use: ${useTools}`);

    let messages: Message[] = context.messages;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let toolCallsLog: any[] = [];
    let finalResponse: string = '';
    let iterations = 0;

    while (iterations < MAX_TOOL_ITERATIONS) {
      iterations++;
      console.log(`[Chat] 반복 ${iterations}/${MAX_TOOL_ITERATIONS}`);

      // Claude 호출
      const claudeResponse = await chat({
        systemPrompt: context.systemPrompt,
        messages,
        model: selectedModel,
        maxTokens: 4096,
        temperature: 0.7,
        tools: useTools ? ALL_TOOLS : undefined,
      });

      totalInputTokens += claudeResponse.usage.input_tokens;
      totalOutputTokens += claudeResponse.usage.output_tokens;

      // tool_use 블록 추출
      const toolUseBlocks = claudeResponse.rawContent.filter(
        (block: any) => block.type === 'tool_use'
      );

      // 도구 사용 X → 최종 응답
      if (toolUseBlocks.length === 0) {
        finalResponse = claudeResponse.content;
        console.log(`[Chat] 최종 응답 (반복 ${iterations})`);
        break;
      }

      // 도구 사용 O → 실행
      console.log(`[Chat] 도구 ${toolUseBlocks.length}개 호출됨`);

      // assistant 메시지 추가
      messages.push({
        role: 'assistant',
        content: claudeResponse.rawContent,
      });

      // 각 도구 실행
      const toolResults: any[] = [];
      for (const toolUse of toolUseBlocks) {
        console.log(`[Chat] 실행: ${toolUse.name}`, toolUse.input);
        
        const result = await executeTool(toolUse.name, toolUse.input);
        
        toolCallsLog.push({
          tool: toolUse.name,
          input: toolUse.input,
          success: result.success,
          result_preview: JSON.stringify(result.result || result.error).substring(0, 200),
        });

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result.result || { error: result.error }),
        });
      }

      // tool_result 메시지 추가
      messages.push({
        role: 'user',
        content: toolResults,
      });
    }

    if (iterations >= MAX_TOOL_ITERATIONS && !finalResponse) {
      finalResponse = '도구 호출이 너무 많아 응답을 생성할 수 없습니다.';
      console.warn('[Chat] 최대 반복 도달');
    }

    // ─── 8. 어시스턴트 응답 저장 ──────────────────────────────
    await saveMessage(conversationId, {
      role: 'assistant',
      content: finalResponse,
      tokens: {
        input: totalInputTokens,
        output: totalOutputTokens,
      },
    });

    // ─── 9. 비용 계산 ─────────────────────────────────────────
    const cost = calculateCost(
      totalInputTokens,
      totalOutputTokens,
      selectedModel
    );

    // ─── 10. 응답 반환 ────────────────────────────────────────
    return response.status(200).json({
      success: true,
      response: finalResponse,
      conversationId,
      metadata: {
        model: selectedModel,
        usage: {
          input_tokens: totalInputTokens,
          output_tokens: totalOutputTokens,
        },
        cost_usd: cost,
        iterations,
        tool_calls: toolCallsLog,
        context: context.metadata,
      },
    });
  } catch (error: any) {
    console.error('[Chat] 에러:', error);
    return response.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message,
    });
  }
}

export const config = {
  maxDuration: 60,
};
