import React from 'react';
import { SemanticAnalysis } from '../../types';

interface SemanticCoreProps {
    analysis: SemanticAnalysis;
}

const cleanString = (str: string) => str.replace(/[*_~`]/g, '');

const SemanticCore: React.FC<SemanticCoreProps> = ({ analysis }) => {
    return (
        <div className="md:col-span-12 lg:col-span-7 bg-white dark:bg-[#1a1e26] p-6 lg:p-8 rounded-[2rem] border-3 border-black shadow-[8px_8px_0px_0px_#000]">
            <h3 className="text-xs font-black text-black uppercase tracking-widest mb-6 flex items-center gap-2 bg-yellow-400 w-fit px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] -rotate-1">
                <span className="material-symbols-outlined text-sm font-bold">token</span> 语义核心 (CORE)
            </h3>
            <div className="space-y-8">
                {/* 1. Original Definition */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black bg-white border-2 border-black text-black px-2 py-0.5 inline-block uppercase tracking-widest shadow-[2px_2px_0px_0px_#ccc]">原始释义 (ORIGINAL)</span>
                    </div>
                    <p className="text-xl text-black dark:text-gray-100 font-bold leading-relaxed font-display border-l-4 border-black pl-4">"{cleanString(analysis.semanticCore.en)}"</p>
                    {analysis.semanticCore.cn_definition && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-bold italic ml-5">-- {cleanString(analysis.semanticCore.cn_definition)}</p>
                    )}
                </div>

                {/* 2. Contextual Meaning (Highlighted) */}
                <div className="pl-6 border-l-4 border-black relative">
                    <div className="absolute -left-[5px] top-0 w-3 h-3 bg-black rounded-full"></div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black bg-blue-500 text-white px-2 py-0.5 inline-block uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000] rotate-1">语境含义 (CONTEXTUAL)</span>
                    </div>
                    {analysis.semanticCore.contextualMeaning ? (
                        <div className="bg-blue-50 p-4 border-2 border-black rounded-xl border-dashed">
                            <p className="text-xl text-black dark:text-gray-100 font-black leading-relaxed mb-1">
                                {cleanString(analysis.semanticCore.contextualMeaning.en)}
                            </p>
                            <p className="text-sm text-blue-600 font-bold italic">
                                {cleanString(analysis.semanticCore.contextualMeaning.cn)}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic font-bold">No specific contextual variation detected.</p>
                    )}
                </div>

                {/* 3. Direct Translation */}
                <div>
                    <span className="text-[10px] font-black bg-green-500 text-white border-2 border-black px-2 py-0.5 mb-2 inline-block uppercase tracking-widest shadow-[2px_2px_0px_0px_#000] -rotate-1">通用对应词 (TRANSLATION)</span>
                    <p className="text-2xl text-black dark:text-gray-100 font-black leading-relaxed font-display mt-1">{cleanString(analysis.semanticCore.cn)}</p>
                </div>
            </div>
        </div>
    );
};

export default SemanticCore;
