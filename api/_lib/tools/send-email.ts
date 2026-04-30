// ════════════════════════════════════════════════════════════════
// 제니야 이메일 발송 도구
// Make.com 시나리오를 통해 이메일 발송
// 작성: 2026-04-30
// 위치: api/_lib/tools/send-email.ts
// ════════════════════════════════════════════════════════════════

import { triggerMakeWebhook } from './trigger-make-webhook.js';

// ─── 이메일 템플릿 ─────────────────────────────────────────────
const TEMPLATES = {
  daily_report: {
    subject: '[AI머니야] {date} 일일 보고',
    body: `대표님,

오늘 ({date}) 사업 운영 결과 보고드립니다.

📊 핵심 지표
- 신규 가입자: {new_users}명
- 결제 완료: {paid_users}명
- 매출: {revenue}원
- 핫리드: {hot_leads}건

⚠️ 주의 사항
{alerts}

💡 다음 액션
{next_actions}

— 제니야 (JENNYA)
오상열 CFP 대표님의 디지털 분신`,
  },
  
  hot_lead_followup: {
    subject: '[핫리드 미응답] {name} - {hours}시간 경과',
    body: `대표님,

다음 핫리드가 {hours}시간째 미응답 상태입니다.

고객 정보:
- 이름: {name}
- 연락처: {phone}
- 관심사: {interest}
- 발생 시각: {created_at}

조치 필요:
{action_required}

링크: {detail_url}

— 제니야`,
  },
  
  weekly_summary: {
    subject: '[AI머니야] {week} 주간 요약',
    body: `대표님,

지난 주 ({week}) 사업 요약 보고드립니다.

📈 주간 KPI
- 신규 가입: {new_users}명 ({user_change}%)
- 결제 전환: {conversion_rate}%
- 주간 매출: {revenue}원 ({revenue_change}%)
- 활성 사용자: {active_users}명

🎯 분석
{analysis}

🚀 권장 액션
{recommendations}

— 제니야`,
  },
  
  custom: {
    subject: '{subject}',
    body: '{body}',
  },
};

// ─── 이메일 검증 ───────────────────────────────────────────────
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── 메인 함수 ─────────────────────────────────────────────────
export async function sendEmail(params: {
  to: string;
  template?: keyof typeof TEMPLATES;
  variables?: Record<string, string>;
  subject?: string;
  body?: string;
  cc?: string[];
  bcc?: string[];
}): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> {
  try {
    // 1. 이메일 검증
    if (!validateEmail(params.to)) {
      return {
        success: false,
        error: `잘못된 이메일 형식: ${params.to}`,
      };
    }
    
    // CC/BCC 검증
    if (params.cc) {
      for (const cc of params.cc) {
        if (!validateEmail(cc)) {
          return { success: false, error: `잘못된 CC 이메일: ${cc}` };
        }
      }
    }
    
    // 2. 메시지 구성
    let finalSubject: string;
    let finalBody: string;
    
    if (params.template) {
      const template = TEMPLATES[params.template];
      finalSubject = template.subject;
      finalBody = template.body;
      
      // 변수 치환
      if (params.variables) {
        for (const [key, value] of Object.entries(params.variables)) {
          finalSubject = finalSubject.replace(new RegExp(`{${key}}`, 'g'), value);
          finalBody = finalBody.replace(new RegExp(`{${key}}`, 'g'), value);
        }
      }
    } else if (params.subject && params.body) {
      finalSubject = params.subject;
      finalBody = params.body;
    } else {
      return {
        success: false,
        error: 'template 또는 (subject + body) 둘 중 하나는 필수',
      };
    }
    
    // 3. Make.com 호출
    console.log(`[sendEmail] ${params.to} - ${finalSubject.substring(0, 50)}`);
    
    const result = await triggerMakeWebhook({
      scenario: 'send_email',
      payload: {
        to: params.to,
        cc: params.cc || [],
        bcc: params.bcc || [],
        subject: finalSubject,
        body: finalBody,
        from: process.env.EMAIL_SENDER || 'noreply@aimoneya.com',
        from_name: '제니야 (AI머니야)',
      },
    });
    
    return {
      success: result.success,
      result: {
        to: params.to,
        subject: finalSubject,
        body_preview: finalBody.substring(0, 200),
        scenario_response: result.response,
      },
      error: result.error,
    };
  } catch (error: any) {
    console.error('[sendEmail] 에러:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ─── Claude Tool Use 정의 ──────────────────────────────────────
export const sendEmailTool = {
  name: 'sendEmail',
  description: `이메일을 발송합니다. Make.com 시나리오를 통해 처리.

⚠️ 주의: 이메일 발송은 MEDIUM 위험도. 대표님께 사전 확인 권장.

템플릿 사용 가능:
- daily_report: 일일 보고서
  변수: date, new_users, paid_users, revenue, hot_leads, alerts, next_actions
- hot_lead_followup: 핫리드 미응답 알림
  변수: name, phone, interest, hours, created_at, action_required, detail_url
- weekly_summary: 주간 요약
  변수: week, new_users, user_change, conversion_rate, revenue, revenue_change, active_users, analysis, recommendations
- custom: 직접 작성

예시:
sendEmail({
  to: "ggorilla11@gmail.com",
  template: "daily_report",
  variables: {
    date: "2026-04-30",
    new_users: "12",
    paid_users: "3",
    revenue: "29700",
    hot_leads: "2",
    alerts: "특이사항 없음",
    next_actions: "주간 회의 준비"
  }
})`,
  input_schema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: '수신자 이메일',
      },
      template: {
        type: 'string',
        enum: ['daily_report', 'hot_lead_followup', 'weekly_summary', 'custom'],
        description: '이메일 템플릿',
      },
      variables: {
        type: 'object',
        description: '템플릿 변수',
      },
      subject: {
        type: 'string',
        description: '이메일 제목 (template 미사용 시 필수)',
      },
      body: {
        type: 'string',
        description: '이메일 본문 (template 미사용 시 필수)',
      },
      cc: {
        type: 'array',
        items: { type: 'string' },
        description: 'CC 수신자 (선택)',
      },
      bcc: {
        type: 'array',
        items: { type: 'string' },
        description: 'BCC 수신자 (선택)',
      },
    },
    required: ['to'],
  },
};

export default sendEmail;
