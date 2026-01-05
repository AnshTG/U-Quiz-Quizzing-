
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppState, QuizConfig, Question, NCERTEntry } from './types';
import { NCERT_DATA, CLASSES, STRENGTHS } from './constants';
import { generateQuestions } from './services/geminiService';

/**
 * Enhanced Math Rendering Component.
 * Leaves standard text alone while rendering KaTeX for specific math blocks.
 */
const MathText = ({ content, className = "" }: { content: string, className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).renderMathInElement) {
      try {
        (window as any).renderMathInElement(containerRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false,
          output: 'html'
        });
      } catch (e) {
        console.warn("KaTeX rendering error", e);
      }
    }
  }, [content]);

  return (
    <div ref={containerRef} className={className}>
      {content}
    </div>
  );
};

// Helper function to format seconds into MM:SS string
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TopBar = ({ onHome, onCurriculum, isOnline }: { onHome: () => void, onCurriculum: () => void, isOnline: boolean }) => (
  <nav className="w-full h-[72px] bg-[#0d1117]/80 backdrop-blur-xl border-b border-[#30363d] fixed top-0 left-0 z-[1000] flex items-center px-6 md:px-12">
    <div className="flex justify-between items-center w-full max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={onHome}>
        <div className="w-10 h-10 bg-[#8CFF19] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(140,255,25,0.3)] transition-all group-hover:scale-110">
          <span className="text-[#0d1117] font-black text-xl">U</span>
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white leading-none">Quiz <span className="text-[#8CFF19]">AI</span></h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">NCERT Unified</p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-10 text-sm font-bold">
        <span className="text-gray-400 hover:text-[#8CFF19] cursor-pointer transition-colors" onClick={onCurriculum}>Curriculum</span>
        <span className="text-gray-400 hover:text-[#8CFF19] cursor-pointer transition-colors" onClick={onHome}>Home</span>
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${isOnline ? 'border-green-500/20 bg-green-500/5 text-green-400' : 'border-red-500/20 bg-red-500/5 text-red-400'}`}>
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
          <span className="text-[10px] uppercase tracking-widest font-black">{isOnline ? 'Live' : 'Offline'}</span>
        </div>
      </div>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="py-12 text-center border-t border-[#30363d] w-full mt-10 bg-[#0d1117]">
    <div className="container mx-auto px-4 max-w-[1200px]">
      <div className="text-[13px] text-gray-400 font-medium leading-relaxed">
        All Rights reserved © U Quiz 2026 | Developed by Ansh Yadav
        <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2">
          <a 
            href="https://instagram.com/anshtgyadav" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#8CFF19] hover:text-white transition-colors flex items-center gap-2 font-bold text-[11px] uppercase tracking-wider"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.412.56.216.96.474 1.38.894.42.42.678.82.894 1.38.163.422.358 1.057.412 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.412 2.227-.216.56-.474.96-.894 1.38-.42.42-.82.678-1.38.894-.422.163-1.057.358-2.227.412-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.412-.56-.216-.96-.474-1.38-.894-.42-.42-.678-.82-.894-1.38-.163-.422-.358-1.057-.412-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.412-2.227.216-.56.474-.96.894-1.38.42-.42.82-.678 1.38-.894.422-.163 1.057-.358 2.227-.412 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.057-2.151.26-2.914.557-.789.306-1.459.717-2.126 1.384-.667.667-1.078 1.337-1.384 2.126-.297.763-.5 1.637-.557 2.914-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.057 1.277.26 2.151.557 2.914.306.789.717 1.459 1.384 2.126.667.667 1.337 1.078 2.126 1.384.763.297 1.637.5 2.914.557 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.057 2.151-.26 2.914-.557.789-.306 1.459-.717 2.126-1.384.667-.667 1.078-1.337 1.384-2.126.297-.763.5-1.637.557-2.914.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.057-1.277-.26-2.151-.557-2.914-.306-.789-.717-1.459-1.384-2.126-.667-.667-1.337-1.078-2.126-1.384-.763-.297-1.637-.5-2.914-.557-1.28-.058-1.688-.072-4.947-.072z"/><path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.44-.645 1.44-1.44s-.645-1.44-1.44-1.44z"/></svg>
            <span>Instagram: @anshtgyadav</span>
          </a>
          <a 
            href="mailto:anshyadavtg@gmail.com" 
            className="text-[#8CFF19] hover:text-white transition-colors flex items-center gap-2 font-bold text-[11px] uppercase tracking-wider"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099l3.83-3.104 5.612 8.818h-18.893l5.627-8.813zm9.208-1.259l4.616-3.741v9.452l-4.616-5.711z"/></svg>
            <span>Email: anshyadavtg@gmail.com</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-[#30363d] last:border-0 py-5">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-2 hover:text-[#8CFF19] transition-all group"
      >
        <span className="text-base font-bold text-white/90 tracking-tight group-hover:pl-2 transition-all">{question}</span>
        <div className={`w-8 h-8 rounded-full border-2 border-[#30363d] flex items-center justify-center transition-all ${isOpen ? 'rotate-45 bg-[#8CFF19] border-[#8CFF19] text-[#0d1117]' : 'text-gray-500'}`}>
          <span className="text-xl font-light">+</span>
        </div>
      </button>
      {isOpen && (
        <div className="pt-3 pb-5 text-gray-400 text-sm leading-relaxed animate-in slide-in-from-top-2 duration-300 pr-10">
          {answer}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<AppState>(AppState.HOME);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [config, setConfig] = useState<QuizConfig>({
    class: '',
    subject: '',
    topics: [],
    strength: 'Medium',
    quantity: 10
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [loadingStage, setLoadingStage] = useState(0);

  const loadingMessages = [
    "Initializing NCERT Matrix...",
    "Scanning Rationalized Curriculum...",
    "Drafting Context-Aware Questions...",
    "Calibrating Difficulty Spikes...",
    "Finalizing Assessment Neural-Link..."
  ];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let stageInterval: number;
    if (view === AppState.LOADING) {
      setLoadingStage(0);
      stageInterval = window.setInterval(() => {
        setLoadingStage(s => (s < loadingMessages.length - 1 ? s + 1 : s));
      }, 2500);
    }
    return () => clearInterval(stageInterval);
  }, [view]);

  const navigateTo = (newView: AppState) => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    let interval: number;
    if (view === AppState.QUIZ) {
      interval = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  const subjects = useMemo(() => {
    if (!config.class) return [];
    return Array.from(new Set(NCERT_DATA.filter(d => d.className === config.class).map(d => d.subjectName)));
  }, [config.class]);

  const availableTopics = useMemo(() => {
    if (!config.subject || !config.class) return [];
    return Array.from(new Set(NCERT_DATA.filter(d => d.className === config.class && d.subjectName === config.subject).map(d => d.chapterName)));
  }, [config.class, config.subject]);

  const toggleTopic = (topic: string) => {
    setConfig(prev => {
      const isSelected = prev.topics.includes(topic);
      const newTopics = isSelected 
        ? prev.topics.filter(t => t !== topic) 
        : [...prev.topics, topic];
      return { ...prev, topics: newTopics };
    });
  };

  const handleAnswer = (option: string) => {
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[currentIndex] = option;
      return updated;
    });
  };

  const startQuiz = async () => {
    if (!isOnline) return;
    if (!config.class || !config.subject || config.topics.length === 0) return;
    
    setError(null);
    setTimer(0);
    navigateTo(AppState.LOADING);
    
    try {
      const generated = await generateQuestions(config);
      setQuestions(generated);
      setCurrentIndex(0);
      setUserAnswers(new Array(generated.length).fill(''));
      navigateTo(AppState.QUIZ);
    } catch (err) {
      console.error(err);
      setError("The AI Brain is momentarily occupied. Please try selecting fewer modules or a different subject.");
      navigateTo(AppState.SETUP);
    }
  };

  const score = useMemo(() => {
    return questions.reduce((acc, q, idx) => {
      return userAnswers[idx] === q.correctAnswer ? acc + 1 : acc;
    }, 0);
  }, [questions, userAnswers]);

  const getPerformanceBadge = () => {
    const percentage = (score / (questions.length || 1)) * 100;
    if (percentage === 100) return { label: "Scholar", color: "text-[#8CFF19]", bg: "bg-[#8CFF19]/10" };
    if (percentage >= 80) return { label: "Master", color: "text-blue-400", bg: "bg-blue-400/10" };
    if (percentage >= 60) return { label: "Achiever", color: "text-yellow-400", bg: "bg-yellow-400/10" };
    return { label: "Learner", color: "text-red-400", bg: "bg-red-400/10" };
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#c9d1d9] selection:bg-[#8CFF19]/30 selection:text-white">
      <TopBar 
        onHome={() => navigateTo(AppState.HOME)} 
        onCurriculum={() => navigateTo(AppState.CURRICULUM)} 
        isOnline={isOnline}
      />
      
      {!isOnline && view !== AppState.HOME && view !== AppState.QUIZ && view !== AppState.RESULTS && (
        <div className="bg-red-500/20 text-red-400 text-[10px] font-black text-center py-2.5 border-b border-red-500/30 fixed top-[72px] left-0 right-0 z-[950] backdrop-blur-md uppercase tracking-[0.3em] animate-pulse">
          Connection Interrupted: Session Studio Disabled
        </div>
      )}
      
      <main className={`flex-grow container mx-auto px-4 ${view === AppState.QUIZ ? 'pt-24' : 'pt-36'} pb-8 max-w-[1200px]`}>
        {view === AppState.HOME && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <section className="text-center mb-16">
              <header className="mb-12">
                <div className="inline-block px-5 py-2 rounded-full border border-[#8CFF19]/30 text-[#8CFF19] text-[10px] font-black uppercase tracking-[0.4em] mb-6 bg-[#8CFF19]/5 shadow-[0_0_20px_rgba(140,255,25,0.1)]">
                  Intelligence for NCERT Prep
                </div>
                <h1 className="text-7xl md:text-9xl font-black text-white mb-6 tracking-tighter leading-none">U QUIZ</h1>
                <p className="text-base md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
                  The ultimate <span className="text-[#8CFF19] font-bold">Neural Evaluation</span> platform strictly mapped to the Indian National Curriculum.
                </p>
              </header>
              <div className="flex flex-col sm:flex-row justify-center gap-6 mb-20">
                <button 
                  onClick={() => navigateTo(AppState.SETUP)} 
                  disabled={!isOnline}
                  className={`px-14 py-6 font-black rounded-[2rem] uppercase tracking-[0.2em] text-[13px] shadow-2xl transition-all ${isOnline ? 'bg-[#8CFF19] text-[#0d1117] hover:scale-105 hover:shadow-[#8CFF19]/20 active:scale-95' : 'bg-[#1c2128] text-gray-600 cursor-not-allowed opacity-40'}`}
                >
                  Enter Setup Studio
                </button>
                <button onClick={() => navigateTo(AppState.CURRICULUM)} className="px-14 py-6 border-2 border-[#30363d] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[13px] hover:bg-white/5 hover:border-white/20 transition-all">Syllabus Index</button>
              </div>
            </section>

            <section className="max-w-[900px] mx-auto bg-[#161b22] p-10 md:p-16 rounded-[4rem] border border-[#30363d] shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative overflow-hidden">
              <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#8CFF19]/5 rounded-full blur-[100px]"></div>
              <h2 className="text-4xl font-black text-white mb-10 text-center tracking-tight">System Intel</h2>
              
              <div className="grid grid-cols-1 gap-2">
                <FAQItem 
                  question="How accurate is the content?" 
                  answer="U Quiz utilizes a specialized 'NCERT Anchor' prompt that forces the AI to cross-reference the official 2024-25 rationalized syllabus. Every question is designed to test conceptual clarity rather than rote memory."
                />
                <FAQItem 
                  question="Why are fractions showing as p/q?" 
                  answer="We prioritize speed and accessibility across all devices. Standard horizontal notation (3/4) ensures that mathematical questions load instantly and remain readable on even low-resolution mobile displays."
                />
                <FAQItem 
                  question="Does it support regional languages?" 
                  answer="Currently, we provide robust support for English and Hindi NCERT textbooks. More regional languages (Urdu, Sanskrit, etc.) are being indexed into our neural pool."
                />
                <FAQItem 
                  question="Can teachers use this for creating papers?" 
                  answer="Absolutely. U Quiz is a powerful tool for educators to generate diverse mock assessments. The 'Rationale' provided for each answer makes it perfect for classroom discussions."
                />
                <FAQItem 
                  question="Is this platform free to use?" 
                  answer="U Quiz is a community-first platform designed to bridge the gap between high-tech AI and standard school learning. It is free for all students preparing for CBSE and State Board exams."
                />
                <FAQItem 
                  question="What if I find an error in a question?" 
                  answer="While our AI is highly accurate, context shifts can happen. We encourage students to cross-verify 'Rationale' with their physical NCERT textbooks for the most grounded understanding."
                />
              </div>
            </section>
          </div>
        )}

        {view === AppState.SETUP && (
          <div className="max-w-[1000px] mx-auto animate-in slide-in-from-bottom-12 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Configuration */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-[#161b22] rounded-[3rem] border border-[#30363d] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#8CFF19]/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                  
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-[#8CFF19]/10 rounded-2xl flex items-center justify-center border border-[#8CFF19]/20">
                      <span className="text-[#8CFF19] text-2xl">⚙️</span>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Session Architect</h2>
                  </div>

                  {error && (
                    <div className="p-5 bg-red-500/10 border border-red-500/50 text-red-400 rounded-2xl text-sm font-bold flex items-center gap-4 mb-8 animate-in shake duration-500">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-xs">!</span>
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Academic Level</label>
                      <select 
                        className="w-full bg-[#0d1117] border-2 border-[#30363d] p-5 rounded-2xl text-white text-base font-bold focus:border-[#8CFF19] transition-all outline-none cursor-pointer" 
                        value={config.class} 
                        onChange={e => setConfig({...config, class: e.target.value, subject: '', topics: []})}
                      >
                        <option value="">Select Grade</option>
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Learning Area</label>
                      <select 
                        disabled={!config.class} 
                        className="w-full bg-[#0d1117] border-2 border-[#30363d] p-5 rounded-2xl text-white text-base font-bold disabled:opacity-20 focus:border-[#8CFF19] transition-all outline-none cursor-pointer" 
                        value={config.subject} 
                        onChange={e => setConfig({...config, subject: e.target.value, topics: []})}
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {config.subject && (
                    <div className="space-y-5">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em]">Module Inventory ({config.topics.length} Selected)</label>
                        {config.topics.length > 0 && (
                          <button onClick={() => setConfig({...config, topics: []})} className="text-[10px] font-black text-[#8CFF19] uppercase tracking-widest hover:underline">Clear All</button>
                        )}
                      </div>
                      <div className="bg-[#0d1117] border-2 border-[#30363d] rounded-[2.5rem] p-6 max-h-[300px] overflow-y-auto custom-scrollbar grid grid-cols-1 gap-3">
                        {availableTopics.map((topic, i) => (
                          <div 
                            key={i} 
                            onClick={() => toggleTopic(topic)} 
                            className={`flex items-center gap-5 p-5 rounded-2xl cursor-pointer border-2 transition-all ${config.topics.includes(topic) ? 'border-[#8CFF19] bg-[#8CFF19]/10 text-[#8CFF19]' : 'border-transparent text-gray-500 hover:bg-[#161b22] hover:text-gray-300'}`}
                          >
                            <div className={`shrink-0 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${config.topics.includes(topic) ? 'bg-[#8CFF19] border-[#8CFF19]' : 'border-[#30363d]'}`}>
                              {config.topics.includes(topic) && <span className="text-[#0d1117] text-[14px] font-black">✓</span>}
                            </div>
                            <span className="text-sm font-bold leading-snug tracking-tight">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Parameters & Start */}
              <div className="space-y-8">
                <div className="bg-[#161b22] rounded-[3rem] border border-[#30363d] p-8 md:p-10 shadow-2xl">
                  <h3 className="text-xl font-black text-white mb-8 tracking-tight">Parameters</h3>
                  
                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1 mb-4 block">Cognitive Tension</label>
                      <div className="grid grid-cols-3 bg-[#0d1117] p-2 rounded-2xl border-2 border-[#30363d]">
                        {STRENGTHS.map(s => (
                          <button 
                            key={s} 
                            onClick={() => setConfig({...config, strength: s as any})} 
                            className={`py-3 text-[10px] font-black uppercase rounded-xl transition-all ${config.strength === s ? 'bg-[#8CFF19] text-[#0d1117] shadow-lg' : 'text-gray-500 hover:text-white'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-5 px-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Question Density</label>
                        <span className="text-[#8CFF19] font-black text-lg">{config.quantity}</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="25" 
                        step="5" 
                        value={config.quantity} 
                        onChange={e => setConfig({...config, quantity: parseInt(e.target.value)})} 
                        className="w-full accent-[#8CFF19] bg-[#0d1117] h-2 rounded-lg appearance-none cursor-pointer" 
                      />
                      <div className="flex justify-between text-[10px] font-black text-gray-600 mt-3 px-1">
                        <span>LITE</span>
                        <span>DENSE</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] rounded-[3rem] border border-[#30363d] p-1 shadow-2xl">
                  <button 
                    onClick={startQuiz} 
                    disabled={!isOnline || !config.class || !config.subject || config.topics.length === 0} 
                    className={`w-full py-8 font-black uppercase tracking-[0.4em] text-[14px] rounded-[2.9rem] transition-all relative overflow-hidden group ${isOnline && config.class && config.subject && config.topics.length > 0 ? 'bg-[#8CFF19] text-[#0d1117] hover:scale-[1.02] shadow-[0_20px_60px_rgba(140,255,25,0.2)]' : 'bg-[#1c2128] text-gray-600 cursor-not-allowed opacity-30'}`}
                  >
                    <span className="relative z-10">{!isOnline ? 'Offline' : 'Initiate Session'}</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  </button>
                </div>
                
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] text-center px-6">
                  Questions generated are tailored to the latest NCERT guidelines (2024-25).
                </p>
              </div>
            </div>
          </div>
        )}

        {view === AppState.LOADING && (
          <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in duration-500">
            <div className="relative mb-12">
              <div className="w-32 h-32 border-[16px] border-[#8CFF19]/10 border-t-[#8CFF19] rounded-full animate-spin shadow-[0_0_50px_rgba(140,255,25,0.2)]"></div>
              <div className="absolute inset-0 flex items-center justify-center font-black text-[#8CFF19] text-4xl">U</div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white tracking-tighter transition-all duration-500">{loadingMessages[loadingStage]}</h2>
              <p className="text-gray-500 text-sm max-w-sm mx-auto font-medium">This typically takes 10-20 seconds as we handshake with the neural models.</p>
            </div>
            
            <button 
              onClick={() => navigateTo(AppState.SETUP)}
              className="mt-16 px-10 py-4 border-2 border-[#30363d] text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:text-red-400 hover:border-red-400/30 transition-all"
            >
              Abort Construction
            </button>
          </div>
        )}

        {view === AppState.QUIZ && questions.length > 0 && (
          <div className="max-w-[950px] mx-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 px-4 gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-black text-[#8CFF19] uppercase tracking-[0.2em] bg-[#8CFF19]/10 px-4 py-1.5 rounded-full border border-[#8CFF19]/20">{config.subject}</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white/5 px-4 py-1.5 rounded-full border border-white/10">{config.class}</span>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">Validation Session</h2>
              </div>
              <div className="text-left md:text-right w-full md:w-auto flex md:flex-col justify-between items-center md:items-end">
                <div className="text-white font-black text-3xl leading-none">
                  {currentIndex + 1} 
                  <span className="text-gray-600 text-lg font-medium ml-2">/ {questions.length}</span>
                </div>
                <div className="text-[#8CFF19] font-mono text-sm tracking-widest">{formatTime(timer)}</div>
              </div>
            </div>
            
            <div className="bg-[#161b22] rounded-[2.5rem] border-2 border-[#30363d] p-6 md:p-12 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#8CFF19]/5 rounded-full blur-[120px] -mr-40 -mt-40"></div>
              
              <div className="bg-[#0d1117] border-2 border-[#30363d] rounded-[2rem] p-6 md:p-10 shadow-inner relative z-10">
                <MathText content={questions[currentIndex].question} className="text-base md:text-xl font-bold text-white leading-relaxed tracking-tight" />
              </div>
              
              <div className="grid grid-cols-1 gap-4 relative z-10">
                {questions[currentIndex].options.map((option, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => { handleAnswer(option); }} 
                    className={`group w-full p-4 md:p-6 rounded-[1.5rem] text-left border-2 flex items-center gap-5 transition-all ${userAnswers[currentIndex] === option ? 'border-[#8CFF19] bg-[#8CFF19]/10 text-white shadow-lg' : 'border-[#30363d] bg-[#0d1117] text-gray-500 hover:border-gray-500 hover:text-gray-300'}`}
                  >
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 transition-all ${userAnswers[currentIndex] === option ? 'bg-[#8CFF19] text-[#0d1117] scale-105' : 'bg-[#1c2128]'}`}>{String.fromCharCode(65 + idx)}</div>
                    <MathText content={option} className="text-sm md:text-base font-bold tracking-tight leading-snug" />
                  </button>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-[#30363d] gap-4">
                <button 
                  disabled={currentIndex === 0} 
                  onClick={() => { setCurrentIndex(currentIndex - 1); window.scrollTo({top: 0}); }} 
                  className="w-full sm:w-auto px-8 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] hover:text-white disabled:opacity-0 transition-all text-center"
                >
                  ← Backtrack
                </button>
                <button 
                  disabled={!userAnswers[currentIndex]} 
                  onClick={() => { if (currentIndex < questions.length - 1) { setCurrentIndex(currentIndex + 1); window.scrollTo({top: 0}); } else { setFinalTime(timer); navigateTo(AppState.RESULTS); } }} 
                  className="w-full sm:w-auto px-10 py-4 bg-[#8CFF19] text-[#0d1117] font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-center"
                >
                  {currentIndex === questions.length - 1 ? 'Compute Results' : 'Next Question →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === AppState.RESULTS && (
          <div className="max-w-[1000px] mx-auto animate-in zoom-in-95 duration-1000">
            <div className="bg-[#161b22] rounded-[3rem] border-2 border-[#30363d] p-8 md:p-12 text-center shadow-[0_80px_150px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-full ${score / questions.length >= 0.7 ? 'bg-green-500/5' : 'bg-red-500/5'} blur-[180px] pointer-events-none`}></div>
              
              <header className="mb-12 flex flex-col items-center">
                 <div className="w-48 h-48 rounded-full border-[16px] border-[#1c2128] bg-[#0d1117] flex items-center justify-center mb-8 shadow-2xl relative">
                   <div className="absolute inset-0 rounded-full border-2 border-[#8CFF19]/10 animate-ping opacity-20"></div>
                   <div className="text-center z-10">
                     <div className="text-7xl font-black text-white leading-none">{score}</div>
                     <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-2">/ {questions.length} Points</div>
                   </div>
                 </div>
                 <div className={`inline-block px-10 py-3 rounded-[2rem] ${getPerformanceBadge().bg} border border-white/5 shadow-2xl`}>
                    <span className={`text-3xl font-black uppercase tracking-[0.4em] ${getPerformanceBadge().color}`}>{getPerformanceBadge().label}</span>
                 </div>
              </header>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                <div className="bg-[#0d1117] p-6 rounded-[2rem] border-2 border-[#30363d] shadow-inner"><div className="text-3xl font-black text-[#8CFF19] mb-1">{(score/questions.length*100).toFixed(0)}%</div><div className="text-[10px] uppercase text-gray-500 font-black tracking-[0.3em]">Accuracy</div></div>
                <div className="bg-[#0d1117] p-6 rounded-[2rem] border-2 border-[#30363d] shadow-inner"><div className="text-3xl font-black text-white mb-1">{formatTime(finalTime)}</div><div className="text-[10px] uppercase text-gray-500 font-black tracking-[0.3em]">Duration</div></div>
                <div className="bg-[#0d1117] p-6 rounded-[2rem] border-2 border-[#30363d] shadow-inner"><div className="text-3xl font-black text-green-400 mb-1">{score}</div><div className="text-[10px] uppercase text-gray-500 font-black tracking-[0.3em]">Success</div></div>
                <div className="bg-[#0d1117] p-6 rounded-[2rem] border-2 border-[#30363d] shadow-inner"><div className="text-3xl font-black text-red-400 mb-1">{questions.length - score}</div><div className="text-[10px] uppercase text-gray-500 font-black tracking-[0.3em]">Deficit</div></div>
              </div>

              <div className="space-y-10 text-left mb-16 max-h-[700px] overflow-y-auto pr-6 custom-scrollbar">
                <div className="flex items-center gap-6 mb-8">
                   <div className="h-px flex-grow bg-gradient-to-r from-transparent to-[#30363d]"></div>
                   <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.5em]">Session Review Log</h3>
                   <div className="h-px flex-grow bg-gradient-to-l from-transparent to-[#30363d]"></div>
                </div>

                {questions.map((q, idx) => {
                  const isCorrect = userAnswers[idx] === q.correctAnswer;
                  return (
                    <div key={idx} className={`p-8 rounded-[2.5rem] border-2 transition-all hover:bg-white/[0.01] ${isCorrect ? 'bg-green-500/[0.03] border-green-500/10 shadow-[0_10px_40px_rgba(34,197,94,0.03)]' : 'bg-red-500/[0.03] border-red-500/10 shadow-[0_10px_40px_rgba(239,68,68,0.03)]'}`}>
                      <div className="flex items-start gap-6 mb-6">
                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-base border-2 ${isCorrect ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]' : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]'}`}>{idx + 1}</div>
                        <MathText content={q.question} className="font-bold text-xl text-white leading-relaxed tracking-tight" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 md:ml-16">
                        <div className={`p-6 rounded-[1.5rem] border shadow-inner ${isCorrect ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                          <span className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Input Entry</span>
                          <MathText content={userAnswers[idx] || "UNANSWERED"} className={`font-black text-base ${isCorrect ? 'text-green-400' : 'text-red-400'}`} />
                        </div>
                        {!isCorrect && (
                          <div className="bg-[#8CFF19]/5 p-6 rounded-[1.5rem] border border-[#8CFF19]/20 shadow-inner">
                            <span className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">NCERT Standard</span>
                            <MathText content={q.correctAnswer} className="text-[#8CFF19] font-black text-base" />
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-[#0d1117] p-6 rounded-[2rem] border border-[#30363d] shadow-lg relative overflow-hidden md:ml-16">
                         <div className="absolute top-0 right-0 w-48 h-48 bg-[#8CFF19]/5 rounded-full blur-[80px] -mr-24 -mt-24"></div>
                         <div className="flex items-center gap-4 mb-4">
                            <div className="w-3 h-3 bg-[#8CFF19] rounded-full shadow-[0_0_10px_#8CFF19]"></div>
                            <span className="text-[11px] uppercase font-black text-[#8CFF19] tracking-[0.4em]">NCERT Rationale</span>
                         </div>
                         <MathText content={q.explanation} className="text-base text-gray-400 leading-relaxed italic pr-4" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button onClick={() => navigateTo(AppState.HOME)} className="px-12 py-5 bg-[#8CFF19] text-[#0d1117] font-black rounded-[1.5rem] uppercase tracking-[0.3em] text-[12px] shadow-2xl transition-all hover:scale-105 active:scale-95">Home Console</button>
                <button onClick={() => navigateTo(AppState.SETUP)} className="px-12 py-5 border-2 border-[#30363d] text-white font-black rounded-[1.5rem] uppercase tracking-[0.3em] text-[12px] hover:bg-white/5 hover:border-white/20 transition-all">New calibration</button>
              </div>
            </div>
          </div>
        )}

        {view === AppState.CURRICULUM && (
          <div className="max-w-[1100px] mx-auto animate-in fade-in duration-700">
            <h2 className="text-7xl font-black text-white mb-16 text-center tracking-tighter">Syllabus Matrix</h2>
            <div className="grid gap-16">
              {CLASSES.map((cls, i) => {
                const classData = NCERT_DATA.filter(d => d.className === cls);
                const subjectsInClass = Array.from(new Set(classData.map(d => d.subjectName)));
                return (
                  <div key={i} className="bg-[#161b22] rounded-[4rem] border-2 border-[#30363d] overflow-hidden shadow-2xl transition-all hover:border-[#8CFF19]/20">
                    <div className="bg-[#1c2128] px-14 py-10 border-b-2 border-[#30363d] shadow-lg"><h3 className="text-4xl font-black text-[#8CFF19] tracking-tight">{cls}</h3></div>
                    <div className="p-14 grid md:grid-cols-2 gap-16">
                      {subjectsInClass.map((sub, j) => (
                        <div key={j} className="space-y-8">
                          <h4 className="text-white font-black flex items-center gap-6 text-2xl"><div className="w-4 h-4 bg-[#8CFF19] rounded-full shadow-[0_0_15px_#8CFF19]"></div>{sub}</h4>
                          <div className="grid gap-4 pl-10 border-l-2 border-[#30363d] transition-all hover:border-[#8CFF19]/40">
                            {classData.filter(d => d.subjectName === sub).map((chap, k) => <div key={k} className="text-sm font-bold text-gray-500 hover:text-gray-300 transition-colors cursor-default leading-snug tracking-tight">{chap.chapterName}</div>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-24 text-center">
              <button onClick={() => navigateTo(AppState.SETUP)} className="px-24 py-7 bg-[#8CFF19] text-[#0d1117] font-black rounded-[2.5rem] uppercase tracking-[0.4em] text-[14px] shadow-2xl transition-all hover:scale-105 active:scale-95">Initiate Session</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
