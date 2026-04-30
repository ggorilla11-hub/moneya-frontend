// ════════════════════════════════════════════════════════════════
// 제니야 메모리 통계 도구
// 위험도: LOW (읽기만, 자동 실행 가능)
// 작성: 2026-04-30
// 위치: api/_lib/tools/get-memory-stats.ts
//
// 메모리 누적 현황, 카테고리별 분포, 중요도별 분포
// ════════════════════════════════════════════════════════════════

import { getMemoryStats as getMemoryStatsLib } from '../memory-search.js';
import { getAdminUid } from '../auth.js';

export async function getMemoryStats(params: {
  include_breakdown?: boolean;  // true면 상세 분포 포함 (기본 true)
}): Promise<{
  success: boolean;
  result?: {
    total_memories: number;
    by_category: Record<string, number>;
    by_importance: Record<number, number>;
    summary: string;
  };
  error?: string;
}> {
  try {
    const userUid = getAdminUid();
    const stats = await getMemoryStatsLib(userUid);

    // ─── 한국어 카테고리 매핑 ────────────────────────────────
    const categoryKR: Record<string, string> = {
      decision: '결정',
      pattern: '패턴',
      learning: '학습',
      issue: '이슈',
      preference: '선호',
    };

    // ─── 한국어 중요도 매핑 ──────────────────────────────────
    const importanceKR: Record<number, string> = {
      5: '⭐⭐⭐⭐⭐ 핵심',
      4: '⭐⭐⭐⭐ 영구',
      3: '⭐⭐⭐ 6개월',
      2: '⭐⭐ 1개월',
      1: '⭐ 1주',
    };

    // ─── 카테고리별 한국어 변환 ──────────────────────────────
    const byCategoryKR: Record<string, number> = {};
    for (const [cat, count] of Object.entries(stats.byCategory)) {
      const krName = categoryKR[cat] || cat;
      byCategoryKR[`${krName} (${cat})`] = count;
    }

    // ─── 중요도별 한국어 변환 ──────────────────────────────────
    const byImportanceKR: Record<string, number> = {};
    for (const [imp, count] of Object.entries(stats.byImportance)) {
      const krName = importanceKR[Number(imp)] || `중요도 ${imp}`;
      byImportanceKR[krName] = count;
    }

    // ─── 요약 생성 ─────────────────────────────────────────────
    const topCategory = Object.entries(stats.byCategory)
      .sort((a, b) => b[1] - a[1])[0];
    const importantCount = (stats.byImportance[4] || 0) + (stats.byImportance[5] || 0);

    let summary = `총 ${stats.total} 건의 메모리가 누적되어 있습니다.`;
    if (topCategory) {
      summary += ` 가장 많은 카테고리는 "${categoryKR[topCategory[0]] || topCategory[0]}" (${topCategory[1]}건).`;
    }
    if (importantCount > 0) {
      summary += ` 영구 보관급(중요도 4-5) 메모리: ${importantCount}건.`;
    }
    if (stats.total === 0) {
      summary = '아직 누적된 메모리가 없습니다. 대화가 쌓이면 자동으로 학습됩니다.';
    }

    console.log(`[getMemoryStats] 총 ${stats.total}건 조회`);

    return {
      success: true,
      result: {
        total_memories: stats.total,
        by_category: byCategoryKR,
        by_importance: byImportanceKR,
        summary: summary,
      },
    };
  } catch (error: any) {
    console.error('[getMemoryStats] 에러:', error.message);
    return { success: false, error: error.message };
  }
}

export const getMemoryStatsTool = {
  name: 'getMemoryStats',
  description: `누적된 메모리 통계를 조회합니다 (LOW 위험도, 자동 실행).

조회 내용:
- 총 메모리 수
- 카테고리별 분포 (decision/pattern/learning/issue/preference)
- 중요도별 분포 (1-5)
- 한국어 요약

사용 예:
- {"include_breakdown": true}  // 상세 분포
- {}  // 전체 통계 (기본)

언제 사용:
- 대표님이 "메모리 현황 알려줘" 요청 시
- 시스템 점검 시
- 학습 진척도 보고 시`,
  input_schema: {
    type: 'object',
    properties: {
      include_breakdown: {
        type: 'boolean',
        description: '상세 분포 포함 (기본 true)',
      },
    },
  },
};

export default getMemoryStats;
