import React, { useState } from 'react';
import { SemanticAnalysis } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface ResultHeaderProps {
    analysis: SemanticAnalysis;
    onUpdate: (updated: SemanticAnalysis) => void;
}

const ResultHeader: React.FC<ResultHeaderProps> = ({ analysis, onUpdate }) => {
    const { showToast } = useToast();
    const [newTag, setNewTag] = useState('');

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTag.trim()) return;
        const updated = {
            ...analysis,
            tags: [...new Set([...analysis.tags, newTag.trim()])]
        };
        onUpdate(updated);
        setNewTag('');
        showToast('标签已添加', 'success');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const updated = {
            ...analysis,
            tags: analysis.tags.filter(t => t !== tagToRemove)
        };
        onUpdate(updated);
    };

    return (
        <section className="relative">
            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-red-500 text-white border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#000] -rotate-1">{analysis.type}</span>
                    <span className="bg-blue-400 text-white border-2 border-black px-3 py-1 text-[10px] font-black uppercase italic shadow-[2px_2px_0px_0px_#000] rotate-1">{analysis.partOfSpeech}</span>
                </div>

                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <h1 className="text-6xl lg:text-8xl font-display font-black tracking-tighter text-black dark:text-white break-words drop-shadow-[4px_4px_0_#3B82F6] stroke-black text-stroke-2">
                        {analysis.term.toUpperCase()}
                    </h1>
                    {analysis.rootForm && analysis.rootForm.toLowerCase() !== analysis.term.toLowerCase() && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_#000]">
                            <span className="material-symbols-outlined text-lg">conversion_path</span>
                            <span className="text-xs font-black uppercase tracking-widest">Root: <span className="underline decoration-4 underline-offset-4">{analysis.rootForm}</span></span>
                        </div>
                    )}
                </div>

                {/* Tags Management Section */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t-2 border-black border-dashed print:hidden">
                    <span className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-1.5 mr-2 bg-white border border-black px-2 py-1 shadow-[2px_2px_0px_0px_#ccc]">
                        <span className="material-symbols-outlined text-sm">sell</span> Tags
                    </span>
                    {analysis.tags.map((tag, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-black border border-black text-[10px] font-bold group hover:bg-yellow-200 transition-colors shadow-[2px_2px_0px_0px_#000]">
                            #{tag}
                            <button onClick={() => handleRemoveTag(tag)} className="opacity-40 group-hover:opacity-100 material-symbols-outlined text-[12px] hover:text-red-600 transition-all font-bold">cancel</button>
                        </span>
                    ))}
                    <form onSubmit={handleAddTag} className="flex items-center gap-2">
                        <input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="NEW TAG..."
                            className="w-28 bg-white border-2 border-black text-[10px] py-1.5 px-3 font-bold uppercase shadow-[2px_2px_0px_0px_#ccc] focus:shadow-[4px_4px_0px_0px_#000] focus:-translate-y-0.5 transition-all outline-none"
                        />
                        <button type="submit" className="material-symbols-outlined text-black hover:text-blue-600 text-xl font-bold bg-white border-2 border-black p-0.5 shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] transition-all">add</button>
                    </form>
                </div>

                <div className="p-6 bg-white dark:bg-gray-800 border-3 border-black shadow-[6px_6px_0px_0px_#000] relative mt-2">
                    <div className="absolute -top-3 left-6 bg-white border-x-3 border-t-3 border-black px-2 py-0 text-[10px] font-black uppercase tracking-widest">Context Info</div>
                    <p className="text-base italic text-black dark:text-gray-200 leading-relaxed font-bold font-display">"{analysis.context}"</p>
                </div>
            </div>
        </section>
    );
};

export default ResultHeader;
