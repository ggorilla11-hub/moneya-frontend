// ════════════════════════════════════════════════════════════════
// 제니야 카카오톡 발송 도구 v3.1
// 솔라피 친구톡 (CTA, 자유 메시지) 직접 호출
// ════════════════════════════════════════════════════════════════

import { createHmac, randomBytes } from 'node:crypto';

const SENDER_PHONE = '01054245332';

const MESSAGE_TEMPLATES = {
  hot_lead: '🔥 핫리드 알림\n\n고객: {name}\n관심사: {interest}\n연락처: {phone}\n\n3시간 안에 응대 부탁드립니다.',
  payment_received: '💰 결제 완료\n\n{plan} 가입\n금액: {amount}원\n사용자: {name}',
  daily_summary: '📊 오늘의 요약\n\n신규 가입: {new_users}명\n결제: {paid_users}명\n매출: {revenue}원',
  custom: '{message}',
};

function validatePhone(phone: string): { valid: boolean; cleaned?: string; error?: string } {
  const cleaned = phone.replace(/[-\s]/g, '');
  if (!/^01[016789][0-9]{7,8}$/.test(cleaned)) {
    return { valid: false, error: '잘못된 전화번호 형식 (예: 010-1234-5678)' };
  }
  return { valid: true, cleaned };
}

function generateSolapiAuth(apiKey: string, apiSecret: string): string {
  const date = new Date().toISOString();
  const salt = randomBytes(32).toString('hex');
  const signature = createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex');
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

async function callSolapiAPI(
  cleanPhone: string,
  message: string
): Promise<{ success: boolean; data?: any; error?: string; errorCode?: string; httpStatus?: number }> {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const pfId = process.env.SOLAPI_PFID_OWONT;

  if (!apiKey || !apiSecret || !pfId) {
    return {
      success: false,
      error: 'ENV_MISSING: SOLAPI 환경 변수 누락',
      errorCode: 'ENV_MISSING',
    };
  }

  // 광고 표기 + 수신거부 자동 추가 (정보통신망법 준수)
  const adMessage = message.startsWith('(광고)') 
    ? message 
    : `(광고)[AI머니야]\n\n${message}\n\n무료수신거부 080-500-4233`;

  console.log('[sendKakaoTalk v3.1] CTA 친구톡 호출:', {
    phone: cleanPhone,
    pfId_prefix: pfId.substring(0, 12) + '...',
    message_length: adMessage.length,
  });

  try {
    const response = await fetch('https://api.solapi.com/messages/v4/send', {
      method: 'POST',
      headers: {
        'Authorization': generateSolapiAuth(apiKey, apiSecret),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          to: cleanPhone,
          from: SENDER_PHONE,
          type: 'CTA',
          kakaoOptions: {
            pfId: pfId,
            disableSms: false,
            adFlag: true,
          },
          text: adMessage,
        },
      }),
    });

    const responseText = await response.text();
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    console.log('[sendKakaoTalk v3.1] 솔라피 응답:', {
      http: response.status,
      ok: response.ok,
      preview: responseText.substring(0, 300),
    });

    if (!response.ok || data.errorCode) {
      return {
        success: false,
        httpStatus: response.status,
        error: data.errorMessage || data.message || data.raw || '솔라피 발송 실패',
        errorCode: data.errorCode || `HTTP_${response.status}`,
        data: data,
      };
    }

    return {
      success: true,
      httpStatus: response.status,
      data: data,
    };
  } catch (error: any) {
    console.error('[sendKakaoTalk v3.1] 예외:', error);
    return {
      success: false,
      error: error.message || String(error),
      errorCode: 'EXCEPTION',
    };
  }
}

export async function sendKakaoTalk(params: {
  phone: string;
  template?: keyof typeof MESSAGE_TEMPLATES;
  variables?: Record<string, string>;
  message?: string;
  bulk?: boolean;
}): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> {
  try {
    const phoneCheck = validatePhone(params.phone);
    if (!phoneCheck.valid) {
      return { success: false, error: phoneCheck.error };
    }

    let finalMessage: string;

    if (params.message) {
      finalMessage = params.message;
    } else if (params.template) {
      let template = MESSAGE_TEMPLATES[params.template];
      if (params.variables) {
        for (const [key, value] of Object.entries(params.variables)) {
          template = template.replace(new RegExp(`{${key}}`, 'g'), value);
        }
      }
      finalMessage = template;
    } else {
      return { success: false, error: 'message 또는 template 중 하나는 필수' };
    }

    const maxLength = 1000;
    if (finalMessage.length > maxLength) {
      return {
        success: false,
        error: `메시지 너무 김 (${finalMessage.length}자 / 최대 ${maxLength}자)`,
      };
    }

    console.log(`[sendKakaoTalk v3.1] ${phoneCheck.cleaned} → 솔라피 CTA`);
    const apiResult = await callSolapiAPI(phoneCheck.cleaned!, finalMessage);

    if (!apiResult.success) {
      return {
        success: false,
        error: apiResult.error,
        result: {
          phone: phoneCheck.cleaned,
          message_preview: finalMessage.substring(0, 100),
          errorCode: apiResult.errorCode,
          httpStatus: apiResult.httpStatus,
          full_response: apiResult.data,
        },
      };
    }

    return {
      success: true,
      result: {
        phone: phoneCheck.cleaned,
        message_preview: finalMessage.substring(0, 100),
        groupId: apiResult.data?.groupId,
        type: apiResult.data?.type,
        scenario_response: 'Solapi CTA Direct v3.1',
      },
    };
  } catch (error: any) {
    console.error('[sendKakaoTalk v3.1] 최종 예외:', error.message);
    return { success: false, error: error.message };
  }
}

export const sendKakaoTalkTool = {
  name: 'sendKakaoTalk',
  description: `카카오톡 친구톡을 발송합니다 (솔라피 CTA 직접 호출).

⚠️ 주의: MEDIUM 위험도. 채널 친구에게만 발송 가능.
⚠️ 광고 시간: 08:00 ~ 20:50 (야간 X)

템플릿:
- hot_lead: 핫리드 알림 (FP에게)
- payment_received: 결제 완료 알림
- daily_summary: 일일 요약
- custom: 직접 메시지`,
  input_schema: {
    type: 'object',
    properties: {
      phone: { type: 'string', description: '수신자 전화번호 (010-XXXX-XXXX)' },
      template: {
        type: 'string',
        enum: ['hot_lead', 'payment_received', 'daily_summary', 'custom'],
        description: '메시지 템플릿 (선택)',
      },
      variables: { type: 'object', description: '템플릿 변수' },
      message: { type: 'string', description: '직접 메시지' },
      bulk: { type: 'boolean', description: '대량 발송 (현재 미사용)' },
    },
    required: ['phone'],
  },
};

export default sendKakaoTalk;
