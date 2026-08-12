import React, { createContext, useContext, useState, useEffect } from 'react';
import { IEEEPaper, NavigationTab, WorkflowStepId, WorkspaceSettings, AnalysisProgressStage } from '../types';
import { dbService } from '../services/db';
import { analyzePaperWithAI } from '../services/ai/geminiService';
import { generateEnhancementRecommendations } from '../services/ai/recommendationEngine';

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
  addPaper: (paper: IEEEPaper) => Promise<void>;
  removePaper: (id: string) => Promise<void>;
  selectActivePaper: (id: string) => void;
  triggerAnalysis: (id: string) => Promise<void>;
  toggleEnhancementSelection: (paperId: string, enhancementId: string) => Promise<void>;
  approveEnhancements: (paperId: string, enhancementIds: string[]) => Promise<void>;
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<AnalysisProgressStage | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [settings, setSettings] = useState<WorkspaceSettings>({
    workspaceName: 'IEEE Primary Research Lab',
    dbAdapterType: 'local',
    firestoreConfigured: false,
    geminiApiKeyPresent: true,
    autoAnalyzeOnUpload: false,
  });

  // Initial load from storage
  useEffect(() => {
    async function loadInitialData() {
      const adapter = dbService.getAdapter();
      const loadedPapers = await adapter.getPapers();
      const loadedSettings = await adapter.getSettings();

      setPapers(loadedPapers);
      setSettings(loadedSettings);

      if (loadedPapers.length > 0) {
        setActivePaperId(loadedPapers[0].id);
        setRecentPaperIds(loadedPapers.slice(0, 5).map((p) => p.id));
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
      setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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
    const adapter = dbService.getAdapter();
    await adapter.savePaper(paper);
    const updated = await adapter.getPapers();
    setPapers(updated);
    setActivePaperId(paper.id);
  };

  const removePaper = async (id: string) => {
    const adapter = dbService.getAdapter();
    await adapter.deletePaper(id);
    const updated = await adapter.getPapers();
    setPapers(updated);

    if (activePaperId === id) {
      setActivePaperId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const triggerAnalysis = async (id: string) => {
    const targetPaper = papers.find((p) => p.id === id);
    if (!targetPaper) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStage('Extracted');

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

      const completedPaper: IEEEPaper = {
        ...targetPaper,
        status: 'Analyzed',
        analysis: analysisResult,
        projectStatus: 'In Analysis',
      };

      await adapter.updatePaper(completedPaper);
      setPapers(await adapter.getPapers());
      setActiveStep(2); // Jump to analysis step
      setActiveTab('analysis');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisStage('Failed');
      setAnalysisError('AI analysis could not be completed.');

      const failedPaper: IEEEPaper = {
        ...targetPaper,
        status: 'Failed'
      };
      await adapter.updatePaper(failedPaper);
      setPapers(await adapter.getPapers());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ensureRecommendations = async (paperId: string) => {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper || !paper.analysis) return;

    if (!paper.analysis.recommendations || paper.analysis.recommendations.length === 0) {
      const recs = await generateEnhancementRecommendations(paper);
      const updatedPaper: IEEEPaper = {
        ...paper,
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
  };

  const approveEnhancements = async (paperId: string, enhancementIds: string[]) => {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper) return;

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
  };

  const validateEnhancement = async (paperId: string, enhancementId: string) => {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper || !paper.analysis) return;

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
    }
  };

  const reorderSelectedEnhancements = async (paperId: string, newOrderedIds: string[]) => {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper) return;

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

  const updateSettings = async (newSettings: WorkspaceSettings) => {
    const adapter = dbService.getAdapter();
    await adapter.saveSettings(newSettings);
    setSettings(newSettings);
    dbService.setAdapter(newSettings.dbAdapterType);
  };

  const clearWorkspace = async () => {
    const adapter = dbService.getAdapter();
    await adapter.clearWorkspace();
    setPapers([]);
    setActivePaperId(null);
    setActiveTab('dashboard');
    setActiveStep(1);
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
        addPaper,
        removePaper,
        selectActivePaper,
        triggerAnalysis,
        toggleEnhancementSelection,
        approveEnhancements,
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
