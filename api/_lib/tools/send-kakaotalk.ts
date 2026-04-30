// ════════════════════════════════════════════════════════════════
// 제니야 카카오톡 발송 도구 v3.0
// 솔라피 REST API 직접 호출 (Make.com 우회)
// 작성: 2026-04-30
// 위치: api/_lib/tools/send-kakaotalk.ts
//
// 변경 이유: Make.com 자동 비활성화 위험 + 디버깅 어려움
// 표준: 실리콘밸리 best practice (Twilio 패턴)
// ════════════════════════════════════════════════════════════════

import { createHmac, randomBytes } from 'node:crypto';

// ─── 발신 정보 ─────────────────────────────────────────────────
const SENDER_PHONE = '01054245332';

// ─── 등록된 BrandMessage 템플릿 ────────────────────────────────
const TEMPLATE_IDS: Record<string, string> = {
  general: 'KA01BP2604301122124484oi0IXQlDFx',  // JENNYA_GENERAL
  // 추후 알림톡 검수 통과 시:
  // welcome: 'KA01TP_xxx',
  // payment: 'KA01TP_xxx',
};

// ─── 메시지 템플릿 (변수 치환용) ───────────────────────────────
const MESSAGE_TEMPLATES = {
  hot_lead: '🔥 핫리드 알림\n\n고객: {name}\n관심사: {interest}\n연락처: {phone}\n\n3시간 안에 응대 부탁드립니다.',
  payment_received: '💰 결제 완료\n\n{plan} 가입\n금액: {amount}원\n사용자: {name}',
  daily_summary: '📊 오늘의 요약\n\n신규 가입: {new_users}명\n결제: {paid_users}명\n매출: {revenue}원',
  custom: '{message}',
};

// ─── 전화번호 검증 ─────────────────────────────────────────────
function validatePhone(phone: string): { valid: boolean; cleaned?: string; error?: string } {
  const cleaned = phone.replace(/[-\s]/g, '');
  if (!/^01[016789][0-9]{7,8}$/.test(cleaned)) {
    return { valid: false, error: '잘못된 전화번호 형식 (예: 010-1234-5678)' };
  }
  return { valid: true, cleaned };
}

// ─── 솔라피 HMAC 서명 생성 ──────────────────────────────────────
function generateSolapiAuth(apiKey: string, apiSecret: string): string {
  const date = new Date().toISOString();
  const salt = randomBytes(32).toString('hex');
  const signature = createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex');
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

// ─── 솔라피 직접 호출 ──────────────────────────────────────────
async function callSolapiAPI(
  cleanPhone: string,
  message: string
): Promise<{ success: boolean; data?: any; error?: string; errorCode?: string; httpStatus?: number }> {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const pfId = process.env.SOLAPI_PFID_OWONT;

  // 환경 변수 검증
  if (!apiKey || !apiSecret || !pfId) {
    return {
      success: false,
      error: 'ENV_MISSING: SOLAPI 환경 변수 누락',
      errorCode: 'ENV_MISSING',
    };
  }

  const templateId = TEMPLATE_IDS.general;

  console.log('[sendKakaoTalk v3.0] 솔라피 호출:', {
    phone: cleanPhone,
    pfId_prefix: pfId.substring(0, 12) + '...',
    templateId: templateId.substring(0, 15) + '...',
    message_length: message.length,
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
            templateId: templateId,
            variables: {
              '#{message}': message,
            },
            disableSms: false,  // 카톡 실패 시 LMS 자동 폴백
            adFlag: true,        // 광고성 표기 (BrandMessage 필수)
          },
          text: message,  // LMS 폴백 시 사용
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

    console.log('[sendKakaoTalk v3.0] 솔라피 응답:', {
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
    console.error('[sendKakaoTalk v3.0] 예외:', error);
    return {
      success: false,
      error: error.message || String(error),
      errorCode: 'EXCEPTION',
    };
  }
}

// ─── 메인 함수 (기존 인터페이스 100% 호환) ────────────────────
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
    // 1. 전화번호 검증
    const phoneCheck = validatePhone(params.phone);
    if (!phoneCheck.valid) {
      return { success: false, error: phoneCheck.error };
    }

    // 2. 메시지 구성
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

    // 3. 메시지 길이 제한
    const maxLength = 1000;  // BrandMessage 1000자
    if (finalMessage.length > maxLength) {
      return {
        success: false,
        error: `메시지 너무 김 (${finalMessage.length}자 / 최대 ${maxLength}자)`,
      };
    }

    // 4. 솔라피 직접 호출
    console.log(`[sendKakaoTalk v3.0] ${phoneCheck.cleaned} → 솔라피 직접`);
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
        scenario_response: 'Solapi REST API Direct v3.0',
      },
    };
  } catch (error: any) {
    console.error('[sendKakaoTalk v3.0] 최종 예외:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ─── Claude Tool Use 정의 (기존 동일) ─────────────────────────
export const sendKakaoTalkTool = {
  name: 'sendKakaoTalk',
  description: `카카오톡 메시지를 발송합니다 (솔라피 직접 호출).

⚠️ 주의: MEDIUM 위험도. 대표님께 사전 확인 권장.

템플릿:
- hot_lead: 핫리드 알림 (FP에게)
  변수: name, interest, phone
- payment_received: 결제 완료 알림
  변수: plan, amount, name
- daily_summary: 일일 요약
  변수: new_users, paid_users, revenue
- custom: 직접 메시지 입력

예시:
1. 직접 메시지:
   sendKakaoTalk({
     phone: "010-1234-5678",
     message: "안녕하세요 OOO님, ..."
   })

2. 핫리드 알림:
   sendKakaoTalk({
     phone: "010-1234-5678",
     template: "hot_lead",
     variables: {name: "김OO", interest: "노후재무", phone: "010-9876-5432"}
   })`,
  input_schema: {
    type: 'object',
    properties: {
      phone: {
        type: 'string',
        description: '수신자 전화번호 (010-XXXX-XXXX 형식)',
      },
      template: {
        type: 'string',
        enum: ['hot_lead', 'payment_received', 'daily_summary', 'custom'],
        description: '메시지 템플릿 (선택)',
      },
      variables: {
        type: 'object',
        description: '템플릿 변수 (예: {name: "홍길동"})',
      },
      message: {
        type: 'string',
        description: '직접 메시지 (template 미사용 시)',
      },
      bulk: {
        type: 'boolean',
        description: '대량 발송 여부 (현재는 미사용, 호환성 위해 유지)',
      },
    },
    required: ['phone'],
  },
};

export default sendKakaoTalk;
