export interface ServiceItem {
  id: string;
  type: 'consulting' | 'lecture';
  title: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  recommended?: boolean;
}

interface ConsultingPageProps {
  onBack: () => void;
  onApply: (service: ServiceItem) => void;
}

const services: ServiceItem[] = [
  {
    id: 'consulting-online',
    type: 'consulting',
    title: '1:1 비대면 재무상담',
    description: '화상으로 진행하는 맞춤형 재무설계 상담',
    price: 330000,
    duration: '90분',
    features: [
      '현재 재무상태 정밀 진단',
      '맞춤형 재무목표 설정',
      '실행 가능한 액션플랜 제공',
      '상담 후 요약 리포트 제공'
    ],
    recommended: true
  },
  {
    id: 'consulting-offline',
    type: 'consulting',
    title: '1:1 대면 재무상담',
    description: '직접 만나서 진행하는 심층 재무설계 상담',
    price: 550000,
    duration: '120분',
    features: [
      '비대면 상담 모든 항목 포함',
      '재무제표 심층 분석',
      '투자 포트폴리오 점검',
      '세무/법률 기초 상담',
      '3개월 후 팔로업 상담 포함'
    ]
  },
  {
    id: 'lecture-basic',
    type: 'lecture',
    title: '금융집짓기 기초 강의',
    description: '재무설계의 기본 원리를 배우는 온라인 강의',
    price: 99000,
    duration: '총 4시간 (4회)',
    features: [
      '재무설계 기본 개념',
      '수입/지출 관리법',
      '저축과 투자의 기초',
      '보험 설계 기본 원리'
    ]
  },
  {
    id: 'lecture-advanced',
    type: 'lecture',
    title: '금융집짓기 심화 강의',
    description: '실전 재무설계 전략을 배우는 온라인 강의',
    price: 199000,
    duration: '총 8시간 (8회)',
    features: [
      '기초 강의 모든 내용 포함',
      '부동산 투자 전략',
      '세금 최적화 방법',
      '은퇴 설계 전략',
      '자녀 교육비 설계'
    ]
  }
];

function ConsultingPage({ onBack, onApply }: ConsultingPageProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="p-2 -ml-2">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-800 -ml-8">전문가 상담 · 강의</h1>
        </div>
      </div>

      {/* 전문가 소개 */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-purple-700 text-2xl font-bold shadow-lg">
            오
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">오상열 대표</span>
              <span className="text-xs bg-blue-500 px-2 py-0.5 rounded font-bold">CFP</span>
            </div>
            <p className="text-purple-200 text-sm mt-1">금융집짓기® 창시자</p>
            <p className="text-purple-100 text-xs mt-2">20년+ 재무설계 경력 | 前 교수</p>
          </div>
        </div>
      </div>

      {/* 서비스 목록 */}
      <div className="p-4 space-y-4">
        {/* 상담 서비스 */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            💬 1:1 재무상담
          </h2>
          <div className="space-y-3">
            {services.filter(s => s.type === 'consulting').map(service => (
              <div 
                key={service.id}
                className={`bg-white rounded-xl p-4 border-2 ${service.recommended ? 'border-purple-500' : 'border-gray-200'} shadow-sm`}
              >
                {service.recommended && (
                  <span className="inline-block bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold mb-2">
                    추천
                  </span>
                )}
                <h3 className="font-bold text-gray-800">{service.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">⏱ {service.duration}</span>
                </div>
                <ul className="mt-3 space-y-1">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xl font-bold text-purple-600">{formatPrice(service.price)}원</span>
                  <button 
                    onClick={() => onApply(service)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 active:scale-95 transition-all"
                  >
                    신청하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 강의 서비스 */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            📚 온라인 강의
          </h2>
          <div className="space-y-3">
            {services.filter(s => s.type === 'lecture').map(service => (
              <div 
                key={service.id}
                className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm"
              >
                <h3 className="font-bold text-gray-800">{service.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">⏱ {service.duration}</span>
                </div>
                <ul className="mt-3 space-y-1">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xl font-bold text-purple-600">{formatPrice(service.price)}원</span>
                  <button 
                    onClick={() => onApply(service)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 active:scale-95 transition-all"
                  >
                    신청하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 문의 안내 */}
        <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-200">
          <p className="text-sm text-amber-800">
            💡 <strong>궁금한 점이 있으신가요?</strong><br />
            카카오톡 채널 "AI머니야"로 문의해주세요.
          </p>
        </div>
      </div>

      {/* 하단 여백 */}
      <div className="h-8"></div>
    </div>
  );
}

export default ConsultingPage;
