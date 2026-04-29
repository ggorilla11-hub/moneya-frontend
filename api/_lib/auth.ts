// ════════════════════════════════════════════════════════════════
// 제니야 인증 라이브러리
// 대표님(ggorilla11) 권한 검증 + Cron 보안 토큰 검증
// 작성: 2026-04-29
// 위치: api/_lib/auth.ts
// ════════════════════════════════════════════════════════════════

import type { VercelRequest } from '@vercel/node';

// ─── 환경 변수 검증 ────────────────────────────────────────────
const ADMIN_UID = process.env.ADMIN_UID;
const CRON_SECRET = process.env.CRON_SECRET;

if (!ADMIN_UID) {
  throw new Error('ADMIN_UID 환경 변수가 설정되지 않았습니다.');
}

if (!CRON_SECRET) {
  throw new Error('CRON_SECRET 환경 변수가 설정되지 않았습니다.');
}

// ─── 인증 결과 타입 ────────────────────────────────────────────
export type AuthResult = {
  authenticated: boolean;
  reason?: string;
  uid?: string;
};

// ─── 1. Cron Secret 검증 (자동 작업용) ─────────────────────────
export function verifyCronSecret(request: VercelRequest): AuthResult {
  // Vercel Cron의 표준 헤더
  const authHeader = request.headers['authorization'];

  if (!authHeader) {
    return {
      authenticated: false,
      reason: 'Authorization 헤더 없음',
    };
  }

  // "Bearer <CRON_SECRET>" 형식
  const expectedHeader = `Bearer ${CRON_SECRET}`;
  if (authHeader !== expectedHeader) {
    return {
      authenticated: false,
      reason: 'CRON_SECRET 불일치',
    };
  }

  return {
    authenticated: true,
    uid: 'cron_job',
  };
}

// ─── 2. 대표님 권한 검증 (UID 기반) ────────────────────────────
export function verifyAdminUid(request: VercelRequest): AuthResult {
  // 헤더에서 UID 추출 (frontend에서 전달)
  const uid = request.headers['x-user-uid'] as string;

  if (!uid) {
    return {
      authenticated: false,
      reason: 'X-User-UID 헤더 없음',
    };
  }

  if (uid !== ADMIN_UID) {
    return {
      authenticated: false,
      reason: '대표님 UID 불일치 (다른 사용자 차단)',
    };
  }

  return {
    authenticated: true,
    uid,
  };
}

// ─── 3. 통합 검증 (Cron 또는 대표님) ───────────────────────────
export function verifyAuth(request: VercelRequest): AuthResult {
  // Cron 토큰 먼저 시도
  const cronResult = verifyCronSecret(request);
  if (cronResult.authenticated) return cronResult;

  // 대표님 UID 시도
  const userResult = verifyAdminUid(request);
  if (userResult.authenticated) return userResult;

  return {
    authenticated: false,
    reason: '인증 실패: Cron Secret 또는 ADMIN_UID 필요',
  };
}

// ─── 4. 인증 필요 응답 ─────────────────────────────────────────
export function unauthorizedResponse(reason: string = '인증 실패') {
  return {
    error: 'Unauthorized',
    message: reason,
    statusCode: 401,
  };
}

// ─── 5. 사용자 ID 가져오기 (요청에서) ──────────────────────────
export function getUserUid(request: VercelRequest): string | null {
  return (request.headers['x-user-uid'] as string) || null;
}

// ─── 6. ADMIN_UID 노출 (다른 모듈에서 사용) ─────────────────────
export function getAdminUid(): string {
  return ADMIN_UID;
}

// ─── 7. 내보내기 ───────────────────────────────────────────────
export default {
  verifyCronSecret,
  verifyAdminUid,
  verifyAuth,
  unauthorizedResponse,
  getUserUid,
  getAdminUid,
};
