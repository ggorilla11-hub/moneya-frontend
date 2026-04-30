// ════════════════════════════════════════════════════════════════
// 제니야 주간 KPI 보고 Cron Job
// 매주 월요일 09:00 (KST) 자동 실행
// 대표님께 지난주 종합 분석 카톡 발송
// 작성: 2026-04-30
// 위치: api/cron/weekly-kpi.ts
// ════════════════════════════════════════════════════════════════

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyCronSecret, unauthorizedResponse } from '../_lib/auth.js';
import getKPI from '../_lib/tools/get-kpi.js';
import getUserStats from '../_lib/tools/get-user-stats.js';
import sendKakaoTalk from '../_lib/tools/send-kakaotalk.js';

// 대표님 휴대폰
const CEO_PHONE = '010-5424-5332';

// ════════════════════════════════════════════════════════════════
// 메인 핸들러
// ════════════════════════════════════════════════════════════════
export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // ─── 1. 인증 ──────────────────────────────────────────────
  const auth = verifyCronSecret(request);
  if (!auth.authenticated) {
    console.warn('[Cron-WeeklyKPI] 인증 실패:', auth.reason);
    return response.status(401).json(unauthorizedResponse(auth.reason));
  }

  console.log('[Cron-WeeklyKPI] 주간 KPI 보고 시작');
  const startTime = Date.now();

  // ─── 작업 결과 기록 ─────────────────────────────────────────
  const result = {
    started_at: new Date().toISOString(),
    weekly_kpi_fetched: false,
    stats_fetched: false,
    message_sent: false,
    errors: [] as string[],
  };

  try {
    // ─── 2. 지난주 KPI 조회 ──────────────────────────────────
    console.log('[Cron-WeeklyKPI] 주간 KPI 조회 중...');
    const kpiResult = await getKPI({ period: 'last_week' });

    if (kpiResult.success !== false) {
      result.weekly_kpi_fetched = true;
      console.log('[Cron-WeeklyKPI] 주간 KPI 조회 성공');
    } else {
      result.errors.push('주간 KPI 조회 실패');
    }

    // ─── 3. 사용자 통계 조회 ──────────────────────────────────
    console.log('[Cron-WeeklyKPI] 사용자 통계 조회 중...');
    const statsResult = await getUserStats({});

    if (statsResult.success !== false) {
      result.stats_fetched = true;
      console.log('[Cron-WeeklyKPI] 사용자 통계 조회 성공');
    } else {
      result.errors.push('사용자 통계 조회 실패');
    }

    // ─── 4. 주간 보고 메시지 구성 ──────────────────────────────
    const today = new Date();
    const lastWeekEnd = new Date(today);
    lastWeekEnd.setDate(today.getDate() - 1);
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7);

    const formatDate = (d: Date) =>
      `${d.getMonth() + 1}/${d.getDate()}`;

    const weekRange = `${formatDate(lastWeekStart)} ~ ${formatDate(lastWeekEnd)}`;

    const kpi: any = kpiResult.result || kpiResult;
    const stats: any = statsResult.result || statsResult;

    // 변화율 계산 (전주 대비)
    const changeRateText = (current: number, previous: number): string => {
      if (!previous || previous === 0) return '신규';
      const rate = ((current - previous) / previous) * 100;
      const arrow = rate >= 0 ? '📈' : '📉';
      return `${arrow} ${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`;
    };

    const message = `📊 주간 KPI 보고 (${weekRange})

[지난주 실적]
- 신규 가입: ${kpi.new_users || 0}명 ${changeRateText(kpi.new_users || 0, kpi.previous_new_users || 0)}
- 결제 완료: ${kpi.payments || 0}건 ${changeRateText(kpi.payments || 0, kpi.previous_payments || 0)}
- 매출: ${(kpi.revenue || 0).toLocaleString()}원 ${changeRateText(kpi.revenue || 0, kpi.previous_revenue || 0)}

[전체 현황]
- 총 회원: ${stats.total_users || 0}명
- 활성 회원: ${stats.active_users || 0}명
- Silver: ${stats.silver_users || 0}명
- Gold: ${stats.gold_users || 0}명

[제니야 인사이트]
${generateInsight(kpi, stats)}

이번주도 화이팅! 🚀`;

    // ─── 5. 카톡 발송 ────────────────────────────────────────
    console.log('[Cron-WeeklyKPI] 대표님께 카톡 발송 중...');
    const sendResult = await sendKakaoTalk({
      phone: CEO_PHONE,
      message: message,
    });

    if (sendResult.success) {
      result.message_sent = true;
      console.log('[Cron-WeeklyKPI] 카톡 발송 성공');
    } else {
      result.errors.push(`카톡 발송 실패: ${sendResult.error}`);
      console.error('[Cron-WeeklyKPI] 카톡 발송 실패:', sendResult.error);
    }

    // ─── 6. 결과 반환 ────────────────────────────────────────
    const duration = Date.now() - startTime;
    console.log(`[Cron-WeeklyKPI] 완료 (${duration}ms)`);

    return response.status(200).json({
      success: true,
      duration_ms: duration,
      result: result,
    });
  } catch (error: any) {
    console.error('[Cron-WeeklyKPI] 예외:', error);
    result.errors.push(`예외: ${error.message}`);

    return response.status(500).json({
      success: false,
      error: error.message,
      result: result,
    });
  }
}

// ════════════════════════════════════════════════════════════════
// 인사이트 생성 (간단한 규칙 기반, 추후 AI 분석으로 발전 가능)
// ════════════════════════════════════════════════════════════════
function generateInsight(kpi: any, stats: any): string {
  const insights: string[] = [];

  const newUsers = kpi.new_users || 0;
  const payments = kpi.payments || 0;
  const conversionRate = newUsers > 0 ? (payments / newUsers) * 100 : 0;

  if (conversionRate >= 20) {
    insights.push('• 결제 전환율 우수 (20%↑)');
  } else if (conversionRate < 5 && newUsers > 0) {
    insights.push('• 결제 전환율 점검 필요');
  }

  const totalUsers = stats.total_users || 0;
  const activeUsers = stats.active_users || 0;
  const activeRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

  if (activeRate >= 60) {
    insights.push('• 활성 회원 비율 양호 (60%↑)');
  } else if (activeRate < 30 && totalUsers > 10) {
    insights.push('• 회원 이탈 점검 필요');
  }

  const goldUsers = stats.gold_users || 0;
  if (goldUsers >= 10) {
    insights.push(`• Gold 회원 ${goldUsers}명 활약 중`);
  }

  return insights.length > 0
    ? insights.join('\n')
    : '• 안정적 운영 중';
}
