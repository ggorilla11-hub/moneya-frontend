// ConsultingPage.tsx
// 전문가 상담 · 강의 신청 페이지 - 베이스캠프 5.0
// 오상열 CFP 배너 + 상담/강의 카드 + 신청 폼

import { useState } from 'react';

interface ConsultingPageProps {
  onBack: () => void;
}

// 상담/강의 상품 정의
const SERVICES = {
  consulting: [
    { 
      id: 'online', 
      icon: '📹', 
      iconBg: 'bg-blue-100', 
      title: '비대면 상담', 
      desc: '화상으로 진행되는 1:1 맞춤 재무상담\n2회 진행 · 일정 별도 협의',
      price: 330000,
      priceText: '33만원'
    },
    { 
      id: 'offline', 
      icon: '🤝', 
      iconBg: 'bg-green-100', 
      title: '대면 상담', 
      desc: '직접 만나서 진행하는 심층 재무상담\n2회 진행 · 일정 별도 협의',
      price: 550000,
      priceText: '55만원'
    },
    { 
      id: 'vip', 
      icon: '👑', 
      iconBg: 'bg-gradient-to-br from-yellow-100 to-yellow-200', 
      title: '자산가 상담', 
      desc: '금융자산 10억원 초과 고객 전용 VIP 상담\n3회 진행 · 일정 별도 협의',
      price: 1100000,
      priceText: '110만원',
      premium: true,
      badge: '💎 PREMIUM'
    }
  ],
  classes: [
    { 
      id: 'general', 
      icon: '🎓', 
      iconBg: 'bg-indigo-100', 
      title: '일반인 비대면 수업', 
      desc: '주 1회 · 매주 2시간 · 4주간 총 8시간\n수강 종료 후 월 1회 월례교육 포함',
      price: 550000,
      priceText: '55만원'
    },
    { 
      id: 'expert', 
      icon: '🎖️', 
      iconBg: 'bg-pink-100', 
      title: '전문가 수업', 
      desc: '대면 4주 + 비대면 1년간 수업\n매주 토요일 오후 1-6시 (5시간)\n📍 선릉역 강의장',
      price: 1100000,
      priceText: '110만원',
      premium: true,
      badge: '🏆 ADVANCED'
    }
  ]
};

export default function ConsultingPage({ onBack }: ConsultingPageProps) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedService, setSelectedService] = useState<typeof SERVICES.consulting[0] | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    memo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleApply = (service: typeof SERVICES.consulting[0]) => {
    setSelectedService(service);
    setShowApplyModal(true);
    setSubmitSuccess(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      alert('이름과 연락처를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Make.com Webhook URL (나중에 실제 URL로 교체)
      const webhookUrl = 'YOUR_MAKE_WEBHOOK_URL';
      
      const payload = {
        timestamp: new Date().toISOString(),
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        serviceType: selectedService?.title,
        servicePrice: selectedService?.priceText,
        memo: formData.memo,
        status: '신규'
      };

      // TODO: 실제 Make.com 연동 시 아래 주석 해제
      // const response = await fetch(webhookUrl, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });

      // 임시: 로컬 스토리지에 저장
      const applications = JSON.parse(localStorage.getItem('consultingApplications') || '[]');
      applications.push(payload);
      localStorage.setItem('consultingApplications', JSON.stringify(applications));

      console.log('상담 신청 데이터:', payload);
      
      setSubmitSuccess(true);
      setFormData({ name: '', phone: '', email: '', memo: '' });
      
      // 3초 후 모달 닫기
      setTimeout(() => {
        setShowApplyModal(false);
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('신청 실패:', error);
      alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* 헤더 */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-200">
        <button 
          onClick={onBack}
          className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center active:bg-gray-200 transition-colors"
        >
          <span className="text-lg">←</span>
        </button>
        <span className="flex-1 text-base font-bold text-gray-800">전문가 상담 · 강의</span>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-4 pb-8">
        
        {/* 전문가 배너 */}
        <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-5 flex gap-4 items-center mb-5 border border-yellow-300">
          <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-lg flex-shrink-0 bg-gray-200 flex items-center justify-center">
            {/* TODO: Firebase 사진 URL로 교체 */}
            <span className="text-4xl">👨‍💼</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-lg font-extrabold text-gray-900">오상열 대표</span>
              <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">CFP</span>
            </div>
            <p className="text-xs text-yellow-700 font-bold mb-2">금융집짓기® 창시자 · 20년 경력</p>
            <p className="text-[11px] text-gray-600 leading-relaxed italic">
              "재무설계는 집을 짓는 것과 같습니다.<br/>튼튼한 기초 위에 꿈을 쌓아올리세요."
            </p>
          </div>
        </div>

        {/* 1:1 상담 섹션 */}
        <p className="text-sm font-extrabold text-gray-800 mb-3 flex items-center gap-1.5">🎯 1:1 맞춤 재무상담</p>
        
        {SERVICES.consulting.map((service) => (
          <ServiceCard 
            key={service.id} 
            service={service} 
            onApply={() => handleApply(service)} 
          />
        ))}

        {/* 강의 섹션 */}
        <p className="text-sm font-extrabold text-gray-800 mb-3 mt-6 flex items-center gap-1.5">📚 재테크 & 재무설계 강의</p>
        
        {SERVICES.classes.map((service) => (
          <ServiceCard 
            key={service.id} 
            service={service} 
            onApply={() => handleApply(service)} 
          />
        ))}

        {/* 안내 박스 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 mt-5 shadow-sm">
          <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">💡 상담/강의 안내</p>
          <div className="text-xs text-gray-600 space-y-1.5">
            <p className="pl-3 relative before:content-['•'] before:absolute before:left-0">신청 후 24시간 내 연락드립니다</p>
            <p className="pl-3 relative before:content-['•'] before:absolute before:left-0">일정은 개별 협의로 진행됩니다</p>
            <p className="pl-3 relative before:content-['•'] before:absolute before:left-0">환불 규정: 수업 시작 전 100% 환불</p>
          </div>
          <div className="mt-4 pt-4 border-t border-dashed border-gray-200 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">📞 문의:</span>
              <a href="tel:010-5424-5332" className="text-blue-600 font-bold">010-5424-5332</a>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">📧 이메일:</span>
              <a href="mailto:ggorilla11@gmail.com" className="text-blue-600 font-bold">ggorilla11@gmail.com</a>
            </div>
          </div>
        </div>
      </div>

      {/* 신청 모달 */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-teal-400 to-teal-600 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-bold">{selectedService?.title}</p>
                  <p className="text-white/80 text-xs">{selectedService?.priceText}</p>
                </div>
                <button 
                  onClick={() => setShowApplyModal(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {submitSuccess ? (
              /* 신청 완료 화면 */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <p className="text-lg font-bold text-gray-800 mb-2">신청 완료!</p>
                <p className="text-sm text-gray-500">24시간 내 연락드리겠습니다.</p>
              </div>
            ) : (
              /* 신청 폼 */
              <div className="p-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">이름 *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="홍길동"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">연락처 *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="010-1234-5678"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">이메일</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">메모 (선택)</label>
                    <textarea
                      value={formData.memo}
                      onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                      placeholder="문의사항이나 원하는 상담 시간 등"
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full mt-5 py-3.5 bg-gradient-to-r from-teal-400 to-teal-600 text-white font-bold rounded-xl disabled:opacity-50 active:scale-[0.98] transition-transform"
                >
                  {isSubmitting ? '신청 중...' : '신청하기'}
                </button>

                <p className="text-center text-[10px] text-gray-400 mt-3">
                  신청 정보는 상담 목적으로만 사용됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 서비스 카드 컴포넌트
function ServiceCard({ 
  service, 
  onApply 
}: { 
  service: {
    icon: string;
    iconBg: string;
    title: string;
    desc: string;
    priceText: string;
    premium?: boolean;
    badge?: string;
  };
  onApply: () => void;
}) {
  return (
    <div className={`bg-white rounded-2xl p-4 mb-3 border shadow-sm relative ${
      service.premium ? 'border-yellow-400' : 'border-gray-200'
    }`}>
      {service.badge && (
        <span className="absolute -top-2 right-4 px-2 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-[9px] font-bold rounded-full">
          {service.badge}
        </span>
      )}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${service.iconBg}`}>
          {service.icon}
        </div>
        <span className="text-base font-bold text-gray-800">{service.title}</span>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mb-3 whitespace-pre-line">{service.desc}</p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-extrabold text-gray-800">{service.priceText}</span>
        <button 
          onClick={onApply}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white active:scale-95 transition-transform ${
            service.premium 
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
              : 'bg-gradient-to-r from-teal-400 to-teal-600'
          }`}
        >
          신청하기
        </button>
      </div>
    </div>
  );
}
