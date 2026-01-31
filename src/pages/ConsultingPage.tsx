import { useState } from 'react';
import type { ConsultingProduct } from './ConsultingApplyPage';

// 오상열 대표 사진 URL (Firebase Storage)
const PROFILE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%98%A4%EC%83%81%EC%97%B4%20%EC%82%AC%EC%A7%84.png?alt=media&token=63eaf15e-9d0b-4d72-8fbb-ee03d6ecc8e5';

// 상품 목록 (Payple 결제 URL 포함)
export const CONSULTING_PRODUCTS: ConsultingProduct[] = [
  {
    id: 'consult-online',
    name: '비대면 상담',
    price: 330000,
    priceLabel: '33만원',
    description: '화상으로 진행되는 1:1 맞춤 재무상담 · 2회 진행',
    paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzU4NjYzMDE4',
  },
  {
    id: 'consult-offline',
    name: '대면 상담',
    price: 550000,
    priceLabel: '55만원',
    description: '직접 만나서 진행하는 심층 재무상담 · 2회 진행',
    paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzU4NjYzMDE4',
  },
  {
    id: 'consult-vip',
    name: '자산가 상담',
    price: 1100000,
    priceLabel: '110만원',
    description: '금융자산 10억원 초과 고객 전용 VIP 상담 · 3회 진행',
    paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzY3MzM3NjA0',
  },
  {
    id: 'class-online',
    name: '일반인 비대면 수업',
    price: 550000,
    priceLabel: '55만원',
    description: '주 1회 · 매주 2시간 · 4주간 총 8시간',
    paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzcyMjc4MzY3',
  },
  {
    id: 'class-pro',
    name: '전문가 수업',
    price: 1100000,
    priceLabel: '110만원',
    description: '대면 4주 + 비대면 1년 · 매주 토요일 오후 1-6시',
    paypleUrl: 'https://link.payple.kr/NzcxOjc2MTU0NTgyMDA0MDQ4',
  },
];

// 상세페이지 타입
type DetailPageType = 'consultation' | 'academy' | 'expert' | null;

interface ConsultingPageProps {
  onBack: () => void;
  onApply: (product: ConsultingProduct) => void;
}

export default function ConsultingPage({ onBack, onApply }: ConsultingPageProps) {
  // 상세페이지 상태
  const [detailPage, setDetailPage] = useState<DetailPageType>(null);

  // 전화 연결
  const handleCall = () => {
    window.location.href = 'tel:010-5424-5332';
  };

  // 이메일 연결
  const handleEmail = () => {
    window.location.href = 'mailto:ggorilla11@gmail.com?subject=[AI머니야] 상담/강의 문의';
  };

  // 상품별 신청하기 클릭 - 상세페이지로 이동
  const handleShowDetail = (pageType: DetailPageType) => {
    setDetailPage(pageType);
  };

  // 상세페이지에서 결제 처리
  const handlePaymentFromDetail = (productId: string) => {
    const product = CONSULTING_PRODUCTS.find(p => p.id === productId);
    if (product) {
      onApply(product);
    }
  };

  // 상세페이지가 열려있으면 상세페이지 표시
  if (detailPage) {
    return (
      <DetailPageView 
        pageType={detailPage}
        onBack={() => setDetailPage(null)}
        onPayment={handlePaymentFromDetail}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 - 강조된 스타일 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-700">
        <button 
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 text-white text-lg"
        >
          ←
        </button>
        <h1 className="flex-1 text-lg font-extrabold text-white">전문가 강의상담</h1>
      </div>

      <div className="p-4">
        {/* 전문가 배너 */}
        <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-5 mb-5 flex gap-4 items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-lg flex-shrink-0">
            <img 
              src={PROFILE_IMAGE_URL} 
              alt="오상열 대표" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-lg font-extrabold text-gray-900">오상열 대표</h2>
              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">CFP</span>
            </div>
            <p className="text-xs text-yellow-700 font-bold mb-2">금융집짓기® 창시자 · 20년 경력</p>
            <p className="text-[11px] text-gray-600 leading-relaxed italic">
              "당신의 재무 상황을 정확히 진단하고,<br/>맞춤형 솔루션을 제안해 드립니다"
            </p>
          </div>
        </div>

        {/* 1:1 재무상담 섹션 */}
        <h2 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-1.5">
          💼 1:1 재무상담
        </h2>

        {/* 비대면 상담 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-lg">
              📹
            </div>
            <span className="text-base font-bold text-gray-900">비대면 상담</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            화상으로 진행되는 1:1 맞춤 재무상담<br/>2회 진행 · 일정 별도 협의
          </p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-extrabold text-gray-900">33만원</span>
            <button 
              onClick={() => handleShowDetail('consultation')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl text-sm shadow-lg"
            >
              신청하기
            </button>
          </div>
        </div>

        {/* 대면 상담 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-lg">
              🤝
            </div>
            <span className="text-base font-bold text-gray-900">대면 상담</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            직접 만나서 진행하는 심층 재무상담<br/>2회 진행 · 일정 별도 협의
          </p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-extrabold text-gray-900">55만원</span>
            <button 
              onClick={() => handleShowDetail('consultation')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl text-sm shadow-lg"
            >
              신청하기
            </button>
          </div>
        </div>

        {/* 자산가 상담 (프리미엄) */}
        <div className="relative bg-white border-2 border-yellow-500 rounded-2xl p-4 mb-3">
          <div className="absolute -top-2 right-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2 py-0.5 rounded-lg text-[9px] font-bold">
            💎 PREMIUM
          </div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-lg">
              👑
            </div>
            <span className="text-base font-bold text-gray-900">자산가 상담</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            금융자산 10억원 초과 고객 전용 VIP 상담<br/>3회 진행 · 일정 별도 협의
          </p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-extrabold text-gray-900">110만원</span>
            <button 
              onClick={() => handleShowDetail('consultation')}
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold rounded-xl text-sm shadow-lg"
            >
              신청하기
            </button>
          </div>
        </div>

        {/* 강의 섹션 */}
        <h2 className="text-sm font-extrabold text-gray-900 mb-3 mt-6 flex items-center gap-1.5">
          📚 재테크 & 재무설계 강의
        </h2>

        {/* 일반인 비대면 수업 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-lg">
              🎓
            </div>
            <span className="text-base font-bold text-gray-900">일반인 비대면 수업</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            주 1회 · 매주 2시간 · 4주간 총 8시간<br/>수강 종료 후 월 1회 월례교육 포함
          </p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-extrabold text-gray-900">55만원</span>
            <button 
              onClick={() => handleShowDetail('academy')}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-xl text-sm shadow-lg"
            >
              신청하기
            </button>
          </div>
        </div>

        {/* 전문가 수업 (어드밴스드) */}
        <div className="relative bg-white border-2 border-purple-500 rounded-2xl p-4 mb-3">
          <div className="absolute -top-2 right-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2 py-0.5 rounded-lg text-[9px] font-bold">
            🏆 FP전용
          </div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-lg">
              🎖️
            </div>
            <span className="text-base font-bold text-gray-900">금융전문가(FP) 수업</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            대면 4주 + <span className="font-bold text-purple-600">비대면 1년간</span> 수업<br/>매주 토요일 오후 1-6시 (5시간)<br/>📍 선릉역 강의장
          </p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-extrabold text-gray-900">110만원</span>
            <button 
              onClick={() => handleShowDetail('expert')}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl text-sm shadow-lg"
            >
              신청하기
            </button>
          </div>
        </div>

        {/* 안내 박스 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mt-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
            💡 상담/강의 안내
          </h3>
          <div className="space-y-1.5 text-xs text-gray-600">
            <p className="pl-4 relative before:content-['•'] before:absolute before:left-1">
              신청 후 24시간 내 연락드립니다
            </p>
            <p className="pl-4 relative before:content-['•'] before:absolute before:left-1">
              일정은 개별 협의로 진행됩니다
            </p>
            <p className="pl-4 relative before:content-['•'] before:absolute before:left-1">
              환불 규정: 수업 시작 전 100% 환불
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-2">
            <button 
              onClick={handleCall}
              className="flex items-center gap-2 text-xs"
            >
              <span>📞 문의:</span>
              <strong className="text-gray-900">010-5424-5332</strong>
            </button>
            <button 
              onClick={handleEmail}
              className="flex items-center gap-2 text-xs"
            >
              <span>📧 이메일:</span>
              <strong className="text-gray-900">ggorilla11@gmail.com</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 상세페이지 컴포넌트
// ============================================
interface DetailPageViewProps {
  pageType: DetailPageType;
  onBack: () => void;
  onPayment: (productId: string) => void;
}

function DetailPageView({ pageType, onBack, onPayment }: DetailPageViewProps) {
  if (pageType === 'consultation') {
    return <ConsultationDetailPage onBack={onBack} onPayment={onPayment} />;
  }
  if (pageType === 'academy') {
    return <AcademyDetailPage onBack={onBack} onPayment={onPayment} />;
  }
  if (pageType === 'expert') {
    return <ExpertDetailPage onBack={onBack} onPayment={onPayment} />;
  }
  return null;
}

// ============================================
// PAGE 1: 1:1 재무상담 상세페이지
// ============================================
function ConsultationDetailPage({ onBack, onPayment }: { onBack: () => void; onPayment: (id: string) => void }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 */}
      <div className="bg-gradient-to-br from-blue-800 to-blue-900 text-white px-5 py-12 text-center">
        <span className="inline-block bg-yellow-500 text-blue-900 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
          🏆 금융감독원 공식 강사
        </span>
        <h1 className="text-2xl font-black mb-3">믿을 수 있는<br/><span className="text-yellow-400">1:1 재무상담</span></h1>
        <p className="text-blue-100 text-sm">20년 경력 CFP 전문가와 함께<br/>경제적 자유를 설계하세요</p>
      </div>

      {/* 전문가 소개 */}
      <div className="px-5 py-8 bg-gray-50">
        <h2 className="text-lg font-bold text-center text-blue-900 mb-6">왜 <span className="text-yellow-600">오상열 CFP</span>인가요?</h2>
        <div className="flex gap-4 items-center">
          <img src={PROFILE_IMAGE_URL} alt="오상열" className="w-24 h-28 rounded-2xl object-cover shadow-lg"/>
          <div>
            <h3 className="font-bold text-gray-900">오상열 대표</h3>
            <p className="text-yellow-600 text-sm font-semibold mb-2">오원트금융연구소 | CFP, CFHA</p>
            <div className="flex flex-wrap gap-1.5">
              {['삼성그룹 공채', '금융감독원 강사', 'SBS Biz 출연', '저서 3권'].map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-blue-900 text-white text-[10px] rounded">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 특전 소개 */}
      <div className="px-5 py-8 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <h2 className="text-lg font-bold text-center mb-4">🎁 상담 특전</h2>
        <div className="grid grid-cols-2 gap-3">
          {['금융집짓기 전자책', '온라인강좌 107강', '월 1회 월례세미나 초대', '👑 프리미엄급 서비스'].map(item => (
            <div key={item} className="bg-white/20 rounded-xl px-3 py-2 text-center text-sm font-medium">{item}</div>
          ))}
        </div>
      </div>

      {/* 가격 선택 */}
      <div className="px-5 py-8">
        <h2 className="text-lg font-bold text-center text-gray-900 mb-6">나에게 맞는 <span className="text-yellow-600">상담</span>을 선택하세요</h2>
        
        <div className="space-y-4">
          {/* 비대면 */}
          <div className="border border-gray-200 rounded-2xl p-5">
            <div className="text-xs text-gray-500 mb-1">STANDARD</div>
            <div className="text-lg font-bold text-gray-900 mb-1">비대면 상담</div>
            <div className="text-2xl font-black text-blue-900 mb-3">33<span className="text-base font-normal text-gray-500">만원</span></div>
            <ul className="text-xs text-gray-600 space-y-1 mb-4">
              <li>✓ 화상 또는 전화 상담</li>
              <li>✓ 총 2회 상담 (각 90분)</li>
              <li>✓ 강의·컨설팅 자료 제공</li>
            </ul>
            <button onClick={() => onPayment('consult-online')} className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl">상담 신청하기</button>
          </div>

          {/* 대면 */}
          <div className="border-2 border-yellow-500 rounded-2xl p-5 relative">
            <span className="absolute -top-2.5 right-4 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">⭐ 인기</span>
            <div className="text-xs text-gray-500 mb-1">DELUXE</div>
            <div className="text-lg font-bold text-gray-900 mb-1">대면 상담</div>
            <div className="text-2xl font-black text-blue-900 mb-3">55<span className="text-base font-normal text-gray-500">만원</span></div>
            <ul className="text-xs text-gray-600 space-y-1 mb-4">
              <li>✓ 오프라인 1:1 대면 상담</li>
              <li>✓ 총 2회 상담 (각 90분)</li>
              <li>✓ 강의·컨설팅 자료 제공</li>
            </ul>
            <button onClick={() => onPayment('consult-offline')} className="w-full py-3 bg-yellow-500 text-blue-900 font-bold rounded-xl">상담 신청하기</button>
          </div>

          {/* 자산가 */}
          <div className="border border-gray-200 rounded-2xl p-5">
            <div className="text-xs text-gray-500 mb-1">PREMIUM</div>
            <div className="text-lg font-bold text-gray-900 mb-1">자산가 상담</div>
            <div className="text-2xl font-black text-blue-900 mb-3">110<span className="text-base font-normal text-gray-500">만원</span></div>
            <ul className="text-xs text-gray-600 space-y-1 mb-4">
              <li>✓ 오프라인 1:1 프리미엄 상담</li>
              <li>✓ 총 3회 상담 (각 90분)</li>
              <li>✓ 맞춤 세금·상속 전략</li>
            </ul>
            <button onClick={() => onPayment('consult-vip')} className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl">상담 신청하기</button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-blue-800 to-blue-900 text-white px-5 py-10 text-center">
        <h2 className="text-xl font-bold mb-3">경제적 자유를 향한<br/>첫 걸음을 내딛으세요</h2>
        <button onClick={() => setShowModal(true)} className="px-8 py-3 bg-yellow-500 text-blue-900 font-bold rounded-full text-lg">
          유료 상담 신청하기
        </button>
      </div>

      {/* 뒤로가기 버튼 */}
      <button onClick={onBack} className="fixed top-4 left-4 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-xl z-50">
        ←
      </button>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-center mb-4">상담 유형 선택</h3>
            <div className="space-y-3">
              <button onClick={() => { onPayment('consult-online'); setShowModal(false); }} className="w-full p-4 bg-gray-100 rounded-xl flex justify-between items-center">
                <span className="font-bold">비대면 상담</span><span className="text-yellow-600 font-bold">33만원</span>
              </button>
              <button onClick={() => { onPayment('consult-offline'); setShowModal(false); }} className="w-full p-4 bg-gray-100 rounded-xl flex justify-between items-center">
                <span className="font-bold">대면 상담</span><span className="text-yellow-600 font-bold">55만원</span>
              </button>
              <button onClick={() => { onPayment('consult-vip'); setShowModal(false); }} className="w-full p-4 bg-gray-100 rounded-xl flex justify-between items-center">
                <span className="font-bold">자산가 상담</span><span className="text-yellow-600 font-bold">110만원</span>
              </button>
            </div>
            <button onClick={() => setShowModal(false)} className="w-full mt-4 py-2 text-gray-500">닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// PAGE 2: 일반인 재테크 아카데미 상세페이지
// ============================================
function AcademyDetailPage({ onBack, onPayment }: { onBack: () => void; onPayment: (id: string) => void }) {
  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white px-5 py-12 text-center">
        <span className="inline-block bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
          🎓 일반인을 위한 재테크 클래스
        </span>
        <h1 className="text-2xl font-black mb-3"><span className="text-yellow-400">10억</span> 목돈 마련<br/>재테크 아카데미</h1>
        <p className="text-teal-100 text-sm">금융감독원 공식 강사에게 배우는<br/>체계적인 자산관리</p>
        <div className="flex justify-center gap-6 mt-6">
          <div className="text-center"><div className="text-2xl font-black text-yellow-400">107강</div><div className="text-xs text-teal-200">온라인 강의</div></div>
          <div className="text-center"><div className="text-2xl font-black text-yellow-400">4주</div><div className="text-xs text-teal-200">비대면 수업</div></div>
          <div className="text-center"><div className="text-2xl font-black text-yellow-400">1년</div><div className="text-xs text-teal-200">프리미엄 혜택</div></div>
        </div>
      </div>

      {/* 전문가 소개 */}
      <div className="px-5 py-8 bg-gray-50">
        <h2 className="text-lg font-bold text-center text-teal-800 mb-6">강사 소개</h2>
        <div className="flex gap-4 items-center">
          <img src={PROFILE_IMAGE_URL} alt="오상열" className="w-24 h-28 rounded-2xl object-cover shadow-lg"/>
          <div>
            <h3 className="font-bold text-gray-900">오상열 대표</h3>
            <p className="text-teal-600 text-sm font-semibold mb-2">오원트금융연구소 | CFP, CFHA</p>
            <p className="text-xs text-gray-600 italic">"10억 목돈은 누구나 만들 수 있습니다.<br/>다만 올바른 순서와 방법을 알아야 합니다."</p>
          </div>
        </div>
      </div>

      {/* 프리미엄 혜택 */}
      <div className="px-5 py-8 bg-gradient-to-r from-yellow-400 to-yellow-500">
        <h2 className="text-lg font-bold text-center text-yellow-900 mb-4">👑 프리미엄 등급 혜택</h2>
        <div className="space-y-2">
          {['🎁 월 1회 월례세미나 참석권', '📚 재테크과외 워크북 제공', '🎬 온라인강의 107강 1년간 무제한', '📖 금융집짓기 전자책 제공'].map(item => (
            <div key={item} className="bg-white/80 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800">{item}</div>
          ))}
        </div>
      </div>

      {/* 일정 & 가격 */}
      <div className="px-5 py-8">
        <div className="bg-teal-50 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-teal-800 mb-3 text-center">📅 수업 일정</h3>
          <p className="text-center text-gray-700 text-sm"><strong>매달 개강</strong> | 매주 월요일 저녁 7시~10시 (3시간)</p>
          <p className="text-center text-gray-600 text-xs mt-1">4주 연속 비대면 강의 진행</p>
        </div>

        <div className="border-2 border-teal-500 rounded-2xl p-6 text-center">
          <div className="text-3xl font-black text-teal-700 mb-2">55<span className="text-lg font-normal text-gray-500">만원</span></div>
          <p className="text-sm text-teal-600 font-semibold mb-4">🔥 프리미엄 등급 서비스 제공</p>
          <button onClick={() => onPayment('class-online')} className="w-full py-3.5 bg-teal-600 text-white font-bold rounded-xl text-lg">
            지금 수강 신청하기
          </button>
        </div>
      </div>

      {/* 뒤로가기 버튼 */}
      <button onClick={onBack} className="fixed top-4 left-4 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-xl z-50">
        ←
      </button>
    </div>
  );
}

// ============================================
// PAGE 3: 금융전문가(FP) 과정 상세페이지
// ============================================
function ExpertDetailPage({ onBack, onPayment }: { onBack: () => void; onPayment: (id: string) => void }) {
  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 */}
      <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white px-5 py-12 text-center">
        <span className="inline-block bg-pink-500 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
          👨‍🏫 금융전문가(FP) 대상 과정
        </span>
        <h1 className="text-2xl font-black mb-3">오상열의 <span className="text-yellow-400">금융집짓기®</span><br/>재무설계 전문가 과정</h1>
        <p className="text-purple-200 text-sm">15분 만에 고객의 재정상태를 진단하고<br/>자연스럽게 계약 클로징까지!</p>
        <div className="flex justify-center gap-4 mt-6 text-sm">
          <div className="bg-white/15 px-4 py-2 rounded-lg">📅 대면 <strong>4주</strong> + 비대면 <strong className="underline">1년간</strong></div>
          <div className="bg-white/15 px-4 py-2 rounded-lg">👥 <strong>8명</strong> 소수정예</div>
        </div>
      </div>

      {/* 전문가 소개 */}
      <div className="px-5 py-8 bg-purple-50">
        <h2 className="text-lg font-bold text-center text-purple-800 mb-6">강사 소개</h2>
        <div className="flex gap-4 items-center">
          <img src={PROFILE_IMAGE_URL} alt="오상열" className="w-24 h-28 rounded-2xl object-cover shadow-lg"/>
          <div>
            <h3 className="font-bold text-gray-900">오상열 대표</h3>
            <p className="text-purple-600 text-sm font-semibold mb-2">오원트금융연구소 | CFP, CFHA</p>
            <div className="flex flex-wrap gap-1.5">
              {['국제공인 CFP', 'COT 달성', '월 77건 체결', '금융감독원 강사'].map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-purple-700 text-white text-[10px] rounded">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 일정 정보 */}
      <div className="px-5 py-8">
        <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-purple-800 mb-4 text-center">📅 교육 일정</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">대면 수업</span><span className="font-semibold">매주 토요일 오후 1시~6시 × 4주</span></div>
            <div className="flex justify-between"><span className="text-gray-600">비대면 수업</span><span className="font-bold text-purple-700">1년간 매주 화요일 저녁 8시~10시</span></div>
            <div className="flex justify-between"><span className="text-gray-600">교육장소</span><span className="font-semibold">위비즈강의장 (선릉역 5분)</span></div>
            <div className="flex justify-between"><span className="text-gray-600">모집인원</span><span className="font-semibold">8명 (소수정예)</span></div>
          </div>
        </div>

        <div className="border-2 border-purple-500 rounded-2xl p-6 text-center">
          <div className="text-3xl font-black text-purple-700 mb-2">110<span className="text-lg font-normal text-gray-500">만원</span></div>
          <p className="text-sm text-purple-600 font-semibold mb-4">대면 4주 + 비대면 <span className="underline font-bold">1년간</span> 집중 과정</p>
          <button onClick={() => onPayment('class-pro')} className="w-full py-3.5 bg-purple-600 text-white font-bold rounded-xl text-lg">
            Academy 신청하기
          </button>
        </div>
      </div>

      {/* 뒤로가기 버튼 */}
      <button onClick={onBack} className="fixed top-4 left-4 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-xl z-50">
        ←
      </button>
    </div>
  );
}
