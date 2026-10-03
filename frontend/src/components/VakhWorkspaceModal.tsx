import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Shield, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  Plus, 
  RefreshCw, 
  Kanban, 
  Table, 
  FileText, 
  LayoutDashboard,
  Send,
  Wrench,
  Plane
} from 'lucide-react';
import { api } from '../api';
import { SquawkCase, VakhWorkspaceData, RecoveryActionItem, RecoveryUpdate } from '../types';

interface VakhWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  squawkCase: SquawkCase;
  onOpenResolutionModal?: () => void;
  onUpdateCase?: (updatedCase: SquawkCase) => void;
}

export const VakhWorkspaceModal: React.FC<VakhWorkspaceModalProps> = ({
  isOpen,
  onClose,
  squawkCase,
  onOpenResolutionModal,
  onUpdateCase
}) => {
  const [workspaceData, setWorkspaceData] = useState<VakhWorkspaceData | null>(null);
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'FEED' | 'TABLE' | 'INCIDENT'>('KANBAN');
  const [isLoading, setIsLoading] = useState(false);
  const [newUpdateMessage, setNewUpdateMessage] = useState('');
  const [authorRole, setAuthorRole] = useState('Technician Lead');
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);

  useEffect(() => {
    if (isOpen && squawkCase?.id) {
      loadWorkspace();
    }
  }, [isOpen, squawkCase?.id]);

  const loadWorkspace = async () => {
    setIsLoading(true);
    try {
      const data = await api.getVakhWorkspace(squawkCase.id);
      setWorkspaceData(data);
    } catch (err) {
      console.error('Error fetching Vakh workspace:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionStatusChange = async (actionId: string, newStatus: string) => {
    try {
      await api.updateRecoveryActionStatus(squawkCase.id, actionId, newStatus);
      await loadWorkspace();
      const updated = await api.getCase(squawkCase.id);
      if (onUpdateCase) onUpdateCase(updated);
    } catch (err: any) {
      alert('Failed to update action status: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdateMessage.trim()) return;

    setIsPostingUpdate(true);
    try {
      await api.addIncidentUpdate(squawkCase.id, {
        message: newUpdateMessage.trim(),
        author: authorRole,
        source: 'TECHNICIAN'
      });
      setNewUpdateMessage('');
      await loadWorkspace();
      const updated = await api.getCase(squawkCase.id);
      if (onUpdateCase) onUpdateCase(updated);
    } catch (err: any) {
      alert('Failed to add update: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsPostingUpdate(false);
    }
  };

  if (!isOpen) return null;

  const actions: RecoveryActionItem[] = workspaceData?.recovery?.recovery_actions || squawkCase.recovery_actions_list || [];
  const updates: RecoveryUpdate[] = workspaceData?.updates || squawkCase.recovery_updates || [];
  const resolution = workspaceData?.resolution || squawkCase.resolution;

  const pendingActions = actions.filter(a => a.status === 'Pending');
  const inProgressActions = actions.filter(a => a.status === 'In Progress');
  const completedActions = actions.filter(a => a.status === 'Completed');
  const blockedActions = actions.filter(a => a.status === 'Blocked');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto font-mono">
      <div className="bg-[rgba(26,29,23,0.96)] border-2 border-[rgba(255,210,100,0.4)] rounded-xl w-full max-w-5xl text-[#F7F1E4] shadow-2xl overflow-hidden my-4">
        
        {/* Workspace Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,210,100,0.2)] bg-[rgba(34,38,30,0.95)]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-[rgba(217,166,46,0.2)] border border-[#D9A62E] text-[#F0C75E]">
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  OPERATIONAL WORKSPACE · VAKH SHARED RECORD
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(217,166,46,0.18)] text-[#F0C75E] border border-[rgba(217,166,46,0.4)]">
                  {squawkCase.id}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[rgba(120,150,106,0.25)] text-[#A0C49D] border border-[rgba(120,150,106,0.4)] font-bold">
                  REAL-TIME SYNC
                </span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-[#D8D0BD] font-sans mt-0.5">
                <span>Tail: <strong className="text-white font-mono">{squawkCase.tail_number || 'VT-SQK'}</strong></span>
                <span>Type: <strong className="text-white">{squawkCase.aircraft_type || 'Boeing 737-800'}</strong></span>
                <span>Airport: <strong className="text-white font-mono">{squawkCase.airport || squawkCase.location || 'DEL'}</strong></span>
                <span>Ref: <strong className="text-[#F0C75E] font-mono">{squawkCase.vakh_submission_id || 'vakh_sub_active'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {squawkCase.vakh_record_url && (
              <a 
                href={squawkCase.vakh_record_url.includes('/rec/') || squawkCase.vakh_record_url.includes('/forms/aog_') ? 'https://vakh.com' : squawkCase.vakh_record_url}
                target="_blank"
                rel="noreferrer"
                title={`Vakh Platform · Ref: ${squawkCase.vakh_submission_id || 'vakh_sub_active'}`}
                className="px-3 py-1.5 rounded bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] text-[#D8D0BD] hover:text-white border border-[rgba(255,210,100,0.25)] text-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <span>Open in Vakh</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button 
              onClick={loadWorkspace}
              disabled={isLoading}
              title="Refresh Workspace"
              className="p-1.5 rounded bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] text-[#D8D0BD] hover:text-white border border-[rgba(255,210,100,0.25)] transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#F0C75E]' : ''}`} />
            </button>

            <button 
              onClick={onClose}
              className="text-[#D8D0BD] hover:text-white p-1 rounded hover:bg-[rgba(255,210,100,0.15)] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher (Vakh Saved Views: Board, Feed, Table, Incident) */}
        <div className="px-6 py-2 bg-[rgba(20,22,17,0.85)] border-b border-[rgba(255,210,100,0.15)] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#D8D0BD] mr-2 uppercase">VAKH VIEWS:</span>
            
            <button
              onClick={() => setActiveTab('KANBAN')}
              className={`px-3 py-1 rounded text-xs flex items-center space-x-1.5 transition cursor-pointer ${
                activeTab === 'KANBAN' 
                  ? 'bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] text-[#252820] font-bold shadow-sm' 
                  : 'bg-[rgba(26,29,23,0.7)] text-[#D8D0BD] hover:text-white border border-[rgba(255,210,100,0.2)]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>RECOVERY BOARD (KANBAN)</span>
            </button>

            <button
              onClick={() => setActiveTab('FEED')}
              className={`px-3 py-1 rounded text-xs flex items-center space-x-1.5 transition cursor-pointer ${
                activeTab === 'FEED' 
                  ? 'bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] text-[#252820] font-bold shadow-sm' 
                  : 'bg-[rgba(26,29,23,0.7)] text-[#D8D0BD] hover:text-white border border-[rgba(255,210,100,0.2)]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>OPERATIONAL FEED ({updates.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('TABLE')}
              className={`px-3 py-1 rounded text-xs flex items-center space-x-1.5 transition cursor-pointer ${
                activeTab === 'TABLE' 
                  ? 'bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] text-[#252820] font-bold shadow-sm' 
                  : 'bg-[rgba(26,29,23,0.7)] text-[#D8D0BD] hover:text-white border border-[rgba(255,210,100,0.2)]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>ACTIONS TABLE (8)</span>
            </button>

            <button
              onClick={() => setActiveTab('INCIDENT')}
              className={`px-3 py-1 rounded text-xs flex items-center space-x-1.5 transition cursor-pointer ${
                activeTab === 'INCIDENT' 
                  ? 'bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] text-[#252820] font-bold shadow-sm' 
                  : 'bg-[rgba(26,29,23,0.7)] text-[#D8D0BD] hover:text-white border border-[rgba(255,210,100,0.2)]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>INTAKE & RESOLUTION</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {resolution ? (
              <span className="px-2 py-0.5 rounded bg-[rgba(120,150,106,0.25)] text-[#A0C49D] border border-[rgba(120,150,106,0.4)] text-[10px] font-bold">
                ✓ RESOLUTION RECORDED
              </span>
            ) : onOpenResolutionModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenResolutionModal();
                }}
                className="px-2.5 py-1 rounded bg-[#C85B43] hover:bg-[#D96B54] text-white border border-[#E07A63] font-bold text-[11px] flex items-center space-x-1 transition cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>RESOLVE INCIDENT</span>
              </button>
            )}
          </div>
        </div>

        {/* Workspace Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto">
          
          {/* TAB 1: KANBAN BOARD */}
          {activeTab === 'KANBAN' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#D8D0BD] font-sans pb-1 border-b border-[rgba(255,210,100,0.15)]">
                <span>
                  Interactive 8-Step Recovery Action Board · Click any status badge to reassign stage in real-time
                </span>
                <span className="font-mono text-[#F0C75E] font-bold">
                  {completedActions.length}/8 STEPS COMPLETED
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {/* Column: Pending */}
                <div className="bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.2)] rounded-lg p-3 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[rgba(255,210,100,0.15)] pb-2">
                    <span className="text-xs font-bold text-[#D8D0BD] uppercase flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>PENDING ({pendingActions.length})</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    {pendingActions.map(action => (
                      <div key={action.id} className="p-2.5 bg-[rgba(28,31,24,0.8)] border border-[rgba(255,210,100,0.18)] rounded hover:border-[rgba(255,210,100,0.4)] transition space-y-1.5">
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-mono text-[#D8D0BD]/70 font-bold">
                            STEP {action.step_number}
                          </span>
                          <button
                            onClick={() => handleActionStatusChange(action.id, 'In Progress')}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(217,166,46,0.2)] text-[#F0C75E] border border-[#D9A62E] hover:bg-[#D9A62E] hover:text-[#252820] font-bold transition cursor-pointer"
                          >
                            Start →
                          </button>
                        </div>
                        <div className="text-xs font-bold text-white">{action.title}</div>
                        <p className="text-[11px] text-[#D8D0BD] font-sans leading-tight">{action.description}</p>
                        <div className="text-[10px] text-[#D8D0BD]/60 font-mono pt-1 border-t border-[rgba(255,210,100,0.1)]">
                          Role: {action.assigned_role}
                        </div>
                      </div>
                    ))}
                    {pendingActions.length === 0 && (
                      <div className="text-center py-6 text-[#D8D0BD]/50 text-xs italic">No pending actions</div>
                    )}
                  </div>
                </div>

                {/* Column: In Progress */}
                <div className="bg-[rgba(28,30,22,0.8)] border border-[rgba(217,166,46,0.35)] rounded-lg p-3 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[rgba(217,166,46,0.3)] pb-2">
                    <span className="text-xs font-bold text-[#F0C75E] uppercase flex items-center space-x-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>IN PROGRESS ({inProgressActions.length})</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    {inProgressActions.map(action => (
                      <div key={action.id} className="p-2.5 bg-[rgba(34,38,28,0.9)] border border-[rgba(217,166,46,0.4)] rounded hover:border-[#F0C75E] transition space-y-1.5 shadow-sm">
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-mono text-[#F0C75E] font-bold">
                            STEP {action.step_number}
                          </span>
                          <button
                            onClick={() => handleActionStatusChange(action.id, 'Completed')}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(120,150,106,0.25)] text-[#A0C49D] border border-[rgba(120,150,106,0.5)] hover:bg-[#78966A] hover:text-white font-bold transition cursor-pointer"
                          >
                            Complete ✓
                          </button>
                        </div>
                        <div className="text-xs font-bold text-white">{action.title}</div>
                        <p className="text-[11px] text-[#F7F1E4]/80 font-sans leading-tight">{action.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-[#D8D0BD] font-mono pt-1 border-t border-[rgba(217,166,46,0.2)]">
                          <span>{action.assigned_role}</span>
                          <button
                            onClick={() => handleActionStatusChange(action.id, 'Blocked')}
                            className="text-[#C85B43] hover:underline cursor-pointer font-bold"
                          >
                            Flag Blocked
                          </button>
                        </div>
                      </div>
                    ))}
                    {inProgressActions.length === 0 && (
                      <div className="text-center py-6 text-[#D8D0BD]/50 text-xs italic">No actions active</div>
                    )}
                  </div>
                </div>

                {/* Column: Completed */}
                <div className="bg-[rgba(22,28,20,0.8)] border border-[rgba(120,150,106,0.35)] rounded-lg p-3 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[rgba(120,150,106,0.3)] pb-2">
                    <span className="text-xs font-bold text-[#A0C49D] uppercase flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>COMPLETED ({completedActions.length})</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    {completedActions.map(action => (
                      <div key={action.id} className="p-2.5 bg-[rgba(26,34,24,0.85)] border border-[rgba(120,150,106,0.3)] rounded space-y-1.5">
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-mono text-[#A0C49D] font-bold">
                            STEP {action.step_number} ✓
                          </span>
                          <span className="text-[9px] text-[#78966A] font-mono font-bold">VERIFIED</span>
                        </div>
                        <div className="text-xs font-bold text-white line-through decoration-[#78966A]/60">{action.title}</div>
                        <p className="text-[11px] text-[#D8D0BD]/80 font-sans leading-tight">{action.description}</p>
                        <div className="text-[10px] text-[#D8D0BD]/60 font-mono pt-1 border-t border-[rgba(120,150,106,0.2)]">
                          Signed: {action.assigned_role}
                        </div>
                      </div>
                    ))}
                    {completedActions.length === 0 && (
                      <div className="text-center py-6 text-[#D8D0BD]/50 text-xs italic">None completed yet</div>
                    )}
                  </div>
                </div>

                {/* Column: Blocked */}
                <div className="bg-[rgba(32,20,20,0.8)] border border-[rgba(200,91,67,0.35)] rounded-lg p-3 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[rgba(200,91,67,0.3)] pb-2">
                    <span className="text-xs font-bold text-[#E07A63] uppercase flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>BLOCKED ({blockedActions.length})</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    {blockedActions.map(action => (
                      <div key={action.id} className="p-2.5 bg-[rgba(40,24,24,0.85)] border border-[rgba(200,91,67,0.3)] rounded space-y-1.5">
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-mono text-[#E07A63] font-bold">
                            STEP {action.step_number}
                          </span>
                          <button
                            onClick={() => handleActionStatusChange(action.id, 'In Progress')}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(217,166,46,0.2)] text-[#F0C75E] border border-[#D9A62E] hover:bg-[#D9A62E] hover:text-[#252820] font-bold transition cursor-pointer"
                          >
                            Unblock
                          </button>
                        </div>
                        <div className="text-xs font-bold text-white">{action.title}</div>
                        <p className="text-[11px] text-[#D8D0BD] font-sans leading-tight">{action.description}</p>
                        <div className="text-[10px] text-[#E07A63] font-mono pt-1 border-t border-[rgba(200,91,67,0.2)]">
                          Escalated: {action.assigned_role}
                        </div>
                      </div>
                    ))}
                    {blockedActions.length === 0 && (
                      <div className="text-center py-6 text-[#D8D0BD]/50 text-xs italic">Zero blockers</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPERATIONAL FEED */}
          {activeTab === 'FEED' && (
            <div className="space-y-4">
              {/* Add New Operational Update Box */}
              <form onSubmit={handlePostUpdate} className="p-4 bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center space-x-2">
                    <MessageSquare className="w-3.5 h-3.5 text-[#F0C75E]" />
                    <span>BROADCAST OPERATIONAL UPDATE TO VAKH RECORD</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <label className="text-[10px] text-[#D8D0BD]">AUTHOR ROLE:</label>
                    <select
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      className="bg-[rgba(16,18,14,0.9)] border border-[rgba(255,210,100,0.25)] text-xs text-[#F7F1E4] rounded px-2 py-1 focus:outline-none focus:border-[#D9A62E]"
                    >
                      <option value="Lead Technician (DEL)">Lead Technician (DEL)</option>
                      <option value="A&P Specialist">A&P Specialist</option>
                      <option value="Station Controller">Station Controller</option>
                      <option value="Materials Coordinator">Materials Coordinator</option>
                      <option value="Duty Maintenance Manager">Duty Maintenance Manager</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newUpdateMessage}
                    onChange={(e) => setNewUpdateMessage(e.target.value)}
                    placeholder="e.g. Technician reached aircraft. Seal kit located in DEL warehouse..."
                    className="flex-1 bg-[rgba(16,18,14,0.9)] border border-[rgba(255,210,100,0.25)] rounded px-3 py-2 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E]"
                  />
                  <button
                    type="submit"
                    disabled={isPostingUpdate || !newUpdateMessage.trim()}
                    className="px-4 py-2 rounded bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#E2B139] hover:to-[#F7D475] disabled:opacity-40 text-[#252820] text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>POST UPDATE</span>
                  </button>
                </div>
              </form>

              {/* Feed List */}
              <div className="space-y-2.5">
                {updates.map((update, idx) => (
                  <div 
                    key={update.id || idx} 
                    className="p-3.5 bg-[rgba(24,27,21,0.75)] border border-[rgba(255,210,100,0.18)] rounded-lg hover:border-[rgba(255,210,100,0.4)] transition flex items-start space-x-3"
                  >
                    <div className="p-2 rounded bg-[rgba(217,166,46,0.15)] text-[#F0C75E] border border-[rgba(217,166,46,0.3)]">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{update.author}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                            update.source === 'VAKH_INTAKE' || update.source === 'VAKH'
                              ? 'bg-[rgba(217,166,46,0.18)] text-[#F0C75E] border border-[rgba(217,166,46,0.4)]'
                              : update.source === 'SQUAWK_AI'
                              ? 'bg-[rgba(120,150,106,0.2)] text-[#A0C49D] border border-[rgba(120,150,106,0.4)]'
                              : 'bg-[rgba(38,42,34,0.7)] text-[#D8D0BD] border border-[rgba(255,210,100,0.25)]'
                          }`}>
                            [{update.source}]
                          </span>
                          <span className="text-[10px] text-[#D8D0BD]/70">
                            {update.created_at ? new Date(update.created_at).toLocaleTimeString() : 'Just now'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#A0C49D] font-bold">
                          {update.vakh_sync_status || 'SYNCED'}
                        </span>
                      </div>
                      <p className="text-xs text-[#D8D0BD] font-sans leading-relaxed">
                        {update.message}
                      </p>
                    </div>
                  </div>
                ))}
                {updates.length === 0 && (
                  <div className="text-center py-10 text-[#D8D0BD]/60 text-xs">
                    No operational updates posted yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ACTIONS TABLE */}
          {activeTab === 'TABLE' && (
            <div className="space-y-3">
              <div className="text-xs text-[#D8D0BD] font-sans pb-1 border-b border-[rgba(255,210,100,0.15)]">
                Standard 8-Step Aviation Maintenance Protocol · AMM / Part 145 Authorized Workflow
              </div>
              <div className="border border-[rgba(255,210,100,0.2)] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[rgba(20,22,17,0.95)] text-[#D8D0BD] uppercase text-[10px] border-b border-[rgba(255,210,100,0.2)]">
                    <tr>
                      <th className="p-3">Step #</th>
                      <th className="p-3">Action Title</th>
                      <th className="p-3">Assigned Role</th>
                      <th className="p-3">Current Status</th>
                      <th className="p-3 text-right">Toggle Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,210,100,0.1)]">
                    {actions.map((act) => (
                      <tr key={act.id} className="hover:bg-[rgba(255,210,100,0.06)] transition">
                        <td className="p-3 font-bold text-[#F0C75E]">{act.step_number}</td>
                        <td className="p-3">
                          <div className="font-bold text-white">{act.title}</div>
                          <div className="text-[11px] text-[#D8D0BD] font-sans mt-0.5">{act.description}</div>
                        </td>
                        <td className="p-3 text-[#D8D0BD]">{act.assigned_role}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            act.status === 'Completed' 
                              ? 'bg-[rgba(120,150,106,0.25)] text-[#A0C49D] border border-[rgba(120,150,106,0.4)]'
                              : act.status === 'In Progress'
                              ? 'bg-[rgba(217,166,46,0.2)] text-[#F0C75E] border border-[#D9A62E]'
                              : act.status === 'Blocked'
                              ? 'bg-[rgba(200,91,67,0.25)] text-[#E07A63] border border-[#C85B43]'
                              : 'bg-[rgba(38,42,34,0.7)] text-[#D8D0BD] border border-[rgba(255,210,100,0.2)]'
                          }`}>
                            {act.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => handleActionStatusChange(act.id, 'Pending')}
                            className="px-2 py-0.5 rounded bg-[rgba(20,22,17,0.8)] hover:bg-[rgba(34,38,28,0.9)] text-[#D8D0BD] text-[10px] border border-[rgba(255,210,100,0.2)] cursor-pointer"
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => handleActionStatusChange(act.id, 'In Progress')}
                            className="px-2 py-0.5 rounded bg-[rgba(217,166,46,0.2)] hover:bg-[#D9A62E] text-[#F0C75E] hover:text-[#252820] text-[10px] border border-[#D9A62E] font-bold cursor-pointer"
                          >
                            Progress
                          </button>
                          <button
                            onClick={() => handleActionStatusChange(act.id, 'Completed')}
                            className="px-2 py-0.5 rounded bg-[rgba(120,150,106,0.25)] hover:bg-[#78966A] text-[#A0C49D] hover:text-white text-[10px] border border-[rgba(120,150,106,0.4)] font-bold cursor-pointer"
                          >
                            Complete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: INTAKE & RESOLUTION SUMMARY */}
          {activeTab === 'INCIDENT' && (
            <div className="space-y-4 font-sans text-xs">
              {/* Intake Details Card */}
              <div className="p-4 bg-[rgba(20,22,17,0.75)] border border-[rgba(255,210,100,0.25)] rounded-lg space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-[rgba(255,210,100,0.15)] pb-2">
                  <span className="text-xs font-bold text-[#F0C75E] uppercase">
                    VAKH INTAKE RECORD DETAILS
                  </span>
                  <span className="text-[10px] text-[#D8D0BD]">
                    Logged: {squawkCase.created_at ? new Date(squawkCase.created_at).toLocaleString() : 'N/A'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[#D8D0BD]/70 block text-[10px]">AIRCRAFT</span>
                    <strong className="text-white">{squawkCase.tail_number} ({squawkCase.aircraft_type})</strong>
                  </div>
                  <div>
                    <span className="text-[#D8D0BD]/70 block text-[10px]">OPERATOR</span>
                    <strong className="text-white">{squawkCase.operator || 'Air Indigo Wings'}</strong>
                  </div>
                  <div>
                    <span className="text-[#D8D0BD]/70 block text-[10px]">LOCATION</span>
                    <strong className="text-white">{squawkCase.airport || squawkCase.location}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[rgba(255,210,100,0.12)]">
                  <div>
                    <span className="text-[#D8D0BD]/70 block text-[10px]">DEFECT CATEGORY</span>
                    <strong className="text-white">{squawkCase.defect_category || 'Hydraulic Power'}</strong>
                  </div>
                  <div>
                    <span className="text-[#D8D0BD]/70 block text-[10px]">MEL PROVISION</span>
                    <strong className="text-[#F0C75E]">{squawkCase.mel_cdl_info || 'Non-deferrable (AOG)'}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[rgba(255,210,100,0.12)]">
                  <span className="text-[#D8D0BD]/70 block text-[10px]">DEFECT DESCRIPTION</span>
                  <p className="text-[#D8D0BD] font-sans leading-relaxed">{squawkCase.defect_description}</p>
                </div>
              </div>

              {/* Resolution Record */}
              {resolution ? (
                <div className="p-4 bg-[rgba(22,28,20,0.85)] border border-[rgba(120,150,106,0.4)] rounded-lg space-y-3 font-mono">
                  <div className="flex items-center justify-between border-b border-[rgba(120,150,106,0.3)] pb-2">
                    <span className="text-xs font-bold text-[#A0C49D] uppercase flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>INCIDENT RESOLUTION ARCHIVE (SYNCED TO VAKH)</span>
                    </span>
                    <span className="text-[10px] text-[#A0C49D]">
                      ID: {resolution.vakh_resolution_id || 'vakh_res_complete'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-[#D8D0BD] block text-[10px]">ACTUAL RECOVERY TIME</span>
                      <strong className="text-white text-sm">{resolution.actual_recovery_time_hours} Hours</strong>
                    </div>
                    <div>
                      <span className="text-[#D8D0BD] block text-[10px]">DELAY LOGGED</span>
                      <strong className="text-white text-sm">{resolution.delay_minutes} Minutes</strong>
                    </div>
                    <div>
                      <span className="text-[#D8D0BD] block text-[10px]">SIGN-OFF LEAD</span>
                      <strong className="text-white">{resolution.resolved_by || 'Chief Inspector'}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[rgba(120,150,106,0.25)]">
                    <span className="text-[#D8D0BD] block text-[10px]">ACTUAL RESOLUTION PERFORMED</span>
                    <p className="text-[#F7F1E4] font-sans leading-relaxed">{resolution.actual_resolution}</p>
                  </div>

                  <div className="pt-2 border-t border-[rgba(120,150,106,0.25)]">
                    <span className="text-[#D8D0BD] block text-[10px]">ROOT CAUSE IDENTIFIED</span>
                    <p className="text-[#F7F1E4] font-sans leading-relaxed">{resolution.root_cause}</p>
                  </div>

                  {resolution.lessons_learned && (
                    <div className="pt-2 border-t border-[rgba(120,150,106,0.25)]">
                      <span className="text-[#D8D0BD] block text-[10px]">LESSONS LEARNED FOR FUTURE ANALYTICS</span>
                      <p className="text-[#F7F1E4] font-sans leading-relaxed">{resolution.lessons_learned}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-[rgba(20,22,17,0.75)] border border-[rgba(217,166,46,0.35)] rounded-lg text-center space-y-2">
                  <span className="text-xs text-[#F0C75E] font-bold block">
                    INCIDENT CURRENTLY ACTIVE IN RECOVERY
                  </span>
                  <p className="text-xs text-[#D8D0BD] font-sans">
                    Once maintenance technician finishes testing and sign-off, click Resolve to record downtime, root cause, and lessons learned.
                  </p>
                  {onOpenResolutionModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenResolutionModal();
                      }}
                      className="px-4 py-2 rounded bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#E2B139] hover:to-[#F7D475] text-[#252820] font-bold text-xs transition cursor-pointer inline-flex items-center space-x-1.5 shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>OPEN RESOLUTION DIALOG</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
