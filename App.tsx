import React, { useState, useCallback, useEffect } from 'react';
import ScriptGenerator from './components/ScriptGenerator';
import VeoGenerator from './components/VeoGenerator';
import { LoadingSpinner, KeyIcon, CopyIcon, CheckIcon, TrashIcon, HistoryIcon } from './components/Icons';
import { HistoryItem } from './types';

type Tab = 'script' | 'veo' | 'history';

const HISTORY_KEY = 'prompt-history';

const HistoryViewer: React.FC = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(HISTORY_KEY);
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to load history from local storage", error);
        }
    }, []);

    const updateLocalStorage = (newHistory: HistoryItem[]) => {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        } catch (error) {
            console.error("Failed to save history to local storage", error);
        }
    };

    const handleDelete = useCallback((idToDelete: string) => {
        const newHistory = history.filter(item => item.id !== idToDelete);
        setHistory(newHistory);
        updateLocalStorage(newHistory);
    }, [history]);

    const handleClearAll = useCallback(() => {
        if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử không?')) {
            setHistory([]);
            localStorage.removeItem(HISTORY_KEY);
        }
    }, []);

    const handleCopy = useCallback((id: string, text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto font-sans text-gray-200">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
                    Lịch sử Prompt
                </h1>
                <p className="text-gray-400 text-lg">
                    Xem lại các prompt bạn đã tạo trước đây.
                </p>
            </header>

            {history.length > 0 ? (
                <div className="space-y-6">
                    <div className="text-right">
                        <button
                            onClick={handleClearAll}
                            className="flex items-center gap-2 py-2 px-4 bg-red-800/50 hover:bg-red-700/50 border border-red-700 rounded-lg transition-colors duration-300 text-red-300"
                        >
                            <TrashIcon className="w-5 h-5" />
                            <span>Xóa toàn bộ lịch sử</span>
                        </button>
                    </div>

                    {history.map((item) => (
                        <div key={item.id} className="bg-brand-surface p-4 rounded-xl shadow-lg border border-white/10 relative overflow-hidden">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.type === 'script' ? 'bg-purple-600 text-purple-100' : 'bg-blue-600 text-blue-100'}`}>
                                            {item.type === 'script' ? 'Kịch bản' : 'Veo Prompt'}
                                        </span>
                                        <span className="text-sm text-gray-400">
                                            {new Date(item.timestamp).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed max-h-40 overflow-y-auto pr-2">
                                        {item.prompt}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0 pt-1">
                                    <button
                                        onClick={() => handleCopy(item.id, item.prompt)}
                                        className="flex items-center justify-center w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                        aria-label="Sao chép"
                                    >
                                        {copiedId === item.id ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="flex items-center justify-center w-10 h-10 bg-gray-700 hover:bg-red-800/80 rounded-lg transition-colors"
                                        aria-label="Xóa"
                                    >
                                        <TrashIcon className="w-5 h-5 text-red-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center bg-brand-surface p-12 rounded-2xl border border-dashed border-gray-700">
                    <HistoryIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-300">Lịch sử trống</h2>
                    <p className="text-gray-500 mt-2">
                        Các prompt bạn tạo sẽ được lưu tại đây để xem lại sau.
                    </p>
                </div>
            )}
        </div>
    );
};

// Extracted AuthScreen to be a stable component
interface AuthScreenProps {
    adminKey: string;
    setAdminKey: (key: string) => void;
    handleKeySubmit: (e: React.FormEvent) => void;
    isAuthenticating: boolean;
    authError: string | null;
}

const AuthScreen: React.FC<AuthScreenProps> = ({
    adminKey,
    setAdminKey,
    handleKeySubmit,
    isAuthenticating,
    authError,
}) => (
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

// Extracted AppContent to be a stable component
interface AppContentProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

const AppContent: React.FC<AppContentProps> = ({ activeTab, setActiveTab }) => (
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
            <button 
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 text-lg font-medium transition-colors duration-300 ${activeTab === 'history' ? 'border-b-2 border-green-400 text-green-300' : 'text-gray-400 hover:text-white'}`}
            >
                Lịch sử
            </button>
        </div>

        <main>
            {activeTab === 'script' && <ScriptGenerator />}
            {activeTab === 'veo' && <VeoGenerator />}
            {activeTab === 'history' && <HistoryViewer />}
        </main>
    </div>
    <footer className="w-full max-w-4xl text-center mt-12 text-brand-text-secondary text-sm">
        <p>Sử dụng mô hình Gemini của Google.</p>
    </footer>
  </div>
);


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

    if (isAuthenticating && !isAuthenticated) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center">
                <LoadingSpinner className="w-12 h-12 animate-spin text-brand-primary" />
            </div>
        );
    }
    
    return isAuthenticated ? (
        <AppContent activeTab={activeTab} setActiveTab={setActiveTab} />
    ) : (
        <AuthScreen
            adminKey={adminKey}
            setAdminKey={setAdminKey}
            handleKeySubmit={handleKeySubmit}
            isAuthenticating={isAuthenticating}
            authError={authError}
        />
    );
};

export default App;