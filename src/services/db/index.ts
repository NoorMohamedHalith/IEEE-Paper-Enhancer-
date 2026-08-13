import { IEEEPaper, WorkspaceSettings, ActivityLog } from '../../types';

export interface IDatabaseAdapter {
  getPapers(): Promise<IEEEPaper[]>;
  savePaper(paper: IEEEPaper): Promise<void>;
  updatePaper(paper: IEEEPaper): Promise<void>;
  deletePaper(id: string): Promise<void>;
  getSettings(): Promise<WorkspaceSettings>;
  saveSettings(settings: WorkspaceSettings): Promise<void>;
  clearWorkspace(): Promise<void>;
  getActivityLogs(): Promise<ActivityLog[]>;
  logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<ActivityLog>;
  clearActivityLogs(): Promise<void>;
}

const STORAGE_KEY_PAPERS = 'ieee_innovatex_papers_v1';
const STORAGE_KEY_SETTINGS = 'ieee_innovatex_settings_v1';
const STORAGE_KEY_AUDIT_LOGS = 'ieee_innovatex_audit_logs_v1';

export class LocalStorageAdapter implements IDatabaseAdapter {
  async getPapers(): Promise<IEEEPaper[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PAPERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async savePaper(paper: IEEEPaper): Promise<void> {
    const papers = await this.getPapers();
    const existingIndex = papers.findIndex((p) => p.id === paper.id);
    if (existingIndex >= 0) {
      papers[existingIndex] = paper;
    } else {
      papers.unshift(paper);
    }
    localStorage.setItem(STORAGE_KEY_PAPERS, JSON.stringify(papers));
  }

  async updatePaper(paper: IEEEPaper): Promise<void> {
    return this.savePaper(paper);
  }

  async deletePaper(id: string): Promise<void> {
    const papers = await this.getPapers();
    const filtered = papers.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PAPERS, JSON.stringify(filtered));
  }

  async getSettings(): Promise<WorkspaceSettings> {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return {
      workspaceName: 'IEEE Primary Research Lab',
      dbAdapterType: 'local',
      firestoreConfigured: false,
      geminiApiKeyPresent: true,
      autoAnalyzeOnUpload: false,
    };
  }

  async saveSettings(settings: WorkspaceSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }

  async clearWorkspace(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY_PAPERS);
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<ActivityLog> {
    const logs = await this.getActivityLogs();
    const newLog: ActivityLog = {
      id: log.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: log.timestamp || new Date().toISOString(),
      actionType: log.actionType,
      details: log.details,
      paperId: log.paperId,
      paperTitle: log.paperTitle,
      metadata: log.metadata,
    };
    logs.unshift(newLog);
    const trimmed = logs.slice(0, 200);
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(trimmed));
    return newLog;
  }

  async clearActivityLogs(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY_AUDIT_LOGS);
  }
}

export class FirestoreAdapterStub implements IDatabaseAdapter {
  private localFallback = new LocalStorageAdapter();

  async getPapers(): Promise<IEEEPaper[]> {
    // When Firestore configuration exists, Firestore queries run here
    return this.localFallback.getPapers();
  }

  async savePaper(paper: IEEEPaper): Promise<void> {
    return this.localFallback.savePaper(paper);
  }

  async updatePaper(paper: IEEEPaper): Promise<void> {
    return this.localFallback.updatePaper(paper);
  }

  async deletePaper(id: string): Promise<void> {
    return this.localFallback.deletePaper(id);
  }

  async getSettings(): Promise<WorkspaceSettings> {
    const settings = await this.localFallback.getSettings();
    return { ...settings, dbAdapterType: 'firestore' };
  }

  async saveSettings(settings: WorkspaceSettings): Promise<void> {
    return this.localFallback.saveSettings(settings);
  }

  async clearWorkspace(): Promise<void> {
    return this.localFallback.clearWorkspace();
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return this.localFallback.getActivityLogs();
  }

  async logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<ActivityLog> {
    return this.localFallback.logActivity(log);
  }

  async clearActivityLogs(): Promise<void> {
    return this.localFallback.clearActivityLogs();
  }
}

import { IndexedDBAdapter } from './indexedDBAdapter';

export class DatabaseService {
  private static instance: DatabaseService;
  private adapter: IDatabaseAdapter;

  private constructor() {
    this.adapter = new IndexedDBAdapter();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public setAdapter(type: 'local' | 'firestore') {
    if (type === 'firestore') {
      this.adapter = new FirestoreAdapterStub();
    } else {
      this.adapter = new IndexedDBAdapter();
    }
  }

  public getAdapter(): IDatabaseAdapter {
    return this.adapter;
  }
}

export const dbService = DatabaseService.getInstance();
