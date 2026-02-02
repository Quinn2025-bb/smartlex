import React from 'react';
import { SemanticAnalysis } from '../../types';

interface PragmaticsProps {
    analysis: SemanticAnalysis;
}

const cleanString = (str: string) => str.replace(/[*_~`]/g, '');

const Pragmatics: React.FC<PragmaticsProps> = ({ analysis }) => {
    return (
        <div className="md:col-span-5 bg-white p-8 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 bg-yellow-400 border-l-2 border-b-2 border-black rounded-bl-xl">
                <span className="material-symbols-outlined text-black">psychology</span>
            </div>
            <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-6 flex items-center gap-2 border-b-2 border-black pb-2 mr-10">
                语用分析 (PRAGMATICS)
            </h3>
            <div className="space-y-5 flex-1">
                <div className="flex items-center gap-4 group">
                    <div className="size-12 rounded-xl bg-blue-500 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] group-hover:translate-x-1 transition-transform">
                        <span className="material-symbols-outlined text-white text-xl font-black">settings_voice</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-black uppercase tracking-widest bg-yellow-300 px-1 inline-block border border-black mb-1 transform -rotate-1">语气 (TONE)</p>
                        <p className="text-lg font-black text-black italic">{cleanString(analysis.pragmatics.tone)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="size-12 rounded-xl bg-red-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] group-hover:translate-x-1 transition-transform">
                        <span className="material-symbols-outlined text-white text-xl font-black">stairs</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-black uppercase tracking-widest bg-green-400 px-1 inline-block border border-black mb-1 transform rotate-1">语域 (REGISTER)</p>
                        <p className="text-lg font-black text-black italic">{cleanString(analysis.pragmatics.register)}</p>
                    </div>
                </div>
                <div className="pt-4 border-t-2 border-dashed border-gray-300 mt-2">
                    <p className="text-sm text-black leading-relaxed font-bold border-l-4 border-black pl-3 bg-gray-50 py-2">
                        {cleanString(analysis.pragmatics.nuance_cn)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Pragmatics;
