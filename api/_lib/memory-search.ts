// ════════════════════════════════════════════════════════════════
// 제니야 메모리 검색 라이브러리
// RAG 검색 + 최근 결정 조회 + 카테고리별 검색
// 작성: 2026-04-29
// 위치: api/_lib/memory-search.ts
// ════════════════════════════════════════════════════════════════

import { db, COLLECTIONS, Timestamp, FieldValue } from './firebase-admin.js';
import { createEmbedding, cosineSimilarity } from './openai-embedding.js';
import type { Memory } from './firebase-admin.js';

// ─── 타입 정의 ─────────────────────────────────────────────────
export type SearchResult = {
  memory: Memory;
  score: number;          // 유사도 0~1
};

export type SearchOptions = {
  topK?: number;          // 최대 결과 수 (기본 5)
  threshold?: number;     // 최소 유사도 (기본 0.7)
  category?: Memory['category'];  // 특정 카테고리만
  minImportance?: number; // 최소 중요도 (기본 1)
  daysBack?: number;      // 최근 N일 내 (기본 무제한)
};

// ─── 1. 유사 메모리 검색 (RAG 핵심) ────────────────────────────
export async function searchMemory(
  userUid: string,
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const {
    topK = 5,
    threshold = 0.7,
    category,
    minImportance = 1,
    daysBack,
  } = options;

  try {
    console.log(`[MemorySearch] 검색 시작: "${query}"`);

    // ─── 1.1 질의 임베딩 생성 ────────────────────────────────
    const queryEmbedding = await createEmbedding(query);

    // ─── 1.2 메모리 후보 조회 (필터링) ───────────────────────
    let queryRef = db
      .collection(COLLECTIONS.MEMORIES)
      .where('user_uid', '==', userUid);

    if (category) {
      queryRef = queryRef.where('category', '==', category);
    }

    if (minImportance > 1) {
      queryRef = queryRef.where('importance', '>=', minImportance);
    }

    if (daysBack) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysBack);
      queryRef = queryRef.where('created_at', '>=', Timestamp.fromDate(cutoff));
    }

    const snapshot = await queryRef.get();
    console.log(`[MemorySearch] 후보 ${snapshot.size}건`);

    if (snapshot.empty) {
      return [];
    }

    // ─── 1.3 코사인 유사도 계산 ─────────────────────────────
    const results: SearchResult[] = [];

    for (const doc of snapshot.docs) {
      const memory = doc.data() as Memory;

      if (!memory.embedding || memory.embedding.length === 0) {
        continue;   // 임베딩 없는 메모리 스킵
      }

      const score = cosineSimilarity(queryEmbedding, memory.embedding);

      if (score >= threshold) {
        results.push({ memory, score });
      }
    }

    // ─── 1.4 점수 높은 순 정렬 + topK ────────────────────────
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, topK);

    console.log(
      `[MemorySearch] 결과 ${topResults.length}건 (임계값 ${threshold} 이상)`
    );

    // ─── 1.5 접근 카운트 증가 (학습용) ────────────────────────
    await updateAccessCount(topResults.map(r => r.memory.memory_id));

    return topResults;
  } catch (error: any) {
    console.error('[MemorySearch] 검색 실패:', error.message);
    throw error;
  }
}

// ─── 2. 최근 결정 사항 조회 ────────────────────────────────────
export async function getRecentDecisions(
  userUid: string,
  daysBack: number = 7,
  limit: number = 10
): Promise<Memory[]> {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysBack);

    const snapshot = await db
      .collection(COLLECTIONS.MEMORIES)
      .where('user_uid', '==', userUid)
      .where('category', '==', 'decision')
      .where('created_at', '>=', Timestamp.fromDate(cutoff))
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => doc.data() as Memory);
  } catch (error: any) {
    console.error('[MemorySearch] 최근 결정 조회 실패:', error.message);
    throw error;
  }
}

// ─── 3. 중요한 메모리 조회 (영구 보존된 것) ────────────────────
export async function getImportantMemories(
  userUid: string,
  minImportance: number = 4,
  limit: number = 20
): Promise<Memory[]> {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.MEMORIES)
      .where('user_uid', '==', userUid)
      .where('importance', '>=', minImportance)
      .orderBy('importance', 'desc')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => doc.data() as Memory);
  } catch (error: any) {
    console.error('[MemorySearch] 중요 메모리 조회 실패:', error.message);
    throw error;
  }
}

// ─── 4. 카테고리별 메모리 조회 ─────────────────────────────────
export async function getMemoriesByCategory(
  userUid: string,
  category: Memory['category'],
  limit: number = 10
): Promise<Memory[]> {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.MEMORIES)
      .where('user_uid', '==', userUid)
      .where('category', '==', category)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => doc.data() as Memory);
  } catch (error: any) {
    console.error('[MemorySearch] 카테고리 조회 실패:', error.message);
    throw error;
  }
}

// ─── 5. 토픽으로 메모리 조회 ───────────────────────────────────
export async function getMemoriesByTopic(
  userUid: string,
  topic: string,
  limit: number = 10
): Promise<Memory[]> {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.MEMORIES)
      .where('user_uid', '==', userUid)
      .where('topics', 'array-contains', topic)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => doc.data() as Memory);
  } catch (error: any) {
    console.error('[MemorySearch] 토픽 조회 실패:', error.message);
    throw error;
  }
}

// ─── 6. 메모리 접근 카운트 업데이트 ────────────────────────────
async function updateAccessCount(memoryIds: string[]): Promise<void> {
  if (memoryIds.length === 0) return;

  try {
    const batch = db.batch();
    const now = Timestamp.now();

    for (const id of memoryIds) {
      const ref = db.collection(COLLECTIONS.MEMORIES).doc(id);
      batch.update(ref, {
        last_accessed_at: now,
        access_count: FieldValue.increment(1),
      });
    }

    await batch.commit();
  } catch (error: any) {
    // 카운트 업데이트는 실패해도 검색은 계속 진행
    console.warn('[MemorySearch] 접근 카운트 업데이트 실패:', error.message);
  }
}

// ─── 7. 메모리 통계 ─────────────────────────────────────────────
export async function getMemoryStats(userUid: string): Promise<{
  total: number;
  byCategory: Record<string, number>;
  byImportance: Record<number, number>;
}> {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.MEMORIES)
      .where('user_uid', '==', userUid)
      .get();

    const stats = {
      total: snapshot.size,
      byCategory: {} as Record<string, number>,
      byImportance: {} as Record<number, number>,
    };

    snapshot.docs.forEach(doc => {
      const memory = doc.data() as Memory;
      stats.byCategory[memory.category] = (stats.byCategory[memory.category] || 0) + 1;
      stats.byImportance[memory.importance] = (stats.byImportance[memory.importance] || 0) + 1;
    });

    return stats;
  } catch (error: any) {
    console.error('[MemorySearch] 통계 조회 실패:', error.message);
    throw error;
  }
}

// ─── 8. 내보내기 ───────────────────────────────────────────────
export default {
  searchMemory,
  getRecentDecisions,
  getImportantMemories,
  getMemoriesByCategory,
  getMemoriesByTopic,
  getMemoryStats,
};
