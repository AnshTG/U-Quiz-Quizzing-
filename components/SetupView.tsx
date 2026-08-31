import React, { useState, useMemo } from 'react';
import { QuizConfig, SyllabusYear } from '../types';
import { 
  CLASSES_2026_27, 
  CLASSES_2025_26, 
  getSyllabusData, 
  SYLLABUS_METADATA,
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
  Calendar,
  Zap,
  Bookmark,
  Bell,
  Share2,
  CheckCircle2,
  HelpCircle,
  Layers,
  GraduationCap
} from 'lucide-react';
import { ShareReminderModal } from './ShareReminderModal';

interface SetupViewProps {
  initialConfig?: Partial<QuizConfig>;
  onGenerateQuiz: (config: QuizConfig) => void;
  onCancel: () => void;
}

export const SetupView: React.FC<SetupViewProps> = ({
  initialConfig,
  onGenerateQuiz,
  onCancel,
}) => {
  // STRICT REQUIREMENT: Do not preselect options anywhere unless explicitly provided in initialConfig
  const [selectedYear, setSelectedYear] = useState<SyllabusYear | null>(
    initialConfig?.syllabusYear || null
  );
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

  const [topicSearch, setTopicSearch] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);

  // Active dataset based on syllabus year (or fallback to 2026-27 for lookup if year is null)
  const activeSyllabusData = useMemo(() => {
    return getSyllabusData(selectedYear || '2026-27');
  }, [selectedYear]);

  // Available classes for selected year
  const availableClasses = useMemo(() => {
    if (!selectedYear) return [];
    return selectedYear === '2026-27' ? CLASSES_2026_27 : CLASSES_2025_26;
  }, [selectedYear]);

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

  const handleYearChange = (year: SyllabusYear) => {
    setSelectedYear(year);
    // Reset lower dependencies only if invalid
    if (selectedClass && !((year === '2026-27' ? CLASSES_2026_27 : CLASSES_2025_26).includes(selectedClass))) {
      setSelectedClass(null);
      setSelectedSubject(null);
      setSelectedTopics([]);
    }
    setValidationError(null);
  };

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

    if (!selectedYear) {
      setValidationError('Please select the Academic Syllabus Year (2026-27 or 2025-26).');
      return;
    }
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
      syllabusYear: selectedYear,
      questionType,
    });
  };

  // Check how many configuration steps are completed
  const completedSteps = [
    !!selectedYear,
    !!selectedClass,
    !!selectedSubject,
    selectedTopics.length > 0,
    !!strength,
    !!quantity,
    timeLimitMinutes !== null,
    !!questionType,
  ].filter(Boolean).length;

  const totalSteps = 8;
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
            Choose your academic session, grade, chapters, and test conditions. No options are preselected.
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
          
          {/* STEP 1: Academic Year Session */}
          <div className={`p-6 rounded-3xl border transition-all ${selectedYear ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-900/30 border-dashed border-slate-800'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${selectedYear ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                  1
                </span>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Academic Syllabus Session</h3>
                  <p className="text-xs text-slate-400">Select which NCERT curriculum syllabus edition to follow</p>
                </div>
              </div>
              {selectedYear && (
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['2026-27', '2025-26'] as SyllabusYear[]).map((yr) => {
                const isSelected = selectedYear === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => handleYearChange(yr)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="font-bold text-sm">Session {yr}</span>
                        {yr === '2026-27' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {yr === '2026-27' ? 'Updated rationalized syllabus & latest textbook patterns' : 'Standard academic year curriculum'}
                      </p>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'}`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Grade Level / Class */}
          <div className={`p-6 rounded-3xl border transition-all ${!selectedYear ? 'opacity-60 bg-slate-900/20 border-slate-850' : selectedClass ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-900/30 border-dashed border-slate-800'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${selectedClass ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                  2
                </span>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Grade / Class Level</h3>
                  <p className="text-xs text-slate-400">Choose the class for standard NCERT syllabus content</p>
                </div>
              </div>
              {selectedClass && (
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Selected
                </span>
              )}
            </div>

            {!selectedYear ? (
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-500 text-center">
                Please select the Academic Session (Step 1) to view available classes.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
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
            )}
          </div>

          {/* STEP 3: Subject Selection */}
          <div className={`p-6 rounded-3xl border transition-all ${!selectedClass ? 'opacity-60 bg-slate-900/20 border-slate-850' : selectedSubject ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-900/30 border-dashed border-slate-800'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${selectedSubject ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                  3
                </span>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Subject</h3>
                  <p className="text-xs text-slate-400">Select which subject you would like to test</p>
                </div>
              </div>
              {selectedSubject && (
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Selected
                </span>
              )}
            </div>

            {!selectedClass ? (
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-500 text-center">
                Please select a Grade / Class above (Step 2) to unlock subjects.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {availableSubjects.map((subj) => {
                  const isSelected = selectedSubject === subj;
                  const chaptersCount = activeSyllabusData.filter(d => d.className === selectedClass && d.subjectName === subj).length;
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => handleSubjectChange(subj)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white ring-1 ring-emerald-500/30 shadow-sm'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                          <span className="font-bold text-sm text-white">{subj}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'}`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {chaptersCount} NCERT Chapters Available
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 4: Chapter & Topics Selection */}
          <div className={`p-6 rounded-3xl border transition-all ${!selectedSubject ? 'opacity-60 bg-slate-900/20 border-slate-850' : selectedTopics.length > 0 ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-900/30 border-dashed border-slate-800'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${selectedTopics.length > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                  4
                </span>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Chapters & Topics ({selectedTopics.length}/{availableTopics.length} Picked)
                  </h3>
                  <p className="text-xs text-slate-400">Select single or multiple chapters to include in the quiz</p>
                </div>
              </div>

              {selectedSubject && availableTopics.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {!selectedSubject ? (
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-500 text-center">
                Please select a Subject (Step 3) to view chapters and topics.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Search Bar for chapters */}
                {availableTopics.length > 6 && (
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={topicSearch}
                      onChange={(e) => setTopicSearch(e.target.value)}
                      placeholder="Search chapters or concepts..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                )}

                {/* Topics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {filteredTopics.map((top) => {
                    const isSelected = selectedTopics.includes(top);
                    return (
                      <button
                        key={top}
                        type="button"
                        onClick={() => toggleTopic(top)}
                        className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-white'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{top}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'}`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* STEP 5, 6, 7: Assessment Parameters */}
          <div className="p-6 rounded-3xl border bg-slate-900/60 border-slate-800 space-y-6">
            
            {/* Step 5: Difficulty */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${strength ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                    5
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">Cognitive Demand / Difficulty</h3>
                    <p className="text-xs text-slate-400">Choose question depth from direct recall to analytical NCERT questions</p>
                  </div>
                </div>
                {strength && (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {strength}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(['Easy', 'Medium', 'Hard'] as ('Easy' | 'Medium' | 'Hard')[]).map((lvl) => {
                  const isSelected = strength === lvl;
                  const desc = lvl === 'Easy' 
                    ? 'Direct definitions & fundamental concepts'
                    : lvl === 'Medium'
                    ? 'Standard NCERT exam questions & problem solving'
                    : 'Application, numericals, assertions & case reasoning';

                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setStrength(lvl)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        isSelected
                          ? lvl === 'Easy'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/30'
                            : lvl === 'Medium'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                            : 'bg-rose-500/20 border-rose-500 text-rose-300 ring-1 ring-rose-500/30'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold text-sm">{lvl}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 6: Question Quantity */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${quantity ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                    6
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

            {/* Step 7: Question Format (Single, Multiple, or Both) */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    7
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

            {/* Step 8: Timer Mode */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${timeLimitMinutes !== null ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                    8
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
                {selectedClass && selectedSubject ? `${selectedClass} ${selectedSubject}` : 'Configure Your Quiz'}
              </h2>
            </div>

            {/* Checklist */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Academic Session:</span>
                <span className={selectedYear ? 'text-slate-200 font-semibold font-mono' : 'text-slate-600 italic'}>
                  {selectedYear || 'Unselected'}
                </span>
              </div>

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

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Time Limit:</span>
                <span className={timeLimitMinutes !== null ? 'text-purple-400 font-semibold font-mono' : 'text-slate-600 italic'}>
                  {timeLimitMinutes === null ? 'Unselected' : timeLimitMinutes === 0 ? 'Untimed' : `${timeLimitMinutes} Mins`}
                </span>
              </div>
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
            topics: selectedTopics,
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
