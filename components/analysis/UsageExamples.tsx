import React, { useState } from 'react';
import { SemanticAnalysis } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { generateMoreExamples } from '../../geminiService';

interface UsageExamplesProps {
    analysis: SemanticAnalysis;
    onUpdate: (updated: SemanticAnalysis) => void;
}

const cleanString = (str: string) => str.replace(/[*_~`]/g, '');

const UsageExamples: React.FC<UsageExamplesProps> = ({ analysis, onUpdate }) => {
    const { showToast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAddingExample, setIsAddingExample] = useState(false);
    const [newEx, setNewEx] = useState({ en: '', cn: '', category: 'General' });

    const handleGenerateMore = async () => {
        setIsGenerating(true);
        try {
            const more = await generateMoreExamples(analysis.term, analysis.context);
            const updated = {
                ...analysis,
                usageExamples: [...analysis.usageExamples, ...more]
            };
            onUpdate(updated);
            showToast('AI 已成功生成更多例句', 'success');
        } catch (err) {
            console.error(err);
            showToast("AI 生成失败，请重试", 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddCustomExample = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEx.en || !newEx.cn) return;
        const updated = {
            ...analysis,
            usageExamples: [...analysis.usageExamples, { ...newEx }]
        };
        onUpdate(updated);
        setNewEx({ en: '', cn: '', category: 'General' });
        setIsAddingExample(false);
        showToast('自定义例句已添加', 'success');
    };

    const handleRemoveExample = (index: number) => {
        const updated = {
            ...analysis,
            usageExamples: analysis.usageExamples.filter((_, i) => i !== index)
        };
        onUpdate(updated);
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between px-4 border-b-4 border-black pb-4 bg-yellow-400 p-4 -mx-4 mb-6 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)]">
                <h3 className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-black text-lg">explore</span> 用法探索 (EXAMPLES)
                </h3>
                <div className="flex items-center gap-2 print:hidden">
                    <button
                        onClick={handleGenerateMore}
                        disabled={isGenerating}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-none"
                    >
                        <span className={`material-symbols-outlined text-sm ${isGenerating ? 'animate-spin' : ''}`}>auto_awesome</span>
                        <span className="ml-1">{isGenerating ? 'GENERATING...' : 'AI 扩展'}</span>
                    </button>
                    <button
                        onClick={() => setIsAddingExample(!isAddingExample)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-none"
                    >
                        <span className="material-symbols-outlined text-sm font-black">add_circle</span> 自定义
                    </button>
                </div>
            </div>

            {isAddingExample && (
                <form onSubmit={handleAddCustomExample} className="bg-white border-3 border-black p-6 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-300 print:hidden shadow-[4px_4px_0px_0px_#000] mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-black uppercase ml-1 bg-yellow-300 inline-block px-1 border border-black rotate-1">Example (EN)</label>
                            <input
                                placeholder="输入英文例句..."
                                className="w-full bg-white border-2 border-black rounded-lg text-sm py-3 px-4 focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] font-bold"
                                value={newEx.en}
                                onChange={(e) => setNewEx({ ...newEx, en: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-black uppercase ml-1 bg-green-300 inline-block px-1 border border-black -rotate-1">Translation (CN)</label>
                            <input
                                placeholder="输入中文翻译..."
                                className="w-full bg-white border-2 border-black rounded-lg text-sm py-3 px-4 focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] font-bold"
                                value={newEx.cn}
                                onChange={(e) => setNewEx({ ...newEx, cn: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <select
                            value={newEx.category}
                            onChange={(e) => setNewEx({ ...newEx, category: e.target.value })}
                            className="bg-white border-2 border-black rounded-lg text-xs py-2 px-4 font-black shadow-[2px_2px_0px_0px_#000]"
                        >
                            <option value="General">通用</option>
                            <option value="Business">商务</option>
                            <option value="Literary">文学</option>
                            <option value="Slang">俚语</option>
                            <option value="Academic">学术</option>
                        </select>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setIsAddingExample(false)} className="px-4 py-2 text-xs font-black text-black hover:underline uppercase">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-black text-white rounded-lg text-xs font-black shadow-[2px_2px_0px_0px_#888] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#888] uppercase border-2 border-transparent transition-all">Add Example</button>
                        </div>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.usageExamples.map((ex, i) => (
                    <div key={i} className="group bg-white p-6 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all hover:-translate-y-1 relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-black uppercase bg-white border-2 border-black px-2 py-1 rounded shadow-[2px_2px_0px_0px_#ccc] tracking-widest">{ex.category}</span>
                            </div>
                            <button onClick={() => handleRemoveExample(i)} className="opacity-0 group-hover:opacity-100 material-symbols-outlined text-black hover:text-red-600 text-lg transition-all print:hidden font-bold">delete</button>
                        </div>
                        <p className="text-black font-black text-base mb-4 leading-relaxed font-serif">"{cleanString(ex.en)}"</p>
                        <p className="text-sm text-gray-700 italic border-t-2 border-dashed border-gray-300 pt-4 font-bold">{cleanString(ex.cn)}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default UsageExamples;
