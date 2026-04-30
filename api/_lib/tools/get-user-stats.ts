// ════════════════════════════════════════════════════════════════
// 제니야 사용자 통계 도구
// DESIRE 단계 분포, 출석률, FP 활동, 페르소나 분석
// 작성: 2026-04-30
// 위치: api/_lib/tools/get-user-stats.ts
// ════════════════════════════════════════════════════════════════

import { db } from '../firebase-admin.js';

// ─── 통계 타입 ─────────────────────────────────────────────────
type UserStatsType = 
  | 'desire_distribution'   // DESIRE 단계 분포
  | 'attendance_overview'   // 출석 현황
  | 'subscription_status'   // 구독 현황
  | 'fp_activity'           // FP 활동
  | 'overall_summary';      // 전체 요약

// ─── DESIRE 분포 ───────────────────────────────────────────────
async function getDesireDistribution() {
  const snapshot = await db.collection('users').get();
  
  const distribution: Record<string, number> = {
    D: 0, E: 0, S: 0, I: 0, R: 0, E2: 0,  // E는 두 가지 (Emergency, Economic Freedom)
    unknown: 0,
  };
  
  snapshot.docs.forEach(doc => {
    const stage = doc.data().desire_stage || 'unknown';
    if (stage in distribution) {
      distribution[stage]++;
    } else {
      distribution.unknown++;
    }
  });
  
  return {
    total_users: snapshot.size,
    by_stage: distribution,
    insights: generateDesireInsights(distribution, snapshot.size),
  };
}

function generateDesireInsights(dist: Record<string, number>, total: number) {
  if (total === 0) return ['데이터 없음'];
  
  const insights: string[] = [];
  const dStage = ((dist.D || 0) / total) * 100;
  const eStage = ((dist.E || 0) / total) * 100;
  
  if (dStage > 50) {
    insights.push(`D 단계 ${dStage.toFixed(0)}% - 부채 청산 콘텐츠 강화 필요`);
  }
  if (eStage > 30) {
    insights.push(`E 단계 ${eStage.toFixed(0)}% - 비상자금 가이드 인기 가능성`);
  }
  
  return insights.length > 0 ? insights : ['특이 패턴 없음'];
}

// ─── 출석 현황 ─────────────────────────────────────────────────
async function getAttendanceOverview() {
  const snapshot = await db.collection('users').get();
  
  let totalStreaks = 0;
  let activeUsers = 0;
  let inactiveUsers = 0;
  const streakDistribution: Record<string, number> = {
    '0': 0,
    '1-7': 0,
    '8-30': 0,
    '31-100': 0,
    '100+': 0,
  };
  
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const streak = data.attendance_streak || 0;
    const lastLogin = data.last_login;
    
    totalStreaks += streak;
    
    // 활성/비활성 (최근 7일 내 로그인)
    if (lastLogin && lastLogin.toDate().getTime() > oneWeekAgo) {
      activeUsers++;
    } else {
      inactiveUsers++;
    }
    
    // 스트릭 분포
    if (streak === 0) streakDistribution['0']++;
    else if (streak <= 7) streakDistribution['1-7']++;
    else if (streak <= 30) streakDistribution['8-30']++;
    else if (streak <= 100) streakDistribution['31-100']++;
    else streakDistribution['100+']++;
  });
  
  return {
    total_users: snapshot.size,
    active_users_7days: activeUsers,
    inactive_users: inactiveUsers,
    avg_streak: snapshot.size > 0 ? Math.round(totalStreaks / snapshot.size * 10) / 10 : 0,
    streak_distribution: streakDistribution,
  };
}

// ─── 구독 현황 ─────────────────────────────────────────────────
async function getSubscriptionStatus() {
  const snapshot = await db.collection('users').get();
  
  const stats = {
    total: snapshot.size,
    silver: 0,
    gold: 0,
    monthly_4900: 0,
    free_users: 0,
    credit_users: 0,
    total_mrr: 0, // Monthly Recurring Revenue
  };
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    
    if (data.silver_active) {
      stats.silver++;
      stats.total_mrr += 9900;
    } else if (data.gold_active) {
      stats.gold++;
      // Gold는 99,900 일회성, MRR 계산 X
    } else if (data.monthly_4900_active) {
      stats.monthly_4900++;
      stats.total_mrr += 4900;
    } else {
      stats.free_users++;
    }
    
    if ((data.credit_balance || 0) > 0) {
      stats.credit_users++;
    }
  });
  
  return stats;
}

// ─── FP 활동 ───────────────────────────────────────────────────
async function getFPActivity() {
  const snapshot = await db.collection('fp_members').get();
  
  let activeFPs = 0;
  const byPlan = { fp_bronze: 0, fp_silver: 0 };
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.active) activeFPs++;
    if (data.plan === 'fp_bronze') byPlan.fp_bronze++;
    else if (data.plan === 'fp_silver') byPlan.fp_silver++;
  });
  
  return {
    total_fps: snapshot.size,
    active_fps: activeFPs,
    by_plan: byPlan,
    mrr_from_fps: byPlan.fp_bronze * 33000 + byPlan.fp_silver * 99000,
  };
}

// ─── 전체 요약 ─────────────────────────────────────────────────
async function getOverallSummary() {
  const [desire, attendance, subscription, fps] = await Promise.all([
    getDesireDistribution(),
    getAttendanceOverview(),
    getSubscriptionStatus(),
    getFPActivity(),
  ]);
  
  return {
    desire_distribution: desire,
    attendance: attendance,
    subscription: subscription,
    fp_activity: fps,
    business_health: {
      total_mrr_krw: subscription.total_mrr + fps.mrr_from_fps,
      active_user_pct: attendance.total_users > 0 
        ? Math.round((attendance.active_users_7days / attendance.total_users) * 100) 
        : 0,
    },
  };
}

// ─── 메인 함수 ─────────────────────────────────────────────────
export async function getUserStats(params: {
  type: UserStatsType;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    console.log(`[getUserStats] ${params.type} 계산 중...`);
    
    let data;
    switch (params.type) {
      case 'desire_distribution':
        data = await getDesireDistribution();
        break;
      case 'attendance_overview':
        data = await getAttendanceOverview();
        break;
      case 'subscription_status':
        data = await getSubscriptionStatus();
        break;
      case 'fp_activity':
        data = await getFPActivity();
        break;
      case 'overall_summary':
        data = await getOverallSummary();
        break;
      default:
        return {
          success: false,
          error: `알 수 없는 통계 유형: ${params.type}`,
        };
    }
    
    console.log(`[getUserStats] 완료`);
    
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('[getUserStats] 에러:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ─── Claude Tool Use 정의 ──────────────────────────────────────
export const getUserStatsTool = {
  name: 'getUserStats',
  description: `사용자 통계를 조회합니다.

유형:
- desire_distribution: DESIRE 6단계 사용자 분포 + 인사이트
- attendance_overview: 출석률, 스트릭 분포, 활성 사용자
- subscription_status: 구독 현황 (Silver/Gold/월구독), MRR
- fp_activity: FP 활동 (Bronze/Silver, MRR)
- overall_summary: 위 모든 것 + 사업 건강도`,
  input_schema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: [
          'desire_distribution',
          'attendance_overview',
          'subscription_status',
          'fp_activity',
          'overall_summary',
        ],
        description: '통계 유형',
      },
    },
    required: ['type'],
  },
};

export default getUserStats;
