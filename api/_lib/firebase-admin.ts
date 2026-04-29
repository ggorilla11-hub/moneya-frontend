// ════════════════════════════════════════════════════════════════
// 제니야 Firebase Admin 라이브러리
// Firestore Admin SDK 통합 (서버 측 전용)
// 작성: 2026-04-29
// 위치: api/_lib/firebase-admin.ts
// ════════════════════════════════════════════════════════════════

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

// ─── 환경 변수 검증 ────────────────────────────────────────────
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountKey) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY 환경 변수가 설정되지 않았습니다.');
}

// ─── Firebase Admin 초기화 (싱글톤) ────────────────────────────
let app: App;

if (getApps().length === 0) {
  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  } catch (error: any) {
    throw new Error(`Firebase Admin 초기화 실패: ${error.message}`);
  }
} else {
  app = getApps()[0];
}

// ─── Firestore 인스턴스 ────────────────────────────────────────
export const db: Firestore = getFirestore(app);

// ─── 컬렉션 상수 ───────────────────────────────────────────────
export const COLLECTIONS = {
  CONVERSATIONS: 'manager_conversations',
  MEMORIES: 'manager_memories',
  SUMMARIES: 'manager_summaries',
  FACTS: 'manager_facts',
} as const;

// ─── 타입 정의 ─────────────────────────────────────────────────
export type Conversation = {
  conversation_id: string;
  user_uid: string;
  started_at: Timestamp;
  last_message_at: Timestamp;
  ended_at: Timestamp | null;
  title: string;
  summary: string;
  topics: string[];
  message_count: number;
  total_tokens: number;
  channel: 'text' | 'voice' | 'voice_to_text';
  importance: number;       // 1-5
  archived: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type Message = {
  message_id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: Timestamp;
  tokens: { input: number; output: number };
  tool_calls: any[];
  attachments: any[];
  user_feedback: 'good' | 'bad' | null;
  notes: string | null;
};

export type Memory = {
  memory_id: string;
  user_uid: string;
  source_conversation_id: string;
  source_messages: string[];
  content: string;
  category: 'decision' | 'pattern' | 'learning' | 'issue' | 'preference';
  topics: string[];
  importance: number;       // 1-5
  embedding: number[];      // 1536차원
  created_at: Timestamp;
  last_accessed_at: Timestamp;
  access_count: number;
  expires_at: Timestamp | null;
  related_memories: string[];
  verified_by_user: boolean;
  updated_at: Timestamp;
};

// ─── 1. 대화 조회 ──────────────────────────────────────────────
export async function getConversation(
  conversationId: string
): Promise<Conversation | null> {
  try {
    const doc = await db.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId).get();
    if (!doc.exists) return null;
    return doc.data() as Conversation;
  } catch (error: any) {
    console.error('[Firestore] getConversation 에러:', error.message);
    throw error;
  }
}

// ─── 2. 어제 대화 목록 조회 (압축 작업용) ──────────────────────
export async function getYesterdayConversations(
  userUid: string
): Promise<Conversation[]> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snapshot = await db
      .collection(COLLECTIONS.CONVERSATIONS)
      .where('user_uid', '==', userUid)
      .where('last_message_at', '>=', Timestamp.fromDate(yesterday))
      .where('last_message_at', '<', Timestamp.fromDate(today))
      .get();

    return snapshot.docs.map(doc => doc.data() as Conversation);
  } catch (error: any) {
    console.error('[Firestore] getYesterdayConversations 에러:', error.message);
    throw error;
  }
}

// ─── 3. 대화의 메시지 모두 조회 ────────────────────────────────
export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.CONVERSATIONS)
      .doc(conversationId)
      .collection('messages')
      .orderBy('created_at', 'asc')
      .get();

    return snapshot.docs.map(doc => doc.data() as Message);
  } catch (error: any) {
    console.error('[Firestore] getConversationMessages 에러:', error.message);
    throw error;
  }
}

// ─── 4. 메모리 저장 ────────────────────────────────────────────
export async function saveMemory(
  memory: Omit<Memory, 'memory_id' | 'created_at' | 'updated_at' | 'last_accessed_at' | 'access_count'>
): Promise<string> {
  try {
    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = Timestamp.now();

    await db.collection(COLLECTIONS.MEMORIES).doc(memoryId).set({
      ...memory,
      memory_id: memoryId,
      created_at: now,
      updated_at: now,
      last_accessed_at: now,
      access_count: 0,
    });

    return memoryId;
  } catch (error: any) {
    console.error('[Firestore] saveMemory 에러:', error.message);
    throw error;
  }
}

// ─── 5. 만료 메모리 정리 ───────────────────────────────────────
export async function cleanupExpiredMemories(): Promise<number> {
  try {
    const now = Timestamp.now();
    const snapshot = await db
      .collection(COLLECTIONS.MEMORIES)
      .where('expires_at', '<=', now)
      .get();

    if (snapshot.empty) return 0;

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return snapshot.size;
  } catch (error: any) {
    console.error('[Firestore] cleanupExpiredMemories 에러:', error.message);
    throw error;
  }
}

// ─── 6. 일일 요약 저장 ─────────────────────────────────────────
export async function saveSummary(params: {
  type: 'daily' | 'weekly' | 'monthly';
  date: string;     // YYYY-MM-DD
  data: any;
}): Promise<string> {
  try {
    const summaryId = `sum_${params.date}_${params.type}`;
    await db.collection(COLLECTIONS.SUMMARIES).doc(summaryId).set({
      summary_id: summaryId,
      type: params.type,
      date: params.date,
      ...params.data,
      created_at: Timestamp.now(),
    });
    return summaryId;
  } catch (error: any) {
    console.error('[Firestore] saveSummary 에러:', error.message);
    throw error;
  }
}

// ─── 7. 만료 시점 계산 (중요도 기반) ───────────────────────────
export function calculateExpiry(importance: number): Timestamp | null {
  // 5, 4: 영구 보존
  if (importance >= 4) return null;

  const now = new Date();
  let days: number;

  switch (importance) {
    case 3: days = 365; break;      // 1년
    case 2: days = 90; break;       // 90일
    case 1: days = 30; break;       // 30일
    default: days = 90;
  }

  now.setDate(now.getDate() + days);
  return Timestamp.fromDate(now);
}

// ─── 8. 내보내기 ───────────────────────────────────────────────
export default {
  db,
  COLLECTIONS,
  getConversation,
  getYesterdayConversations,
  getConversationMessages,
  saveMemory,
  cleanupExpiredMemories,
  saveSummary,
  calculateExpiry,
  FieldValue,
  Timestamp,
};
