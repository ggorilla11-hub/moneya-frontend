// src/types/spend.ts
// AI머니야 지출 데이터 타입 정의

export type SpendType = 'spent' | 'saved' | 'investment';
export type EmotionType = '충동' | '선택' | '필수';
export type InputMethod = 'voice' | 'text' | 'manual' | 'ocr';

export interface SpendItem {
  id: string;
  userId: string;
  amount: number;
  type: SpendType;
  category: string;
  subCategory?: string;
  emotionType?: EmotionType;
  memo: string;
  tag?: string;
  inputMethod: InputMethod;
  timestamp: Date;
  createdAt: Date;
}

// 지출 카테고리
export const SPEND_CATEGORIES = {
  variable: [
    { id: 'food', name: '식비', emoji: '🍽️' },
    { id: 'cafe', name: '카페', emoji: '☕' },
    { id: 'transport', name: '교통', emoji: '🚌' },
    { id: 'shopping', name: '쇼핑', emoji: '🛒' },
    { id: 'leisure', name: '여가', emoji: '🎮' },
    { id: 'medical', name: '의료', emoji: '💊' },
    { id: 'telecom', name: '통신', emoji: '📱' },
    { id: 'etc', name: '기타', emoji: '📦' },
  ],
  fixed: [
    { id: 'savings', name: '저축투자', emoji: '💰' },
    { id: 'pension', name: '노후연금', emoji: '🏦' },
    { id: 'insurance', name: '보장성보험', emoji: '🛡️' },
    { id: 'loan', name: '대출원리금', emoji: '💳' },
  ],
} as const;

// 참음(감정저축) 사유
export const SAVED_REASONS = [
  'AI 조언 후',
  '예산 초과',
  '충동 억제',
  '필요 없어서',
  '대안 찾음',
] as const;

// 긴급도
export const URGENCY_OPTIONS = [
  '지금당장',
  '오늘중으로',
  '며칠내로',
] as const;
