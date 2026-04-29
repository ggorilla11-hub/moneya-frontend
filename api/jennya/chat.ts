// ════════════════════════════════════════════════════════════════
// 제니야 채팅 API
// 대표님 메시지 받기 → 컨텍스트 조립 → Claude 호출 → 응답 + 저장
// 작성: 2026-04-29
// 위치: api/jennya/chat.ts
// ════════════════════════════════════════════════════════════════

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminUid, unauthorizedResponse } from '../_lib/auth.js';
import { chat, MODELS, calculateCost } from '../_lib/anthropic.js';
import {
  buildContext,
  generateConversationId,
  ensureConversation,
  saveMessage,
} from '../_lib/context-builder.js';

// ─── 임시 시스템 프롬프트 (Phase 4 후 지식베이스에서 로드) ──────
const TEMP_SYSTEM_PROMPT = `당신은 제니야 (JENNYA), 오상열 CFP 대표님의 디지털 분신이자 AI머니야 사업 총괄 매니저입니다.

핵심 가치:
1. 복명복창: 작업 전 대표님 의도 재확인
2. 건바이건: 한 번에 하나씩 단계적으로
3. 1순위 추천: 여러 옵션 중 가장 좋은 것 명시
4. 책임 회피 금지: "확인해보겠습니다"
5. 음성 22 매번 검증: financial-house-building/index.html

대표님 호칭: "대표님" (다른 호칭 X)

응대:
- 대표님(ggorilla11) 외 사용자 차단
- 작업 위험도 평가 (LOW/MEDIUM/HIGH/CRITICAL)
- HIGH 이상은 사전 승인 필수

톤: 정중함 + 효율성 + 따뜻함

이건 임시 프롬프트입니다. Phase 4에서 9개 지식베이스 문서를 통합한 완전한 프롬프트로 교체됩니다.`;

// ════════════════════════════════════════════════════════════════
// 메인 핸들러
// ════════════════════════════════════════════════════════════════

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // ─── 1. 메서드 검증 (POST만 허용) ───────────────────────────
  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'Method Not Allowed',
      message: 'POST 요청만 허용됩니다',
    });
  }

  // ─── 2. 인증 (대표님 UID) ───────────────────────────────────
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
    const { message, conversationId: existingId, model } = body;

    // 검증
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

    // ─── 4. 대화 ID 결정 (기존 or 신규) ───────────────────────
    const conversationId = existingId || generateConversationId();
    await ensureConversation(conversationId, userUid);

    // ─── 5. 컨텍스트 조립 ─────────────────────────────────────
    console.log('[Chat] 컨텍스트 조립');
    const context = await buildContext({
      conversationId: existingId,  // 신규면 undefined → 최근 대화 X
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

    // ─── 7. Claude 호출 ───────────────────────────────────────
    const selectedModel = model === 'opus' ? MODELS.OPUS : MODELS.SONNET;
    console.log(`[Chat] 모델: ${selectedModel}`);

    const claudeResponse = await chat({
      systemPrompt: context.systemPrompt,
      messages: context.messages,
      model: selectedModel,
      maxTokens: 4096,
      temperature: 0.7,
    });

    // ─── 8. 어시스턴트 응답 저장 ──────────────────────────────
    await saveMessage(conversationId, {
      role: 'assistant',
      content: claudeResponse.content,
      tokens: claudeResponse.usage,
    });

    // ─── 9. 비용 계산 ─────────────────────────────────────────
    const cost = calculateCost(
      claudeResponse.usage.input_tokens,
      claudeResponse.usage.output_tokens,
      selectedModel
    );

    // ─── 10. 응답 반환 ────────────────────────────────────────
    return response.status(200).json({
      success: true,
      response: claudeResponse.content,
      conversationId,
      metadata: {
        model: claudeResponse.model,
        usage: claudeResponse.usage,
        cost_usd: cost,
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

// ════════════════════════════════════════════════════════════════
// Vercel 설정
// ════════════════════════════════════════════════════════════════

export const config = {
  maxDuration: 30,
};
