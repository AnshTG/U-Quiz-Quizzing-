import React, { useState, useMemo } from 'react';
import { 
  SecurityIncident, 
  SecuritySeverity, 
  SecurityStatus, 
  SecurityIncidentType 
} from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Trash2, 
  CheckCircle2, 
  Filter, 
  Search, 
  UserX, 
  Terminal, 
  Clock, 
  Cpu, 
  Lock, 
  Globe, 
  Sliders, 
  MessageSquare, 
  FileCode, 
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AdminSecurityViewProps {
  alerts: SecurityIncident[];
  onUpdateStatus: (alertId: string, status: SecurityStatus, notes?: string) => Promise<void>;
  onDeleteAlert: (alertId: string) => Promise<void>;
  onPurgeResolved: () => Promise<void>;
  onPurgeAll: () => Promise<void>;
  onBanToggle: (userId: string, currentBanned: boolean, userName: string) => Promise<void>;
  actionLoading: string | null;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

const TYPE_CONFIG: Record<SecurityIncidentType, { label: string; desc: string; icon: React.ReactNode }> = {
  admin_brute_force: { 
    label: 'Admin Gateway Brute-Force', 
    desc: 'Repeated failed passkey attempts on administrator authentication portal',
    icon: <Lock className="w-4 h-4 text-rose-400" />
  },
  admin_injection_attempt: { 
    label: 'Admin Code Injection Probe', 
    desc: 'Special SQL/NoSQL or script characters submitted into administrator inputs',
    icon: <FileCode className="w-4 h-4 text-rose-500" />
  },
  ssrf_probe: { 
    label: 'SSRF / Cloud Metadata Probe', 
    desc: 'Attempt to query private subnets, loopbacks, or GCP metadata (169.254.169.254)',
    icon: <Globe className="w-4 h-4 text-rose-400" />
  },
  exam_tab_switch_anomaly: { 
    label: 'Proctor Tab Switch Anomaly', 
    desc: 'Student switched away from active exam window or unfocused browser tab',
    icon: <Eye className="w-4 h-4 text-amber-300" />
  },
  exam_bot_speed_anomaly: { 
    label: 'Bot Speed / Pacing Anomaly', 
    desc: 'Quiz completed at physiologically impossible reading speed (< 2s per question)',
    icon: <Cpu className="w-4 h-4 text-purple-400" />
  },
  score_tamper_attempt: { 
    label: 'Score Tampering Attempt', 
    desc: 'Client submitted a score exceeding total questions or corrupted state payload',
    icon: <AlertOctagon className="w-4 h-4 text-rose-500" />
  },
  chat_spam_flood: { 
    label: 'Public Chat Spam Flood', 
    desc: 'High-frequency message bursting violating the 2-second rate limit',
    icon: <MessageSquare className="w-4 h-4 text-cyan-400" />
  },
  chat_xss_probe: { 
    label: 'Chat XSS / Script Injection', 
    desc: 'HTML script tags, javascript: URIs, or onload/onerror handlers in study chat',
    icon: <FileCode className="w-4 h-4 text-amber-400" />
  },
  challenge_code_bruteforce: { 
    label: 'Challenge Code Enumeration', 
    desc: 'Rapid randomized queries scanning for active shared assessment codes',
    icon: <Sliders className="w-4 h-4 text-amber-400" />
  },
  payload_oversize_abuse: { 
    label: 'Oversized Payload Abuse', 
    desc: 'Request size exceeded system limits to stress or degrade performance',
    icon: <AlertTriangle className="w-4 h-4 text-orange-400" />
  },
  client_tamper_general: { 
    label: 'Client Tampering General', 
    desc: 'General integrity deviation or client-side tampering detected',
    icon: <AlertTriangle className="w-4 h-4 text-slate-400" />
  }
};

export const AdminSecurityView: React.FC<AdminSecurityViewProps> = ({
  alerts,
  onUpdateStatus,
  onDeleteAlert,
  onPurgeResolved,
  onPurgeAll,
  onBanToggle,
  actionLoading,
  searchQuery,
  onSearchChange,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | SecurityStatus>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | SecuritySeverity>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | SecurityIncidentType>('all');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>('');

  // Filtered list calculation
  const filteredAlerts = useMemo(() => {
    return alerts.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesUser = (item.userName || '').toLowerCase().includes(q) || (item.userEmail || '').toLowerCase().includes(q);
        const matchesTitle = (item.title || '').toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesType = (item.type || '').toLowerCase().includes(q);
        const matchesEndpoint = (item.endpointOrContext || '').toLowerCase().includes(q);
        const matchesPayload = (item.detectedPayload || '').toLowerCase().includes(q);
        if (!matchesUser && !matchesTitle && !matchesDesc && !matchesType && !matchesEndpoint && !matchesPayload) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, statusFilter, severityFilter, typeFilter, searchQuery]);

  // Key metrics
  const stats = useMemo(() => {
    const total = alerts.length;
    const openCount = alerts.filter(a => a.status === 'unreviewed' || a.status === 'investigating').length;
    const criticalCount = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
    const resolvedCount = alerts.filter(a => a.status === 'resolved' || a.status === 'dismissed').length;
    return { total, openCount, criticalCount, resolvedCount };
  }, [alerts]);

  const handleSaveNotes = async (alertId: string, currentStatus: SecurityStatus) => {
    await onUpdateStatus(alertId, currentStatus, notesDraft);
    setEditingNotesId(null);
  };

  const getSeverityBadgeClass = (severity: SecuritySeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'low':
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusBadgeClass = (status: SecurityStatus) => {
    switch (status) {
      case 'unreviewed':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse';
      case 'investigating':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'resolved':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'dismissed':
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ================= 1. SECURITY SENTINEL OVERVIEW ================= */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">System Security & Tampering Logs</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 border border-slate-700 text-slate-300">
                Active Sentinel
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Real-time audit log of security threats, proctor tab-switches, bot anomalies, injection probes, and unauthorized state manipulations.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onPurgeResolved}
              disabled={actionLoading === 'purge_sec_resolved' || stats.resolvedCount === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Purge Resolved ({stats.resolvedCount})</span>
            </button>

            <button
              onClick={onPurgeAll}
              disabled={actionLoading === 'purge_all_security' || alerts.length === 0}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge All Alerts</span>
            </button>
          </div>
        </div>

        {/* 5 Security Shields Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Admin Auth Guard</span>
            </div>
            <p className="text-[11px] text-slate-400">
              5-attempt brute-force rate limit with 5-minute exponential lockout.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>SSRF & IP Shield</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Blocks RFC1918 subnets, loopbacks, and cloud metadata (169.254.169.254).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Academic Proctor</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Monitors active window unfocus & tab-switching during exams.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Score & Bot Integrity</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Rejects impossible scores and sub-second answer speeds.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Chat Anti-XSS</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sanitizes script tags and limits chat messages to 1 every 2 seconds.
            </p>
          </div>
        </div>

        {/* Metrics Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-mono">TOTAL LOGGED</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">{stats.total}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/20 space-y-1">
            <div className="text-[11px] text-rose-400 font-mono">UNREVIEWED / ACTION</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400 flex items-center gap-2">
              <span>{stats.openCount}</span>
              {stats.openCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-orange-500/20 space-y-1">
            <div className="text-[11px] text-orange-400 font-mono">CRITICAL / HIGH</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-orange-400">{stats.criticalCount}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/20 space-y-1">
            <div className="text-[11px] text-emerald-400 font-mono">RESOLVED / DISMISSED</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">{stats.resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* ================= 2. FILTER & SEARCH CONTROLS ================= */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-xs">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-400"
            >
              <option value="all">All Statuses</option>
              <option value="unreviewed">Unreviewed</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-xs">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-400"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Incident Type Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-xs">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-400"
            >
              <option value="all">All Threat Types</option>
              <option value="admin_brute_force">Admin Gateway Brute-Force</option>
              <option value="admin_injection_attempt">Admin Injection Probe</option>
              <option value="exam_tab_switch_anomaly">Proctor Tab Switch</option>
              <option value="exam_bot_speed_anomaly">Bot Speed Anomaly</option>
              <option value="score_tamper_attempt">Score Tampering Attempt</option>
              <option value="chat_spam_flood">Chat Spam Flood</option>
              <option value="chat_xss_probe">Chat XSS Probe</option>
              <option value="ssrf_probe">SSRF / Metadata Probe</option>
              <option value="challenge_code_bruteforce">Challenge Code Scan</option>
              <option value="client_tamper_general">Client Tampering General</option>
            </select>
          </div>
        </div>

        {/* Search box */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search incident, user, or endpoint..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-400 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* ================= 3. INCIDENTS LIST ================= */}
      {filteredAlerts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">No Security Alerts Found</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery || statusFilter !== 'all' || severityFilter !== 'all' || typeFilter !== 'all'
              ? 'No security incidents match your selected filters or search query.'
              : 'The system has detected zero tampering or unauthorized attempts. All security parameters remain pristine.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((item) => {
            const isExpanded = expandedAlertId === item.id;
            const isEditing = editingNotesId === item.id;
            const typeInfo = TYPE_CONFIG[item.type] || TYPE_CONFIG.client_tamper_general;

            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold uppercase border ${getSeverityBadgeClass(item.severity)}`}>
                      {item.severity}
                    </span>

                    <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${getStatusBadgeClass(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200">
                      {typeInfo.icon}
                      <span>{typeInfo.label}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.timeIST || (item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'Recent')}</span>
                    <span>•</span>
                    <span>{item.date || 'Today'}</span>
                  </div>
                </div>

                {/* Title & Core Description */}
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{item.title}</span>
                  </h4>
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Metadata Row: Scholar context & Client info */}
                <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
                  {item.userName ? (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-slate-500 font-mono">User:</span>
                      <strong className="text-emerald-400">{item.userName}</strong>
                      {item.userEmail && <span className="text-slate-500 font-mono text-[11px]">({item.userEmail})</span>}
                    </div>
                  ) : (
                    <div className="text-slate-500 font-mono text-[11px]">
                      Anonymous / Unauthenticated Client
                    </div>
                  )}

                  {item.userId && (
                    <button
                      onClick={() => onBanToggle(item.userId!, false, item.userName || 'Scholar')}
                      className="text-[11px] px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer flex items-center gap-1"
                      title="Restrict or ban this scholar account"
                    >
                      <UserX className="w-3 h-3" />
                      <span>Action Scholar</span>
                    </button>
                  )}

                  {item.endpointOrContext && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      <span className="text-slate-500">Context:</span> {item.endpointOrContext}
                    </div>
                  )}

                  {item.clientInfo?.userAgent && (
                    <div className="text-[10px] text-slate-500 font-mono truncate max-w-xs" title={item.clientInfo.userAgent}>
                      Client: {item.clientInfo.userAgent}
                    </div>
                  )}
                </div>

                {/* Expanded Details / Forensic Evidence */}
                {isExpanded && item.detectedPayload && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/60 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-amber-400" />
                        <span>Detected Forensic Payload:</span>
                      </span>
                    </div>
                    <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-300 overflow-x-auto max-h-56 leading-relaxed whitespace-pre-wrap">
                      {item.detectedPayload}
                    </pre>
                  </div>
                )}

                {/* Resolution Notes Section */}
                {item.adminNotes && !isEditing && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-400 text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin Evaluation:</span>
                      </span>
                      {item.resolvedAt && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(item.resolvedAt).toLocaleDateString()} by {item.resolvedBy || 'Admin'}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-200 leading-relaxed">{item.adminNotes}</p>
                  </div>
                )}

                {/* Inline Editing for Admin Notes */}
                {isEditing && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="text-xs font-semibold text-slate-300">Admin Investigation Notes</label>
                    <textarea
                      rows={2}
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      placeholder="Add investigation remarks or action taken..."
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-400"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingNotesId(null)}
                        className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveNotes(item.id, item.status)}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Footer Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 mr-1 font-semibold">Change Status:</span>
                    {(['unreviewed', 'investigating', 'resolved', 'dismissed'] as SecurityStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => onUpdateStatus(item.id, st)}
                        disabled={item.status === st || actionLoading === `sec_status_${item.id}`}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                          item.status === st
                            ? 'bg-slate-800 text-white border border-slate-700 font-bold'
                            : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  {/* Right Action Icons */}
                  <div className="flex items-center gap-2">
                    {item.detectedPayload && (
                      <button
                        onClick={() => setExpandedAlertId(isExpanded ? null : item.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Terminal className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isExpanded ? 'Hide Payload' : 'View Payload'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditingNotesId(item.id);
                        setNotesDraft(item.adminNotes || '');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{item.adminNotes ? 'Edit Note' : 'Add Note'}</span>
                    </button>

                    <button
                      onClick={() => onDeleteAlert(item.id)}
                      disabled={actionLoading === `del_sec_${item.id}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Incident Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
