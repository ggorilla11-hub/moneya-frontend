// src/pages/OnlineCoursePage.tsx
// 온라인 강좌 목록 페이지
// v1.0: 109강 강좌 목록 + 진도율 관리 + 섹션별 폴딩

import { useState, useEffect } from 'react';

// Firebase Storage Base URL
const STORAGE_BASE = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o';

// 강좌 데이터 타입
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

interface Section {
  sectionId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface UserProgress {
  lessonId: string;
  lastPosition: number;
  watchedPercent: number;
  completed: boolean;
  lastWatched: string;
}

// 강좌 데이터 (109강 전체)
const COURSE_SECTIONS: Section[] = [
  {
    sectionId: 'section_01',
    title: '0. 전체과정 개요',
    order: 1,
    lessons: [
      { id: 'lesson_001', order: 1, title: '전체과정의 개요와 구조', duration: '3:22', durationSeconds: 202, filename: 'lecture_001.mp4', videoUrl: `${STORAGE_BASE}/lecture_001.mp4?alt=media`, isFree: true },
      { id: 'lesson_002', order: 2, title: '1단계 요약강의', duration: '7:43', durationSeconds: 463, filename: 'lecture_002.mp4', videoUrl: `${STORAGE_BASE}/lecture_002.mp4?alt=media`, isFree: true },
      { id: 'lesson_003', order: 3, title: '2단계 요약강의', duration: '5:47', durationSeconds: 347, filename: 'lecture_003.mp4', videoUrl: `${STORAGE_BASE}/lecture_003.mp4?alt=media`, isFree: true },
      { id: 'lesson_004', order: 4, title: '3단계 요약강의', duration: '5:14', durationSeconds: 314, filename: 'lecture_004.mp4', videoUrl: `${STORAGE_BASE}/lecture_004.mp4?alt=media`, isFree: true },
      { id: 'lesson_005', order: 5, title: '4단계 요약강의', duration: '6:23', durationSeconds: 383, filename: 'lecture_005.mp4', videoUrl: `${STORAGE_BASE}/lecture_005.mp4?alt=media`, isFree: true },
      { id: 'lesson_006', order: 6, title: '5단계 요약강의', duration: '3:34', durationSeconds: 214, filename: 'lecture_006.mp4', videoUrl: `${STORAGE_BASE}/lecture_006.mp4?alt=media`, isFree: true },
      { id: 'lesson_007', order: 7, title: '전체과정 요약강의', duration: '6:05', durationSeconds: 365, filename: 'lecture_007.mp4', videoUrl: `${STORAGE_BASE}/lecture_007.mp4?alt=media`, isFree: true },
    ]
  },
  {
    sectionId: 'section_02',
    title: '1. 재테크 기초',
    order: 2,
    lessons: [
      { id: 'lesson_008', order: 8, title: '개요설명', duration: '2:36', durationSeconds: 156, filename: 'lecture_008.mp4', videoUrl: `${STORAGE_BASE}/lecture_008.mp4?alt=media`, isFree: false },
      { id: 'lesson_009', order: 9, title: '72법칙', duration: '6:04', durationSeconds: 364, filename: 'lecture_009.mp4', videoUrl: `${STORAGE_BASE}/lecture_009.mp4?alt=media`, isFree: false },
      { id: 'lesson_010', order: 10, title: '100-나이법칙', duration: '3:32', durationSeconds: 212, filename: 'lecture_010.mp4', videoUrl: `${STORAGE_BASE}/lecture_010.mp4?alt=media`, isFree: false },
      { id: 'lesson_011', order: 11, title: '-50+100법칙', duration: '4:31', durationSeconds: 271, filename: 'lecture_011.mp4', videoUrl: `${STORAGE_BASE}/lecture_011.mp4?alt=media`, isFree: false },
      { id: 'lesson_012', order: 12, title: '레버리지법칙', duration: '5:28', durationSeconds: 328, filename: 'lecture_012.mp4', videoUrl: `${STORAGE_BASE}/lecture_012.mp4?alt=media`, isFree: false },
      { id: 'lesson_013', order: 13, title: '정액분할투자법칙', duration: '6:45', durationSeconds: 405, filename: 'lecture_013.mp4', videoUrl: `${STORAGE_BASE}/lecture_013.mp4?alt=media`, isFree: false },
      { id: 'lesson_014', order: 14, title: '하이리스크 하이리턴', duration: '3:27', durationSeconds: 207, filename: 'lecture_014.mp4', videoUrl: `${STORAGE_BASE}/lecture_014.mp4?alt=media`, isFree: false },
    ]
  },
  {
    sectionId: 'section_03',
    title: '1. 돈 벌기',
    order: 3,
    lessons: [
      { id: 'lesson_015', order: 15, title: '왜 돈을 벌어야 할까?', duration: '8:05', durationSeconds: 485, filename: 'lecture_015.mp4', videoUrl: `${STORAGE_BASE}/lecture_015.mp4?alt=media`, isFree: false },
      { id: 'lesson_016', order: 16, title: '어떻게 돈을 벌어야할까?', duration: '16:42', durationSeconds: 1002, filename: 'lecture_016.mp4', videoUrl: `${STORAGE_BASE}/lecture_016.mp4?alt=media`, isFree: false },
      { id: 'lesson_017', order: 17, title: '왜 돈을 벌지 못할까', duration: '7:07', durationSeconds: 427, filename: 'lecture_017.mp4', videoUrl: `${STORAGE_BASE}/lecture_017.mp4?alt=media`, isFree: false },
      { id: 'lesson_018', order: 18, title: '그럼 어떻게 해야할까', duration: '7:24', durationSeconds: 444, filename: 'lecture_018.mp4', videoUrl: `${STORAGE_BASE}/lecture_018.mp4?alt=media`, isFree: false },
      { id: 'lesson_019', order: 19, title: '액션플랜 100만원 만들기', duration: '13:33', durationSeconds: 813, filename: 'lecture_019.mp4', videoUrl: `${STORAGE_BASE}/lecture_019.mp4?alt=media`, isFree: false },
      { id: 'lesson_020', order: 20, title: '실전사례 연습풀이', duration: '10:09', durationSeconds: 609, filename: 'lecture_020.mp4', videoUrl: `${STORAGE_BASE}/lecture_020.mp4?alt=media`, isFree: false },
    ]
  },
  {
    sectionId: 'section_04',
    title: '2. 돈 모으기',
    order: 4,
    lessons: [
      { id: 'lesson_021', order: 21, title: '개요설명', duration: '11:38', durationSeconds: 698, filename: 'lecture_021.mp4', videoUrl: `${STORAGE_BASE}/lecture_021.mp4?alt=media`, isFree: false },
      { id: 'lesson_022', order: 22, title: '예산수립방법', duration: '12:09', durationSeconds: 729, filename: 'lecture_022.mp4', videoUrl: `${STORAGE_BASE}/lecture_022.mp4?alt=media`, isFree: false },
      { id: 'lesson_023', order: 23, title: '비상예비자금 마련방법', duration: '2:27', durationSeconds: 147, filename: 'lecture_023.mp4', videoUrl: `${STORAGE_BASE}/lecture_023.mp4?alt=media`, isFree: false },
      { id: 'lesson_024', order: 24, title: '통장쪼개기 방법', duration: '2:50', durationSeconds: 170, filename: 'lecture_024.mp4', videoUrl: `${STORAGE_BASE}/lecture_024.mp4?alt=media`, isFree: false },
      { id: 'lesson_025', order: 25, title: '개요설명', duration: '2:33', durationSeconds: 153, filename: 'lecture_025.mp4', videoUrl: `${STORAGE_BASE}/lecture_025.mp4?alt=media`, isFree: false },
      { id: 'lesson_026', order: 26, title: '왜 돈을 모아야 할까', duration: '22:05', durationSeconds: 1325, filename: 'lecture_026.mp4', videoUrl: `${STORAGE_BASE}/lecture_026.mp4?alt=media`, isFree: false },
      { id: 'lesson_027', order: 27, title: '어떻게 돈을 모아야 할까', duration: '31:16', durationSeconds: 1876, filename: 'lecture_027.mp4', videoUrl: `${STORAGE_BASE}/lecture_027.mp4?alt=media`, isFree: false },
      { id: 'lesson_028', order: 28, title: '왜 돈을 모으지를 못할까', duration: '9:13', durationSeconds: 553, filename: 'lecture_028.mp4', videoUrl: `${STORAGE_BASE}/lecture_028.mp4?alt=media`, isFree: false },
      { id: 'lesson_029', order: 29, title: '어떻게 해야 할까', duration: '7:18', durationSeconds: 438, filename: 'lecture_029.mp4', videoUrl: `${STORAGE_BASE}/lecture_029.mp4?alt=media`, isFree: false },
      { id: 'lesson_030', order: 30, title: '비상예비자금 만들기', duration: '2:33', durationSeconds: 153, filename: 'lecture_030.mp4', videoUrl: `${STORAGE_BASE}/lecture_030.mp4?alt=media`, isFree: false },
      { id: 'lesson_031', order: 31, title: '왜 비상자금을 만들어야 할까', duration: '1:11', durationSeconds: 71, filename: 'lecture_031.mp4', videoUrl: `${STORAGE_BASE}/lecture_031.mp4?alt=media`, isFree: false },
      { id: 'lesson_032', order: 32, title: '어떻게 비상자금을 만들어야 할까', duration: '4:28', durationSeconds: 268, filename: 'lecture_032.mp4', videoUrl: `${STORAGE_BASE}/lecture_032.mp4?alt=media`, isFree: false },
      { id: 'lesson_033', order: 33, title: '실전사례 연습풀이', duration: '14:12', durationSeconds: 852, filename: 'lecture_033.mp4', videoUrl: `${STORAGE_BASE}/lecture_033.mp4?alt=media`, isFree: false },
    ]
  },
  {
    sectionId: 'section_05',
    title: '3. 돈 불리기',
    order: 5,
    lessons: Array.from({ length: 33 }, (_, i) => ({
      id: `lesson_${String(34 + i).padStart(3, '0')}`,
      order: 34 + i,
      title: i < 3 ? ['개요설명', '저축투자 포트폴리오 방법', '신용대출 스노우볼 전략'][i] : `돈 불리기 ${i - 2}강`,
      duration: '10:00',
      durationSeconds: 600,
      filename: `lecture_${String(34 + i).padStart(3, '0')}.mp4`,
      videoUrl: `${STORAGE_BASE}/lecture_${String(34 + i).padStart(3, '0')}.mp4?alt=media`,
      isFree: false,
    }))
  },
  {
    sectionId: 'section_06',
    title: '4. 자산증식',
    order: 6,
    lessons: Array.from({ length: 21 }, (_, i) => ({
      id: `lesson_${String(67 + i).padStart(3, '0')}`,
      order: 67 + i,
      title: i < 3 ? ['개요설명', '자산배분 포트폴리오', '10억 목돈 마련하는법'][i] : `자산증식 ${i - 2}강`,
      duration: '10:00',
      durationSeconds: 600,
      filename: `lecture_${String(67 + i).padStart(3, '0')}.mp4`,
      videoUrl: `${STORAGE_BASE}/lecture_${String(67 + i).padStart(3, '0')}.mp4?alt=media`,
      isFree: false,
    }))
  },
  {
    sectionId: 'section_07',
    title: '5. 세금/보험',
    order: 7,
    lessons: Array.from({ length: 5 }, (_, i) => ({
      id: `lesson_${String(88 + i).padStart(3, '0')}`,
      order: 88 + i,
      title: ['개요설명', '세금개요', '절세되는 금융상품', '보험의 종류', '현금흐름 자동화방법'][i],
      duration: '8:00',
      durationSeconds: 480,
      filename: `lecture_${String(88 + i).padStart(3, '0')}.mp4`,
      videoUrl: `${STORAGE_BASE}/lecture_${String(88 + i).padStart(3, '0')}.mp4?alt=media`,
      isFree: false,
    }))
  },
  {
    sectionId: 'section_08',
    title: '5. 돈 지키기',
    order: 8,
    lessons: Array.from({ length: 17 }, (_, i) => ({
      id: `lesson_${String(93 + i).padStart(3, '0')}`,
      order: 93 + i,
      title: i === 0 ? '개요설명 및 왜 돈을 지켜야 할까' : `돈 지키기 ${i}강`,
      duration: '8:00',
      durationSeconds: 480,
      filename: `lecture_${String(93 + i).padStart(3, '0')}.mp4`,
      videoUrl: `${STORAGE_BASE}/lecture_${String(93 + i).padStart(3, '0')}.mp4?alt=media`,
      isFree: false,
    }))
  },
];

// Props 타입
interface OnlineCoursePageProps {
  onBack: () => void;
  onLessonSelect: (lesson: Lesson) => void;
  isSubscribed: boolean;
}

export default function OnlineCoursePage({ onBack, onLessonSelect, isSubscribed }: OnlineCoursePageProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['section_01']);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});

  // localStorage에서 진도 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('courseProgress');
    if (saved) {
      try {
        setUserProgress(JSON.parse(saved));
      } catch (e) {
        console.error('진도 데이터 로드 실패:', e);
      }
    }
  }, []);

  // 전체 강의 수 및 완료 수 계산
  const totalLessons = COURSE_SECTIONS.reduce((acc, s) => acc + s.lessons.length, 0);
  const completedLessons = Object.values(userProgress).filter(p => p.completed).length;
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  // 섹션 토글
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // 강의 클릭 핸들러
  const handleLessonClick = (lesson: Lesson) => {
    if (!lesson.isFree && !isSubscribed) {
      alert('이 강의는 구독 후 시청할 수 있습니다.\n\n스탠다드로 자동 업그레이드 하시겠습니까?');
      return;
    }
    onLessonSelect(lesson);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-800 to-purple-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">금융집짓기® 마스터 과정</h1>
            <p className="text-xs text-white/80">109강 · 12시간 2분</p>
          </div>
        </div>
      </div>

      {/* 진도율 섹션 */}
      <div className="px-4 py-4 bg-gradient-to-r from-blue-800 to-purple-700">
        <div className="bg-black/20 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">전체 진도율</span>
            <span className="text-sm text-white/80">{completedLessons}/{totalLessons}강 완료</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-right mt-2">
            <span className="text-2xl font-bold">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* 강사 정보 */}
      <div className="mx-4 -mt-2 mb-4 bg-gray-800 rounded-xl p-4 flex items-center gap-3 shadow-lg">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
          👨‍🏫
        </div>
        <div className="flex-1">
          <div className="font-bold">오상열</div>
          <div className="text-xs text-gray-400">CFP, 금융집짓기® 창시자</div>
        </div>
        <div className="text-xs bg-blue-600 px-3 py-1 rounded-full">20년 경력</div>
      </div>

      {/* 섹션 목록 */}
      <div className="px-4 pb-32">
        {COURSE_SECTIONS.map((section) => {
          const isExpanded = expandedSections.includes(section.sectionId);
          const sectionCompleted = section.lessons.filter(l => userProgress[l.id]?.completed).length;

          return (
            <div key={section.sectionId} className="bg-gray-800 rounded-xl mb-3 overflow-hidden">
              {/* 섹션 헤더 */}
              <button
                onClick={() => toggleSection(section.sectionId)}
                className="w-full px-4 py-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-left">{section.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {sectionCompleted}/{section.lessons.length}강 완료
                  </div>
                </div>
                <svg 
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* 강의 목록 */}
              {isExpanded && (
                <div className="border-t border-gray-700">
                  {section.lessons.map((lesson) => {
                    const progress = userProgress[lesson.id];
                    const isCompleted = progress?.completed;
                    const watchedPercent = progress?.watchedPercent || 0;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        className={`w-full px-4 py-3 flex items-center gap-3 border-b border-gray-700 last:border-b-0 transition-colors ${
                          isCompleted ? 'bg-green-900/20' : 'hover:bg-gray-700/50'
                        }`}
                      >
                        {/* 번호/체크 */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {isCompleted ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : lesson.order}
                        </div>

                        {/* 강의 정보 */}
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">{lesson.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">{lesson.duration}</span>
                            {lesson.isFree && (
                              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">무료</span>
                            )}
                            {watchedPercent > 0 && watchedPercent < 100 && (
                              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                                {watchedPercent}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 재생/잠금 아이콘 */}
                        <div className="text-gray-400">
                          {!lesson.isFree && !isSubscribed ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 구독 CTA (미구독자용) */}
      {!isSubscribed && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-800 to-purple-700 px-4 py-4 shadow-lg">
          <div className="mb-3">
            <div className="font-bold text-lg">전체 강좌 수강하기</div>
            <div className="text-sm text-white/80">109강 전체 + 퀴즈 + 수료증</div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl border-2 border-white/30 font-bold">
              월 29,000원
            </button>
            <button className="flex-1 py-3 rounded-xl bg-white text-blue-800 font-bold relative">
              연 290,000원
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                17% 할인
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
