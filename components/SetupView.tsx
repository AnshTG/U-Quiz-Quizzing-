import React, { useState, useMemo, useEffect } from 'react';
import { QuizConfig } from '../types';
import { 
  CLASSES, 
  NCERT_DATA, 
  STRENGTHS 
} from '../constants';
import { 
  Sparkles, 
  BookOpen, 
  Check, 
  Search, 
  Sliders, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Flame,
  Zap,
  Bookmark,
  Bell,
  Share2,
  CheckCircle2,
  HelpCircle,
  Layers,
  GraduationCap,
  FileText,
  PenTool,
  Globe,
  ShieldCheck,
  Wand2
} from 'lucide-react';
import { ShareReminderModal } from './ShareReminderModal';
import { CustomSourceUploader, CustomSourceData } from './CustomSourceUploader';
import { FeatureKey, MaintenanceConfig, UserProfile } from '../types';

interface SetupViewProps {
  initialConfig?: Partial<QuizConfig>;
  onGenerateQuiz: (config: QuizConfig) => void;
  onCancel: () => void;
  maintenanceConfig?: MaintenanceConfig;
  onFeatureBlocked?: (featureKey: FeatureKey) => void;
  isAdminUnlocked?: boolean;
  user?: UserProfile | null;
}

export const SetupView: React.FC<SetupViewProps> = ({
  initialConfig,
  onGenerateQuiz,
  onCancel,
  maintenanceConfig,
  onFeatureBlocked,
  isAdminUnlocked = false,
  user,
}) => {
  // Mode: NCERT Curriculum or Custom Sources
  const [generationMode, setGenerationMode] = useState<'syllabus' | 'custom'>(
    initialConfig?.sourceType && initialConfig.sourceType !== 'syllabus' ? 'custom' : 'syllabus'
  );

  useEffect(() => {
    if (initialConfig?.sourceType && initialConfig.sourceType !== 'syllabus') {
      setGenerationMode('custom');
    }
  }, [initialConfig?.sourceType]);

  // STRICT REQUIREMENT: Do not preselect options anywhere unless explicitly provided in initialConfig
  const [selectedClass, setSelectedClass] = useState<string | null>(
    initialConfig?.class || null
  );
  const [selectedSubject, setSelectedSubject] = useState<string | null>(
    initialConfig?.subject || null
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    initialConfig?.topics || []
  );
  const [strength, setStrength] = useState<'Easy' | 'Medium' | 'Hard' | null>(
    initialConfig?.strength || null
  );
  const [quantity, setQuantity] = useState<number | null>(
    initialConfig?.quantity || null
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(
    initialConfig?.timeLimitMinutes !== undefined ? initialConfig.timeLimitMinutes : null
  );
  const [questionType, setQuestionType] = useState<'single' | 'multiple' | 'both'>(
    initialConfig?.questionType || 'single'
  );

  // Custom Instructions state
  const [customInstructions, setCustomInstructions] = useState<string>(
    initialConfig?.customInstructions || ''
  );

  // Custom Source Data (Notes OCR, PDF, Webpage, Paste Text)
  const [customSourceData, setCustomSourceData] = useState<CustomSourceData>({
    sourceType: (initialConfig?.sourceType as any) || 'notes',
    sourceTitle: initialConfig?.sourceTitle || '',
    sourceContent: initialConfig?.sourceContent || '',
    sourceFileBase64: initialConfig?.sourceFileBase64,
    sourceMimeType: initialConfig?.sourceMimeType,
  });

  const [topicSearch, setTopicSearch] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);

  // Canonical NCERT dataset
  const activeSyllabusData = NCERT_DATA;

  // Available classes
  const availableClasses = CLASSES;

  // Available subjects for the selected class
  const availableSubjects = useMemo(() => {
    if (!selectedClass) return [];
    return Array.from(
      new Set(
        activeSyllabusData.filter(d => d.className === selectedClass).map(d => d.subjectName)
      )
    );
  }, [activeSyllabusData, selectedClass]);

  // Available topics for selected class + subject
  const availableTopics = useMemo(() => {
    if (!selectedClass || !selectedSubject) return [];
    return Array.from(
      new Set(
        activeSyllabusData
          .filter(d => d.className === selectedClass && d.subjectName === selectedSubject)
          .map(d => d.chapterName)
      )
    );
  }, [activeSyllabusData, selectedClass, selectedSubject]);

  // Filtered topics by search
  const filteredTopics = useMemo(() => {
    if (!topicSearch.trim()) return availableTopics;
    return availableTopics.filter(t => 
      t.toLowerCase().includes(topicSearch.toLowerCase())
    );
  }, [availableTopics, topicSearch]);

  const handleClassChange = (cls: string) => {
    setSelectedClass(cls);
    setSelectedSubject(null);
    setSelectedTopics([]);
    setValidationError(null);
  };

  const handleSubjectChange = (subj: string) => {
    setSelectedSubject(subj);
    setSelectedTopics([]);
    setValidationError(null);
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
    setValidationError(null);
  };

  const handleSelectAll = () => {
    setSelectedTopics(availableTopics);
    setValidationError(null);
  };

  const handleDeselectAll = () => {
    setSelectedTopics([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdminUnlocked && maintenanceConfig?.features?.quiz_generation?.isUnderMaintenance) {
      onFeatureBlocked?.('quiz_generation');
      return;
    }

    if (generationMode === 'custom') {
      const hasContent = !!customSourceData.sourceContent.trim() || !!customSourceData.sourceFileBase64;
      if (!hasContent) {
        setValidationError('Please upload a notes image, PDF document, webpage link, or paste study content in the Custom Source section.');
        return;
      }
      if (!strength) {
        setValidationError('Please choose a Difficulty Level (Easy, Medium, or Hard).');
        return;
      }
      if (!quantity) {
        setValidationError('Please choose the Number of Questions (5, 10, 15, 20, or 25).');
        return;
      }
      if (timeLimitMinutes === null) {
        setValidationError('Please select a Timer mode (Untimed or timed test).');
        return;
      }

      onGenerateQuiz({
        class: selectedClass || 'Custom Study',
        subject: selectedSubject || 'Custom Assessment',
        topics: [customSourceData.sourceTitle || `${customSourceData.sourceType.toUpperCase()} Notes`],
        strength,
        quantity,
        timeLimitMinutes,
        questionType,
        sourceType: customSourceData.sourceType,
        sourceTitle: customSourceData.sourceTitle || 'Custom Study Material',
        sourceContent: customSourceData.sourceContent,
        sourceFileBase64: customSourceData.sourceFileBase64,
        sourceMimeType: customSourceData.sourceMimeType,
        customInstructions: customInstructions.trim() || undefined,
      });
      return;
    }

    // Standard syllabus mode
    if (!selectedClass) {
      setValidationError('Please select a Grade Level / Class.');
      return;
    }
    if (!selectedSubject) {
      setValidationError('Please select a Subject.');
      return;
    }
    if (selectedTopics.length === 0) {
      setValidationError('Please select at least one Chapter or Topic to generate questions.');
      return;
    }
    if (!strength) {
      setValidationError('Please choose a Difficulty Level (Easy, Medium, or Hard).');
      return;
    }
    if (!quantity) {
      setValidationError('Please choose the Number of Questions (5, 10, 15, 20, or 25).');
      return;
    }
    if (timeLimitMinutes === null) {
      setValidationError('Please select a Timer mode (Untimed or timed test).');
      return;
    }

    onGenerateQuiz({
      class: selectedClass,
      subject: selectedSubject,
      topics: selectedTopics,
      strength,
      quantity,
      timeLimitMinutes,
      questionType,
      sourceType: 'syllabus',
      customInstructions: customInstructions.trim() || undefined,
    });
  };

  // Check how many configuration steps are completed
  const completedSteps = generationMode === 'custom'
    ? [
        (!!customSourceData.sourceContent.trim() || !!customSourceData.sourceFileBase64),
        !!strength,
        !!quantity,
        timeLimitMinutes !== null,
        !!questionType,
      ].filter(Boolean).length
    : [
        !!selectedClass,
        !!selectedSubject,
        selectedTopics.length > 0,
        !!strength,
        !!quantity,
        timeLimitMinutes !== null,
        !!questionType,
      ].filter(Boolean).length;

  const totalSteps = generationMode === 'custom' ? 5 : 7;
  const isFormComplete = completedSteps === totalSteps;

  const quantityOptions = [5, 10, 15, 20, 25];
  const timeLimitOptions = [
    { value: 0, label: 'Untimed (Self-Paced Practice)' },
    { value: 5, label: '5 Mins (Fast Sprint)' },
    { value: 10, label: '10 Mins (Standard Assessment)' },
    { value: 15, label: '15 Mins (Comprehensive)' },
    { value: 20, label: '20 Mins (Board Exam Simulation)' },
  ];

  const questionTypeOptions: { value: 'single' | 'multiple' | 'both'; title: string; desc: string }[] = [
    {
      value: 'single',
      title: 'Single Choice Only',
      desc: 'Standard MCQs with exactly 1 correct option.',
    },
    {
      value: 'multiple',
      title: 'Multiple Choice Only',
      desc: 'Advanced MCQs where more than 1 option is correct.',
    },
    {
      value: 'both',
      title: 'Mixed Format (Both)',
      desc: 'Combination of single and multi-correct questions.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-medium">New Quiz Configurator</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-3">
            <span>Create Custom Assessment</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              {completedSteps}/{totalSteps} Steps
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate quizzes from official NCERT syllabus or your own notes, PDFs, and webpage articles.
          </p>
        </div>

        {/* Share Reminder Quick Button */}
        <button
          type="button"
          onClick={() => setIsReminderModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-emerald-400 text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 shrink-0 self-start sm:self-center"
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Share Quiz Reminder</span>
        </button>
      </div>

      {/* Generation Mode Switcher (NCERT vs. Custom Sources) */}
      <div className="mb-6 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-2 gap-2 shadow-lg">
        <button
          type="button"
          onClick={() => {
            setGenerationMode('syllabus');
            setValidationError(null);
          }}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            generationMode === 'syllabus'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>NCERT Curriculum Mode</span>
          <span className="hidden sm:inline text-[10px] font-mono opacity-80">(Classes 6–12)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setGenerationMode('custom');
            setValidationError(null);
          }}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            generationMode === 'custom'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Custom Sources & Notes Mode</span>
          <span className="hidden sm:inline text-[10px] font-mono opacity-80">(OCR, PDF, Web)</span>
        </button>
      </div>

      {/* Global Validation Banner */}
      {validationError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{validationError}</span>
          </div>
          <button
            onClick={() => setValidationError(null)}
            className="text-xs font-bold text-rose-400 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Main Form Steps */}
        <div className="lg:col-span-2 space-y-6">

          {/* ================= MODE 1: NCERT SYLLABUS ================= */}
          {generationMode === 'syllabus' && (
            <>
              {/* STEP 1: Grade Level / Class */}
              <div className={`p-6 rounded-3xl border transition-all ${selectedClass ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-900/30 border-dashed border-slate-800'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${selectedClass ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      1
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white font-display">Grade / Class Level</h3>
                      <p className="text-xs text-slate-400">Choose the class for official NCERT curriculum content</p>
                    </div>
                  </div>
                  {selectedClass && (
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {availableClasses.map((cls) => {
                    const isSelected = selectedClass === cls;
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => handleClassChange(cls)}
                        className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 scale-105'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {cls}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: Subject Selection */}
              <div className={`p-6 rounded-3xl border transition-all ${!selectedClass ? 'opacity-60 bg-slate-900/20 border-slate-850' : selectedSubject ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-900/30 border-dashed border-slate-800'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${selectedSubject ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      2
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white font-display">Subject</h3>
                      <p className="text-xs text-slate-400">Choose the academic subject for {selectedClass || 'your class'}</p>
                    </div>
                  </div>
                  {selectedSubject && (
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Selected
                    </span>
                  )}
                </div>

                {!selectedClass ? (
                  <p className="text-xs text-slate-500 italic">Select a Grade Level in Step 1 first.</p>
                ) : availableSubjects.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No subjects cataloged for {selectedClass}.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {availableSubjects.map((subj) => {
                      const isSelected = selectedSubject === subj;
                      return (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => handleSubjectChange(subj)}
                          className={`p-3.5 rounded-2xl border text-left font-bold text-xs transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500 text-white ring-1 ring-emerald-500/30'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          <span>{subj}</span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* STEP 3: Chapter / Topic Selection */}
              <div className={`p-6 rounded-3xl border transition-all ${!selectedSubject ? 'opacity-60 bg-slate-900/20 border-slate-850' : selectedTopics.length > 0 ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-900/30 border-dashed border-slate-800'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${selectedTopics.length > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      3
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white font-display">Chapters & Topics</h3>
                      <p className="text-xs text-slate-400">Select one or more topics to formulate questions from</p>
                    </div>
                  </div>
                  {selectedTopics.length > 0 && (
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {selectedTopics.length} Selected
                    </span>
                  )}
                </div>

                {!selectedSubject ? (
                  <p className="text-xs text-slate-500 italic">Select a Subject in Step 2 first.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={topicSearch}
                          onChange={(e) => setTopicSearch(e.target.value)}
                          placeholder="Search syllabus chapters..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                      {filteredTopics.map((topic) => {
                        const isSelected = selectedTopics.includes(topic);
                        return (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => toggleTopic(topic)}
                            className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-emerald-500/15 border-emerald-500 text-white font-medium'
                                : 'bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className="truncate">{topic}</span>
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ================= MODE 2: CUSTOM SOURCES ================= */}
          {generationMode === 'custom' && (
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    1
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">Study Material & Notes Source</h3>
                    <p className="text-xs text-slate-400">Upload notes photos, documents, articles, or paste revision sheets</p>
                  </div>
                </div>
                {(customSourceData.sourceContent || customSourceData.sourceFileBase64) && (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Source Linked
                  </span>
                )}
              </div>

              <CustomSourceUploader
                data={customSourceData}
                onChange={setCustomSourceData}
                maintenanceConfig={maintenanceConfig}
                onFeatureBlocked={onFeatureBlocked}
                isAdminUnlocked={isAdminUnlocked}
                user={user}
              />
            </div>
          )}

          {/* ================= COMMON: CUSTOM INSTRUCTIONS TO AI ================= */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white font-display flex items-center gap-2">
                    <span>Custom Instructions to AI</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      Optional
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Write any specific exam preferences or focus areas (leave blank for standard balanced assessment)</p>
                </div>
              </div>

              {customInstructions && (
                <button
                  type="button"
                  onClick={() => setCustomInstructions('')}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <textarea
                rows={3}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Write your custom instructions here if desired (e.g., focus on numerical calculations with step-by-step formulas, include assertion-reasoning questions, emphasize diagram interpretations)..."
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
              />
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2.5 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">System Security Boundary: </span>
                  <span>
                    Custom instructions govern pedagogical emphasis and question topics. Standard 4-option schema, objective correctness, and syllabus accuracy remain strictly protected.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= TEST CONDITIONS: DIFFICULTY, QUANTITY, FORMAT, TIMER ================= */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
            
            {/* Step: Difficulty Level */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${strength ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                    {generationMode === 'custom' ? '2' : '4'}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">Difficulty Strength</h3>
                    <p className="text-xs text-slate-400">Calibrate the cognitive demand of questions</p>
                  </div>
                </div>
                {strength && (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {strength}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {STRENGTHS.map((lvl) => {
                  const isSelected = strength === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setStrength(lvl as any)}
                      className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? lvl === 'Easy'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                            : lvl === 'Medium'
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step: Number of Questions */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${quantity ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                    {generationMode === 'custom' ? '3' : '5'}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">Number of Questions</h3>
                    <p className="text-xs text-slate-400">Select the size of your assessment batch</p>
                  </div>
                </div>
                {quantity && (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {quantity} Questions
                  </span>
                )}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {quantityOptions.map((qty) => {
                  const isSelected = quantity === qty;
                  return (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setQuantity(qty)}
                      className={`p-3 rounded-2xl border text-center font-mono font-bold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {qty} Qs
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step: Question Format (Single, Multiple, or Both) */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {generationMode === 'custom' ? '4' : '6'}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">Question Format</h3>
                    <p className="text-xs text-slate-400">Choose single choice, multiple choice, or a mixed combination</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {questionType === 'single' ? 'Single Choice' : questionType === 'multiple' ? 'Multiple Choice' : 'Mixed (Both)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {questionTypeOptions.map((opt) => {
                  const isSelected = questionType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setQuestionType(opt.value)}
                      className={`p-3.5 rounded-2xl border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white ring-1 ring-emerald-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs">{opt.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <span className="text-[11px] text-slate-400 leading-tight">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step: Timer Mode */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${timeLimitMinutes !== null ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                    {generationMode === 'custom' ? '5' : '7'}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">Time Allocation</h3>
                    <p className="text-xs text-slate-400">Untimed practice or timed countdown exam simulation</p>
                  </div>
                </div>
                {timeLimitMinutes !== null && (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {timeLimitMinutes === 0 ? 'Untimed' : `${timeLimitMinutes} Mins`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {timeLimitOptions.map((opt) => {
                  const isSelected = timeLimitMinutes === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTimeLimitMinutes(opt.value)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white ring-1 ring-emerald-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Right 1 Column: Live Summary, Share Reminder & Launch Action */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 sticky top-6 space-y-6 shadow-xl backdrop-blur-md">
            
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Configuration Summary
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {completedSteps}/{totalSteps} Ready
                </span>
              </div>
              <h2 className="text-lg font-bold text-white font-display mt-1">
                {generationMode === 'custom'
                  ? (customSourceData.sourceTitle || 'Custom Material Assessment')
                  : (selectedClass && selectedSubject ? `${selectedClass} ${selectedSubject}` : 'Configure Your Quiz')}
              </h2>
            </div>

            {/* Checklist */}
            <div className="space-y-3 text-xs">
              {generationMode === 'syllabus' ? (
                <>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Class Level:</span>
                    <span className={selectedClass ? 'text-slate-200 font-semibold' : 'text-slate-600 italic'}>
                      {selectedClass || 'Unselected'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Subject:</span>
                    <span className={selectedSubject ? 'text-slate-200 font-semibold' : 'text-slate-600 italic'}>
                      {selectedSubject || 'Unselected'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Chapters Selected:</span>
                    <span className={selectedTopics.length > 0 ? 'text-emerald-400 font-semibold font-mono' : 'text-slate-600 italic'}>
                      {selectedTopics.length > 0 ? `${selectedTopics.length} Chapters` : 'None Selected'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Source Type:</span>
                    <span className="text-emerald-400 font-semibold capitalize font-mono">
                      {customSourceData.sourceType === 'notes' ? 'Handwritten Notes (OCR)' : customSourceData.sourceType === 'pdf' ? 'Document / PDF' : customSourceData.sourceType === 'webpage' ? 'Webpage Link' : 'Pasted Notes'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Content Status:</span>
                    <span className={customSourceData.sourceContent.trim() || customSourceData.sourceFileBase64 ? 'text-emerald-400 font-semibold font-mono' : 'text-slate-600 italic'}>
                      {customSourceData.sourceContent.trim() ? `${customSourceData.sourceContent.trim().split(/\s+/).filter(Boolean).length} Words` : customSourceData.sourceFileBase64 ? 'File Attached' : 'Empty'}
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Difficulty:</span>
                <span className={strength ? 'text-amber-400 font-semibold font-mono' : 'text-slate-600 italic'}>
                  {strength || 'Unselected'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Questions Count:</span>
                <span className={quantity ? 'text-sky-400 font-semibold font-mono' : 'text-slate-600 italic'}>
                  {quantity ? `${quantity} Questions` : 'Unselected'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Format:</span>
                <span className="text-teal-400 font-semibold font-mono">
                  {questionType === 'single' ? 'Single Choice' : questionType === 'multiple' ? 'Multiple Choice' : 'Mixed (Both)'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Time Limit:</span>
                <span className={timeLimitMinutes !== null ? 'text-purple-400 font-semibold font-mono' : 'text-slate-600 italic'}>
                  {timeLimitMinutes === null ? 'Unselected' : timeLimitMinutes === 0 ? 'Untimed' : `${timeLimitMinutes} Mins`}
                </span>
              </div>

              {customInstructions && (
                <div className="py-1">
                  <span className="text-slate-400 block mb-1">Custom Guidance:</span>
                  <p className="text-[11px] text-amber-300 font-mono bg-slate-950 p-2 rounded-xl border border-amber-500/20 line-clamp-2">
                    "{customInstructions}"
                  </p>
                </div>
              )}
            </div>

            {/* Launch Assessment Button */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                className={`w-full py-3.5 px-6 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
                  isFormComplete
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isFormComplete ? 'Generate & Begin Quiz' : 'Complete All Options Above'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Share Reminder Button */}
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Share Quiz Reminder with Friends</span>
              </button>
            </div>

          </div>

        </div>

      </form>

      {/* Share Reminder Modal */}
      {isReminderModalOpen && (
        <ShareReminderModal
          config={{
            class: selectedClass || undefined,
            subject: selectedSubject || undefined,
            topics: generationMode === 'custom' ? [customSourceData.sourceTitle || 'Custom Material'] : selectedTopics,
            quantity: quantity || undefined,
            strength: strength || undefined,
            timeLimitMinutes: timeLimitMinutes !== null ? timeLimitMinutes : undefined,
          }}
          onClose={() => setIsReminderModalOpen(false)}
        />
      )}

    </div>
  );
};
