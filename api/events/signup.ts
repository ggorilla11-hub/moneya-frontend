// ════════════════════════════════════════════════════════════════
// 제니야 이벤트 트리거: 신규 가입
// 사용자 가입 시 호출되는 endpoint
// 작성: 2026-04-30
// 위치: api/events/signup.ts
//
// 작동:
// 1. 회원에게 환영 카톡/LMS
// 2. 대표님에게 신규 가입 알림
// ════════════════════════════════════════════════════════════════

import type { VercelRequest, VercelResponse } from '@vercel/node';
import sendKakaoTalk from '../_lib/tools/send-kakaotalk.js';

const CEO_PHONE = '010-5424-5332';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // POST만 허용
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[Event-Signup] 신규 가입 이벤트 수신');
  const startTime = Date.now();

  try {
    // ─── 1. 요청 데이터 파싱 ─────────────────────────────────
    const { user_name, user_phone, user_email, plan = '체험' } = request.body || {};

    if (!user_phone) {
      return response.status(400).json({
        success: false,
        error: 'user_phone 필수',
      });
    }

    const result = {
      started_at: new Date().toISOString(),
      welcome_sent: false,
      ceo_notified: false,
      errors: [] as string[],
    };

    // ─── 2. 회원에게 환영 메시지 ─────────────────────────────
    console.log('[Event-Signup] 회원에게 환영 메시지 발송');
    const welcomeMessage = `🎉 ${user_name || '회원'}님, AI머니야 가입을 환영합니다!

지금부터 7일간 무료로
25년 CFP 노하우 기반 재무 진단을
경험하실 수 있습니다.

✅ 텍스트 상담 무제한
✅ 원트큐브 진단
✅ DESIRE 6단계 분석

문의: 010-5424-5332`;

    const welcomeResult = await sendKakaoTalk({
      phone: user_phone,
      message: welcomeMessage,
    });

    if (welcomeResult.success) {
      result.welcome_sent = true;
      console.log('[Event-Signup] 환영 메시지 발송 성공');
    } else {
      result.errors.push(`환영 메시지 실패: ${welcomeResult.error}`);
    }

    // ─── 3. 대표님께 신규 가입 알림 ──────────────────────────
    console.log('[Event-Signup] 대표님께 알림 발송');
    const today = new Date().toLocaleString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const ceoMessage = `🎉 신규 가입 발생!

[가입 정보]
- 이름: ${user_name || '미입력'}
- 연락처: ${user_phone}
- 이메일: ${user_email || '미입력'}
- 플랜: ${plan}
- 시각: ${today}

환영 메시지 자동 발송 완료.
대표님 확인 부탁드립니다.`;

    const ceoResult = await sendKakaoTalk({
      phone: CEO_PHONE,
      message: ceoMessage,
    });

    if (ceoResult.success) {
      result.ceo_notified = true;
      console.log('[Event-Signup] 대표님 알림 발송 성공');
    } else {
      result.errors.push(`대표님 알림 실패: ${ceoResult.error}`);
    }

    // ─── 4. 결과 반환 ────────────────────────────────────────
    const duration = Date.now() - startTime;
    console.log(`[Event-Signup] 완료 (${duration}ms)`);

    return response.status(200).json({
      success: true,
      duration_ms: duration,
      result: result,
    });
  } catch (error: any) {
    console.error('[Event-Signup] 예외:', error);
    return response.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
