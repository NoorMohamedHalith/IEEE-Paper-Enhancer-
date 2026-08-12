import React, { useState, useRef } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { extractTextFromPDF } from '../../services/pdf/pdfParser';
import { IEEEPaper } from '../../types';
import { X, Upload, Link as LinkIcon, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const UploadModal: React.FC = () => {
  const { isUploadModalOpen, setIsUploadModalOpen, addPaper, triggerAnalysis, settings } = usePaperContext();
  const [activeTab, setActiveTab] = useState<'pdf' | 'url'>('pdf');
  const [paperUrl, setPaperUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadModalOpen) return null;

  const handleClose = () => {
    setIsUploadModalOpen(false);
    setErrorMsg(null);
    setPaperUrl('');
    setIsLoading(false);
  };

  const processPDFFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a valid IEEE research paper in PDF format.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await extractTextFromPDF(file);

      // Clean title from file name
      const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

      const newPaper: IEEEPaper = {
        id: `paper-${Date.now()}`,
        title: cleanTitle,
        authors: ['Authors pending extraction'],
        year: new Date().getFullYear().toString(),
        status: 'Awaiting analysis',
        uploadedAt: new Date().toISOString(),
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        rawText: result.text,
        sourceType: 'pdf',
        projectStatus: 'Not Started'
      };

      await addPaper(newPaper);

      if (settings.autoAnalyzeOnUpload) {
        handleClose();
        await triggerAnalysis(newPaper.id);
      } else {
        handleClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to process PDF file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processPDFFile(e.dataTransfer.files[0]);
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
        authors: ['IEEE Author / Research Group'],
        year: new Date().getFullYear().toString(),
        status: 'Awaiting analysis',
        uploadedAt: new Date().toISOString(),
        pdfUrl: paperUrl.trim(),
        rawText: `Paper URL reference: ${paperUrl.trim()}`,
        sourceType: 'url',
        projectStatus: 'Not Started'
      };

      await addPaper(newPaper);
      handleClose();
    } catch (err: any) {
      setErrorMsg('Failed to resolve paper URL metadata.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
              IX
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Upload Research Paper</h3>
              <p className="text-xs text-zinc-500">Supported format: IEEE PDF files or Paper URLs</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-200 bg-zinc-50/60 p-1.5 gap-2">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'pdf'
                ? 'bg-white text-emerald-900 border border-zinc-200 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-800" />
            Upload PDF Document
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'url'
                ? 'bg-white text-emerald-900 border border-zinc-200 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-emerald-800" />
            Paste Paper Link
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'pdf' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${
                  isDragOver
                    ? 'border-emerald-800 bg-emerald-50/50'
                    : 'border-zinc-300 hover:border-emerald-800 hover:bg-zinc-50'
                }
              `}
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
                <div className="py-4">
                  <Loader2 className="w-8 h-8 text-emerald-800 animate-spin mx-auto mb-2" />
                  <p className="text-xs font-semibold text-zinc-800">Extracting paper text & structure...</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 mb-1">
                    Drag & drop IEEE PDF paper here
                  </h4>
                  <p className="text-xs text-zinc-500 mb-4">or click to browse local files</p>
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold inline-block shadow-2xs">
                    Select PDF File
                  </span>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Paper URL (IEEE Xplore, ArXiv, DOI, or Direct Link)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={paperUrl}
                    onChange={(e) => setPaperUrl(e.target.value)}
                    placeholder="https://ieeexplore.ieee.org/document/..."
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800"
                  />
                  <LinkIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3.5 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Fetch & Add Paper</span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>IEEE InnovateX Verification</span>
            <span className="text-emerald-800 font-medium">Ready for AI Analysis</span>
          </div>
        </div>

      </div>
    </div>
  );
};
