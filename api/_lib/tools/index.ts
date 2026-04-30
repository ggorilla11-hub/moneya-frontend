// ════════════════════════════════════════════════════════════════
// 제니야 도구 통합 모듈
// 모든 도구 export + 동적 실행 라우터
// 작성: 2026-04-30
// 위치: api/_lib/tools/index.ts
// ════════════════════════════════════════════════════════════════

import queryFirestore, { queryFirestoreTool } from './query-firestore.js';
import getKPI, { getKPITool } from './get-kpi.js';
import getUserStats, { getUserStatsTool } from './get-user-stats.js';

// ─── 모든 도구 정의 ────────────────────────────────────────────
export const ALL_TOOLS = [
  queryFirestoreTool,
  getKPITool,
  getUserStatsTool,
];

// ─── 도구 함수 매핑 ────────────────────────────────────────────
const TOOL_FUNCTIONS: Record<string, (params: any) => Promise<any>> = {
  queryFirestore,
  getKPI,
  getUserStats,
};

// ─── 도구 실행 라우터 ──────────────────────────────────────────
export async function executeTool(
  toolName: string,
  params: any
): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> {
  try {
    console.log(`[ToolRouter] 실행: ${toolName}`);
    
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
    };
  } catch (error: any) {
    console.error(`[ToolRouter] ${toolName} 실패:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ─── 도구 이름 목록 ────────────────────────────────────────────
export const TOOL_NAMES = ALL_TOOLS.map(t => t.name);

// ─── 도구 설명 (디버깅용) ──────────────────────────────────────
export function listTools(): string[] {
  return ALL_TOOLS.map(t => `${t.name}: ${t.description.split('\n')[0]}`);
}

export default {
  ALL_TOOLS,
  TOOL_NAMES,
  executeTool,
  listTools,
};
