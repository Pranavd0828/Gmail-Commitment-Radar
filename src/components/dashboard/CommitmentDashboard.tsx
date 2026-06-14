import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { CommitmentCard } from '../radar/CommitmentCard';
import { Search, Filter, CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import { SIMULATED_CURRENT_DATE } from '../../data/mockData';
import { applyCommitmentVisibilitySettings } from '../../utils/filterHelpers';

export const CommitmentDashboard: React.FC = () => {
  const { commitments, settings, threads } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('risk');
  
  let openCommitments = applyCommitmentVisibilitySettings(commitments, threads, settings);
  openCommitments = openCommitments.filter(c => c.status !== 'Dismissed');

  // Dynamic Summaries
  const dueToday = openCommitments.filter(c => c.due_date_text?.toLowerCase().includes('today') || c.due_date_text?.toLowerCase().includes('hours')).length;
  const overdue = openCommitments.filter(c => {
    if (!c.due_date) return false;
    return new Date(c.due_date).getTime() < new Date(SIMULATED_CURRENT_DATE).getTime();
  }).length;
  const waiting = openCommitments.filter(c => c.type === 'Waiting on someone else').length;
  const needsReview = openCommitments.filter(c => c.status === 'Review').length;

  // Search & Sort Logic
  let filteredCommitments = openCommitments;
  
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredCommitments = filteredCommitments.filter(c => 
      c.normalized_action.toLowerCase().includes(q) || 
      c.recipient_name.toLowerCase().includes(q) ||
      c.source_phrase.toLowerCase().includes(q)
    );
  }
  
  if (settings.clearCompleted) {
    filteredCommitments = filteredCommitments.filter(c => c.status !== 'Done');
  }

  filteredCommitments.sort((a, b) => {
    if (sortOption === 'risk') {
      const riskScores = { High: 3, Medium: 2, Low: 1, None: 0 };
      return riskScores[b.risk_level] - riskScores[a.risk_level];
    } else if (sortOption === 'confidence') {
      return b.confidence_score - a.confidence_score;
    }
    return 0; // fallback
  });

  return (
    <div className="flex flex-col flex-grow m-2 bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Dashboard Header */}
      <div className="px-4 py-4 md:px-8 md:py-6 border-b border-gray-100 flex-shrink-0">
        <h1 className="text-xl md:text-2xl font-normal text-gray-900 mb-2">Commitment Radar</h1>
        <p className="text-gray-500 text-sm">Track promises, asks, and follow-ups across your inbox.</p>
        
        <div className="mt-4 md:mt-6 flex flex-col md:flex-row md:items-center max-w-2xl gap-3 md:gap-0">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search commitments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gmail-blue focus:bg-white"
            />
          </div>
          <button className="md:ml-3 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 flex items-center justify-center hover:bg-gray-50 w-full md:w-auto">
            <Filter size={16} className="mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 py-4 md:px-8 md:py-4 border-b border-gray-100 grid grid-cols-2 md:flex gap-3 md:gap-4 flex-shrink-0 bg-white">
        <div className="flex-1 flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mr-3">
            <Clock size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xl font-medium text-gray-900 leading-tight">{dueToday}</p>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Due today</h3>
          </div>
        </div>
        <div className="flex-1 flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mr-3">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-xl font-medium text-gray-900 leading-tight">{overdue}</p>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Overdue</h3>
          </div>
        </div>
        <div className="flex-1 flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
            <Clock size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xl font-medium text-gray-900 leading-tight">{waiting}</p>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Waiting</h3>
          </div>
        </div>
        <div className="flex-1 flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mr-3">
            <CheckSquare size={18} className="text-purple-500" />
          </div>
          <div>
            <p className="text-xl font-medium text-gray-900 leading-tight">{needsReview}</p>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Review</h3>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="flex-grow overflow-y-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-3 sm:gap-0">
          <h2 className="text-lg font-medium text-gray-800">All Open Commitments</h2>
          <select 
            className="text-sm border-gray-300 rounded-md text-gray-600 outline-none p-1"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="risk">Sort by: Risk</option>
            <option value="confidence">Sort by: Confidence</option>
          </select>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {filteredCommitments.length > 0 ? (
            filteredCommitments.map(commitment => (
              <CommitmentCard key={commitment.id} commitment={commitment} />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              No commitments found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
