// ════════════════════════════════════════════════════════════════
// 제니야 도구 통합 모듈 v2
// 6개 도구: 조회 3개 + 발송 3개
// 작성: 2026-04-30
// 위치: api/_lib/tools/index.ts
// ════════════════════════════════════════════════════════════════

// ─── 조회 도구 (Phase 5-1) ─────────────────────────────────────
import queryFirestore, { queryFirestoreTool } from './query-firestore.js';
import getKPI, { getKPITool } from './get-kpi.js';
import getUserStats, { getUserStatsTool } from './get-user-stats.js';

// ─── 발송 도구 (Phase 5-3) ─────────────────────────────────────
import triggerMakeWebhook, { triggerMakeWebhookTool } from './trigger-make-webhook.js';
import sendKakaoTalk, { sendKakaoTalkTool } from './send-kakaotalk.js';
import sendEmail, { sendEmailTool } from './send-email.js';

// ─── 모든 도구 정의 ────────────────────────────────────────────
export const ALL_TOOLS = [
  // 조회 (LOW 위험도 - 즉시 자동 실행)
  queryFirestoreTool,
  getKPITool,
  getUserStatsTool,
  
  // 발송 (MEDIUM 위험도 - 실행 + 즉시 보고)
  triggerMakeWebhookTool,
  sendKakaoTalkTool,
  sendEmailTool,
];

// ─── 도구 함수 매핑 ────────────────────────────────────────────
const TOOL_FUNCTIONS: Record<string, (params: any) => Promise<any>> = {
  queryFirestore,
  getKPI,
  getUserStats,
  triggerMakeWebhook,
  sendKakaoTalk,
  sendEmail,
};

// ─── 위험도 매핑 ───────────────────────────────────────────────
export const TOOL_RISK_LEVELS: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {
  // LOW: 자동 실행
  queryFirestore: 'LOW',
  getKPI: 'LOW',
  getUserStats: 'LOW',
  
  // MEDIUM: 실행 + 즉시 보고
  triggerMakeWebhook: 'MEDIUM',
  sendKakaoTalk: 'MEDIUM',
  sendEmail: 'MEDIUM',
};

// ─── 도구 실행 라우터 ──────────────────────────────────────────
export async function executeTool(
  toolName: string,
  params: any
): Promise<{
  success: boolean;
  result?: any;
  error?: string;
  risk_level?: string;
}> {
  try {
    console.log(`[ToolRouter] 실행: ${toolName} (위험도: ${TOOL_RISK_LEVELS[toolName] || 'UNKNOWN'})`);
    
    const fn = TOOL_FUNCTIONS[toolName];
    if (!fn) {
      return {
        success: false,
        error: `알 수 없는 도구: ${toolName}`,
      };
    }
    
    const result = await fn(params);
    
    return {
      success: true,
      result,
      risk_level: TOOL_RISK_LEVELS[toolName],
    };
  } catch (error: any) {
    console.error(`[ToolRouter] ${toolName} 실패:`, error.message);
    return {
      success: false,
      error: error.message,
      risk_level: TOOL_RISK_LEVELS[toolName],
    };
  }
}

// ─── 도구 이름 목록 ────────────────────────────────────────────
export const TOOL_NAMES = ALL_TOOLS.map(t => t.name);

// ─── 도구 설명 ─────────────────────────────────────────────────
export function listTools(): Array<{ name: string; description: string; risk: string }> {
  return ALL_TOOLS.map(t => ({
    name: t.name,
    description: t.description.split('\n')[0],
    risk: TOOL_RISK_LEVELS[t.name] || 'UNKNOWN',
  }));
}

export default {
  ALL_TOOLS,
  TOOL_NAMES,
  TOOL_RISK_LEVELS,
  executeTool,
  listTools,
};
