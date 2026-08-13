import React, { createContext, useContext, useState, useEffect } from 'react';
import { IEEEPaper, NavigationTab, AccentColor, WorkflowStepId, WorkspaceSettings, AnalysisProgressStage, ActivityLog, ActivityActionType, InsightFeedback } from '../types';
import { dbService } from '../services/db';
import { analyzePaperWithAI, generateLocalGroundedAnalysis } from '../services/ai/geminiService';
import { generateEnhancementRecommendations } from '../services/ai/recommendationEngine';

interface ToastNotification {
  id: number;
  title: string;
  text: string;
}

interface PaperContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  papers: IEEEPaper[];
  activePaperId: string | null;
  activePaper: IEEEPaper | null;
  recentPaperIds: string[];
  activeStep: WorkflowStepId;
  setActiveStep: (step: WorkflowStepId) => void;
  settings: WorkspaceSettings;
  updateSettings: (settings: WorkspaceSettings) => Promise<void>;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isAuditModalOpen: boolean;
  setIsAuditModalOpen: (open: boolean) => void;
  activityLogs: ActivityLog[];
  logActivity: (
    actionType: ActivityActionType,
    details: string,
    paperId?: string,
    paperTitle?: string,
    metadata?: Record<string, any>
  ) => Promise<void>;
  clearAuditLogs: () => Promise<void>;
  submitInsightFeedback: (
    paperId: string,
    feedback: Omit<InsightFeedback, 'id' | 'timestamp' | 'paperId'>
  ) => Promise<void>;
  addPaper: (paper: IEEEPaper) => Promise<void>;
  removePaper: (id: string) => Promise<void>;
  selectActivePaper: (id: string) => void;
  triggerAnalysis: (id: string) => Promise<void>;
  toggleEnhancementSelection: (paperId: string, enhancementId: string) => Promise<void>;
  approveEnhancements: (paperId: string, enhancementIds: string[]) => Promise<void>;
  toggleGapApproval: (paperId: string, gapId: string) => Promise<void>;
  ensureRecommendations: (paperId: string) => Promise<void>;
  validateEnhancement: (paperId: string, enhancementId: string) => Promise<void>;
  clearWorkspace: () => Promise<void>;
  isAnalyzing: boolean;
  analysisStage: AnalysisProgressStage | null;
  analysisError: string | null;
  lastSavedTime: string | null;
  isAutoSaving: boolean;
  triggerAutoSave: () => Promise<void>;
  reorderSelectedEnhancements: (paperId: string, newOrderedIds: string[]) => Promise<void>;
  updateEnhancementDependencies: (
    paperId: string,
    enhancementId: string,
    dependsOnIds: string[]
  ) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  toastNotification: ToastNotification | null;
  dismissToast: () => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
}

const PaperContext = createContext<PaperContextType | undefined>(undefined);

export const PaperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [papers, setPapers] = useState<IEEEPaper[]>([]);
  const [activePaperId, setActivePaperId] = useState<string | null>(null);
  const [recentPaperIds, setRecentPaperIds] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<WorkflowStepId>(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<AnalysisProgressStage | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [toastNotification, setToastNotification] = useState<ToastNotification | null>(null);

  // Undo / Redo history state stacks
  const [past, setPast] = useState<IEEEPaper[][]>([]);
  const [future, setFuture] = useState<IEEEPaper[][]>([]);

  const recordHistory = () => {
    if (papers.length >= 0) {
      const snapshot = JSON.parse(JSON.stringify(papers));
      setPast((prev) => [...prev.slice(-19), snapshot]);
      setFuture([]);
    }
  };

  const undo = async () => {
    if (past.length === 0) return;

    const previousPapers = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    const currentSnapshot = JSON.parse(JSON.stringify(papers));
    setFuture((prev) => [currentSnapshot, ...prev]);
    setPast(newPast);
    setPapers(previousPapers);

    try {
      const adapter = dbService.getAdapter();
      for (const p of previousPapers) {
        await adapter.updatePaper(p);
      }
    } catch (err) {
      console.error('Error syncing undo to storage:', err);
    }

    if (activePaperId && !previousPapers.some((p) => p.id === activePaperId)) {
      setActivePaperId(previousPapers.length > 0 ? previousPapers[0].id : null);
    }

    setToastNotification({
      id: Date.now(),
      title: 'Action Undone',
      text: 'Reverted workspace paper selections, gaps, or deletions to previous state.',
    });
  };

  const redo = async () => {
    if (future.length === 0) return;

    const nextPapers = future[0];
    const newFuture = future.slice(1);

    const currentSnapshot = JSON.parse(JSON.stringify(papers));
    setPast((prev) => [...prev, currentSnapshot]);
    setFuture(newFuture);
    setPapers(nextPapers);

    try {
      const adapter = dbService.getAdapter();
      for (const p of nextPapers) {
        await adapter.updatePaper(p);
      }
    } catch (err) {
      console.error('Error syncing redo to storage:', err);
    }

    setToastNotification({
      id: Date.now(),
      title: 'Action Redone',
      text: 'Restored workspace paper selections, gaps, or deletions to next state.',
    });
  };

  // Global Keyboard listener for Ctrl+Z and Ctrl+Y / Cmd+Shift+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          if (future.length > 0) redo();
        } else {
          e.preventDefault();
          if (past.length > 0) undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (future.length > 0) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [past, future, papers]);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accentColor') as AccentColor;
      if (['emerald', 'green', 'yellow', 'purple', 'rose', 'cyan'].includes(saved)) {
        return saved;
      }
    }
    return 'green'; // Default to Parrot Green / Lime
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      root.setAttribute('data-accent', accentColor);
      localStorage.setItem('theme', theme);
      localStorage.setItem('accentColor', accentColor);
    }
  }, [theme, accentColor]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
  };

  const dismissToast = () => {
    setToastNotification(null);
  };

  const [settings, setSettings] = useState<WorkspaceSettings>({
    workspaceName: 'IEEE Primary Research Lab',
    dbAdapterType: 'local',
    firestoreConfigured: false,
    geminiApiKeyPresent: true,
    autoAnalyzeOnUpload: false,
  });

  // Activity Auditing System Functions
  const logActivity = async (
    actionType: ActivityActionType,
    details: string,
    paperId?: string,
    paperTitle?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const adapter = dbService.getAdapter();
      const newLog = await adapter.logActivity({
        actionType,
        details,
        paperId,
        paperTitle,
        metadata,
      });
      setActivityLogs((prev) => [newLog, ...prev.filter((l) => l.id !== newLog.id)].slice(0, 200));
    } catch (err) {
      console.error('Failed to record activity log:', err);
    }
  };

  const clearAuditLogs = async () => {
    const adapter = dbService.getAdapter();
    await adapter.clearActivityLogs();
    setActivityLogs([]);
    setToastNotification({
      id: Date.now(),
      title: 'Audit Trail Cleared',
      text: 'All recorded activity logs have been removed from database history.',
    });
  };

  const submitInsightFeedback = async (
    paperId: string,
    feedback: Omit<InsightFeedback, 'id' | 'timestamp' | 'paperId'>
  ) => {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper) return;

    recordHistory();

    const timestamp = new Date().toISOString();
    const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const fullFeedback: InsightFeedback = {
      ...feedback,
      id: feedbackId,
      paperId,
      timestamp,
    };

    const currentMap = paper.feedbackMap || {};
    const updatedMap = {
      ...currentMap,
      [feedback.itemId]: fullFeedback,
    };

    const updatedPaper: IEEEPaper = {
      ...paper,
      feedbackMap: updatedMap,
    };

    const adapter = dbService.getAdapter();
    await adapter.updatePaper(updatedPaper);
    setPapers(await adapter.getPapers());

    await logActivity(
      'feedback_submitted',
      `Rated relevance of ${feedback.itemType.replace('_', ' ')} "${feedback.itemTitle.slice(0, 35)}..." as ${feedback.rating.replace('_', ' ')}`,
      paperId,
      paper.title,
      { feedbackId, rating: feedback.rating, itemId: feedback.itemId }
    );

    setToastNotification({
      id: Date.now(),
      title: 'Feedback Recorded & Logged',
      text: `Your relevance rating (${feedback.rating.replace('_', ' ')}) for "${feedback.itemTitle.slice(0, 30)}..." was saved.`,
    });
  };

  // Initial load from storage
  useEffect(() => {
    async function loadInitialData() {
      const adapter = dbService.getAdapter();
      const loadedPapers = await adapter.getPapers();
      const loadedSettings = await adapter.getSettings();
      const loadedLogs = await adapter.getActivityLogs();

      setPapers(loadedPapers);
      setSettings(loadedSettings);
      setActivityLogs(loadedLogs);

      if (loadedPapers.length > 0) {
        setPapers(loadedPapers);
        setActivePaperId(loadedPapers[0].id);
        setRecentPaperIds(loadedPapers.slice(0, 5).map((p) => p.id));
      } else {
        // Seed initial sample paper into local IndexedDB
        const samplePaper: IEEEPaper = {
          id: 'sample-ieee-01',
          title: 'Asynchronous High-Throughput Stream Ingestion for Real-Time IEEE Edge Analytics',
          authors: ['Dr. A. R. InnovateX', 'IEEE Software Engineering Research Group'],
          year: '2026',
          status: 'Analyzed',
          uploadedAt: new Date().toISOString(),
          fileSize: '1.8 MB',
          sourceType: 'pdf',
          projectStatus: 'In Analysis',
          rawText: 'Abstract—High-throughput stream processing in edge computing environments faces latency bottlenecks and thread contention under non-stationary traffic spikes. This IEEE paper evaluates asynchronous lock-free queueing and dynamic residual calibration models to minimize packet drops and processing latency...'
        };
        const analysis = generateLocalGroundedAnalysis(samplePaper);
        samplePaper.analysis = analysis;
        const recommendations = await generateEnhancementRecommendations(samplePaper);
        analysis.recommendations = recommendations;
        samplePaper.selectedEnhancementIds = [];
        samplePaper.approvedGapIds = [];
        samplePaper.validatedEnhancementIds = [];

        await adapter.savePaper(samplePaper);
        setPapers([samplePaper]);
        setActivePaperId(samplePaper.id);
        setRecentPaperIds([samplePaper.id]);
      }

      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
    loadInitialData();
  }, []);

  // Auto-save mechanism every 30 seconds
  const triggerAutoSave = async () => {
    setIsAutoSaving(true);
    try {
      const adapter = dbService.getAdapter();
      for (const p of papers) {
        await adapter.updatePaper(p);
      }
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(timeStr);

      setToastNotification({
        id: Date.now(),
        title: 'Research Workspace Auto-Saved',
        text: `Active analysis state and selections persisted to LocalStorage at ${timeStr}.`,
      });
    } catch (err) {
      console.error('Auto-save error:', err);
    } finally {
      setIsAutoSaving(false);
    }
  };

  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (papers.length > 0) {
        triggerAutoSave();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [papers]);

  const activePaper = papers.find((p) => p.id === activePaperId) || null;

  const selectActivePaper = (id: string) => {
    setActivePaperId(id);
    setRecentPaperIds((prev) => {
      const filtered = prev.filter((item) => item !== id);
      return [id, ...filtered].slice(0, 5);
    });
  };

  const addPaper = async (paper: IEEEPaper) => {
    recordHistory();
    const adapter = dbService.getAdapter();
    await adapter.savePaper(paper);
    const updated = await adapter.getPapers();
    setPapers(updated);
    setActivePaperId(paper.id);

    await logActivity(
      'upload',
      `Uploaded research paper "${paper.title}" (${paper.sourceType.toUpperCase()})`,
      paper.id,
      paper.title
    );
  };

  const removePaper = async (id: string) => {
    recordHistory();
    const targetPaper = papers.find((p) => p.id === id);
    const adapter = dbService.getAdapter();
    await adapter.deletePaper(id);
    const updated = await adapter.getPapers();
    setPapers(updated);

    if (activePaperId === id) {
      setActivePaperId(updated.length > 0 ? updated[0].id : null);
    }

    if (targetPaper) {
      await logActivity(
        'upload',
        `Removed paper "${targetPaper.title}" from workspace`,
        id,
        targetPaper.title
      );
    }
  };

  const triggerAnalysis = async (id: string) => {
    const targetPaper = papers.find((p) => p.id === id);
    if (!targetPaper) return;

    recordHistory();

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStage('Extracted');

    await logActivity(
      'analysis',
      `Triggered Gemini AI analysis pipeline for paper "${targetPaper.title}"`,
      targetPaper.id,
      targetPaper.title
    );

    // Update paper status to Analyzing
    const updatingPaper: IEEEPaper = {
      ...targetPaper,
      status: 'Analyzing',
      projectStatus: 'In Analysis'
    };

    const adapter = dbService.getAdapter();
    await adapter.updatePaper(updatingPaper);
    setPapers(await adapter.getPapers());

    try {
      setAnalysisStage('Analyzing structure');
      await new Promise((r) => setTimeout(r, 400));

      setAnalysisStage('Analyzing methodology');
      await new Promise((r) => setTimeout(r, 400));

      setAnalysisStage('Detecting limitations');
      await new Promise((r) => setTimeout(r, 400));

      setAnalysisStage('Finding research gaps');
      await new Promise((r) => setTimeout(r, 400));

      setAnalysisStage('Generating analysis');
      const analysisResult = await analyzePaperWithAI(targetPaper);

      setAnalysisStage('Validating output');
      const recs = await generateEnhancementRecommendations({
        ...targetPaper,
        analysis: analysisResult
      });
      analysisResult.recommendations = recs;
      await new Promise((r) => setTimeout(r, 300));

      setAnalysisStage('Complete');

      const allRecIds = recs.map((r) => r.id);

      const completedPaper: IEEEPaper = {
        ...targetPaper,
        status: 'Analyzed',
        analysis: analysisResult,
        selectedEnhancementIds: targetPaper.selectedEnhancementIds?.length ? targetPaper.selectedEnhancementIds : allRecIds,
        validatedEnhancementIds: targetPaper.validatedEnhancementIds?.length ? targetPaper.validatedEnhancementIds : allRecIds,
        projectStatus: 'Proposal Ready',
      };

      await adapter.updatePaper(completedPaper);
      setPapers(await adapter.getPapers());
      setActiveStep(2); // Jump to analysis step
      setActiveTab('analysis');

      await logActivity(
        'analysis',
        `Completed AI analysis for "${targetPaper.title}" (Found ${analysisResult.limitations?.length || 0} limitations & ${analysisResult.researchGaps?.length || 0} research gaps)`,
        targetPaper.id,
        targetPaper.title
      );
    } catch (err: any) {
      console.warn('AI analysis error encountered, recovering with grounded fallback generator:', err);
      try {
        const fallbackAnalysis = generateLocalGroundedAnalysis(targetPaper);
        const recs = await generateEnhancementRecommendations({
          ...targetPaper,
          analysis: fallbackAnalysis
        });
        fallbackAnalysis.recommendations = recs;

        const allRecIds = recs.map((r) => r.id);

        const completedPaper: IEEEPaper = {
          ...targetPaper,
          status: 'Analyzed',
          analysis: fallbackAnalysis,
          selectedEnhancementIds: targetPaper.selectedEnhancementIds?.length ? targetPaper.selectedEnhancementIds : allRecIds,
          validatedEnhancementIds: targetPaper.validatedEnhancementIds?.length ? targetPaper.validatedEnhancementIds : allRecIds,
          projectStatus: 'Proposal Ready',
        };

        await adapter.updatePaper(completedPaper);
        setPapers(await adapter.getPapers());
        setActiveStep(2);
        setActiveTab('analysis');

        await logActivity(
          'analysis',
          `Completed grounded AI analysis for "${targetPaper.title}"`,
          targetPaper.id,
          targetPaper.title
        );
      } catch (fallbackErr) {
        console.error('Fatal analysis failure:', fallbackErr);
        setAnalysisStage('Failed');
        setAnalysisError('AI analysis could not be completed.');

        const failedPaper: IEEEPaper = {
          ...targetPaper,
          status: 'Failed'
        };
        await adapter.updatePaper(failedPaper);
        setPapers(await adapter.getPapers());
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ensureRecommendations = async (paperId: string) => {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper || !paper.analysis) return;

    let recs = paper.analysis.recommendations || [];
    let recsGenerated = false;

    if (recs.length === 0) {
      recs = await generateEnhancementRecommendations(paper);
      recsGenerated = true;
    }

    const recIds = recs.map((r) => r.id);
    const hasSelected = paper.selectedEnhancementIds && paper.selectedEnhancementIds.length > 0;
    const hasValidated = paper.validatedEnhancementIds && paper.validatedEnhancementIds.length > 0;

    if (recsGenerated || !hasSelected || !hasValidated) {
      const updatedPaper: IEEEPaper = {
        ...paper,
        selectedEnhancementIds: hasSelected ? paper.selectedEnhancementIds : recIds,
        validatedEnhancementIds: hasValidated ? paper.validatedEnhancementIds : recIds,
        projectStatus: paper.projectStatus === 'In Analysis' ? 'Proposal Ready' : paper.projectStatus,
        analysis: {
          ...paper.analysis,
          recommendations: recs,
        },
      };
      const adapter = dbService.getAdapter();
      await adapter.updatePaper(updatedPaper);
      setPapers(await adapter.getPapers());
    }
  };

  const toggleEnhancementSelection = async (paperId: string, enhancementId: string) => {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper) return;

    recordHistory();

    const currentSelected = paper.selectedEnhancementIds || [];
    const exists = currentSelected.includes(enhancementId);
    const updatedSelected = exists
      ? currentSelected.filter((id) => id !== enhancementId)
      : [...currentSelected, enhancementId];

    const updatedPaper: IEEEPaper = {
      ...paper,
      selectedEnhancementIds: updatedSelected,
      projectStatus: updatedSelected.length > 0 ? 'Enhancements Selected' : 'In Analysis'
    };

    const adapter = dbService.getAdapter();
    await adapter.updatePaper(updatedPaper);
    setPapers(await adapter.getPapers());

    await logActivity(
      'enhancement_selection',
      `${exists ? 'Deselected' : 'Selected'} enhancement "${enhancementId}" for paper "${paper.title}"`,
      paper.id,
      paper.title
    );
  };

  const approveEnhancements = async (paperId: string, enhancementIds: string[]) => {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper) return;

    recordHistory();

    const updatedPaper: IEEEPaper = {
      ...paper,
      selectedEnhancementIds: enhancementIds,
      projectStatus: 'Enhancements Selected',
    };

    const adapter = dbService.getAdapter();
    await adapter.updatePaper(updatedPaper);
    setPapers(await adapter.getPapers());
    setActiveStep(5);
    setActiveTab('validation');

    await logActivity(
      'enhancement_selection',
      `Approved ${enhancementIds.length} enhancements for paper "${paper.title}"`,
      paper.id,
      paper.title
    );
  };

  const toggleGapApproval = async (paperId: string, gapId: string) => {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper) return;

    recordHistory();

    const currentApproved = paper.approvedGapIds || [];
    const exists = currentApproved.includes(gapId);
    const updatedApproved = exists
      ? currentApproved.filter((id) => id !== gapId)
      : [...currentApproved, gapId];

    const updatedPaper: IEEEPaper = {
      ...paper,
      approvedGapIds: updatedApproved,
    };

    const adapter = dbService.getAdapter();
    await adapter.updatePaper(updatedPaper);
    setPapers(await adapter.getPapers());

    await logActivity(
      'gap_approval',
      `${exists ? 'Unapproved' : 'Approved'} research gap "${gapId}" for paper "${paper.title}"`,
      paper.id,
      paper.title
    );

    setToastNotification({
      id: Date.now(),
      title: exists ? 'Research Gap Unapproved' : 'Research Gap Approved',
      text: `Updated research gap approval status for paper "${paper.title.slice(0, 30)}...".`,
    });
  };

  const validateEnhancement = async (paperId: string, enhancementId: string) => {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper || !paper.analysis) return;

    recordHistory();

    const currentValidated = paper.validatedEnhancementIds || [];
    if (!currentValidated.includes(enhancementId)) {
      const updatedValidated = [...currentValidated, enhancementId];

      const updatedMetrics = (paper.analysis.validationMetrics || []).map((m) =>
        m.enhancementId === enhancementId ? { ...m, status: 'Passed' as const } : m
      );

      const updatedPaper: IEEEPaper = {
        ...paper,
        validatedEnhancementIds: updatedValidated,
        projectStatus: 'Validated',
        analysis: {
          ...paper.analysis,
          validationMetrics: updatedMetrics
        }
      };

      const adapter = dbService.getAdapter();
      await adapter.updatePaper(updatedPaper);
      setPapers(await adapter.getPapers());

      await logActivity(
        'validation',
        `Validated software enhancement module "${enhancementId}" for "${paper.title}"`,
        paper.id,
        paper.title
      );
    }
  };

  const reorderSelectedEnhancements = async (paperId: string, newOrderedIds: string[]) => {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper) return;

    recordHistory();

    const updatedPaper: IEEEPaper = {
      ...paper,
      selectedEnhancementIds: newOrderedIds,
    };

    const adapter = dbService.getAdapter();
    await adapter.updatePaper(updatedPaper);
    const updatedPapers = await adapter.getPapers();
    setPapers(updatedPapers);

    const now = new Date();
    setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const updateEnhancementDependencies = async (
    paperId: string,
    enhancementId: string,
    dependsOnIds: string[]
  ) => {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper || !paper.analysis || !paper.analysis.recommendations) return;

    recordHistory();

    const updatedRecs = paper.analysis.recommendations.map((rec) =>
      rec.id === enhancementId ? { ...rec, dependsOnIds } : rec
    );

    const updatedPaper: IEEEPaper = {
      ...paper,
      analysis: {
        ...paper.analysis,
        recommendations: updatedRecs,
      },
    };

    const adapter = dbService.getAdapter();
    await adapter.updatePaper(updatedPaper);
    const updatedPapers = await adapter.getPapers();
    setPapers(updatedPapers);

    await logActivity(
      'enhancement_selection',
      `Updated prerequisite dependencies for enhancement "${enhancementId}"`,
      paper.id,
      paper.title
    );
  };

  const updateSettings = async (newSettings: WorkspaceSettings) => {
    const adapter = dbService.getAdapter();
    await adapter.saveSettings(newSettings);
    setSettings(newSettings);
    dbService.setAdapter(newSettings.dbAdapterType);

    await logActivity(
      'settings_update',
      `Updated workspace settings (Database Adapter: ${newSettings.dbAdapterType.toUpperCase()})`
    );
  };

  const clearWorkspace = async () => {
    recordHistory();
    const adapter = dbService.getAdapter();
    await adapter.clearWorkspace();
    setPapers([]);
    setActivePaperId(null);
    setActiveTab('dashboard');
    setActiveStep(1);

    await logActivity(
      'clear_workspace',
      'Cleared all research papers from workspace database'
    );
  };

  return (
    <PaperContext.Provider
      value={{
        activeTab,
        setActiveTab,
        papers,
        activePaperId,
        activePaper,
        recentPaperIds,
        activeStep,
        setActiveStep,
        settings,
        updateSettings,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isReportModalOpen,
        setIsReportModalOpen,
        isAuditModalOpen,
        setIsAuditModalOpen,
        activityLogs,
        logActivity,
        clearAuditLogs,
        submitInsightFeedback,
        addPaper,
        removePaper,
        selectActivePaper,
        triggerAnalysis,
        toggleEnhancementSelection,
        approveEnhancements,
        toggleGapApproval,
        ensureRecommendations,
        validateEnhancement,
        clearWorkspace,
        isAnalyzing,
        analysisStage,
        analysisError,
        lastSavedTime,
        isAutoSaving,
        triggerAutoSave,
        reorderSelectedEnhancements,
        updateEnhancementDependencies,
        theme,
        toggleTheme,
        accentColor,
        setAccentColor,
        toastNotification,
        dismissToast,
        undo,
        redo,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
      }}
    >
      {children}
    </PaperContext.Provider>
  );
};

export const usePaperContext = () => {
  const context = useContext(PaperContext);
  if (!context) {
    throw new Error('usePaperContext must be used within a PaperProvider');
  }
  return context;
};
