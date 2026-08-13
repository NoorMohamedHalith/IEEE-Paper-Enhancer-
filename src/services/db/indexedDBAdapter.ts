import { IEEEPaper, WorkspaceSettings, ActivityLog } from '../../types';
import { IDatabaseAdapter, LocalStorageAdapter } from './index';

const DB_NAME = 'IEEE_InnovateX_LocalDB_v1';
const DB_VERSION = 1;

const STORE_PAPERS = 'papers';
const STORE_SETTINGS = 'settings';
const STORE_AUDIT_LOGS = 'audit_logs';

export class IndexedDBAdapter implements IDatabaseAdapter {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private fallbackLocalStorage = new LocalStorageAdapter();

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_PAPERS)) {
          db.createObjectStore(STORE_PAPERS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORE_AUDIT_LOGS)) {
          const logStore = db.createObjectStore(STORE_AUDIT_LOGS, { keyPath: 'id' });
          logStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('IndexedDB failed to open, falling back to LocalStorage', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  async getPapers(): Promise<IEEEPaper[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PAPERS, 'readonly');
        const store = tx.objectStore(STORE_PAPERS);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return this.fallbackLocalStorage.getPapers();
    }
  }

  async savePaper(paper: IEEEPaper): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PAPERS, 'readwrite');
        const store = tx.objectStore(STORE_PAPERS);
        const request = store.put(paper);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      return this.fallbackLocalStorage.savePaper(paper);
    }
  }

  async updatePaper(paper: IEEEPaper): Promise<void> {
    return this.savePaper(paper);
  }

  async deletePaper(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PAPERS, 'readwrite');
        const store = tx.objectStore(STORE_PAPERS);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      return this.fallbackLocalStorage.deletePaper(id);
    }
  }

  async getSettings(): Promise<WorkspaceSettings> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SETTINGS, 'readonly');
        const store = tx.objectStore(STORE_SETTINGS);
        const request = store.get('workspace_settings');

        request.onsuccess = () => {
          if (request.result && request.result.value) {
            resolve(request.result.value);
          } else {
            resolve(this.fallbackLocalStorage.getSettings());
          }
        };
        request.onerror = () => resolve(this.fallbackLocalStorage.getSettings());
      });
    } catch {
      return this.fallbackLocalStorage.getSettings();
    }
  }

  async saveSettings(settings: WorkspaceSettings): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SETTINGS, 'readwrite');
        const store = tx.objectStore(STORE_SETTINGS);
        const request = store.put({ key: 'workspace_settings', value: settings });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      return this.fallbackLocalStorage.saveSettings(settings);
    }
  }

  async clearWorkspace(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PAPERS, 'readwrite');
        const store = tx.objectStore(STORE_PAPERS);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      return this.fallbackLocalStorage.clearWorkspace();
    }
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_AUDIT_LOGS, 'readonly');
        const store = tx.objectStore(STORE_AUDIT_LOGS);
        const request = store.getAll();

        request.onsuccess = () => {
          const logs: ActivityLog[] = request.result || [];
          // Sort newest first
          logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          resolve(logs);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return this.fallbackLocalStorage.getActivityLogs();
    }
  }

  async logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<ActivityLog> {
    const newLog: ActivityLog = {
      id: log.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: log.timestamp || new Date().toISOString(),
      actionType: log.actionType,
      details: log.details,
      paperId: log.paperId,
      paperTitle: log.paperTitle,
      metadata: log.metadata,
    };

    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_AUDIT_LOGS, 'readwrite');
        const store = tx.objectStore(STORE_AUDIT_LOGS);
        const request = store.put(newLog);

        request.onsuccess = () => resolve(newLog);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return this.fallbackLocalStorage.logActivity(log);
    }
  }

  async clearActivityLogs(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_AUDIT_LOGS, 'readwrite');
        const store = tx.objectStore(STORE_AUDIT_LOGS);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      return this.fallbackLocalStorage.clearActivityLogs();
    }
  }

  // Database Backup Export/Import
  async exportDatabaseJSON(): Promise<string> {
    const papers = await this.getPapers();
    const settings = await this.getSettings();
    const logs = await this.getActivityLogs();

    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      app: 'IEEE_InnovateX',
      papers,
      settings,
      logs,
    };

    return JSON.stringify(backup, null, 2);
  }

  async importDatabaseJSON(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    if (!data || !Array.isArray(data.papers)) {
      throw new Error('Invalid database backup JSON format');
    }

    await this.clearWorkspace();
    for (const paper of data.papers) {
      await this.savePaper(paper);
    }
    if (data.settings) {
      await this.saveSettings(data.settings);
    }
  }
}
