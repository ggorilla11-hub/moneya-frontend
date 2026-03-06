// App.tsx v5.3 수정: consultation 탭 → ConsultingPage로 올바르게 연결
// ★★★ ConsultationPage(화상상담)는 ConsultingPage 내부 줌상담 탭에서만 진입 ★★★

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import FinancialCheckPage from './pages/FinancialCheckPage';
import FinancialResultPage from './pages/FinancialResultPage';
import IncomeExpenseInputPage from './pages/IncomeExpenseInputPage';
import IncomeExpenseResultPage from './pages/IncomeExpenseResultPage';
import BudgetAdjustPage from './pages/BudgetAdjustPage';
import BudgetConfirmPage from './pages/BudgetConfirmPage';
import HomePage from './pages/HomePage';
import DetailReportPage from './pages/DetailReportPage';
import AISpendPage from './pages/AISpendPage';
import FAQMorePage from './pages/FAQMorePage';
import MyPage from './pages/MyPage';
import SubscriptionPage from './pages/SubscriptionPage';
import ConsultingApplyPage from './pages/ConsultingApplyPage';
import ConsultationPage from './pages/ConsultationPage';
import MonthlyReportPage from './pages/MonthlyReportPage';
import FinancialHouseDisclaimer from './pages/FinancialHouseDisclaimer';
import FinancialHouseBasic from './pages/FinancialHouseBasic';
import FinancialHouseDesign from './pages/FinancialHouseDesign';
import FinancialHouseResult from './pages/FinancialHouseResult';
import OnlineCoursePage from './pages/OnlineCoursePage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import PodcastPage from './pages/PodcastPage';
import DeleteAccountPage from './pages/DeleteAccountPage';
import type { ConsultingProduct } from './pages/ConsultingApplyPage';
import BottomNav from './components/BottomNav';
import FinancialTicker from './components/FinancialTicker';
import PinLockScreen from './components/PinLockScreen';
import { SpendProvider } from './context/SpendContext';
import { FinancialHouseProvider } from './context/FinancialHouseContext';
import type { IncomeExpenseData } from './types/incomeExpense';
import type { AdjustedBudget } from './pages/BudgetAdjustPage';

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a";

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

type AppStep =
  | 'login'
  | 'onboarding'
  | 'financial-check'
  | 'financial-result'
  | 'income-expense-input'
  | 'income-expense-result'
  | 'budget-adjust'
  | 'budget-confirm'
  | 'main'
  | 'detail-report'
  | 'faq-more'
  | 're-diagnosis'
  | 're-analysis'
  | 're-analysis-input'
  | 'subscription'
  | 'consulting'
  | 'consulting-apply'
  | 'monthly-report'
  | 'online-course'
  | 'video-player'
  | 'podcast';

type MainTab = 'home' | 'ai-spend' | 'financial-house' | 'consultation' | 'mypage';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<AppStep>('login');
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [financialResult, setFinancialResult] = useState<FinancialResult | null>(null);
  const [incomeExpenseData, setIncomeExpenseData] = useState<IncomeExpenseData | null>(null);
  const [adjustedBudget, setAdjustedBudget] = useState<AdjustedBudget | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ConsultingProduct | null>(null);
  const [financialHouseStep, setFinancialHouseStep] = useState<'disclaimer' | 'basic' | 'design' | 'result'>('disclaimer');
  const [designInitialTab, setDesignInitialTab] = useState<string>('retire');
  const [basicInitialStep, setBasicInitialStep] = useState<number>(1);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [isSubscribed] = useState<boolean>(false);
  const [isDeepLink, setIsDeepLink] = useState<boolean>(false);
  const [pinUnlocked, setPinUnlocked] = useState<boolean>(false);

  const isDeleteAccountPage = window.location.pathname === '/delete-account';

  useEffect(() => {
    if (isDeleteAccountPage) {
      setLoading(false);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const targetPage = urlParams.get('page');

    if (targetPage === 'financial-check') {
      setIsDeepLink(true);
      setCurrentStep('financial-check');
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const pinEnabled = localStorage.getItem(`moneya_pin_enabled_${currentUser.uid}`);
        if (!pinEnabled || pinEnabled !== 'true') {
          setPinUnlocked(true);
        }

        if (targetPage === 'financial-check') {
          setIsDeepLink(true);
          setCurrentStep('financial-check');
          return;
        } else if (targetPage === 'consulting') {
          setCurrentStep('main');
          setCurrentTab('consultation');
          return;
        } else if (targetPage === 'mypage') {
          setCurrentStep('main');
          setCurrentTab('mypage');
          return;
        } else if (targetPage === 'mypage-consulting') {
          setCurrentStep('main');
          setCurrentTab('consultation');
          return;
        }

        const budgetConfirmed = localStorage.getItem(`budgetConfirmed_${currentUser.uid}`);
        if (budgetConfirmed) {
          const savedFinancialData = localStorage.getItem(`financialData_${currentUser.uid}`);
          if (savedFinancialData) setFinancialResult(JSON.parse(savedFinancialData));
          const savedBudget = localStorage.getItem(`adjustedBudget_${currentUser.uid}`);
          if (savedBudget) setAdjustedBudget(JSON.parse(savedBudget));
          const savedIncomeExpense = localStorage.getItem(`incomeExpenseData_${currentUser.uid}`);
          if (savedIncomeExpense) setIncomeExpenseData(JSON.parse(savedIncomeExpense));

          const financialHouseCompleted =
            localStorage.getItem(`financialHouseCompleted_${currentUser.uid}`) ||
            localStorage.getItem('financialHouseCompleted');
          const disclaimerAgreed = localStorage.getItem(`financialHouseDisclaimerAgreed_${currentUser.uid}`);

          if (financialHouseCompleted) {
            setFinancialHouseStep('result');
          } else if (disclaimerAgreed) {
            const designStarted = localStorage.getItem(`financialHouseDesignStarted_${currentUser.uid}`);
            setFinancialHouseStep(designStarted ? 'design' : 'basic');
          }
          setCurrentStep('main');
          setCurrentTab('home');
        } else {
          setCurrentStep('onboarding');
        }
      } else {
        if (!targetPage) {
          setCurrentStep('login');
          setCurrentTab('home');
        } else if (targetPage === 'mypage' || targetPage === 'mypage-consulting') {
          setCurrentStep('login');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (isDeleteAccountPage) return <DeleteAccountPage />;

  const handleOnboardingComplete = () => {
    if (user) { localStorage.setItem(`onboarding_${user.uid}`, 'true'); setCurrentStep('financial-check'); }
  };

  const handleFinancialCheckComplete = (result: FinancialResult) => {
    setFinancialResult(result);
    if (user) localStorage.setItem(`financialData_${user.uid}`, JSON.stringify(result));
    setCurrentStep('financial-result');
  };

  const handleFinancialRetry = () => { setFinancialResult(null); setCurrentStep('financial-check'); };

  const handleFinancialNext = () => {
    if (isDeepLink && !user) return;
    if (user) { localStorage.setItem(`financial_${user.uid}`, 'true'); setCurrentStep('income-expense-input'); }
  };

  const handleIncomeExpenseComplete = (data: IncomeExpenseData) => {
    setIncomeExpenseData(data);
    if (user) localStorage.setItem(`incomeExpenseData_${user.uid}`, JSON.stringify(data));
    setCurrentStep('income-expense-result');
  };

  const handleIncomeExpenseResultNext = () => {
    if (user) { localStorage.setItem(`incomeExpense_${user.uid}`, 'true'); setCurrentStep('budget-adjust'); }
  };

  const handleBudgetAdjustConfirm = (budget: AdjustedBudget) => {
    setAdjustedBudget(budget);
    if (user) localStorage.setItem(`adjustedBudget_${user.uid}`, JSON.stringify(budget));
    setCurrentStep('budget-confirm');
  };

  const handleBudgetConfirmStart = () => {
    if (user) localStorage.setItem(`budgetConfirmed_${user.uid}`, 'true');
    setCurrentStep('main');
    setCurrentTab('home');
  };

  const handleTabChange = (tab: MainTab) => {
    setCurrentTab(tab);
    if (tab === 'financial-house' && user) {
      const financialHouseCompleted =
        localStorage.getItem(`financialHouseCompleted_${user.uid}`) ||
        localStorage.getItem('financialHouseCompleted');
      const disclaimerAgreed = localStorage.getItem(`financialHouseDisclaimerAgreed_${user.uid}`);
      if (financialHouseCompleted) {
        setFinancialHouseStep('result');
      } else if (disclaimerAgreed) {
        const designStarted = localStorage.getItem(`financialHouseDesignStarted_${user.uid}`);
        if (designStarted) { setDesignInitialTab('retire'); setFinancialHouseStep('design'); }
        else { setBasicInitialStep(1); setFinancialHouseStep('basic'); }
      } else {
        setFinancialHouseStep('disclaimer');
      }
    }
  };

  const handleMoreDetail = () => setCurrentStep('detail-report');
  const handleDetailReportBack = () => { setCurrentStep('main'); setCurrentTab('home'); };
  const handleFAQMore = () => setCurrentStep('faq-more');
  const handleFAQBack = () => { setCurrentStep('main'); setCurrentTab('ai-spend'); };
  const handleSelectQuestion = (question: string) => console.log('Selected question:', question);
  const handleReDiagnosis = () => setCurrentStep('re-diagnosis');
  const handleReAnalysis = () => setCurrentStep('re-analysis');
  const handleBackToHome = () => { setCurrentStep('main'); setCurrentTab('home'); };

  const handleMyPageNavigate = (page: 'subscription' | 'consulting' | 'monthly-report' | 'online-course' | 'podcast') => {
    if (page === 'subscription') setCurrentStep('subscription');
    else if (page === 'consulting') { setCurrentStep('main'); setCurrentTab('consultation'); }
    else if (page === 'monthly-report') setCurrentStep('monthly-report');
    else if (page === 'online-course') setCurrentStep('online-course');
    else if (page === 'podcast') setCurrentStep('podcast');
  };

  const handleHomeNavigate = (page: string) => {
    if (page === 'consulting') { setCurrentStep('main'); setCurrentTab('consultation'); }
  };

  const handleLogout = () => auth.signOut();

  const handleRestart = () => {
    if (user) {
      ['onboarding', 'financial', 'financialData', 'incomeExpense', 'incomeExpenseData',
        'adjustedBudget', 'budgetConfirmed', 'moneya_spend',
        'financialHouseCompleted', 'financialHouseDisclaimerAgreed', 'financialHouseDesignStarted'
      ].forEach(key => localStorage.removeItem(`${key}_${user.uid}`));
      localStorage.removeItem('financialHouseBasicDraft');
      localStorage.removeItem('financialHouseCompleted');
      localStorage.removeItem('financialHouseData');
      setFinancialResult(null); setIncomeExpenseData(null); setAdjustedBudget(null);
      setFinancialHouseStep('disclaimer'); setDesignInitialTab('retire'); setBasicInitialStep(1);
      setCurrentStep('onboarding'); setCurrentTab('home');
    }
  };

  const handleDisclaimerAgree = () => {
    if (user) localStorage.setItem(`financialHouseDisclaimerAgreed_${user.uid}`, 'true');
    setBasicInitialStep(1); setFinancialHouseStep('basic');
  };

  const handleBasicComplete = () => {
    if (user) localStorage.setItem(`financialHouseDesignStarted_${user.uid}`, 'true');
    setDesignInitialTab('retire'); setFinancialHouseStep('design');
  };

  const handleFinancialHouseComplete = () => {
    if (user) localStorage.setItem(`financialHouseCompleted_${user.uid}`, 'true');
    localStorage.setItem('financialHouseCompleted', 'true');
    setFinancialHouseStep('result');
  };

  const handleFinancialHouseRestart = () => {
    if (user) {
      localStorage.removeItem(`financialHouseCompleted_${user.uid}`);
      localStorage.removeItem(`financialHouseDesignStarted_${user.uid}`);
      localStorage.removeItem('financialHouseBasicDraft');
      localStorage.removeItem('financialHouseCompleted');
      localStorage.removeItem('financialHouseData');
    }
    setBasicInitialStep(1); setFinancialHouseStep('basic');
  };

  const handleLessonSelect = (lesson: Lesson, lessons: Lesson[]) => {
    setSelectedLesson(lesson); setAllLessons(lessons); setCurrentStep('video-player');
  };

  const handleVideoPlayerBack = () => { setSelectedLesson(null); setCurrentStep('online-course'); };

  const handlePrevLesson = () => {
    if (!selectedLesson || allLessons.length === 0) return;
    const idx = allLessons.findIndex(l => l.id === selectedLesson.id);
    if (idx > 0) setSelectedLesson(allLessons[idx - 1]);
  };

  const handleNextLesson = () => {
    if (!selectedLesson || allLessons.length === 0) return;
    const idx = allLessons.findIndex(l => l.id === selectedLesson.id);
    if (idx < allLessons.length - 1) setSelectedLesson(allLessons[idx + 1]);
  };

  const showTicker = user && currentStep === 'main' && (currentTab === 'ai-spend' || currentTab === 'financial-house');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_URL} alt="AI머니야 로고" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user && isDeepLink && currentStep === 'financial-check') return <FinancialCheckPage onComplete={handleFinancialCheckComplete} />;
  if (!user && isDeepLink && currentStep === 'financial-result' && financialResult) return <FinancialResultPage result={financialResult} onRetry={handleFinancialRetry} onNext={handleFinancialNext} />;
  if (!user) return <LoginPage onLogin={() => {}} />;

  if (!pinUnlocked) {
    const pinEnabled = localStorage.getItem(`moneya_pin_enabled_${user.uid}`);
    if (pinEnabled === 'true') return <PinLockScreen uid={user.uid} onSuccess={() => setPinUnlocked(true)} />;
  }

  if (currentStep === 'onboarding') return <OnboardingPage onComplete={handleOnboardingComplete} />;
  if (currentStep === 'financial-check') return <FinancialCheckPage onComplete={handleFinancialCheckComplete} />;
  if (currentStep === 'financial-result' && financialResult) return <FinancialResultPage result={financialResult} onRetry={handleFinancialRetry} onNext={handleFinancialNext} />;
  if (currentStep === 'income-expense-input') return <IncomeExpenseInputPage initialIncome={financialResult?.income || 0} onComplete={handleIncomeExpenseComplete} onBack={() => setCurrentStep('financial-result')} />;
  if (currentStep === 'income-expense-result' && incomeExpenseData) return <IncomeExpenseResultPage data={incomeExpenseData} onBack={() => setCurrentStep('income-expense-input')} onNext={handleIncomeExpenseResultNext} />;
  if (currentStep === 'budget-adjust' && incomeExpenseData) return <BudgetAdjustPage incomeExpenseData={incomeExpenseData} onConfirm={handleBudgetAdjustConfirm} onBack={() => setCurrentStep('income-expense-result')} />;
  if (currentStep === 'budget-confirm' && adjustedBudget) return <BudgetConfirmPage adjustedBudget={adjustedBudget} onStart={handleBudgetConfirmStart} />;
  if (currentStep === 'detail-report') return <DetailReportPage adjustedBudget={adjustedBudget} onBack={handleDetailReportBack} />;
  if (currentStep === 'faq-more') return <FAQMorePage onBack={handleFAQBack} onSelectQuestion={handleSelectQuestion} />;
  if (currentStep === 'subscription') return <SubscriptionPage onBack={() => { setCurrentStep('main'); setCurrentTab('mypage'); }} />;
  if (currentStep === 'consulting-apply' && selectedProduct) return <ConsultingApplyPage product={selectedProduct} onBack={() => { setSelectedProduct(null); setCurrentTab('consultation'); setCurrentStep('main'); }} />;
  if (currentStep === 'monthly-report') return <SpendProvider userId={user.uid}><MonthlyReportPage onBack={() => { setCurrentStep('main'); setCurrentTab('mypage'); }} adjustedBudget={adjustedBudget} /></SpendProvider>;
  if (currentStep === 'online-course') return <OnlineCoursePage onBack={() => { setCurrentStep('main'); setCurrentTab('mypage'); }} onLessonSelect={(lesson) => handleLessonSelect(lesson, [])} isSubscribed={isSubscribed} />;
  if (currentStep === 'podcast') return <PodcastPage onBack={() => { setCurrentStep('main'); setCurrentTab('mypage'); }} />;
  if (currentStep === 'video-player' && selectedLesson) {
    const idx = allLessons.findIndex(l => l.id === selectedLesson.id);
    return <VideoPlayerPage lesson={selectedLesson} onBack={handleVideoPlayerBack} onPrevLesson={handlePrevLesson} onNextLesson={handleNextLesson} hasPrev={idx > 0} hasNext={idx < allLessons.length - 1} />;
  }
  if (currentStep === 're-diagnosis' && financialResult) return <FinancialResultPage result={financialResult} onRetry={handleFinancialRetry} onNext={handleBackToHome} isFromHome={true} />;
  if (currentStep === 're-analysis' && incomeExpenseData) {
    return (
      <BudgetAdjustPage
        incomeExpenseData={incomeExpenseData}
        onConfirm={(budget) => { setAdjustedBudget(budget); if (user) localStorage.setItem(`adjustedBudget_${user.uid}`, JSON.stringify(budget)); handleBackToHome(); }}
        onBack={handleBackToHome}
        isFromHome={true}
        onReAnalysis={() => setCurrentStep('re-analysis-input')}
      />
    );
  }
  if (currentStep === 're-analysis-input') {
    return (
      <IncomeExpenseInputPage
        initialIncome={financialResult?.income || 0}
        onComplete={(data) => { setIncomeExpenseData(data); if (user) localStorage.setItem(`incomeExpenseData_${user.uid}`, JSON.stringify(data)); setCurrentStep('income-expense-result'); }}
        onBack={() => setCurrentStep('re-analysis')}
      />
    );
  }

  if (currentStep === 'main') {
    return (
      <SpendProvider userId={user.uid}>
        {showTicker && <FinancialTicker />}
        <div className={showTicker ? 'pt-9' : ''}>
          {currentTab === 'home' && (
            <HomePage
              userName={financialResult?.name || user.displayName || '사용자'}
              adjustedBudget={adjustedBudget}
              financialResult={financialResult}
              onMoreDetail={handleMoreDetail}
              onReDiagnosis={handleReDiagnosis}
              onReAnalysis={handleReAnalysis}
              onNavigate={handleHomeNavigate}
            />
          )}
          {currentTab === 'ai-spend' && (
            <AISpendPage
              userName={financialResult?.name || user.displayName || '사용자'}
              adjustedBudget={adjustedBudget}
              financialResult={financialResult}
              onFAQMore={handleFAQMore}
            />
          )}
          {currentTab === 'financial-house' && (
            <FinancialHouseProvider userId={user.uid}>
              {financialHouseStep === 'disclaimer' && <FinancialHouseDisclaimer userName={financialResult?.name || user.displayName || '사용자'} onStart={handleDisclaimerAgree} />}
              {financialHouseStep === 'basic' && (
                <FinancialHouseBasic
                  userName={financialResult?.name || user.displayName || '사용자'}
                  onComplete={handleBasicComplete}
                  onBack={() => setCurrentTab('home')}
                  existingFinancialResult={financialResult}
                  existingIncomeExpense={incomeExpenseData}
                  initialStep={basicInitialStep}
                />
              )}
              {financialHouseStep === 'design' && (
                <FinancialHouseDesign
                  userName={financialResult?.name || user.displayName || '사용자'}
                  onComplete={handleFinancialHouseComplete}
                  onBack={() => { setBasicInitialStep(5); setFinancialHouseStep('basic'); }}
                  initialTab={designInitialTab}
                />
              )}
              {financialHouseStep === 'result' && (
                <FinancialHouseResult
                  userName={financialResult?.name || user.displayName || '사용자'}
                  onRestart={handleFinancialHouseRestart}
                  onBack={() => { setDesignInitialTab('insurance'); setFinancialHouseStep('design'); }}
                  onTabClick={(tabId) => { setDesignInitialTab(tabId); setFinancialHouseStep('design'); }}
                  onNavigate={(path) => {
                    if (path === 'mypage-consulting') { setCurrentStep('main'); setCurrentTab('consultation'); }
                    else if (path === 'ai-spend') setCurrentTab('ai-spend');
                    else if (path === 'home') setCurrentTab('home');
                    else if (path === 'mypage') setCurrentTab('mypage');
                  }}
                />
              )}
            </FinancialHouseProvider>
          )}
          {/* ★★★ 상담탭 → ConsultationPage (홈/내재무/줌상담/일정/이력/서류) ★★★ */}
          {currentTab === 'consultation' && (
            <ConsultationPage />
          )}
          {currentTab === 'mypage' && (
            <MyPage
              userName={financialResult?.name || user.displayName || '사용자'}
              userEmail={user.email || ''}
              userPhoto={user.photoURL}
              financialResult={financialResult}
              onNavigate={handleMyPageNavigate}
              onLogout={handleLogout}
              onReset={handleRestart}
              userId={user.uid}
            />
          )}
          <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
        </div>
      </SpendProvider>
    );
  }

  return null;
}

export default App;
