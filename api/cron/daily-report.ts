// ════════════════════════════════════════════════════════════════
// 제니야 일일 보고 Cron Job
// 매일 09:00 (KST) 자동 실행
// 대표님께 어제 KPI 카톡 발송
// 작성: 2026-04-30
// 위치: api/cron/daily-report.ts
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
    console.warn('[Cron-DailyReport] 인증 실패:', auth.reason);
    return response.status(401).json(unauthorizedResponse(auth.reason));
  }

  console.log('[Cron-DailyReport] 일일 보고 시작');
  const startTime = Date.now();

  // ─── 작업 결과 기록 ─────────────────────────────────────────
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
    
    if (kpiResult.success !== false) {
      result.kpi_fetched = true;
      console.log('[Cron-DailyReport] KPI 조회 성공');
    } else {
      result.errors.push('KPI 조회 실패');
    }

    // ─── 3. 사용자 통계 조회 ──────────────────────────────────
    console.log('[Cron-DailyReport] 사용자 통계 조회 중...');
    const statsResult = await getUserStats({});
    
    if (statsResult.success !== false) {
      result.stats_fetched = true;
      console.log('[Cron-DailyReport] 사용자 통계 조회 성공');
    } else {
      result.errors.push('사용자 통계 조회 실패');
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

    const kpi: any = kpiResult.result || kpiResult;
    const stats: any = statsResult.result || statsResult;

    const message = `📊 일일 보고 (${dateStr})

[어제 실적]
- 신규 가입: ${kpi.new_users || 0}명
- 결제 완료: ${kpi.payments || 0}건
- 매출: ${(kpi.revenue || 0).toLocaleString()}원

[전체 현황]
- 총 회원: ${stats.total_users || 0}명
- 활성 회원: ${stats.active_users || 0}명
- Silver: ${stats.silver_users || 0}명
- Gold: ${stats.gold_users || 0}명

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
