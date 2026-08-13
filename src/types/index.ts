export type NavigationTab =
  | 'dashboard'
  | 'papers'
  | 'analysis'
  | 'compare'
  | 'gaps'
  | 'enhancements'
  | 'validation'
  | 'project';

export type AccentColor = 'emerald' | 'green' | 'yellow' | 'purple' | 'rose' | 'cyan';

export type WorkflowStepId = 1 | 2 | 3 | 4 | 5 | 6;

export interface WorkflowStep {
  id: WorkflowStepId;
  name: string;
  tab: NavigationTab;
  description: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 1, name: 'Paper', tab: 'papers', description: 'Upload PDF or link IEEE paper' },
  { id: 2, name: 'Analysis', tab: 'analysis', description: 'Extract methodology & limitations' },
  { id: 3, name: 'Research Gaps', tab: 'gaps', description: 'Identify evidence-backed research gaps' },
  { id: 4, name: 'Enhancements', tab: 'enhancements', description: 'Recommend software-only enhancements' },
  { id: 5, name: 'Validation', tab: 'validation', description: 'Validate performance & metrics' },
  { id: 6, name: 'Enhanced Project', tab: 'project', description: 'Generate enhanced proposal & architecture' },
];

export type PaperStatus = 'Awaiting analysis' | 'Analyzing' | 'Analyzed' | 'Failed';

export type EvidenceSourceType = 'EXPLICIT' | 'INFERRED';

export interface PaperEvidence {
  id: string;
  paperId?: string;
  page: string;
  section: string;
  chunkId: string;
  quoteOrExcerpt: string;
  sourceType: EvidenceSourceType;
}

export interface GroundedLimitation {
  id: string;
  title: string;
  explanation: string;
  type: 'EXPLICIT' | 'INFERRED';
  evidenceIds: string[];
  page: string;
  section: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export type GroundedGapType =
  | 'Technical'
  | 'Performance'
  | 'Scalability'
  | 'Security'
  | 'Usability'
  | 'Accuracy'
  | 'Real-time'
  | 'Data'
  | 'Architecture'
  | 'Deployment'
  | 'Evaluation'
  | 'Generalization';

export interface GroundedResearchGap {
  id: string;
  title: string;
  explanation: string;
  evidenceIds: string[];
  relatedLimitations: string[];
  gapType: GroundedGapType;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface GroundedMethodology {
  input: string;
  processing: string;
  algorithm: string;
  output: string;
  architecture: string;
  dataset: string;
  evaluation: string;
}

export interface GroundedResultMetric {
  value: string;
  metric: string;
  source: string;
  page: string;
  evidenceId?: string;
}

export interface IEEEPaper {
  id: string;
  title: string;
  authors: string[];
  year: string;
  status: PaperStatus;
  uploadedAt: string;
  fileSize?: string;
  pdfUrl?: string;
  rawText?: string;
  sourceType: 'pdf' | 'url';
  analysis?: PaperAnalysis;
  selectedEnhancementIds?: string[];
  validatedEnhancementIds?: string[];
  approvedGapIds?: string[];
  feedbackMap?: Record<string, InsightFeedback>;
  projectStatus?: 'Not Started' | 'In Analysis' | 'Enhancements Selected' | 'Validated' | 'Project Generated';
  isScanned?: boolean;
  isOcrProcessed?: boolean;
  ocrEngine?: 'gemini-vision' | 'tesseract' | 'none';
  detectionDetails?: {
    totalCharsExtracted: number;
    avgCharsPerPage: number;
    reason: string;
  };
}

export type AnalysisProgressStage =
  | 'Extracted'
  | 'Analyzing structure'
  | 'Analyzing methodology'
  | 'Detecting limitations'
  | 'Finding research gaps'
  | 'Generating analysis'
  | 'Validating output'
  | 'Complete'
  | 'Failed';

export interface PaperAnalysis {
  analyzedAt: string;
  paperInformation: {
    title: string;
    authors: string[];
    year: string;
    publisher?: string;
    doiUrl?: string;
  };
  paperSummary: string;
  abstract?: string;
  problemStatement: string;
  problem?: string;
  objectives: string[];
  methodology: GroundedMethodology | string;
  algorithms: string[];
  technologies: string[];
  technology?: string[];
  datasets: string[];
  dataset?: string;
  results: GroundedResultMetric[] | string;
  limitations: GroundedLimitation[];
  futureWork: string[];
  references: string[];
  researchGaps: GroundedResearchGap[];
  evidences: PaperEvidence[];
  enhancements?: SoftwareEnhancement[];
  recommendations?: EnhancementRecommendation[];
  validationMetrics?: ValidationMetric[];
  beforeAfterComparison?: BeforeAfterData;
  projectSpec?: EnhancedProjectSpec;
  predictionMetrics?: PredictionMetric[];
}

export interface RelevanceBreakdown {
  evidenceAlignment: number;
  problemAlignment: number;
  feasibilityScore: number;
  implementationRelevance: number;
  explanation: string;
}

export interface TraceabilityLink {
  paperEvidence: string;
  limitation: string;
  researchGap: string;
  enhancement: string;
  newSoftwareModule: string;
  validationMetric: string;
  isComplete: boolean;
}

export interface EnhancementRecommendation {
  id: string;
  paperId: string;
  limitationId: string;
  researchGapId: string;
  title: string;
  category: string;
  rationale: string;
  implementationApproach: string;
  expectedBenefit: string;
  feasibility: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  relevanceScore: number;
  relevanceBreakdown?: RelevanceBreakdown;
  evidenceIds: string[];
  dependencies: string[];
  dependsOnIds?: string[];
  risks: string[];
  validationMetric: string;
  confidence: 'High' | 'Medium' | 'Low';
  isSoftwareOnly: boolean;
  isNoStrongEnhancement?: boolean;
  noEnhancementReason?: string;
  traceabilityLink?: TraceabilityLink;
}

export interface SoftwareEnhancement {
  id: string;
  gapId: string;
  title: string;
  description: string;
  softwareModule: string;
  targetMetric: string;
  feasibilityScore: number;
  implementationComplexity: 'Low' | 'Medium' | 'High';
  isSoftwareOnly: boolean;
}

export interface ValidationMetric {
  id: string;
  enhancementId: string;
  metricName: string;
  baselineValue: string;
  expectedValue: string;
  achievedValue?: string;
  status: 'Pending' | 'Passed' | 'In Progress';
  validationMethod: string;
}

export interface BeforeAfterData {
  existingSystem: {
    title: string;
    architectureOverview: string;
    keyComponents: string[];
    limitationsSummary: string[];
  };
  enhancedSystem: {
    title: string;
    architectureOverview: string;
    newSoftwareModules: string[];
    expectedBenefits: string[];
  };
}

export interface TraceabilityNode {
  paperEvidence: string;
  originalLimitation: string;
  researchGap: string;
  enhancement: string;
  newSoftwareModule: string;
  validationMetric: string;
}

export interface WorkspaceSettings {
  workspaceName: string;
  dbAdapterType: 'local' | 'firestore';
  firestoreConfigured: boolean;
  geminiApiKeyPresent: boolean;
  autoAnalyzeOnUpload: boolean;
}

export type ResultState = 'MEASURED' | 'SIMULATED' | 'ESTIMATED' | 'NOT AVAILABLE';

export interface PredictionMetric {
  id: string;
  enhancementId: string;
  metricName: string;
  baselineValue: string;
  enhancedValue: string;
  improvement: string;
  method: string;
  source: string;
  status: ResultState;
  unavailableReason?: string;
  requiredData?: string;
  measuredAt?: string;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: 'input' | 'processing' | 'new_module' | 'optimization' | 'output';
  isNew?: boolean;
  linkedLimitation?: string;
}

export interface ArchitectureGraphData {
  existingFlow: ArchitectureNode[];
  enhancedFlow: ArchitectureNode[];
}

export interface TechnologyStackCategory {
  category: string;
  items: string[];
}

export interface ImplementationPhase {
  phase: string;
  title: string;
  description: string;
  deliverable: string;
}

export interface ValidationPlanItem {
  testType: 'Latency benchmark' | 'Throughput benchmark' | 'Accuracy evaluation' | 'Resource utilization' | 'Ablation study' | 'Baseline comparison' | 'Load test' | 'Security test';
  description: string;
  metric: string;
  method: string;
  status: ResultState;
}

export interface ResearchNovelty {
  addressedLimitation: string;
  technicalNovelty: string;
  engineeringContribution: string;
  academicOriginality: string;
  aiContribution: string;
  edgeContribution: string;
  iotIntegrationApproach: string;
  differentiationFromOriginal: string;
}

export interface ScalableDeploymentStep {
  stage: string;
  title: string;
  description: string;
  components: string[];
}

export interface DecisionSupportData {
  prediction: string;
  riskScore: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  whyThisDecision: {
    riskFactors: string[];
    evidenceSource: string;
    rationale: string;
  };
  decisionSource: 'Paper-derived' | 'AI-inferred' | 'Simulation-derived' | 'Proposed';
}

export interface TechSuitabilityJustification {
  technology: 'AI' | 'Software IoT' | 'Edge Computing';
  isSuitable: boolean;
  whySuitable: string;
  targetedLimitation: string;
  integrationApproach: string;
  expectedBenefit: string;
  implementationComplexity: 'Low' | 'Medium' | 'High';
}

export interface EnhancedProjectSpec {
  projectTitle: string;
  oneLineConcept: string;
  problemStatement: string;
  existingSystem: {
    title: string;
    architectureOverview: string;
    keyComponents: string[];
    limitations: string[];
  };
  researchGaps: string[];
  selectedEnhancements: {
    id: string;
    title: string;
    category: string;
    rationale: string;
    newSoftwareModule: string;
    linkedLimitation: string;
  }[];
  proposedSolution: string;
  architecture: ArchitectureGraphData;
  softwareModules: {
    name: string;
    description: string;
    technologies: string[];
    linkedLimitation: string;
    codeSnippet?: string;
  }[];
  technologyStack: TechnologyStackCategory[];
  implementationPlan: ImplementationPhase[];
  validationPlan: ValidationPlanItem[];
  expectedImpact: string;
  limitationsOfEnhancement: string[];
  futureWork: string[];
  researchNovelty?: ResearchNovelty;
  scalableDeployment?: ScalableDeploymentStep[];
  decisionSupport?: DecisionSupportData;
  techSuitabilities?: TechSuitabilityJustification[];
}

export type ActivityActionType =
  | 'upload'
  | 'analysis'
  | 'enhancement_selection'
  | 'gap_approval'
  | 'validation'
  | 'report_export'
  | 'settings_update'
  | 'feedback_submitted'
  | 'clear_workspace';

export interface ActivityLog {
  id: string;
  timestamp: string;
  actionType: ActivityActionType;
  details: string;
  paperId?: string;
  paperTitle?: string;
  metadata?: Record<string, any>;
}

export type RelevanceRating = 'relevant' | 'somewhat_relevant' | 'irrelevant';

export interface InsightFeedback {
  id: string;
  itemId: string;
  itemType: 'limitation' | 'research_gap' | 'result' | 'summary' | 'evidence';
  itemTitle: string;
  paperId: string;
  rating: RelevanceRating;
  comment?: string;
  timestamp: string;
}

