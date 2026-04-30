// ════════════════════════════════════════════════════════════════
// 제니야 Make.com 웹훅 트리거 도구
// 모든 외부 자동화의 단일 진입점
// 작성: 2026-04-30
// 위치: api/_lib/tools/trigger-make-webhook.ts
// ════════════════════════════════════════════════════════════════

// ─── 환경 변수 검증 ────────────────────────────────────────────
const MAKE_BASE_URL = process.env.MAKE_WEBHOOK_BASE_URL;
// 예: https://hook.eu1.make.com (대표님 리전)

// ─── 등록된 Make.com 시나리오 ──────────────────────────────────
// 각 시나리오마다 고유한 webhook ID
// 환경 변수에서 개별 ID 읽기 (보안)
const WEBHOOKS: Record<string, string | undefined> = {
  // 메시지 발송
  send_kakao: process.env.MAKE_WEBHOOK_KAKAO,
  send_kakao_bulk: process.env.MAKE_WEBHOOK_KAKAO_BULK,  // 솔라피
  send_email: process.env.MAKE_WEBHOOK_EMAIL,
  
  // 핫리드 처리
  hot_lead_to_fp: process.env.MAKE_WEBHOOK_HOTLEAD_FP,
  hot_lead_to_ceo: process.env.MAKE_WEBHOOK_HOTLEAD_CEO,
  
  // 콘텐츠 자동화
  create_short_video: process.env.MAKE_WEBHOOK_SHORT_VIDEO,  // HeyGen + OpusClip
  publish_to_social: process.env.MAKE_WEBHOOK_BUFFER,         // Buffer
  
  // 보고
  daily_report: process.env.MAKE_WEBHOOK_DAILY_REPORT,
  weekly_report: process.env.MAKE_WEBHOOK_WEEKLY_REPORT,
  
  // 결제 / 사업
  payment_notification: process.env.MAKE_WEBHOOK_PAYMENT,
  new_user_welcome: process.env.MAKE_WEBHOOK_WELCOME,
};

// ─── 결과 타입 ─────────────────────────────────────────────────
type WebhookResult = {
  success: boolean;
  scenario: string;
  webhook_id?: string;
  status_code?: number;
  response?: any;
  error?: string;
};

// ─── 메인 함수 ─────────────────────────────────────────────────
export async function triggerMakeWebhook(params: {
  scenario: keyof typeof WEBHOOKS;
  payload: Record<string, any>;
  wait_for_response?: boolean;  // 결과 대기 (기본 true)
}): Promise<WebhookResult> {
  const { scenario, payload, wait_for_response = true } = params;
  
  // 1. 시나리오 등록 확인
  const webhookId = WEBHOOKS[scenario];
  if (!webhookId) {
    return {
      success: false,
      scenario,
      error: `시나리오 '${scenario}' 미등록 (환경 변수 MAKE_WEBHOOK_${scenario.toUpperCase()} 필요)`,
    };
  }
  
  // 2. URL 구성
  const baseUrl = MAKE_BASE_URL || 'https://hook.eu1.make.com';
  const fullUrl = `${baseUrl}/${webhookId}`;
  
  console.log(`[triggerMakeWebhook] ${scenario} → ${webhookId.substring(0, 10)}...`);
  
  try {
    // 3. POST 요청
    const requestPayload = {
      ...payload,
      _meta: {
        triggered_by: 'jennya',
        triggered_at: new Date().toISOString(),
        scenario,
      },
    };
    
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Jennya-Manager/1.0',
      },
      body: JSON.stringify(requestPayload),
    };
    
    // 응답 대기 안 함 (fire-and-forget)
    if (!wait_for_response) {
      // 비동기로 발송만 (응답 무시)
      fetch(fullUrl, fetchOptions).catch(err => {
        console.warn(`[triggerMakeWebhook] 비동기 호출 에러 (무시):`, err.message);
      });
      
      return {
        success: true,
        scenario,
        webhook_id: webhookId.substring(0, 10) + '...',
        response: { mode: 'fire_and_forget', message: '발송됨 (응답 대기 X)' },
      };
    }
    
    // 응답 대기
    const response = await fetch(fullUrl, fetchOptions);
    
    let responseData: any;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    return {
      success: response.ok,
      scenario,
      webhook_id: webhookId.substring(0, 10) + '...',
      status_code: response.status,
      response: responseData,
    };
  } catch (error: any) {
    console.error(`[triggerMakeWebhook] ${scenario} 실패:`, error.message);
    return {
      success: false,
      scenario,
      error: error.message,
    };
  }
}

// ─── Claude Tool Use 정의 ──────────────────────────────────────
export const triggerMakeWebhookTool = {
  name: 'triggerMakeWebhook',
  description: `Make.com 자동화 시나리오를 트리거합니다. 외부 서비스 (카카오, 솔라피, HeyGen, Buffer 등) 호출의 단일 진입점.

사용 가능한 시나리오:
- send_kakao: 단일 카톡 알림 (즉시 발송)
- send_kakao_bulk: 솔라피 대량 카톡 발송
- send_email: 이메일 발송
- hot_lead_to_fp: 핫리드 FP에게 알림
- hot_lead_to_ceo: 핫리드 CEO에게 알림
- create_short_video: HeyGen + OpusClip 쇼츠 제작
- publish_to_social: Buffer로 소셜 미디어 예약
- daily_report: 일일 보고서 생성
- weekly_report: 주간 보고서 생성
- payment_notification: 결제 알림
- new_user_welcome: 신규 사용자 환영

예시:
- 핫리드 FP에게: scenario='hot_lead_to_fp', payload={fp_email, lead_data}
- 카톡 발송: scenario='send_kakao', payload={phone, message}
- 쇼츠 제작: scenario='create_short_video', payload={script, voice_id}`,
  input_schema: {
    type: 'object',
    properties: {
      scenario: {
        type: 'string',
        enum: [
          'send_kakao',
          'send_kakao_bulk',
          'send_email',
          'hot_lead_to_fp',
          'hot_lead_to_ceo',
          'create_short_video',
          'publish_to_social',
          'daily_report',
          'weekly_report',
          'payment_notification',
          'new_user_welcome',
        ],
        description: '실행할 Make.com 시나리오',
      },
      payload: {
        type: 'object',
        description: '시나리오에 전달할 데이터 (자유 형식)',
      },
      wait_for_response: {
        type: 'boolean',
        description: '응답 대기 여부 (기본 true). false면 발송 후 즉시 반환',
      },
    },
    required: ['scenario', 'payload'],
  },
};

export default triggerMakeWebhook;
