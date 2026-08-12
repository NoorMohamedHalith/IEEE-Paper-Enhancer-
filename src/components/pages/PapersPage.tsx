import React, { useRef, useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { extractTextFromPDF } from '../../services/pdf/pdfParser';
import { IEEEPaper } from '../../types';
import { WorkflowStepper } from '../layout/WorkflowStepper';
import { EmptyStateCard } from '../common/EmptyStateCard';
import { Upload, Link as LinkIcon, FileText, Trash2, Play, CheckCircle2, AlertCircle, Loader2, ArrowRight, Bookmark } from 'lucide-react';

export const PapersPage: React.FC = () => {
  const {
    papers,
    activePaperId,
    selectActivePaper,
    addPaper,
    removePaper,
    triggerAnalysis,
    isAnalyzing,
    setActiveTab,
  } = usePaperContext();

  const [paperUrl, setPaperUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processPDFFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a valid IEEE research paper in PDF format.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await extractTextFromPDF(file);
      const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

      const newPaper: IEEEPaper = {
        id: `paper-${Date.now()}`,
        title: cleanTitle,
        authors: ['Authors pending analysis'],
        year: new Date().getFullYear().toString(),
        status: 'Awaiting analysis',
        uploadedAt: new Date().toISOString(),
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        rawText: result.text,
        sourceType: 'pdf',
        projectStatus: 'Not Started'
      };

      await addPaper(newPaper);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to process PDF file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperUrl.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/fetch-paper-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: paperUrl.trim() })
      });

      const data = await response.json();

      const newPaper: IEEEPaper = {
        id: `paper-${Date.now()}`,
        title: data.metadata?.title || 'IEEE Research Paper Link',
        authors: ['IEEE Research Authors'],
        year: new Date().getFullYear().toString(),
        status: 'Awaiting analysis',
        uploadedAt: new Date().toISOString(),
        pdfUrl: paperUrl.trim(),
        rawText: `Paper URL reference: ${paperUrl.trim()}`,
        sourceType: 'url',
        projectStatus: 'Not Started'
      };

      await addPaper(newPaper);
      setPaperUrl('');
    } catch (err: any) {
      setErrorMsg('Failed to resolve paper URL metadata.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Workflow Stepper */}
      <WorkflowStepper />

      {/* Upload Section */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs">
        <h2 className="text-base font-bold text-zinc-900 mb-1">IEEE Research Paper Import</h2>
        <p className="text-xs text-zinc-500 mb-5">
          Upload IEEE PDF files or paste IEEE Xplore / ArXiv links for AI analysis and research gap extraction.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* PDF Drag & Drop Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 hover:border-emerald-800 bg-zinc-50/50 hover:bg-emerald-50/30 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processPDFFile(e.target.files[0]);
                }
              }}
            />

            {isLoading ? (
              <div className="py-2">
                <Loader2 className="w-6 h-6 text-emerald-800 animate-spin mx-auto mb-2" />
                <p className="text-xs font-semibold text-zinc-800">Processing document...</p>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-zinc-900">Drag & drop IEEE PDF file</h4>
                <p className="text-[11px] text-zinc-500 mt-1">or click to browse local files</p>
              </>
            )}
          </div>

          {/* Paste Paper Link Form */}
          <form onSubmit={handleUrlSubmit} className="flex flex-col justify-between bg-zinc-50/50 rounded-xl p-5 border border-zinc-200">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                Paste IEEE Paper URL / DOI
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={paperUrl}
                  onChange={(e) => setPaperUrl(e.target.value)}
                  placeholder="https://ieeexplore.ieee.org/document/..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 bg-white"
                />
                <LinkIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="mt-4 text-right">
              <button
                type="submit"
                disabled={isLoading || !paperUrl.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 ml-auto"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LinkIcon className="w-3.5 h-3.5" />}
                <span>Fetch Paper Link</span>
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Uploaded Papers List */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Uploaded Research Papers ({papers.length})</h3>
            <p className="text-xs text-zinc-500">Manage paper documents and launch AI analysis</p>
          </div>
        </div>

        {papers.length === 0 ? (
          <EmptyStateCard
            icon={FileText}
            title="No research papers uploaded yet"
            message="Upload an IEEE paper or paste a research link above to begin methodology analysis and research gap identification."
          />
        ) : (
          <div className="space-y-3">
            {papers.map((paper) => {
              const isActive = paper.id === activePaperId;

              return (
                <div
                  key={paper.id}
                  className={`
                    p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4
                    ${
                      isActive
                        ? 'bg-emerald-50/50 border-emerald-800/60 ring-1 ring-emerald-800/30'
                        : 'bg-zinc-50/60 border-zinc-200 hover:border-zinc-300'
                    }
                  `}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-zinc-900 truncate">
                          {paper.title}
                        </span>

                        {/* Paper Status Badge */}
                        <span
                          className={`
                            px-2 py-0.5 rounded-full text-[10px] font-semibold border
                            ${
                              paper.status === 'Analyzed'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : paper.status === 'Analyzing'
                                ? 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                                : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                            }
                          `}
                        >
                          {paper.status}
                        </span>

                        {isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-800 text-white">
                            Active Context
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 flex-wrap">
                        <span>Authors: {paper.authors.join(', ')}</span>
                        <span>•</span>
                        <span>Year: {paper.year}</span>
                        {paper.fileSize && (
                          <>
                            <span>•</span>
                            <span>Size: {paper.fileSize}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    {!isActive && (
                      <button
                        onClick={() => selectActivePaper(paper.id)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-white"
                      >
                        Set Active
                      </button>
                    )}

                    {paper.status === 'Awaiting analysis' && (
                      <button
                        onClick={() => triggerAnalysis(paper.id)}
                        disabled={isAnalyzing}
                        className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Analyze</span>
                      </button>
                    )}

                    {paper.status === 'Analyzed' && (
                      <button
                        onClick={() => {
                          selectActivePaper(paper.id);
                          setActiveTab('analysis');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-1"
                      >
                        <span>View Results</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => removePaper(paper.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
