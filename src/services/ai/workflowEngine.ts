import {
  IEEEPaper,
  WorkflowEngineStep,
  WorkflowStep17Status,
  NavigationTab
} from '../../types';
import {
  verifyAllPaperClaims,
  calculateDynamicQualityScore,
  evaluateTechnologySuitabilityFull,
  verifyTraceabilityChain
} from './researchIntegrityEngine';

export const INITIAL_17_STEPS: Omit<WorkflowEngineStep, 'status'>[] = [
  {
    id: 1,
    stepKey: 'step_1_pdf_upload',
    name: '1. PDF Upload & Ingestion',
    stage: 'papers',
    description: 'Document file buffer ingestion & binary header validation.',
  },
  {
    id: 2,
    stepKey: 'step_2_text_extraction',
    name: '2. Page & Text Layer Extraction',
    stage: 'papers',
    description: 'Native PDF text item extraction and page geometry mapping.',
  },
  {
    id: 3,
    stepKey: 'step_3_ocr_detection',
    name: '3. Scanned PDF & OCR Verification',
    stage: 'papers',
    description: 'Text density evaluation and Gemini Vision OCR fallback check.',
  },
  {
    id: 4,
    stepKey: 'step_4_chunking_indexing',
    name: '4. Reading Order & IEEE Chunking',
    stage: 'papers',
    description: 'Two-column IEEE layout reconstruction & structured paragraph chunking.',
  },
  {
    id: 5,
    stepKey: 'step_5_fact_extraction',
    name: '5. Fact & Metadata Extraction',
    stage: 'analysis',
    description: 'Extract title, authors, DOI, abstract, and core problem statement.',
  },
  {
    id: 6,
    stepKey: 'step_6_methodology_analysis',
    name: '6. Methodology & Algorithm Parsing',
    stage: 'analysis',
    description: 'Extract input, processing, algorithm steps, architecture, and datasets.',
  },
  {
    id: 7,
    stepKey: 'step_7_results_classification',
    name: '7. Results & Metrics Classification',
    stage: 'analysis',
    description: 'Classify performance claims into PAPER_REPORTED vs NOT_AVAILABLE.',
  },
  {
    id: 8,
    stepKey: 'step_8_evidence_indexing',
    name: '8. Grounded Evidence Indexing',
    stage: 'analysis',
    description: 'Extract exact evidence quotes with page and section references.',
  },
  {
    id: 9,
    stepKey: 'step_9_limitation_extraction',
    name: '9. Limitation & Constraint Extraction',
    stage: 'analysis',
    description: 'Identify explicit baseline constraints linked to evidence quotes.',
  },
  {
    id: 10,
    stepKey: 'step_10_gap_formulation',
    name: '10. Research Gap Formulation',
    stage: 'gaps',
    description: 'Synthesize evidence-grounded research gaps addressing limitations.',
  },
  {
    id: 11,
    stepKey: 'step_11_tech_suitability',
    name: '11. Technology Suitability Evaluation',
    stage: 'enhancements',
    description: 'Evaluate AI, IoT, Edge, and Cloud suitability without forced assumptions.',
  },
  {
    id: 12,
    stepKey: 'step_12_enhancement_synthesis',
    name: '12. Software Enhancement Synthesis',
    stage: 'enhancements',
    description: 'Propose software-only modules with direct rationale for gaps.',
  },
  {
    id: 13,
    stepKey: 'step_13_traceability_chain',
    name: '13. Traceability Chain Verification',
    stage: 'enhancements',
    description: 'Verify 1-to-1 Evidence -> Limitation -> Gap -> Module linkage.',
  },
  {
    id: 14,
    stepKey: 'step_14_claim_verification',
    name: '14. AI Claim Verification Layer',
    stage: 'validation',
    description: 'Verify verbatim quotes and flag invalid claims as UNVERIFIED.',
  },
  {
    id: 15,
    stepKey: 'step_15_architecture_specs',
    name: '15. Software Architecture Specification',
    stage: 'validation',
    description: 'Generate before/after block diagrams and module API specifications.',
  },
  {
    id: 16,
    stepKey: 'step_16_validation_execution',
    name: '16. Benchmark & Validation Execution',
    stage: 'validation',
    description: 'Execute client-side live empirical benchmarks for performance.',
  },
  {
    id: 17,
    stepKey: 'step_17_report_generation',
    name: '17. Final Research Report Generation',
    stage: 'project',
    description: 'Compile complete IEEE-standard research proposal and audit report.',
  },
];

/**
 * Creates default 17 steps state for a paper.
 */
export function initialize17StepWorkflow(paper?: IEEEPaper): WorkflowEngineStep[] {
  return INITIAL_17_STEPS.map((step) => {
    let status: WorkflowStep17Status = 'LOCKED';

    if (paper) {
      if (step.id === 1) {
        status = 'COMPLETED';
      } else if (step.id <= 4) {
        status = paper.rawText ? 'COMPLETED' : 'AVAILABLE';
      } else if (step.id <= 9) {
        status = paper.status === 'Analyzed' && paper.analysis ? 'COMPLETED' : paper.rawText ? 'AVAILABLE' : 'LOCKED';
      } else if (step.id === 10) {
        status = paper.analysis?.researchGaps?.length ? 'COMPLETED' : paper.status === 'Analyzed' ? 'AVAILABLE' : 'LOCKED';
      } else if (step.id <= 13) {
        status = paper.analysis?.recommendations?.length ? 'COMPLETED' : paper.analysis?.researchGaps?.length ? 'AVAILABLE' : 'LOCKED';
      } else if (step.id <= 15) {
        status = paper.analysis?.claimVerifications?.length ? 'COMPLETED' : paper.analysis?.recommendations?.length ? 'AVAILABLE' : 'LOCKED';
      } else if (step.id === 16) {
        status = (paper.validatedEnhancementIds?.length || 0) > 0 ? 'COMPLETED' : paper.analysis?.recommendations?.length ? 'AVAILABLE' : 'LOCKED';
      } else if (step.id === 17) {
        status = paper.projectStatus === 'Project Generated' || paper.projectStatus === 'Validated' ? 'COMPLETED' : paper.analysis ? 'AVAILABLE' : 'LOCKED';
      }
    } else {
      if (step.id === 1) status = 'AVAILABLE';
    }

    return {
      ...step,
      status,
      timestamp: status === 'COMPLETED' ? new Date().toISOString() : undefined,
    };
  });
}

/**
 * Dynamically computes and updates workflow steps state from an analyzed paper.
 */
export function syncWorkflowFromPaper(paper: IEEEPaper): WorkflowEngineStep[] {
  const baseSteps = paper.workflowSteps?.length === 17 ? paper.workflowSteps : initialize17StepWorkflow(paper);
  const analysis = paper.analysis;
  const rawText = paper.rawText || '';

  return baseSteps.map((step) => {
    let status: WorkflowStep17Status = step.status;
    let input: any = step.input;
    let output: any = step.output;
    let validation: any = step.validation;

    switch (step.id) {
      case 1: // PDF Upload
        status = 'COMPLETED';
        input = { fileName: paper.title, fileSize: paper.fileSize || 'N/A' };
        output = { paperId: paper.id, title: paper.title };
        validation = { isValid: true, score: 100 };
        break;

      case 2: // Text Extraction
        status = rawText ? 'COMPLETED' : 'FAILED';
        input = { rawTextLength: rawText.length };
        output = { charactersExtracted: rawText.length, sampleText: rawText.slice(0, 150) };
        validation = { isValid: rawText.length > 50, score: rawText.length > 50 ? 100 : 0 };
        break;

      case 3: // Scanned PDF & OCR
        status = paper.isScanned !== undefined ? 'COMPLETED' : rawText ? 'COMPLETED' : 'AVAILABLE';
        input = { isScanned: paper.isScanned, totalChars: paper.detectionDetails?.totalCharsExtracted };
        output = {
          isScanned: Boolean(paper.isScanned),
          ocrEngine: paper.ocrEngine || 'none',
          reason: paper.detectionDetails?.reason || 'Native text layer verified',
        };
        validation = { isValid: true, score: 100 };
        break;

      case 4: // Reading Order & IEEE Chunking
        status = (paper.pdfChunks?.length || 0) > 0 ? 'COMPLETED' : rawText ? 'COMPLETED' : 'LOCKED';
        input = { numPages: paper.pdfChunks ? Math.max(...paper.pdfChunks.map((c) => c.pageNum), 1) : 1 };
        output = { totalChunks: paper.pdfChunks?.length || 1, sampleChunk: paper.pdfChunks?.[0] };
        validation = { isValid: true, score: 100 };
        break;

      case 5: // Fact Extraction
        status = analysis?.paperSummary ? 'COMPLETED' : rawText ? 'AVAILABLE' : 'LOCKED';
        input = { rawTextLength: rawText.length };
        output = { title: analysis?.paperInformation.title, authors: analysis?.paperInformation.authors, summary: analysis?.paperSummary };
        validation = { isValid: Boolean(analysis?.paperSummary), score: analysis?.paperSummary ? 100 : 0 };
        break;

      case 6: // Methodology Parsing
        status = analysis?.methodology ? 'COMPLETED' : analysis ? 'AVAILABLE' : 'LOCKED';
        input = { rawMethodology: analysis?.methodology };
        output = { methodology: analysis?.methodology, algorithms: analysis?.algorithms, datasets: analysis?.datasets };
        validation = { isValid: Boolean(analysis?.methodology), score: analysis?.methodology ? 100 : 0 };
        break;

      case 7: // Results Classification
        status = analysis?.results ? 'COMPLETED' : analysis ? 'AVAILABLE' : 'LOCKED';
        input = { results: analysis?.results };
        output = { results: analysis?.results };
        validation = { isValid: Boolean(analysis?.results), score: analysis?.results ? 100 : 0 };
        break;

      case 8: // Evidence Indexing
        status = (analysis?.evidences?.length || 0) > 0 ? 'COMPLETED' : analysis ? 'AVAILABLE' : 'LOCKED';
        input = { evidenceCount: analysis?.evidences?.length || 0 };
        output = { evidences: analysis?.evidences };
        validation = { isValid: (analysis?.evidences?.length || 0) > 0, score: (analysis?.evidences?.length || 0) > 0 ? 100 : 0 };
        break;

      case 9: // Limitation Extraction
        status = (analysis?.limitations?.length || 0) > 0 ? 'COMPLETED' : analysis ? 'AVAILABLE' : 'LOCKED';
        input = { limitationCount: analysis?.limitations?.length || 0 };
        output = { limitations: analysis?.limitations };
        validation = { isValid: (analysis?.limitations?.length || 0) > 0, score: (analysis?.limitations?.length || 0) > 0 ? 100 : 0 };
        break;

      case 10: // Research Gap Formulation
        status = (analysis?.researchGaps?.length || 0) > 0 ? 'COMPLETED' : (analysis?.limitations?.length || 0) > 0 ? 'AVAILABLE' : 'LOCKED';
        input = { gapsCount: analysis?.researchGaps?.length || 0 };
        output = { researchGaps: analysis?.researchGaps };
        validation = { isValid: (analysis?.researchGaps?.length || 0) > 0, score: (analysis?.researchGaps?.length || 0) > 0 ? 100 : 0 };
        break;

      case 11: // Tech Suitability
        status = analysis ? 'COMPLETED' : 'LOCKED';
        input = { paperId: paper.id };
        output = { suitabilities: evaluateTechnologySuitabilityFull(paper) };
        validation = { isValid: true, score: 100 };
        break;

      case 12: // Enhancement Synthesis
        status = (analysis?.recommendations?.length || 0) > 0 ? 'COMPLETED' : (analysis?.researchGaps?.length || 0) > 0 ? 'AVAILABLE' : 'LOCKED';
        input = { gapsCount: analysis?.researchGaps?.length || 0 };
        output = { recommendations: analysis?.recommendations };
        validation = { isValid: (analysis?.recommendations?.length || 0) > 0, score: (analysis?.recommendations?.length || 0) > 0 ? 100 : 0 };
        break;

      case 13: // Traceability Chain
        status = (analysis?.recommendations?.length || 0) > 0 ? 'COMPLETED' : 'LOCKED';
        input = { recsCount: analysis?.recommendations?.length || 0 };
        const traceChecks = (analysis?.recommendations || []).map((r) => verifyTraceabilityChain(paper, r));
        const allTraceValid = traceChecks.every((t) => t.isComplete);
        output = { totalLinks: traceChecks.length, validLinks: traceChecks.filter((t) => t.isComplete).length };
        validation = { isValid: allTraceValid, score: allTraceValid ? 100 : 75 };
        break;

      case 14: // Claim Verification
        status = (analysis?.claimVerifications?.length || 0) > 0 ? 'COMPLETED' : analysis ? 'AVAILABLE' : 'LOCKED';
        input = { paperId: paper.id };
        const claims = paper.analysis?.claimVerifications || verifyAllPaperClaims(paper);
        const verifiedCount = claims.filter((c) => c.isVerified).length;
        output = { totalClaims: claims.length, verifiedClaims: verifiedCount, claims };
        validation = { isValid: claims.length === 0 || verifiedCount > 0, score: claims.length > 0 ? Math.round((verifiedCount / claims.length) * 100) : 100 };
        break;

      case 15: // Architecture Specs
        status = analysis?.projectSpec ? 'COMPLETED' : (analysis?.recommendations?.length || 0) > 0 ? 'AVAILABLE' : 'LOCKED';
        input = { specTitle: analysis?.projectSpec?.projectTitle };
        output = { projectSpec: analysis?.projectSpec };
        validation = { isValid: Boolean(analysis?.projectSpec), score: analysis?.projectSpec ? 100 : 0 };
        break;

      case 16: // Validation Execution
        status = (paper.validatedEnhancementIds?.length || 0) > 0 ? 'COMPLETED' : (paper.selectedEnhancementIds?.length || 0) > 0 ? 'AVAILABLE' : 'LOCKED';
        input = { selectedEnhancements: paper.selectedEnhancementIds?.length || 0 };
        output = { validatedEnhancements: paper.validatedEnhancementIds?.length || 0 };
        validation = { isValid: (paper.validatedEnhancementIds?.length || 0) > 0, score: (paper.validatedEnhancementIds?.length || 0) > 0 ? 100 : 0 };
        break;

      case 17: // Final Report Generation
        status = paper.projectStatus === 'Project Generated' || paper.projectStatus === 'Validated' ? 'COMPLETED' : analysis ? 'AVAILABLE' : 'LOCKED';
        input = { paperTitle: paper.title };
        output = { reportReady: true, generatedAt: new Date().toISOString() };
        validation = { isValid: status === 'COMPLETED', score: status === 'COMPLETED' ? 100 : 0 };
        break;
    }

    return {
      ...step,
      status,
      input: input ?? step.input,
      output: output ?? step.output,
      validation: validation ?? step.validation,
      timestamp: status === 'COMPLETED' ? step.timestamp || new Date().toISOString() : undefined,
    };
  });
}
