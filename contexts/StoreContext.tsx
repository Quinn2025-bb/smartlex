import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SemanticAnalysis } from '../types';
import { storageService } from '../services/storageService';
import { useToast } from './ToastContext';
import { useDebounce } from '../hooks/useDebounce';

interface StoreContextType {
    library: SemanticAnalysis[];
    history: SemanticAnalysis[];
    currentAnalysis: SemanticAnalysis | null;
    lastSaved: string | null;
    customFileName: string | null;

    // Actions
    setLibrary: React.Dispatch<React.SetStateAction<SemanticAnalysis[]>>;
    setHistory: React.Dispatch<React.SetStateAction<SemanticAnalysis[]>>;
    setCurrentAnalysis: (analysis: SemanticAnalysis | null) => void;

    addToLibrary: (item: SemanticAnalysis) => void;
    updateAnalysis: (updatedItem: SemanticAnalysis) => void;
    importWorkspace: (file: File) => Promise<void>;
    linkCustomFile: () => Promise<void>;
    clearData: () => void;
    deleteFromLibrary: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { showToast } = useToast();

    // State
    const [library, setLibrary] = useState<SemanticAnalysis[]>([]);
    const [history, setHistory] = useState<SemanticAnalysis[]>([]);
    const [currentAnalysis, setCurrentAnalysis] = useState<SemanticAnalysis | null>(null);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [customFileName, setCustomFileName] = useState<string | null>(null);

    // Load data on mount
    useEffect(() => {
        const initStorage = async () => {
            try {
                const data = await storageService.load();
                if (data) {
                    setLibrary(data.library || []);
                    setHistory(data.history || []);
                    setLastSaved(data.lastSynced);
                }
            } catch (err) {
                console.error("Failed to load initial data", err);
                showToast("无法加载本地数据", "error");
            }
        };
        initStorage();
    }, [showToast]);

    // Debounced Autosave
    // We desire to save whenever library or history changes.
    // But we want to debounce it to avoid disk spamming.
    const debouncedLibrary = useDebounce(library, 2000);
    const debouncedHistory = useDebounce(history, 2000);

    useEffect(() => {
        // Only save if we have data or if we explicitly cleared it (length 0 is valid state, but check if loaded first?)
        // A simple check is to ensure we don't overwrite with empty on initial load race condition.
        // However, since library starts as [], and storageService.load sets it. 
        // We should skip the very first render effect if possible, but useDebounce handles that by running after delay.

        // We can just check if dirty? 
        // Simpler: Just save. storageService is robust enough? 
        // Actually, on initial load, setLibrary calls trigger this.
        // We might want to track 'isLoaded'.

        // For now, let's assume it's fine to save "same" data. 
        // But to prevent overwriting valid data with [] on startup before load finishes:
        // We rely on load finishing fast.

        if (debouncedLibrary.length === 0 && debouncedHistory.length === 0 && !lastSaved) {
            // Likely initial state, skip
            return;
        }

        const saveData = async () => {
            try {
                await storageService.save(debouncedLibrary, debouncedHistory);
                setLastSaved(new Date().toISOString());
                // Optional: show a subtle 'Saved' indicator if we had a status bar
            } catch (error) {
                console.error("Autosave failed", error);
            }
        };

        saveData();

    }, [debouncedLibrary, debouncedHistory]);

    // Actions
    const addToLibrary = useCallback((item: SemanticAnalysis) => {
        setLibrary(prev => {
            if (prev.find(i => i.id === item.id)) {
                showToast('该项目已在知识库中', 'info');
                return prev;
            }
            showToast('已保存到知识库', 'success');
            return [...prev, item];
        });
    }, [showToast]);

    const updateAnalysis = useCallback((updatedItem: SemanticAnalysis) => {
        // Update in Library
        setLibrary(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        // Update in History
        setHistory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        // Update Current View
        setCurrentAnalysis(prev => prev && prev.id === updatedItem.id ? updatedItem : prev);
    }, []);

    const linkCustomFile = async () => {
        try {
            const name = await storageService.selectLocalWorkspace();
            if (name) {
                setCustomFileName(name);
                // Force immediate save to sync
                await storageService.save(library, history);
                setLastSaved(new Date().toISOString());
                showToast(`已链接到文件: ${name}`, 'success');
            }
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const importWorkspace = async (file: File) => {
        try {
            const data = await storageService.importFromFile(file);
            setLibrary(data.library);
            setHistory(data.history);
            showToast('工作区数据恢复成功', 'success');
        } catch (err) {
            showToast('导入失败: ' + (err as Error).message, 'error');
        }
    };

    const deleteFromLibrary = useCallback((id: string) => {
        setLibrary(prev => prev.filter(item => item.id !== id));
        showToast('资产已删除', 'success');
    }, [showToast]);

    const clearData = useCallback(() => {
        setLibrary([]);
        setHistory([]);
        setCustomFileName(null);
        setCurrentAnalysis(null);
        storageService.clearAllData();
    }, []);

    return (
        <StoreContext.Provider value={{
            library,
            history,
            currentAnalysis,
            lastSaved,
            customFileName,
            setLibrary,
            setHistory,
            setCurrentAnalysis,
            addToLibrary,
            updateAnalysis,
            linkCustomFile,
            importWorkspace,
            clearData,
            deleteFromLibrary
        }}>
            {children}
        </StoreContext.Provider>
    );
};
