// ════════════════════════════════════════════════════════════════
// 제니야 코딩 도구: 파일 읽기
// 위험도: LOW (읽기만, 자동 실행 가능)
// 작성: 2026-04-30
// 위치: api/_lib/tools/code-tools/read-file.ts
// ════════════════════════════════════════════════════════════════

import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, normalize } from 'node:path';

// ─── 안전: 접근 가능한 디렉터리만 ──────────────────────────────
const ALLOWED_DIRS = [
  '/var/task',           // Vercel 런타임
  '/tmp',                // 임시 파일
  process.cwd(),         // 현재 작업 디렉터리
];

// ─── 차단: 민감 파일 ──────────────────────────────────────────
const BLOCKED_PATTERNS = [
  '.env',
  'secret',
  'credential',
  'private-key',
  'id_rsa',
  '.git/',
  'node_modules/',
];

function validatePath(path: string): { valid: boolean; error?: string; absolutePath?: string } {
  // 정규화
  const absolutePath = resolve(normalize(path));

  // 차단 패턴 검사
  for (const pattern of BLOCKED_PATTERNS) {
    if (absolutePath.includes(pattern)) {
      return {
        valid: false,
        error: `차단된 파일/디렉터리: ${pattern}`,
      };
    }
  }

  // 허용 디렉터리 검사
  const allowed = ALLOWED_DIRS.some(dir => absolutePath.startsWith(resolve(dir)));
  if (!allowed) {
    return {
      valid: false,
      error: `허용되지 않은 디렉터리: ${absolutePath}`,
    };
  }

  // 파일 존재 검사
  if (!existsSync(absolutePath)) {
    return {
      valid: false,
      error: `파일 없음: ${absolutePath}`,
    };
  }

  return { valid: true, absolutePath };
}

export async function readFile(params: {
  path: string;
  start_line?: number;
  end_line?: number;
}): Promise<{
  success: boolean;
  content?: string;
  total_lines?: number;
  shown_lines?: { start: number; end: number };
  size_bytes?: number;
  error?: string;
}> {
  try {
    // ─── 1. 경로 검증 ──────────────────────────────────────
    const validation = validatePath(params.path);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const absolutePath = validation.absolutePath!;

    // ─── 2. 파일 크기 확인 (10MB 제한) ─────────────────────
    const stats = statSync(absolutePath);
    if (stats.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: `파일 너무 큼 (${(stats.size / 1024 / 1024).toFixed(2)}MB / 최대 10MB)`,
      };
    }

    // ─── 3. 파일 읽기 ──────────────────────────────────────
    console.log(`[readFile] 읽기: ${absolutePath} (${stats.size} bytes)`);
    const content = readFileSync(absolutePath, 'utf-8');
    const lines = content.split('\n');
    const totalLines = lines.length;

    // ─── 4. 라인 범위 적용 (선택) ──────────────────────────
    let shownContent = content;
    let shownLines = { start: 1, end: totalLines };

    if (params.start_line !== undefined || params.end_line !== undefined) {
      const start = Math.max(1, params.start_line || 1);
      const end = Math.min(totalLines, params.end_line || totalLines);

      if (start > end) {
        return {
          success: false,
          error: `잘못된 라인 범위: ${start} > ${end}`,
        };
      }

      shownContent = lines.slice(start - 1, end).join('\n');
      shownLines = { start, end };
    }

    // ─── 5. 너무 긴 결과 잘라내기 (5만자 제한) ─────────────
    if (shownContent.length > 50000) {
      shownContent = shownContent.substring(0, 50000) + '\n\n[... 결과 잘림, 50,000자 초과 ...]';
    }

    return {
      success: true,
      content: shownContent,
      total_lines: totalLines,
      shown_lines: shownLines,
      size_bytes: stats.size,
    };
  } catch (error: any) {
    console.error('[readFile] 예외:', error.message);
    return { success: false, error: error.message };
  }
}

export const readFileTool = {
  name: 'readFile',
  description: `파일 내용을 읽습니다 (LOW 위험도, 자동 실행).

사용 예:
- 전체 읽기: { "path": "api/cron/daily-report.ts" }
- 일부 읽기: { "path": "api/cron/daily-report.ts", "start_line": 1, "end_line": 50 }

제한:
- 최대 10MB 파일
- 최대 50,000자 결과
- .env, secret, .git/, node_modules/ 차단`,
  input_schema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: '파일 경로 (상대 또는 절대)' },
      start_line: { type: 'integer', description: '시작 라인 (선택, 1부터 시작)' },
      end_line: { type: 'integer', description: '종료 라인 (선택)' },
    },
    required: ['path'],
  },
};

export default readFile;
