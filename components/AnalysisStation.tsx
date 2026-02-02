
import React, { useState, useRef } from 'react';

interface AnalysisStationProps {
  onAnalyze: (term: string, context: string, imageBase64?: string) => void;
  onOpenHistory: () => void;
  isAnalyzing: boolean;
}

const AnalysisStation: React.FC<AnalysisStationProps> = ({ onAnalyze, onOpenHistory, isAnalyzing }) => {
  const [term, setTerm] = useState('');
  const [context, setContext] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <header className="h-16 flex items-center justify-between px-8 border-b-4 border-black shrink-0 sm:flex hidden bg-white dark:bg-gray-900 z-10">
        <h1 className="text-lg font-black uppercase tracking-widest text-black dark:text-white italic -rotate-1 bg-yellow-400 px-2 border-2 border-black inline-block shadow-[2px_2px_0px_0px_#000]">分析工作台</h1>
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-2 text-black hover:text-white hover:bg-black transition-all font-bold uppercase tracking-widest px-3 py-1 rounded border-2 border-transparent hover:border-black"
        >
          <span className="material-symbols-outlined text-xl">history</span>
          <span className="hidden sm:inline">历史记录</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 flex flex-col items-center">
        <div className="max-w-4xl w-full flex flex-col items-center justify-center flex-1 py-6 pb-32">
          <div className="text-center mb-8 lg:mb-12 space-y-2 lg:space-y-3 relative">
            <div className="absolute -top-10 right-0 lg:-right-20 rotate-12 bg-white border-3 border-black p-2 shadow-[4px_4px_0px_0px_#000] hidden lg:block animate-bounce duration-[3000ms]">
              <p className="font-black text-xs uppercase">Unlock Knowledge!</p>
            </div>
            <h2 className="text-4xl lg:text-7xl font-display font-black text-black dark:text-white tracking-tighter italic drop-shadow-[4px_4px_0_#FCD34D] stroke-black text-stroke-2">
              DEEP ANALYSIS
            </h2>
          </div>

          <div className="w-full relative group">
            <div className="absolute inset-0 bg-yellow-400 rounded-2xl transform rotate-1 translate-x-2 translate-y-2 border-3 border-black"></div>
            <div className="relative bg-white dark:bg-gray-900 border-3 border-black rounded-2xl p-6 lg:p-10 flex flex-col gap-6 lg:gap-8 hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-300">
              <div className="space-y-2 group/input">
                <label className="text-xs font-black uppercase tracking-widest text-white bg-black px-2 py-1 -rotate-1 inline-block shadow-[2px_2px_0px_0px_#ccc] flex w-fit items-center gap-1.5 border-2 border-transparent">
                  <span className="material-symbols-outlined text-sm">target</span> 目标术语
                </label>
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border-3 border-black rounded-xl px-4 py-4 focus:ring-0 focus:shadow-[6px_6px_0px_0px_#000] focus:-translate-y-1 transition-all text-xl lg:text-2xl font-bold placeholder-gray-300 dark:placeholder-gray-600 font-display"
                  placeholder="例如：Silver Lining..."
                  type="text"
                />
              </div>

              <div className="space-y-2 group/input">
                <label className="text-xs font-black uppercase tracking-widest text-white bg-blue-600 px-2 py-1 rotate-1 inline-block shadow-[2px_2px_0px_0px_#000] flex w-fit items-center gap-1.5 border-2 border-black">
                  <span className="material-symbols-outlined text-sm">contextual_token</span> 原始语境
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border-3 border-black rounded-xl px-4 py-4 focus:ring-0 focus:shadow-[6px_6px_0px_0px_#000] focus:-translate-y-1 transition-all text-base lg:text-lg font-medium placeholder-gray-300 dark:placeholder-gray-600 resize-none min-h-[100px] lg:min-h-[140px] custom-scrollbar"
                  placeholder="请输入语境..."
                ></textarea>
              </div>

              {image && (
                <div className="relative inline-block w-24 lg:w-32 group/img animate-in zoom-in-50 duration-200 border-3 border-black shadow-[4px_4px_0px_0px_#000] rotate-2 bg-white p-1">
                  <img src={image} alt="视觉语境" className="w-full h-16 lg:h-24 object-cover" />
                  <button
                    onClick={removeImage}
                    className="absolute -top-3 -right-3 size-6 bg-red-500 text-white border-2 border-black flex items-center justify-center hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_#000]"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">close</span>
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-end pt-4 gap-4">
                <button
                  onClick={() => term && context && onAnalyze(term, context)}
                  disabled={!term || !context || isAnalyzing}
                  className={`group relative overflow-hidden bg-red-500 text-white px-8 lg:px-12 py-4 lg:py-5 rounded-xl font-black text-xl uppercase tracking-wider flex items-center justify-center gap-3 border-3 border-black shadow-[6px_6px_0px_0px_#000] transition-all w-full sm:w-auto ${(!term || (!context && !image) || isAnalyzing) ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-[1.02] hover:shadow-[8px_8px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000]'}`}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="size-5 border-4 border-black/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-base">BOOM!...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-2xl lg:text-3xl group-hover:scale-125 transition-transform">bolt</span>
                      <span>ANALYZE!</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisStation;
