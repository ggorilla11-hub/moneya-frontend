// src/pages/PodcastPage.tsx
// v1.0 - 팟캐스트 코너 (소비자용 + 제작자 모드 PIN 잠금)
// - "🔒 제작" 버튼 3번 클릭 → PIN 입력 → 제작자 모드 활성화
// - PIN: 1723 (Firebase Remote Config 연동 가능)

import { useState, useEffect, useRef } from 'react';

// ─── 이미지 URL ───
const PROFILE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%98%A4%EC%83%81%EC%97%B4%20%EC%82%AC%EC%A7%84.png?alt=media&token=63eaf15e-9d0b-4d72-8fbb-ee03d6ecc8e5';

// ─── 에피소드 데이터 (샘플) ───
const EPISODES = [
  { id: 1, title: '제1화: 금융집짓기란 무엇인가?', duration: '15:32', date: '2026.01.15', plays: 1234, isNew: true },
  { id: 2, title: '제2화: DESIRE 6단계 완전정복', duration: '18:45', date: '2026.01.22', plays: 987, isNew: true },
  { id: 3, title: '제3화: 비상자금, 얼마가 적당할까?', duration: '12:20', date: '2026.01.29', plays: 756, isNew: false },
  { id: 4, title: '제4화: 30대 직장인 재무설계 사례', duration: '22:15', date: '2026.02.05', plays: 543, isNew: false },
  { id: 5, title: '제5화: 부부 공동 재무관리 비법', duration: '19:50', date: '2026.02.12', plays: 421, isNew: false },
];

// ─── Props ───
interface PodcastPageProps {
  onBack: () => void;
}

export default function PodcastPage({ onBack }: PodcastPageProps) {
  // ─── PIN 잠금 상태 ───
  const [isCreatorUnlocked, setIsCreatorUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [tapCount, setTapCount] = useState(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // ─── 제작자 모드 세션 저장 (localStorage) ───
  useEffect(() => {
    const saved = localStorage.getItem('podcastCreatorUnlocked');
    if (saved === 'true') setIsCreatorUnlocked(true);
  }, []);
  
  // ─── 소비자용 상태 ───
  const [activeTab, setActiveTab] = useState<'episodes' | 'story'>('episodes');
  const [playingEpisode, setPlayingEpisode] = useState<number | null>(null);
  
  // ─── 사연 접수 상태 ───
  const [storyNickname, setStoryNickname] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [storySubmitted, setStorySubmitted] = useState(false);
  
  // ─── 제작자용 상태 ───
  const [creatorTab, setCreatorTab] = useState<'teleprompter' | 'aiTalk' | 'live' | 'schedule'>('teleprompter');
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // ─── 텔레프롬프터 원고 ───
  const [scriptText, setScriptText] = useState(`안녕하세요, 오상열의 재무상담쇼에 오신 것을 환영합니다.

오늘은 '비상자금, 과연 얼마가 적당할까?'라는 주제로 이야기해보겠습니다.

많은 분들이 비상자금의 중요성은 알지만, 구체적으로 얼마를 모아야 하는지 궁금해하시죠.

일반적으로 월 생활비의 3~6개월분을 권장하지만, 개인 상황에 따라 달라질 수 있습니다...`);

  // ═══════════════════════════════════════
  // ▶ PIN 트리플 클릭 감지
  // ═══════════════════════════════════════
  const handleCreatorBtnTap = () => {
    if (isCreatorUnlocked) {
      // 이미 해제됨 → 제작자 모드 보기
      return;
    }
    
    setTapCount(prev => prev + 1);
    
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => setTapCount(0), 800);
    
    if (tapCount + 1 >= 3) {
      // 3번 탭 → PIN 모달 열기
      setShowPinModal(true);
      setTapCount(0);
    }
  };
  
  // ═══════════════════════════════════════
  // ▶ PIN 입력 처리
  // ═══════════════════════════════════════
  const CORRECT_PIN = '1723'; // TODO: Firebase Remote Config에서 가져오기
  
  const handlePinInput = (digit: string) => {
    if (enteredPin.length >= 4) return;
    const newPin = enteredPin + digit;
    setEnteredPin(newPin);
    setPinError('');
    
    if (newPin.length === 4) {
      setTimeout(() => {
        if (newPin === CORRECT_PIN) {
          setIsCreatorUnlocked(true);
          setShowPinModal(false);
          setEnteredPin('');
          localStorage.setItem('podcastCreatorUnlocked', 'true');
        } else {
          setPinError('PIN이 올바르지 않습니다');
          setTimeout(() => {
            setEnteredPin('');
            setPinError('');
          }, 800);
        }
      }, 200);
    }
  };
  
  const handlePinDelete = () => {
    setEnteredPin(prev => prev.slice(0, -1));
    setPinError('');
  };
  
  const handlePinCancel = () => {
    setShowPinModal(false);
    setEnteredPin('');
    setPinError('');
  };
  
  // ─── 제작자 모드 잠금 ───
  const handleLockCreatorMode = () => {
    setIsCreatorUnlocked(false);
    localStorage.removeItem('podcastCreatorUnlocked');
  };
  
  // ═══════════════════════════════════════
  // ▶ 녹음 기능
  // ═══════════════════════════════════════
  const toggleRecording = () => {
    if (isRecording) {
      // 녹음 중지
      setIsRecording(false);
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      if (recordTime > 0) alert(`녹음 완료! ${Math.floor(recordTime / 60)}분 ${recordTime % 60}초`);
    } else {
      // 녹음 시작
      setIsRecording(true);
      setRecordTime(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordTime(prev => prev + 1);
      }, 1000);
    }
  };
  
  useEffect(() => {
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, []);
  
  // ─── 사연 제출 ───
  const handleStorySubmit = () => {
    if (!storyNickname.trim() || storyContent.trim().length < 30) {
      alert(!storyNickname.trim() ? '닉네임을 입력해주세요.' : '사연을 30자 이상 작성해주세요.');
      return;
    }
    const mailto = `mailto:ggorilla11@gmail.com?subject=${encodeURIComponent(`[팟캐스트 사연] ${storyNickname}`)}&body=${encodeURIComponent(`닉네임: ${storyNickname}\n\n사연:\n${storyContent}`)}`;
    window.location.href = mailto;
    setStorySubmitted(true);
  };
  
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ═══════════════════════════════════════
  // ▶ 렌더링
  // ═══════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* ─── 헤더 ─── */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-white text-xl">←</button>
        <div className="flex-1">
          <h1 className="text-white text-lg font-bold">🎙️ 오상열 CFP의 재무상담쇼</h1>
          <p className="text-slate-400 text-xs">AI머니야 공식 팟캐스트</p>
        </div>
        {/* 🔒 제작 버튼 (트리플 클릭 감지) */}
        <button
          onClick={handleCreatorBtnTap}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
            isCreatorUnlocked 
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900' 
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          <span className="text-[10px]">{isCreatorUnlocked ? '🔓' : '🔒'}</span>
          <span>{isCreatorUnlocked ? '제작자 모드' : '제작'}</span>
        </button>
      </div>
      
      {/* ─── 배너 ─── */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full" />
        <div className="flex items-center gap-4 relative z-10">
          <img src={PROFILE_IMAGE_URL} alt="오상열 CFP" className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">LIVE</span>
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">HOT</span>
            </div>
            <h3 className="text-white text-base font-bold">매주 화요일 오후 8시</h3>
            <p className="text-slate-400 text-xs mt-0.5">구독자 1,234명 · 총 재생 12.5K</p>
          </div>
        </div>
      </div>
      
      {/* ═══════════════════════════════════════ */}
      {/* ▶ 소비자용 콘텐츠 */}
      {/* ═══════════════════════════════════════ */}
      {!isCreatorUnlocked && (
        <>
          {/* 탭 */}
          <div className="flex mx-4 mt-4 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('episodes')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'episodes' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
            >
              📻 에피소드
            </button>
            <button
              onClick={() => setActiveTab('story')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'story' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
            >
              ✉️ 사연 접수
            </button>
          </div>
          
          {/* 에피소드 목록 */}
          {activeTab === 'episodes' && (
            <div className="mx-4 mt-4 space-y-3">
              {EPISODES.map(ep => (
                <div
                  key={ep.id}
                  className={`bg-white rounded-xl p-4 border-2 transition-all ${playingEpisode === ep.id ? 'border-emerald-400 shadow-lg' : 'border-transparent shadow-sm'}`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPlayingEpisode(playingEpisode === ep.id ? null : ep.id)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        playingEpisode === ep.id 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-600'
                      }`}
                    >
                      {playingEpisode === ep.id ? '⏸️' : '▶️'}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800 truncate">{ep.title}</p>
                        {ep.isNew && <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse">NEW</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>⏱️ {ep.duration}</span>
                        <span>·</span>
                        <span>{ep.date}</span>
                        <span>·</span>
                        <span>▶️ {ep.plays.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {playingEpisode === ep.id && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-1/3 animate-pulse" />
                        </div>
                        <span className="text-xs text-slate-400">05:12 / {ep.duration}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* 사연 접수 */}
          {activeTab === 'story' && (
            <div className="mx-4 mt-4">
              {storySubmitted ? (
                <div className="bg-emerald-50 rounded-xl p-6 text-center border-2 border-emerald-200">
                  <p className="text-4xl mb-3">🎉</p>
                  <h4 className="text-lg font-bold text-emerald-700 mb-2">사연이 접수되었습니다!</h4>
                  <p className="text-sm text-emerald-600">검토 후 방송에서 소개될 수 있습니다.</p>
                  <button onClick={() => { setStorySubmitted(false); setStoryNickname(''); setStoryContent(''); }} className="mt-4 px-6 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg">새 사연 작성</button>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="text-base font-bold text-slate-800 mb-4">✉️ 사연 보내기</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">닉네임</label>
                      <input
                        type="text"
                        value={storyNickname}
                        onChange={e => setStoryNickname(e.target.value)}
                        placeholder="방송에서 불릴 이름"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">사연 내용</label>
                      <textarea
                        value={storyContent}
                        onChange={e => setStoryContent(e.target.value)}
                        placeholder="재무 고민이나 궁금한 점을 자유롭게 적어주세요..."
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm h-32 resize-none focus:border-emerald-400 focus:outline-none"
                      />
                      <p className="text-xs text-slate-400 mt-1">최소 30자 이상 ({storyContent.length}자)</p>
                    </div>
                    <button
                      onClick={handleStorySubmit}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl"
                    >
                      ✉️ 사연 보내기
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* ═══════════════════════════════════════ */}
      {/* ▶ 제작자 모드 (PIN 해제 후) */}
      {/* ═══════════════════════════════════════ */}
      {isCreatorUnlocked && (
        <>
          {/* 제작자 모드 배너 */}
          <div className="mx-4 mt-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl p-3 flex items-center justify-between border border-amber-300">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔓</span>
              <span className="text-sm font-bold text-amber-800">제작자 모드 활성화</span>
            </div>
            <button
              onClick={handleLockCreatorMode}
              className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg"
            >
              잠금
            </button>
          </div>
          
          {/* 제작자 탭 */}
          <div className="flex mx-4 mt-4 bg-slate-800 rounded-xl p-1 overflow-x-auto">
            {[
              { id: 'teleprompter', icon: '📜', label: '원고 녹음' },
              { id: 'aiTalk', icon: '🤖', label: 'AI 대담' },
              { id: 'live', icon: '📡', label: '라이브' },
              { id: 'schedule', icon: '📅', label: '일정' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCreatorTab(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  creatorTab === tab.id ? 'bg-amber-500 text-white' : 'text-slate-400'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          
          {/* 📜 원고 녹음 */}
          {creatorTab === 'teleprompter' && (
            <div className="mx-4 mt-4 space-y-4">
              {/* 원고 입력 */}
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400">📜 원고</span>
                  <span className="text-xs text-slate-500">{scriptText.length}자</span>
                </div>
                <textarea
                  value={scriptText}
                  onChange={e => setScriptText(e.target.value)}
                  className="w-full h-48 bg-slate-800 text-emerald-400 text-lg leading-relaxed p-4 rounded-xl resize-none focus:outline-none font-mono"
                  placeholder="녹음할 원고를 입력하세요..."
                />
              </div>
              
              {/* 녹음 컨트롤 */}
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={toggleRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-500'
                    }`}
                  >
                    {isRecording ? '⏹️' : '🎙️'}
                  </button>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-mono font-bold ${isRecording ? 'text-red-500' : 'text-slate-300'}`}>
                    {formatTime(recordTime)}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {isRecording ? '🔴 녹음 중...' : '버튼을 눌러 녹음 시작'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* 🤖 AI 대담 */}
          {creatorTab === 'aiTalk' && (
            <div className="mx-4 mt-4 bg-white rounded-xl p-5 shadow-sm text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-4xl">🤖</span>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">AI 대담 녹음</h4>
              <p className="text-sm text-slate-500 mb-4">머니야와 대화하며 팟캐스트를 녹음하세요</p>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl">
                🎙️ AI 대담 시작
              </button>
            </div>
          )}
          
          {/* 📡 라이브 */}
          {creatorTab === 'live' && (
            <div className="mx-4 mt-4 bg-white rounded-xl p-5 shadow-sm text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center relative">
                <span className="text-4xl">📡</span>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">라이브 방송</h4>
              <p className="text-sm text-slate-500 mb-4">실시간 방송으로 청취자와 소통하세요</p>
              <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl">
                🔴 라이브 시작
              </button>
            </div>
          )}
          
          {/* 📅 일정 */}
          {creatorTab === 'schedule' && (
            <div className="mx-4 mt-4 bg-white rounded-xl p-5 shadow-sm">
              <h4 className="text-base font-bold text-slate-800 mb-4">📅 2026년 방송 일정</h4>
              <div className="space-y-2">
                {[
                  { month: '2월', dates: ['4일', '11일', '18일', '25일'] },
                  { month: '3월', dates: ['4일', '11일', '18일', '25일'] },
                  { month: '4월', dates: ['1일', '8일', '15일', '22일', '29일'] },
                ].map(item => (
                  <div key={item.month} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm font-bold text-slate-700 mb-1">{item.month}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.dates.map(d => (
                        <span key={d} className="px-2 py-1 bg-white rounded text-xs text-slate-600 border border-slate-200">
                          {d}(화) 20:00
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* ═══════════════════════════════════════ */}
      {/* ▶ PIN 입력 모달 */}
      {/* ═══════════════════════════════════════ */}
      {showPinModal && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center animate-slide-up">
            {/* 아이콘 */}
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-800 to-slate-600 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🔐</span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">제작자 모드</h3>
            <p className="text-xs text-slate-400 mb-5">PIN 4자리를 입력하세요</p>
            
            {/* PIN 도트 */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    enteredPin.length > i 
                      ? pinError ? 'bg-red-500 border-red-500 animate-shake' : 'bg-slate-800 border-slate-800'
                      : 'bg-white border-slate-300'
                  }`}
                />
              ))}
            </div>
            
            {/* 에러 메시지 */}
            {pinError && <p className="text-xs text-red-500 mb-4">{pinError}</p>}
            
            {/* 키패드 */}
            <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (key === '⌫') handlePinDelete();
                    else if (key) handlePinInput(key);
                  }}
                  disabled={!key}
                  className={`h-14 rounded-xl text-xl font-semibold transition-all ${
                    key === '⌫' 
                      ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' 
                      : key 
                        ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95' 
                        : 'bg-transparent'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
            
            {/* 취소 버튼 */}
            <button
              onClick={handlePinCancel}
              className="mt-4 text-sm text-slate-400 underline"
            >
              취소
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
