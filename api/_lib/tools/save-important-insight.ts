// ════════════════════════════════════════════════════════════════
// 제니야 중요 인사이트 저장 도구
// 위험도: MEDIUM (DB 쓰기, 즉시 보고)
// 작성: 2026-04-30
// 위치: api/_lib/tools/save-important-insight.ts
//
// 제니야가 "이건 영구 보관" 판단 시 사용
// 일반 대화는 자동 압축되지만, 중요한 결정/패턴은 직접 저장
// ════════════════════════════════════════════════════════════════

import { saveMemory } from '../firebase-admin.js';
import { createEmbedding } from '../openai-embedding.js';
import { getAdminUid } from '../auth.js';

export async function saveImportantInsight(params: {
  content: string;                                              // 저장할 내용 (필수)
  category: 'decision' | 'pattern' | 'learning' | 'issue' | 'preference';  // 카테고리 (필수)
  topics: string[];                                             // 토픽 태그 (검색용)
  importance?: number;                                          // 1-5 (기본 4 = 영구 보관급)
  source_conversation_id?: string;                              // 출처 대화 ID
  source_messages?: string[];                                   // 출처 메시지 ID들
  expires_in_days?: number | null;                              // 만료일 (null = 영구)
}): Promise<{
  success: boolean;
  result?: {
    memory_id: string;
    content_preview: string;
    category: string;
    topics: string[];
    importance: number;
    expires_at: string | null;
  };
  error?: string;
}> {
  try {
    const userUid = getAdminUid();

    // ─── 1. 입력 검증 ──────────────────────────────────────
    if (!params.content || params.content.trim().length === 0) {
      return { success: false, error: 'content 필수' };
    }

    if (params.content.length > 10000) {
      return {
        success: false,
        error: `content 너무 김 (${params.content.length}자 / 최대 10,000자)`,
      };
    }

    if (!params.category) {
      return {
        success: false,
        error: 'category 필수 (decision/pattern/learning/issue/preference)',
      };
    }

    if (!params.topics || params.topics.length === 0) {
      return { success: false, error: 'topics 최소 1개 필수' };
    }

    const importance = params.importance || 4;
    if (importance < 1 || importance > 5) {
      return { success: false, error: 'importance는 1-5 사이' };
    }

    // ─── 2. 임베딩 생성 (검색용) ────────────────────────────
    console.log('[saveImportantInsight] 임베딩 생성 중...');
    const embedding = await createEmbedding(params.content);

    // ─── 3. 만료일 계산 ─────────────────────────────────────
    let expiresAt = null;
    if (params.expires_in_days && params.expires_in_days > 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + params.expires_in_days);
      expiresAt = expiry;
    }

    // ─── 4. 메모리 저장 ─────────────────────────────────────
    console.log('[saveImportantInsight] Firestore 저장 중...');
    const memoryId = await saveMemory({
      user_uid: userUid,
      source_conversation_id: params.source_conversation_id || 'manual',
      source_messages: params.source_messages || [],
      content: params.content,
      category: params.category,
      topics: params.topics,
      importance: importance,
      embedding: embedding,
      expires_at: expiresAt as any,  // Timestamp 변환은 saveMemory가 처리
      related_memories: [],
      verified_by_user: false,
    });

    console.log(`[saveImportantInsight] 저장 완료: ${memoryId}`);

    return {
      success: true,
      result: {
        memory_id: memoryId,
        content_preview: params.content.substring(0, 200),
        category: params.category,
        topics: params.topics,
        importance: importance,
        expires_at: expiresAt ? expiresAt.toISOString() : null,
      },
    };
  } catch (error: any) {
    console.error('[saveImportantInsight] 에러:', error.message);
    return { success: false, error: error.message };
  }
}

export const saveImportantInsightTool = {
  name: 'saveImportantInsight',
  description: `중요한 인사이트를 영구 메모리에 저장합니다 (MEDIUM 위험도).

⚠️ 일반 대화는 자동 압축됨. 이 도구는 "꼭 영구 기억해야 할 것"만 사용.

카테고리:
- decision: 대표님 결정 사항 (가격, 전략, 우선순위)
- pattern: 반복되는 패턴 (회원 행동, 시간대별)
- learning: 학습한 교훈 (실수, 성공 사례)
- issue: 미해결 이슈 (버그, 우려)
- preference: 대표님 선호 (스타일, 호칭, 작업 방식)

중요도 가이드:
- 5: 절대 영구 (사업 핵심 결정)
- 4: 영구 보관 (중요 인사이트)
- 3: 6개월 (의미있는 정보)
- 2: 1개월 (참고 사항)
- 1: 1주일 (단기 기록)

사용 예:
{
  "content": "음성 진단 가격은 ₩2,500/10분으로 확정. 1차 오픈 후 3개월 유지.",
  "category": "decision",
  "topics": ["가격", "음성진단", "1차오픈"],
  "importance": 5
}`,
  input_schema: {
    type: 'object',
    properties: {
      content: { type: 'string', description: '저장할 내용 (최대 10,000자)' },
      category: {
        type: 'string',
        enum: ['decision', 'pattern', 'learning', 'issue', 'preference'],
        description: '메모리 카테고리',
      },
      topics: {
        type: 'array',
        items: { type: 'string' },
        description: '검색용 토픽 태그 (최소 1개)',
      },
      importance: { type: 'integer', description: '중요도 1-5 (기본 4)' },
      source_conversation_id: { type: 'string', description: '출처 대화 ID (선택)' },
      source_messages: {
        type: 'array',
        items: { type: 'string' },
        description: '출처 메시지 ID들 (선택)',
      },
      expires_in_days: {
        type: 'integer',
        description: '만료까지 N일 (생략 또는 null = 영구)',
      },
    },
    required: ['content', 'category', 'topics'],
  },
};

export default saveImportantInsight;
