// ConsultingPage.tsx
// 전문가 상담·강의 신청 페이지
// 베이스캠프 5.0 - PHASE 0-1

import { useState } from 'react';

// 상품 타입 정의
interface ServiceItem {
  id: string;
  type: 'consulting' | 'lecture';
  title: string;
  description: string;
  price: number;
  priceDisplay: string;
  icon: string;
  iconBg: string;
  isPremium: boolean;
  badge?: string;
  paypleUrl: string;
}

// 상품 목록 (페이플 URL 포함)
const SERVICES: ServiceItem[] = [
  {
    id: 'consulting-online',
    type: 'consulting',
    title: '비대면 상담',
    description: '화상으로 진행되는 1:1 맞춤 재무상담\n2회 진행 · 일정 별도 협의',
    price: 330000,
    priceDisplay: '33만원',
    icon: '📹',
    iconBg: 'bg-blue-100',
    isPremium: false,
    paypleUrl: 'https://link.payple.kr/NzcxOjc2MTU0NzE0MjE5Mzk1'
  },
  {
    id: 'consulting-offline',
    type: 'consulting',
    title: '대면 상담',
    description: '직접 만나서 진행하는 심층 재무상담\n2회 진행 · 일정 별도 협의',
    price: 550000,
    priceDisplay: '55만원',
    icon: '🤝',
    iconBg: 'bg-green-100',
    isPremium: false,
    paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzU4NjYzMDE4'
  },
  {
    id: 'consulting-vip',
    type: 'consulting',
    title: '자산가 상담',
    description: '금융자산 10억원 초과 고객 전용 VIP 상담\n3회 진행 · 일정 별도 협의',
    price: 1100000,
    priceDisplay: '110만원',
    icon: '👑',
    iconBg: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
    isPremium: true,
    badge: '💎 PREMIUM',
    paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzY3MzM3NjA0'
  },
  {
    id: 'lecture-online',
    type: 'lecture',
    title: '일반인 비대면 수업',
    description: '주 1회 · 매주 2시간 · 4주간 총 8시간\n수강 종료 후 월 1회 월례교육 포함',
    price: 550000,
    priceDisplay: '55만원',
    icon: '🎓',
    iconBg: 'bg-indigo-100',
    isPremium: false,
    paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzcyMjc4MzY3'
  },
  {
    id: 'lecture-pro',
    type: 'lecture',
    title: '전문가 수업',
    description: '대면 4주 + 비대면 1년간 수업\n매주 토요일 오후 1-6시 (5시간)\n📍 선릉역 강의장',
    price: 1100000,
    priceDisplay: '110만원',
    icon: '🎖️',
    iconBg: 'bg-pink-100',
    isPremium: true,
    badge: '🏆 ADVANCED',
    paypleUrl: 'https://link.payple.kr/NzcxOjc2MTU0NTgyMDA0MDQ4'
  }
];

interface ConsultingPageProps {
  onBack: () => void;
  onApply: (service: ServiceItem) => void;
}

export default function ConsultingPage({ onBack, onApply }: ConsultingPageProps) {
  const consultingServices = SERVICES.filter(s => s.type === 'consulting');
  const lectureServices = SERVICES.filter(s => s.type === 'lecture');

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <button 
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-lg"
        >
          ←
        </button>
        <h1 className="flex-1 text-lg font-bold text-gray-900">전문가 상담 · 강의</h1>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        
        {/* 전문가 배너 */}
        <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-5 mb-5 flex gap-4 items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-lg flex-shrink-0 bg-gray-200">
            {/* 오상열 대표 사진 - 실제 이미지 URL로 교체 필요 */}
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-3xl">
              👨‍💼
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-extrabold text-gray-900">
              오상열 대표
              <span className="ml-2 inline-block bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                CFP
              </span>
            </h2>
            <p className="text-sm font-bold text-yellow-700 mb-2">금융집짓기® 창시자</p>
            <p className="text-xs text-gray-600 leading-relaxed italic">
              "20년 경력의 재무설계 전문가가<br/>당신의 금융집을 함께 지어드립니다"
            </p>
          </div>
        </div>

        {/* 1:1 재무상담 */}
        <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-1.5">
          💼 1:1 재무상담
        </h3>

        {consultingServices.map(service => (
          <ServiceCard 
            key={service.id} 
            service={service} 
            onApply={() => onApply(service)} 
          />
        ))}

        {/* 재테크 & 재무설계 강의 */}
        <h3 className="text-sm font-extrabold text-gray-900 mb-3 mt-6 flex items-center gap-1.5">
          📚 재테크 & 재무설계 강의
        </h3>

        {lectureServices.map(service => (
          <ServiceCard 
            key={service.id} 
            service={service} 
            onApply={() => onApply(service)} 
          />
        ))}

        {/* 안내 박스 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mt-5">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
            💡 상담/강의 안내
          </h4>
          <ul className="space-y-1.5">
            <li className="text-xs text-gray-500 pl-4 relative before:content-['•'] before:absolute before:left-1">
              신청 후 24시간 내 연락드립니다
            </li>
            <li className="text-xs text-gray-500 pl-4 relative before:content-['•'] before:absolute before:left-1">
              일정은 개별 협의로 진행됩니다
            </li>
            <li className="text-xs text-gray-500 pl-4 relative before:content-['•'] before:absolute before:left-1">
              환불 규정: 수업 시작 전 100% 환불
            </li>
          </ul>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed border-gray-200">
            <span className="text-xs text-gray-500">📞 문의:</span>
            <strong className="text-xs text-gray-900">010-5424-5332</strong>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">📧 이메일:</span>
            <strong className="text-xs text-gray-900">osy0551@naver.com</strong>
          </div>
        </div>

        {/* 하단 여백 */}
        <div className="h-4" />
      </div>
    </div>
  );
}

// 서비스 카드 컴포넌트
function ServiceCard({ 
  service, 
  onApply 
}: { 
  service: ServiceItem; 
  onApply: () => void;
}) {
  return (
    <div className={`
      bg-white border-2 rounded-2xl p-4 mb-3 relative
      ${service.isPremium ? 'border-yellow-500' : 'border-gray-200'}
    `}>
      {/* 프리미엄 뱃지 */}
      {service.badge && (
        <div className="absolute -top-2 right-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
          {service.badge}
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-2.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${service.iconBg}`}>
          {service.icon}
        </div>
        <span className="text-base font-bold text-gray-900">{service.title}</span>
      </div>

      {/* 설명 */}
      <p className="text-xs text-gray-500 leading-relaxed mb-3 whitespace-pre-line">
        {service.description}
      </p>

      {/* 푸터 */}
      <div className="flex justify-between items-center">
        <span className="text-lg font-extrabold text-gray-900">{service.priceDisplay}</span>
        <button
          onClick={onApply}
          className={`
            px-5 py-2.5 rounded-xl text-sm font-bold text-white
            ${service.isPremium 
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
              : 'bg-gradient-to-r from-teal-400 to-teal-500'
            }
          `}
        >
          신청하기
        </button>
      </div>
    </div>
  );
}

// 서비스 아이템 타입 export
export type { ServiceItem };
export { SERVICES };
