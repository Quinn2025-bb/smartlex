
import { SemanticAnalysis } from '../types';

const STORAGE_KEY = 'smartlex_workspace';
const HANDLE_KEY = 'smartlex_file_handle';

interface WorkspaceData {
  version: string;
  library: SemanticAnalysis[];
  history: SemanticAnalysis[];
  lastSynced: string;
}

// File System Access API Types
interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
  isSameEntry(other: FileSystemHandle): Promise<boolean>;
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file';
  getFile(): Promise<File>;
  createWritable(options?: { keepExistingData?: boolean }): Promise<FileSystemWritableFileStream>;
  queryPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
  requestPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: string | BufferSource | Blob): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: {
    description?: string;
    accept: Record<string, string[]>;
  }[];
  excludeAcceptAllOption?: boolean;
}

// Extend Window interface locally
declare global {
  interface Window {
    showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
    __TAURI_INTERNALS__?: any;
  }
}

// Detection for environments
const isTauri = () => window.__TAURI_INTERNALS__ !== undefined;
const isFileSystemApiSupported = () => 'showSaveFilePicker' in window;

export const storageService = {
  // Store the active file handle in memory
  activeHandle: null as FileSystemFileHandle | null,

  /**
   * Let the user pick a specific file on their computer to act as the live database.
   */
  async selectLocalWorkspace(): Promise<string | null> {
    if (!isFileSystemApiSupported()) {
      throw new Error('Your browser does not support choosing local folders. Please use a Chromium-based browser (Chrome/Edge).');
    }

    try {
      // @ts-ignore - showSaveFilePicker is not standard yet
      const handle = await window.showSaveFilePicker({
        suggestedName: 'my_smartlex_workspace.lex',
        types: [{
          description: 'SmartLex Workspace File',
          accept: { 'application/json': ['.lex'] },
        }],
      });

      this.activeHandle = handle;
      return handle.name;
    } catch (err: any) {
      if (err.name === 'AbortError') return null;
      throw err;
    }
  },

  /**
   * Save all data. 
   * Priority: 1. User Selected File, 2. Tauri AppData, 3. LocalStorage
   */
  async save(library: SemanticAnalysis[], history: SemanticAnalysis[]) {
    const data: WorkspaceData = {
      version: '1.1.0',
      library,
      history,
      lastSynced: new Date().toISOString()
    };

    const jsonString = JSON.stringify(data, null, 2);

    // 1. Save to User Selected File (Browser API)
    if (this.activeHandle) {
      try {
        // Check permissions
        const options = { mode: 'readwrite' as const };
        if (await this.activeHandle.queryPermission(options) !== 'granted') {
          // Note: In a real app, you'd trigger a UI prompt here
          console.warn('File permission not granted');
        } else {
          const writable = await this.activeHandle.createWritable();
          await writable.write(jsonString);
          await writable.close();
          console.log('Saved to user-selected file:', this.activeHandle.name);
        }
      } catch (err) {
        console.error('Failed to write to selected file:', err);
      }
    }

    // 2. Save to LocalStorage (Always as cache)
    localStorage.setItem(STORAGE_KEY, jsonString);

    // 3. If Tauri, save to fixed AppData
    if (isTauri()) {
      try {
        const { writeTextFile, BaseDirectory } = await import('@tauri-apps/plugin-fs');
        await writeTextFile('workspace.lex', jsonString, {
          baseDir: BaseDirectory.AppData,
        });
      } catch (err) {
        console.error('Tauri disk save failed:', err);
      }
    }
  },

  /**
   * Load data from the best available source.
   */
  async load(): Promise<WorkspaceData | null> {
    // If we have an active handle, try to read from it
    if (this.activeHandle) {
      try {
        const file = await this.activeHandle.getFile();
        const text = await file.text();
        return JSON.parse(text);
      } catch (err) {
        console.error('Error reading from selected file:', err);
        // Fallback to local storage if file read fails? No, that might be confusing.
        // Just return null or throw.
        throw new Error('Failed to read selected file');
      }
    }

    // Fallback to LocalStorage
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      console.error("Failed to parse local storage data", e);
      return null;
    }
  },

  /**
   * Reads a .lex file and returns the parsed workspace data.
   */
  async importFromFile(file: File): Promise<WorkspaceData> {
    try {
      const text = await file.text();
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid file format. Please invoke a valid .lex JSON file.');
    }
  },

  /**
   * Triggers a browser download of the current workspace as a .lex file.
   */
  exportToFile(library: SemanticAnalysis[], history: SemanticAnalysis[]) {
    const data: WorkspaceData = {
      version: '1.1.0',
      library,
      history,
      lastSynced: new Date().toISOString()
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartlex_workspace_${new Date().toISOString().split('T')[0]}.lex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Clear all local data
   */
  async clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    this.activeHandle = null;

    if (isTauri()) {
      try {
        // Safe clear for Tauri: Overwrite with empty
        const emptyData = JSON.stringify({ version: '1.1.0', library: [], history: [], lastSynced: '' });
        const { writeTextFile, BaseDirectory } = await import('@tauri-apps/plugin-fs');
        await writeTextFile('workspace.lex', emptyData, {
          baseDir: BaseDirectory.AppData,
        });
      } catch (err) {
        console.error('Failed to clear Tauri data:', err);
      }
    }
  }
};
