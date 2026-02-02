import React, { useState } from 'react';
import { SemanticAnalysis } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface LinguisticNetworkProps {
    analysis: SemanticAnalysis;
    onUpdate: (updated: SemanticAnalysis) => void;
}

const cleanString = (str: string) => str.replace(/[*_~`]/g, '');

const LinguisticNetwork: React.FC<LinguisticNetworkProps> = ({ analysis, onUpdate }) => {
    const { showToast } = useToast();
    const [newSynonym, setNewSynonym] = useState('');

    const handleAddSynonym = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSynonym.trim()) return;
        const updated = {
            ...analysis,
            synonyms: [...new Set([...analysis.synonyms, newSynonym.trim()])]
        };
        onUpdate(updated);
        setNewSynonym('');
        showToast('近义词已添加', 'success');
    };

    const handleRemoveSynonym = (syn: string) => {
        const updated = {
            ...analysis,
            synonyms: analysis.synonyms.filter(s => s !== syn)
        };
        onUpdate(updated);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white p-8 rounded-xl border-3 border-black shadow-[6px_6px_0px_0px_#000] relative">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-blue-500 border-2 border-black text-white text-[10px] font-black uppercase tracking-widest rotate-1 shadow-[2px_2px_0px_0px_#000]">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm font-black">hub</span> 语义网络 (SEMANTICS)</span>
                </div>
                <div className="flex flex-wrap gap-3 mb-6 mt-2 min-h-[40px]">
                    {analysis.synonyms.map((syn, i) => (
                        <span key={i} className="group px-3 py-2 bg-white text-black rounded-lg text-xs font-black border-2 border-black flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] transition-all">
                            {cleanString(syn)}
                            <button onClick={() => handleRemoveSynonym(syn)} className="material-symbols-outlined text-[12px] text-gray-400 hover:text-red-500 transition-colors print:hidden font-black">close</button>
                        </span>
                    ))}
                </div>
                <form onSubmit={handleAddSynonym} className="flex gap-2 print:hidden border-t-2 border-dashed border-gray-200 pt-4">
                    <input
                        value={newSynonym}
                        onChange={(e) => setNewSynonym(e.target.value)}
                        placeholder="添加近义词..."
                        className="flex-1 bg-gray-50 border-2 border-black rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] font-bold"
                    />
                    <button type="submit" className="size-9 flex items-center justify-center bg-green-400 text-black border-2 border-black rounded-lg hover:bg-green-300 transition-all shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 active:shadow-none">
                        <span className="material-symbols-outlined text-sm font-black">add</span>
                    </button>
                </form>
            </section>

            <section className="bg-white p-8 rounded-xl border-3 border-black shadow-[6px_6px_0px_0px_#000] relative">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-red-400 border-2 border-black text-white text-[10px] font-black uppercase tracking-widest -rotate-1 shadow-[2px_2px_0px_0px_#000]">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm font-black">link</span> 强搭配 (COLLOCATIONS)</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.collocations.map((coll, i) => (
                        <span key={i} className="px-3 py-2 bg-yellow-300 text-black rounded-lg text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transform hover:rotate-1 transition-transform">
                            {cleanString(coll)}
                        </span>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LinguisticNetwork;
