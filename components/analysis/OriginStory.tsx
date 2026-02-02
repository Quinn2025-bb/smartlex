import React from 'react';
import { SemanticAnalysis } from '../../types';

interface OriginStoryProps {
    analysis: SemanticAnalysis;
}

const cleanString = (str: string) => str.replace(/[*_~`]/g, '');

const OriginStory: React.FC<OriginStoryProps> = ({ analysis }) => {
    return (
        <section className="bg-white p-8 rounded-xl border-3 border-black shadow-[6px_6px_0px_0px_#000] relative">
            <div className="absolute -top-3 right-6 px-3 py-1 bg-black text-white border-2 border-white text-[10px] font-black uppercase tracking-widest rotate-2 shadow-[2px_2px_0px_0px_#000]">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">history_edu</span> 词源 (ORIGINS)</span>
            </div>
            <p className="text-lg text-black leading-relaxed font-bold font-serif mt-2 border-l-4 border-gray-300 pl-4 bg-gray-50 py-4 pr-4">
                {cleanString(analysis.originStory)}
            </p>
        </section>
    );
};

export default OriginStory;
