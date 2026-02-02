
import React from 'react';

interface SidebarProps {
  currentView: number;
  setView: (view: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  // Mapping based on View enum: HOME: 0, HISTORY: 1, LIBRARY: 2, SETTINGS: 3
  const navItems = [
    { id: 0, icon: 'home', label: '首页' },
    { id: 2, icon: 'menu_book', label: '知识库' },
  ];

  return (
    <aside className="w-16 md:w-20 lg:w-64 flex flex-col items-center lg:items-stretch py-8 bg-white dark:bg-gray-900 border-r-4 border-black dark:border-white shrink-0 transition-all z-20">
      <div className="flex items-center gap-3 px-4 mb-10 overflow-hidden cursor-pointer group" onClick={() => setView(0)}>
        <div className="size-12 bg-primary flex items-center justify-center rounded-xl text-white border-3 border-black shadow-[4px_4px_0px_0px_#000] shrink-0 group-hover:-translate-y-1 transition-transform">
          <span className="material-symbols-outlined text-3xl font-black">lens_blur</span>
        </div>
        <div className="hidden lg:block truncate">
          <h1 className="font-display text-2xl font-black italic tracking-tighter text-black dark:text-white drop-shadow-sm">SMARTLEX</h1>
          <p className="text-[10px] uppercase tracking-widest text-black bg-yellow-400 inline-block px-1 border border-black font-bold -rotate-2">Knowledge Engine</p>
        </div>
      </div>

      <nav className="flex flex-col gap-4 w-full px-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all group border-3 font-bold ${currentView === item.id
              ? 'bg-blue-500 text-white border-black shadow-[4px_4px_0px_0px_#000] -translate-y-1'
              : 'bg-white text-black border-transparent hover:border-black hover:bg-yellow-300 hover:shadow-[2px_2px_0px_0px_#000] dark:bg-transparent dark:text-white dark:hover:text-black'
              }`}
          >
            <span className={`material-symbols-outlined text-2xl ${currentView === item.id ? 'fill-[1]' : ''}`}>
              {item.icon}
            </span>
            <span className="hidden lg:block text-sm uppercase tracking-wide">{item.label}</span>
          </button>
        ))}

        <div className="my-4 border-t-4 border-black dark:border-white border-dashed mx-2 opacity-20"></div>

        <button
          onClick={() => setView(3)} // Settings ID is now 3 based on updated enum
          className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all group border-3 font-bold ${currentView === 3
            ? 'bg-blue-500 text-white border-black shadow-[4px_4px_0px_0px_#000] -translate-y-1'
            : 'bg-white text-black border-transparent hover:border-black hover:bg-yellow-300 hover:shadow-[2px_2px_0px_0px_#000] dark:bg-transparent dark:text-white dark:hover:text-black'
            }`}
        >
          <span className="material-symbols-outlined text-2xl">settings</span>
          <span className="hidden lg:block text-sm uppercase tracking-wide">设置</span>
        </button>
      </nav>

      <div className="mt-auto px-4 w-full">
      </div>
    </aside>
  );
};

export default Sidebar;
