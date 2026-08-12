import {
  IEEEPaper,
  PaperAnalysis,
  PaperEvidence,
  GroundedLimitation,
  GroundedResearchGap,
  GroundedMethodology,
  GroundedResultMetric
} from '../../types';

export async function analyzePaperWithAI(paper: IEEEPaper): Promise<PaperAnalysis> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paperId: paper.id,
        title: paper.title,
        textContent: paper.rawText || paper.title,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'AI analysis could not be completed.');
    }

    const data = await response.json();
    if (!data.success || !data.analysis) {
      throw new Error('AI analysis could not be completed.');
    }

    const raw = data.analysis;

    // Evidences Array
    const evidences: PaperEvidence[] = Array.isArray(raw.evidences)
      ? raw.evidences.map((ev: any, idx: number) => ({
          id: ev.id || `ev-${idx + 1}`,
          paperId: paper.id,
          page: ev.page || '1',
          section: ev.section || 'General Text',
          chunkId: ev.chunkId || `chunk-p${ev.page || 1}-c${idx + 1}`,
          quoteOrExcerpt: ev.quoteOrExcerpt || 'Extracted passage from paper text.',
          sourceType: ev.sourceType === 'INFERRED' ? 'INFERRED' : 'EXPLICIT',
        }))
      : [];

    // Limitations Array
    const limitations: GroundedLimitation[] = Array.isArray(raw.limitations)
      ? raw.limitations.map((lim: any, idx: number) => ({
          id: lim.id || `lim-${idx + 1}`,
          title: lim.title || `Identified Limitation ${idx + 1}`,
          explanation: lim.explanation || lim.text || 'Research constraint observed.',
          type: lim.type === 'INFERRED' ? 'INFERRED' : 'EXPLICIT', // Never label inferred as explicit
          evidenceIds: Array.isArray(lim.evidenceIds) ? lim.evidenceIds : [],
          page: lim.page || '1',
          section: lim.section || 'Methodology',
          confidence: lim.confidence === 'Low' ? 'Low' : lim.confidence === 'Medium' ? 'Medium' : 'High',
        }))
      : [];

    // Research Gaps Array
    const researchGaps: GroundedResearchGap[] = Array.isArray(raw.researchGaps)
      ? raw.researchGaps.map((gap: any, idx: number) => ({
          id: gap.id || `gap-${idx + 1}`,
          title: gap.title || `Research Gap ${idx + 1}`,
          explanation: gap.explanation || gap.description || '',
          evidenceIds: Array.isArray(gap.evidenceIds) ? gap.evidenceIds : [],
          relatedLimitations: Array.isArray(gap.relatedLimitations) ? gap.relatedLimitations : [],
          gapType: gap.gapType || 'Technical',
          confidence: gap.confidence === 'Low' ? 'Low' : gap.confidence === 'Medium' ? 'Medium' : 'High',
        }))
      : [];

    // Methodology
    const methodology: GroundedMethodology = typeof raw.methodology === 'object' && raw.methodology !== null
      ? {
          input: raw.methodology.input || 'NOT_FOUND',
          processing: raw.methodology.processing || 'NOT_FOUND',
          algorithm: raw.methodology.algorithm || 'NOT_FOUND',
          output: raw.methodology.output || 'NOT_FOUND',
          architecture: raw.methodology.architecture || 'NOT_FOUND',
          dataset: raw.methodology.dataset || 'NOT_FOUND',
          evaluation: raw.methodology.evaluation || 'NOT_FOUND',
        }
      : {
          input: 'NOT_FOUND',
          processing: typeof raw.methodology === 'string' ? raw.methodology : 'NOT_FOUND',
          algorithm: 'NOT_FOUND',
          output: 'NOT_FOUND',
          architecture: 'NOT_FOUND',
          dataset: 'NOT_FOUND',
          evaluation: 'NOT_FOUND',
        };

    // Results Array
    const results: GroundedResultMetric[] = Array.isArray(raw.results)
      ? raw.results.map((resItem: any) => ({
          value: resItem.value || 'NOT_FOUND',
          metric: resItem.metric || 'Reported Metric',
          source: resItem.source || 'Paper Text',
          page: resItem.page || '1',
          evidenceId: resItem.evidenceId,
        }))
      : [];

    const analysis: PaperAnalysis = {
      analyzedAt: new Date().toISOString(),
      paperInformation: {
        title: paper.title,
        authors: paper.authors && paper.authors.length > 0 ? paper.authors : ['Extracted from IEEE Paper'],
        year: paper.year || new Date().getFullYear().toString(),
      },
      paperSummary: raw.paperSummary || raw.abstract || 'NOT_FOUND',
      abstract: raw.paperSummary || raw.abstract || 'NOT_FOUND',
      problemStatement: raw.problemStatement || raw.problem || 'NOT_FOUND',
      problem: raw.problemStatement || raw.problem || 'NOT_FOUND',
      objectives: Array.isArray(raw.objectives) ? raw.objectives : [],
      methodology,
      algorithms: Array.isArray(raw.algorithms) ? raw.algorithms : [],
      technologies: Array.isArray(raw.technologies) ? raw.technologies : (Array.isArray(raw.technology) ? raw.technology : []),
      technology: Array.isArray(raw.technologies) ? raw.technologies : (Array.isArray(raw.technology) ? raw.technology : []),
      datasets: Array.isArray(raw.datasets) ? raw.datasets : (raw.dataset ? [raw.dataset] : []),
      dataset: raw.datasets && raw.datasets.length > 0 ? raw.datasets[0] : (typeof raw.dataset === 'string' ? raw.dataset : 'NOT_FOUND'),
      results,
      limitations,
      futureWork: Array.isArray(raw.futureWork) ? raw.futureWork : [],
      references: Array.isArray(raw.references) ? raw.references : [],
      researchGaps,
      evidences,
    };

    return analysis;
  } catch (err: any) {
    console.error('Failed to perform AI analysis via server:', err);
    throw new Error(err?.message || 'AI analysis could not be completed.');
  }
}
