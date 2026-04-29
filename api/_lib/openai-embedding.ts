// ════════════════════════════════════════════════════════════════
// 제니야 OpenAI 임베딩 라이브러리
// text-embedding-3-small (1536차원, 비용 $0.02/1M tokens)
// 작성: 2026-04-29
// 위치: api/_lib/openai-embedding.ts
// ════════════════════════════════════════════════════════════════

import OpenAI from 'openai';

// ─── 환경 변수 검증 ────────────────────────────────────────────
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
}

// ─── OpenAI 클라이언트 ─────────────────────────────────────────
const openai = new OpenAI({
  apiKey: apiKey,
});

// ─── 모델 상수 ─────────────────────────────────────────────────
export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSION = 1536;

// ─── 1. 텍스트 임베딩 생성 ─────────────────────────────────────
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    // 텍스트 길이 제한 (8191 토큰 = 약 32,000자)
    const truncated = text.substring(0, 30000);

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: truncated,
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('임베딩 응답이 비어있습니다.');
    }

    return response.data[0].embedding;
  } catch (error: any) {
    console.error('[OpenAI Embedding] 에러:', error.message);
    throw new Error(`임베딩 생성 실패: ${error.message}`);
  }
}

// ─── 2. 배치 임베딩 생성 (여러 텍스트) ─────────────────────────
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    if (texts.length === 0) return [];
    if (texts.length > 100) {
      throw new Error('한 번에 100개 이상의 임베딩 요청 불가');
    }

    const truncated = texts.map(t => t.substring(0, 30000));

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: truncated,
    });

    return response.data.map(item => item.embedding);
  } catch (error: any) {
    console.error('[OpenAI Embedding] 배치 에러:', error.message);
    throw new Error(`배치 임베딩 생성 실패: ${error.message}`);
  }
}

// ─── 3. 코사인 유사도 계산 ─────────────────────────────────────
export function cosineSimilarity(
  vec1: number[],
  vec2: number[]
): number {
  if (vec1.length !== vec2.length) {
    throw new Error(`벡터 차원 불일치: ${vec1.length} vs ${vec2.length}`);
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

// ─── 4. 비용 계산 ──────────────────────────────────────────────
export function calculateEmbeddingCost(textLength: number): number {
  // 단위: USD
  // text-embedding-3-small: $0.02 / 1M tokens
  // 추정: 1 토큰 = 약 2.5 한글/영문 글자
  const tokens = Math.ceil(textLength / 2.5);
  const costPerMillion = 0.02;
  return (tokens / 1_000_000) * costPerMillion;
}

// ─── 5. 임베딩 검색 (메모리 검색용) ────────────────────────────
export async function findSimilarMemories(
  query: string,
  memories: Array<{ embedding: number[]; [key: string]: any }>,
  topK: number = 5,
  threshold: number = 0.7
): Promise<Array<{ score: number; [key: string]: any }>> {
  try {
    // 질의 임베딩 생성
    const queryEmbedding = await createEmbedding(query);

    // 모든 메모리와 유사도 계산
    const scored = memories.map(memory => ({
      ...memory,
      score: cosineSimilarity(queryEmbedding, memory.embedding),
    }));

    // 임계값 이상만 필터 + 점수 높은 순 정렬 + topK 추출
    return scored
      .filter(item => item.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  } catch (error: any) {
    console.error('[OpenAI Embedding] 검색 에러:', error.message);
    throw error;
  }
}

// ─── 6. 내보내기 ───────────────────────────────────────────────
export default {
  createEmbedding,
  createEmbeddings,
  cosineSimilarity,
  calculateEmbeddingCost,
  findSimilarMemories,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSION,
};
