import React, { useState, useCallback, useEffect } from 'react';
import ScriptGenerator from './components/ScriptGenerator';
import VeoGenerator from './components/VeoGenerator';
import { LoadingSpinner, KeyIcon } from './components/Icons';

type Tab = 'script' | 'veo';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [adminKey, setAdminKey] = useState<string>('');
    const [authError, setAuthError] = useState<string | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<Tab>('script');

    useEffect(() => {
        const authenticated = sessionStorage.getItem('veo-prompt-authenticated') === 'true';
        if (authenticated) {
            setIsAuthenticated(true);
        }
        setIsAuthenticating(false);
    }, []);

    const handleKeySubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAuthenticating(true);
        setAuthError(null);
        
        const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQszvDADnGxtwZ89OcsvwhJIE5whAaxEislQtZX5N17NHmkTNba1TdV7P6lHO_KUARdX-SA8DbBXOUc/pub?gid=0&single=true&output=csv';

        try {
            const response = await fetch(sheetUrl);
            if (!response.ok) throw new Error('Không thể tải danh sách key truy cập.');
            
            const csvText = await response.text();
            const validKeys = csvText.split(/\r?\n/).map(key => key.trim()).filter(Boolean);
            
            if (validKeys.includes(adminKey)) {
                sessionStorage.setItem('veo-prompt-authenticated', 'true');
                setIsAuthenticated(true);
            } else {
                setAuthError('Key truy cập không hợp lệ.');
            }
        } catch (error) {
            console.error('Lỗi xác thực:', error);
            setAuthError('Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại.');
        } finally {
            setIsAuthenticating(false);
        }
    }, [adminKey]);

    const AuthScreen = () => (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md">
          <form onSubmit={handleKeySubmit} className="bg-brand-surface p-8 rounded-2xl shadow-lg border border-white/10 space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent mb-2">
                Yêu cầu truy cập
              </h1>
              <p className="text-brand-text-secondary">Vui lòng nhập key truy cập để sử dụng ứng dụng.</p>
            </div>
            <div>
              <label htmlFor="admin-key" className="sr-only">Access Key</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="w-5 h-5 text-gray-400" />
                 </div>
                <input
                  id="admin-key"
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Nhập key truy cập của bạn"
                  className="w-full pl-10 p-3 bg-[#101014] border border-brand-secondary rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all duration-300 text-brand-text-primary placeholder:text-gray-500"
                  required
                  aria-describedby="auth-error"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isAuthenticating ? (
                <>
                  <LoadingSpinner className="w-6 h-6 animate-spin"/>
                  Đang xác thực...
                </>
              ) : 'Mở khóa'}
            </button>
            {authError && <p id="auth-error" className="text-red-400 text-center" role="alert">{authError}</p>}
          </form>
        </div>
      </div>
    );

    const AppContent = () => (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-5xl">
            <div className="mb-8 flex justify-center border-b border-gray-700">
                <button 
                    onClick={() => setActiveTab('script')}
                    className={`px-6 py-3 text-lg font-medium transition-colors duration-300 ${activeTab === 'script' ? 'border-b-2 border-purple-400 text-purple-300' : 'text-gray-400 hover:text-white'}`}
                >
                    Gợi Ý Kịch Bản AI
                </button>
                <button 
                    onClick={() => setActiveTab('veo')}
                    className={`px-6 py-3 text-lg font-medium transition-colors duration-300 ${activeTab === 'veo' ? 'border-b-2 border-brand-primary text-brand-accent' : 'text-gray-400 hover:text-white'}`}
                >
                    Tao Prompt veo3 đồng bộ nhân vật
                </button>
            </div>

            <main>
                {activeTab === 'script' && <ScriptGenerator />}
                {activeTab === 'veo' && <VeoGenerator />}
            </main>
        </div>
        <footer className="w-full max-w-4xl text-center mt-12 text-brand-text-secondary text-sm">
            <p>Sử dụng mô hình Gemini của Google.</p>
        </footer>
      </div>
    );

    if (isAuthenticating && !isAuthenticated) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center">
                <LoadingSpinner className="w-12 h-12 animate-spin text-brand-primary" />
            </div>
        );
    }
    
    return isAuthenticated ? <AppContent /> : <AuthScreen />;
};

export default App;
