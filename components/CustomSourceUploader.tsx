import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Globe, 
  PenTool, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  FileUp, 
  RefreshCw,
  BookOpen,
  Eye,
  Check
} from 'lucide-react';
import { transcribeNotesImage, fetchWebpageContent } from '../services/geminiService';

export interface CustomSourceData {
  sourceType: 'notes' | 'pdf' | 'webpage' | 'text';
  sourceTitle: string;
  sourceContent: string;
  sourceFileBase64?: string;
  sourceMimeType?: string;
}

interface CustomSourceUploaderProps {
  data: CustomSourceData;
  onChange: (data: CustomSourceData) => void;
}

export const CustomSourceUploader: React.FC<CustomSourceUploaderProps> = ({
  data,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'pdf' | 'webpage' | 'text'>(data.sourceType || 'notes');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [webpageUrl, setWebpageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(data.sourceFileBase64 || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (tab: 'notes' | 'pdf' | 'webpage' | 'text') => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage(null);
    onChange({
      ...data,
      sourceType: tab,
    });
  };

  // Convert File to Base64 helper
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Handle image upload for handwritten notes
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('Image file exceeds the 20MB maximum limit. Please choose a smaller photo.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsProcessing(true);
    setProcessingStatus('Loading handwritten notes photo...');

    try {
      const base64 = await fileToBase64(file);
      setImagePreview(base64);

      setProcessingStatus('Running Optical Character Recognition (OCR) on handwritten notes...');
      const ocrResult = await transcribeNotesImage(base64, file.type);

      const title = data.sourceTitle || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      onChange({
        sourceType: 'notes',
        sourceTitle: title,
        sourceContent: ocrResult.transcribedText,
        sourceFileBase64: base64,
        sourceMimeType: file.type,
      });

      setSuccessMessage(`Transcribed ${ocrResult.wordCount} words from notes with LaTeX math equations preserved!`);
    } catch (err: any) {
      console.error('Notes transcription failed:', err);
      setError(err.message || 'Could not transcribe image. You can also paste text notes manually.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle PDF / Document file upload
  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMessage(null);
    setIsProcessing(true);
    setProcessingStatus('Reading document file...');

    try {
      const isText = file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md');
      const title = data.sourceTitle || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      if (isText) {
        const text = await file.text();
        const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
        onChange({
          sourceType: 'pdf',
          sourceTitle: title,
          sourceContent: text,
        });
        setSuccessMessage(`Loaded ${wordCount} words from text document.`);
      } else {
        // PDF or doc file: read base64
        const base64 = await fileToBase64(file);
        // Also extract raw text preview if readable or pass base64
        onChange({
          sourceType: 'pdf',
          sourceTitle: title,
          sourceContent: data.sourceContent || `Document: ${file.name} (Uploaded ${Math.round(file.size / 1024)} KB)`,
          sourceFileBase64: base64,
          sourceMimeType: file.type || 'application/pdf',
        });
        setSuccessMessage(`Document "${file.name}" uploaded successfully (${Math.round(file.size / 1024)} KB).`);
      }
    } catch (err: any) {
      console.error('PDF read failed:', err);
      setError(err.message || 'Failed to read document file.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  // Handle Webpage URL Fetch
  const handleFetchWebpage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webpageUrl.trim()) {
      setError('Please enter a valid webpage URL (e.g., https://en.wikipedia.org/wiki/Newton%27s_laws_of_motion).');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsProcessing(true);
    setProcessingStatus('Fetching webpage & extracting readable study material...');

    try {
      const result = await fetchWebpageContent(webpageUrl.trim());
      onChange({
        sourceType: 'webpage',
        sourceTitle: result.title || webpageUrl.trim(),
        sourceContent: result.text,
      });
      setSuccessMessage(`Extracted ${result.wordCount} words from "${result.title}".`);
    } catch (err: any) {
      console.error('Webpage fetch failed:', err);
      setError(err.message || 'Failed to fetch webpage. Please check the URL or paste notes directly.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
    }
  };

  const handleClearSource = () => {
    setImagePreview(null);
    setWebpageUrl('');
    setError(null);
    setSuccessMessage(null);
    onChange({
      sourceType: activeTab,
      sourceTitle: '',
      sourceContent: '',
      sourceFileBase64: undefined,
      sourceMimeType: undefined,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-source Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => handleTabChange('notes')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
            activeTab === 'notes'
              ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <PenTool className={`w-4 h-4 ${activeTab === 'notes' ? 'text-emerald-400' : 'text-slate-500'}`} />
            {activeTab === 'notes' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">Handwritten Notes</div>
            <div className="text-[10px] text-slate-400">OCR Image-to-Text</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('pdf')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
            activeTab === 'pdf'
              ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <FileText className={`w-4 h-4 ${activeTab === 'pdf' ? 'text-emerald-400' : 'text-slate-500'}`} />
            {activeTab === 'pdf' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">PDF / Documents</div>
            <div className="text-[10px] text-slate-400">PDF, TXT, DOCX</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('webpage')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
            activeTab === 'webpage'
              ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <Globe className={`w-4 h-4 ${activeTab === 'webpage' ? 'text-emerald-400' : 'text-slate-500'}`} />
            {activeTab === 'webpage' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">Webpage Link</div>
            <div className="text-[10px] text-slate-400">Articles & Wikis</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('text')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
            activeTab === 'text'
              ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <BookOpen className={`w-4 h-4 ${activeTab === 'text' ? 'text-emerald-400' : 'text-slate-500'}`} />
            {activeTab === 'text' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">Paste Text</div>
            <div className="text-[10px] text-slate-400">Direct Notes / Outline</div>
          </div>
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
          <span>{processingStatus || 'Processing study material...'}</span>
        </div>
      )}

      {/* Tab 1: Handwritten Notes (OCR) */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border-2 border-dashed border-slate-700/80 bg-slate-950/40 hover:border-emerald-500/50 transition-colors text-center relative group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={handleImageFileChange}
              disabled={isProcessing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
            />
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <FileUp className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-white">
                  Upload Photos of Handwritten or Printed Notes
                </p>
                <p className="text-[11px] text-slate-400">
                  Drag & drop or tap to select. Multi-modal Neural OCR transcribes formulas, diagrams, and handwriting.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 mt-1">
                Supports JPG, PNG, WEBP (Max 20MB)
              </span>
            </div>
          </div>

          {imagePreview && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <img 
                src={imagePreview} 
                alt="Notes preview" 
                className="w-14 h-14 object-cover rounded-xl border border-slate-700 shrink-0" 
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {data.sourceTitle || 'Handwritten Notes Image'}
                </p>
                <p className="text-[11px] text-emerald-400 font-mono">
                  ✓ OCR transcription linked
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearSource}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title="Remove notes"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: PDF / Documents */}
      {activeTab === 'pdf' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border-2 border-dashed border-slate-700/80 bg-slate-950/40 hover:border-emerald-500/50 transition-colors text-center relative group">
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf,.txt,.md,.doc,.docx,application/pdf,text/plain"
              onChange={handlePdfFileChange}
              disabled={isProcessing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
            />
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-white">
                  Upload PDF, Textbook Chapter, or Study Material
                </p>
                <p className="text-[11px] text-slate-400">
                  Select any syllabus document or study sheet to automatically formulate questions.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 mt-1">
                PDF, TXT, DOCX
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Webpage URL Link */}
      {activeTab === 'webpage' && (
        <form onSubmit={handleFetchWebpage} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="url"
                value={webpageUrl}
                onChange={(e) => setWebpageUrl(e.target.value)}
                placeholder="https://en.wikipedia.org/wiki/Photosynthesis"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing || !webpageUrl.trim()}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fetch Webpage</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Paste any educational article, Wikipedia entry, or tutorial link to extract key concepts.
          </p>
        </form>
      )}

      {/* Common Document Metadata: Title & Extracted Content Area */}
      <div className="space-y-3 pt-2">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Source Title / Subject Identifier</span>
            <span className="text-[10px] font-mono text-slate-500">Optional</span>
          </label>
          <input
            type="text"
            value={data.sourceTitle}
            onChange={(e) => onChange({ ...data, sourceTitle: e.target.value })}
            placeholder="e.g., Physics Unit 4 Electrostatics Notes"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>Study Notes & Extracted Content</span>
              {data.sourceContent && (
                <span className="text-[10px] font-mono text-emerald-400">
                  ({data.sourceContent.trim().split(/\s+/).filter(Boolean).length} words)
                </span>
              )}
            </label>
            {data.sourceContent && (
              <button
                type="button"
                onClick={handleClearSource}
                className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Clear Content
              </button>
            )}
          </div>
          <textarea
            rows={5}
            value={data.sourceContent}
            onChange={(e) => onChange({ ...data, sourceContent: e.target.value })}
            placeholder={
              activeTab === 'notes'
                ? 'Transcribed text will appear here automatically after uploading an image. You can also edit or paste directly.'
                : activeTab === 'webpage'
                ? 'Extracted webpage article text will appear here automatically.'
                : 'Paste your revision notes, formula cheat sheets, summaries, or lecture transcripts here...'
            }
            className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
          />
        </div>
      </div>

    </div>
  );
};
