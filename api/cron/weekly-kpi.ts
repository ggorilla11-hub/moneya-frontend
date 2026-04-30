// ════════════════════════════════════════════════════════════════
// 제니야 주간 KPI 보고 Cron Job v2
// 매주 월요일 09:00 (KST) 자동 실행
// 작성: 2026-04-30
// ════════════════════════════════════════════════════════════════

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyCronSecret, unauthorizedResponse } from '../_lib/auth.js';
import { getKPI } from '../_lib/tools/get-kpi.js';
import { getUserStats } from '../_lib/tools/get-user-stats.js';
import sendKakaoTalk from '../_lib/tools/send-kakaotalk.js';

const CEO_PHONE = '010-5424-5332';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const auth = verifyCronSecret(request);
  if (!auth.authenticated) {
    console.warn('[Cron-WeeklyKPI] 인증 실패:', auth.reason);
    return response.status(401).json(unauthorizedResponse(auth.reason));
  }

  console.log('[Cron-WeeklyKPI] 주간 KPI 보고 시작');
  const startTime = Date.now();

  const result = {
    started_at: new Date().toISOString(),
    kpi_fetched: false,
    stats_fetched: false,
    message_sent: false,
    errors: [] as string[],
  };

  try {
    // 지난 7일 KPI 조회 (전주 비교 포함)
    const kpiResult = await getKPI({ 
      period: 'last_7_days',
      compareWith: 'previous'
    });

    let metrics = {
      new_users: 0,
      paid_users: 0,
      revenue: 0,
      hot_leads_total: 0,
      hot_leads_resolved: 0,
      conversion_rate: 0,
    };
    let changePct: any = {};

    if (kpiResult.success && kpiResult.result) {
      result.kpi_fetched = true;
      metrics = kpiResult.result.metrics;
      changePct = kpiResult.result.comparison?.change_pct || {};
      console.log('[Cron-WeeklyKPI] KPI 조회 성공');
    } else {
      result.errors.push(`KPI 조회 실패: ${kpiResult.error || 'unknown'}`);
    }

    // 구독 현황 조회
    const statsResult = await getUserStats({ type: 'subscription_status' });

    let subData: any = {};
    if (statsResult.success && statsResult.data) {
      result.stats_fetched = true;
      subData = statsResult.data;
      console.log('[Cron-WeeklyKPI] 구독 현황 조회 성공');
    } else {
      result.errors.push(`구독 현황 실패: ${statsResult.error || 'unknown'}`);
    }

    // 날짜 범위 계산
    const today = new Date();
    const lastWeekEnd = new Date(today);
    lastWeekEnd.setDate(today.getDate() - 1);
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7);

    const formatDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    const weekRange = `${formatDate(lastWeekStart)} ~ ${formatDate(lastWeekEnd)}`;

    // 변화율 표시
    const trend = (key: string): string => {
      const pct = changePct[key];
      if (pct === undefined || pct === null) return '';
      if (pct > 0) return ` 📈 +${pct}%`;
      if (pct < 0) return ` 📉 ${pct}%`;
      return ' ➡️ 0%';
    };

    const message = `📊 주간 KPI 보고 (${weekRange})

[지난주 실적]
- 신규 가입: ${metrics.new_users}명${trend('new_users')}
- 결제 완료: ${metrics.paid_users}건${trend('paid_users')}
- 매출: ${metrics.revenue.toLocaleString()}원${trend('revenue')}
- 핫리드: ${metrics.hot_leads_total}건 (해결 ${metrics.hot_leads_resolved})
- 전환율: ${metrics.conversion_rate}%

[구독 현황]
- Silver: ${subData.silver || 0}명
- Gold: ${subData.gold || 0}명
- 월구독: ${subData.monthly || 0}명
- MRR: ${(subData.mrr || 0).toLocaleString()}원

이번주도 화이팅! 🚀`;

    // 카톡 발송
    const sendResult = await sendKakaoTalk({
      phone: CEO_PHONE,
      message: message,
    });

    if (sendResult.success) {
      result.message_sent = true;
      console.log('[Cron-WeeklyKPI] 카톡 발송 성공');
    } else {
      result.errors.push(`카톡 발송 실패: ${sendResult.error}`);
    }

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
