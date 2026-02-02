
import React, { useState } from 'react';
import { SemanticAnalysis } from '../types';

import { useStore } from '../contexts/StoreContext';

interface HistoryListProps {
  onSelectItem: (item: SemanticAnalysis) => void;
  onClose: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ onSelectItem, onClose }) => {
  const { history, setHistory } = useStore();
  const [search, setSearch] = useState('');

  const onClear = () => setHistory([]);

  const items = history;

  const filteredItems = items.filter(item => {
    return item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.semanticCore.en.toLowerCase().includes(search.toLowerCase()) ||
      item.partOfSpeech.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      <header className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button
            onClick={onClose}
            className="size-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="font-technical text-2xl font-bold tracking-tight">Analysis History</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Retracing your semantic footsteps</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-lg group-focus-within:text-primary transition-colors">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Query history..."
              type="text"
            />
          </div>
          {items.length > 0 && (
            <button
              onClick={onClear}
              className="px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            >
              Clear Log
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 font-technical italic gap-4 opacity-50">
            <span className="material-symbols-outlined text-6xl">history</span>
            <p>No analysis history available.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="group flex items-center gap-6 bg-white dark:bg-gray-900 border border-gray-50 dark:border-gray-800 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30 cursor-pointer active:scale-[0.99]"
              >
                <div className="size-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-primary/60 group-hover:text-primary transition-colors shrink-0">
                  <span className="material-symbols-outlined text-xl font-bold">
                    {item.type === 'Metaphor' ? 'schema' : item.type === 'Idiom' ? 'format_quote' : 'psychology'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-technical text-lg font-bold truncate group-hover:text-primary transition-colors">{item.term}</h3>
                    <span className="text-[10px] text-accent-gold font-bold italic tracking-tighter uppercase">{item.partOfSpeech}</span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1 italic">"{item.semanticCore.en}"</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                    {new Date(item.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-[10px] text-gray-300 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <span className="material-symbols-outlined text-gray-200 group-hover:text-primary transition-colors">chevron_right</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryList;
