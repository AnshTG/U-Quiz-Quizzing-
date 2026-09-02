import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage, GeminiChatMessage } from '../types';
import { 
  sendPublicChatMessage, 
  listenToPublicChat, 
  deletePublicChatMessage, 
  togglePublicChatReaction,
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
  CheckCheck,
  Bot, 
  ArrowDown, 
  ArrowLeft,
  RotateCcw,
  Tag,
  Clock,
  HelpCircle,
  GraduationCap,
  ChevronDown,
  Smile,
  Flame,
  Lightbulb,
  ThumbsUp,
  Heart,
  Plus
} from 'lucide-react';

interface ChatViewProps {
  user: UserProfile | null;
  onSignIn: () => void;
  initialTab?: 'gemini' | 'public';
  onBackHome?: () => void;
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
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
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

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '🙏', '🔥', '💡', '👏'];

export const ChatView: React.FC<ChatViewProps> = ({ user, onSignIn, initialTab = 'gemini', onBackHome }) => {
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
        classContext: 'Class 10',
        reactions: { '💡': 1 }
      }
    ];
  });
  const [geminiInput, setGeminiInput] = useState('');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSubject, setSelectedSubject] = useState('Science');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showScrollBottomAi, setShowScrollBottomAi] = useState(false);
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);
  const geminiMessagesEndRef = useRef<HTMLDivElement>(null);
  const geminiScrollContainerRef = useRef<HTMLDivElement>(null);

  // ---------------- PUBLIC CHAT STATE ----------------
  const [publicMessages, setPublicMessages] = useState<ChatMessage[]>([]);
  const [publicInput, setPublicInput] = useState('');
  const [publicTag, setPublicTag] = useState('General');
  const [isSendingPublic, setIsSendingPublic] = useState(false);
  const [publicError, setPublicError] = useState<string | null>(null);
  const [showScrollBottomPublic, setShowScrollBottomPublic] = useState(false);
  const publicMessagesEndRef = useRef<HTMLDivElement>(null);
  const publicScrollContainerRef = useRef<HTMLDivElement>(null);

  // Close reaction picker on outside click
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.reaction-picker-container') && !target.closest('.reaction-trigger-btn')) {
        setActiveReactionPickerId(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

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

  // React to Gemini Message
  const handleGeminiReaction = (messageId: string, emoji: string) => {
    setGeminiMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;
      const current = { ...(msg.reactions || {}) };
      if (current[emoji]) {
        delete current[emoji];
      } else {
        current[emoji] = 1;
      }
      return { ...msg, reactions: current };
    }));
    setActiveReactionPickerId(null);
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

  // React to Public Chat Message
  const handlePublicReaction = async (messageId: string, emoji: string) => {
    if (!user) {
      onSignIn();
      return;
    }
    setActiveReactionPickerId(null);
    try {
      await togglePublicChatReaction(messageId, emoji, user.uid);
    } catch (err) {
      console.error('Reaction error:', err);
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
        classContext: selectedClass,
        reactions: { '💡': 1 }
      };
      setGeminiMessages([resetMsg]);
    }
  };

  const filteredPublicMessages = publicMessages;

  return (
    <div className="w-full h-full flex flex-col bg-[#0b141a] text-[#e9edef] select-text overflow-hidden">
      
      {/* ===================== WHATSAPP TOP APP BAR ===================== */}
      <header className="h-16 px-3 sm:px-5 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between gap-2 sm:gap-4 shrink-0 sticky top-0 z-30 shadow-md">
        
        {/* Left: Back button + Chat Avatar & Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onBackHome && (
            <button
              type="button"
              onClick={onBackHome}
              className="p-2 rounded-full hover:bg-[#374248] text-[#aebac1] hover:text-white transition-colors cursor-pointer shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {activeTab === 'gemini' ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00a884] to-[#25d366] flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
                  <Bot className="w-5 h-5 text-slate-950" />
                </div>
                <span className="w-3 h-3 rounded-full bg-[#00a884] border-2 border-[#202c33] absolute bottom-0 right-0" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-semibold text-sm sm:text-base text-[#e9edef] truncate">
                    AI NCERT Study Mentor
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#00a884]/20 text-[#25d366] border border-[#00a884]/30 shrink-0">
                    24/7 AI
                  </span>
                </div>
                <span className="text-xs text-[#00a884] font-medium flex items-center gap-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse" />
                  Online • AI Study Mentor & Doubt Solver
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#374248] border border-[#2a3942] flex items-center justify-center text-[#00a884] font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <span className="w-3 h-3 rounded-full bg-[#00a884] border-2 border-[#202c33] absolute bottom-0 right-0" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-semibold text-sm sm:text-base text-[#e9edef] truncate">
                    Scholar Public Study Room
                  </span>
                </div>
                <span className="text-xs text-[#8696a0] truncate">
                  Real-time peer discussions & questions
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Center/Right: Chat Switcher & Quick Dropdowns */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Chat Mode Switcher Tabs */}
          <div className="flex items-center bg-[#111b21] p-1 rounded-xl border border-[#2a3942]">
            <button
              id="tab-gemini-chat"
              onClick={() => setActiveTab('gemini')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gemini'
                  ? 'bg-[#00a884] text-slate-950 shadow-sm'
                  : 'text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Tutor</span>
            </button>

            <button
              id="tab-public-chat"
              onClick={() => setActiveTab('public')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'public'
                  ? 'bg-[#00a884] text-slate-950 shadow-sm'
                  : 'text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Room</span>
            </button>
          </div>

          {/* Context Selectors for AI Chat */}
          {activeTab === 'gemini' && (
            <div className="flex items-center gap-1.5">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="hidden sm:block bg-[#111b21] text-xs font-semibold text-[#00a884] border border-[#2a3942] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#00a884] cursor-pointer"
                title="Select Target NCERT Class"
              >
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls} className="bg-[#202c33] text-white">
                    {cls}
                  </option>
                ))}
              </select>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="hidden md:block bg-[#111b21] text-xs font-semibold text-[#e9edef] border border-[#2a3942] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#00a884] cursor-pointer"
                title="Select NCERT Subject"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub} className="bg-[#202c33] text-white">
                    {sub}
                  </option>
                ))}
              </select>

              <button
                onClick={handleResetAiChat}
                className="p-2 rounded-xl bg-[#111b21] hover:bg-[#374248] border border-[#2a3942] text-[#8696a0] hover:text-white transition-colors cursor-pointer"
                title="Clear Chat / Start New Session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      </header>

      {/* ===================== WHATSAPP CHAT WALLPAPER & MESSAGES ===================== */}
      <main className="flex-1 min-h-0 overflow-y-auto relative bg-[#0b141a] p-3 sm:p-5 space-y-3 custom-scrollbar overscroll-contain">
        
        {/* Subtle WhatsApp style encrypted / session notice banner */}
        <div className="flex justify-center my-1">
          <div className="px-3.5 py-1 rounded-lg bg-[#182229] border border-[#222e35] text-[11px] text-[#8696a0] text-center max-w-md shadow-sm font-medium">
            🔒 {activeTab === 'gemini' ? 'NCERT Syllabus 2025–27 aligned AI study session' : 'Live public scholar discussion room'}
          </div>
        </div>

        {activeTab === 'gemini' ? (
          /* ===================== GEMINI AI CHAT STREAM ===================== */
          <div
            ref={geminiScrollContainerRef}
            onScroll={handleAiScroll}
            className="space-y-3.5"
          >
            {geminiMessages.map((msg) => {
              const isUser = msg.role === 'user';
              const isCopied = copiedMessageId === msg.id;
              const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const reactions = msg.reactions || {};
              const hasReactions = Object.keys(reactions).length > 0;
              const isPickerOpen = activeReactionPickerId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col group relative ${isUser ? 'items-end' : 'items-start'}`}
                >
                  {/* WhatsApp Floating Reaction Bar Trigger on Hover */}
                  <div className={`relative flex items-center ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-1 max-w-[92%] sm:max-w-[80%]`}>
                    
                    {/* Action pill on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 px-1">
                      <button
                        type="button"
                        onClick={() => setActiveReactionPickerId(isPickerOpen ? null : msg.id)}
                        className="reaction-trigger-btn p-1.5 rounded-full bg-[#202c33] hover:bg-[#374248] text-[#8696a0] hover:text-[#00a884] border border-[#2a3942] shadow-md transition-all cursor-pointer active:scale-95"
                        title="React with Emoji"
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>
                      
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="p-1.5 rounded-full bg-[#202c33] hover:bg-[#374248] text-[#8696a0] hover:text-white border border-[#2a3942] shadow-md transition-all cursor-pointer"
                          title="Copy Answer"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-[#00a884]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    {/* Reaction Picker Popup (WhatsApp Style) */}
                    {isPickerOpen && (
                      <div className={`reaction-picker-container absolute -top-11 z-40 ${isUser ? 'right-0' : 'left-0'} flex items-center gap-1.5 p-1.5 rounded-full bg-[#202c33] border border-[#2a3942] shadow-2xl animate-fade-in`}>
                        {REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleGeminiReaction(msg.id, emoji)}
                            className="text-lg sm:text-xl p-1 rounded-full hover:bg-[#374248] hover:scale-125 transition-all cursor-pointer active:scale-95"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* WhatsApp Speech Bubble */}
                    <div
                      className={`relative px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-md ${
                        isUser
                          ? 'bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-none'
                          : 'bg-[#202c33] text-[#e9edef] border border-[#2a3942]/60 rounded-2xl rounded-tl-none'
                      }`}
                    >
                      {/* Author / Context Banner for AI */}
                      {!isUser && (
                        <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-[#2a3942]/60">
                          <span className="text-xs font-bold text-[#00a884] flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            Gemini AI Tutor
                          </span>
                          {msg.subjectContext && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#111b21] text-[#8696a0] border border-[#2a3942]">
                              {msg.classContext ? `${msg.classContext} • ` : ''}{msg.subjectContext}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Content with Markdown and Math rendering */}
                      <div className="text-sm leading-relaxed">
                        <MathText content={msg.content} />
                      </div>

                      {/* Interactive AI Suggestion Pill inside bubble */}
                      {!isUser && (
                        <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[#2a3942]/50">
                          <button
                            type="button"
                            onClick={() => handleSendGemini(`Give me 2 practice quiz questions with 4 options to test my understanding of this topic.`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111b21] hover:bg-[#2a3942] text-[11px] text-[#00a884] font-medium transition-colors cursor-pointer border border-[#2a3942]"
                          >
                            <Sparkles className="w-3 h-3 text-[#00a884]" />
                            <span>Test Me on This</span>
                          </button>
                        </div>
                      )}

                      {/* WhatsApp Time & Double Checkmark */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#8696a0] select-none font-mono">
                        <span>{formattedTime}</span>
                        {isUser && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                        )}
                      </div>

                      {/* Attached WhatsApp Reaction Badges at Bottom Corner */}
                      {hasReactions && (
                        <div className={`absolute -bottom-3 ${isUser ? 'right-2' : 'left-2'} flex items-center gap-1 z-10`}>
                          {Object.entries(reactions).map(([emoji, count]) => (
                            <button
                              key={emoji}
                              onClick={() => handleGeminiReaction(msg.id, emoji)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#182229] border border-[#222e35] text-xs shadow-md hover:bg-[#222e35] transition-all cursor-pointer active:scale-95"
                            >
                              <span>{emoji}</span>
                              {count > 1 && <span className="text-[10px] text-[#8696a0] font-mono">{count}</span>}
                            </button>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              );
            })}

            {/* Quick Starters Chip Bar */}
            {geminiMessages.length <= 1 && (
              <div className="pt-4 pb-2 space-y-2 max-w-xl mx-auto">
                <div className="flex items-center gap-1.5 text-xs text-[#8696a0] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#00a884]" />
                  <span>Suggested NCERT Doubts to Ask:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_AI_SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendGemini(item.prompt)}
                      className="text-left px-3 py-1.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] text-xs text-[#d1d7db] hover:text-white transition-all cursor-pointer shadow-sm"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp Typing Bubble */}
            {isGeneratingAi && (
              <div className="flex items-start gap-2 animate-fade-in">
                <div className="bg-[#202c33] border border-[#2a3942] px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-md">
                  <div className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-[#8696a0] ml-2 font-mono">Gemini is drafting solution...</span>
                </div>
              </div>
            )}

            <div ref={geminiMessagesEndRef} />

            {/* Jump to bottom button */}
            {showScrollBottomAi && (
              <button
                onClick={() => geminiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="sticky bottom-2 right-2 ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00a884] text-slate-950 font-bold text-xs shadow-2xl hover:bg-[#02906f] transition-all cursor-pointer animate-bounce"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Jump to latest</span>
              </button>
            )}
          </div>
        ) : (
          /* ===================== PUBLIC SCHOLAR ROOM STREAM ===================== */
          <div
            ref={publicScrollContainerRef}
            onScroll={handlePublicScroll}
            className="space-y-3.5"
          >
            {filteredPublicMessages.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#8696a0]">
                <div className="w-12 h-12 rounded-2xl bg-[#202c33] border border-[#2a3942] flex items-center justify-center mb-3 text-[#00a884]">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#e9edef]">No Messages in Study Stream</h3>
                <p className="text-xs text-[#8696a0] max-w-sm mt-1">
                  Be the first scholar to post a doubt, study tip, or NCERT question!
                </p>
              </div>
            ) : (
              filteredPublicMessages.map((msg) => {
                const isMe = user?.uid === msg.userId;
                const istTime = getISTTimeString(new Date(msg.timestamp));
                const reactions = msg.reactions || {};
                const hasReactions = Object.keys(reactions).length > 0;
                const isPickerOpen = activeReactionPickerId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col group relative ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`relative flex items-center ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-1 max-w-[92%] sm:max-w-[80%]`}>
                      
                      {/* Action trigger on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 px-1">
                        <button
                          type="button"
                          onClick={() => setActiveReactionPickerId(isPickerOpen ? null : msg.id)}
                          className="reaction-trigger-btn p-1.5 rounded-full bg-[#202c33] hover:bg-[#374248] text-[#8696a0] hover:text-[#00a884] border border-[#2a3942] shadow-md transition-all cursor-pointer active:scale-95"
                          title="React with Emoji"
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>
                        
                        {isMe && (
                          <button
                            type="button"
                            onClick={() => handleDeletePublicMessage(msg.id)}
                            className="p-1.5 rounded-full bg-[#202c33] hover:bg-rose-500/20 text-[#8696a0] hover:text-rose-400 border border-[#2a3942] shadow-md transition-all cursor-pointer"
                            title="Delete message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Reaction Picker Popup */}
                      {isPickerOpen && (
                        <div className={`reaction-picker-container absolute -top-11 z-40 ${isMe ? 'right-0' : 'left-0'} flex items-center gap-1.5 p-1.5 rounded-full bg-[#202c33] border border-[#2a3942] shadow-2xl animate-fade-in`}>
                          {REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handlePublicReaction(msg.id, emoji)}
                              className="text-lg sm:text-xl p-1 rounded-full hover:bg-[#374248] hover:scale-125 transition-all cursor-pointer active:scale-95"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Speech Bubble */}
                      <div
                        className={`relative px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-md ${
                          isMe
                            ? 'bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-none'
                            : 'bg-[#202c33] text-[#e9edef] border border-[#2a3942]/60 rounded-2xl rounded-tl-none'
                        }`}
                      >
                        {/* Author Header */}
                        {!isMe && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[#53bdeb]">
                              {msg.userName}
                            </span>
                            {msg.subjectTag && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#111b21] text-[#8696a0] border border-[#2a3942]">
                                {msg.subjectTag}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Message content */}
                        <div className="text-sm leading-relaxed">
                          <MathText content={msg.message} />
                        </div>

                        {/* WhatsApp Time & Status */}
                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#8696a0] select-none font-mono">
                          <span>{istTime}</span>
                          {isMe && (
                            <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                          )}
                        </div>

                        {/* Attached WhatsApp Reaction Badges */}
                        {hasReactions && (
                          <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} flex items-center gap-1 z-10`}>
                            {Object.entries(reactions).map(([emoji, usersArr]) => {
                              const userReacted = user ? usersArr.includes(user.uid) : false;
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => handlePublicReaction(msg.id, emoji)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs shadow-md transition-all cursor-pointer active:scale-95 ${
                                    userReacted
                                      ? 'bg-[#00a884]/20 border-[#00a884]/40 text-[#25d366]'
                                      : 'bg-[#182229] border-[#222e35] text-[#8696a0] hover:bg-[#222e35]'
                                  }`}
                                  title={`${usersArr.length} scholars reacted`}
                                >
                                  <span>{emoji}</span>
                                  <span className="text-[10px] font-mono font-bold">{usersArr.length}</span>
                                </button>
                              );
                            })}
                          </div>
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
                className="sticky bottom-2 right-2 ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00a884] text-slate-950 font-bold text-xs shadow-2xl hover:bg-[#02906f] transition-all cursor-pointer animate-bounce"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Jump to latest</span>
              </button>
            )}
          </div>
        )}

      </main>

      {/* ===================== WHATSAPP BOTTOM CHAT INPUT BAR ===================== */}
      <footer className="p-2.5 sm:p-3 bg-[#202c33] border-t border-[#2a3942] shrink-0 sticky bottom-0 z-30 shadow-2xl pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))]">
        {activeTab === 'gemini' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendGemini();
            }}
            className="flex items-center gap-2 max-w-5xl mx-auto"
          >
            {/* Quick Emoji / Quick Reaction Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveReactionPickerId(activeReactionPickerId === 'input_ai' ? null : 'input_ai')}
                className="p-2.5 rounded-full hover:bg-[#374248] text-[#8696a0] hover:text-[#00a884] transition-colors cursor-pointer"
                title="Quick Emojis"
              >
                <Smile className="w-5 h-5" />
              </button>

              {activeReactionPickerId === 'input_ai' && (
                <div className="reaction-picker-container absolute bottom-12 left-0 z-50 p-2 rounded-2xl bg-[#202c33] border border-[#2a3942] shadow-2xl flex flex-wrap gap-1.5 w-60">
                  {['👍', '❤️', '🔥', '💡', '🧪', '📐', '⚡', '🌿', '🎯', '🙏', '🤯', '👏'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setGeminiInput(prev => prev + emoji);
                        setActiveReactionPickerId(null);
                      }}
                      className="text-xl p-1.5 rounded-xl hover:bg-[#374248] hover:scale-125 transition-all cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Box */}
            <input
              type="text"
              value={geminiInput}
              onChange={(e) => setGeminiInput(e.target.value)}
              placeholder={`Ask Gemini Tutor about ${selectedClass} ${selectedSubject}...`}
              disabled={isGeneratingAi}
              className="flex-1 bg-[#2a3942] border-none rounded-2xl px-4 py-3 text-sm text-[#e9edef] placeholder:text-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884] disabled:opacity-50"
            />

            {/* WhatsApp Send Button */}
            <button
              type="submit"
              disabled={!geminiInput.trim() || isGeneratingAi}
              className="p-3 rounded-full bg-[#00a884] hover:bg-[#02906f] text-slate-950 font-bold shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all cursor-pointer shrink-0"
              title="Send Message"
            >
              <Send className="w-5 h-5 text-slate-950" />
            </button>
          </form>
        ) : (
          <div className="max-w-5xl mx-auto">
            {publicError && (
              <div className="text-xs text-rose-400 px-3 pb-1.5 flex items-center justify-between">
                <span>{publicError}</span>
                <button onClick={() => setPublicError(null)} className="underline cursor-pointer">dismiss</button>
              </div>
            )}

            {user ? (
              <form onSubmit={handleSendPublic} className="flex items-center gap-2">
                {/* Input Field */}
                <input
                  type="text"
                  value={publicInput}
                  onChange={(e) => setPublicInput(e.target.value)}
                  placeholder={`Message scholars in Public Room...`}
                  maxLength={1000}
                  className="flex-1 bg-[#2a3942] border-none rounded-2xl px-4 py-3 text-sm text-[#e9edef] placeholder:text-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                />

                {/* WhatsApp Send Button */}
                <button
                  type="submit"
                  disabled={!publicInput.trim() || isSendingPublic}
                  className="p-3 rounded-full bg-[#00a884] hover:bg-[#02906f] text-slate-950 font-bold shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all cursor-pointer shrink-0"
                  title="Send Message"
                >
                  <Send className="w-5 h-5 text-slate-950" />
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#2a3942] border border-[#374248]">
                <div className="flex items-center gap-2 text-xs text-[#d1d7db] pl-2">
                  <GraduationCap className="w-4 h-4 text-[#00a884] shrink-0" />
                  <span>Sign in with Google to post questions and chat with fellow scholars.</span>
                </div>
                <button
                  onClick={onSignIn}
                  className="px-4 py-2 rounded-xl bg-[#00a884] text-slate-950 font-bold text-xs hover:bg-[#02906f] transition-colors shrink-0 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        )}
      </footer>

    </div>
  );
};
