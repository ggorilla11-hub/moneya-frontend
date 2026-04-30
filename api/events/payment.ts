// ════════════════════════════════════════════════════════════════
// 제니야 이벤트 트리거: 결제 완료
// 결제 성공 시 호출되는 endpoint
// 작성: 2026-04-30
// 위치: api/events/payment.ts
//
// 작동:
// 1. 회원에게 결제 영수증 카톡/LMS
// 2. 대표님에게 결제 알림
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

  console.log('[Event-Payment] 결제 완료 이벤트 수신');
  const startTime = Date.now();

  try {
    // ─── 1. 요청 데이터 파싱 ─────────────────────────────────
    const {
      user_name,
      user_phone,
      user_email,
      plan,
      amount,
      order_id,
      payment_method = '카드',
    } = request.body || {};

    if (!user_phone || !plan || !amount) {
      return response.status(400).json({
        success: false,
        error: 'user_phone, plan, amount 필수',
      });
    }

    const result = {
      started_at: new Date().toISOString(),
      receipt_sent: false,
      ceo_notified: false,
      errors: [] as string[],
    };

    const formattedAmount = Number(amount).toLocaleString();
    const today = new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // ─── 2. 회원에게 영수증 ──────────────────────────────────
    const receiptMessage = `💳 결제가 완료되었습니다

[결제 정보]
- 상품: ${plan}
- 금액: ${formattedAmount}원
- 결제수단: ${payment_method}
- 일시: ${today}
${order_id ? `• 주문번호: ${order_id}` : ''}

✅ 서비스가 즉시 활성화되었습니다.

문의: 010-5424-5332`;

    const receiptResult = await sendKakaoTalk({
      phone: user_phone,
      message: receiptMessage,
    });

    if (receiptResult.success) {
      result.receipt_sent = true;
      console.log('[Event-Payment] 영수증 발송 성공');
    } else {
      result.errors.push(`영수증 발송 실패: ${receiptResult.error}`);
    }

    // ─── 3. 대표님께 결제 알림 ───────────────────────────────
    const ceoMessage = `💰 결제 발생!

[결제 정보]
- 고객: ${user_name || '미입력'}
- 연락처: ${user_phone}
- 이메일: ${user_email || '미입력'}
- 상품: ${plan}
- 금액: ${formattedAmount}원
- 일시: ${today}

영수증 자동 발송 완료. 🎉`;

    const ceoResult = await sendKakaoTalk({
      phone: CEO_PHONE,
      message: ceoMessage,
    });

    if (ceoResult.success) {
      result.ceo_notified = true;
      console.log('[Event-Payment] 대표님 알림 성공');
    } else {
      result.errors.push(`대표님 알림 실패: ${ceoResult.error}`);
    }

    const duration = Date.now() - startTime;
    console.log(`[Event-Payment] 완료 (${duration}ms)`);

    return response.status(200).json({
      success: true,
      duration_ms: duration,
      result: result,
    });
  } catch (error: any) {
    console.error('[Event-Payment] 예외:', error);
    return response.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
