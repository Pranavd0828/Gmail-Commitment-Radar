import React, { useEffect } from 'react';
import { Target, X, MoreVertical } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CommitmentCard } from './CommitmentCard';
import { applyCommitmentVisibilitySettings, filterCommitmentsByRadarChip } from '../../utils/filterHelpers';
import { SIMULATED_CURRENT_DATE } from '../../data/mockData';

export const RadarPanel: React.FC = () => {
  const { ui, setPanelOpen, setActiveFilter, commitments, settings, threads } = useStore();

  // Handle Escape key to close panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && ui.panelOpen) {
        setPanelOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ui.panelOpen, setPanelOpen]);

  if (!ui.panelOpen) return null;
  
  const filters = ['All', 'You owe', 'They owe', 'Due today', 'Overdue', 'Review', 'Done'];

  // 1. Calculate Base Visibility
  // Hides automated and low-confidence review based on settings.
  // We ignore `clearCompleted` when the active filter is 'Done' so the user can still view them.
  const activeSettings = ui.activeFilter === 'Done' ? { ...settings, clearCompleted: false } : settings;
  const baseVisibleCommitments = applyCommitmentVisibilitySettings(commitments, threads, activeSettings);
  
  // Panel strictly focuses on Open/Review items
  const attentionCommitments = baseVisibleCommitments.filter(c => c.status === 'Open' || c.status === 'Review');

  // 2. Derive Summary Counts from the attention pool
  const dueToday = attentionCommitments.filter(c => c.due_date_text?.toLowerCase().includes('today') || c.due_date_text?.toLowerCase().includes('hours')).length;
  const overdue = attentionCommitments.filter(c => c.due_date && new Date(c.due_date).getTime() < new Date(SIMULATED_CURRENT_DATE).getTime()).length;
  const waiting = attentionCommitments.filter(c => c.type === 'Waiting on someone else').length;

  // The pool to filter from depends on the active chip
  const chipSource = ui.activeFilter === 'Done' ? baseVisibleCommitments : attentionCommitments;

  // 3. Search Filtering
  let searchableCommitments = chipSource;
  if (ui.searchQuery) {
    const q = ui.searchQuery.toLowerCase();
    searchableCommitments = searchableCommitments.filter(c => 
      c.normalized_action.toLowerCase().includes(q) || 
      c.owner_name.toLowerCase().includes(q) ||
      c.recipient_name.toLowerCase().includes(q)
    );
  }

  // Active Chip Filter
  const finalCommitments = filterCommitmentsByRadarChip(searchableCommitments, ui.activeFilter);



  return (
    <div 
      className="fixed inset-0 z-50 w-full h-full md:relative md:inset-auto md:z-10 md:w-[380px] md:h-auto bg-white md:border-l border-gmail-divider flex flex-col flex-shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]"
      role="dialog"
      aria-modal="true"
      aria-label="Commitment Radar panel"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
        <div className="flex items-center">
          <Target size={20} className="text-ai-accent mr-2" />
          <h2 className="text-base font-medium text-gray-800">Commitment Radar</h2>
        </div>
        <div className="flex space-x-1">
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full" aria-label="More options"><MoreVertical size={18} /></button>
          <button 
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"
            onClick={() => setPanelOpen(false)}
            aria-label="Close Radar panel"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Top Status */}
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 flex justify-between border-b border-gray-100">
        <span>{attentionCommitments.length} need attention</span>
        <span>Last scanned just now</span>
      </div>

      <div className="flex-grow overflow-y-auto">
        {/* Today Summary */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Today</h3>
          <p className="text-sm text-gray-700">
            {attentionCommitments.length} open · {dueToday} due today · {overdue} overdue · {waiting} waiting
          </p>
        </div>

        {/* Filter Chips */}
        <div className="px-4 py-3 flex flex-nowrap md:flex-wrap gap-2 border-b border-gray-100 overflow-x-auto">
          {filters.map(filter => (
            <button
              key={filter}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                ui.activeFilter === filter 
                  ? 'bg-gmail-nav-selected text-gmail-blue border border-transparent' 
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Commitment Cards */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
          {finalCommitments.length > 0 ? (
            finalCommitments.map(commitment => (
              <CommitmentCard 
                key={commitment.id} 
                commitment={commitment} 
                expanded={commitment.id === ui.selectedCommitmentId} 
              />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3">
                <Target size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-800 font-medium mb-1">You are all caught up.</p>
              <p className="text-sm text-gray-500">No commitments found for this view.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
