// 카테고리 정의
export interface CategoryInfo {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export const CATEGORIES: { [key: string]: CategoryInfo } = {
  '식비': { label: '식비', icon: '🍽️', color: 'bg-orange-500', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  '카페': { label: '카페', icon: '☕', color: 'bg-amber-600', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
  '교통': { label: '교통', icon: '🚌', color: 'bg-blue-500', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
  '쇼핑': { label: '쇼핑', icon: '🛒', color: 'bg-pink-500', bgColor: 'bg-pink-100', textColor: 'text-pink-600' },
  '여가': { label: '여가', icon: '🎮', color: 'bg-green-500', bgColor: 'bg-green-100', textColor: 'text-green-600' },
  '의료': { label: '의료', icon: '💊', color: 'bg-red-500', bgColor: 'bg-red-100', textColor: 'text-red-600' },
  '통신': { label: '통신', icon: '📱', color: 'bg-indigo-500', bgColor: 'bg-indigo-100', textColor: 'text-indigo-600' },
  '기타': { label: '기타', icon: '📦', color: 'bg-gray-500', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
};

// 키워드 기반 자동 카테고리 매핑
const CATEGORY_KEYWORDS: { [key: string]: string[] } = {
  '식비': ['밥', '식사', '점심', '저녁', '아침', '김밥', '치킨', '피자', '햄버거', '국밥', '찌개', '라면', '떡볶이', '삼겹살', '고기', '초밥', '회', '중국집', '짜장', '짬뽕', '배달', '요기요', '배민', '쿠팡이츠', '식당', '맛집', '반찬', '마트', '편의점', '도시락'],
  '카페': ['커피', '카페', '스타벅스', '투썸', '이디야', '메가커피', '컴포즈', '빽다방', '아메리카노', '라떼', '음료', '차', '베이커리', '빵', '케이크', '디저트'],
  '교통': ['택시', '버스', '지하철', '기차', 'KTX', '주유', '기름', '톨게이트', '고속도로', '주차', '카카오택시', '타다', '대리', '교통비', '티머니', '캐시비'],
  '쇼핑': ['옷', '신발', '가방', '쇼핑', '백화점', '아울렛', '무신사', '지그재그', '쿠팡', '11번가', '지마켓', '네이버쇼핑', '의류', '악세사리', '화장품', '올리브영'],
  '여가': ['영화', '게임', '넷플릭스', '유튜브', '웨이브', '티빙', '왓챠', '노래방', '볼링', '당구', 'PC방', '헬스', '운동', '골프', '등산', '여행', '숙소', '호텔', '펜션', '항공'],
  '의료': ['병원', '약국', '약', '진료', '치과', '안과', '피부과', '정형외과', '내과', '의원', '클리닉', '건강', '영양제', '비타민'],
  '통신': ['통신', '휴대폰', '인터넷', 'SKT', 'KT', 'LG', '요금', '데이터'],
};

// 내용(description)을 기반으로 카테고리 자동 추론
export function inferCategory(description: string, existingCategory?: string): string {
  // 이미 카테고리가 있으면 그대로 사용
  if (existingCategory && existingCategory !== '기타' && CATEGORIES[existingCategory]) {
    return existingCategory;
  }

  const lowerDesc = description.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return existingCategory || '기타';
}

// 카테고리 정보 가져오기
export function getCategoryInfo(category: string): CategoryInfo {
  return CATEGORIES[category] || CATEGORIES['기타'];
}

// 감정유형 색상
export const EMOTION_COLORS = {
  '충동': { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300' },
  '선택': { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-300' },
  '필수': { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-300' },
};

export function getEmotionColor(emotionType: string) {
  return EMOTION_COLORS[emotionType as keyof typeof EMOTION_COLORS] || EMOTION_COLORS['필수'];
}
