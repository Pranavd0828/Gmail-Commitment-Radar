import React from 'react';
import { useStore } from '../../store/useStore';

export const Snackbar: React.FC = () => {
  const { snackbar, hideSnackbar } = useStore();

  if (!snackbar.isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
      <div className="bg-gray-800 text-white px-4 py-3 rounded shadow-lg flex items-center space-x-4">
        <span className="text-sm font-medium">{snackbar.message}</span>
        {snackbar.onUndo && (
          <button 
            onClick={() => {
              snackbar.onUndo?.();
              hideSnackbar();
            }}
            className="text-gmail-blue hover:text-blue-300 text-sm font-bold uppercase tracking-wide transition-colors"
          >
            Undo
          </button>
        )}
        <button 
          onClick={hideSnackbar}
          className="text-gray-400 hover:text-white p-1"
        >
          &times;
        </button>
      </div>
    </div>
  );
};
