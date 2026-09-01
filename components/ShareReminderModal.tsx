import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Send, 
  Share2, 
  Bell, 
  Sparkles, 
  Flame, 
  BookOpen, 
  Trophy, 
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { QuizConfig } from '../types';

interface ShareReminderModalProps {
  quizTitle?: string;
  config?: Partial<QuizConfig>;
  quizId?: string;
  myScore?: { score: number; total: number };
  onClose: () => void;
}

export const ShareReminderModal: React.FC<ShareReminderModalProps> = ({
  quizTitle,
  config,
  quizId,
  myScore,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [recipientName, setRecipientName] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [templateType, setTemplateType] = useState<'standard' | 'challenge' | 'exam' | 'quick'>('standard');

  // Build the target link
  const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
      return window.location.origin;
    }
    return 'https://uquizzes.vercel.app';
  };

  const origin = getBaseUrl();
  const targetLink = quizId 
    ? `${origin}?quizId=${quizId}`
    : `${origin}?subject=${encodeURIComponent(config?.subject || '')}&class=${encodeURIComponent(config?.class || '')}`;

  const classSubject = `${config?.class || 'NCERT'} ${config?.subject || 'Assessment'}`.trim();
  const topicsStr = config?.topics && config.topics.length > 0 
    ? config.topics.slice(0, 2).join(', ') 
    : (quizTitle || 'NCERT Chapters');
  const qCount = config?.quantity || 10;

  // Generate reminder message based on selected template
  const generateMessage = (): string => {
    const greeting = recipientName.trim() ? `Hey ${recipientName.trim()}! 👋` : 'Hey there! 👋';
    const noteText = customNote.trim() ? `\n\n💬 Note: "${customNote.trim()}"` : '';

    if (templateType === 'challenge' && myScore) {
      const pct = Math.round((myScore.score / myScore.total) * 100);
      return `🎯 *NCERT Quiz Challenge on U-Quiz!* 🏆\n\n${greeting}\nI just scored *${myScore.score}/${myScore.total} (${pct}%)* on *${classSubject} - ${topicsStr}*.\n\nCan you beat my score? Take the challenge here:\n👉 ${targetLink}${noteText}\n\nLet's test your NCERT mastery! 🚀`;
    }

    if (templateType === 'exam') {
      return `📚 *Exam Prep Reminder: NCERT Practice Test* 📝\n\n${greeting}\nHere is your scheduled practice quiz for *${classSubject}* covering:\n📖 *Topics*: ${topicsStr}\n❓ *Questions*: ${qCount} Questions\n\nClick below to start your timed test:\n👉 ${targetLink}${noteText}\n\nAll the best for your prep! 🌟`;
    }

    if (templateType === 'quick') {
      return `⚡ *Quick 5-Minute NCERT Quiz Reminder* ⏱️\n\n${greeting}\nTake 5 minutes to test yourself on *${classSubject} (${topicsStr})*.\n\nStart now:\n👉 ${targetLink}${noteText}`;
    }

    // Default / Standard
    return `🔔 *Quiz Study Reminder from U-Quiz AI* 📚\n\n${greeting}\nDon't forget to complete your NCERT quiz on *${classSubject}*!\n📌 *Topic*: ${topicsStr}\n📊 *Format*: ${qCount} Multiple Choice Questions\n\nTake the quiz here:\n👉 ${targetLink}${noteText}\n\nPractice daily to maintain your streak! 🔥`;
  };

  const message = generateMessage();

  // Copy full reminder text to clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Copy just the link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Direct share on WhatsApp
  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Direct share on Telegram
  const handleTelegramShare = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(targetLink)}&text=${encodeURIComponent(message)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  // Native device share
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quiz Reminder: ${classSubject}`,
          text: message,
          url: targetLink,
        });
      } catch (e) {
        // user cancelled or share unsupported
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-display">
                Share Quiz Reminder
              </h2>
              <p className="text-xs text-slate-400">
                Send a custom study reminder or challenge link to any friend or group
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Choose Reminder Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setTemplateType('standard')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                templateType === 'standard'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Friendly Reminder</span>
            </button>

            {myScore && (
              <button
                type="button"
                onClick={() => setTemplateType('challenge')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  templateType === 'challenge'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Beat My Score</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setTemplateType('exam')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                templateType === 'exam'
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Exam Prep Alert</span>
            </button>

            <button
              type="button"
              onClick={() => setTemplateType('quick')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                templateType === 'quick'
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>5-Min Quick</span>
            </button>
          </div>
        </div>

        {/* Recipient & Custom Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Friend's Name (Optional)
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Rahul, Priya, Study Group"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Custom Personal Note (Optional)
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Finish before 8 PM tonight!"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Reminder Message Preview
            </span>
            <button
              onClick={handleCopyLink}
              className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <ExternalLink className="w-3 h-3" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Link Only'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto select-all">
            {message}
          </div>
        </div>

        {/* Sharing Action Buttons */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full py-2.5 px-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              onClick={handleTelegramShare}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 text-[#29b6f6] border border-[#0088cc]/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Share on Telegram</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Copy Formatted Text */}
            <button
              onClick={handleCopyText}
              className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-sm ${
                copied
                  ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/60'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Reminder Text Copied!' : 'Copy Formatted Reminder'}</span>
            </button>

            {/* Native Share */}
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-lg shadow-emerald-500/20"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via Other Apps</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
