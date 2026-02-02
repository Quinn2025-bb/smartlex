import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AnalysisStation from './components/AnalysisStation';
import AnalysisResult from './components/AnalysisResult';
import KnowledgeLibrary from './components/Library';
import HistoryList from './components/History';
import ChatSidebar from './components/ChatSidebar';
import Settings from './components/Settings';
import { analyzeTerm } from './geminiService';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { useToast } from './contexts/ToastContext';
import { useStore } from './contexts/StoreContext';

export enum View {
  HOME,
  HISTORY,
  LIBRARY,
  SETTINGS,
  ANALYSIS_RESULT
}

const App: React.FC = () => {
  const { showToast } = useToast();
  const {
    setHistory,
    setCurrentAnalysis,
    customFileName,
    linkCustomFile,
    currentAnalysis,
    history
  } = useStore();

  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [previousView, setPreviousView] = useState<View>(View.HOME);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const [breadcrumbInfo, setBreadcrumbInfo] = useState({ label: '历史记录', view: View.HISTORY });

  // Initial setup
  useEffect(() => {
    const initNotification = async () => {
      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
      }
    };
    initNotification();

    if (window.innerWidth < 1024) setIsCompactMode(true);
  }, []);

  const handleStartAnalysis = useCallback(async (term: string, context: string, imageBase64?: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeTerm(term, context, imageBase64);
      setHistory(prev => [result, ...prev].slice(0, 100));
      setCurrentAnalysis(result);
      // Set breadcrumb to Home since we analyzed from Home
      setBreadcrumbInfo({ label: '首页', view: View.HOME });
      setCurrentView(View.ANALYSIS_RESULT);

      // Send notification
      sendNotification({
        title: '分析完成',
        body: `"${term}" 的深度分析已就绪。`,
      });
      showToast('深度分析已完成', 'success');
    } catch (error: any) {
      console.error("Analysis failed:", error);
      showToast(error.message || "分析失败，请检查网络连接。", 'error');
    } finally {
      setIsAnalyzing(false);
    }
  }, [showToast, setHistory, setCurrentAnalysis]);

  const navigateToAnalysis = useCallback((item: any, source: View) => {
    setCurrentAnalysis(item);

    // Determine breadcrumb based on source
    let label = '历史记录';
    if (source === View.HOME) label = '首页';
    else if (source === View.LIBRARY) label = '知识库';

    setBreadcrumbInfo({ label, view: source });
    setCurrentView(View.ANALYSIS_RESULT);
  }, [setCurrentAnalysis]);

  const togglePin = () => {
    setIsPinned(!isPinned);
    showToast(isPinned ? '窗口置顶已取消' : '窗口已置顶', 'info');
  };

  return (
    <div className={`flex h-full w-full transition-all duration-300 overflow-hidden ${isCompactMode ? 'bg-[#f8f9fa] dark:bg-[#0d1017]' : ''}`}>
      {!isCompactMode && <Sidebar currentView={currentView} setView={setCurrentView} />}

      <main className={`flex-1 flex flex-col min-h-0 overflow-hidden relative border-x border-gray-100 dark:border-gray-800 ${isCompactMode ? 'border-none' : ''}`}>

        {/* Custom Header with Sync Status */}
        <div className="h-10 flex items-center justify-between px-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md shrink-0 border-b border-gray-50 dark:border-gray-800 z-50 group">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setCurrentView(View.HOME)}
              title="返回首页"
            >
              <span className="material-symbols-outlined text-primary text-sm">lens_blur</span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-primary transition-colors">SmartLex Core</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-green-500/5 rounded-full cursor-pointer hover:bg-green-500/10 transition-colors" onClick={linkCustomFile} title="显示同步状态">
              <span className={`size-1 rounded-full animate-pulse ${customFileName ? 'bg-primary' : 'bg-green-500'}`}></span>
              <span className="text-[8px] font-bold text-gray-500 uppercase">
                {customFileName ? `Linked: ${customFileName}` : 'Auto-Sync Active'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={togglePin}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isPinned ? 'text-primary' : 'text-gray-300'}`}
              title={isPinned ? "取消置顶" : "窗口置顶"}
            >
              <span className="material-symbols-outlined text-base">{isPinned ? 'push_pin' : 'keep_public'}</span>
            </button>
            <button
              onClick={() => setIsCompactMode(!isCompactMode)}
              className="p-1 text-gray-300 hover:text-primary rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isCompactMode ? "切换标准模式" : "切换紧凑模式"}
            >
              <span className="material-symbols-outlined text-base">{isCompactMode ? 'fullscreen' : 'fullscreen_exit'}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {currentView === View.HOME && (
            <AnalysisStation onAnalyze={handleStartAnalysis} onOpenHistory={() => setCurrentView(View.HISTORY)} isAnalyzing={isAnalyzing} />
          )}
          {currentView === View.HISTORY && (
            <HistoryList onSelectItem={(item) => navigateToAnalysis(item, View.HISTORY)} onClose={() => setCurrentView(previousView)} />
          )}
          {currentView === View.ANALYSIS_RESULT && (
            <AnalysisResult
              onOpenHistory={() => setCurrentView(View.HISTORY)}
              breadcrumbLabel={breadcrumbInfo.label}
              onBreadcrumbClick={() => setCurrentView(breadcrumbInfo.view)}
            />
          )}
          {currentView === View.LIBRARY && (
            <KnowledgeLibrary
              onSelectItem={(item) => navigateToAnalysis(item, View.LIBRARY)}
              onOpenHistory={() => setCurrentView(View.HISTORY)}
            />
          )}
          {currentView === View.SETTINGS && (
            <Settings />
          )}
        </div>
      </main >

      {!isCompactMode && <ChatSidebar />}
    </div >
  );
};

export default App;
