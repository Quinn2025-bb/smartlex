import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AnalysisType } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useStore } from '../contexts/StoreContext';

// Sub-components
import ResultHeader from './analysis/ResultHeader';
import SemanticCore from './analysis/SemanticCore';
import Pragmatics from './analysis/Pragmatics';
import LinguisticNetwork from './analysis/LinguisticNetwork';
import UsageExamples from './analysis/UsageExamples';
import OriginStory from './analysis/OriginStory';
import ChatResult from './analysis/ChatResult';

interface AnalysisResultProps {
  onOpenHistory: () => void;
  breadcrumbLabel?: string;
  onBreadcrumbClick?: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ onOpenHistory, breadcrumbLabel = '历史记录', onBreadcrumbClick }) => {
  const { showToast } = useToast();
  const { currentAnalysis, updateAnalysis, addToLibrary, library } = useStore();

  if (!currentAnalysis) return null;

  const isSaved = library.some(i => i.id === currentAnalysis.id);

  const handleSave = () => {
    addToLibrary(currentAnalysis);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentAnalysis, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `SmartLex_${currentAnalysis.term.replace(/\s+/g, '_')}.json`;
    a.click();
    showToast('JSON 导出成功', 'success');
  };

  const handleExportPDF = async () => {
    // 隐藏导出菜单，防止被截图
    const exportMenu = document.querySelector('.group\\/export .absolute');
    if (exportMenu) (exportMenu as HTMLElement).style.display = 'none';

    const element = document.getElementById('analysis-report');
    if (!element) return;

    try {
      showToast('正在生成 PDF...', 'info');
      // 1. 克隆节点以避免影响当前界面
      const clone = element.cloneNode(true) as HTMLElement;

      // 2. 设置克隆节点的样式以确保完整捕获
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      clone.style.width = `${element.offsetWidth}px`;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.background = '#ffffff'; // 强制白底
      clone.classList.remove('flex-1', 'overflow-y-auto'); // 移除滚动和flex约束

      // 3. 挂载克隆节点
      document.body.appendChild(clone);

      // 4. 等待资源加载 (图片/字体)
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: clone.scrollHeight
      });

      // 5. 清理
      document.body.removeChild(clone);
      if (exportMenu) (exportMenu as HTMLElement).style.display = '';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`SmartLex_Report_${currentAnalysis.term}.pdf`);
      showToast('PDF 下载成功', 'success');
    } catch (error) {
      console.error('PDF generation failed', error);
      showToast('PDF 生成失败: 请确保页面内容已加载完毕', 'error');
      if (exportMenu) (exportMenu as HTMLElement).style.display = '';
    }
  };

  if (currentAnalysis.type === AnalysisType.CHAT) {
    return (
      <ChatResult
        analysis={currentAnalysis}
        onOpenHistory={onOpenHistory}
        onSave={handleSave}
        isSaved={isSaved}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible bg-white dark:bg-[#11141d] print:bg-white print:text-black">
      <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b-4 border-black shrink-0 print:hidden sticky top-0 bg-yellow-400 z-30 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-2 text-black text-[10px] font-black uppercase tracking-widest bg-white px-3 py-1 border-2 border-black rotate-1 shadow-[2px_2px_0px_0px_#000]">
          <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={onBreadcrumbClick || onOpenHistory}>{breadcrumbLabel}</span>
          <span className="material-symbols-outlined text-xs font-bold">chevron_right</span>
          <span className="text-black">分析结果</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Export button hidden */}
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`h-10 px-6 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border-3 border-black shadow-[4px_4px_0px_0px_#000] ${isSaved ? 'bg-gray-100 text-gray-400 border-gray-400 shadow-none' : 'bg-green-500 text-white hover:bg-green-400 hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000]'
              }`}
          >
            <span className="material-symbols-outlined text-sm font-bold">{isSaved ? 'check_circle' : 'bookmark_add'}</span>
            {isSaved ? '已保存' : '保存'}
          </button>
        </div>
      </header >

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 print:p-0 print:overflow-visible" id="analysis-report">
        <div className="max-w-4xl mx-auto space-y-10 pb-32 print:space-y-6">

          <ResultHeader analysis={currentAnalysis} onUpdate={updateAnalysis} />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <SemanticCore analysis={currentAnalysis} />
            <Pragmatics analysis={currentAnalysis} />
          </div>

          <LinguisticNetwork analysis={currentAnalysis} onUpdate={updateAnalysis} />

          <UsageExamples analysis={currentAnalysis} onUpdate={updateAnalysis} />

          <OriginStory analysis={currentAnalysis} />

          {/* Diagnostics Footer */}
          <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] text-gray-400 font-mono tracking-wide opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className={`size-1.5 rounded-full ${currentAnalysis.meta?.latencyMs && currentAnalysis.meta.latencyMs < 5000 ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                Latency: {currentAnalysis.meta?.latencyMs ? `${(currentAnalysis.meta.latencyMs / 1000).toFixed(2)}s` : 'N/A'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[10px]">dns</span>
                Model: {currentAnalysis.meta?.model || 'Doubao-Default'}
              </span>
            </div>
            <div>
              SID: {currentAnalysis.id}
            </div>
          </div>

        </div>
      </div>
    </div >
  );
};

export default AnalysisResult;
