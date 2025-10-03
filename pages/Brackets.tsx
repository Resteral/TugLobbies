/**
 * Tournament brackets page component
 */
import React from 'react';
import { useNavigate } from 'react-router';

/**
 * Brackets page component for displaying tournament brackets
 */
export default function Brackets() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Tournament Brackets</h1>
            <p className="text-purple-200 mt-2">View and manage tournament brackets</p>
          </div>
          <button
            onClick={() => navigate('/tournaments')}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Tournaments
          </button>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-8 border border-purple-500/30">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold mb-4">No Tournament Selected</h2>
            <p className="text-purple-200 mb-6">
              Select a tournament from the tournaments page to view its brackets
            </p>
            <button
              onClick={() => navigate('/tournaments')}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Tournaments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}