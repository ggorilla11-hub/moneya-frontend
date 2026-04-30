// ════════════════════════════════════════════════════════════════
// 제니야 카카오톡 발송 도구
// Make.com 시나리오를 통해 카톡/솔라피 발송
// 작성: 2026-04-30
// 위치: api/_lib/tools/send-kakaotalk.ts
// ════════════════════════════════════════════════════════════════

import { triggerMakeWebhook } from './trigger-make-webhook.js';

// ─── 메시지 템플릿 ─────────────────────────────────────────────
const TEMPLATES = {
  hot_lead: '🔥 핫리드 알림\n\n고객: {name}\n관심사: {interest}\n연락처: {phone}\n\n3시간 안에 응대 부탁드립니다.',
  payment_received: '💰 결제 완료\n\n{plan} 가입\n금액: {amount}원\n사용자: {name}',
  daily_summary: '📊 오늘의 요약\n\n신규 가입: {new_users}명\n결제: {paid_users}명\n매출: {revenue}원',
  custom: '{message}',
};

// ─── 전화번호 검증 ─────────────────────────────────────────────
function validatePhone(phone: string): { valid: boolean; cleaned?: string; error?: string } {
  // 한국 전화번호 정규화
  const cleaned = phone.replace(/[-\s]/g, '');
  
  if (!/^01[016789][0-9]{7,8}$/.test(cleaned)) {
    return {
      valid: false,
      error: '잘못된 전화번호 형식 (예: 010-1234-5678)',
    };
  }
  
  return { valid: true, cleaned };
}

// ─── 메인 함수 ─────────────────────────────────────────────────
export async function sendKakaoTalk(params: {
  phone: string;
  template?: keyof typeof TEMPLATES;
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
      return {
        success: false,
        error: phoneCheck.error,
      };
    }
    
    // 2. 메시지 구성
    let finalMessage: string;
    
    if (params.message) {
      finalMessage = params.message;
    } else if (params.template) {
      let template = TEMPLATES[params.template];
      
      // 변수 치환
      if (params.variables) {
        for (const [key, value] of Object.entries(params.variables)) {
          template = template.replace(new RegExp(`{${key}}`, 'g'), value);
        }
      }
      
      finalMessage = template;
    } else {
      return {
        success: false,
        error: 'message 또는 template 중 하나는 필수',
      };
    }
    
    // 3. 메시지 길이 제한 (카톡 1,000자, 솔라피 2,000자)
    const maxLength = params.bulk ? 2000 : 1000;
    if (finalMessage.length > maxLength) {
      return {
        success: false,
        error: `메시지 너무 김 (${finalMessage.length}자 / 최대 ${maxLength}자)`,
      };
    }
    
    // 4. Make.com 시나리오 호출
    console.log(`[sendKakaoTalk] ${phoneCheck.cleaned} (${params.bulk ? '솔라피' : '카톡'})`);
    
    const scenario = params.bulk ? 'send_kakao_bulk' : 'send_kakao';
    const result = await triggerMakeWebhook({
      scenario,
      payload: {
        phone: phoneCheck.cleaned,
        message: finalMessage,
        sender: process.env.KAKAO_SENDER_ID || '오원트금융연구소',
        message_length: finalMessage.length,
      },
    });
    
    return {
      success: result.success,
      result: {
        phone: phoneCheck.cleaned,
        message_preview: finalMessage.substring(0, 100),
        scenario_response: result.response,
      },
      error: result.error,
    };
  } catch (error: any) {
    console.error('[sendKakaoTalk] 에러:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ─── Claude Tool Use 정의 ──────────────────────────────────────
export const sendKakaoTalkTool = {
  name: 'sendKakaoTalk',
  description: `카카오톡 알림톡을 발송합니다. 단일 발송은 카카오 직접, 대량은 솔라피.

⚠️ 주의: 메시지 발송은 MEDIUM 위험도. 대표님께 사전 확인 권장.

템플릿 사용 가능:
- hot_lead: 핫리드 알림 (FP에게)
  변수: name, interest, phone
- payment_received: 결제 완료 알림
  변수: plan, amount, name
- daily_summary: 일일 요약
  변수: new_users, paid_users, revenue
- custom: 직접 메시지 입력

예시:
1. 핫리드 알림:
   sendKakaoTalk({
     phone: "010-1234-5678",
     template: "hot_lead",
     variables: {name: "김OO", interest: "노후재무", phone: "010-9876-5432"}
   })

2. 직접 메시지:
   sendKakaoTalk({
     phone: "010-1234-5678",
     message: "안녕하세요 OOO님, ..."
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
        description: '솔라피 사용 여부 (대량 발송, 기본 false)',
      },
    },
    required: ['phone'],
  },
};

export default sendKakaoTalk;
