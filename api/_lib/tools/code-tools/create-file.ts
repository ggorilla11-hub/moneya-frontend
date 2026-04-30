// ════════════════════════════════════════════════════════════════
// 제니야 코딩 도구: 파일 생성
// 위험도: MEDIUM (실행 + 즉시 보고)
// 작성: 2026-04-30
// 위치: api/_lib/tools/code-tools/create-file.ts
//
// 안전장치:
// - 기존 파일 덮어쓰기 차단 (덮어쓰려면 editFile 사용)
// - 차단 디렉터리 제한
// - 파일 크기 제한
// ════════════════════════════════════════════════════════════════

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, normalize, dirname } from 'node:path';

// ─── 안전: 작성 가능한 디렉터리만 ──────────────────────────────
const ALLOWED_WRITE_DIRS = [
  '/tmp',
  process.cwd(),
];

// ─── 차단: 위험 디렉터리 ──────────────────────────────────────
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

// ─── 차단: 시스템 중요 파일 ────────────────────────────────────
const BLOCKED_FILES = [
  'package.json',
  'tsconfig.json',
  'vercel.json',
  'vite.config.ts',
  '.gitignore',
];

function validateWritePath(path: string): {
  valid: boolean;
  error?: string;
  absolutePath?: string;
} {
  const absolutePath = resolve(normalize(path));

  // 차단 패턴 검사
  for (const pattern of BLOCKED_PATTERNS) {
    if (absolutePath.includes(pattern)) {
      return {
        valid: false,
        error: `차단된 경로: ${pattern}`,
      };
    }
  }

  // 차단 파일 검사
  const fileName = absolutePath.split('/').pop() || '';
  if (BLOCKED_FILES.includes(fileName)) {
    return {
      valid: false,
      error: `시스템 파일 직접 수정 차단: ${fileName}. editFile 사용 (대표님 승인).`,
    };
  }

  // 허용 디렉터리 검사
  const allowed = ALLOWED_WRITE_DIRS.some(dir =>
    absolutePath.startsWith(resolve(dir))
  );
  if (!allowed) {
    return {
      valid: false,
      error: `작성 허용되지 않은 디렉터리: ${absolutePath}`,
    };
  }

  // 기존 파일 검사 (덮어쓰기 차단)
  if (existsSync(absolutePath)) {
    return {
      valid: false,
      error: `이미 존재하는 파일: ${absolutePath}. 수정하려면 editFile 사용.`,
    };
  }

  return { valid: true, absolutePath };
}

export async function createFile(params: {
  path: string;
  content: string;
  description?: string;  // 무엇을 위한 파일인지 (보고용)
}): Promise<{
  success: boolean;
  path?: string;
  size_bytes?: number;
  lines?: number;
  description?: string;
  error?: string;
}> {
  try {
    // ─── 1. 입력 검증 ──────────────────────────────────────
    if (!params.path || !params.content) {
      return {
        success: false,
        error: 'path와 content 모두 필수',
      };
    }

    // ─── 2. 경로 검증 ──────────────────────────────────────
    const validation = validateWritePath(params.path);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const absolutePath = validation.absolutePath!;

    // ─── 3. 내용 크기 검증 (1MB 제한) ──────────────────────
    const contentSize = Buffer.byteLength(params.content, 'utf-8');
    if (contentSize > 1024 * 1024) {
      return {
        success: false,
        error: `파일 너무 큼 (${(contentSize / 1024).toFixed(2)}KB / 최대 1024KB)`,
      };
    }

    // ─── 4. 부모 디렉터리 생성 (필요 시) ───────────────────
    const parentDir = dirname(absolutePath);
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true });
      console.log(`[createFile] 디렉터리 생성: ${parentDir}`);
    }

    // ─── 5. 파일 작성 ──────────────────────────────────────
    console.log(`[createFile] 작성: ${absolutePath} (${contentSize} bytes)`);
    writeFileSync(absolutePath, params.content, 'utf-8');

    const lines = params.content.split('\n').length;

    return {
      success: true,
      path: absolutePath,
      size_bytes: contentSize,
      lines: lines,
      description: params.description || '파일 생성',
    };
  } catch (error: any) {
    console.error('[createFile] 예외:', error.message);
    return { success: false, error: error.message };
  }
}

export const createFileTool = {
  name: 'createFile',
  description: `새 파일을 생성합니다 (MEDIUM 위험도).

⚠️ 안전장치:
- 기존 파일 덮어쓰기 차단 (editFile 사용)
- package.json, tsconfig.json 등 시스템 파일 차단
- .env, secret 등 민감 파일 차단
- 최대 1MB
- 부모 디렉터리 자동 생성

사용 예:
{
  "path": "api/test/hello.ts",
  "content": "console.log('Hello');",
  "description": "테스트용 파일"
}`,
  input_schema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: '파일 경로 (상대 또는 절대)' },
      content: { type: 'string', description: '파일 내용' },
      description: { type: 'string', description: '파일 용도 설명 (선택)' },
    },
    required: ['path', 'content'],
  },
};

export default createFile;
