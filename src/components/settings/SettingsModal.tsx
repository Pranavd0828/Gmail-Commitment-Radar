import React from 'react';
import { useStore } from '../../store/useStore';
import { X } from 'lucide-react';
import { seedDemoState } from '../../utils/seedDemoState';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetDemoData } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-md max-h-[90vh] sm:max-h-none overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Commitment Radar Settings</h2>
          <button className="p-1 hover:bg-gray-100 rounded-full" onClick={onClose}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-grow">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Detection & Display</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Show badges in inbox rows</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.showInboxBadges}
                    onChange={(e) => updateSettings({ showInboxBadges: e.target.checked })}
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gmail-blue"></div>
                </div>
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Show low-confidence items in Review</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.showLowConfidenceReview}
                    onChange={(e) => updateSettings({ showLowConfidenceReview: e.target.checked })}
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gmail-blue"></div>
                </div>
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Filter out automated emails and newsletters</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.filterAutomated}
                    onChange={(e) => updateSettings({ filterAutomated: e.target.checked })}
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gmail-blue"></div>
                </div>
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Management</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Hide completed commitments</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.clearCompleted}
                    onChange={(e) => updateSettings({ clearCompleted: e.target.checked })}
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gmail-blue"></div>
                </div>
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-wide mb-3">Danger Zone</h3>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  resetDemoData();
                  const state = useStore.getState();
                  seedDemoState(state.setThreads, state.setCommitments);
                }}
                className="px-4 py-2 border border-red-200 text-red-600 rounded text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Reset Demo Data
              </button>
              <p className="text-xs text-gray-500">Wipes all stored modifications and runs the initial AI simulation again.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button 
            className="px-4 py-2 bg-gmail-blue text-white rounded text-sm font-medium hover:bg-blue-700"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
