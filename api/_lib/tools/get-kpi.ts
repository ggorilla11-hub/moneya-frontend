// ════════════════════════════════════════════════════════════════
// 제니야 KPI 도구
// 일일/주간/월간 KPI 자동 계산 + 트렌드 분석
// 작성: 2026-04-30
// 위치: api/_lib/tools/get-kpi.ts
// ════════════════════════════════════════════════════════════════

import { db, Timestamp } from '../firebase-admin.js';

// ─── KPI 기간 타입 ─────────────────────────────────────────────
type KPIPeriod = 'today' | 'yesterday' | 'last_7_days' | 'this_month' | 'last_month';

type KPIResult = {
  period: KPIPeriod;
  date_range: { start: string; end: string };
  metrics: {
    new_users: number;
    paid_users: number;
    revenue: number;
    hot_leads_total: number;
    hot_leads_resolved: number;
    hot_leads_pending: number;
    conversion_rate: number; // 결제 전환율 %
  };
  comparison?: {
    previous_period: any;
    change_pct: any;
  };
};

// ─── 기간 계산 ─────────────────────────────────────────────────
function getDateRange(period: KPIPeriod): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today': {
      const end = new Date(today);
      end.setDate(end.getDate() + 1);
      return { start: today, end };
    }
    case 'yesterday': {
      const start = new Date(today);
      start.setDate(start.getDate() - 1);
      return { start, end: today };
    }
    case 'last_7_days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      return { start, end: today };
    }
    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end: now };
    }
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end };
    }
  }
}

// ─── 메트릭 계산 ───────────────────────────────────────────────
async function calculateMetrics(
  start: Date,
  end: Date
): Promise<KPIResult['metrics']> {
  const startTs = Timestamp.fromDate(start);
  const endTs = Timestamp.fromDate(end);
  
  // 신규 가입자
  const newUsersSnap = await db
    .collection('users')
    .where('created_at', '>=', startTs)
    .where('created_at', '<', endTs)
    .get();
  
  // 결제 (paid 상태만)
  const paymentsSnap = await db
    .collection('payments')
    .where('paid_at', '>=', startTs)
    .where('paid_at', '<', endTs)
    .where('status', '==', 'paid')
    .get();
  
  let totalRevenue = 0;
  paymentsSnap.docs.forEach(doc => {
    const amount = doc.data().amount || 0;
    totalRevenue += amount;
  });
  
  // 핫리드
  const hotLeadsSnap = await db
    .collection('hot_leads')
    .where('created_at', '>=', startTs)
    .where('created_at', '<', endTs)
    .get();
  
  let resolvedCount = 0;
  let pendingCount = 0;
  hotLeadsSnap.docs.forEach(doc => {
    const status = doc.data().status || 'new';
    if (status === 'resolved' || status === 'responded') {
      resolvedCount++;
    } else {
      pendingCount++;
    }
  });
  
  const newUsers = newUsersSnap.size;
  const paidUsers = paymentsSnap.size;
  const conversionRate = newUsers > 0 ? (paidUsers / newUsers) * 100 : 0;
  
  return {
    new_users: newUsers,
    paid_users: paidUsers,
    revenue: totalRevenue,
    hot_leads_total: hotLeadsSnap.size,
    hot_leads_resolved: resolvedCount,
    hot_leads_pending: pendingCount,
    conversion_rate: Math.round(conversionRate * 10) / 10,
  };
}

// ─── 메인 KPI 함수 ─────────────────────────────────────────────
export async function getKPI(params: {
  period: KPIPeriod;
  compareWith?: 'previous';
}): Promise<{
  success: boolean;
  result?: KPIResult;
  error?: string;
}> {
  try {
    const { start, end } = getDateRange(params.period);
    
    console.log(`[getKPI] ${params.period} 계산: ${start.toISOString()} ~ ${end.toISOString()}`);
    
    // 현재 기간 메트릭
    const currentMetrics = await calculateMetrics(start, end);
    
    const result: KPIResult = {
      period: params.period,
      date_range: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      metrics: currentMetrics,
    };
    
    // 비교 (선택)
    if (params.compareWith === 'previous') {
      const duration = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - duration);
      const prevEnd = new Date(start);
      
      const previousMetrics = await calculateMetrics(prevStart, prevEnd);
      
      // 변화율 계산
      const changePct: any = {};
      for (const key of Object.keys(currentMetrics) as Array<keyof typeof currentMetrics>) {
        const current = currentMetrics[key];
        const previous = previousMetrics[key];
        if (previous === 0) {
          changePct[key] = current > 0 ? 100 : 0;
        } else {
          changePct[key] = Math.round(((current - previous) / previous) * 100 * 10) / 10;
        }
      }
      
      result.comparison = {
        previous_period: previousMetrics,
        change_pct: changePct,
      };
    }
    
    console.log(`[getKPI] 완료:`, result.metrics);
    
    return { success: true, result };
  } catch (error: any) {
    console.error('[getKPI] 에러:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ─── Claude Tool Use 정의 ──────────────────────────────────────
export const getKPITool = {
  name: 'getKPI',
  description: `사업 KPI를 조회합니다. 기간별 신규 가입, 결제, 매출, 핫리드 통계 + 전 기간 대비 변화율.

사용 예시:
- 오늘 KPI: period='today'
- 어제 vs 그저께: period='yesterday', compareWith='previous'
- 이번 주 vs 지난 주: period='last_7_days', compareWith='previous'
- 이번 달: period='this_month', compareWith='previous'`,
  input_schema: {
    type: 'object',
    properties: {
      period: {
        type: 'string',
        enum: ['today', 'yesterday', 'last_7_days', 'this_month', 'last_month'],
        description: 'KPI 조회 기간',
      },
      compareWith: {
        type: 'string',
        enum: ['previous'],
        description: '전 기간 비교 (선택)',
      },
    },
    required: ['period'],
  },
};

export default getKPI;
