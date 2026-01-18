import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';
import VoiceAssistant from './components/VoiceAssistant';
import FinancialHouseDisclaimer from './components/FinancialHouseDisclaimer';
import FinancialHouseBasic from './pages/FinancialHouseBasic';
import FinancialHouseDesign from './pages/financialHouse/FinancialHouseDesign';

type FinancialHouseStep = 'disclaimer' | 'basic-info' | 'design' | null;

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [financialHouseStep, setFinancialHouseStep] = useState<FinancialHouseStep>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStartVoiceChat = () => {
    setShowVoiceAssistant(true);
  };

  const handleCloseVoiceChat = () => {
    setShowVoiceAssistant(false);
  };

  const handleStartFinancialHouse = () => {
    setFinancialHouseStep('disclaimer');
  };

  const handleCloseFinancialHouse = () => {
    setFinancialHouseStep(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route
            path="/"
            element={
              user ? (
                <>
                  <MainPage
                    onStartVoiceChat={handleStartVoiceChat}
                    onStartFinancialHouse={handleStartFinancialHouse}
                  />
                  
                  {/* 음성 비서 모달 */}
                  {showVoiceAssistant && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <VoiceAssistant onClose={handleCloseVoiceChat} />
                      </div>
                    </div>
                  )}

                  {/* 금융집짓기 모달 */}
                  {financialHouseStep === 'disclaimer' && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <FinancialHouseDisclaimer
                          onClose={handleCloseFinancialHouse}
                          onAgree={() => setFinancialHouseStep('basic-info')}
                        />
                      </div>
                    </div>
                  )}

                  {financialHouseStep === 'basic-info' && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <FinancialHouseBasic
                          userName={user.displayName || '사용자'}
                          onComplete={() => {
                            setFinancialHouseStep('design');
                          }}
                          onBack={handleCloseFinancialHouse}
                        />
                      </div>
                    </div>
                  )}

                  {financialHouseStep === 'design' && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <FinancialHouseDesign
                          onClose={handleCloseFinancialHouse}
                          onBack={() => setFinancialHouseStep('basic-info')}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
