// ════════════════════════════════════════════════════════════════
// 제니야 컨텍스트 빌더
// 시스템 프롬프트 + 지식베이스 + 최근 대화 + RAG 메모리 통합
// 토큰 예산 관리 + 우선순위별 조립
// 작성: 2026-04-29
// 위치: api/_lib/context-builder.ts
// ════════════════════════════════════════════════════════════════

import { searchMemory, getRecentDecisions } from './memory-search.js';
import {
  db,
  COLLECTIONS,
  getConversationMessages,
  Timestamp,
} from './firebase-admin.js';
import { estimateTokens } from './anthropic.js';
import type { Message } from './firebase-admin.js';

// ─── 토큰 예산 ─────────────────────────────────────────────────
const TOKEN_BUDGET = {
  TOTAL: 150_000,        // Claude 200K 중 안전 마진
  SYSTEM: 15_000,        // 시스템 프롬프트
  KNOWLEDGE: 30_000,     // 지식베이스 (필요시)
  RECENT: 20_000,        // 최근 대화 (현재 세션)
  RAG: 10_000,           // RAG 검색 결과 (장기 기억)
  CURRENT: 5_000,        // 현재 메시지
  RESPONSE: 4_000,       // 응답 여유분
  // 합계: 84,000 (안전 마진 충분)
};

// ─── 타입 정의 ─────────────────────────────────────────────────
export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type Context = {
  systemPrompt: string;
  messages: ChatMessage[];
  metadata: {
    recent_message_count: number;
    rag_memory_count: number;
    total_tokens_estimate: number;
  };
};

export type ContextOptions = {
  conversationId?: string;     // 현재 대화 ID
  query: string;                // 사용자 메시지
  userUid: string;              // 대표님 UID
  systemPrompt: string;         // 제니야 시스템 프롬프트
  recentMessageLimit?: number;  // 최근 대화 가져올 개수 (기본 10)
  ragTopK?: number;             // RAG 검색 결과 수 (기본 5)
  ragThreshold?: number;        // RAG 유사도 임계값 (기본 0.7)
};

// ─── 1. 컨텍스트 조립 (메인 함수) ──────────────────────────────
export async function buildContext(options: ContextOptions): Promise<Context> {
  const {
    conversationId,
    query,
    userUid,
    systemPrompt,
    recentMessageLimit = 10,
    ragTopK = 5,
    ragThreshold = 0.7,
  } = options;

  console.log('[ContextBuilder] 컨텍스트 조립 시작');

  // ─── 1.1 최근 대화 가져오기 (Hot Memory) ─────────────────
  let recentMessages: ChatMessage[] = [];
  if (conversationId) {
    try {
      const messages = await getConversationMessages(conversationId);
      // 최근 N개만 (역순 후 정순으로 반환)
      const recent = messages.slice(-recentMessageLimit);
      recentMessages = recent.map(m => ({
        role: m.role === 'system' ? 'user' : (m.role as 'user' | 'assistant'),
        content: m.content,
      }));
      console.log(`[ContextBuilder] 최근 대화 ${recentMessages.length}개`);
    } catch (error: any) {
      console.warn('[ContextBuilder] 최근 대화 조회 실패:', error.message);
    }
  }

  // ─── 1.2 RAG 메모리 검색 (Long-term Memory) ───────────────
  let ragMemories: Array<{ content: string; score: number }> = [];
  try {
    const searchResults = await searchMemory(userUid, query, {
      topK: ragTopK,
      threshold: ragThreshold,
    });
    ragMemories = searchResults.map(r => ({
      content: r.memory.content,
      score: r.score,
    }));
    console.log(`[ContextBuilder] RAG 메모리 ${ragMemories.length}개 (임계값 ${ragThreshold})`);
  } catch (error: any) {
    console.warn('[ContextBuilder] RAG 검색 실패:', error.message);
  }

  // ─── 1.3 RAG 결과를 시스템 프롬프트에 추가 ────────────────
  let enhancedSystemPrompt = systemPrompt;

  if (ragMemories.length > 0) {
    const ragSection = formatRagMemories(ragMemories);
    enhancedSystemPrompt = `${systemPrompt}\n\n${ragSection}`;
  }

  // ─── 1.4 메시지 배열 구성 ───────────────────────────────────
  const allMessages: ChatMessage[] = [
    ...recentMessages,
    { role: 'user', content: query },
  ];

  // ─── 1.5 토큰 추정 ──────────────────────────────────────────
  const totalTokens = estimateTokens(
    enhancedSystemPrompt + allMessages.map(m => m.content).join('\n')
  );

  console.log(`[ContextBuilder] 총 토큰 추정: ${totalTokens}`);

  // ─── 1.6 토큰 예산 초과 시 트림 ─────────────────────────────
  if (totalTokens > TOKEN_BUDGET.TOTAL - TOKEN_BUDGET.RESPONSE) {
    console.warn('[ContextBuilder] 토큰 예산 초과 - 트림 진행');
    return trimContext(enhancedSystemPrompt, allMessages, ragMemories.length);
  }

  return {
    systemPrompt: enhancedSystemPrompt,
    messages: allMessages,
    metadata: {
      recent_message_count: recentMessages.length,
      rag_memory_count: ragMemories.length,
      total_tokens_estimate: totalTokens,
    },
  };
}

// ─── 2. RAG 메모리 포맷팅 ──────────────────────────────────────
function formatRagMemories(
  memories: Array<{ content: string; score: number }>
): string {
  if (memories.length === 0) return '';

  const lines = memories.map(
    (m, i) => `[기억 ${i + 1}] (관련도 ${(m.score * 100).toFixed(0)}%)\n${m.content}`
  );

  return `--- 관련 과거 메모리 ---
${lines.join('\n\n')}

위 메모리는 과거 대화에서 추출된 정보입니다. 필요 시 자연스럽게 활용하되, 매번 명시적으로 인용할 필요는 없습니다.
--- 메모리 끝 ---`;
}

// ─── 3. 컨텍스트 트림 (토큰 초과 시) ───────────────────────────
function trimContext(
  systemPrompt: string,
  messages: ChatMessage[],
  ragCount: number
): Context {
  console.log('[ContextBuilder] 트림 모드');

  // 최근 5개 메시지만 유지
  const trimmedMessages = messages.slice(-5);

  const totalTokens = estimateTokens(
    systemPrompt + trimmedMessages.map(m => m.content).join('\n')
  );

  return {
    systemPrompt,
    messages: trimmedMessages,
    metadata: {
      recent_message_count: trimmedMessages.length - 1,
      rag_memory_count: ragCount,
      total_tokens_estimate: totalTokens,
    },
  };
}

// ─── 4. 최근 결정 컨텍스트 추가 (선택) ──────────────────────────
export async function buildContextWithDecisions(
  options: ContextOptions,
  daysBack: number = 7
): Promise<Context> {
  const baseContext = await buildContext(options);

  try {
    const decisions = await getRecentDecisions(options.userUid, daysBack, 5);

    if (decisions.length > 0) {
      const decisionSection = `\n\n--- 최근 ${daysBack}일 주요 결정 ---\n${decisions
        .map((d, i) => `${i + 1}. ${d.content}`)
        .join('\n')}\n--- 결정 끝 ---`;

      baseContext.systemPrompt += decisionSection;
    }
  } catch (error: any) {
    console.warn('[ContextBuilder] 최근 결정 추가 실패:', error.message);
  }

  return baseContext;
}

// ─── 5. 새 대화 ID 생성 ────────────────────────────────────────
export function generateConversationId(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 9);
  return `conv_${dateStr}_${random}`;
}

// ─── 6. 대화 메타 정보 저장 ────────────────────────────────────
export async function ensureConversation(
  conversationId: string,
  userUid: string
): Promise<void> {
  try {
    const docRef = db.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    const doc = await docRef.get();

    if (!doc.exists) {
      // 새 대화 생성
      const now = Timestamp.now();
      await docRef.set({
        conversation_id: conversationId,
        user_uid: userUid,
        started_at: now,
        last_message_at: now,
        ended_at: null,
        title: '새 대화',
        summary: '',
        topics: [],
        message_count: 0,
        total_tokens: 0,
        channel: 'text',
        importance: 3,
        archived: false,
        created_at: now,
        updated_at: now,
      });
      console.log(`[ContextBuilder] 새 대화 생성: ${conversationId}`);
    }
  } catch (error: any) {
    console.error('[ContextBuilder] 대화 메타 저장 실패:', error.message);
    throw error;
  }
}

// ─── 7. 메시지 저장 ────────────────────────────────────────────
export async function saveMessage(
  conversationId: string,
  message: {
    role: 'user' | 'assistant';
    content: string;
    tokens?: { input: number; output: number };
  }
): Promise<string> {
  try {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = Timestamp.now();

    // 메시지 저장
    await db
      .collection(COLLECTIONS.CONVERSATIONS)
      .doc(conversationId)
      .collection('messages')
      .doc(messageId)
      .set({
        message_id: messageId,
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        created_at: now,
        tokens: message.tokens || { input: 0, output: 0 },
        tool_calls: [],
        attachments: [],
        user_feedback: null,
        notes: null,
      });

    // 대화 메타 업데이트
    await db
      .collection(COLLECTIONS.CONVERSATIONS)
      .doc(conversationId)
      .update({
        last_message_at: now,
        message_count: (await db
          .collection(COLLECTIONS.CONVERSATIONS)
          .doc(conversationId)
          .collection('messages')
          .count()
          .get()).data().count,
        updated_at: now,
      });

    return messageId;
  } catch (error: any) {
    console.error('[ContextBuilder] 메시지 저장 실패:', error.message);
    throw error;
  }
}

// ─── 8. 내보내기 ───────────────────────────────────────────────
export default {
  buildContext,
  buildContextWithDecisions,
  generateConversationId,
  ensureConversation,
  saveMessage,
  TOKEN_BUDGET,
};
