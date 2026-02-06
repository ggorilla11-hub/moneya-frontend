import { useState } from 'react';
import type { ConsultingProduct } from './ConsultingApplyPage';

const PROFILE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%98%A4%EC%83%81%EC%97%B4%20%EC%82%AC%EC%A7%84.png?alt=media&token=63eaf15e-9d0b-4d72-8fbb-ee03d6ecc8e5';

export const CONSULTING_PRODUCTS: ConsultingProduct[] = [
  { id: 'consult-online', name: '비대면 상담', price: 330000, priceLabel: '33만원', description: '화상으로 진행되는 1:1 맞춤 재무상담 · 2회 진행', paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzU4NjYzMDE4' },
  { id: 'consult-offline', name: '대면 상담', price: 550000, priceLabel: '55만원', description: '직접 만나서 진행하는 심층 재무상담 · 2회 진행', paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzU4NjYzMDE4' },
  { id: 'consult-vip', name: '자산가 상담', price: 1100000, priceLabel: '110만원', description: '금융자산 10억원 초과 고객 전용 VIP 상담 · 3회 진행', paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzY3MzM3NjA0' },
  { id: 'class-online', name: '일반인 비대면 수업', price: 550000, priceLabel: '55만원', description: '주 1회 · 매주 2시간 · 4주간 총 8시간', paypleUrl: 'https://link.payple.kr/NzcxOjc2ODQ3NzcyMjc4MzY3' },
  { id: 'class-pro', name: '전문가 수업', price: 1100000, priceLabel: '110만원', description: '대면 4주 + 비대면 1년 · 매주 토요일 오후 1-6시', paypleUrl: 'https://link.payple.kr/NzcxOjc2MTU0NTgyMDA0MDQ4' },
];

type DetailPageType = 'consultation' | 'academy' | 'expert' | null;

interface ConsultingPageProps {
  onBack: () => void;
  onApply: (product: ConsultingProduct) => void;
}

export default function ConsultingPage({ onBack, onApply }: ConsultingPageProps) {
  const [detailPage, setDetailPage] = useState<DetailPageType>(null);

  const handleCall = () => { window.location.href = 'tel:010-5424-5332'; };
  const handleEmail = () => { window.location.href = 'mailto:ggorilla11@gmail.com?subject=[AI머니야] 상담/강의 문의'; };
  const handleShowDetail = (pageType: DetailPageType) => { setDetailPage(pageType); };
  const handlePaymentFromDetail = (productId: string) => {
    const product = CONSULTING_PRODUCTS.find(p => p.id === productId);
    if (product) onApply(product);
  };

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

        <h2 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-1.5">💼 1:1 재무상담</h2>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5"><div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-lg">📹</div><span className="text-base font-bold text-gray-900">비대면 상담</span></div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">화상으로 진행되는 1:1 맞춤 재무상담<br/>2회 진행 · 일정 별도 협의</p>
          <div className="flex justify-between items-center"><span className="text-lg font-extrabold text-gray-900">33만원</span><button onClick={() => handleShowDetail('consultation')} className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl text-sm shadow-lg">신청하기</button></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5"><div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-lg">🤝</div><span className="text-base font-bold text-gray-900">대면 상담</span></div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">직접 만나서 진행하는 심층 재무상담<br/>2회 진행 · 일정 별도 협의</p>
          <div className="flex justify-between items-center"><span className="text-lg font-extrabold text-gray-900">55만원</span><button onClick={() => handleShowDetail('consultation')} className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl text-sm shadow-lg">신청하기</button></div>
        </div>
        <div className="relative bg-white border-2 border-yellow-500 rounded-2xl p-4 mb-3">
          <div className="absolute -top-2 right-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2 py-0.5 rounded-lg text-[9px] font-bold">💎 PREMIUM</div>
          <div className="flex items-center gap-2.5 mb-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-lg">👑</div><span className="text-base font-bold text-gray-900">자산가 상담</span></div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">금융자산 10억원 초과 고객 전용 VIP 상담<br/>3회 진행 · 일정 별도 협의</p>
          <div className="flex justify-between items-center"><span className="text-lg font-extrabold text-gray-900">110만원</span><button onClick={() => handleShowDetail('consultation')} className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold rounded-xl text-sm shadow-lg">신청하기</button></div>
        </div>

        <h2 className="text-sm font-extrabold text-gray-900 mb-3 mt-6 flex items-center gap-1.5">📚 재테크 & 재무설계 강의</h2>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5"><div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-lg">🎓</div><span className="text-base font-bold text-gray-900">일반인 비대면 수업</span></div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">주 1회 · 매주 2시간 · 4주간 총 8시간<br/>수강 종료 후 월 1회 월례교육 포함</p>
          <div className="flex justify-between items-center"><span className="text-lg font-extrabold text-gray-900">55만원</span><button onClick={() => handleShowDetail('academy')} className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-xl text-sm shadow-lg">신청하기</button></div>
        </div>
        <div className="relative bg-white border-2 border-purple-500 rounded-2xl p-4 mb-3">
          <div className="absolute -top-2 right-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2 py-0.5 rounded-lg text-[9px] font-bold">🏆 FP전용</div>
          <div className="flex items-center gap-2.5 mb-2.5"><div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-lg">🎖️</div><span className="text-base font-bold text-gray-900">금융전문가(FP) 수업</span></div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">대면 4주 + <span className="font-bold text-purple-600">비대면 1년간</span> 수업<br/>매주 토요일 오후 1-6시 (5시간)<br/>📍 선릉역 강의장</p>
          <div className="flex justify-between items-center"><span className="text-lg font-extrabold text-gray-900">110만원</span><button onClick={() => handleShowDetail('expert')} className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl text-sm shadow-lg">신청하기</button></div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 mt-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">💡 상담/강의 안내</h3>
          <div className="space-y-1.5 text-xs text-gray-600">
            <p className="pl-4 relative before:content-['•'] before:absolute before:left-1">신청 후 24시간 내 연락드립니다</p>
            <p className="pl-4 relative before:content-['•'] before:absolute before:left-1">일정은 개별 협의로 진행됩니다</p>
            <p className="pl-4 relative before:content-['•'] before:absolute before:left-1">환불 규정: 수업 시작 전 100% 환불</p>
          </div>
          <div className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-2">
            <button onClick={handleCall} className="flex items-center gap-2 text-xs"><span>📞 문의:</span><strong className="text-gray-900">010-5424-5332</strong></button>
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
  if (pageType === 'academy') return <AcademyDetailPage onBack={onBack} onPayment={onPayment} />;
  if (pageType === 'expert') return <ExpertDetailPage onBack={onBack} onPayment={onPayment} />;
  return null;
}

// ============================================
// PAGE 1: 1:1 재무상담 상세페이지 (원본)
// ============================================
function ConsultationDetailPage({ onBack, onPayment }: { onBack: () => void; onPayment: (id: string) => void }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="min-h-screen bg-white overflow-y-auto">
      {/* 히어로 */}
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

      {/* 고민 섹션 */}
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

      {/* 전문가 소개 */}
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

      {/* 10억 목돈 절대법칙 + 특전 */}
      <div className="bg-blue-900 text-white px-5 py-10">
        <h2 className="text-xl font-bold text-center mb-6">10억 목돈 마련의 <span className="text-yellow-400">절대법칙</span></h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-blue-900 font-bold mx-auto mb-2">1</div>
            <h3 className="font-bold text-sm mb-1">돈의 원리 5단계</h3>
            <p className="text-xs text-blue-200">벌다→모으다→불리다→굴리다→지키다</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-blue-900 font-bold mx-auto mb-2">2</div>
            <h3 className="font-bold text-sm mb-1">돈의 순서 5단계</h3>
            <p className="text-xs text-blue-200">비상자금→신용대출상환→10억목돈→담보대출상환→경제적자립</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-blue-900 font-bold mx-auto mb-2">3</div>
            <h3 className="font-bold text-sm mb-1">돈의 기준 5원칙</h3>
            <p className="text-xs text-blue-200">전문가신뢰, 비교금지, 시간투자, 낮은기대수익률, 목표수립</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-yellow-600 text-xl mx-auto mb-2">🎁</div>
            <h3 className="font-bold text-sm mb-1 text-blue-900">특전 소개</h3>
            <p className="text-xs text-blue-900">✓ 전자책 ✓ 온라인 107강<br/>✓ 월례세미나 초대<br/><strong>👑 프리미엄급 서비스</strong></p>
          </div>
        </div>
      </div>

      {/* 가격 선택 */}
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
              <li className="flex gap-2"><span className="text-green-500">✓</span>21일 내 진행</li>
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
              <li className="flex gap-2"><span className="text-green-500">✓</span>21일 내 진행</li>
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
              <li className="flex gap-2"><span className="text-green-500">✓</span>28일 내 진행</li>
            </ul>
            <button onClick={() => onPayment('consult-vip')} className="w-full py-3.5 bg-blue-900 text-white font-bold rounded-xl">상담 신청하기</button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-blue-800 to-blue-900 text-white px-5 py-12 text-center">
        <h2 className="text-xl font-bold mb-3">지금 바로 경제적 자유를 향한<br/>첫 걸음을 내딛으세요</h2>
        <p className="text-blue-200 text-sm mb-6">20년 경력의 CFP 전문가가 당신만의 맞춤 재무설계를 도와드립니다</p>
        <button onClick={() => setShowModal(true)} className="px-10 py-4 bg-yellow-500 text-blue-900 font-bold rounded-full text-lg shadow-xl">유료 상담 신청하기</button>
      </div>

      {/* 푸터 */}
      <div className="bg-gray-900 text-gray-400 px-5 py-6 text-center text-xs">
        <p>오원트금융연구소 | 대표: 오상열</p>
        <p className="mt-2">본 상담은 투자자문업에 해당하지 않으며, 금융상품에 대한 최종 투자 결정은 고객 본인의 판단에 따릅니다.</p>
      </div>

      {/* 뒤로가기 */}
      <button onClick={onBack} className="fixed top-4 left-4 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-xl z-50">←</button>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-center mb-4">상담 유형 선택</h3>
            <div className="space-y-3">
              <button onClick={() => { onPayment('consult-online'); setShowModal(false); }} className="w-full p-4 bg-gray-100 rounded-xl flex justify-between items-center"><span className="font-bold">비대면 상담</span><span className="text-yellow-600 font-bold">33만원</span></button>
              <button onClick={() => { onPayment('consult-offline'); setShowModal(false); }} className="w-full p-4 bg-gray-100 rounded-xl flex justify-between items-center"><span className="font-bold">대면 상담</span><span className="text-yellow-600 font-bold">55만원</span></button>
              <button onClick={() => { onPayment('consult-vip'); setShowModal(false); }} className="w-full p-4 bg-gray-100 rounded-xl flex justify-between items-center"><span className="font-bold">자산가 상담</span><span className="text-yellow-600 font-bold">110만원</span></button>
            </div>
            <button onClick={() => setShowModal(false)} className="w-full mt-4 py-2 text-gray-500">닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// PAGE 2: 일반인 재테크 아카데미 상세페이지 (원본 기반)
// ============================================
function AcademyDetailPage({ onBack, onPayment }: { onBack: () => void; onPayment: (id: string) => void }) {
  return (
    <div className="min-h-screen bg-white overflow-y-auto">
      {/* 히어로 */}
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

      {/* 추천 대상 */}
      <div className="px-5 py-10 bg-teal-50">
        <h2 className="text-xl font-bold text-center text-teal-800 mb-6">이런 분께 <span className="text-yellow-600">추천</span>드립니다</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '💸', title: '월급만으로는 부족하신 분', desc: '열심히 일해도 통장 잔고가 늘지 않는 직장인' },
            { icon: '🤔', title: '투자 방법을 모르시는 분', desc: '주식, 펀드, 부동산... 뭐부터 해야 할지 모르겠는 분' },
            { icon: '🏠', title: '내 집 마련을 꿈꾸시는 분', desc: '부동산 전략을 세우고 싶은 신혼부부·1인가구' },
            { icon: '👴', title: '노후 준비가 걱정되시는 분', desc: '연금과 노후자금 설계가 필요하신 분' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border-t-4 border-teal-500 shadow">
              <span className="text-3xl">{item.icon}</span>
              <h3 className="font-bold text-teal-800 text-sm mt-2 mb-1">{item.title}</h3>
              <p className="text-xs text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4주 커리큘럼 */}
      <div className="px-5 py-10">
        <h2 className="text-xl font-bold text-center text-teal-800 mb-6">체계적인 <span className="text-yellow-600">4주</span> 커리큘럼</h2>
        <div className="space-y-4">
          {[
            { week: '01', title: '기초 다지기', sub: '돈의 기본', topics: ['돈의 원리 5단계', '돈의 순서 5단계', '재무목표 설정', '재무상태 진단'] },
            { week: '02', title: '저축과 투자', sub: '자산 불리기', topics: ['비상자금 전략', '효율적 저축법', '펀드·주식 기초', '복리의 마법'] },
            { week: '03', title: '부채와 보험', sub: '지키기', topics: ['부채 상환 우선순위', '신용관리 전략', '필수 보험 정리', '보험료 줄이기'] },
            { week: '04', title: '실전 설계', sub: '목표 달성', topics: ['10억 로드맵', '포트폴리오 구성', '세금 절약 팁', '은퇴설계 시뮬레이션'] },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl shadow overflow-hidden flex">
              <div className="bg-teal-600 text-white p-4 flex flex-col items-center justify-center min-w-[70px]">
                <div className="text-2xl font-black opacity-50">{item.week}</div>
                <div className="text-[10px]">Week</div>
              </div>
              <div className="p-4 flex-1">
                <h3 className="font-bold text-teal-800">{item.title} <span className="text-xs bg-yellow-400 text-teal-900 px-2 py-0.5 rounded-full ml-1">{item.sub}</span></h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.topics.map(t => <span key={t} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded">✓ {t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 특별한 이유 */}
      <div className="bg-teal-800 text-white px-5 py-10">
        <h2 className="text-xl font-bold text-center mb-6">이 강의가 <span className="text-yellow-400">특별한</span> 이유</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🎯', title: '실전 중심 107강', desc: '바로 적용 가능한 체계적인 커리큘럼' },
            { icon: '👨‍🏫', title: '검증된 전문가', desc: '금융감독원 공식 강사, 20년 경력 CFP' },
            { icon: '📅', title: '월례세미나', desc: '매월 1회 오프라인 세미나 참여' },
            { icon: '📚', title: '워크북 제공', desc: '재테크과외 전용 워크북' },
            { icon: '🎁', title: '전자책 제공', desc: '금융집짓기 전자책 무료 제공' },
            { icon: '🔄', title: '1년간 복습', desc: '온라인강의 1년간 무제한 시청' },
          ].map((item, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
              <span className="text-2xl">{item.icon}</span>
              <h3 className="font-bold text-sm mt-2">{item.title}</h3>
              <p className="text-xs text-teal-200 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 강사 소개 */}
      <div className="px-5 py-10 bg-gray-50">
        <h2 className="text-xl font-bold text-center text-teal-800 mb-6"><span className="text-yellow-600">강사</span> 소개</h2>
        <div className="flex gap-4 items-start">
          <img src={PROFILE_IMAGE_URL} alt="오상열" className="w-28 h-36 rounded-2xl object-cover shadow-xl flex-shrink-0"/>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">오상열 대표</h3>
            <p className="text-teal-600 text-sm font-semibold mb-3">오원트금융연구소 대표 | CFP, CFHA</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['삼성그룹 공채 34기', '삼성화재 교육팀 10년', '금융감독원 강사', 'SBS Biz 출연', '유튜브 4.5만', '저서 3권'].map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] rounded border border-teal-200">{tag}</span>
              ))}
            </div>
            <div className="bg-teal-50 rounded-xl p-3 border-l-4 border-teal-500">
              <p className="text-xs text-gray-700 italic">"10억 목돈은 누구나 만들 수 있습니다. 다만 올바른 순서와 방법을 알아야 합니다."</p>
            </div>
          </div>
        </div>
      </div>

      {/* 프리미엄 혜택 */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-5 py-10">
        <h2 className="text-xl font-bold text-center text-yellow-900 mb-4">👑 프리미엄 등급 혜택</h2>
        <div className="space-y-2">
          {['🎁 월 1회 월례세미나 참석권', '📚 재테크과외 워크북 제공', '🎬 온라인강의 107강 1년간 무제한', '📖 금융집짓기 전자책 제공'].map(item => (
            <div key={item} className="bg-white/80 rounded-xl px-4 py-3 text-sm font-medium text-gray-800">{item}</div>
          ))}
        </div>
      </div>

      {/* 수강료 */}
      <div className="px-5 py-10">
        <h2 className="text-xl font-bold text-center text-gray-900 mb-6">수강료 <span className="text-yellow-600">안내</span></h2>
        <div className="border-2 border-teal-500 rounded-3xl overflow-hidden shadow-xl max-w-md mx-auto">
          <div className="bg-teal-600 text-white p-5 text-center">
            <h3 className="text-lg font-bold">일반인 재테크 아카데미</h3>
            <p className="text-sm text-teal-100">비대면 4주 수업 + 107강 온라인 강의 + 프리미엄 혜택</p>
          </div>
          <div className="p-6 bg-white text-center">
            <div className="text-4xl font-black text-teal-700 mb-2">55<span className="text-lg font-normal text-gray-500">만원</span></div>
            <p className="text-sm text-teal-600 font-semibold mb-4">🔥 프리미엄 등급 서비스 제공</p>
            <div className="bg-teal-50 rounded-xl p-4 mb-5 text-sm">
              <h4 className="font-bold text-teal-800 mb-2">📅 수업 일정</h4>
              <p className="text-gray-700"><strong>매달 개강</strong> | 매주 월요일 저녁 7시~10시 (3시간)</p>
              <p className="text-gray-600 text-xs mt-1">4주 연속 비대면 강의 진행</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-5 text-xs">
              <div className="bg-gray-100 rounded-lg p-2"><div className="text-gray-500">총 강의</div><div className="font-bold text-teal-700">107강</div></div>
              <div className="bg-gray-100 rounded-lg p-2"><div className="text-gray-500">비대면</div><div className="font-bold text-teal-700">4주</div></div>
              <div className="bg-gray-100 rounded-lg p-2"><div className="text-gray-500">복습기간</div><div className="font-bold text-teal-700">1년</div></div>
            </div>
            <button onClick={() => onPayment('class-online')} className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl text-lg">지금 수강 신청하기</button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white px-5 py-12 text-center">
        <h2 className="text-xl font-bold mb-3">경제적 자유를 향한 여정,<br/>지금 시작하세요</h2>
        <p className="text-teal-100 text-sm mb-6">20년 경력의 CFP 전문가와 함께 10억 목돈 마련의 비밀을 배워보세요</p>
        <button onClick={() => onPayment('class-online')} className="px-10 py-4 bg-white text-teal-700 font-bold rounded-full text-lg shadow-xl">수강 신청하기</button>
      </div>

      {/* 푸터 */}
      <div className="bg-gray-900 text-gray-400 px-5 py-6 text-center text-xs">
        <p>오원트금융연구소 | 대표: 오상열</p>
        <p className="mt-2">본 강의는 투자자문업에 해당하지 않으며, 금융상품에 대한 최종 투자 결정은 수강생 본인의 판단에 따릅니다.</p>
      </div>

      {/* 뒤로가기 */}
      <button onClick={onBack} className="fixed top-4 left-4 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-xl z-50">←</button>
    </div>
  );
}

// ============================================
// PAGE 3: 금융전문가(FP) 과정 상세페이지 (원본 기반)
// ============================================
function ExpertDetailPage({ onBack, onPayment }: { onBack: () => void; onPayment: (id: string) => void }) {
  return (
    <div className="min-h-screen bg-white overflow-y-auto">
      {/* 히어로 */}
      <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 text-white px-5 py-16 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <span className="inline-block bg-pink-500 px-4 py-1.5 rounded-full text-xs font-bold mb-4 relative">👨‍🏫 금융전문가(FP) 대상 과정</span>
        <h1 className="text-3xl font-black mb-4 relative">오상열의 <span className="text-yellow-400">금융집짓기®</span><br/>재무설계 전문가 과정</h1>
        <p className="text-purple-200 text-sm max-w-md mx-auto relative">15분 만에 A4 한장으로 고객의 재정상태를 X-ray 촬영하듯 진단하고, 자연스럽게 계약 클로징까지!</p>
        <div className="flex justify-center gap-4 mt-6 flex-wrap relative">
          <span className="bg-white/15 px-4 py-2 rounded-lg text-sm">📅 대면 <strong>4주</strong> + 비대면 <strong className="underline">1년간</strong></span>
          <span className="bg-white/15 px-4 py-2 rounded-lg text-sm">👥 소수정예 <strong>8명</strong></span>
          <span className="bg-white/15 px-4 py-2 rounded-lg text-sm">💰 <strong>110만원</strong></span>
        </div>
        <button onClick={() => onPayment('class-pro')} className="mt-8 px-10 py-4 bg-white text-purple-700 font-bold rounded-full text-lg shadow-xl relative">Academy 신청하기</button>
      </div>

      {/* 솔루션 */}
      <div className="px-5 py-10 bg-purple-50">
        <h2 className="text-xl font-bold text-center text-purple-800 mb-6"><span className="text-pink-500">금융집짓기®</span>가 해결해 드립니다</h2>
        <div className="space-y-3">
          {[
            { title: '15분 X-ray 재무진단', desc: 'A4 한장으로 막연했던 고객의 재정상태를 한눈에 확인! 자연스럽게 계약 클로징이 가능합니다.' },
            { title: '단순한 설계사 → 금융전문가', desc: '금융집짓기® 재무설계는 고객에게 단순한 설계사가 아닌 금융전문가로 신뢰를 얻을 수 있습니다.' },
            { title: '최적화된 클로징 기법', desc: '수많은 실전 사례들을 통해 최적화된 상담기법으로 완벽한 클로징기법을 만날 수 있습니다.' },
            { title: '퍼스널 브랜딩 + 디지털 역량', desc: '전문적인 금융지식의 향상으로 전문가의 퍼스널 브랜딩이 가능하고, 디지털 활용능력이 좋아집니다.' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border-l-4 border-purple-500 shadow">
              <h3 className="font-bold text-purple-700">✨ {item.title}</h3>
              <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 추천 대상 */}
      <div className="bg-purple-800 text-white px-5 py-10">
        <h2 className="text-xl font-bold text-center mb-6">이런 분께 <span className="text-yellow-400">추천</span>합니다</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            '비대면으로 고객을 확보하여 상담을 하고 싶으신 분',
            '대면상담으로 계약 실적이 안좋으신 분',
            '상품만으로 고객을 설득하기 어려우신 분',
            '보상관련 영업만으로 대안을 찾지 못해 고민이 많은 분',
          ].map((item, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-yellow-400 mb-2">0{i + 1}</div>
              <p className="text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4주 커리큘럼 */}
      <div className="px-5 py-10">
        <h2 className="text-xl font-bold text-center text-purple-800 mb-6"><span className="text-pink-500">4주</span> 커리큘럼</h2>
        <div className="space-y-3">
          {[
            { num: 1, title: '금융집짓기® 기초', topics: ['금융집짓기® 소프트웨어', '금융집짓기 세일즈 프로세스'] },
            { num: 2, title: '재테크 이론 마스터', topics: ['재테크 기초이론 10가지', '재무설계 중급이론 8가지', '화폐의 시간가치', '포트폴리오 자산배분'] },
            { num: 3, title: '세일즈 파워', topics: ['주력상품 이해와 상품제안', '세일즈 파워화법 연구', '세일즈 프로세스 PR~AR'] },
            { num: 4, title: '실전 & 성공', topics: ['재무설계 시스템 활용법', 'Case Study Role Playing', '금융꿀팁 & 정보시스템'] },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow">
              <h3 className="font-bold text-purple-700 mb-2">{item.num}교시: {item.title}</h3>
              <div className="flex flex-wrap gap-1.5">
                {item.topics.map(t => <span key={t} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 강사 소개 */}
      <div className="px-5 py-10 bg-purple-50">
        <h2 className="text-xl font-bold text-center text-purple-800 mb-6"><span className="text-pink-500">강사</span> 소개</h2>
        <div className="flex gap-4 items-start">
          <div className="relative flex-shrink-0">
            <img src={PROFILE_IMAGE_URL} alt="오상열" className="w-28 h-36 rounded-2xl object-cover shadow-xl"/>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">🏆 금융감독원 강사</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">오상열 대표</h3>
            <p className="text-pink-500 text-sm font-semibold mb-3">오원트금융연구소 대표 | CFP, CFHA</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['국제공인 CFP', '펀드투자상담사', '증권투자 상담사', 'COT, 50주 3W, 월 77건 체결', '전 삼성화재 영업교육팀', '금융감독원 강사'].map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-purple-100 text-purple-600 text-[10px] rounded">{tag}</span>
              ))}
            </div>
            <p className="text-xs text-gray-600">📚 저서: 윈트 재무설계 소원을 말해봐, 빚부터 갚아라<br/>유튜브 "오상열의 재테크 과외" 구독자 4.5만명</p>
          </div>
        </div>
      </div>

      {/* 수강생 후기 */}
      <div className="px-5 py-10">
        <h2 className="text-xl font-bold text-center text-purple-800 mb-6">수강생 <span className="text-pink-500">후기</span></h2>
        <div className="space-y-3">
          {[
            { name: '김○○', role: '보험설계사', review: '"금융집짓기를 통하여 저부터 재정정비를 정리해보니 그동안 막연했던 부분들이 어느정도 방향이 잡힌듯하여 모든 분들에게 꼭 금융집짓기를 받으셔야 한다고 생각합니다"' },
            { name: '이○○', role: '재무설계사', review: '"금융집짓기 교육을 통해서 많은 것을 느끼게 되었습니다. 교육을 받으면서 어떻게 노후준비를 해야 되는 건지를 잘 알게 되었습니다"' },
            { name: '박○○', role: 'FC', review: '"금융집짓기는 15분안에 고객의 원트와 니즈를 파악하는데 아주 유용합니다. 고객의 원트에 맞춤 상담하다 보니 상담이 원활히 진행이 되고 계약으로 이루어지게 됩니다"' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow">
              <p className="text-sm text-gray-600 italic border-l-3 border-purple-400 pl-3 mb-3">{item.review}</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">{item.name[0]}</div>
                <div><p className="font-bold text-purple-700 text-sm">{item.name}</p><p className="text-xs text-gray-500">{item.role}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 수강료 */}
      <div className="px-5 py-10 bg-purple-50">
        <h2 className="text-xl font-bold text-center text-purple-800 mb-6">과정 <span className="text-pink-500">안내</span></h2>
        <div className="border-3 border-purple-500 rounded-3xl overflow-hidden shadow-xl max-w-md mx-auto">
          <div className="bg-purple-600 text-white p-5 text-center">
            <h3 className="text-lg font-bold">금융집짓기® 재무설계 전문가(FP) 과정</h3>
            <p className="text-sm text-purple-200">대면 4주 + 비대면 1년 | 소수정예 8명</p>
          </div>
          <div className="p-6 bg-white">
            <div className="text-center mb-5">
              <div className="text-4xl font-black text-purple-700">110<span className="text-lg font-normal text-gray-500">만원</span></div>
              <p className="text-sm text-purple-600 font-semibold mt-1">대면 4주 + 비대면 <span className="underline font-bold">1년간</span> 집중 과정</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl p-4 mb-5">
              <h4 className="font-bold text-purple-800 mb-3 text-center">📅 교육 일정</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">대면 수업</span><span className="font-semibold">매주 토요일 오후 1시~6시 × 4주</span></div>
                <div className="flex justify-between"><span className="text-gray-600">비대면 수업</span><span className="font-bold text-purple-700"><span className="text-lg">1년간</span> 매주 화요일 저녁 8시~10시</span></div>
                <div className="flex justify-between"><span className="text-gray-600">교육장소</span><span className="font-semibold">위비즈강의장 (선릉역 5번출구 5분)</span></div>
                <div className="flex justify-between"><span className="text-gray-600">모집인원</span><span className="font-semibold">8명 (소수정예)</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-5 text-xs">
              <div className="bg-purple-50 rounded-lg p-3 text-center"><div className="text-gray-500">대면 과정</div><div className="font-bold text-purple-700">4주 (20시간)</div></div>
              <div className="bg-purple-50 rounded-lg p-3 text-center"><div className="text-gray-500">비대면 과정</div><div className="font-bold text-purple-700">1년간 매주 2시간</div></div>
              <div className="bg-purple-50 rounded-lg p-3 text-center"><div className="text-gray-500">총 교육시간</div><div className="font-bold text-purple-700">120시간+</div></div>
              <div className="bg-purple-50 rounded-lg p-3 text-center"><div className="text-gray-500">수료증</div><div className="font-bold text-purple-700">발급</div></div>
            </div>
            <button onClick={() => onPayment('class-pro')} className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl text-lg">Academy 신청하기</button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-purple-700 to-purple-800 text-white px-5 py-12 text-center">
        <h2 className="text-xl font-bold mb-3">금융전문가로서 한 단계 도약하세요</h2>
        <p className="text-purple-200 text-sm mb-6">20년 노하우가 담긴 금융집짓기® 방법론으로 고객의 신뢰를 얻고 계약 클로징률을 높이세요</p>
        <button onClick={() => onPayment('class-pro')} className="px-10 py-4 bg-white text-purple-700 font-bold rounded-full text-lg shadow-xl">Academy 신청하기</button>
      </div>

      {/* 푸터 */}
      <div className="bg-gray-900 text-gray-400 px-5 py-6 text-center text-xs">
        <p>오원트금융연구소 | 대표: 오상열 | Copyright © 2015</p>
      </div>

      {/* 뒤로가기 */}
      <button onClick={onBack} className="fixed top-4 left-4 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-xl z-50">←</button>
    </div>
  );
}
