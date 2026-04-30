// ════════════════════════════════════════════════════════════════
// 제니야 메모리 검색 도구
// 위험도: LOW (읽기만, 자동 실행 가능)
// 작성: 2026-04-30
// 위치: api/_lib/tools/search-memory.ts
//
// 기존 memory-search.ts의 함수들을 도구로 래핑
// ════════════════════════════════════════════════════════════════

import {
  searchMemory as searchMemoryLib,
  getRecentDecisions,
  getImportantMemories,
  getMemoriesByCategory,
  getMemoriesByTopic,
} from '../memory-search.js';
import { getAdminUid } from '../auth.js';

type SearchMode = 
  | 'similar'         // RAG 유사도 검색 (질의에 대한 의미 유사 메모리)
  | 'recent_decisions'// 최근 결정 사항
  | 'important'       // 중요한 메모리 (영구 보존)
  | 'by_category'     // 카테고리별
  | 'by_topic';       // 토픽별

export async function searchMemory(params: {
  mode: SearchMode;
  query?: string;            // similar 모드에서 필수
  category?: 'decision' | 'pattern' | 'learning' | 'issue' | 'preference';
  topic?: string;            // by_topic에서 필수
  days_back?: number;        // recent_decisions, similar 모드
  min_importance?: number;   // 1-5
  limit?: number;            // 결과 개수 (기본 10)
}): Promise<{
  success: boolean;
  result?: {
    mode: string;
    count: number;
    memories: Array<{
      memory_id: string;
      content: string;
      category: string;
      topics: string[];
      importance: number;
      score?: number;        // similar 모드만
      created_at: string;
    }>;
  };
  error?: string;
}> {
  try {
    const userUid = getAdminUid();
    const limit = params.limit || 10;

    let memories: any[] = [];

    switch (params.mode) {
      case 'similar':
        if (!params.query) {
          return { success: false, error: 'similar 모드는 query 필수' };
        }
        const results = await searchMemoryLib(userUid, params.query, {
          topK: limit,
          threshold: 0.6,  // 0.7보다 약간 낮춰서 더 많이 가져옴
          category: params.category,
          minImportance: params.min_importance || 1,
          daysBack: params.days_back,
        });
        memories = results.map(r => ({
          memory_id: r.memory.memory_id,
          content: r.memory.content,
          category: r.memory.category,
          topics: r.memory.topics,
          importance: r.memory.importance,
          score: Math.round(r.score * 100) / 100,
          created_at: r.memory.created_at?.toDate?.()?.toISOString() || '',
        }));
        break;

      case 'recent_decisions':
        const decisions = await getRecentDecisions(
          userUid,
          params.days_back || 7,
          limit
        );
        memories = decisions.map(m => ({
          memory_id: m.memory_id,
          content: m.content,
          category: m.category,
          topics: m.topics,
          importance: m.importance,
          created_at: m.created_at?.toDate?.()?.toISOString() || '',
        }));
        break;

      case 'important':
        const important = await getImportantMemories(
          userUid,
          params.min_importance || 4,
          limit
        );
        memories = important.map(m => ({
          memory_id: m.memory_id,
          content: m.content,
          category: m.category,
          topics: m.topics,
          importance: m.importance,
          created_at: m.created_at?.toDate?.()?.toISOString() || '',
        }));
        break;

      case 'by_category':
        if (!params.category) {
          return { success: false, error: 'by_category 모드는 category 필수' };
        }
        const byCat = await getMemoriesByCategory(
          userUid,
          params.category,
          limit
        );
        memories = byCat.map(m => ({
          memory_id: m.memory_id,
          content: m.content,
          category: m.category,
          topics: m.topics,
          importance: m.importance,
          created_at: m.created_at?.toDate?.()?.toISOString() || '',
        }));
        break;

      case 'by_topic':
        if (!params.topic) {
          return { success: false, error: 'by_topic 모드는 topic 필수' };
        }
        const byTopic = await getMemoriesByTopic(
          userUid,
          params.topic,
          limit
        );
        memories = byTopic.map(m => ({
          memory_id: m.memory_id,
          content: m.content,
          category: m.category,
          topics: m.topics,
          importance: m.importance,
          created_at: m.created_at?.toDate?.()?.toISOString() || '',
        }));
        break;

      default:
        return {
          success: false,
          error: `알 수 없는 모드: ${params.mode}`,
        };
    }

    console.log(`[searchMemory] ${params.mode}: ${memories.length}건 조회`);

    return {
      success: true,
      result: {
        mode: params.mode,
        count: memories.length,
        memories: memories,
      },
    };
  } catch (error: any) {
    console.error('[searchMemory] 에러:', error.message);
    return { success: false, error: error.message };
  }
}

export const searchMemoryTool = {
  name: 'searchMemory',
  description: `과거 메모리(대화, 결정, 학습)를 검색합니다 (LOW 위험도, 자동 실행).

5가지 모드:
- similar: RAG 의미 유사 검색 (query 필수) - "은퇴 자금에 대해 뭐라고 했지?"
- recent_decisions: 최근 결정 사항 (days_back 선택)
- important: 중요한 영구 메모리 (min_importance 4 이상)
- by_category: 카테고리별 (category 필수: decision/pattern/learning/issue/preference)
- by_topic: 토픽별 (topic 필수)

사용 예:
- {"mode": "similar", "query": "음성 진단 가격"}
- {"mode": "recent_decisions", "days_back": 7}
- {"mode": "important"}
- {"mode": "by_category", "category": "decision"}
- {"mode": "by_topic", "topic": "Phase 8"}`,
  input_schema: {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        enum: ['similar', 'recent_decisions', 'important', 'by_category', 'by_topic'],
        description: '검색 모드',
      },
      query: { type: 'string', description: 'similar 모드 필수' },
      category: {
        type: 'string',
        enum: ['decision', 'pattern', 'learning', 'issue', 'preference'],
        description: '메모리 카테고리',
      },
      topic: { type: 'string', description: 'by_topic 모드 필수' },
      days_back: { type: 'integer', description: '최근 N일 (기본 7)' },
      min_importance: { type: 'integer', description: '최소 중요도 1-5 (기본 1)' },
      limit: { type: 'integer', description: '결과 개수 (기본 10)' },
    },
    required: ['mode'],
  },
};

export default searchMemory;
