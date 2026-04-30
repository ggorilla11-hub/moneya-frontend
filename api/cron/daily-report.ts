// ════════════════════════════════════════════════════════════════
// 제니야 일일 보고 Cron Job v2 (정확한 도구 인터페이스 사용)
// 매일 09:00 (KST) 자동 실행
// 대표님께 어제 KPI 카톡 발송
// 작성: 2026-04-30
// 위치: api/cron/daily-report.ts
// ════════════════════════════════════════════════════════════════

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyCronSecret, unauthorizedResponse } from '../_lib/auth.js';
import { getKPI } from '../_lib/tools/get-kpi.js';
import { getUserStats } from '../_lib/tools/get-user-stats.js';
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
    console.warn('[Cron-DailyReport] 인증 실패:', auth.reason);
    return response.status(401).json(unauthorizedResponse(auth.reason));
  }

  console.log('[Cron-DailyReport] 일일 보고 시작');
  const startTime = Date.now();

  const result = {
    started_at: new Date().toISOString(),
    kpi_fetched: false,
    stats_fetched: false,
    message_sent: false,
    errors: [] as string[],
  };

  try {
    // ─── 2. 어제 KPI 조회 ────────────────────────────────────
    console.log('[Cron-DailyReport] KPI 조회 중...');
    const kpiResult = await getKPI({ period: 'yesterday' });

    let metrics = {
      new_users: 0,
      paid_users: 0,
      revenue: 0,
      hot_leads_total: 0,
      conversion_rate: 0,
    };

    if (kpiResult.success && kpiResult.result) {
      result.kpi_fetched = true;
      metrics = kpiResult.result.metrics;
      console.log('[Cron-DailyReport] KPI 조회 성공:', metrics);
    } else {
      result.errors.push(`KPI 조회 실패: ${kpiResult.error || 'unknown'}`);
    }

    // ─── 3. 전체 사용자 통계 조회 ──────────────────────────────
    console.log('[Cron-DailyReport] 사용자 통계 조회 중...');
    const statsResult = await getUserStats({ type: 'overall_summary' });

    let statsData: any = {};
    if (statsResult.success && statsResult.data) {
      result.stats_fetched = true;
      statsData = statsResult.data;
      console.log('[Cron-DailyReport] 사용자 통계 조회 성공');
    } else {
      result.errors.push(`사용자 통계 조회 실패: ${statsResult.error || 'unknown'}`);
    }

    // ─── 4. 보고 메시지 구성 ──────────────────────────────────
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    const message = `📊 일일 보고 (${dateStr})

[어제 실적]
- 신규 가입: ${metrics.new_users}명
- 결제 완료: ${metrics.paid_users}건
- 매출: ${metrics.revenue.toLocaleString()}원
- 핫리드: ${metrics.hot_leads_total}건
- 결제 전환율: ${metrics.conversion_rate}%

[전체 현황]
- 총 회원: ${statsData.total_users || 0}명
- 활성 회원: ${statsData.active_users || 0}명

오늘도 좋은 하루 되세요! 🌟`;

    // ─── 5. 카톡 발송 ────────────────────────────────────────
    console.log('[Cron-DailyReport] 대표님께 카톡 발송 중...');
    const sendResult = await sendKakaoTalk({
      phone: CEO_PHONE,
      message: message,
    });

    if (sendResult.success) {
      result.message_sent = true;
      console.log('[Cron-DailyReport] 카톡 발송 성공');
    } else {
      result.errors.push(`카톡 발송 실패: ${sendResult.error}`);
      console.error('[Cron-DailyReport] 카톡 발송 실패:', sendResult.error);
    }

    // ─── 6. 결과 반환 ────────────────────────────────────────
    const duration = Date.now() - startTime;
    console.log(`[Cron-DailyReport] 완료 (${duration}ms)`);

    return response.status(200).json({
      success: true,
      duration_ms: duration,
      result: result,
    });
  } catch (error: any) {
    console.error('[Cron-DailyReport] 예외:', error);
    result.errors.push(`예외: ${error.message}`);

    return response.status(500).json({
      success: false,
      error: error.message,
      result: result,
    });
  }
}
