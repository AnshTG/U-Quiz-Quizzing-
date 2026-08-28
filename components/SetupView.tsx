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
  Bookmark
} from 'lucide-react';

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
  const [selectedYear, setSelectedYear] = useState<SyllabusYear>(initialConfig?.syllabusYear || '2026-27');
  const [selectedClass, setSelectedClass] = useState<string>(initialConfig?.class || 'Class 10');
  const [selectedSubject, setSelectedSubject] = useState<string>(initialConfig?.subject || '');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialConfig?.topics || []);
  const [strength, setStrength] = useState<'Easy' | 'Medium' | 'Hard'>(initialConfig?.strength || 'Medium');
  const [quantity, setQuantity] = useState<number>(initialConfig?.quantity || 10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(initialConfig?.timeLimitMinutes || 0);
  const [topicSearch, setTopicSearch] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Active dataset based on syllabus year
  const activeSyllabusData = useMemo(() => {
    return getSyllabusData(selectedYear);
  }, [selectedYear]);

  // Available classes for selected year
  const availableClasses = useMemo(() => {
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

  // Set default subject when class or year changes
  React.useEffect(() => {
    if (availableSubjects.length > 0 && (!selectedSubject || !availableSubjects.includes(selectedSubject))) {
      setSelectedSubject(availableSubjects[0]);
    }
  }, [selectedClass, availableSubjects, selectedSubject]);

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

  // When subject changes, default select first 3 topics if none selected
  React.useEffect(() => {
    if (availableTopics.length > 0) {
      const validSelected = selectedTopics.filter(t => availableTopics.includes(t));
      if (validSelected.length === 0) {
        setSelectedTopics(availableTopics.slice(0, Math.min(4, availableTopics.length)));
      } else {
        setSelectedTopics(validSelected);
      }
    } else {
      setSelectedTopics([]);
    }
  }, [selectedSubject, availableTopics]);

  // Filtered topics by search
  const filteredTopics = useMemo(() => {
    if (!topicSearch.trim()) return availableTopics;
    return availableTopics.filter(t => 
      t.toLowerCase().includes(topicSearch.toLowerCase())
    );
  }, [availableTopics, topicSearch]);

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
    if (!selectedClass) {
      setValidationError('Please select a grade level.');
      return;
    }
    if (!selectedSubject) {
      setValidationError('Please select a subject.');
      return;
    }
    if (selectedTopics.length === 0) {
      setValidationError('Please select at least one chapter or topic.');
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
    });
  };

  const quantityOptions = [5, 10, 15, 20, 25];
  const timeLimitOptions = [
    { value: 0, label: 'Untimed (Self-paced)' },
    { value: 5, label: '5 Mins (Fast Sprint)' },
    { value: 10, label: '10 Mins (Standard)' },
    { value: 15, label: '15 Mins (Comprehensive)' },
    { value: 20, label: '20 Mins (Deep Exam)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-medium mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">
            Custom Assessment Configurator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tailor syllabus edition, scope, cognitive demand, and testing parameters for your NCERT quiz
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Options Form */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Step 0: Academic Session / Syllabus Year Selector */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <div>
                  <h3 className="text-lg font-bold font-display text-white">Syllabus Academic Year</h3>
                  <p className="text-xs text-slate-400">Choose between latest updated 2026-27 or 2025-26 edition</p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">{selectedYear}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedYear('2026-27')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedYear === '2026-27'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Latest Updated 2026–27
                  </span>
                  {selectedYear === '2026-27' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <h4 className="text-sm font-bold text-white">NCF-SE Unified Curriculum</h4>
                <p className="text-xs text-slate-400 mt-1">
                  New textbooks (Curiosity, Ganita Prakash, Exploring Society, Poorvi, Mridang) & latest modules.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedYear('2025-26')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedYear === '2025-26'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    2025–26 Standard
                  </span>
                  {selectedYear === '2025-26' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <h4 className="text-sm font-bold text-white">Rationalized Edition</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Standard rationalized textbook series across Classes 1–12.
                </p>
              </button>
            </div>
          </div>

          {/* Step 1: Grade / Class Selector */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-lg font-bold font-display text-white">Select Grade / Class</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400">{selectedClass}</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {availableClasses.map(cls => (
                <button
                  type="button"
                  key={cls}
                  onClick={() => {
                    setSelectedClass(cls);
                    setValidationError(null);
                  }}
                  className={`py-3 px-2 rounded-xl text-xs font-semibold font-display transition-all text-center border ${
                    selectedClass === cls
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/20 scale-[1.02]'
                      : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Subject Selector */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-lg font-bold font-display text-white">Select Subject</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400">{selectedSubject || 'None'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availableSubjects.map(sub => {
                const isSelected = selectedSubject === sub;
                return (
                  <button
                    type="button"
                    key={sub}
                    onClick={() => {
                      setSelectedSubject(sub);
                      setValidationError(null);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold shadow-md'
                        : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-semibold truncate pr-1">{sub}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Chapter / Topic Selector */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <div>
                  <h3 className="text-lg font-bold font-display text-white">Select Chapters / Topics</h3>
                  <p className="text-xs text-slate-400">Choose one or multiple units from the {selectedYear} syllabus</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Clear All
                </button>
                <span className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
                  {selectedTopics.length} selected
                </span>
              </div>
            </div>

            {/* Search Filter for Topics */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search chapters in ${selectedSubject || 'curriculum'}...`}
                value={topicSearch}
                onChange={e => setTopicSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Topics Scrollable List */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredTopics.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No chapters found matching "{topicSearch}".
                </div>
              ) : (
                filteredTopics.map((topic) => {
                  const isChecked = selectedTopics.includes(topic);
                  return (
                    <div
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100'
                          : 'bg-slate-950/40 hover:bg-slate-900 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-tight">
                        {topic}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Step 4 & 5: Cognitive Strength & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Cognitive Demand */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                  5
                </span>
                <div>
                  <h3 className="text-base font-bold font-display text-white">Cognitive Demand</h3>
                  <p className="text-xs text-slate-400">Calibrate depth of questions</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['Easy', 'Medium', 'Hard'] as const).map(lvl => {
                  const isSel = strength === lvl;
                  return (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setStrength(lvl)}
                      className={`py-3 px-2 rounded-xl text-center border transition-all ${
                        isSel
                          ? lvl === 'Hard'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                            : lvl === 'Medium'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="block text-xs font-bold">{lvl}</span>
                      <span className="text-[10px] opacity-75 font-mono">
                        {lvl === 'Easy' ? 'Recall' : lvl === 'Medium' ? 'Apply' : 'Analyze'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Quantity */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                  6
                </span>
                <div>
                  <h3 className="text-base font-bold font-display text-white">Item Count</h3>
                  <p className="text-xs text-slate-400">Total questions in assessment</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {quantityOptions.map(cnt => (
                  <button
                    type="button"
                    key={cnt}
                    onClick={() => setQuantity(cnt)}
                    className={`py-3 rounded-xl text-xs font-bold font-mono border transition-all ${
                      quantity === cnt
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Step 6: Assessment Mode / Timer */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                7
              </span>
              <div>
                <h3 className="text-base font-bold font-display text-white">Time Limit / Pacing</h3>
                <p className="text-xs text-slate-400">Select test duration or practice at your own pace</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {timeLimitOptions.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setTimeLimitMinutes(opt.value)}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                    timeLimitMinutes === opt.value
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span>{opt.label}</span>
                  </div>
                  {timeLimitMinutes === opt.value && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Live Summary Dock */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-6 space-y-6 shadow-xl">
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold font-display text-white">Assessment Summary</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Syllabus Edition</span>
                <span className="font-semibold text-emerald-400 font-mono">{selectedYear}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Target Grade</span>
                <span className="font-semibold text-white font-mono">{selectedClass}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Subject</span>
                <span className="font-semibold text-emerald-400 font-mono truncate max-w-[130px]">{selectedSubject || 'None'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Selected Chapters</span>
                <span className="font-semibold text-white font-mono">{selectedTopics.length} Units</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Cognitive Demand</span>
                <span className="font-semibold text-amber-400 font-mono">{strength}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Total Items</span>
                <span className="font-semibold text-white font-mono">{quantity} Questions</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Timer Mode</span>
                <span className="font-semibold text-cyan-400 font-mono">
                  {timeLimitMinutes === 0 ? 'Untimed Practice' : `${timeLimitMinutes} Minutes`}
                </span>
              </div>
            </div>

            {/* Validation Error Alert */}
            {validationError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Generate NCERT Quiz</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              Dynamically generated in real-time by Gemini 2.5 Flash grounded in official NCERT {selectedYear} syllabus matrices.
            </p>
          </div>
        </div>

      </form>

    </div>
  );
};
