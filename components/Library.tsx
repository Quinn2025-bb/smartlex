import React, { useState, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { SemanticAnalysis } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useStore } from '../contexts/StoreContext';
import { storageService } from '../services/storageService';

interface KnowledgeLibraryProps {
  onSelectItem: (item: SemanticAnalysis) => void;
  onOpenHistory: () => void;
}

const KnowledgeLibrary: React.FC<KnowledgeLibraryProps> = ({
  onSelectItem, onOpenHistory
}) => {
  const { library, history, updateAnalysis, customFileName, linkCustomFile, importWorkspace, deleteFromLibrary } = useStore();
  const { showToast } = useToast();

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isManagingTags, setIsManagingTags] = useState<string | null>(null); // item.id
  const [newTagInput, setNewTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    library.forEach(item => item.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [library]);

  const filteredItems = library.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.semanticCore.en.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || item.type === filter;
    const matchesTag = !selectedTag || item.tags.includes(selectedTag);
    return matchesSearch && matchesFilter && matchesTag;
  });

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个知识资产吗？')) {
      deleteFromLibrary(id);
    }
  };

  const handleAddTag = (item: SemanticAnalysis) => {
    if (!newTagInput.trim()) return;
    const updated = {
      ...item,
      tags: [...new Set([...item.tags, newTagInput.trim()])]
    };
    updateAnalysis(updated);
    setNewTagInput('');
    showToast('标签已添加', 'success');
  };

  const handleRemoveTag = (item: SemanticAnalysis, tagToRemove: string) => {
    const updated = {
      ...item,
      tags: item.tags.filter(t => t !== tagToRemove)
    };
    updateAnalysis(updated);
  };

  const handleCardTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    setSelectedTag(tag);
    // Smooth scroll to top
    const content = document.getElementById('library-content');
    if (content) content.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onExport = () => {
    storageService.exportToFile(library, history);
    showToast('备份文件已下载', 'success');
  };

  const handleExportPDF = async () => {
    // 隐藏导出菜单，防止被截图
    const exportMenu = document.querySelector('.group\\/export .absolute');
    if (exportMenu) (exportMenu as HTMLElement).style.display = 'none';

    const element = document.getElementById('library-content');
    if (!element) return;

    try {
      showToast('正在生成 PDF...', 'info');
      // 1. 克隆节点以避免影响当前界面
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      clone.style.width = `${element.offsetWidth}px`;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      // 强制背景色，防止透明
      clone.style.background = '#ffffff';
      // 移除 Masonry 布局导致的重叠问题，改为简单的 Grid
      const grid = clone.querySelector('.masonry-grid');
      if (grid) {
        (grid as HTMLElement).style.display = 'flex';
        (grid as HTMLElement).style.flexWrap = 'wrap';
        (grid as HTMLElement).style.gap = '24px';
      }
      const items = clone.querySelectorAll('.masonry-item');
      items.forEach((item) => {
        (item as HTMLElement).style.width = 'calc(33.333% - 16px)';
        (item as HTMLElement).style.marginBottom = '0';
      });

      document.body.appendChild(clone);

      // 等待图片加载
      await new Promise(resolve => setTimeout(resolve, 1000)); // 增加等待时间到 1s

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: true, // 开启日志方便调试
        backgroundColor: '#ffffff',
        width: element.scrollWidth, // 显式指定宽度
        height: clone.scrollHeight, // 显式指定高度
        windowWidth: element.scrollWidth,
        windowHeight: clone.scrollHeight
      });

      document.body.removeChild(clone);
      if (exportMenu) (exportMenu as HTMLElement).style.display = '';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`SmartLex_Library_${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('PDF 下载成功', 'success');
    } catch (error) {
      console.error('PDF generation failed', error);
      showToast('PDF 生成失败', 'error');
      if (exportMenu) (exportMenu as HTMLElement).style.display = '';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="p-6 lg:p-8 bg-white border-b-4 border-black">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-4xl font-black tracking-tighter text-black italic drop-shadow-[2px_2px_0_#FFF] stroke-black text-stroke-1">知识库</h2>
            <p className="text-[10px] text-white bg-black inline-block px-2 py-1 font-bold uppercase tracking-widest mt-1 -rotate-1 shadow-[2px_2px_0px_0px_#ccc]">
              {customFileName ? `已同步: ${customFileName}` : '本地工作区'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={linkCustomFile}
              className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000] ${customFileName
                ? 'bg-green-400 text-black'
                : 'bg-white text-black hover:bg-yellow-300'
                }`}
            >
              <span className="material-symbols-outlined text-lg font-bold">{customFileName ? 'cloud_done' : 'attachment'}</span>
              {customFileName ? '已链接' : '选择路径'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-black transition-colors text-lg font-bold">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-3 border-black rounded-xl focus:outline-none focus:shadow-[6px_6px_0px_0px_#000] focus:-translate-y-1 transition-all text-sm font-bold placeholder-gray-400"
                placeholder="搜索知识库..."
                type="text"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {['All', 'Metaphor', 'Idiom', 'Word', 'Slang', 'Term'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-all border-3 border-black ${filter === t ? 'bg-blue-500 text-white shadow-[4px_4px_0px_0px_#000] -translate-y-0.5' : 'bg-white text-black hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_#000]'
                    }`}
                >
                  {t === 'All' ? '全部' : t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Cloud Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center mt-2 border-t-2 border-black border-dashed pt-4 opacity-80">
              <span className="text-[10px] font-black uppercase tracking-widest text-black mr-2 flex items-center gap-1 bg-yellow-300 px-2 border-2 border-black -rotate-2">
                <span className="material-symbols-outlined text-xs">sell</span> 标签:
              </span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all border-2 border-black ${!selectedTag ? 'bg-black text-white shadow-[2px_2px_0px_0px_#ccc]' : 'bg-white text-black hover:bg-gray-200'}`}
              >
                清除
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all flex items-center gap-1 border-2 border-black ${tag === selectedTag
                    ? 'bg-blue-500 text-white shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-white text-black hover:bg-blue-100'
                    }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" id="library-content">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 font-technical italic gap-4">
            <span className="material-symbols-outlined text-7xl opacity-10">inventory_2</span>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-400">未找到匹配项</p>
            </div>
            {selectedTag && (
              <button onClick={() => setSelectedTag(null)} className="text-blue-500 text-xs font-bold underline bg-white px-2 border border-blue-500">显示全部</button>
            )}
          </div>
        ) : (
          <div className="masonry-grid">
            {filteredItems.map(item => (
              <div key={item.id} className="masonry-item group relative">
                <div
                  className="bg-white border-3 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_#000] transition-all hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 hover:rotate-1 flex flex-col cursor-pointer"
                  onClick={() => onSelectItem(item)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 bg-yellow-300 text-black border-2 border-black text-[9px] font-black uppercase rounded shadow-[2px_2px_0px_0px_#000]">{item.type}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsManagingTags(isManagingTags === item.id ? null : item.id);
                        }}
                        className="size-8 rounded flex items-center justify-center text-black border-2 border-transparent hover:border-black hover:bg-gray-100 transition-all"
                        title="管理标签"
                      >
                        <span className="material-symbols-outlined text-lg">label_important</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteItem(e, item.id)}
                        className="size-8 rounded flex items-center justify-center text-black hover:text-red-500 hover:bg-red-50 border-2 border-transparent hover:border-black transition-all opacity-0 group-hover:opacity-100"
                        title="删除资产"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                  <h3 className="font-display text-2xl font-black text-black mb-2 tracking-tighter uppercase">{item.term}</h3>
                  <p className="text-xs text-black font-medium line-clamp-2 leading-relaxed italic mb-5 border-l-4 border-gray-300 pl-2">"{item.semanticCore.en}"</p>

                  {/* Item Tags with click-to-filter */}
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {item.tags.map(tag => (
                      <span
                        key={tag}
                        onClick={(e) => handleCardTagClick(e, tag)}
                        className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black border border-blue-200 hover:border-black hover:bg-blue-100 transition-all uppercase"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200 flex items-center gap-1.5 text-[9px] text-gray-400 font-mono">
                    <span className="material-symbols-outlined text-[10px]">schedule</span>
                    <span className="font-bold">{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Tag Management Overlay */}
                {isManagingTags === item.id && (
                  <div className="absolute inset-x-0 bottom-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-md p-5 rounded-b-[1.5rem] border-t border-gray-100 dark:border-gray-800 shadow-2xl z-10 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">edit_note</span> 管理标签
                      </span>
                      <button onClick={() => setIsManagingTags(null)} className="material-symbols-outlined text-sm text-black hover:text-red-500">close</button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-5 max-h-24 overflow-y-auto custom-scrollbar">
                      {item.tags.map(t => (
                        <span key={t} className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg group/tag">
                          {t}
                          <button onClick={() => handleRemoveTag(item, t)} className="material-symbols-outlined text-[12px] opacity-40 hover:opacity-100 hover:text-red-500">cancel</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag(item)}
                        placeholder="添加新标签..."
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-xs py-2 px-4 focus:ring-1 focus:ring-primary/30 shadow-inner"
                      />
                      <button
                        onClick={() => handleAddTag(item)}
                        className="bg-primary text-white size-9 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeLibrary;
