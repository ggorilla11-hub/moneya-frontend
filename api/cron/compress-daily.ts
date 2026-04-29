// ════════════════════════════════════════════════════════════════
// 제니야 일일 메모리 압축 Cron Job
// 매일 03:00 (KST) 자동 실행 - Vercel Cron
// 작성: 2026-04-29
// 위치: api/cron/compress-daily.ts
// ════════════════════════════════════════════════════════════════

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyCronSecret, unauthorizedResponse, getAdminUid } from '../_lib/auth.js';
import {
  db,
  COLLECTIONS,
  getYesterdayConversations,
  getConversationMessages,
  saveMemory,
  saveSummary,
  cleanupExpiredMemories,
  calculateExpiry,
  Timestamp,
} from '../_lib/firebase-admin.js';
import { compress, evaluateImportance, calculateCost, MODELS } from '../_lib/anthropic.js';
import { createEmbedding } from '../_lib/openai-embedding.js';

// ════════════════════════════════════════════════════════════════
// 메인 핸들러
// ════════════════════════════════════════════════════════════════

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // ─── 1. 인증 (Cron Secret) ──────────────────────────────────
  const auth = verifyCronSecret(request);
  if (!auth.authenticated) {
    console.warn('[Cron] 인증 실패:', auth.reason);
    return response.status(401).json(unauthorizedResponse(auth.reason));
  }

  console.log('[Cron] 일일 메모리 압축 시작');
  const startTime = Date.now();
  const adminUid = getAdminUid();

  // ─── 작업 결과 기록 ─────────────────────────────────────────
  const result = {
    started_at: new Date().toISOString(),
    conversations_processed: 0,
    memories_created: 0,
    expired_memories_deleted: 0,
    errors: [] as string[],
    cost_usd: 0,
    duration_ms: 0,
  };

  try {
    // ─── 2. 어제 대화 조회 ──────────────────────────────────
    const yesterdayConvs = await getYesterdayConversations(adminUid);
    console.log(`[Cron] 어제 대화 ${yesterdayConvs.length}건 발견`);

    if (yesterdayConvs.length === 0) {
      console.log('[Cron] 어제 대화 없음 - 메모리 정리만 진행');
    }

    // ─── 3. 각 대화 처리 ────────────────────────────────────
    for (const conv of yesterdayConvs) {
      try {
        const memoryId = await processConversation(conv.conversation_id, adminUid);
        if (memoryId) {
          result.memories_created++;
        }
        result.conversations_processed++;
      } catch (error: any) {
        const errMsg = `대화 ${conv.conversation_id} 처리 실패: ${error.message}`;
        console.error('[Cron]', errMsg);
        result.errors.push(errMsg);
      }
    }

    // ─── 4. 만료 메모리 정리 ────────────────────────────────
    try {
      const deletedCount = await cleanupExpiredMemories();
      result.expired_memories_deleted = deletedCount;
      console.log(`[Cron] 만료 메모리 ${deletedCount}건 정리`);
    } catch (error: any) {
      console.error('[Cron] 메모리 정리 실패:', error.message);
      result.errors.push(`메모리 정리 실패: ${error.message}`);
    }

    // ─── 5. 일일 요약 저장 ──────────────────────────────────
    try {
      const today = new Date();
      today.setDate(today.getDate() - 1); // 어제 날짜
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

      await saveSummary({
        type: 'daily',
        date: dateStr,
        data: {
          conversation_count: result.conversations_processed,
          memories_created: result.memories_created,
          expired_deleted: result.expired_memories_deleted,
          errors: result.errors,
        },
      });
      console.log(`[Cron] 일일 요약 저장: ${dateStr}`);
    } catch (error: any) {
      console.error('[Cron] 요약 저장 실패:', error.message);
      result.errors.push(`요약 저장 실패: ${error.message}`);
    }

    // ─── 6. 완료 보고 ───────────────────────────────────────
    result.duration_ms = Date.now() - startTime;
    console.log('[Cron] 완료:', JSON.stringify(result, null, 2));

    return response.status(200).json({
      success: true,
      message: '일일 메모리 압축 완료',
      result,
    });
  } catch (error: any) {
    // ─── 7. 전체 작업 실패 ──────────────────────────────────
    result.duration_ms = Date.now() - startTime;
    result.errors.push(`전체 실패: ${error.message}`);

    console.error('[Cron] 치명적 에러:', error);

    return response.status(500).json({
      success: false,
      message: '일일 메모리 압축 실패',
      result,
    });
  }
}

// ════════════════════════════════════════════════════════════════
// 개별 대화 처리 함수
// ════════════════════════════════════════════════════════════════

async function processConversation(
  conversationId: string,
  userUid: string
): Promise<string | null> {
  console.log(`[Cron] 대화 처리: ${conversationId}`);

  // ─── 1. 대화 메시지 모두 조회 ─────────────────────────────
  const messages = await getConversationMessages(conversationId);
  if (messages.length === 0) {
    console.log(`[Cron] 빈 대화 스킵: ${conversationId}`);
    return null;
  }

  // ─── 2. 대화 내용 합치기 ─────────────────────────────────
  const conversationText = messages
    .map(msg => `${msg.role === 'user' ? '대표님' : '제니야'}: ${msg.content}`)
    .join('\n\n');

  // ─── 3. 너무 짧으면 스킵 (50자 미만) ─────────────────────
  if (conversationText.length < 50) {
    console.log(`[Cron] 짧은 대화 스킵: ${conversationText.length}자`);
    return null;
  }

  // ─── 4. Claude로 압축 / 요약 ──────────────────────────────
  const compressionResult = await compress({
    content: conversationText,
    instruction: '이 대화를 분석하여 핵심 정보를 추출해주세요.',
  });

  // JSON 파싱
  let parsedResult: {
    summary: string;
    topics: string[];
    key_decisions: string[];
    pending_actions: string[];
    importance: number;
  };

  try {
    // JSON 코드 블록 제거 후 파싱
    const cleanText = compressionResult.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    parsedResult = JSON.parse(cleanText);
  } catch (error) {
    console.warn('[Cron] JSON 파싱 실패, 기본값 사용');
    parsedResult = {
      summary: compressionResult.content.substring(0, 200),
      topics: ['unknown'],
      key_decisions: [],
      pending_actions: [],
      importance: 3,
    };
  }

  // ─── 5. 중요도 검증 (1-5 범위) ────────────────────────────
  const importance = Math.min(5, Math.max(1, parsedResult.importance || 3));

  // ─── 6. 카테고리 추정 ─────────────────────────────────────
  let category: 'decision' | 'pattern' | 'learning' | 'issue' | 'preference' = 'learning';
  if (parsedResult.key_decisions.length > 0) {
    category = 'decision';
  } else if (parsedResult.pending_actions.length > 0) {
    category = 'issue';
  }

  // ─── 7. 압축된 내용 텍스트 생성 ───────────────────────────
  const compressedContent = [
    `요약: ${parsedResult.summary}`,
    parsedResult.key_decisions.length > 0
      ? `결정: ${parsedResult.key_decisions.join(' / ')}`
      : '',
    parsedResult.pending_actions.length > 0
      ? `진행 중: ${parsedResult.pending_actions.join(' / ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  // ─── 8. 임베딩 생성 ───────────────────────────────────────
  const embedding = await createEmbedding(compressedContent);

  // ─── 9. 만료 시점 계산 ────────────────────────────────────
  const expiresAt = calculateExpiry(importance);

  // ─── 10. 메모리 저장 ──────────────────────────────────────
  const memoryId = await saveMemory({
    user_uid: userUid,
    source_conversation_id: conversationId,
    source_messages: messages.map(m => m.message_id),
    content: compressedContent,
    category,
    topics: parsedResult.topics || [],
    importance,
    embedding,
    expires_at: expiresAt,
    related_memories: [],
    verified_by_user: false,
  });

  console.log(
    `[Cron] 메모리 저장: ${memoryId} (중요도 ${importance}, ` +
      `만료 ${expiresAt ? expiresAt.toDate().toISOString().split('T')[0] : '영구'})`
  );

  // ─── 11. 비용 추정 ────────────────────────────────────────
  const cost = calculateCost(
    compressionResult.usage.input_tokens,
    compressionResult.usage.output_tokens,
    MODELS.OPUS
  );
  console.log(`[Cron] 압축 비용: $${cost.toFixed(4)}`);

  return memoryId;
}

// ════════════════════════════════════════════════════════════════
// Vercel 설정
// ════════════════════════════════════════════════════════════════

export const config = {
  maxDuration: 60, // 60초 (Vercel Pro)
};
