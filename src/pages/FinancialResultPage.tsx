import { useState, useEffect, useRef } from 'react';

// 5개 집 이미지 URL (Vercel assets)
const HOUSE_IMAGES = [
  {
    level: 1,
    name: '텐트',
    image: 'https://moneya-frontend.vercel.app/assets/house1-Cg76rqP7.jpg',
    range: '0% 이하',
    message: '지금부터 시작입니다! 함께 금융 집을 지어봐요!'
  },
  {
    level: 2,
    name: '초가집',
    image: 'https://moneya-frontend.vercel.app/assets/house2-B1GiF-3L.jpg',
    range: '1-50%',
    message: '좋은 시작이에요! 조금씩 성장하고 있어요!'
  },
  {
    level: 3,
    name: '한옥',
    image: 'https://moneya-frontend.vercel.app/assets/house3-CiiNxUBf.jpg',
    range: '51-100%',
    message: '잘하고 계세요! 안정적인 재무 상태입니다!'
  },
  {
    level: 4,
    name: '고급양옥',
    image: 'https://moneya-frontend.vercel.app/assets/house4-ywz7gWNQ.jpg',
    range: '101-200%',
    message: '훌륭해요! 재무적으로 여유가 있으시네요!'
  },
  {
    level: 5,
    name: '궁전',
    image: 'https://moneya-frontend.vercel.app/assets/house5-CLgrT-Xl.jpg',
    range: '200% 초과',
    message: '축하합니다! 금융 부자예요!'
  }
];

// ★★★ 추가: Google Apps Script URL (기존 랜딩페이지와 동일한 DB에 저장) ★★★
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzngzqwukIs-TGUAjEHzj_rQwkjO-0Om-ptAPuwWtmAmrsnkd4b4WAPm5aqnLGuJaX_/exec';

// ★★★ 추가: 카카오 채널 URL ★★★
const KAKAO_CHANNEL_URL = 'https://pf.kakao.com/_vxfmfxj/chat';

interface FinancialResult {
  name: string;
  age: number;
  income: number;
  assets: number;
  debt: number;
  wealthIndex: number;
  level: number;
  houseName: string;
  houseImage: string;
  message: string;
}

interface FinancialResultPageProps {
  result: FinancialResult;
  onRetry: () => void;
  onNext: () => void;
  isFromHome?: boolean;
}

function FinancialResultPage({ result, onRetry, onNext, isFromHome = false }: FinancialResultPageProps) {
  const [displayLevel, setDisplayLevel] = useState(result.level);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentHouse = HOUSE_IMAGES[displayLevel - 1];

  // ★★★ 추가: 딥링크 여부 감지 ★★★
  const urlParams = new URLSearchParams(window.location.search);
  const isDeepLink = urlParams.get('page') === 'financial-check';

  // ★★★ 추가: 리포트 신청 폼 상태 ★★★
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    nickname: result.name || '',
    phone: '',
    email: '',
    familyCount: '1'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const handleDotClick = (level: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setDisplayLevel(level);
    if (level !== result.level) {
      timerRef.current = setTimeout(() => {
        setDisplayLevel(result.level);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setDisplayLevel(result.level);
  }, [result.level]);

  const formatManwon = (value: number): string => {
    return `${value.toLocaleString()}만원`;
  };

  // ★★★ 추가: 리포트 신청 제출 함수 ★★★
  const handleReportSubmit = async () => {
    // 유효성 검사
    if (!reportForm.nickname.trim()) {
      alert('이름을 입력해주세요');
      return;
    }
    if (!reportForm.phone.trim() || reportForm.phone.length < 10) {
      alert('전화번호를 정확히 입력해주세요');
      return;
    }
    if (!reportForm.email.trim() || !reportForm.email.includes('@')) {
      alert('이메일을 정확히 입력해주세요');
      return;
    }
    if (!privacyAgreed) {
      alert('개인정보 수집·이용에 동의해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      // 기존 랜딩페이지와 동일한 형식으로 Google Sheets에 저장
      const data = {
        nickname: reportForm.nickname,
        phone: reportForm.phone,
        email: reportForm.email,
        age: result.age,
        income: result.income,
        assets: result.assets,
        debt: result.debt,
        wealth_index: result.wealthIndex,
        house_type: result.houseName,
        family_count: parseInt(reportForm.familyCount)
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      setSubmitDone(true);
    } catch (error) {
      console.error('리포트 신청 오류:', error);
      alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-green-50 to-amber-50 p-5">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        {isFromHome && (
          <button 
            onClick={onNext}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mr-3"
          >
            <span className="text-gray-600 text-lg">‹</span>
          </button>
        )}
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 flex-1 justify-center">
          🏠 나의 금융집
        </h1>
        {isFromHome && <div className="w-10"></div>}
      </div>

      {/* 금융집 이미지 */}
      <div className="bg-white rounded-3xl p-4 mb-6 shadow-lg">
        <div className="relative rounded-2xl overflow-hidden mb-4">
          <img
            src={currentHouse.image}
            alt={currentHouse.name}
            className="w-full h-64 object-cover transition-opacity duration-300"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white text-lg font-bold text-center">
              부자지수 {currentHouse.range}
            </p>
          </div>
        </div>

        {/* 결과 정보 */}
        <div className="text-center">
          <p className="text-gray-500 mb-1">{result.name}님의 부자지수는</p>
          <p className="text-5xl font-bold text-purple-600 mb-2">{result.wealthIndex}%</p>
          <p className="text-gray-500 text-sm mb-4">현재 재무 상태</p>
          
          <div className="inline-block bg-purple-100 rounded-full px-6 py-2 mb-3">
            <p className="text-xl font-bold text-purple-700">{displayLevel}단계: {currentHouse.name}</p>
          </div>
          
          <p className="text-gray-600">
            {displayLevel === result.level ? (
              <>🎉 {result.message}</>
            ) : (
              <>👀 {currentHouse.message}</>
            )}
          </p>
        </div>

        {/* 단계 인디케이터 */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => handleDotClick(level)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                level === displayLevel 
                  ? 'bg-purple-600 scale-125' 
                  : level === result.level
                    ? 'bg-purple-300 hover:bg-purple-400'
                    : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={`${level}단계: ${HOUSE_IMAGES[level - 1].name}`}
            />
          ))}
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-2">
          점을 클릭하면 다른 단계의 집을 볼 수 있어요
        </p>
      </div>

      {/* 상세 정보 카드 */}
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">📊 입력하신 정보</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">이름</span>
            <span className="font-medium text-gray-800">{result.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">나이</span>
            <span className="font-medium text-gray-800">{result.age}세</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">월수입</span>
            <span className="font-medium text-gray-800">{formatManwon(result.income)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">총자산</span>
            <span className="font-medium text-gray-800">{formatManwon(result.assets)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">총부채</span>
            <span className="font-medium text-gray-800">{formatManwon(result.debt)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="text-gray-500">순자산</span>
            <span className="font-bold text-purple-600">{formatManwon(result.assets - result.debt)}</span>
          </div>
        </div>
      </div>

      {/* ★★★ 추가: 딥링크 사용자용 — 리포트 신청 & 채널 돌아가기 ★★★ */}
      {isDeepLink && !submitDone && (
        <div className="space-y-3 mb-6">
          {/* 리포트 신청 버튼 또는 폼 */}
          {!showReportForm ? (
            <button
              onClick={() => setShowReportForm(true)}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold rounded-2xl shadow-lg shadow-yellow-400/30 flex items-center justify-center gap-2"
            >
              📊 카카오톡으로 맞춤 리포트 받기
            </button>
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-yellow-300">
              <h3 className="font-bold text-gray-800 mb-2 text-center">📊 맞춤 재무리포트 신청</h3>
              <p className="text-sm text-gray-500 mb-4 text-center">
                가족수별 수입지출 예산표를 포함한<br/>맞춤 리포트를 카카오톡으로 보내드려요!
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">이름</label>
                  <input
                    type="text"
                    value={reportForm.nickname}
                    onChange={(e) => setReportForm({...reportForm, nickname: e.target.value})}
                    placeholder="홍길동"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">전화번호</label>
                  <input
                    type="tel"
                    value={reportForm.phone}
                    onChange={(e) => setReportForm({...reportForm, phone: e.target.value})}
                    placeholder="01012345678"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">이메일</label>
                  <input
                    type="email"
                    value={reportForm.email}
                    onChange={(e) => setReportForm({...reportForm, email: e.target.value})}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">가족수</label>
                  <select
                    value={reportForm.familyCount}
                    onChange={(e) => setReportForm({...reportForm, familyCount: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none bg-white"
                  >
                    <option value="1">1인 (미혼/1인가구)</option>
                    <option value="2">2인 (부부)</option>
                    <option value="3">3인 (부부+자녀1)</option>
                    <option value="4">4인 (부부+자녀2)</option>
                    <option value="5">5인 이상</option>
                  </select>
                </div>

                {/* 개인정보 수집·이용 동의 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyAgreed}
                      onChange={(e) => setPrivacyAgreed(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-800">[필수] 개인정보 수집·이용 동의</span>
                      <br/>
                      수집항목: 이름, 전화번호, 이메일, 재무정보
                      <br/>
                      수집목적: 맞춤 재무리포트 발송 및 서비스 안내
                      <br/>
                      보유기간: 동의 철회 시까지
                      <br/>
                      <span className="text-xs text-gray-400">※ 동의를 거부할 수 있으며, 거부 시 리포트 발송이 제한됩니다.</span>
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleReportSubmit}
                  disabled={isSubmitting || !privacyAgreed}
                  className={`w-full py-4 text-lg font-bold rounded-2xl flex items-center justify-center gap-3 ${
                    isSubmitting || !privacyAgreed
                      ? 'bg-gray-300 text-gray-500' 
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-lg shadow-yellow-400/30'
                  }`}
                >
                  {isSubmitting ? '신청 중...' : '📨 리포트 신청하기'}
                </button>

                <button
                  onClick={() => setShowReportForm(false)}
                  className="w-full py-2 text-gray-400 text-sm"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 카카오 채널로 돌아가기 */}
          <a
            href={KAKAO_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 font-semibold rounded-2xl flex items-center justify-center gap-2 border-2 border-yellow-400"
          >
            💬 카카오 채널로 돌아가기
          </a>

          {/* 다시 진단하기 */}
          <button
            onClick={onRetry}
            className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl flex items-center justify-center gap-2"
          >
            🔄 다시 진단하기
          </button>
        </div>
      )}

      {/* ★★★ 추가: 리포트 신청 완료 화면 ★★★ */}
      {isDeepLink && submitDone && (
        <div className="space-y-3 mb-6">
          <div className="bg-green-50 rounded-2xl p-6 text-center border-2 border-green-200">
            <p className="text-4xl mb-3">✅</p>
            <h3 className="text-lg font-bold text-green-700 mb-2">리포트 신청 완료!</h3>
            <p className="text-sm text-green-600 mb-1">
              {reportForm.nickname}님의 맞춤 재무리포트를
            </p>
            <p className="text-sm text-green-600 mb-3">
              카카오톡과 이메일로 보내드리겠습니다 📨
            </p>
            <div className="bg-white rounded-xl p-3 text-sm text-gray-500">
              <p>📱 카카오톡: {reportForm.phone}</p>
              <p>📧 이메일: {reportForm.email}</p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-2xl p-5 text-center border-2 border-purple-200">
            <p className="text-sm text-purple-700 mb-2 font-medium">
              💡 더 자세한 재무관리를 원하시면
            </p>
            <p className="text-sm text-purple-600 mb-3">
              AI머니야 앱에서 매일 지출을 음성으로 관리하고<br/>
              궁전을 향한 여정을 시작하세요!
            </p>
            <a
              href="https://moneya-develop.vercel.app"
              className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg"
            >
              🚀 AI머니야 앱 시작하기
            </a>
          </div>

          <a
            href={KAKAO_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 font-semibold rounded-2xl flex items-center justify-center gap-2 border-2 border-yellow-400"
          >
            💬 카카오 채널로 돌아가기
          </a>

          <button
            onClick={onRetry}
            className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl flex items-center justify-center gap-2"
          >
            🔄 다시 진단하기
          </button>
        </div>
      )}

      {/* 기존 버튼들 (딥링크가 아닌 일반 사용자용) */}
      {!isDeepLink && (
        <div className="space-y-3">
          {isFromHome ? (
            <>
              <button
                onClick={onNext}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
              >
                ✓ 홈으로 돌아가기
              </button>
              <button
                onClick={onRetry}
                className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl flex items-center justify-center gap-2"
              >
                🔄 다시 진단하기
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onNext}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
              >
                💰 예산 수립하러 가기
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={onRetry}
                className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl flex items-center justify-center gap-2"
              >
                🔄 다시 진단하기
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FinancialResultPage;
