
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { useToast } from '../contexts/ToastContext';

import { useStore } from '../contexts/StoreContext';

interface SettingsProps { }

const Settings: React.FC<SettingsProps> = () => {
  const { showToast } = useToast();
  const { library, history, clearData } = useStore();

  // State
  const [doubaoEndpoint, setDoubaoEndpoint] = useState(localStorage.getItem('smartlex_doubao_endpoint') || localStorage.getItem('smartlex_model_endpoint') || '');
  const [apiKey, setApiKey] = useState(localStorage.getItem('smartlex_api_key') || '');
  const [selectedPreset, setSelectedPreset] = useState('custom');

  const DOUBAO_OPTIONS = [
    { id: 'doubao-custom', name: '自定义配置 (Custom Endpoint)', endpoint: '', provider: 'doubao' },
    { id: 'doubao-1.8', name: 'Doubao 1.8 Pro (Latest)', endpoint: 'doubao-seed-1-8-251228', provider: 'doubao' },
    { id: 'doubao-1.6-flash', name: 'Doubao 1.6 Flash (Multimodal)', endpoint: 'doubao-seed-1-6-flash-250828', provider: 'doubao' },
    { id: 'doubao-1.6-lite', name: 'Doubao 1.6 Lite (Fastest)', endpoint: 'doubao-seed-1-6-lite-251015', provider: 'doubao' },
  ];

  useEffect(() => {
    // Detect if current values match a preset
    const match = DOUBAO_OPTIONS.find(opt => opt.id !== 'doubao-custom' && opt.endpoint === doubaoEndpoint);
    setSelectedPreset(match ? match.id : 'doubao-custom');
  }, [doubaoEndpoint]);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPresetId = e.target.value;
    setSelectedPreset(newPresetId);

    const preset = DOUBAO_OPTIONS.find(p => p.id === newPresetId);
    if (preset && preset.id !== 'doubao-custom') {
      updateDoubaoSettings(preset.endpoint, apiKey);
    }
  };

  const updateDoubaoSettings = (ep: string, key: string) => {
    setDoubaoEndpoint(ep);
    setApiKey(key);
    localStorage.setItem('smartlex_doubao_endpoint', ep);
    localStorage.setItem('smartlex_api_key', key);
    // Ensure provider is set to doubao just in case
    localStorage.setItem('smartlex_provider', 'doubao');

    if (ep) showToast('Doubao 配置已更新', 'success');
  };

  const handleClearData = async () => {
    if (window.confirm('确定要清除所有本地数据吗？此操作无法撤销。')) {
      try {
        clearData(); // Uses store action
        showToast('所有数据已清除', 'success');
      } catch (error) {
        console.error('Failed to clear data:', error);
        showToast('清除数据失败', 'error');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f8f9fa] dark:bg-[#0d1017]">
      <header className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="font-technical text-2xl font-bold tracking-tight text-gray-900 dark:text-white">设置</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            配置与数据管理
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* AI Configuration Section */}
          <section className="bg-white dark:bg-[#1a1e26] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI 模型配置</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">选择并配置您的 AI 提供商</p>
              </div>
            </div>

            <div className="space-y-6">

              {/* Doubao Configuration */}
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    选择模型预设
                  </label>
                  <select
                    value={selectedPreset}
                    onChange={handlePresetChange}
                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-indigo-500/20 rounded-xl px-4 py-2 text-sm focus:bg-white dark:focus:bg-gray-800 transition-all outline-none cursor-pointer"
                  >
                    {DOUBAO_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl space-y-3 border border-gray-100 dark:border-gray-800/50">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Doubao Endpoint ID (Ark)
                    </label>
                    <input
                      type="text"
                      value={doubaoEndpoint}
                      onChange={(e) => updateDoubaoSettings(e.target.value, apiKey)}
                      placeholder="例如: ep-20251015..."
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 transition-all outline-none font-mono"
                      disabled={selectedPreset !== 'doubao-custom'}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Doubao API Key
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => updateDoubaoSettings(doubaoEndpoint, e.target.value)}
                      placeholder="Key..."
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 transition-all outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Data Management Section */}
          <section className="bg-white dark:bg-[#1a1e26] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">database</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">数据管理</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">管理您的本地知识库数据</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                <div>
                  <h4 className="text-sm font-bold text-red-600 dark:text-red-400">危险区域：清除数据</h4>
                  <p className="text-xs text-red-400/70 mt-1">永久删除本地存储的所有数据，无法恢复</p>
                </div>
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  清除所有数据
                </button>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="bg-white dark:bg-[#1a1e26] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                <span className="material-symbols-outlined">info</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">关于 SmartLex</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">版本与版权信息</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300">当前版本</span>
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono font-bold text-gray-700 dark:text-gray-200">v0.1.4 (Beta)</span>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-xs text-gray-500 leading-relaxed text-center">
                  SmartLex is designed for deep semantic analysis and personal knowledge management.
                  <br />
                  Built with React 19, Tauri v2, and Tailwind CSS v4.
                </p>
                <p className="text-[10px] text-gray-400 text-center mt-4 uppercase tracking-widest font-bold">
                  © 2026 SmartLex Team
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Settings;
