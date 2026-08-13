import {
  IEEEPaper,
  EnhancedProjectSpec,
  EnhancementRecommendation,
  ArchitectureNode,
  PredictionMetric,
  ResultState
} from '../../types';

export async function generateProjectSpec(paper: IEEEPaper): Promise<EnhancedProjectSpec> {
  if (!paper.analysis) {
    return generateClientDynamicProjectSpec(paper);
  }

  try {
    const selectedIds = paper.selectedEnhancementIds || [];
    const response = await fetch('/api/generate-project-spec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paperId: paper.id,
        paperTitle: paper.title,
        paperSummary: paper.analysis.paperSummary,
        problemStatement: paper.analysis.problemStatement,
        methodologyOverview: typeof paper.analysis.methodology === 'object' ? paper.analysis.methodology.processing : (paper.analysis.methodology || 'Baseline methodology'),
        limitations: paper.analysis.limitations,
        researchGaps: paper.analysis.researchGaps,
        evidences: paper.analysis.evidences,
        recommendations: paper.analysis.recommendations,
        selectedIds
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.spec) {
        return data.spec;
      }
    }
  } catch (err) {
    console.warn('API generate-project-spec fallback to client engine:', err);
  }

  return generateClientDynamicProjectSpec(paper);
}

/**
 * Deterministic Client-Side Generator for Enhanced Project Proposal
 * Directly derives architecture, software modules, and validation plan from paper & approved enhancements.
 */
export function generateClientDynamicProjectSpec(paper: IEEEPaper): EnhancedProjectSpec {
  const analysis = paper.analysis;
  const selectedIds = paper.selectedEnhancementIds || [];
  const rawRecommendations = analysis?.recommendations || [];

  const selectedRecs = rawRecommendations.filter((r) => selectedIds.includes(r.id));
  const fallbackRecs = rawRecommendations.slice(0, 2);
  const activeRecs = selectedRecs.length > 0 ? selectedRecs : fallbackRecs;

  const title = `Enhanced ${paper.title.replace(/^(An?|The)\s+/i, '')} Engine`;
  const primaryLimitation = analysis?.limitations[0]?.title || 'System Bottleneck in Baseline';
  const primaryGap = analysis?.researchGaps[0]?.title || 'Gaps in Real-Time Scalability';

  // Build Architecture Flows dynamically based on active paper and enhancements
  const existingFlow: ArchitectureNode[] = [
    { id: 'ex-in', label: 'Dataset / Event Ingest', type: 'input' },
    { id: 'ex-proc', label: `Baseline Methodology (${paper.title.slice(0, 30)})`, type: 'processing' },
    { id: 'ex-out', label: 'Original Model Predictions', type: 'output' }
  ];

  const enhancedFlow: ArchitectureNode[] = [
    { id: 'enh-in', label: 'Dataset / High-Frequency Ingest', type: 'input' }
  ];

  activeRecs.forEach((rec, idx) => {
    enhancedFlow.push({
      id: `enh-mod-${idx + 1}`,
      label: rec.traceabilityLink?.newSoftwareModule || `Software Optimization Module ${idx + 1}`,
      type: 'new_module',
      isNew: true,
      linkedLimitation: rec.traceabilityLink?.limitation || primaryLimitation
    });
  });

  enhancedFlow.push({
    id: 'enh-proc',
    label: 'AI Inference & Adaptive Decision Logic',
    type: 'processing'
  });

  enhancedFlow.push({
    id: 'enh-opt',
    label: 'Fault-Tolerant Optimization Layer',
    type: 'optimization',
    isNew: true
  });

  enhancedFlow.push({
    id: 'enh-out',
    label: 'Validated Enhanced Output Stream',
    type: 'output'
  });

  // Map active enhancements to Software Modules
  const softwareModules = activeRecs.map((rec, idx) => {
    const modName = rec.traceabilityLink?.newSoftwareModule || `Module_${idx + 1}_Controller.ts`;
    return {
      name: modName,
      description: rec.implementationApproach || rec.rationale,
      technologies: ['TypeScript', 'Node.js', 'RxJS', 'WebCrypto API'],
      linkedLimitation: rec.traceabilityLink?.limitation || primaryLimitation,
      codeSnippet: `// ${modName}\n// Refinement Module directly addressing ${rec.traceabilityLink?.limitation || 'limitation'}\nexport class ${modName.replace(/\.[a-z]+$/, '')} {\n  private state: Map<string, any> = new Map();\n\n  public async process(payload: any): Promise<any> {\n    // Optimized software pipeline execution\n    const timestamp = Date.now();\n    return { status: 'OPTIMIZED', payload, timestamp };\n  }\n}`
    };
  });

  return {
    projectTitle: title,
    oneLineConcept: `A software-only extension of "${paper.title}" introducing modular algorithmic refinements to overcome ${primaryLimitation}.`,
    problemStatement: analysis?.problemStatement || `The baseline methodology suffers from ${primaryLimitation}, leading to execution overhead and constrained applicability.`,
    existingSystem: {
      title: `Baseline Paper Architecture (${paper.year})`,
      architectureOverview: typeof analysis?.methodology === 'object' ? analysis.methodology.processing : 'The original approach employs sequential data processing without dynamic caching or error compensation.',
      keyComponents: [
        'Sequential Input Ingestion',
        'Uncached Model Processing Engine',
        'Standard Static Prediction Output'
      ],
      limitations: (analysis?.limitations || []).map((l) => l.title),
    },
    researchGaps: (analysis?.researchGaps || []).map((g) => g.title),
    selectedEnhancements: activeRecs.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      rationale: r.rationale,
      newSoftwareModule: r.traceabilityLink?.newSoftwareModule || 'SoftwareOptimizationWrapper.ts',
      linkedLimitation: r.traceabilityLink?.limitation || primaryLimitation
    })),
    proposedSolution: `By introducing ${activeRecs.length} modular software enhancements, the platform decouples heavy processing, enforces zero-trust cryptographic validation, and applies error-residual compensation to eliminate ${primaryLimitation}.`,
    architecture: {
      existingFlow,
      enhancedFlow
    },
    softwareModules,
    technologyStack: [
      { category: 'Runtime & Core', items: ['TypeScript 5.x', 'Node.js ESM', 'Express 5'] },
      { category: 'AI & Data Processing', items: ['Google GenAI SDK', 'TensorFlow.js / ONNX', 'RxJS Stream Processing'] },
      { category: 'Security & Integrity', items: ['WebCrypto AES-256 GCM', 'OAuth JWT Authentication'] },
      { category: 'Testing & Validation', items: ['Vitest Benchmarking Suite', 'Client-side Microsecond Timers'] }
    ],
    implementationPlan: [
      {
        phase: 'Phase 1: Baseline Decoupling',
        title: 'Software Layer Extraction',
        description: 'Isolate original data ingestion pipeline and construct mock benchmark interfaces.',
        deliverable: 'Isolated Data Ingest Module & Baseline Benchmarks'
      },
      {
        phase: 'Phase 2: Enhancement Integration',
        title: 'New Software Module Deployment',
        description: `Implement ${activeRecs.map(r => r.traceabilityLink?.newSoftwareModule || 'Module').join(', ')} into stream processing pipeline.`,
        deliverable: 'Integrated Enhancement Pipeline'
      },
      {
        phase: 'Phase 3: Empirical Validation',
        title: 'Benchmarking & Metric Measurement',
        description: 'Execute latency, throughput, and accuracy tests under controlled workload simulation.',
        deliverable: 'Validated Performance Report'
      }
    ],
    validationPlan: [
      {
        testType: 'Latency benchmark',
        description: 'Measure microsecond p99 latency before and after software batching optimization.',
        metric: 'Processing Time (ms)',
        method: 'Client-side high-resolution performance.now() execution benchmark',
        status: 'ESTIMATED'
      },
      {
        testType: 'Throughput benchmark',
        description: 'Evaluate peak payload events processed per second without event drops.',
        metric: 'Events / sec',
        method: 'Simulated high-frequency queue stress runner',
        status: 'ESTIMATED'
      },
      {
        testType: 'Accuracy evaluation',
        description: 'Verify error residual reduction across test datasets.',
        metric: 'Top-1 Prediction Accuracy / F1 Score',
        method: 'Cross-validation against ground truth labels',
        status: 'ESTIMATED'
      }
    ],
    expectedImpact: `Eliminates ${primaryLimitation} with zero physical hardware additions, providing a scalable, software-only implementation for production adoption.`,
    limitationsOfEnhancement: [
      'Requires initial baseline dataset calibration.',
      'Slight memory overhead during buffer queue spikes.'
    ],
    futureWork: [
      'Extend auto-scaling buffer bounds across distributed cluster nodes.',
      'Integrate real-time stream telemetry telemetry exporters.'
    ]
  };
}
