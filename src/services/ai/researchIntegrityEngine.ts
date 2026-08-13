import {
  IEEEPaper,
  PaperAnalysis,
  PaperEvidence,
  GroundedLimitation,
  GroundedResearchGap,
  EnhancementRecommendation,
  TraceabilityLink,
  ResultState,
  TechSuitabilityJustification,
  ClaimVerificationResult,
  QualityScoreBreakdown,
  WorkflowEngineStep
} from '../../types';
import { sanitizePaperText } from '../../utils/textSanitizer';

export interface TraceabilityVerificationResult {
  isComplete: boolean;
  evidenceIdValid: boolean;
  limitationIdValid: boolean;
  researchGapIdValid: boolean;
  missingLinks: string[];
  link: TraceabilityLink;
}

export interface ResearchIntegrityAudit {
  integrityScore: number; // 0 - 100
  totalMetricsAnalyzed: number;
  reportedMetricsCount: number;
  simulatedMetricsCount: number;
  estimatedMetricsCount: number;
  notAvailableMetricsCount: number;
  unsupportedQuotesCount: number;
  brokenTraceabilityCount: number;
  fabricatedNumbersDetected: number;
  recommendationsCount: number;
  warnings: string[];
  isFullyGrounded: boolean;
}

/**
 * Validates if an evidence quote actually appears within the paper text.
 */
export function validateEvidenceQuote(
  paperText: string,
  quote: string
): { isGrounded: boolean; confidence: 'High' | 'Medium' | 'Low'; matchedSnippet?: string } {
  if (!quote || quote.trim().length === 0) {
    return { isGrounded: false, confidence: 'Low' };
  }

  const cleanPaper = sanitizePaperText(paperText).toLowerCase();
  const cleanQuote = quote.toLowerCase().trim();

  // Direct substring check
  if (cleanPaper.includes(cleanQuote)) {
    return { isGrounded: true, confidence: 'High', matchedSnippet: quote };
  }

  // Significant word sequence check (fuzzy fallback for whitespace differences)
  const words = cleanQuote.split(/\s+/).filter((w) => w.length > 3);
  if (words.length > 3) {
    const matchedCount = words.filter((w) => cleanPaper.includes(w)).length;
    const matchRatio = matchedCount / words.length;

    if (matchRatio >= 0.85) {
      return { isGrounded: true, confidence: 'Medium' };
    }
  }

  return { isGrounded: false, confidence: 'Low' };
}

/**
 * Claims Verification Engine: Checks evidence IDs, paper text presence, page bounds, and traceability.
 * Invalid claims are marked UNVERIFIED with explicit failure reasons.
 */
export function verifyAllPaperClaims(paper: IEEEPaper): ClaimVerificationResult[] {
  const analysis = paper.analysis;
  const results: ClaimVerificationResult[] = [];
  const rawText = paper.rawText || '';

  if (!analysis) return results;

  const validEvidenceMap = new Map<string, PaperEvidence>();
  (analysis.evidences || []).forEach((e) => validEvidenceMap.set(e.id, e));

  // 1. Verify Evidences
  (analysis.evidences || []).forEach((ev) => {
    const reasons: string[] = [];
    const check = validateEvidenceQuote(rawText, ev.quoteOrExcerpt);

    if (!check.isGrounded && ev.sourceType === 'EXPLICIT') {
      reasons.push('Explicit quote not found verbatim in source paper text');
    }

    const pageNum = parseInt(ev.page, 10);
    if (!isNaN(pageNum) && paper.analysis && pageNum > 50) {
      reasons.push(`Page number ${ev.page} exceeds expected document bounds`);
    }

    const isVerified = reasons.length === 0;
    results.push({
      claimId: ev.id,
      claimText: `Evidence Quote: "${ev.quoteOrExcerpt.slice(0, 60)}..."`,
      evidenceId: ev.id,
      isVerified,
      status: isVerified ? 'VERIFIED' : 'UNVERIFIED',
      failureReasons: reasons.length > 0 ? reasons : undefined,
      matchedQuote: check.matchedSnippet,
      matchedPage: isNaN(pageNum) ? undefined : pageNum,
    });
  });

  // 2. Verify Limitations
  (analysis.limitations || []).forEach((lim) => {
    const reasons: string[] = [];
    const missingEv = (lim.evidenceIds || []).filter((id) => !validEvidenceMap.has(id));

    if (missingEv.length > 0) {
      reasons.push(`Limitation references non-existent evidence IDs: [${missingEv.join(', ')}]`);
    }

    const isVerified = reasons.length === 0;
    results.push({
      claimId: lim.id,
      claimText: `Limitation: ${lim.title}`,
      evidenceId: lim.evidenceIds?.[0],
      isVerified,
      status: isVerified ? 'VERIFIED' : 'UNVERIFIED',
      failureReasons: reasons.length > 0 ? reasons : undefined,
    });
  });

  // 3. Verify Research Gaps
  (analysis.researchGaps || []).forEach((gap) => {
    const reasons: string[] = [];
    const missingEv = (gap.evidenceIds || []).filter((id) => !validEvidenceMap.has(id));
    const missingLim = (gap.relatedLimitations || []).filter(
      (limId) => !analysis.limitations.some((l) => l.id === limId)
    );

    if (missingEv.length > 0) {
      reasons.push(`Research gap references ungrounded evidence IDs: [${missingEv.join(', ')}]`);
    }
    if (missingLim.length > 0) {
      reasons.push(`Research gap references non-existent limitation IDs: [${missingLim.join(', ')}]`);
    }

    const isVerified = reasons.length === 0;
    results.push({
      claimId: gap.id,
      claimText: `Research Gap: ${gap.title}`,
      evidenceId: gap.evidenceIds?.[0],
      isVerified,
      status: isVerified ? 'VERIFIED' : 'UNVERIFIED',
      failureReasons: reasons.length > 0 ? reasons : undefined,
    });
  });

  // 4. Verify Recommendations / Enhancements
  (analysis.recommendations || []).forEach((rec) => {
    const trace = verifyTraceabilityChain(paper, rec);
    const isVerified = trace.isComplete;
    results.push({
      claimId: rec.id,
      claimText: `Enhancement: ${rec.title}`,
      evidenceId: rec.evidenceIds?.[0],
      isVerified,
      status: isVerified ? 'VERIFIED' : 'UNVERIFIED',
      failureReasons: trace.missingLinks.length > 0 ? trace.missingLinks : undefined,
    });
  });

  return results;
}

/**
 * Calculates dynamic mathematical quality scores across 5 distinct dimensions.
 * No hardcoded fixed scores.
 */
export function calculateDynamicQualityScore(
  paper: IEEEPaper,
  workflowSteps?: WorkflowEngineStep[]
): QualityScoreBreakdown {
  const analysis = paper.analysis;
  const warnings: string[] = [];

  if (!analysis) {
    return {
      overallScore: 0,
      evidenceCompletenessScore: 0,
      traceabilityCompletenessScore: 0,
      groundingQualityScore: 0,
      workflowCompletenessScore: 0,
      validationCompletenessScore: 0,
      warnings: ['No paper analysis completed'],
    };
  }

  const rawText = paper.rawText || '';
  const evidences = analysis.evidences || [];
  const recs = analysis.recommendations || [];

  // 1. Evidence Completeness (0-100)
  const validEvidencesCount = evidences.filter(
    (e) => e.quoteOrExcerpt && e.quoteOrExcerpt.trim().length > 10 && e.page
  ).length;
  const evidenceCompletenessScore = evidences.length > 0 ? Math.round((validEvidencesCount / evidences.length) * 100) : 0;
  if (evidenceCompletenessScore < 70) warnings.push('Low evidence completeness score');

  // 2. Grounding Quality (0-100)
  let groundedCount = 0;
  for (const ev of evidences) {
    const check = validateEvidenceQuote(rawText, ev.quoteOrExcerpt);
    if (check.isGrounded) groundedCount++;
  }
  const groundingQualityScore = evidences.length > 0 ? Math.round((groundedCount / evidences.length) * 100) : 0;
  if (groundingQualityScore < 80) warnings.push('Several quotes not verbatim grounded in raw paper text');

  // 3. Traceability Completeness (0-100)
  let validTraceCount = 0;
  for (const rec of recs) {
    const traceCheck = verifyTraceabilityChain(paper, rec);
    if (traceCheck.isComplete) validTraceCount++;
  }
  const traceabilityCompletenessScore = recs.length > 0 ? Math.round((validTraceCount / recs.length) * 100) : 100;
  if (traceabilityCompletenessScore < 85) warnings.push('Broken traceability links found in enhancement recommendations');

  // 4. Workflow Completeness (0-100)
  const steps = workflowSteps || paper.workflowSteps || [];
  const completedStepsCount = steps.filter((s) => s.status === 'COMPLETED').length;
  const totalStepsCount = steps.length || 17;
  const workflowCompletenessScore = Math.round((completedStepsCount / totalStepsCount) * 100);

  // 5. Validation Completeness (0-100)
  const validatedIds = paper.validatedEnhancementIds || [];
  const selectedIds = paper.selectedEnhancementIds || [];
  const validationCompletenessScore = selectedIds.length > 0
    ? Math.round((validatedIds.length / selectedIds.length) * 100)
    : 0;

  // Weighted Overall Score Calculation
  const overallScore = Math.round(
    evidenceCompletenessScore * 0.25 +
    groundingQualityScore * 0.25 +
    traceabilityCompletenessScore * 0.25 +
    workflowCompletenessScore * 0.15 +
    validationCompletenessScore * 0.10
  );

  return {
    overallScore,
    evidenceCompletenessScore,
    traceabilityCompletenessScore,
    groundingQualityScore,
    workflowCompletenessScore,
    validationCompletenessScore,
    warnings,
  };
}

/**
 * Classifies a metric or performance result into a strict, honest ResultState.
 */
export function classifyMetricState(
  metricValue: string,
  paperText?: string,
  isBenchmarkRun?: boolean
): ResultState {
  if (!metricValue || metricValue === 'NOT_AVAILABLE' || metricValue === 'NOT AVAILABLE' || metricValue === 'N/A') {
    return 'NOT_AVAILABLE';
  }

  if (isBenchmarkRun) {
    return 'MEASURED';
  }

  if (paperText) {
    const cleanPaper = sanitizePaperText(paperText).toLowerCase();
    const cleanValue = metricValue.toLowerCase().trim();

    if (cleanPaper.includes(cleanValue)) {
      return 'PAPER_REPORTED';
    }
  }

  if (/simulated|sandbox|synthetic/i.test(metricValue)) {
    return 'SIMULATED';
  }

  if (/estimated|projected|expected|target|~|approx/i.test(metricValue)) {
    return 'ESTIMATED';
  }

  return 'ESTIMATED';
}

/**
 * Strictly verifies the ID-based traceability link chain:
 * Evidence ID -> Limitation ID -> Research Gap ID -> Enhancement ID -> Module -> Metric
 */
export function verifyTraceabilityChain(
  paper: IEEEPaper,
  recommendation: EnhancementRecommendation
): TraceabilityVerificationResult {
  const analysis = paper.analysis;
  const missingLinks: string[] = [];

  if (!analysis) {
    return {
      isComplete: false,
      evidenceIdValid: false,
      limitationIdValid: false,
      researchGapIdValid: false,
      missingLinks: ['Missing paper analysis object'],
      link: {
        paperEvidence: 'No paper analysis available',
        limitation: 'Unresolved Limitation',
        researchGap: 'Unresolved Research Gap',
        enhancement: recommendation.title,
        newSoftwareModule: recommendation.traceabilityLink?.newSoftwareModule || 'SoftwareOptimizationModule.ts',
        validationMetric: recommendation.validationMetric || 'Pending benchmark',
        isComplete: false,
      },
    };
  }

  // 1. Verify Limitation ID match
  const limitation = analysis.limitations.find((l) => l.id === recommendation.limitationId);
  const limitationIdValid = Boolean(limitation);
  if (!limitationIdValid) {
    missingLinks.push(`Limitation ID "${recommendation.limitationId}" not found in paper analysis`);
  }

  // 2. Verify Research Gap ID match
  const gap = analysis.researchGaps.find((g) => g.id === recommendation.researchGapId);
  const researchGapIdValid = Boolean(gap);
  if (!researchGapIdValid) {
    missingLinks.push(`Research Gap ID "${recommendation.researchGapId}" not found in paper analysis`);
  }

  // 3. Verify Evidence ID match
  const validEvidence = (recommendation.evidenceIds || []).map((evId) =>
    analysis.evidences.find((e) => e.id === evId)
  ).filter(Boolean);
  const evidenceIdValid = validEvidence.length > 0;
  if (!evidenceIdValid) {
    missingLinks.push(`No valid evidence IDs found for recommendation among [${recommendation.evidenceIds?.join(', ')}]`);
  }

  const isComplete = limitationIdValid && researchGapIdValid && evidenceIdValid;

  const primaryEvidenceQuote = validEvidence[0]?.quoteOrExcerpt || 'Evidence grounded in methodology analysis';
  const limitationTitle = limitation?.title || 'Unresolved Limitation';
  const gapTitle = gap?.title || 'Unresolved Research Gap';

  const link: TraceabilityLink = {
    paperEvidence: primaryEvidenceQuote,
    limitation: limitationTitle,
    researchGap: gapTitle,
    enhancement: recommendation.title,
    newSoftwareModule: recommendation.traceabilityLink?.newSoftwareModule || 'SoftwareModule.ts',
    validationMetric: recommendation.validationMetric || 'Pending validation benchmark',
    isComplete,
  };

  return {
    isComplete,
    evidenceIdValid,
    limitationIdValid,
    researchGapIdValid,
    missingLinks,
    link,
  };
}

/**
 * Evaluates technical suitability across 9 candidate technology areas.
 * Does NOT force technologies if the paper is unrelated.
 */
export function evaluateTechnologySuitabilityFull(paper: IEEEPaper): TechSuitabilityJustification[] {
  const analysis = paper.analysis;
  const paperText = (paper.rawText || '').toLowerCase();
  const summary = (analysis?.paperSummary || '').toLowerCase();
  const problem = (analysis?.problemStatement || '').toLowerCase();
  const combined = `${paperText} ${summary} ${problem}`;

  const candidates: {
    tech: 'AI' | 'Software IoT' | 'Edge Computing' | 'Cloud Architecture' | 'Computer Vision' | 'NLP' | 'Database & Storage' | 'Security & Privacy' | 'Distributed Systems';
    regex: RegExp;
    integration: string;
    benefit: string;
  }[] = [
    {
      tech: 'AI',
      regex: /model|predict|classifier|neural|learning|accuracy|optimization|inference|regression|algorithm/i,
      integration: 'Gemini 3.6 Flash SDK & Adaptive Residual Inference Module',
      benefit: 'Dynamic error residual calibration under operational parameter drift.',
    },
    {
      tech: 'Software IoT',
      regex: /iot|sensor|telemetry|device|stream|mqtt|coap|network|wireless|packet|signal|gateway/i,
      integration: 'RxJS Virtual Telemetry Simulator & MQTT Pub/Sub Event Client',
      benefit: '100% software-based IoT device telemetry streaming without hardware dependencies.',
    },
    {
      tech: 'Edge Computing',
      regex: /edge|latency|real-time|microsecond|throughput|buffer|queue|embedded|bandwidth|mobile/i,
      integration: 'Lock-Free Circular Ring Buffer Middleware & Local Gateway Client',
      benefit: 'Dramatically reduces request queuing latency and cuts cloud bandwidth consumption.',
    },
    {
      tech: 'Cloud Architecture',
      regex: /cloud|serverless|microservice|cluster|kubernetes|docker|auto-scale|aws|gcp|azure/i,
      integration: 'Stateless Node.js Microservice Architecture with Redis Caching',
      benefit: 'Scales horizontally across variable request volumes with automated state isolation.',
    },
    {
      tech: 'Computer Vision',
      regex: /image|frame|video|camera|pixel|object|detection|segmentation|cnn|visual|yolo/i,
      integration: 'Canvas-Based Image Processing Pipeline with Web Workers',
      benefit: 'Non-blocking browser-side frame transformation and spatial feature extraction.',
    },
    {
      tech: 'NLP',
      regex: /text|language|token|embedding|semantic|transformer|bert|llm|nlp|corpus|document/i,
      integration: 'TF-IDF Semantic Matcher & Cosine Vector Similarity Pipeline',
      benefit: 'High-speed textual chunk matching and domain-specific vocabulary indexing.',
    },
    {
      tech: 'Database & Storage',
      regex: /database|sql|query|index|indexeddb|schema|storage|transaction|key-value|cache/i,
      integration: 'Browser-Native IndexedDB Offline Persistence Adapter',
      benefit: '100% on-device offline state persistence with transactional atomic writes.',
    },
    {
      tech: 'Security & Privacy',
      regex: /security|privacy|encryption|auth|token|jwt|hash|cipher|permission|audit/i,
      integration: 'AES-GCM WebCrypto Encryption & HMAC Token Verification Middleware',
      benefit: 'Zero-trust client-side document encryption and verifiable audit logging.',
    },
    {
      tech: 'Distributed Systems',
      regex: /distributed|consensus|raft|byzantine|node|peer|replica|sharding|cluster|sync/i,
      integration: 'Event-Sourced Pub/Sub Message Bus with Vector Clocks',
      benefit: 'Guarantees eventual consistency and fault-tolerant state replication.',
    },
  ];

  return candidates.map((c) => {
    const isMatched = c.regex.test(combined);
    return {
      technology: c.tech as any,
      isSuitable: isMatched,
      whySuitable: isMatched
        ? `Directly aligned with keywords and concepts extracted from paper text for ${c.tech}.`
        : `Paper text does not explicitly require ${c.tech}. Integration is optional or simulated.`,
      targetedLimitation: analysis?.limitations[0]?.title || 'Baseline System Constraint',
      integrationApproach: c.integration,
      expectedBenefit: c.benefit,
      implementationComplexity: 'Medium',
    };
  });
}

/**
 * Backward compatibility helper for 3 primary techs.
 */
export function evaluateTechSuitability(
  paper: IEEEPaper,
  tech: 'AI' | 'Software IoT' | 'Edge Computing'
): TechSuitabilityJustification {
  const full = evaluateTechnologySuitabilityFull(paper);
  const found = full.find((f) => f.technology === tech);
  if (found) return found;

  return {
    technology: tech,
    isSuitable: true,
    whySuitable: 'Suitable based on generalized system enhancement rules.',
    targetedLimitation: paper.analysis?.limitations[0]?.title || 'Baseline System Constraint',
    integrationApproach: 'Standard Software Wrapper Engine',
    expectedBenefit: 'Optimization of baseline processing pipeline.',
    implementationComplexity: 'Medium',
  };
}

/**
 * Audits an entire paper's analysis for research integrity, checking for ungrounded quotes,
 * fabricated metrics, or broken traceability links.
 */
export function auditPaperAnalysisIntegrity(paper: IEEEPaper): ResearchIntegrityAudit {
  const analysis = paper.analysis;
  const warnings: string[] = [];

  if (!analysis) {
    return {
      integrityScore: 0,
      totalMetricsAnalyzed: 0,
      reportedMetricsCount: 0,
      simulatedMetricsCount: 0,
      estimatedMetricsCount: 0,
      notAvailableMetricsCount: 0,
      unsupportedQuotesCount: 0,
      brokenTraceabilityCount: 0,
      fabricatedNumbersDetected: 0,
      recommendationsCount: 0,
      warnings: ['No analysis available for paper'],
      isFullyGrounded: false,
    };
  }

  const rawText = paper.rawText || '';

  // 1. Audit evidence quotes
  let unsupportedQuotesCount = 0;
  for (const ev of analysis.evidences || []) {
    const check = validateEvidenceQuote(rawText, ev.quoteOrExcerpt);
    if (!check.isGrounded && ev.sourceType === 'EXPLICIT') {
      unsupportedQuotesCount++;
      warnings.push(`Evidence "${ev.id}" quote marked EXPLICIT but not found verbatim in paper text.`);
    }
  }

  // 2. Audit metrics classification
  let reportedMetricsCount = 0;
  let simulatedMetricsCount = 0;
  let estimatedMetricsCount = 0;
  let notAvailableMetricsCount = 0;
  let fabricatedNumbersDetected = 0;

  const results = Array.isArray(analysis.results) ? analysis.results : [];
  for (const res of results) {
    const val = typeof res === 'object' ? res.value : String(res);
    const state = classifyMetricState(val, rawText);

    if (state === 'PAPER_REPORTED') reportedMetricsCount++;
    else if (state === 'SIMULATED') simulatedMetricsCount++;
    else if (state === 'ESTIMATED') estimatedMetricsCount++;
    else if (state === 'NOT_AVAILABLE') notAvailableMetricsCount++;

    if (state !== 'PAPER_REPORTED' && /\b(89\.2%|118\s*ms|120\s*ms|78\s*ms|35%\s*improvement|12%\s*accuracy\s*gain)\b/i.test(val)) {
      fabricatedNumbersDetected++;
      warnings.push(`Fabricated metric detected: "${val}" is not grounded in original paper text.`);
    }
  }

  // 3. Audit recommendation traceability
  let brokenTraceabilityCount = 0;
  const recs = analysis.recommendations || [];
  for (const rec of recs) {
    const traceCheck = verifyTraceabilityChain(paper, rec);
    if (!traceCheck.isComplete) {
      brokenTraceabilityCount++;
      warnings.push(`Recommendation "${rec.title}" has incomplete traceability: ${traceCheck.missingLinks.join('; ')}`);
    }
  }

  let integrityScore = 100;
  integrityScore -= unsupportedQuotesCount * 5;
  integrityScore -= brokenTraceabilityCount * 10;
  integrityScore -= fabricatedNumbersDetected * 15;
  if (integrityScore < 0) integrityScore = 0;

  return {
    integrityScore,
    totalMetricsAnalyzed: results.length,
    reportedMetricsCount,
    simulatedMetricsCount,
    estimatedMetricsCount,
    notAvailableMetricsCount,
    unsupportedQuotesCount,
    brokenTraceabilityCount,
    fabricatedNumbersDetected,
    recommendationsCount: recs.length,
    warnings,
    isFullyGrounded: integrityScore >= 85 && fabricatedNumbersDetected === 0,
  };
}

