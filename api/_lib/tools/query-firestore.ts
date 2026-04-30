// ════════════════════════════════════════════════════════════════
// 제니야 Firestore 쿼리 도구
// 안전한 컬렉션 조회 - 화이트리스트 기반
// 작성: 2026-04-30
// 위치: api/_lib/tools/query-firestore.ts
// ════════════════════════════════════════════════════════════════

import { db, Timestamp } from '../firebase-admin.js';

// ─── 안전 화이트리스트 ─────────────────────────────────────────
// 제니야가 접근 가능한 컬렉션만 명시
const ALLOWED_COLLECTIONS = [
  'users',
  'consultations',
  'payments',
  'subscriptions',
  'hot_leads',
  'ai_diagnoses',
  'fp_members',
  'attendance_records',
  'desire_progress',
  'manager_conversations',  // 제니야 자신 대화
  'manager_memories',        // 제니야 메모리
  'manager_summaries',       // 제니야 요약
] as const;

type AllowedCollection = typeof ALLOWED_COLLECTIONS[number];

// ─── 시간 표현 파싱 ────────────────────────────────────────────
function parseTimeExpression(expr: string): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (expr.toLowerCase()) {
    case 'today':
    case '오늘': {
      const end = new Date(today);
      end.setDate(end.getDate() + 1);
      return { start: today, end };
    }
    case 'yesterday':
    case '어제': {
      const start = new Date(today);
      start.setDate(start.getDate() - 1);
      return { start, end: today };
    }
    case 'this_week':
    case '이번주': {
      const start = new Date(today);
      start.setDate(start.getDate() - today.getDay()); // 일요일 시작
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { start, end };
    }
    case 'last_week':
    case '지난주': {
      const start = new Date(today);
      start.setDate(start.getDate() - today.getDay() - 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { start, end };
    }
    case 'this_month':
    case '이번달': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { start, end };
    }
    case 'last_month':
    case '지난달': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end };
    }
    default: {
      // 7일 (기본)
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      return { start, end: today };
    }
  }
}

// ─── 쿼리 옵션 타입 ────────────────────────────────────────────
export type QueryFirestoreParams = {
  collection: AllowedCollection;
  
  // 시간 필터 (선택)
  timeRange?: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month';
  timeField?: string;  // 기본: 'created_at'
  
  // 필드 필터 (선택)
  whereField?: string;
  whereOp?: '==' | '!=' | '<' | '<=' | '>' | '>=';
  whereValue?: any;
  
  // 정렬 (선택)
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  
  // 제한
  limit?: number;  // 기본: 20, 최대: 100
};

// ─── 메인 쿼리 함수 ────────────────────────────────────────────
export async function queryFirestore(
  params: QueryFirestoreParams
): Promise<{
  success: boolean;
  count: number;
  data: any[];
  error?: string;
}> {
  try {
    // 보안: 화이트리스트 검증
    if (!ALLOWED_COLLECTIONS.includes(params.collection)) {
      return {
        success: false,
        count: 0,
        data: [],
        error: `보안 정책: '${params.collection}' 컬렉션 접근 불가`,
      };
    }
    
    // 제한 검증
    const limit = Math.min(params.limit || 20, 100);
    
    // 쿼리 구성
    let query: any = db.collection(params.collection);
    
    // 시간 필터 적용
    if (params.timeRange) {
      const { start, end } = parseTimeExpression(params.timeRange);
      const timeField = params.timeField || 'created_at';
      query = query
        .where(timeField, '>=', Timestamp.fromDate(start))
        .where(timeField, '<', Timestamp.fromDate(end));
    }
    
    // 필드 필터 적용
    if (params.whereField && params.whereOp && params.whereValue !== undefined) {
      query = query.where(params.whereField, params.whereOp, params.whereValue);
    }
    
    // 정렬 적용
    if (params.orderBy) {
      query = query.orderBy(params.orderBy, params.orderDirection || 'desc');
    }
    
    // 제한 적용
    query = query.limit(limit);
    
    // 실행
    console.log(`[queryFirestore] ${params.collection} 조회 중...`);
    const snapshot = await query.get();
    
    // 결과 변환 (Timestamp → ISO String)
    const data = snapshot.docs.map((doc: any) => {
      const raw = doc.data();
      const cleaned: any = { id: doc.id };
      
      for (const [key, value] of Object.entries(raw)) {
        if (value instanceof Timestamp) {
          cleaned[key] = value.toDate().toISOString();
        } else {
          cleaned[key] = value;
        }
      }
      
      return cleaned;
    });
    
    console.log(`[queryFirestore] ${data.length}건 조회 완료`);
    
    return {
      success: true,
      count: data.length,
      data,
    };
  } catch (error: any) {
    console.error('[queryFirestore] 에러:', error.message);
    return {
      success: false,
      count: 0,
      data: [],
      error: error.message,
    };
  }
}

// ─── Claude Tool Use 정의 ──────────────────────────────────────
// Claude가 이 도구를 호출할 때 사용할 스키마
export const queryFirestoreTool = {
  name: 'queryFirestore',
  description: `Firestore 데이터베이스에서 안전하게 데이터를 조회합니다.
사용 가능한 컬렉션: users, consultations, payments, subscriptions, hot_leads, ai_diagnoses, fp_members, attendance_records, desire_progress, manager_conversations, manager_memories, manager_summaries

예시:
- 어제 가입한 사용자: collection='users', timeRange='yesterday', timeField='created_at'
- 활성 Silver 구독자: collection='users', whereField='silver_active', whereOp='==', whereValue=true
- 최근 핫리드 10건: collection='hot_leads', orderBy='created_at', limit=10`,
  input_schema: {
    type: 'object',
    properties: {
      collection: {
        type: 'string',
        enum: ALLOWED_COLLECTIONS,
        description: '조회할 컬렉션',
      },
      timeRange: {
        type: 'string',
        enum: ['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month'],
        description: '시간 범위 (선택)',
      },
      timeField: {
        type: 'string',
        description: '시간 필터 적용할 필드 (기본: created_at)',
      },
      whereField: {
        type: 'string',
        description: '필터 필드 이름',
      },
      whereOp: {
        type: 'string',
        enum: ['==', '!=', '<', '<=', '>', '>='],
        description: '필터 연산자',
      },
      whereValue: {
        description: '필터 값 (다양한 타입 가능)',
      },
      orderBy: {
        type: 'string',
        description: '정렬 필드',
      },
      orderDirection: {
        type: 'string',
        enum: ['asc', 'desc'],
        description: '정렬 방향 (기본: desc)',
      },
      limit: {
        type: 'number',
        description: '최대 결과 수 (기본: 20, 최대: 100)',
      },
    },
    required: ['collection'],
  },
};

export default queryFirestore;
