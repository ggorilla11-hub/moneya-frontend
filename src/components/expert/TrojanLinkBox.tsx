// 트로이목마 링크 박스 (시뮬레이터 화면 7 핵심 영역)
// FC 전용 고객 유입 링크 + 복사/카톡/문자 공유
// v1.0 (2026-04-23)

import { useState } from 'react';

interface TrojanLinkBoxProps {
  agtCode: string;
  fcName: string;
  onShare?: (type: 'copy' | 'kakao' | 'sms') => void;
}

const APP_BASE_URL = 'https://moneya-frontend.vercel.app';

function TrojanLinkBox({ agtCode, fcName, onShare }: TrojanLinkBoxProps) {
  const [copied, setCopied] = useState(false);
  
  // 고객 유입 URL 생성 (AGT 코드 포함)
  const trojanUrl = `${APP_BASE_URL}?agent=${agtCode}`;

  // 복사
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trojanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.('copy');
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  // 카카오톡 공유
  const handleKakao = () => {
    const message = `안녕하세요! ${fcName} FC의 AI 재무진단 서비스입니다.\n\n25년 CFP 노하우를 담은 AI 머니야로 무료 재무진단을 받아보세요.\n\n${trojanUrl}`;
    
    // 실제 카카오 SDK 연동은 services/kakaoShare.ts에서 처리 (Phase B)
    // 현재는 URL 스킴 fallback
    const kakaoUrl = `https://sharer.kakao.com/talk/friends/picker/link?app_key=YOUR_KEY&validation_action=default&validation_params={"link_ver":"4.0","template_id":0,"template_args":{"TITLE":"AI 재무진단","DESC":"${encodeURIComponent(message)}","URL":"${encodeURIComponent(trojanUrl)}"}}`;
    
    // 모바일에서는 카카오톡 앱 직접 열기 시도
    if (/Android|iPhone/i.test(navigator.userAgent)) {
      window.location.href = `kakaolink://send?msg=${encodeURIComponent(message)}`;
    } else {
      // 데스크탑은 복사 + 안내
      navigator.clipboard.writeText(message).then(() => {
        alert('메시지가 복사되었습니다.\n카카오톡을 열어 붙여넣기 해주세요.');
      });
    }
    onShare?.('kakao');
  };

  // 문자 (SMS)
  const handleSMS = () => {
    const message = `[AI 머니야] ${fcName} FC의 AI 재무진단을 받아보세요! ${trojanUrl}`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
    onShare?.('sms');
  };

  return (
    <div className="mx-4 mt-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🎯</span>
        <h3 className="text-sm font-bold text-purple-900">트로이목마 링크</h3>
        <span className="ml-auto text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">
          FC 전용
        </span>
      </div>

      <p className="text-xs text-purple-700 mb-3 leading-relaxed">
        이 링크로 가입한 고객은 자동으로 내 하위에 등록됩니다.
      </p>

      {/* 링크 표시 영역 */}
      <div className="bg-white border border-purple-200 rounded-lg px-3 py-2.5 mb-3">
        <div className="text-[10px] text-gray-500 mb-1">나의 추천 링크</div>
        <div className="text-xs text-gray-900 font-mono break-all">
          {trojanUrl}
        </div>
      </div>

      {/* 공유 버튼 3개 */}
      <div className="grid grid-cols-3 gap-2">
        {/* 복사 */}
        <button
          onClick={handleCopy}
          className={`flex flex-col items-center gap-1 py-2.5 rounded-lg font-bold text-xs transition-all ${
            copied 
              ? 'bg-green-500 text-white' 
              : 'bg-white border border-purple-300 text-purple-700 hover:bg-purple-100'
          }`}
        >
          <span className="text-base">{copied ? '✓' : '📋'}</span>
          <span>{copied ? '복사됨' : '복사'}</span>
        </button>

        {/* 카카오톡 */}
        <button
          onClick={handleKakao}
          className="flex flex-col items-center gap-1 py-2.5 rounded-lg font-bold text-xs bg-yellow-300 hover:bg-yellow-400 text-gray-900 transition-all"
        >
          <span className="text-base">💬</span>
          <span>카톡</span>
        </button>

        {/* SMS */}
        <button
          onClick={handleSMS}
          className="flex flex-col items-center gap-1 py-2.5 rounded-lg font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white transition-all"
        >
          <span className="text-base">📱</span>
          <span>문자</span>
        </button>
      </div>
    </div>
  );
}

export default TrojanLinkBox;
