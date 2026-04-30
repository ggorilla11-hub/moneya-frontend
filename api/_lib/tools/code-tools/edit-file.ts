// ════════════════════════════════════════════════════════════════
// 제니야 코딩 도구: 파일 수정
// 위험도: HIGH (대표님 승인 필수)
// 작성: 2026-04-30
// 위치: api/_lib/tools/code-tools/edit-file.ts
//
// 핵심 안전장치:
// 1. 자동 백업 (수정 전 원본 보관)
// 2. 정확한 문자열 매칭 (str_replace 방식)
// 3. 매칭이 정확히 1개일 때만 수정 (모호성 차단)
// 4. 시스템 파일 차단
// 5. diff 미리 보기 (보고용)
// ════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { resolve, normalize } from 'node:path';

// ─── 안전: 수정 가능한 디렉터리 ────────────────────────────────
const ALLOWED_EDIT_DIRS = [
  '/tmp',
  process.cwd(),
];

// ─── 차단: 위험 패턴 ──────────────────────────────────────────
const BLOCKED_PATTERNS = [
  '.env',
  'secret',
  'credential',
  'private-key',
  'id_rsa',
  '.git/',
  'node_modules/',
  '.vercel/',
  'package-lock.json',
];

// ─── 차단: 시스템 파일 ────────────────────────────────────────
const BLOCKED_FILES = [
  'package.json',
  'tsconfig.json',
  'vercel.json',
  '.gitignore',
];

function validateEditPath(path: string): {
  valid: boolean;
  error?: string;
  absolutePath?: string;
} {
  const absolutePath = resolve(normalize(path));

  // 차단 패턴
  for (const pattern of BLOCKED_PATTERNS) {
    if (absolutePath.includes(pattern)) {
      return { valid: false, error: `차단된 경로: ${pattern}` };
    }
  }

  // 차단 파일
  const fileName = absolutePath.split('/').pop() || '';
  if (BLOCKED_FILES.includes(fileName)) {
    return {
      valid: false,
      error: `시스템 파일 차단: ${fileName}. 대표님이 직접 수정 필요.`,
    };
  }

  // 허용 디렉터리
  const allowed = ALLOWED_EDIT_DIRS.some(dir =>
    absolutePath.startsWith(resolve(dir))
  );
  if (!allowed) {
    return {
      valid: false,
      error: `허용되지 않은 디렉터리: ${absolutePath}`,
    };
  }

  // 파일 존재
  if (!existsSync(absolutePath)) {
    return {
      valid: false,
      error: `파일 없음: ${absolutePath}. 새 파일은 createFile 사용.`,
    };
  }

  // 파일 크기
  const stats = statSync(absolutePath);
  if (stats.size > 5 * 1024 * 1024) {
    return {
      valid: false,
      error: `파일 너무 큼 (${(stats.size / 1024 / 1024).toFixed(2)}MB / 최대 5MB)`,
    };
  }

  return { valid: true, absolutePath };
}

// ─── 변경 미리 보기 (diff) 생성 ───────────────────────────────
function generateDiffPreview(
  oldStr: string,
  newStr: string,
  context = 2
): string {
  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');

  let preview = '';
  preview += `[변경 전 ${oldLines.length}줄]\n`;
  oldLines.slice(0, 5).forEach(line => {
    preview += `- ${line}\n`;
  });
  if (oldLines.length > 5) preview += `- ... (${oldLines.length - 5}줄 더)\n`;

  preview += `\n[변경 후 ${newLines.length}줄]\n`;
  newLines.slice(0, 5).forEach(line => {
    preview += `+ ${line}\n`;
  });
  if (newLines.length > 5) preview += `+ ... (${newLines.length - 5}줄 더)\n`;

  return preview;
}

export async function editFile(params: {
  path: string;
  old_str: string;     // 수정할 문자열 (정확히 매칭)
  new_str: string;     // 새 문자열
  description?: string; // 무엇을 수정하는지 (보고용)
}): Promise<{
  success: boolean;
  path?: string;
  changes?: {
    old_lines: number;
    new_lines: number;
    file_total_lines_before: number;
    file_total_lines_after: number;
  };
  diff_preview?: string;
  description?: string;
  error?: string;
}> {
  try {
    // ─── 1. 입력 검증 ──────────────────────────────────────
    if (!params.path || !params.old_str) {
      return {
        success: false,
        error: 'path와 old_str 필수 (new_str는 빈 문자열 가능 = 삭제)',
      };
    }

    if (params.old_str === params.new_str) {
      return {
        success: false,
        error: 'old_str과 new_str이 동일 (변경 사항 없음)',
      };
    }

    // ─── 2. 경로 검증 ──────────────────────────────────────
    const validation = validateEditPath(params.path);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const absolutePath = validation.absolutePath!;

    // ─── 3. 파일 읽기 ──────────────────────────────────────
    const originalContent = readFileSync(absolutePath, 'utf-8');
    const linesBefore = originalContent.split('\n').length;

    // ─── 4. 정확한 매칭 검사 ────────────────────────────────
    const occurrences = originalContent.split(params.old_str).length - 1;

    if (occurrences === 0) {
      return {
        success: false,
        error: `old_str가 파일에 존재하지 않음.\n\n검색한 문자열:\n${params.old_str.substring(0, 200)}${params.old_str.length > 200 ? '...' : ''}`,
      };
    }

    if (occurrences > 1) {
      return {
        success: false,
        error: `old_str가 ${occurrences}번 매칭됨 (정확히 1번이어야 함). 더 긴 컨텍스트 포함하여 unique하게 만드세요.`,
      };
    }

    // ─── 5. 자동 백업 ──────────────────────────────────────
    const backupPath = `${absolutePath}.backup-${Date.now()}`;
    writeFileSync(backupPath, originalContent, 'utf-8');
    console.log(`[editFile] 백업 생성: ${backupPath}`);

    // ─── 6. 수정 ───────────────────────────────────────────
    const newContent = originalContent.replace(params.old_str, params.new_str);
    const linesAfter = newContent.split('\n').length;

    writeFileSync(absolutePath, newContent, 'utf-8');
    console.log(`[editFile] 수정 완료: ${absolutePath}`);

    // ─── 7. 변경 미리 보기 ──────────────────────────────────
    const diffPreview = generateDiffPreview(params.old_str, params.new_str);

    return {
      success: true,
      path: absolutePath,
      changes: {
        old_lines: params.old_str.split('\n').length,
        new_lines: params.new_str.split('\n').length,
        file_total_lines_before: linesBefore,
        file_total_lines_after: linesAfter,
      },
      diff_preview: diffPreview,
      description: params.description || '파일 수정',
    };
  } catch (error: any) {
    console.error('[editFile] 예외:', error.message);
    return { success: false, error: error.message };
  }
}

export const editFileTool = {
  name: 'editFile',
  description: `기존 파일의 내용을 수정합니다 (HIGH 위험도, 대표님 승인 필수).

⚠️ 핵심 원칙:
- old_str는 파일에 정확히 1번만 존재해야 함 (모호성 차단)
- 매칭 안 되거나 여러 번이면 거부
- 자동 백업 생성 (.backup-{timestamp})

⚠️ 안전장치:
- package.json, tsconfig.json 등 시스템 파일 차단
- .env, secret 등 민감 파일 차단
- 최대 5MB 파일

사용 예:
{
  "path": "api/test/hello.ts",
  "old_str": "console.log('Hello');",
  "new_str": "console.log('Hello, Jenya!');",
  "description": "인사 메시지 변경"
}

⚠️ old_str 작성 팁:
- 충분한 컨텍스트 포함 (주변 줄 함께)
- 공백/들여쓰기 정확히 일치
- 파일 1번만 매칭되게 unique하게`,
  input_schema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: '파일 경로' },
      old_str: { type: 'string', description: '수정할 문자열 (정확히 1번 매칭)' },
      new_str: { type: 'string', description: '새 문자열 (빈 문자열 가능 = 삭제)' },
      description: { type: 'string', description: '수정 이유 (보고용)' },
    },
    required: ['path', 'old_str', 'new_str'],
  },
};

export default editFile;
