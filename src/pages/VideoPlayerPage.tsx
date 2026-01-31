// src/pages/VideoPlayerPage.tsx
// 비디오 플레이어 페이지
// v1.0: 영상 재생 + 이어보기 + 진도 저장 + 재생 속도 조절

import { useState, useRef, useEffect } from 'react';

// 강의 정보 타입
interface Lesson {
  id: string;
  order: number;
  title: string;
  duration: string;
  durationSeconds: number;
  filename: string;
  videoUrl: string;
  isFree: boolean;
}

// 진도 정보 타입
interface UserProgress {
  lessonId: string;
  lastPosition: number;
  watchedPercent: number;
  completed: boolean;
  lastWatched: string;
}

// Props 타입
interface VideoPlayerPageProps {
  lesson: Lesson;
  onBack: () => void;
  onPrevLesson: () => void;
  onNextLesson: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export default function VideoPlayerPage({ 
  lesson, 
  onBack, 
  onPrevLesson, 
  onNextLesson,
  hasPrev,
  hasNext 
}: VideoPlayerPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  // 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 시간 포맷팅
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 진도 저장
  const saveProgress = (currentSec: number, totalSec: number) => {
    if (totalSec === 0) return;
    
    const watchedPercent = Math.round((currentSec / totalSec) * 100);
    const completed = watchedPercent >= 90;

    const progressData: UserProgress = {
      lessonId: lesson.id,
      lastPosition: currentSec,
      watchedPercent,
      completed,
      lastWatched: new Date().toISOString(),
    };

    // localStorage에서 기존 데이터 가져오기
    const saved = localStorage.getItem('courseProgress');
    let allProgress: Record<string, UserProgress> = {};
    if (saved) {
      try {
        allProgress = JSON.parse(saved);
      } catch (e) {
        console.error('진도 데이터 파싱 오류:', e);
      }
    }

    // 현재 강의 진도 업데이트
    allProgress[lesson.id] = progressData;

    // localStorage에 저장
    localStorage.setItem('courseProgress', JSON.stringify(allProgress));
  };

  // 이어보기 위치 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('courseProgress');
    if (saved) {
      try {
        const allProgress = JSON.parse(saved);
        const progress = allProgress[lesson.id];
        if (progress && progress.lastPosition > 0 && videoRef.current) {
          // 완료된 강의는 처음부터
          if (!progress.completed) {
            videoRef.current.currentTime = progress.lastPosition;
          }
        }
      } catch (e) {
        console.error('이어보기 위치 불러오기 오류:', e);
      }
    }
  }, [lesson.id]);

  // 비디오 이벤트 핸들러
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // 10초마다 진도 저장
      if (Math.floor(video.currentTime) % 10 === 0) {
        saveProgress(video.currentTime, video.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      saveProgress(video.duration, video.duration);
      // 자동으로 다음 강의로 이동 (3초 후)
      if (hasNext) {
        setTimeout(() => {
          onNextLesson();
        }, 3000);
      }
    };

    const handleError = () => {
      setError('영상을 불러올 수 없습니다. 네트워크 연결을 확인해주세요.');
      setIsLoading(false);
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [lesson.id, hasNext, onNextLesson]);

  // 페이지 이탈 시 진도 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (videoRef.current) {
        saveProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [lesson.id]);

  // 컨트롤 자동 숨김
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 3000);
    }
  };

  // 재생/일시정지 토글
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
    resetControlsTimeout();
  };

  // 10초 앞/뒤로
  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    resetControlsTimeout();
  };

  // 진행바 클릭
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = progressBarRef.current;
    if (!video || !bar) return;

    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    video.currentTime = percent * video.duration;
    resetControlsTimeout();
  };

  // 볼륨 조절
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  // 음소거 토글
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted) {
      video.volume = volume || 1;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  // 재생 속도 변경
  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
    resetControlsTimeout();
  };

  // 전체화면 토글
  const toggleFullscreen = () => {
    const container = document.getElementById('video-container');
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // 전체화면 변경 감지
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 뒤로가기 (진도 저장 후)
  const handleBack = () => {
    if (videoRef.current) {
      saveProgress(videoRef.current.currentTime, videoRef.current.duration);
    }
    onBack();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 비디오 컨테이너 */}
      <div 
        id="video-container"
        className="relative w-full aspect-video bg-black"
        onClick={togglePlay}
        onMouseMove={resetControlsTimeout}
        onTouchStart={resetControlsTimeout}
      >
        {/* 비디오 */}
        <video
          ref={videoRef}
          src={lesson.videoUrl}
          className="w-full h-full object-contain"
          playsInline
          preload="metadata"
        />

        {/* 로딩 스피너 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center px-4">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="text-lg">{error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-blue-600 rounded-lg"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 컨트롤 오버레이 */}
        {showControls && !error && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50">
            {/* 상단 헤더 */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3">
              <button onClick={handleBack} className="p-2 hover:bg-white/20 rounded-full">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <div className="flex-1">
                <div className="text-sm font-bold">{lesson.order}강. {lesson.title}</div>
              </div>
            </div>

            {/* 중앙 컨트롤 */}
            <div className="absolute inset-0 flex items-center justify-center gap-8">
              {/* 10초 뒤로 */}
              <button 
                onClick={(e) => { e.stopPropagation(); skip(-10); }}
                className="p-3 hover:bg-white/20 rounded-full"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                  <text x="12" y="14" fontSize="6" textAnchor="middle" fill="currentColor">10</text>
                </svg>
              </button>

              {/* 재생/일시정지 */}
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-16 h-16 bg-white/30 hover:bg-white/40 rounded-full flex items-center justify-center"
              >
                {isPlaying ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              {/* 10초 앞으로 */}
              <button 
                onClick={(e) => { e.stopPropagation(); skip(10); }}
                className="p-3 hover:bg-white/20 rounded-full"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                  <text x="12" y="14" fontSize="6" textAnchor="middle" fill="currentColor">10</text>
                </svg>
              </button>
            </div>

            {/* 하단 컨트롤 */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* 진행바 */}
              <div 
                ref={progressBarRef}
                onClick={(e) => { e.stopPropagation(); handleProgressClick(e); }}
                className="h-1 bg-white/30 rounded-full mb-4 cursor-pointer group"
              >
                <div 
                  className="h-full bg-blue-500 rounded-full relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* 시간 및 버튼 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* 시간 */}
                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  {/* 볼륨 */}
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); toggleMute(); }}>
                      {isMuted || volume === 0 ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      onClick={(e) => e.stopPropagation()}
                      className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* 재생 속도 */}
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                      className="px-2 py-1 text-sm bg-white/20 rounded"
                    >
                      {playbackRate}x
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                        {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                          <button
                            key={rate}
                            onClick={(e) => { e.stopPropagation(); changePlaybackRate(rate); }}
                            className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-700 ${
                              playbackRate === rate ? 'bg-blue-600' : ''
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 전체화면 */}
                  <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}>
                    {isFullscreen ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 강의 정보 */}
      <div className="p-4 bg-gray-900">
        <h1 className="text-lg font-bold mb-2">{lesson.order}강. {lesson.title}</h1>
        <div className="text-sm text-gray-400">재생 시간: {lesson.duration}</div>
      </div>

      {/* 이전/다음 강의 버튼 */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex gap-3">
          <button
            onClick={onPrevLesson}
            disabled={!hasPrev}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${
              hasPrev 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
            이전 강의
          </button>
          <button
            onClick={onNextLesson}
            disabled={!hasNext}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${
              hasNext 
                ? 'bg-blue-600 hover:bg-blue-500' 
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            다음 강의
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 강의 완료 시 축하 메시지 */}
      {progressPercent >= 90 && (
        <div className="p-4 bg-green-900/30 border-t border-green-800">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎉</div>
            <div>
              <div className="font-bold text-green-400">강의 완료!</div>
              <div className="text-sm text-gray-400">수고하셨습니다. 다음 강의를 이어서 수강해보세요.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
