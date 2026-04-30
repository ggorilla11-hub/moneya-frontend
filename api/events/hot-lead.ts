// ════════════════════════════════════════════════════════════════
// 제니야 이벤트 트리거: 핫리드 발생
// 고객이 상담 가능 상태(핫리드)가 되면 호출
// 작성: 2026-04-30
// 위치: api/events/hot-lead.ts
//
// 작동:
// 1. 대표님에게 즉시 알림 ⭐ (3시간 응대 골든타임)
// 2. (추후) FP 자동 매칭
// ════════════════════════════════════════════════════════════════

import type { VercelRequest, VercelResponse } from '@vercel/node';
import sendKakaoTalk from '../_lib/tools/send-kakaotalk.js';

const CEO_PHONE = '010-5424-5332';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[Event-HotLead] 핫리드 이벤트 수신');
  const startTime = Date.now();

  try {
    // ─── 1. 요청 데이터 파싱 ─────────────────────────────────
    const {
      user_name,
      user_phone,
      user_email,
      interest,
      desire_stage,
      lead_score,
      conversation_summary,
    } = request.body || {};

    if (!user_phone) {
      return response.status(400).json({
        success: false,
        error: 'user_phone 필수',
      });
    }

    const result = {
      started_at: new Date().toISOString(),
      ceo_notified: false,
      errors: [] as string[],
    };

    // ─── 2. 대표님께 즉시 알림 (골든타임 3시간) ─────────────
    const today = new Date().toLocaleString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const leadScoreText = lead_score
      ? `\n• 핫리드 점수: ${lead_score}/100`
      : '';
    const stageText = desire_stage
      ? `\n• DESIRE 단계: ${desire_stage}`
      : '';
    const summaryText = conversation_summary
      ? `\n\n[상담 요약]\n${conversation_summary}`
      : '';

    const ceoMessage = `🔥 핫리드 발생!

[고객 정보]
- 이름: ${user_name || '미입력'}
- 연락처: ${user_phone}
- 이메일: ${user_email || '미입력'}
- 관심사: ${interest || '재무상담'}${stageText}${leadScoreText}
- 발생: ${today}${summaryText}

⏰ 골든타임 3시간!
빠른 응대가 전환율을 결정합니다.`;

    const ceoResult = await sendKakaoTalk({
      phone: CEO_PHONE,
      message: ceoMessage,
    });

    if (ceoResult.success) {
      result.ceo_notified = true;
      console.log('[Event-HotLead] 대표님 알림 성공');
    } else {
      result.errors.push(`대표님 알림 실패: ${ceoResult.error}`);
      console.error('[Event-HotLead] 대표님 알림 실패:', ceoResult.error);
    }

    // ─── 3. 결과 반환 ────────────────────────────────────────
    const duration = Date.now() - startTime;
    console.log(`[Event-HotLead] 완료 (${duration}ms)`);

    return response.status(200).json({
      success: true,
      duration_ms: duration,
      result: result,
    });
  } catch (error: any) {
    console.error('[Event-HotLead] 예외:', error);
    return response.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
