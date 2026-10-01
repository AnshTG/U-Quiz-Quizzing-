import React, { useState, useEffect, useRef } from 'react';
import { 
  UserProfile, 
  ChatMessage, 
  ChatReplyQuote,
  GeminiChatMessage, 
  P2PConversation, 
  P2PParticipant 
} from '../types';
import { 
  sendPublicChatMessage, 
  listenToPublicChat, 
  deletePublicChatMessage, 
  togglePublicChatReaction,
  listenToP2PConversations,
  listenToAllP2PConversationsForAdmin,
  deleteP2PConversation,
  getRecentActiveScholars,
  searchScholars,
  getISTTimeString 
} from '../services/firebase';
import { sendGeminiStudyQuery } from '../services/geminiService';
import { validateChatMessageSecurity } from '../services/securityService';
import { 
  compressImageForChat, 
  CompressedImageResult, 
  formatFileSize, 
  downloadImage 
} from '../services/imageCompression';
import { MathText } from './MathText';
import { 
  Users, 
  Sparkles, 
  Send, 
  Trash2, 
  Copy, 
  Reply,
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
  Plus,
  Image as ImageIcon,
  Paperclip,
  Upload,
  X,
  Download,
  Maximize2,
  Minimize2,
  Loader2,
  AlertCircle,
  AtSign,
  MessageSquare,
  Search,
  ShieldCheck,
  Eye,
  Globe,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { P2PChatView } from './P2PChatView';

interface ChatViewProps {
  user: UserProfile | null;
  isAdmin?: boolean;
  onSignIn: () => void;
  initialTab?: 'gemini' | 'public' | 'p2p';
  onBackHome?: () => void;
  onOpenEditUsername?: () => void;
  initialPeerUser?: UserProfile | null;
}

const SUBJECT_OPTIONS = [
  'All Subjects',
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
  'All Classes (1-12)',
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
  { label: '⚡ Ohm\'s Law & Circuits', prompt: 'Explain Ohm\'s Law and how resistance depends on length, area, and resistivity with clear NCERT examples.' },
  { label: '🌿 Photosynthesis Cycle', prompt: 'Explain Light Reaction vs Calvin Cycle in photosynthesis with clear step-by-step NCERT points.' },
  { label: '📐 Trigonometric Identities', prompt: 'Prove the identity sin^2(θ) + cos^2(θ) = 1 and give a shortcut to remember standard angle values.' },
  { label: '🧪 Balancing Chemical Equations', prompt: 'Teach me the systematic step-by-step method to balance chemical equations with 2 examples from NCERT.' },
  { label: '🎯 High-Yield Exam Writing', prompt: 'What are the best strategies to structure 3-mark and 5-mark answers according to NCERT CBSE marking rubrics?' }
];

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '🙏', '🔥', '💡', '👏'];

export const ChatView: React.FC<ChatViewProps> = ({ 
  user, 
  isAdmin = false,
  onSignIn, 
  initialTab, 
  onBackHome,
  onOpenEditUsername,
  initialPeerUser: externalPeerUser
}) => {
  // Determine starting view: 'directory' (the box list of Public & P2P), 'public', or 'p2p'
  const [activeTab, setActiveTab] = useState<'directory' | 'public' | 'p2p'>(() => {
    if (externalPeerUser) return 'p2p';
    if (initialTab === 'public') return 'public';
    if (initialTab === 'p2p') return 'p2p';
    return 'directory';
  });

  const [selectedPeerForP2P, setSelectedPeerForP2P] = useState<UserProfile | null>(externalPeerUser || null);
  const [adminAllP2PMode, setAdminAllP2PMode] = useState<boolean>(false);
  const [p2pConversations, setP2PConversations] = useState<P2PConversation[]>([]);
  const [activeScholars, setActiveScholars] = useState<UserProfile[]>([]);
  
  // Search scholars for P2P start
  const [scholarSearchQuery, setScholarSearchQuery] = useState('');
  const [searchedScholars, setSearchedScholars] = useState<UserProfile[]>([]);
  const [isSearchingScholars, setIsSearchingScholars] = useState(false);

  // Floating Quiz AI state
  const [isQuizAiFloatingOpen, setIsQuizAiFloatingOpen] = useState(false);
  const [isQuizAiMinimized, setIsQuizAiMinimized] = useState(false);

  // ---------------- GEMINI AI CHAT STATE (FOR FLOATING QUIZ AI) ----------------
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
        subjectContext: 'All Subjects',
        classContext: 'All Classes (1-12)',
        reactions: { '💡': 1 },
        isTestable: false
      }
    ];
  });
  const [geminiInput, setGeminiInput] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes (1-12)');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const geminiMessagesEndRef = useRef<HTMLDivElement>(null);

  // ---------------- PUBLIC CHAT STATE ----------------
  const [publicMessages, setPublicMessages] = useState<ChatMessage[]>([]);
  const [isLoadingPublicChat, setIsLoadingPublicChat] = useState<boolean>(true);
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]);
  const [publicInput, setPublicInput] = useState('');
  const [publicTag, setPublicTag] = useState('General');
  const [isSendingPublic, setIsSendingPublic] = useState(false);
  const [publicError, setPublicError] = useState<string | null>(null);
  const [draftImage, setDraftImage] = useState<CompressedImageResult | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [publicReplyingTo, setPublicReplyingTo] = useState<ChatReplyQuote | null>(null);
  const [copiedPublicMsgId, setCopiedPublicMsgId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    name?: string;
    author?: string;
    time?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const publicMessagesEndRef = useRef<HTMLDivElement>(null);
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);

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
    setIsLoadingPublicChat(true);
    const unsub = listenToPublicChat((msgs) => {
      setPublicMessages(msgs);
      setIsLoadingPublicChat(false);
      const deliveredIds = new Set(msgs.map(m => m.id));
      setPendingMessages(prev => prev.filter(p => !deliveredIds.has(p.id)));
    }, 100);
    return () => unsub();
  }, []);

  // Subscribe to P2P Conversations list (personal or all platform if admin)
  useEffect(() => {
    if (!user?.uid) {
      setP2PConversations([]);
      return;
    }

    if (isAdmin && adminAllP2PMode) {
      const unsub = listenToAllP2PConversationsForAdmin((list) => {
        setP2PConversations(list);
      });
      return () => unsub();
    } else {
      const unsub = listenToP2PConversations(user.uid, (list) => {
        setP2PConversations(list);
      });
      return () => unsub();
    }
  }, [user?.uid, isAdmin, adminAllP2PMode]);

  // Fetch recent active scholars
  useEffect(() => {
    if (!user?.uid) return;
    getRecentActiveScholars(user.uid, 10).then((scholars) => {
      setActiveScholars(scholars);
    }).catch(console.warn);
  }, [user?.uid]);

  // Debounced search for scholars
  useEffect(() => {
    if (!scholarSearchQuery.trim() || !user?.uid) {
      setSearchedScholars([]);
      setIsSearchingScholars(false);
      return;
    }

    setIsSearchingScholars(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchScholars(scholarSearchQuery, user.uid);
        setSearchedScholars(res);
      } catch (err) {
        console.warn('Search scholars error:', err);
      } finally {
        setIsSearchingScholars(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [scholarSearchQuery, user?.uid]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (activeTab === 'public') {
      publicMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [publicMessages, activeTab]);

  useEffect(() => {
    if (isQuizAiFloatingOpen && !isQuizAiMinimized) {
      geminiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [geminiMessages, isGeneratingAi, isQuizAiFloatingOpen, isQuizAiMinimized]);

  // Start P2P with any author
  const handleStartP2PWithPeer = (peerUser: UserProfile | P2PParticipant) => {
    if (!user) {
      onSignIn();
      return;
    }
    setSelectedPeerForP2P({
      uid: peerUser.uid,
      displayName: peerUser.displayName || 'Scholar',
      username: (peerUser as any).username || 'scholar',
      photoURL: peerUser.photoURL || null,
      email: null
    });
    setActiveTab('p2p');
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

    setGeminiMessages(prev => [...prev, userMsg]);
    setGeminiInput('');
    setIsGeneratingAi(true);

    try {
      const response = await sendGeminiStudyQuery({
        messages: [
          ...geminiMessages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: text }
        ],
        classContext: selectedClass,
        subjectContext: selectedSubject
      });

      const aiMsg: GeminiChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        content: response.reply,
        timestamp: Date.now(),
        subjectContext: selectedSubject,
        classContext: selectedClass,
        reactions: { '💡': 1 },
        isTestable: response.isTestable
      };

      setGeminiMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: GeminiChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        content: `⚠️ **Unable to complete study analysis:** ${err.message || 'Network connectivity error'}. Please try asking again.`,
        timestamp: Date.now(),
        subjectContext: selectedSubject,
        classContext: selectedClass
      };
      setGeminiMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Image Selection Handler for Public Chat
  const handleSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      setPublicError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    try {
      setIsCompressingImage(true);
      setPublicError(null);
      const compressed = await compressImageForChat(file);
      setDraftImage(compressed);
    } catch (err: any) {
      console.error('Compression failed:', err);
      setPublicError(err.message || 'Image compression failed. Try another picture.');
    } finally {
      setIsCompressingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Send Public Chat message
  const handleSendPublic = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      onSignIn();
      return;
    }

    const text = publicInput.trim();
    if (!text && !draftImage) return;

    if (text) {
      const securityCheck = validateChatMessageSecurity(text, user);
      if (!securityCheck.isSafe) {
        setPublicError(securityCheck.error || 'Message does not conform to academic safety standards.');
        return;
      }
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const image = draftImage;
    const replySnapshot = publicReplyingTo;

    const optimisticMessage: ChatMessage = {
      id: messageId,
      userId: user.uid,
      userName: user.displayName || 'Scholar',
      userUsername: user.username || 'scholar',
      userPhoto: user.photoURL || undefined,
      message: text || (image ? `📷 [Image: ${image.name}]` : ''),
      timestamp: Date.now(),
      createdAt: getISTTimeString(),
      subjectTag: publicTag,
      imageUrl: image ? image.dataUrl : undefined,
      imageName: image ? image.name : undefined,
      isPending: true,
      replyTo: replySnapshot || undefined
    };

    setPendingMessages(prev => [...prev, optimisticMessage]);
    setPublicInput('');
    setDraftImage(null);
    setPublicReplyingTo(null);
    setPublicError(null);
    setIsSendingPublic(true);

    try {
      await sendPublicChatMessage(
        user,
        text,
        publicTag,
        image ? image.dataUrl : undefined,
        image ? image.name : undefined,
        messageId,
        replySnapshot || undefined
      );
    } catch (err: any) {
      console.error('Public chat send error:', err);
      setPendingMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, isPending: false, sendFailed: true } : m))
      );
      setPublicError(err.message || 'Failed to deliver message. Tap retry.');
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
    if (!window.confirm('Are you sure you want to delete this study message?')) return;
    try {
      setPublicMessages(prev => prev.filter(m => m.id !== msgId));
      await deletePublicChatMessage(msgId);
    } catch (err: any) {
      console.error('Delete message error:', err);
      alert('Failed to delete message.');
    }
  };

  const handleStartPublicReply = (msg: ChatMessage) => {
    setPublicReplyingTo({
      id: msg.id,
      senderName: msg.userName,
      message: msg.message || (msg.imageUrl ? '📷 [Image attachment]' : 'Message')
    });
  };

  const handleCopyPublicMessage = (id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedPublicMsgId(id);
    setTimeout(() => setCopiedPublicMsgId(null), 2000);
  };

  const handleDeleteConversation = async (convoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this direct chat conversation? Chat history will be permanently cleared.')) return;
    try {
      setP2PConversations(prev => prev.filter(c => c.id !== convoId));
      await deleteP2PConversation(convoId);
    } catch (err: any) {
      console.error('Failed to delete conversation:', err);
      alert('Failed to delete conversation.');
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleResetAiChat = () => {
    if (window.confirm('Start a fresh conversation with Quiz AI Mentor?')) {
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

  // Merge confirmed messages and any pending/failed messages not yet in publicMessages
  const confirmedIds = new Set(publicMessages.map(m => m.id));
  const unconfirmedPending = pendingMessages.filter(p => !confirmedIds.has(p.id));
  const filteredPublicMessages = [...publicMessages, ...unconfirmedPending];
  const lastPublicMsg = publicMessages[publicMessages.length - 1];

  return (
    <div className="w-full h-full flex flex-col bg-[#0b141a] text-[#e9edef] select-text relative overflow-hidden font-sans">
      
      {/* ===================== VIEW ROUTER ===================== */}

      {/* 1. DIRECTORY / BOX VIEW: LIST ALL P2P CHATS & PUBLIC CHAT AS A BOX */}
      {activeTab === 'directory' && (
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar">
          
          {/* Top Directory Bar */}
          <header className="h-16 px-4 sm:px-6 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between gap-3 shrink-0 sticky top-0 z-30 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
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
              <div className="flex flex-col min-w-0">
                <h2 className="font-bold text-base sm:text-lg text-white truncate flex items-center gap-2">
                  <span>NCERT Study Chats & Community</span>
                </h2>
                <p className="text-xs text-[#8696a0] truncate">
                  Public study room & 1-on-1 peer doubt resolution
                </p>
              </div>
            </div>

            {/* User Profile / Handle Badge */}
            <div className="flex items-center gap-2 shrink-0">
              {user ? (
                <div className="flex items-center gap-2 bg-[#111b21] px-3 py-1.5 rounded-xl border border-[#2a3942]">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Scholar'}
                      className="w-6 h-6 rounded-full object-cover border border-emerald-500/40"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                      {user.displayName ? user.displayName[0].toUpperCase() : 'S'}
                    </div>
                  )}
                  <span className="text-xs font-mono text-emerald-400 font-semibold hidden sm:inline">
                    @{user.username || 'scholar'}
                  </span>
                  {onOpenEditUsername && (
                    <button
                      onClick={onOpenEditUsername}
                      className="p-1 hover:text-emerald-300 text-slate-400 transition-colors"
                      title="Edit handle"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={onSignIn}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all cursor-pointer shadow-md"
                >
                  Sign In to Chat
                </button>
              )}
            </div>
          </header>

          {/* Directory Content Area */}
          <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6 pb-24">
            
            {/* ===================== BOX 1: PUBLIC CHAT BOX ===================== */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-teal-400" />
                  <span>Public Community Room</span>
                </h3>
                <span className="text-[11px] text-teal-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  Live Discussion
                </span>
              </div>

              <div
                onClick={() => setActiveTab('public')}
                className="group relative p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#182a24] to-[#12222a] border border-emerald-500/30 hover:border-emerald-400/60 transition-all cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                          Public Study Room
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          All Scholars
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Ask academic questions, share diagrams, and solve doubts collaboratively.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-[#00a884] text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md group-hover:bg-[#25d366] transition-colors self-start sm:self-center"
                  >
                    <span>Enter Public Room</span>
                    <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                </div>

                {/* Latest Public Message Snippet Box */}
                {lastPublicMsg ? (
                  <div className="p-3 rounded-xl bg-black/30 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-bold text-emerald-400 shrink-0">
                        {lastPublicMsg.userName}:
                      </span>
                      <span className="text-slate-300 truncate">
                        {lastPublicMsg.message || (lastPublicMsg.imageUrl ? '📷 [Image attachment]' : 'Active in room')}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {lastPublicMsg.createdAt || (lastPublicMsg.timestamp ? new Date(lastPublicMsg.timestamp).toLocaleTimeString() : '')}
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-black/20 text-xs text-slate-400 font-mono">
                    Join the conversation and post the first question of the session!
                  </div>
                )}
              </div>
            </section>

            {/* ===================== BOX 2: DIRECT (P2P) CHATS SECTION ===================== */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Direct Scholar Chats (P2P)</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-emerald-400">
                      {p2pConversations.length}
                    </span>
                  </h3>
                </div>

                {/* Admin Mode Toggle */}
                {isAdmin && (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => setAdminAllP2PMode(!adminAllP2PMode)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        adminAllP2PMode
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                          : 'bg-slate-900 text-amber-300 border-amber-500/30 hover:bg-slate-800'
                      }`}
                      title="Admin Privilege: Access and monitor all P2P conversations across the entire platform"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{adminAllP2PMode ? 'Admin: All Platform Chats' : 'My Personal Chats'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Scholar Search Input */}
              <div className="relative">
                <div className="p-3 bg-[#111b21] border border-[#2a3942] rounded-2xl flex items-center gap-3">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={scholarSearchQuery}
                    onChange={(e) => setScholarSearchQuery(e.target.value)}
                    placeholder="Search scholars by @username or name to start a new direct chat..."
                    className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none flex-1 font-sans"
                  />
                  {scholarSearchQuery && (
                    <button
                      onClick={() => setScholarSearchQuery('')}
                      className="p-1 hover:bg-[#202c33] rounded-md text-slate-400 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown/Flyout */}
                {scholarSearchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-[#1e293b] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1">
                    {isSearchingScholars ? (
                      <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>Searching academic scholars...</span>
                      </div>
                    ) : searchedScholars.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No scholars found matching "{scholarSearchQuery}".
                      </div>
                    ) : (
                      searchedScholars.map((scholar) => (
                        <div
                          key={scholar.uid}
                          onClick={() => {
                            handleStartP2PWithPeer(scholar);
                            setScholarSearchQuery('');
                          }}
                          className="p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {scholar.photoURL ? (
                              <img
                                src={scholar.photoURL}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover border border-emerald-500/40"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                                {scholar.displayName ? scholar.displayName[0].toUpperCase() : 'S'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-white truncate block">
                                {scholar.displayName}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-mono">
                                @{scholar.username || 'scholar'}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px]"
                          >
                            Chat
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Active Scholars Avatars Bar */}
              {activeScholars.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-semibold">Active Study Scholars:</span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {activeScholars.map((scholar) => (
                      <button
                        key={scholar.uid}
                        onClick={() => handleStartP2PWithPeer(scholar)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111b21] hover:bg-[#202c33] border border-[#2a3942] hover:border-emerald-500/40 text-left transition-all shrink-0 cursor-pointer"
                        title={`Message @${scholar.username || 'scholar'}`}
                      >
                        <div className="relative shrink-0">
                          {scholar.photoURL ? (
                            <img src={scholar.photoURL} alt="" className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                              {scholar.displayName ? scholar.displayName[0].toUpperCase() : 'S'}
                            </div>
                          )}
                          <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 border border-[#111b21]" />
                        </div>
                        <span className="text-xs font-semibold text-white max-w-[100px] truncate">
                          {scholar.displayName || scholar.username}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* List of P2P Chats as Boxes / Cards */}
              {p2pConversations.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#111b21] border border-[#2a3942] text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Direct Chats Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Search for a scholar above or tap any of the active scholars to start your first 1-on-1 private study conversation!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {p2pConversations.map((conv) => {
                    const participantList = Object.values(conv.participants || {});
                    const peer = user
                      ? (participantList.find(p => p.uid !== user.uid) || participantList[0])
                      : participantList[0];
                    const p1 = participantList[0];
                    const p2 = participantList[1];
                    const unread = user && conv.unreadCounts ? conv.unreadCounts[user.uid] || 0 : 0;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          if (peer) {
                            handleStartP2PWithPeer(peer);
                          } else {
                            setActiveTab('p2p');
                          }
                        }}
                        className="group p-4 rounded-2xl bg-[#111b21] border border-[#2a3942] hover:border-emerald-500/50 hover:bg-[#162229] transition-all cursor-pointer flex items-center justify-between gap-3 shadow-md hover:shadow-lg"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            {adminAllP2PMode && p1 && p2 ? (
                              <div className="flex -space-x-2">
                                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs border border-[#111b21]">
                                  {p1.displayName?.charAt(0) || '1'}
                                </div>
                                <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs border border-[#111b21]">
                                  {p2.displayName?.charAt(0) || '2'}
                                </div>
                              </div>
                            ) : peer?.photoURL ? (
                              <img
                                src={peer.photoURL}
                                alt={peer.displayName || 'Scholar'}
                                className="w-11 h-11 rounded-full object-cover border border-[#2a3942]"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
                                {peer?.displayName ? peer.displayName[0].toUpperCase() : 'S'}
                              </div>
                            )}
                            <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#111b21] absolute bottom-0 right-0" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {adminAllP2PMode && p1 && p2 ? (
                                <span className="text-xs font-bold text-white truncate">
                                  {p1.displayName} ↔ {p2.displayName}
                                </span>
                              ) : (
                                <>
                                  <span className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                                    {peer?.displayName || 'Scholar'}
                                  </span>
                                  <span className="text-[10px] text-emerald-400 font-mono">
                                    @{peer?.username || 'user'}
                                  </span>
                                </>
                              )}
                            </div>

                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {conv.lastMessage || 'Direct study message'}
                            </p>

                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 font-mono">
                              <Clock className="w-3 h-3" />
                              <span>
                                {conv.lastMessageTimestamp
                                  ? new Date(conv.lastMessageTimestamp).toLocaleTimeString()
                                  : conv.updatedAt || 'Recent'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Unread badge, delete conversation & chevron */}
                        <div className="flex items-center gap-2 shrink-0">
                          {unread > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] font-mono shadow">
                              {unread} new
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                            className="p-1.5 rounded-lg opacity-60 sm:opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                            title="Delete conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ArrowDown className="w-4 h-4 text-slate-500 group-hover:text-white -rotate-90 transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </main>
        </div>
      )}

      {/* 2. PUBLIC STUDY ROOM VIEW */}
      {activeTab === 'public' && (
        <div className="flex-1 min-h-0 flex flex-col bg-[#0b141a]">
          {/* Header */}
          <header className="h-16 px-4 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between gap-3 shrink-0 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setActiveTab('directory')}
                className="p-1.5 rounded-lg bg-[#111b21] hover:bg-[#374248] text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Back to All Chats"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Chats</span>
              </button>

              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-sm sm:text-base text-white truncate">
                      Public Study Room
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <span className="text-[11px] text-slate-400 truncate">
                    Live peer academic questions & discussion
                  </span>
                </div>
              </div>
            </div>

            {/* Subject Filter Tag Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={publicTag}
                onChange={(e) => setPublicTag(e.target.value)}
                className="bg-[#111b21] text-xs font-semibold text-emerald-400 border border-[#2a3942] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub} className="bg-[#202c33] text-white">
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </header>

          {/* Messages Stream */}
          <main className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {isLoadingPublicChat ? (
              <div className="h-full flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-spin">
                  <Loader2 className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-bold text-white">Loading Study Room Messages...</h4>
                  <p className="text-xs text-slate-400 font-mono">Fetching latest academic doubts and rationales</p>
                </div>
                {/* Skeleton bubbles */}
                <div className="w-full max-w-md space-y-3 pt-4 px-4 opacity-50">
                  <div className="h-14 bg-[#202c33] rounded-2xl rounded-tl-none animate-pulse w-3/4" />
                  <div className="h-16 bg-[#005c4b]/50 rounded-2xl rounded-tr-none animate-pulse w-2/3 ml-auto" />
                  <div className="h-12 bg-[#202c33] rounded-2xl rounded-tl-none animate-pulse w-1/2" />
                </div>
              </div>
            ) : filteredPublicMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#182229] border border-[#2a3942] flex items-center justify-center text-emerald-400 mx-auto">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-white">No Messages in {publicTag} Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Be the first scholar to ask an NCERT question, post a formula doubt, or share study tips!
                </p>
              </div>
            ) : (
              filteredPublicMessages.map((msg) => {
                const isMine = user && msg.userId === user.uid;
                const reactions = msg.reactions || {};

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1 group`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl shadow-md space-y-1.5 ${
                        isMine
                          ? 'bg-[#005c4b] text-white rounded-tr-none'
                          : 'bg-[#202c33] text-[#e9edef] rounded-tl-none border border-[#2a3942]'
                      }`}
                    >
                      {/* Author & Tag */}
                      <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <button
                            type="button"
                            onClick={() => {
                              if (!isMine) {
                                handleStartP2PWithPeer({
                                  uid: msg.userId,
                                  displayName: msg.userName,
                                  username: msg.userUsername || 'scholar',
                                  photoURL: msg.userPhoto || null,
                                  email: null
                                });
                              }
                            }}
                            className={`text-xs font-bold truncate hover:underline cursor-pointer ${
                              isMine ? 'text-emerald-200' : 'text-emerald-400'
                            }`}
                            title={isMine ? 'You' : `Message @${msg.userUsername || 'scholar'}`}
                          >
                            {msg.userName}
                          </button>
                          {msg.userUsername && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              @{msg.userUsername}
                            </span>
                          )}
                        </div>

                        <span className="px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono text-slate-300">
                          {msg.subjectTag || 'General'}
                        </span>
                      </div>

                      {/* Replying To Quote Block */}
                      {msg.replyTo && (
                        <div className="p-2 rounded-xl bg-black/30 border-l-4 border-emerald-400 text-xs space-y-0.5 select-text">
                          <span className="font-bold text-emerald-400 text-[11px] block">
                            {msg.replyTo.senderName}
                          </span>
                          <p className="text-slate-300 text-[11px] line-clamp-2 italic">
                            "{msg.replyTo.message}"
                          </p>
                        </div>
                      )}

                      {/* Content */}
                      <div className="text-xs sm:text-sm select-text break-words">
                        <MathText content={msg.message} />
                      </div>

                      {/* Image Attachment */}
                      {msg.imageUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden max-w-sm border border-black/20">
                          <img
                            src={msg.imageUrl}
                            alt="Attachment"
                            className="w-full max-h-56 object-cover cursor-pointer hover:opacity-90"
                            onClick={() => setLightboxImage({ url: msg.imageUrl!, name: msg.imageName, author: msg.userName, time: msg.createdAt })}
                          />
                        </div>
                      )}

                      {/* Meta timestamp & delivery */}
                      <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400 font-mono pt-1">
                        <span>{msg.createdAt || (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '')}</span>
                        {isMine && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>

                      {/* Reactions */}
                      {Object.keys(reactions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-black/10">
                          {Object.entries(reactions).map(([emoji, uids]) => (
                            <button
                              key={emoji}
                              onClick={() => handlePublicReaction(msg.id, emoji)}
                              className={`px-1.5 py-0.5 rounded-full text-[11px] font-mono flex items-center gap-0.5 cursor-pointer ${
                                user && uids.includes(user.uid)
                                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-black/20 text-slate-300'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span>{uids.length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions bar on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleStartPublicReply(msg)}
                        className="p-1 rounded hover:bg-[#202c33] hover:text-emerald-400 cursor-pointer"
                        title="Reply to message"
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyPublicMessage(msg.id, msg.message || msg.imageUrl || '')}
                        className="p-1 rounded hover:bg-[#202c33] hover:text-white cursor-pointer"
                        title="Copy message"
                      >
                        {copiedPublicMsgId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveReactionPickerId(activeReactionPickerId === msg.id ? null : msg.id)}
                        className="reaction-trigger-btn p-1 rounded hover:bg-[#202c33] hover:text-white cursor-pointer"
                        title="Add reaction"
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>
                      {(isMine || isAdmin) && (
                        <button
                          type="button"
                          onClick={() => handleDeletePublicMessage(msg.id)}
                          className="p-1 rounded hover:bg-rose-500/20 hover:text-rose-400 cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Reaction Picker Flyout */}
                    {activeReactionPickerId === msg.id && (
                      <div className="reaction-picker-container flex items-center gap-1 p-1 bg-[#1e293b] border border-slate-700 rounded-full shadow-xl z-20">
                        {REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handlePublicReaction(msg.id, emoji)}
                            className="p-1.5 hover:scale-125 transition-transform text-sm"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={publicMessagesEndRef} />
          </main>

          {/* Public Chat Bottom Bar */}
          <footer className="p-3 bg-[#202c33] border-t border-[#2a3942] shrink-0">
            {/* Active Replying To Banner */}
            {publicReplyingTo && (
              <div className="p-2 mb-2 bg-[#182229] rounded-xl border-l-4 border-emerald-400 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Reply className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-emerald-400 block truncate">
                      Replying to {publicReplyingTo.senderName}
                    </span>
                    <span className="text-[11px] text-slate-300 truncate block">
                      {publicReplyingTo.message}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPublicReplyingTo(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#202c33] cursor-pointer"
                  title="Cancel reply"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {draftImage && (
              <div className="p-2 mb-2 bg-[#111b21] rounded-xl border border-emerald-500/30 flex items-center justify-between gap-2 max-w-sm">
                <span className="text-xs text-emerald-400 truncate">📷 {draftImage.name} ({formatFileSize(draftImage.sizeKb)})</span>
                <button onClick={() => setDraftImage(null)} className="p-1 text-slate-400 hover:text-rose-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {publicError && (
              <div className="text-xs text-rose-400 mb-2 font-mono flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{publicError}</span>
              </div>
            )}

            <form onSubmit={handleSendPublic} className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleSelectImage}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressingImage}
                className="p-2.5 rounded-xl bg-[#111b21] hover:bg-[#374248] text-slate-400 hover:text-emerald-400 border border-[#2a3942] transition-colors cursor-pointer"
                title="Attach study photo / question diagram"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={publicInput}
                onChange={(e) => setPublicInput(e.target.value)}
                placeholder="Ask an academic question or share a doubt in Public Study Room..."
                className="flex-1 px-4 py-2.5 bg-[#111b21] border border-[#2a3942] rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
              />

              <button
                type="submit"
                disabled={(!publicInput.trim() && !draftImage) || isSendingPublic}
                className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all cursor-pointer disabled:opacity-40"
              >
                {isSendingPublic ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </footer>
        </div>
      )}

      {/* 3. 1-ON-1 P2P DIRECT CHAT VIEW */}
      {activeTab === 'p2p' && (
        <div className="flex-1 min-h-0 flex flex-col bg-[#0b141a]">
          <P2PChatView
            currentUser={user}
            isAdmin={isAdmin}
            onSignIn={onSignIn}
            onOpenEditUsername={onOpenEditUsername}
            initialPeerUser={selectedPeerForP2P}
            onBackToDirectory={() => setActiveTab('directory')}
          />
        </div>
      )}

      {/* ===================== FLOATING QUIZ AI BOX (BOTTOM RIGHT) ===================== */}
      {/* As requested: "Remove the quiz ai button from other chats, keep it only on the main screen, it overlaps send button in other chats." */}
      {activeTab === 'directory' && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
        
        {/* Expanded Floating Box Window */}
        {isQuizAiFloatingOpen && !isQuizAiMinimized && (
          <div className="w-[370px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[78vh] rounded-2xl bg-[#111b21] border border-[#00a884]/60 shadow-2xl shadow-emerald-500/20 flex flex-col overflow-hidden mb-3 animate-in slide-in-from-bottom-5 duration-200">
            
            {/* Floating Box Header */}
            <div className="p-3 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00a884] to-[#25d366] flex items-center justify-center text-slate-950 font-black shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-slate-950" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                    <span>Quiz AI Study Mentor</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono truncate block">
                    24/7 NCERT Doubt Solver
                  </span>
                </div>
              </div>

              {/* Class & Subject Selectors */}
              <div className="flex items-center gap-1 shrink-0">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-[#111b21] text-[11px] font-semibold text-emerald-300 border border-[#2a3942] rounded-lg px-2 py-1 focus:outline-none cursor-pointer max-w-[90px] truncate"
                >
                  {SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub} value={sub} className="bg-[#202c33] text-white">
                      {sub}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleResetAiChat}
                  className="p-1 rounded-lg hover:bg-[#374248] text-slate-400 hover:text-white transition-colors"
                  title="Clear chat"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsQuizAiMinimized(true)}
                  className="p-1 rounded-lg hover:bg-[#374248] text-slate-400 hover:text-white transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsQuizAiFloatingOpen(false)}
                  className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Close Quiz AI"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="p-2 bg-[#182229] border-b border-[#2a3942] flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
              {QUICK_AI_SUGGESTIONS.map((sug) => (
                <button
                  key={sug.label}
                  type="button"
                  onClick={() => handleSendGemini(sug.prompt)}
                  disabled={isGeneratingAi}
                  className="px-2 py-0.5 rounded-lg bg-[#202c33] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 text-[10px] font-medium border border-[#2a3942] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  {sug.label}
                </button>
              ))}
            </div>

            {/* Message Stream */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3 custom-scrollbar bg-[#0b141a]">
              {geminiMessages.map((msg) => {
                const isAi = msg.role === 'model';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} space-y-1`}
                  >
                    <div
                      className={`max-w-[90%] p-3 rounded-2xl text-xs select-text shadow ${
                        isAi
                          ? 'bg-[#202c33] text-[#e9edef] rounded-tl-none border border-[#2a3942]'
                          : 'bg-[#005c4b] text-white rounded-tr-none'
                      }`}
                    >
                      <MathText content={msg.content} />

                      {isAi && (
                        <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-black/10 text-[10px] text-slate-400">
                          <span className="font-mono">NCERT Syllabus</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.id, msg.content)}
                            className="flex items-center gap-1 text-emerald-400 hover:underline cursor-pointer"
                          >
                            {copiedMessageId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Answer</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {isGeneratingAi && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#202c33] text-emerald-400 text-xs w-fit border border-[#2a3942] animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Quiz AI is synthesizing NCERT rationale...</span>
                </div>
              )}
              <div ref={geminiMessagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendGemini();
              }}
              className="p-2.5 bg-[#202c33] border-t border-[#2a3942] flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={geminiInput}
                onChange={(e) => setGeminiInput(e.target.value)}
                placeholder="Ask Quiz AI any doubt, formula, or concept..."
                disabled={isGeneratingAi}
                className="flex-1 px-3 py-2 bg-[#111b21] border border-[#2a3942] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/60"
              />
              <button
                type="submit"
                disabled={!geminiInput.trim() || isGeneratingAi}
                className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all cursor-pointer disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        )}

        {/* Floating Toggle Button (Always accessible on right bottom) */}
        {(!isQuizAiFloatingOpen || isQuizAiMinimized) && (
          <button
            type="button"
            onClick={() => {
              setIsQuizAiFloatingOpen(true);
              setIsQuizAiMinimized(false);
            }}
            className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#111b21] hover:bg-[#182229] border-2 border-emerald-500 text-white shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Open Quiz AI Doubt Solver"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00a884] to-[#25d366] flex items-center justify-center text-slate-950 shadow">
                <Bot className="w-4 h-4 text-slate-950" />
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#111b21] absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                Quiz AI
              </span>
              <span className="text-[10px] text-emerald-400 font-mono -mt-0.5">
                Doubt Solver
              </span>
            </div>

            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-bounce ml-0.5" />
          </button>
        )}

        </div>
      )}

      {/* Lightbox Modal for Full Image View */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage.url}
              alt=""
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-slate-700"
            />
            <div className="mt-3 flex items-center justify-between w-full text-xs text-slate-300 px-2">
              <span>{lightboxImage.author ? `Shared by ${lightboxImage.author}` : ''}</span>
              <button
                onClick={() => setLightboxImage(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
