import { useState } from 'react';
import type { ConsultingProduct } from './ConsultingApplyPage';
import ConsultingChatPage from './ConsultingChatPage';

const PROFILE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%98%A4%EC%83%81%EC%97%B4%20%EC%82%AC%EC%A7%84.png?alt=media&token=63eaf15e-9d0b-4d72-8fbb-ee03d6ecc8e5';

export const CONSULTING_PRODUCTS: ConsultingProduct[] = [
  { id: 'consult-online', name: '비대면 상담', price: 330000, priceLabel: '33만원', description: '화상으로 진행되는 1:1 맞춤 재무상담 · 2회 진행', paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzU4NjYzMDE4' },
  { id: 'consult-offline', name: '대면 상담', price: 550000, priceLabel: '55만원', description: '직접 만나서 진행하는 심층 재무상담 · 2회 진행', paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzU4NjYzMDE4' },
  { id: 'consult-vip', name: '자산가 상담', price: 1100000, priceLabel: '110만원', description: '금융자산 10억원 초과 고객 전용 VIP 상담 · 3회 진행', paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzcyMjc4MzY3' },
  { id: 'class-online', name: '일반인 비대면 수업', price: 550000, priceLabel: '55만원', description: '주 1회 · 매주 2시간 · 4주간 총 8시간', paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzcyMjc4MzY3' },
  { id: 'class-pro', name: '전문가 수업', price: 1100000, priceLabel: '110만원', description: '대면 4주 + 비대면 1년 · 매주 토요일 오후 1-6시', paypleUrl: 'https://link.payple.kr/NzcxOjc2MTU0NTgyMDA0MDQ4' },
];

type DetailPageType = 'consultation' | 'academy' | 'expert' | null;

interface ConsultingPageProps {
  onBack: () => void;
  onApply: (product: ConsultingProduct) => void;
  displayName?: string;
  financialResult?: any;
}

export default function ConsultingPage({ onBack, onApply, displayName = '고객', financialResult = null }: ConsultingPageProps) {
  const [detailPage, setDetailPage] = useState<DetailPageType>(null);
  const [showChat, setShowChat] = useState(false);

  const handleCall  = () => { window.location.href = 'tel:010-5424-5332'; };
  const handleEmail = () => { window.location.href = 'mailto:ggorilla11@gmail.com?subject=[AI머니야] 상담/강의 문의'; };

  const handlePaymentFromDetail = (productId: string) => {
    const product = CONSULTING_PRODUCTS.find(p => p.id === productId);
    if (product) onApply(product);
  };

  // ── 상담 채팅 화면 ──────────────────────────────────────────
  if (showChat) {
    return (
      <ConsultingChatPage
        displayName={displayName}
        financialResult={financialResult}
        onBack={() => setShowChat(false)}
      />
    );
  }

  if (detailPage) {
    return <DetailPageView pageType={detailPage} onBack={() => setDetailPage(null)} onPayment={handlePaymentFromDetail} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-700">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 text-white text-lg">←</button>
        <h1 className="flex-1 text-lg font-extrabold text-white">전문가 강의상담</h1>
      </div>

      <div className="p-4">
        {/* 프로필 카드 */}
        <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-5 mb-5 flex gap-4 items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-lg flex-shrink-0">
            <img src={PROFILE_IMAGE_URL} alt="오상열 대표" className="w-full h-full object-cover"/>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-lg font-extrabold text-gray-900">오상열 대표</h2>
              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">CFP</span>
            </div>
            <p className="text-xs text-yellow-700 font-bold mb-2">금융집짓기® 창시자 · 20년 경력</p>
            <p className="text-[11px] text-gray-600 leading-relaxed italic">"당신의 재무 상황을 정확히 진단하고,<br/>맞춤형 솔루션을 제안해 드립니다"</p>
          </div>
        </div>

        {/* ── AI 머니야 상담 카드 (대화하기 버튼) ── */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center text-lg">🤖</div>
            <div>
              <p className="font-extrabold text-gray-900 text-sm">AI 머니야 무료 상담</p>
              <p className="text-[10px] text-yellow-700 font-bold">오상열 CFP 금융집짓기® 8단계 상담</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            AI 재무설계사 머니야와 무료로 1:1 재무상담을 시작해보세요.<br/>
            수입지출 · 보험 · 저축 · 투자 · 은퇴까지 7대 영역 종합 설계!
          </p>
          <button
            onClick={() => setShowChat(true)}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-extrabold rounded-xl text-sm shadow-lg"
          >
            대화하기 →
          </button>
        </div>

        {/* 1:1 재무상담 */}
        <h2 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-1.5">💼 1:1 재무상담</h2>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5"><div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-lg">📹</div><span className="text-base font-bold text-gray-900">비대면 상담</span></div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">화상으로 진행되는 1:1 맞춤 재무상담<br/>2회 진행 · 일정 별도 협의</p>
          <div className="flex justify-between items-center"><span className="text-lg font-extrabold text-gray-900">33만원</span><button onClick={() => setDetailPage('consultation')} className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl text-sm shadow-lg">신청하기</button></div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5"><div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-lg">🤝</div><span className="text-base font-bold text-gray-900">대면 상담</span></div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">직접 만나서 진행하는 심층 재무상담<br/>2회 진행 · 일정 별도 협의</p>
          <div className="flex justify-between items-center"><span className="text-lg font-extrabold text-gray-900">55만원</span><button onClick={() => setDetailPage('consultation')} className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl text-sm shadow-lg">신청하기</button></div>
        </div>

        <div className="relative bg-white border-2 border-yellow-500 rounded-2xl p-4 mb-3">
          <div className="absolute -top-2 right-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2 py-0.5 rounded-lg text-[9px] font-bold">💎 PREMIUM</div>
          <div className="flex items-center gap-2.5 mb-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-lg">👑</div><span className="text-base font-bold text-gray-900">자산가 상담</span></div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">금융자산 10억원 초과 고객 전용 VIP 상담<br/>3회 진행 · 일정 별도 협의</p>
          <div className="flex justify-between items-center"><span className="text-lg font-extrabold text-gray-900">110만원</span><button onClick={() => setDetailPage('consultation')} className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold rounded-xl text-sm shadow-lg">신청하기</button></div>
        </div>

        {/* 강의 */}
        <h2 className="text-sm font-extrabold text-gray-900 mb-3 mt-6 flex items-center gap-1.5">📚 재테크 & 재무설계 강의</h2>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5"><div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-lg">🎓</div><span className="text-base font-bold text-gray-900">일반인 비대면 수업</span></div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">주 1회 · 매주 2시간 · 4주간 총 8시간<br/>수강 종료 후 월 1회 월례교육 포함</p>
          <div className="flex justify-between items-center"><span className="text-lg font-extrabold text-gray-900">55만원</span><button onClick={() => setDetailPage('academy')} className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-xl text-sm shadow-lg">신청하기</button></div>
        </div>

        <div className="relative bg-white border-2 border-purple-500 rounded-2xl p-4 mb-3">
          <div className="absolute -top-2 right-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2 py-0.5 rounded-lg text-[9px] font-bold">🏆 FP전용</div>
          <div className="flex items-center gap-2.5 mb-2.5"><div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-lg">🎖️</div><span className="text-base font-bold text-gray-900">금융전문가(FP) 수업</span></div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">대면 4주 + <span className="font-bold text-purple-600">비대면 1년간</span> 수업<br/>매주 토요일 오후 1-6시 (5시간)<br/>📍 선릉역 강의장</p>
          <div className="flex justify-between items-center"><span className="text-lg font-extrabold text-gray-900">110만원</span><button onClick={() => setDetailPage('expert')} className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl text-sm shadow-lg">신청하기</button></div>
        </div>

        {/* 안내 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mt-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">💡 상담/강의 안내</h3>
          <div className="space-y-1.5 text-xs text-gray-600">
            <p className="pl-4 relative before:content-['•'] before:absolute before:left-1">신청 후 24시간 내 연락드립니다</p>
            <p className="pl-4 relative before:content-['•'] before:absolute before:left-1">일정은 개별 협의로 진행됩니다</p>
            <p className="pl-4 relative before:content-['•'] before:absolute before:left-1">환불 규정: 수업 시작 전 100% 환불</p>
          </div>
          <div className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-2">
            <button onClick={handleCall}  className="flex items-center gap-2 text-xs"><span>📞 문의:</span><strong className="text-gray-900">010-5424-5332</strong></button>
            <button onClick={handleEmail} className="flex items-center gap-2 text-xs"><span>📧 이메일:</span><strong className="text-gray-900">ggorilla11@gmail.com</strong></button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DetailPageViewProps { pageType: DetailPageType; onBack: () => void; onPayment: (productId: string) => void; }
function DetailPageView({ pageType, onBack, onPayment }: DetailPageViewProps) {
  if (pageType === 'consultation') return <ConsultationDetailPage onBack={onBack} onPayment={onPayment} />;
  if (pageType === 'academy')      return <AcademyDetailPage      onBack={onBack} onPayment={onPayment} />;
  if (pageType === 'expert')       return <ExpertDetailPage       onBack={onBack} onPayment={onPayment} />;
  return null;
}

// ============================================
// PAGE 1: 1:1 재무상담 상세페이지
// ============================================
function ConsultationDetailPage({ onBack, onPayment }: { onBack: () => void; onPayment: (id: string) => void }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="min-h-screen bg-white overflow-y-auto">
      <div className="bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 text-white px-5 py-16 text-center">
        <span className="inline-block bg-yellow-500 text-blue-900 px-4 py-1.5 rounded-full text-xs font-bold mb-4">🏆 금융감독원 공식 강사</span>
        <h1 className="text-3xl font-black mb-4">믿을 수 있는<br/><span className="text-yellow-400">1:1 재무상담</span></h1>
        <p className="text-blue-200 text-sm max-w-md mx-auto">금융은 신뢰입니다. 20년 경력 CFP 전문가와 함께 온라인 또는 오프라인 1:1 맞춤 상담으로 경제적 자유를 설계하세요</p>
        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">🎓 CFP 국제공인</span>
          <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">📺 SBS Biz 출연</span>
          <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">👥 유튜브 4.5만</span>
        </div>
      </div>
      <div className="px-5 py-10">
        <h2 className="text-xl font-bold text-center text-blue-900 mb-6">이런 <span className="text-yellow-600">고민</span>, 하고 계신가요?</h2>
        <div className="space-y-3">
          {[
            { icon: '😰', title: '"월급은 그대로인데 물가만 오르고..."', desc: '열심히 일해도 통장 잔고는 제자리.' },
            { icon: '🤷', title: '"투자하고 싶은데 뭘 해야 할지..."', desc: '정보는 넘쳐나는데 나에게 맞는 게 뭔지 모르겠어요' },
            { icon: '😟', title: '"노후 준비, 이대로 괜찮을까?"', desc: '은퇴 후 삶이 막막합니다.' },
          ].map((item, i) => (
            <div key={i} className="bg-yellow-50 rounded-2xl p-4 flex gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div><p className="font-bold text-blue-900 text-sm">{item.title}</p><p className="text-xs text-gray-600">{item.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 py-10 bg-gray-50">
        <h2 className="text-xl font-bold text-center text-blue-900 mb-6">왜 <span className="text-yellow-600">오상열 CFP</span>인가요?</h2>
        <div className="flex gap-4 items-start">
          <img src={PROFILE_IMAGE_URL} alt="오상열" className="w-28 h-36 rounded-2xl object-cover shadow-xl flex-shrink-0"/>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">오상열 대표</h3>
            <p className="text-yellow-600 text-sm font-semibold mb-3">오원트금융연구소 대표 | CFP, CFHA</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['삼성그룹 공채 34기', '삼성화재 교육팀 10년', '금융감독원 강사', 'SBS Biz 출연', '저서 3권'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-blue-900 text-white text-[10px] rounded">{tag}</span>
              ))}
            </div>
            <div className="bg-yellow-100 rounded-xl p-3 border-l-4 border-yellow-500">
              <p className="text-xs text-gray-700">💡 금융감독원 홈페이지에 강의 동영상이 있는 <strong>검증된 금융전문가</strong>입니다</p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 py-10">
        <h2 className="text-xl font-bold text-center text-gray-900 mb-6">나에게 맞는 <span className="text-yellow-600">상담</span>을 선택하세요</h2>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-2xl p-5">
            <div className="text-xs text-gray-500 mb-1">STANDARD</div>
            <div className="text-lg font-bold text-gray-900 mb-1">비대면 상담</div>
            <div className="text-3xl font-black text-blue-900 mb-3">33<span className="text-base font-normal text-gray-500">만원</span></div>
            <ul className="text-xs text-gray-600 space-y-1.5 mb-4">
              <li className="flex gap-2"><span className="text-green-500">✓</span>화상 또는 전화 상담</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span>총 2회 상담 (각 90분)</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span>강의·컨설팅 자료 제공</li>
            </ul>
            <button onClick={() => onPayment('consult-online')} className="w-full py-3.5 bg-blue-900 text-white font-bold rounded-xl">상담 신청하기</button>
          </div>
          <div className="border-2 border-yellow-500 rounded-2xl p-5 relative">
            <span className="absolute -top-3 right-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">⭐ 인기</span>
            <div className="text-xs text-gray-500 mb-1">DELUXE</div>
            <div className="text-lg font-bold text-gray-900 mb-1">대면 상담</div>
            <div className="text-3xl font-black text-blue-900 mb-3">55<span className="text-base font-normal text-gray-500">만원</span></div>
            <ul className="text-xs text-gray-600 space-y-1.5 mb-4">
              <li className="flex gap-2"><span className="text-green-500">✓</span>오프라인 1:1 대면 상담</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span>총 2회 상담 (각 90분)</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span>강의·컨설팅 자료 제공</li>
            </ul>
            <button onClick={() => onPayment('consult-offline')} className="w-full py-3.5 bg-yellow-500 text-blue-900 font-bold rounded-xl">상담 신청하기</button>
          </div>
          <div className="border border-gray-200 rounded-2xl p-5">
            <div className="text-xs text-gray-500 mb-1">PREMIUM</div>
            <div className="text-lg font-bold text-gray-900 mb-1">자산가 상담</div>
            <div className="text-3xl font-black text-blue-900 mb-3">110<span className="text-base font-normal text-gray-500">만원</span></div>
            <ul className="text-xs text-gray-600 space-y-1.5 mb-4">
              <li className="flex gap-2"><span className="text-green-500">✓</span>오프라인 1:1 프리미엄 상담</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span>총 3회 상담 (각 90분)</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span>맞춤 세금·상속 전략</li>
            </ul>
            <button onClick={() => onPayment('consult-vip')} className="w-full py-3.5 bg-blue-900 text-white font-bold rounded-xl">상담 신청하기</button>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-blue-800 to-blue-900 text-white px-5 py-12 text-center">
        <h2 className="text-xl font-bold mb-3">지금 바로 경제적 자유를 향한<br/>첫 걸음을 내딛으세요</h2>
        <button onClick={() => setShowModal(true)} className="px-10 py-4 bg-yellow-500 text-blue-900 font-bold rounded-full text-lg shadow-xl">유료 상담 신청하기</button>
      </div>
      <div className="bg-gray-900 text-gray-400 px-5 py-6 text-center text-xs">
        <p>오원트금융연구소 | 대표: 오상열</p>
        <p className="mt-2">본 상담은 투자자문업에 해당하지 않으며, 금융상품에 대한 최종 투자 결정은 고객 본인의 판단에 따릅니다.</p>
      </div>
      <button onClick={onBack} className="fixed top-4 left-4 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-xl z-50">←</button>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-center mb-4">상담 유형 선택</h3>
            <div className="space-y-3">
              <button onClick={() => { onPayment('consult-online');  setShowModal(false); }} className="w-full p-4 bg-gray-100 rounded-xl flex justify-between items-center"><span className="font-bold">비대면 상담</span><span className="text-yellow-600 font-bold">33만원</span></button>
              <button onClick={() => { onPayment('consult-offline'); setShowModal(false); }} className="w-full p-4 bg-gray-100 rounded-xl flex justify-between items-center"><span className="font-bold">대면 상담</span><span className="text-yellow-600 font-bold">55만원</span></button>
              <button onClick={() => { onPayment('consult-vip');     setShowModal(false); }} className="w-full p-4 bg-gray-100 rounded-xl flex justify-between items-center"><span className="font-bold">자산가 상담</span><span className="text-yellow-600 font-bold">110만원</span></button>
            </div>
            <button onClick={() => setShowModal(false)} className="w-full mt-4 py-2 text-gray-500">닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// PAGE 2: 일반인 재테크 아카데미
// ============================================
function AcademyDetailPage({ onBack, onPayment }: { onBack: () => void; onPayment: (id: string) => void }) {
  return (
    <div className="min-h-screen bg-white overflow-y-auto">
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white px-5 py-16 text-center">
        <span className="inline-block bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold mb-4">🎓 일반인을 위한 재테크 클래스</span>
        <h1 className="text-3xl font-black mb-4"><span className="text-yellow-400">10억</span> 목돈 마련<br/>재테크 아카데미</h1>
        <p className="text-teal-100 text-sm max-w-md mx-auto">금융감독원 공식 강사에게 배우는 체계적인 자산관리. 돈의 원리부터 실전 투자까지!</p>
        <div className="flex justify-center gap-8 mt-8">
          <div className="text-center"><div className="text-3xl font-black text-yellow-400">107강</div><div className="text-xs text-teal-200">온라인 강의</div></div>
          <div className="text-center"><div className="text-3xl font-black text-yellow-400">4주</div><div className="text-xs text-teal-200">비대면 수업</div></div>
          <div className="text-center"><div className="text-3xl font-black text-yellow-400">1년</div><div className="text-xs text-teal-200">프리미엄 혜택</div></div>
        </div>
      </div>
      <div className="px-5 py-10">
        <h2 className="text-xl font-bold text-center text-teal-800 mb-6">수강료 <span className="text-yellow-600">안내</span></h2>
        <div className="border-2 border-teal-500 rounded-3xl overflow-hidden shadow-xl max-w-md mx-auto">
          <div className="bg-teal-600 text-white p-5 text-center">
            <h3 className="text-lg font-bold">일반인 재테크 아카데미</h3>
            <p className="text-sm text-teal-100">비대면 4주 수업 + 107강 온라인 강의</p>
          </div>
          <div className="p-6 bg-white text-center">
            <div className="text-4xl font-black text-teal-700 mb-2">55<span className="text-lg font-normal text-gray-500">만원</span></div>
            <button onClick={() => onPayment('class-online')} className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl text-lg mt-4">지금 수강 신청하기</button>
          </div>
        </div>
      </div>
      <div className="bg-gray-900 text-gray-400 px-5 py-6 text-center text-xs">
        <p>오원트금융연구소 | 대표: 오상열</p>
      </div>
      <button onClick={onBack} className="fixed top-4 left-4 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-xl z-50">←</button>
    </div>
  );
}

// ============================================
// PAGE 3: 금융전문가(FP) 과정
// ============================================
function ExpertDetailPage({ onBack, onPayment }: { onBack: () => void; onPayment: (id: string) => void }) {
  return (
    <div className="min-h-screen bg-white overflow-y-auto">
      <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 text-white px-5 py-16 text-center">
        <span className="inline-block bg-pink-500 px-4 py-1.5 rounded-full text-xs font-bold mb-4">👨‍🏫 금융전문가(FP) 대상 과정</span>
        <h1 className="text-3xl font-black mb-4">오상열의 <span className="text-yellow-400">금융집짓기®</span><br/>재무설계 전문가 과정</h1>
        <p className="text-purple-200 text-sm max-w-md mx-auto">15분 만에 A4 한장으로 고객의 재정상태를 X-ray 촬영하듯 진단하고, 자연스럽게 계약 클로징까지!</p>
      </div>
      <div className="px-5 py-10 bg-purple-50">
        <h2 className="text-xl font-bold text-center text-purple-800 mb-6">과정 <span className="text-pink-500">안내</span></h2>
        <div className="border-2 border-purple-500 rounded-3xl overflow-hidden shadow-xl max-w-md mx-auto">
          <div className="bg-purple-600 text-white p-5 text-center">
            <h3 className="text-lg font-bold">금융집짓기® 재무설계 전문가(FP) 과정</h3>
            <p className="text-sm text-purple-200">대면 4주 + 비대면 1년 | 소수정예 8명</p>
          </div>
          <div className="p-6 bg-white text-center">
            <div className="text-4xl font-black text-purple-700 mb-2">110<span className="text-lg font-normal text-gray-500">만원</span></div>
            <button onClick={() => onPayment('class-pro')} className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl text-lg mt-4">Academy 신청하기</button>
          </div>
        </div>
      </div>
      <div className="bg-gray-900 text-gray-400 px-5 py-6 text-center text-xs">
        <p>오원트금융연구소 | 대표: 오상열 | Copyright © 2015</p>
      </div>
      <button onClick={onBack} className="fixed top-4 left-4 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-xl z-50">←</button>
    </div>
  );
}
