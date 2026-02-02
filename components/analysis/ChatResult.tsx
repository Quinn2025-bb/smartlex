import React from 'react';
import { SemanticAnalysis } from '../../types';

interface ChatResultProps {
    analysis: SemanticAnalysis;
    onOpenHistory: () => void;
    onSave: () => void;
    isSaved: boolean;
}

const cleanString = (str: string) => str.replace(/[*_~`]/g, '');

const ChatResult: React.FC<ChatResultProps> = ({ analysis, onOpenHistory, onSave, isSaved }) => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#11141d] relative">
            <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b-4 border-black shrink-0 bg-yellow-400 z-30 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-2 text-black text-[10px] font-black uppercase tracking-widest bg-white px-3 py-1 border-2 border-black rotate-1 shadow-[2px_2px_0px_0px_#000]">
                    <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => onOpenHistory()}>HISTORY</span>
                    <span className="material-symbols-outlined text-xs font-bold">chevron_right</span>
                    <span className="text-black">CHAT</span>
                </div>
                <button
                    onClick={onSave}
                    disabled={isSaved}
                    className={`h-10 px-6 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border-3 border-black shadow-[4px_4px_0px_0px_#000] ${isSaved ? 'bg-gray-100 text-gray-400 border-gray-400 shadow-none' : 'bg-green-500 text-white hover:bg-green-400 hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000]'
                        }`}
                >
                    <span className="material-symbols-outlined text-sm font-bold">{isSaved ? 'check_circle' : 'bookmark_add'}</span>
                    {isSaved ? 'SAVED' : 'SAVE!'}
                </button>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* User Input Section */}
                    <div className="flex gap-4 items-start flex-row-reverse">
                        <div className="size-12 rounded-full bg-blue-500 border-3 border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#000]">
                            <span className="material-symbols-outlined text-white text-2xl">person</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl rounded-tr-none border-3 border-black shadow-[6px_6px_0px_0px_#000]">
                            <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2 border-b-2 border-dashed border-gray-200 pb-1">USER QUERY</p>
                            <p className="text-lg text-black font-bold leading-relaxed font-display">"{analysis.term}"</p>
                            {analysis.context && analysis.context !== "General Context" && (
                                <p className="mt-2 text-xs text-gray-500 font-bold italic bg-gray-100 p-2 rounded border border-gray-300">Context: {analysis.context}</p>
                            )}
                        </div>
                    </div>

                    {/* AI Response Section */}
                    <div className="flex gap-4 items-start">
                        <div className="size-12 rounded-full bg-yellow-400 border-3 border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#000]">
                            <span className="material-symbols-outlined text-black text-2xl font-black">smart_toy</span>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="bg-white p-8 rounded-2xl rounded-tl-none border-3 border-black shadow-[8px_8px_0px_0px_#000] relative">
                                <div className="absolute -top-3 left-0 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 border-2 border-black rotate-2 shadow-[2px_2px_0px_0px_#000]">Origin Story</div>
                                <div className="prose prose-sm max-w-none mt-2">
                                    <p className="text-lg text-black leading-8 whitespace-pre-wrap font-medium font-serif">
                                        {cleanString(analysis.originStory)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatResult;
