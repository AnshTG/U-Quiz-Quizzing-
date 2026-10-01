import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  Send, 
  Paperclip, 
  X, 
  ArrowLeft, 
  AtSign, 
  Smile, 
  Trash2, 
  Check, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  Loader2, 
  MessageSquare, 
  Flame, 
  Sparkles, 
  UserPlus,
  Edit3,
  Copy,
  Reply
} from 'lucide-react';
import { UserProfile, P2PConversation, P2PMessage, P2PParticipant, ChatReplyQuote } from '../types';
import { 
  listenToP2PConversations, 
  listenToAllP2PConversationsForAdmin,
  listenToP2PMessages, 
  ensureP2PConversation, 
  sendP2PMessage, 
  markP2PConversationAsRead, 
  deleteP2PMessage, 
  deleteP2PConversation,
  toggleP2PMessageReaction, 
  searchScholars, 
  getRecentActiveScholars,
  sanitizeUsernameCandidate
} from '../services/firebase';
import { compressImageForChat, CompressedImageResult, formatFileSize } from '../services/imageCompression';
import { MathText } from './MathText';

interface P2PChatViewProps {
  currentUser: UserProfile | null;
  isAdmin?: boolean;
  onSignIn: () => void;
  onOpenEditUsername?: () => void;
  initialPeerUser?: UserProfile | null;
  initialConversationId?: string | null;
  onBackToDirectory?: () => void;
}

const EMOJI_REACTIONS = ['👍', '❤️', '💡', '🔥', '👏', '🎯'];

export const P2PChatView: React.FC<P2PChatViewProps> = ({
  currentUser,
  isAdmin = false,
  onSignIn,
  onOpenEditUsername,
  initialPeerUser,
  initialConversationId,
  onBackToDirectory
}) => {
  const [conversations, setConversations] = useState<P2PConversation[]>([]);
  const [adminAllMode, setAdminAllMode] = useState<boolean>(false);
  const [activeConversation, setActiveConversation] = useState<P2PConversation | null>(null);
  const [activePeer, setActivePeer] = useState<P2PParticipant | null>(null);
  const [messages, setMessages] = useState<P2PMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState<P2PMessage[]>([]);
  
  // Search & Active Scholars
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeScholars, setActiveScholars] = useState<UserProfile[]>([]);
  
  // Chat input
  const [inputMessage, setInputMessage] = useState('');
  const [draftImage, setDraftImage] = useState<CompressedImageResult | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // UI helpers
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingMessages]);

  // Close reaction picker on outside click
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.reaction-picker-box') && !target.closest('.reaction-trigger-btn')) {
        setActiveReactionPickerId(null);
      }
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  // Fetch recent active scholars
  useEffect(() => {
    if (!currentUser?.uid) return;
    getRecentActiveScholars(currentUser.uid, 12).then((scholars) => {
      setActiveScholars(scholars);
    }).catch(console.warn);
  }, [currentUser?.uid]);

  // Handle initial peer or initial conversation if provided
  useEffect(() => {
    if (initialPeerUser && currentUser && initialPeerUser.uid !== currentUser.uid) {
      handleSelectPeer(initialPeerUser);
    }
  }, [initialPeerUser, currentUser]);

  useEffect(() => {
    if (initialConversationId && conversations.length > 0 && !activeConversation) {
      const target = conversations.find(c => c.id === initialConversationId);
      if (target) {
        handleOpenConversation(target);
      }
    }
  }, [initialConversationId, conversations, activeConversation]);

  // Subscribe to real-time conversations list (or all platform chats if adminAllMode is active)
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = (isAdmin && adminAllMode)
      ? listenToAllP2PConversationsForAdmin((list) => {
          setConversations(list);
          if (activeConversation) {
            const found = list.find(c => c.id === activeConversation.id);
            if (found) setActiveConversation(found);
          }
        })
      : listenToP2PConversations(currentUser.uid, (list) => {
          setConversations(list);
          if (activeConversation) {
            const found = list.find(c => c.id === activeConversation.id);
            if (found) setActiveConversation(found);
          }
        });
    return () => unsub();
  }, [currentUser?.uid, activeConversation?.id, isAdmin, adminAllMode]);

  // Subscribe to messages in the active conversation
  useEffect(() => {
    if (!activeConversation || !currentUser?.uid) {
      setMessages([]);
      return;
    }

    // Mark as read
    markP2PConversationAsRead(activeConversation.id, currentUser.uid).catch(console.warn);

    const unsub = listenToP2PMessages(activeConversation.id, (msgs) => {
      setMessages(msgs);
      const deliveredIds = new Set(msgs.map(m => m.id));
      setPendingMessages(prev => prev.filter(p => !deliveredIds.has(p.id)));
    }, 100);

    return () => unsub();
  }, [activeConversation?.id, currentUser?.uid]);

  // Debounced search for scholars
  useEffect(() => {
    if (!searchQuery.trim() || !currentUser?.uid) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchScholars(searchQuery, currentUser.uid);
        setSearchResults(res);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUser?.uid]);

  // Select a scholar to start or open a chat
  const handleSelectPeer = async (peer: UserProfile | P2PParticipant) => {
    if (!currentUser) {
      onSignIn();
      return;
    }
    if (peer.uid === currentUser.uid) return;

    try {
      const peerParticipant: P2PParticipant = {
        uid: peer.uid,
        displayName: peer.displayName || 'Scholar',
        username: (peer as any).username || 'scholar',
        photoURL: peer.photoURL || null
      };

      const convo = await ensureP2PConversation(currentUser, peerParticipant);
      setActiveConversation(convo);
      setActivePeer(peerParticipant);
      setMobileView('chat');
      setSearchQuery('');
      setSearchResults([]);
    } catch (err: any) {
      console.error('Failed to open P2P conversation:', err);
      setChatError(err.message || 'Could not open conversation.');
    }
  };

  // Open existing conversation
  const handleOpenConversation = (convo: P2PConversation) => {
    if (!currentUser?.uid) return;
    const peerId = convo.participantIds.find(id => id !== currentUser.uid);
    const peerInfo = peerId && convo.participants ? convo.participants[peerId] : null;
    setActiveConversation(convo);
    setActivePeer(peerInfo || null);
    setMobileView('chat');
  };

  // Process image file
  const processImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setChatError('Please select a valid image (PNG, JPG, WEBP).');
      return;
    }
    try {
      setIsCompressingImage(true);
      setChatError(null);
      const res = await compressImageForChat(file);
      setDraftImage(res);
    } catch (err: any) {
      setChatError(err.message || 'Failed to compress image.');
    } finally {
      setIsCompressingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImage(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      onSignIn();
      return;
    }
    if (!activeConversation || !activePeer) return;

    const text = inputMessage.trim();
    const image = draftImage;
    if (!text && !image) return;
    if (isSending) return;

    const messageId = `p2p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Optimistic message
    const pendingMsg: P2PMessage = {
      id: messageId,
      conversationId: activeConversation.id,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'Scholar',
      senderUsername: currentUser.username || undefined,
      senderPhoto: currentUser.photoURL || null,
      recipientId: activePeer.uid,
      message: text,
      imageUrl: image?.dataUrl,
      imageName: image?.name,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      read: false,
      isPending: true
    };

    setPendingMessages(prev => [...prev, pendingMsg]);
    setInputMessage('');
    setDraftImage(null);
    setChatError(null);

    try {
      setIsSending(true);
      await sendP2PMessage({
        conversationId: activeConversation.id,
        currentUser,
        peerUser: activePeer,
        messageText: text,
        imageUrl: image?.dataUrl,
        imageName: image?.name,
        customMessageId: messageId
      });
    } catch (err: any) {
      console.error('Send error:', err);
      setPendingMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, isPending: false, sendFailed: true } : m))
      );
      setChatError(err.message || 'Failed to deliver message.');
    } finally {
      setIsSending(false);
    }
  };

  // Format relative timestamp
  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Prompt sign-in if not signed in
  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0b141a]">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Scholar P2P Direct Chat
        </h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Connect 1-on-1 with fellow NCERT & CBSE scholars, discuss tough questions, share formula notes, and study together in real-time.
        </p>
        <button
          onClick={onSignIn}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          Sign In to Access P2P Chat
        </button>
      </div>
    );
  }

  const allVisibleMessages = [...messages, ...pendingMessages];

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0b141a] text-[#e9edef]">
      
      {/* ===================== LEFT SIDEBAR: SCHOLARS & CONVERSATIONS ===================== */}
      <aside 
        className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-[#2a3942] bg-[#111b21] shrink-0 transition-all ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* User Identity Banner with Customizable Handle */}
        <div className="p-3 border-b border-[#2a3942] bg-[#202c33]/70 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {onBackToDirectory && (
              <button
                type="button"
                onClick={onBackToDirectory}
                className="p-1.5 rounded-lg bg-[#2a3942] hover:bg-[#374248] text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Back to All Chats"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Me'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-emerald-500/40 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30 shrink-0">
                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'S'}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">
                {currentUser.displayName || 'Scholar'}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold truncate flex items-center gap-0.5">
                <AtSign className="w-2.5 h-2.5 shrink-0" />
                {currentUser.username || 'scholar'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isAdmin && (
              <button
                onClick={() => setAdminAllMode(!adminAllMode)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  adminAllMode
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-[#2a3942] text-amber-300 hover:bg-[#374248]'
                }`}
                title="Toggle Admin All Platform Chats View"
              >
                {adminAllMode ? 'All Chats (Admin)' : 'Admin Mode'}
              </button>
            )}

            {onOpenEditUsername && (
              <button
                onClick={onOpenEditUsername}
                className="p-1.5 rounded-lg bg-[#2a3942] hover:bg-[#374248] text-slate-300 hover:text-emerald-400 text-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                title="Change your unique @handle"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scholar Search Bar */}
        <div className="p-3 border-b border-[#2a3942] bg-[#111b21]">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholar by @handle or name..."
              className="w-full pl-9 pr-8 py-2 bg-[#202c33] border border-[#2a3942] rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-emerald-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Scholars Carousel (Quick connect) */}
        {!searchQuery && activeScholars.length > 0 && (
          <div className="p-2.5 border-b border-[#2a3942] bg-[#111b21]/80">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-1 mb-2 block">
              Active Scholars Online
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {activeScholars.map((scholar) => (
                <button
                  key={scholar.uid}
                  onClick={() => handleSelectPeer(scholar)}
                  className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-[#202c33] transition-colors cursor-pointer shrink-0 w-16 text-center group"
                >
                  <div className="relative">
                    {scholar.photoURL ? (
                      <img
                        src={scholar.photoURL}
                        alt={scholar.displayName || 'Scholar'}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-[#2a3942] group-hover:border-emerald-400 transition-colors"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#202c33] border border-[#2a3942] group-hover:border-emerald-400 text-emerald-400 font-bold flex items-center justify-center text-xs">
                        {scholar.displayName ? scholar.displayName[0].toUpperCase() : 'S'}
                      </div>
                    )}
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#111b21] absolute bottom-0 right-0" />
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium truncate w-full group-hover:text-emerald-400">
                    {scholar.displayName?.split(' ')[0] || 'Scholar'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Dropdown/Overlay */}
        {searchQuery && (
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 px-2 py-1 block">
              {isSearching ? 'Searching scholars...' : `Found ${searchResults.length} scholar(s)`}
            </span>
            {isSearching ? (
              <div className="flex items-center justify-center py-8 text-slate-400 gap-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Searching directory...</span>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((scholar) => (
                <button
                  key={scholar.uid}
                  onClick={() => handleSelectPeer(scholar)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#202c33] transition-colors text-left cursor-pointer border border-transparent hover:border-[#2a3942]"
                >
                  {scholar.photoURL ? (
                    <img
                      src={scholar.photoURL}
                      alt={scholar.displayName || 'Scholar'}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-[#2a3942]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
                      {scholar.displayName ? scholar.displayName[0].toUpperCase() : 'S'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        {scholar.displayName || 'Scholar'}
                      </span>
                      {scholar.currentStreak && scholar.currentStreak > 0 && (
                        <span className="text-[10px] font-mono text-orange-400 font-bold">
                          🔥 {scholar.currentStreak}d
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 truncate block">
                      @{scholar.username || sanitizeUsernameCandidate(scholar.displayName || 'scholar')}
                    </span>
                  </div>
                  <UserPlus className="w-4 h-4 text-emerald-400 shrink-0" />
                </button>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No scholars found matching "{searchQuery}".
              </div>
            )}
          </div>
        )}

        {/* Conversation List */}
        {!searchQuery && (
          <div className="flex-1 overflow-y-auto divide-y divide-[#2a3942]/50">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#202c33] flex items-center justify-center mx-auto text-slate-400">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-300">No Direct Messages Yet</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Start a study conversation by searching for a scholar above or selecting one from active scholars!
                </p>
              </div>
            ) : (
              conversations.map((convo) => {
                const peerId = convo.participantIds.find(id => id !== currentUser.uid);
                const peer = peerId && convo.participants ? convo.participants[peerId] : null;
                const isSelected = activeConversation?.id === convo.id;
                const unread = (convo.unreadCounts && convo.unreadCounts[currentUser.uid]) || 0;

                return (
                  <button
                    key={convo.id}
                    onClick={() => handleOpenConversation(convo)}
                    className={`w-full flex items-center gap-3 p-3 transition-colors text-left cursor-pointer ${
                      isSelected ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]/70'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {peer?.photoURL ? (
                        <img
                          src={peer.photoURL}
                          alt={peer.displayName || 'Scholar'}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border border-[#2a3942]"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
                          {peer?.displayName ? peer.displayName[0].toUpperCase() : 'S'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-white truncate">
                          {peer?.displayName || 'Scholar'}
                        </span>
                        {convo.lastMessageTimestamp && (
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {formatTime(convo.lastMessageTimestamp)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[11px] text-slate-400 truncate">
                          {convo.lastMessage || 'Direct chat'}
                        </p>
                        {unread > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] shrink-0 font-mono">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </aside>

      {/* ===================== RIGHT PANE: ACTIVE 1-ON-1 CONVERSATION ===================== */}
      <main 
        className={`flex-1 flex flex-col bg-[#0b141a] min-w-0 transition-all ${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConversation && activePeer ? (
          <>
            {/* Header: Peer info & Mobile Back Button */}
            <header className="h-16 px-4 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {onBackToDirectory ? (
                  <button
                    onClick={onBackToDirectory}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#2a3942] cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    title="Back to All Chats"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">All Chats</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#2a3942] cursor-pointer"
                    title="Back to conversation list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}

                <div className="relative shrink-0">
                  {activePeer.photoURL ? (
                    <img
                      src={activePeer.photoURL}
                      alt={activePeer.displayName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-[#2a3942]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
                      {activePeer.displayName[0]?.toUpperCase() || 'S'}
                    </div>
                  )}
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#202c33] absolute bottom-0 right-0" />
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white truncate">
                    {activePeer.displayName}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 truncate flex items-center gap-1">
                    @{activePeer.username || 'scholar'}
                    <span className="text-slate-400 font-sans text-[10px]">Direct Message</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  End-to-End P2P
                </span>
              </div>
            </header>

            {/* Messages Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Security & Study notice */}
              <div className="text-center my-2">
                <span className="inline-block px-3 py-1 rounded-lg bg-[#182229] border border-[#2a3942] text-[11px] text-slate-400">
                  💬 Private study chat between @{currentUser.username || 'you'} and @{activePeer.username}. Respect community guidelines.
                </span>
              </div>

              {allVisibleMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                  <p className="text-xs font-semibold text-slate-300">
                    Start a study conversation with @{activePeer.username}!
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Ask a doubt, exchange quiz strategies, or discuss syllabus concepts.
                  </p>
                </div>
              ) : (
                allVisibleMessages.map((msg) => {
                  const isMine = msg.senderId === currentUser.uid;
                  const reactions = msg.reactions || {};

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col group relative ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-sm relative ${
                          isMine
                            ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                            : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                        }`}
                      >
                        {/* Image attachment */}
                        {msg.imageUrl && (
                          <div className="mb-2 rounded-xl overflow-hidden cursor-pointer">
                            <img
                              src={msg.imageUrl}
                              alt={msg.imageName || 'Attachment'}
                              onClick={() => setLightboxImage(msg.imageUrl || null)}
                              className="max-h-60 rounded-xl object-contain hover:opacity-95 transition-opacity"
                            />
                          </div>
                        )}

                        {/* Text message with Math/KaTeX support */}
                        {msg.message && (
                          <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                            <MathText content={msg.message} />
                          </div>
                        )}

                        {/* Timestamp & Status indicators */}
                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-300 font-mono">
                          <span>{formatTime(msg.timestamp)}</span>
                          {isMine && (
                            <span>
                              {msg.isPending ? (
                                <Clock className="w-3 h-3 text-slate-400 animate-pulse" />
                              ) : msg.sendFailed ? (
                                <AlertCircle className="w-3 h-3 text-rose-400" />
                              ) : (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </span>
                          )}
                        </div>

                        {/* Reactions Badges */}
                        {Object.keys(reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-black/10">
                            {Object.entries(reactions).map(([emoji, userIds]) => (
                              <button
                                key={emoji}
                                onClick={() =>
                                  toggleP2PMessageReaction(
                                    activeConversation.id,
                                    msg.id,
                                    emoji,
                                    currentUser.uid
                                  )
                                }
                                className={`px-1.5 py-0.5 rounded-full text-[11px] font-mono flex items-center gap-0.5 cursor-pointer ${
                                  userIds.includes(currentUser.uid)
                                    ? 'bg-emerald-500/30 border border-emerald-500/40 text-emerald-300'
                                    : 'bg-black/20 text-slate-300'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span>{userIds.length}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Hover action bar: reactions & delete */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-0.5 px-1">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveReactionPickerId(
                              activeReactionPickerId === msg.id ? null : msg.id
                            )
                          }
                          className="reaction-trigger-btn p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#202c33] cursor-pointer"
                          title="Add reaction"
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>

                        {(isMine || isAdmin) && (
                          <button
                            type="button"
                            onClick={() => deleteP2PMessage(activeConversation.id, msg.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-[#202c33] cursor-pointer"
                            title={isMine ? "Delete message" : "Admin Delete message"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Emoji Picker Box */}
                      {activeReactionPickerId === msg.id && (
                        <div className="reaction-picker-box absolute z-20 top-0 bg-[#202c33] border border-[#2a3942] rounded-xl p-1.5 flex items-center gap-1 shadow-xl animate-in zoom-in-95 duration-100">
                          {EMOJI_REACTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                toggleP2PMessageReaction(
                                  activeConversation.id,
                                  msg.id,
                                  emoji,
                                  currentUser.uid
                                );
                                setActiveReactionPickerId(null);
                              }}
                              className="p-1 hover:bg-[#2a3942] rounded-lg text-sm cursor-pointer transition-transform hover:scale-125"
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
              <div ref={messagesEndRef} />
            </div>

            {/* Error Banner */}
            {chatError && (
              <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
                <span>{chatError}</span>
                <button onClick={() => setChatError(null)} className="p-0.5 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Draft Image Preview */}
            {draftImage && (
              <div className="px-4 py-2 bg-[#202c33] border-t border-[#2a3942] flex items-center gap-3">
                <img
                  src={draftImage.dataUrl}
                  alt="Draft"
                  className="w-12 h-12 rounded-lg object-cover border border-[#2a3942]"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-white block truncate">
                    {draftImage.name}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Ready to send • {formatFileSize(draftImage.sizeKb)}
                  </span>
                </div>
                <button
                  onClick={() => setDraftImage(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#2a3942] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Message Composer */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-[#202c33] border-t border-[#2a3942] flex items-center gap-2 shrink-0"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressingImage}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#2a3942] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                title="Attach question image / diagram"
              >
                {isCompressingImage ? (
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                ) : (
                  <Paperclip className="w-5 h-5" />
                )}
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Message @${activePeer.username || 'scholar'} (supports LaTeX math)...`}
                className="flex-1 px-4 py-2.5 bg-[#2a3942] rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />

              <button
                type="submit"
                disabled={(!inputMessage.trim() && !draftImage) || isSending}
                className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#202c33] flex items-center justify-center text-emerald-400 shadow-md">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Select a Scholar to Chat</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Pick an active scholar from the list or search by @username to start a peer-to-peer discussion.
            </p>
          </div>
        )}
      </main>

      {/* Lightbox for full image view */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-pointer"
        >
          <img
            src={lightboxImage}
            alt="Enlarged"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
