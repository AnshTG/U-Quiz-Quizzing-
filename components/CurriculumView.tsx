import React, { useState, useMemo } from 'react';
import { 
  getSyllabusData, 
  CLASSES_2026_27, 
  CLASSES_2025_26, 
  SYLLABUS_METADATA 
} from '../constants';
import { QuizConfig, SyllabusYear } from '../types';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  CheckCircle,
  GraduationCap,
  Calendar,
  Zap,
  Info,
  CheckCircle2,
  Bookmark,
  BookMarked,
  ArrowLeft
} from 'lucide-react';

interface CurriculumViewProps {
  onStartChapterQuiz: (config: QuizConfig) => void;
  onOpenCustomSetup: (cls?: string, sub?: string, year?: SyllabusYear) => void;
  onBackHome?: () => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  onStartChapterQuiz,
  onOpenCustomSetup,
  onBackHome,
}) => {
  const [selectedYear, setSelectedYear] = useState<SyllabusYear>('2026-27');
  const [selectedClass, setSelectedClass] = useState<string>('Class 10');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showEvolutionGuide, setShowEvolutionGuide] = useState<boolean>(false);

  // Active dataset based on syllabus year
  const activeSyllabusData = useMemo(() => {
    return getSyllabusData(selectedYear);
  }, [selectedYear]);

  // Classes for the active year
  const activeClasses = useMemo(() => {
    return selectedYear === '2026-27' ? CLASSES_2026_27 : CLASSES_2025_26;
  }, [selectedYear]);

  // Available subjects for the class
  const availableSubjects = useMemo(() => {
    return Array.from(
      new Set(
        activeSyllabusData.filter(d => d.className === selectedClass).map(d => d.subjectName)
      )
    );
  }, [activeSyllabusData, selectedClass]);

  // Update default subject when class or year changes
  React.useEffect(() => {
    if (availableSubjects.length > 0 && (!selectedSubject || !availableSubjects.includes(selectedSubject))) {
      setSelectedSubject(availableSubjects[0]);
    }
  }, [selectedClass, availableSubjects, selectedSubject]);

  // Chapters for selected Class + Subject
  const currentChapters = useMemo(() => {
    if (!selectedClass || !selectedSubject) return [];
    return activeSyllabusData
      .filter(d => d.className === selectedClass && d.subjectName === selectedSubject)
      .map(d => d.chapterName);
  }, [activeSyllabusData, selectedClass, selectedSubject]);

  // Filtered chapters by search
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return currentChapters;
    return currentChapters.filter(ch =>
      ch.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentChapters, searchQuery]);

  const yearMeta = SYLLABUS_METADATA[selectedYear];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          {onBackHome && (
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={onBackHome}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </button>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Class 1 to 12 Directory</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official NCERT Curriculum Repository</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            NCERT Syllabus Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore the official NCERT curriculum for academic sessions 2025–26 & 2026–27 across Classes 1–12
          </p>
        </div>

        {/* Top Action CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowEvolutionGuide(!showEvolutionGuide)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-xs transition-all"
          >
            <Info className="w-4 h-4 text-cyan-400" />
            <span>{showEvolutionGuide ? 'Hide Curriculum Info' : 'NCERT Curriculum Overview'}</span>
          </button>

          <button
            onClick={() => onOpenCustomSetup(selectedClass, selectedSubject, selectedYear)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-400 hover:to-lime-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Multi-Chapter Test</span>
          </button>
        </div>
      </div>

      {/* Syllabus Year Selector Tabs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold font-display text-white uppercase tracking-wider">
              Academic Session Selection
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Session 2025-26 & 2026-27 share the same unified official NCERT curriculum standard
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 max-w-md w-full">
          <button
            onClick={() => setSelectedYear('2026-27')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
              selectedYear === '2026-27'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>2026–27 Session</span>
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              selectedYear === '2026-27' ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              Official
            </span>
          </button>

          <button
            onClick={() => setSelectedYear('2025-26')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
              selectedYear === '2025-26'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              <span>2025–26 Session</span>
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              selectedYear === '2025-26' ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
            }`}>
              Official
            </span>
          </button>
        </div>
      </div>

      {/* 2026-27 Featured Section / Syllabus Evolution Banner */}
      {selectedYear === '2026-27' && (
        <section className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-teal-950/40 p-6 sm:p-7 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  ★ 2026–27 New NCF-SE Unified Syllabus
                </span>
                <span className="text-xs text-emerald-400 font-mono">NEP 2020 Aligned</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                Newly Integrated NCERT Textbooks & Rationalized Modules
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Includes the new textbook series introduced under the National Curriculum Framework: 
                <strong className="text-emerald-300"> Curiosity</strong> (Science 6-8), 
                <strong className="text-emerald-300"> Ganita Prakash</strong> (Maths 6-8), 
                <strong className="text-emerald-300"> Exploring Society</strong> (Social Science 6-8), 
                <strong className="text-emerald-300"> Poorvi & Malhar</strong> (Languages), 
                <strong className="text-emerald-300"> Mridang, Sarangi, Santoor & Maths Mela</strong> (Primary 1-5), and streamlined Senior Secondary frameworks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
              <div className="px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Curriculum Units</span>
                <p className="text-lg font-bold text-emerald-400 font-mono">{activeSyllabusData.length} Chapters</p>
              </div>
              <div className="px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Grade Spectrum</span>
                <p className="text-lg font-bold text-white font-mono">Class 1 to 12</p>
              </div>
            </div>
          </div>

          {/* Highlights Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {yearMeta.highlights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2025-26 Standard Banner */}
      {selectedYear === '2025-26' && (
        <section className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-teal-950/40 p-6 sm:p-7 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  ★ 2025–26 Official NCERT Curriculum
                </span>
                <span className="text-xs text-emerald-400 font-mono">NEP 2020 Aligned</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                Unified NCERT Textbooks & Rationalized Modules
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Integrated NCERT textbooks and curriculum modules corresponding with the official session specifications across Foundational, Middle, Secondary, and Senior Secondary classes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
              <div className="px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Curriculum Units</span>
                <p className="text-lg font-bold text-emerald-400 font-mono">{activeSyllabusData.length} Chapters</p>
              </div>
              <div className="px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Grade Spectrum</span>
                <p className="text-lg font-bold text-white font-mono">Class 1 to 12</p>
              </div>
            </div>
          </div>

          {/* Highlights Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {yearMeta.highlights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Optional Evolution Guide Modal / Card */}
      {showEvolutionGuide && (
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold font-display text-white">
                Summary of NCERT 2026–27 Syllabus Upgrades & Changes
              </h3>
            </div>
            <button
              onClick={() => setShowEvolutionGuide(false)}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-2">
              <span className="font-bold text-cyan-400 block font-display text-sm">Middle Stage (Classes 6–8)</span>
              <p>
                Replacement of conventional textbooks with the integrated <strong>Curiosity</strong> (Science), <strong>Ganita Prakash</strong> (Mathematics), and <strong>Exploring Society: India and Beyond</strong> (Social Science) curricula, emphasizing hands-on inquiry, Indian civilisational roots, and environmental stewardship.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-2">
              <span className="font-bold text-cyan-400 block font-display text-sm">Foundational & Prep (Classes 1–5)</span>
              <p>
                Deployment of <strong>Joyful Mathematics</strong>, <strong>Maths Mela</strong>, <strong>Mridang</strong>, <strong>Sarangi</strong>, and <strong>Santoor</strong>, focusing on activity-based foundational literacy and numeracy (FLN) and playful thematic storytelling.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-2">
              <span className="font-bold text-cyan-400 block font-display text-sm">Secondary & Sr. Secondary (9–12)</span>
              <p>
                Streamlined rationalized unit matrices for Physics, Chemistry, Mathematics, Biology, Accountancy, Economics, and Political Science aligned with CBSE annual board blueprint patterns.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grade / Class Selector Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase font-mono tracking-wider">
            Select Grade Level ({selectedYear}):
          </span>
          <span className="text-xs font-mono text-emerald-400">
            {selectedClass} Active
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {activeClasses.map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold font-display transition-all border text-center ${
                selectedClass === cls
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-bold scale-[1.02]'
                  : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              {cls.replace('Class ', 'C')}
              <span className="hidden sm:inline"> ({cls.replace('Class ', '')})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Subjects & Chapters Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Col: Subject Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase font-mono tracking-wider">
              Subjects ({availableSubjects.length}):
            </span>
          </div>

          <div className="space-y-2">
            {availableSubjects.map(sub => {
              const isSelected = selectedSubject === sub;
              const count = activeSyllabusData.filter(d => d.className === selectedClass && d.subjectName === sub).length;
              return (
                <button
                  key={sub}
                  onClick={() => {
                    setSelectedSubject(sub);
                    setSearchQuery('');
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold shadow-sm'
                      : 'bg-slate-900/40 hover:bg-slate-800 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="truncate pr-2">{sub}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono shrink-0 ${
                    isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 Cols: Chapters Grid with Quick Launch */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Search bar & count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search chapters in ${selectedClass} • ${selectedSubject}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-mono">
                {selectedYear} Edition
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {filteredChapters.length} chapter{filteredChapters.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Chapter cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChapters.length === 0 ? (
              <div className="col-span-full text-center py-12 border border-slate-800 bg-slate-900/30 rounded-2xl text-slate-500 text-sm">
                No chapters matching "{searchQuery}" in this subject.
              </div>
            ) : (
              filteredChapters.map((chapName, idx) => (
                <div
                  key={idx}
                  className="group p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700 flex flex-col justify-between transition-all duration-200"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                        Unit {idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {selectedYear}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold font-display text-white group-hover:text-emerald-400 transition-colors leading-snug">
                      {chapName}
                    </h3>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                      {selectedClass} • {selectedSubject}
                    </span>

                    <button
                      onClick={() => onStartChapterQuiz({
                        class: selectedClass,
                        subject: selectedSubject,
                        topics: [chapName],
                        strength: 'Medium',
                        quantity: 10,
                        syllabusYear: selectedYear
                      })}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-400 hover:text-slate-950 text-xs font-bold transition-all shadow-sm"
                    >
                      <span>Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
