import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage, GeminiChatMessage } from '../types';
import { 
  sendPublicChatMessage, 
  listenToPublicChat, 
  deletePublicChatMessage, 
  getISTTimeString 
} from '../services/firebase';
import { sendGeminiStudyQuery } from '../services/geminiService';
import { MathText } from './MathText';
import { 
  Users, 
  Sparkles, 
  Send, 
  Trash2, 
  Copy, 
  Check, 
  Bot, 
  ArrowDown, 
  RotateCcw,
  Tag,
  Clock,
  HelpCircle,
  GraduationCap,
  ChevronDown
} from 'lucide-react';

interface ChatViewProps {
  user: UserProfile | null;
  onSignIn: () => void;
  initialTab?: 'gemini' | 'public';
}

const SUBJECT_OPTIONS = [
  'Science',
  'Mathematics',
  'Social Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'General'
];

const CLASS_OPTIONS = [
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12'
];

const QUICK_AI_SUGGESTIONS = [
  { label: '⚡ Ohm\'s Law & Circuits', prompt: 'Explain Ohm\'s Law and how resistance depends on length, area, and resistivity with NCERT Class 10 examples.' },
  { label: '🌿 Photosynthesis Cycle', prompt: 'Explain Light Reaction vs Calvin Cycle in photosynthesis with clear step-by-step NCERT points.' },
  { label: '📐 Trigonometric Identities', prompt: 'Prove the identity sin^2(θ) + cos^2(θ) = 1 and give a shortcut to remember standard angle values.' },
  { label: '🧪 Balancing Chemical Equations', prompt: 'Teach me the systematic step-by-step method to balance chemical equations with 2 examples from NCERT.' },
  { label: '🎯 High-Yield Exam Tips', prompt: 'What are the top 5 recurring question patterns in Class 10 NCERT Science and how should I write 5-mark answers?' }
];

export const ChatView: React.FC<ChatViewProps> = ({ user, onSignIn, initialTab = 'gemini' }) => {
  const [activeTab, setActiveTab] = useState<'gemini' | 'public'>(initialTab);

  // ---------------- GEMINI AI CHAT STATE ----------------
  const [geminiMessages, setGeminiMessages] = useState<GeminiChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('uquiz_gemini_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'welcome_ai_msg',
        role: 'model',
        content: `**Namaste! I am your AI NCERT Study Mentor & Doubt Solver.**\n\nI can explain concepts across **Classes 1–12 (NCF-SE & NCERT)**, break down mathematical numericals, balance chemical equations, or give you personalized practice questions.\n\n*What topic or chapter would you like to explore today?*`,
        timestamp: Date.now(),
        subjectContext: 'Science',
        classContext: 'Class 10'
      }
    ];
  });
  const [geminiInput, setGeminiInput] = useState('');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSubject, setSelectedSubject] = useState('Science');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showScrollBottomAi, setShowScrollBottomAi] = useState(false);
  const geminiMessagesEndRef = useRef<HTMLDivElement>(null);
  const geminiScrollContainerRef = useRef<HTMLDivElement>(null);

  // ---------------- PUBLIC CHAT STATE ----------------
  const [publicMessages, setPublicMessages] = useState<ChatMessage[]>([]);
  const [publicInput, setPublicInput] = useState('');
  const [publicTag, setPublicTag] = useState('General');
  const [filterTag, setFilterTag] = useState('All');
  const [isSendingPublic, setIsSendingPublic] = useState(false);
  const [publicError, setPublicError] = useState<string | null>(null);
  const [showScrollBottomPublic, setShowScrollBottomPublic] = useState(false);
  const publicMessagesEndRef = useRef<HTMLDivElement>(null);
  const publicScrollContainerRef = useRef<HTMLDivElement>(null);

  // Persist Gemini chat history
  useEffect(() => {
    try {
      localStorage.setItem('uquiz_gemini_chat_history', JSON.stringify(geminiMessages));
    } catch (e) {
      console.warn('Failed to save AI chat history locally', e);
    }
  }, [geminiMessages]);

  // Subscribe to real-time Public Chat
  useEffect(() => {
    const unsub = listenToPublicChat((msgs) => {
      setPublicMessages(msgs);
    }, 100);
    return () => unsub();
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (activeTab === 'gemini') {
      geminiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [geminiMessages, isGeneratingAi, activeTab]);

  useEffect(() => {
    if (activeTab === 'public') {
      publicMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [publicMessages, activeTab]);

  // Scroll position listeners
  const handleAiScroll = () => {
    if (!geminiScrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = geminiScrollContainerRef.current;
    setShowScrollBottomAi(scrollHeight - scrollTop - clientHeight > 140);
  };

  const handlePublicScroll = () => {
    if (!publicScrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = publicScrollContainerRef.current;
    setShowScrollBottomPublic(scrollHeight - scrollTop - clientHeight > 140);
  };

  // Send message to Gemini AI
  const handleSendGemini = async (overrideText?: string) => {
    const text = (overrideText || geminiInput).trim();
    if (!text || isGeneratingAi) return;

    const userMsg: GeminiChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      subjectContext: selectedSubject,
      classContext: selectedClass
    };

    const newHistory = [...geminiMessages, userMsg];
    setGeminiMessages(newHistory);
    if (!overrideText) setGeminiInput('');
    setIsGeneratingAi(true);

    try {
      const apiMessages = newHistory.map(m => ({
        role: m.role,
        content: m.content
      }));

      const reply = await sendGeminiStudyQuery({
        messages: apiMessages,
        classContext: selectedClass,
        subjectContext: selectedSubject,
        syllabusYear: '2026-27'
      });

      const aiMsg: GeminiChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        content: reply,
        timestamp: Date.now(),
        subjectContext: selectedSubject,
        classContext: selectedClass
      };

      setGeminiMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      const errorMsg: GeminiChatMessage = {
        id: `ai_err_${Date.now()}`,
        role: 'model',
        content: `**Apologies!** I encountered a temporary error (${err.message || 'Network issue'}). Please try asking again or rephrasing your question.`,
        timestamp: Date.now()
      };
      setGeminiMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Send message to Public Room
  const handleSendPublic = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      onSignIn();
      return;
    }
    const text = publicInput.trim();
    if (!text || isSendingPublic) return;

    try {
      setIsSendingPublic(true);
      setPublicError(null);
      await sendPublicChatMessage(user, text, publicTag);
      setPublicInput('');
    } catch (err: any) {
      console.error('Public chat send error:', err);
      setPublicError(err.message || 'Failed to send message.');
    } finally {
      setIsSendingPublic(false);
    }
  };

  const handleDeletePublicMessage = async (msgId: string) => {
    try {
      await deletePublicChatMessage(msgId);
    } catch (err: any) {
      console.error('Delete message error:', err);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleResetAiChat = () => {
    if (window.confirm('Start a fresh conversation with Gemini AI Tutor?')) {
      const resetMsg: GeminiChatMessage = {
        id: 'welcome_ai_msg',
        role: 'model',
        content: `**New session started!** I'm ready for your questions in **${selectedClass} ${selectedSubject}**. Ask me any concept, numerical, or NCERT doubt!`,
        timestamp: Date.now(),
        subjectContext: selectedSubject,
        classContext: selectedClass
      };
      setGeminiMessages([resetMsg]);
    }
  };

  const filteredPublicMessages = filterTag === 'All'
    ? publicMessages
    : publicMessages.filter(m => m.subjectTag === filterTag);

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
      {/* Main Chat Container */}
      <div className="flex flex-col h-[calc(100vh-125px)] min-h-[580px] max-h-[820px] bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
        
        {/* ===================== CHAT TOP APP BAR ===================== */}
        <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Left: Chat Mode Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              id="tab-gemini-chat"
              onClick={() => setActiveTab('gemini')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gemini'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Gemini AI Tutor</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <button
              id="tab-public-chat"
              onClick={() => setActiveTab('public')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'public'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Public Room</span>
              {publicMessages.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/50 text-slate-300 font-mono">
                  {publicMessages.length}
                </span>
              )}
            </button>
          </div>

          {/* Right: Context Controls */}
          {activeTab === 'gemini' ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="appearance-none bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-semibold pl-3 pr-7 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {CLASS_OPTIONS.map(c => (
                    <option key={c} value={c} className="bg-slate-900 text-slate-200">{c}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="appearance-none bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-semibold pl-3 pr-7 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {SUBJECT_OPTIONS.map(s => (
                    <option key={s} value={s} className="bg-slate-900 text-slate-200">{s}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>

              <button
                onClick={handleResetAiChat}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                title="Start a new chat session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-500" /> Filter:
              </span>
              <div className="relative">
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="appearance-none bg-slate-900 border border-slate-800 text-xs text-teal-400 font-semibold pl-3 pr-7 py-1.5 rounded-xl focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="All" className="bg-slate-900 text-slate-200">All Subjects ({publicMessages.length})</option>
                  {SUBJECT_OPTIONS.map(s => (
                    <option key={s} value={s} className="bg-slate-900 text-slate-200">{s}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>
          )}

        </div>

        {/* ===================== MESSAGES STREAM ===================== */}
        {activeTab === 'gemini' ? (
          <div
            ref={geminiScrollContainerRef}
            onScroll={handleAiScroll}
            className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 relative custom-scrollbar"
          >
            {geminiMessages.map((msg) => {
              const isUser = msg.role === 'user';
              const isCopied = copiedMessageId === msg.id;
              const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 group items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="shrink-0 pt-0.5">
                    {isUser ? (
                      user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="You"
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-emerald-500/40"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow-md">
                          {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`flex flex-col max-w-[88%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                    
                    {/* Author & Meta */}
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-semibold text-slate-300">
                        {isUser ? 'You' : 'Gemini NCERT Tutor'}
                      </span>
                      {!isUser && msg.subjectContext && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {msg.classContext ? `${msg.classContext} • ` : ''}{msg.subjectContext}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        {formattedTime}
                      </span>
                    </div>

                    {/* Speech Bubble */}
                    <div
                      className={`p-4 rounded-2xl relative shadow-lg ${
                        isUser
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-none'
                          : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-none'
                      }`}
                    >
                      {/* Rich Markdown & KaTeX rendering */}
                      <MathText content={msg.content} />

                      {/* AI Response Action Tools */}
                      {!isUser && (
                        <div className="flex flex-wrap items-center justify-end gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
                          <button
                            onClick={() => handleCopyText(msg.id, msg.content)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
                            title="Copy answer"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleSendGemini(`Give me 2 practice quiz questions with 4 options to test my understanding of this topic.`)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-[11px] text-emerald-400 font-medium transition-colors cursor-pointer border border-emerald-500/30"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Test Me on This</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}

            {/* Quick Starters Chip Bar (if only welcome message exists) */}
            {geminiMessages.length <= 1 && (
              <div className="pt-3 pb-1 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Suggested NCERT Doubts:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_AI_SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendGemini(item.prompt)}
                      className="text-left px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing State Indicator */}
            {isGeneratingAi && (
              <div className="flex gap-3 items-start animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-slate-400 ml-2 font-mono">Gemini is drafting solution...</span>
                </div>
              </div>
            )}

            <div ref={geminiMessagesEndRef} />

            {/* Jump to bottom button */}
            {showScrollBottomAi && (
              <button
                onClick={() => geminiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="sticky bottom-4 right-4 ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs shadow-xl hover:bg-emerald-400 transition-all cursor-pointer animate-bounce"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Jump to latest</span>
              </button>
            )}
          </div>
        ) : (
          /* ===================== PUBLIC PEER CHAT STREAM ===================== */
          <div
            ref={publicScrollContainerRef}
            onScroll={handlePublicScroll}
            className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 relative custom-scrollbar"
          >
            {filteredPublicMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">No Messages in {filterTag} Stream</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Be the first scholar to ask a question, share a memory tip, or discuss an NCERT concept!
                </p>
              </div>
            ) : (
              filteredPublicMessages.map((msg) => {
                const isMe = user?.uid === msg.userId;
                const istTime = getISTTimeString(new Date(msg.timestamp));

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 group items-start ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className="shrink-0 pt-0.5">
                      {msg.userPhoto ? (
                        <img
                          src={msg.userPhoto}
                          alt={msg.userName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isMe ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-teal-400 border border-slate-700'
                        }`}>
                          {msg.userName ? msg.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>

                    {/* Speech Bubble */}
                    <div className={`flex flex-col max-w-[88%] sm:max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-xs font-semibold text-slate-300">
                          {isMe ? 'You' : msg.userName}
                        </span>
                        {msg.subjectTag && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-teal-400 border border-slate-700">
                            {msg.subjectTag}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {istTime}
                        </span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl relative shadow-md ${
                          isMe
                            ? 'bg-gradient-to-br from-teal-600 to-cyan-700 text-white rounded-tr-none'
                            : 'bg-slate-950/90 text-slate-100 border border-slate-800 rounded-tl-none'
                        }`}
                      >
                        <MathText content={msg.message} />

                        {isMe && (
                          <button
                            onClick={() => handleDeletePublicMessage(msg.id)}
                            className="absolute -bottom-2 -left-2 p-1 rounded-md bg-slate-900 border border-rose-500/30 text-rose-400 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 transition-all cursor-pointer shadow"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={publicMessagesEndRef} />

            {showScrollBottomPublic && (
              <button
                onClick={() => publicMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="sticky bottom-4 right-4 ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500 text-slate-950 font-bold text-xs shadow-xl hover:bg-teal-400 transition-all cursor-pointer animate-bounce"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Jump to latest</span>
              </button>
            )}
          </div>
        )}

        {/* ===================== CHAT INPUT BAR ===================== */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 shrink-0">
          {activeTab === 'gemini' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendGemini();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={geminiInput}
                onChange={(e) => setGeminiInput(e.target.value)}
                placeholder={`Ask Gemini Tutor about ${selectedClass} ${selectedSubject}... (Press Enter)`}
                disabled={isGeneratingAi}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!geminiInput.trim() || isGeneratingAi}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          ) : (
            <div>
              {publicError && (
                <div className="text-xs text-rose-400 px-2 pb-1.5 flex items-center justify-between">
                  <span>{publicError}</span>
                  <button onClick={() => setPublicError(null)} className="underline cursor-pointer">dismiss</button>
                </div>
              )}

              {user ? (
                <form onSubmit={handleSendPublic} className="flex items-center gap-2">
                  <div className="relative shrink-0">
                    <select
                      value={publicTag}
                      onChange={(e) => setPublicTag(e.target.value)}
                      className="appearance-none bg-slate-900 border border-slate-800 text-xs text-teal-400 font-semibold pl-3 pr-7 py-3 rounded-2xl focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      {SUBJECT_OPTIONS.map(s => (
                        <option key={s} value={s} className="bg-slate-900 text-slate-200">{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-4 pointer-events-none" />
                  </div>

                  <input
                    type="text"
                    value={publicInput}
                    onChange={(e) => setPublicInput(e.target.value)}
                    placeholder={`Message scholars in Public Room...`}
                    maxLength={1000}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />

                  <button
                    type="submit"
                    disabled={!publicInput.trim() || isSendingPublic}
                    className="px-4 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-300 pl-2">
                    <GraduationCap className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Sign in with Google to post questions and chat with fellow scholars.</span>
                  </div>
                  <button
                    onClick={onSignIn}
                    className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-colors shrink-0 cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
