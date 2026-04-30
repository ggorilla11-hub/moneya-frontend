// ════════════════════════════════════════════════════════════════
// 제니야 일일 출석 알림 Cron Job
// 매일 08:00 (KST) 자동 실행
// 회원들에게 오늘의 미션 카톡 발송
// 작성: 2026-04-30
// 위치: api/cron/daily-attendance.ts
//
// MVP 단계: 대표님 본인에게만 발송 (검증용)
// 추후: 전체 활성 회원에게 발송
// ════════════════════════════════════════════════════════════════

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyCronSecret, unauthorizedResponse } from '../_lib/auth.js';
import sendKakaoTalk from '../_lib/tools/send-kakaotalk.js';

// MVP: 대표님만
const TEST_PHONE = '010-5424-5332';

// 일일 미션 메시지 풀 (랜덤 선택)
const DAILY_MISSIONS = [
  '오늘의 미션: 어제 지출 5초 점검 ✅',
  '오늘의 미션: 자동이체 1건 확인 💰',
  '오늘의 미션: 보험증권 1개 점검 🛡️',
  '오늘의 미션: 적금 잔액 확인 📊',
  '오늘의 미션: 부동산 시세 1분 확인 🏠',
  '오늘의 미션: 신용점수 확인 (1분) ⭐',
  '오늘의 미션: 오늘 카드 사용 1건 점검 💳',
];

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
    console.warn('[Cron-Attendance] 인증 실패:', auth.reason);
    return response.status(401).json(unauthorizedResponse(auth.reason));
  }

  console.log('[Cron-Attendance] 일일 출석 알림 시작');
  const startTime = Date.now();

  // ─── 작업 결과 기록 ─────────────────────────────────────────
  const result = {
    started_at: new Date().toISOString(),
    target_count: 1,  // MVP: 대표님 1명
    sent_count: 0,
    failed_count: 0,
    errors: [] as string[],
  };

  try {
    // ─── 2. 오늘의 미션 선택 ─────────────────────────────────
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const mission = DAILY_MISSIONS[dayOfYear % DAILY_MISSIONS.length];

    const dateStr = today.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    // ─── 3. 메시지 구성 ────────────────────────────────────────
    const message = `🌅 좋은 아침입니다!

${dateStr}
${mission}

매일 1분, 작은 습관이
재무 자유의 시작입니다.

화이팅! 💪`;

    // ─── 4. 발송 (MVP: 대표님 본인만) ─────────────────────────
    console.log('[Cron-Attendance] 대표님께 출석 알림 발송 중...');
    const sendResult = await sendKakaoTalk({
      phone: TEST_PHONE,
      message: message,
    });

    if (sendResult.success) {
      result.sent_count = 1;
      console.log('[Cron-Attendance] 발송 성공');
    } else {
      result.failed_count = 1;
      result.errors.push(`발송 실패: ${sendResult.error}`);
      console.error('[Cron-Attendance] 발송 실패:', sendResult.error);
    }

    // ─── 5. 결과 반환 ────────────────────────────────────────
    const duration = Date.now() - startTime;
    console.log(`[Cron-Attendance] 완료 (${duration}ms): ${result.sent_count}/${result.target_count} 성공`);

    return response.status(200).json({
      success: true,
      duration_ms: duration,
      result: result,
    });
  } catch (error: any) {
    console.error('[Cron-Attendance] 예외:', error);
    result.errors.push(`예외: ${error.message}`);

    return response.status(500).json({
      success: false,
      error: error.message,
      result: result,
    });
  }
}
