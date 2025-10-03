/**
 * Tournaments listing page component
 */
import React from 'react';
import { useNavigate } from 'react-router';

/**
 * Tournaments page component for browsing and managing tournaments
 */
export default function Tournaments() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Tournaments</h1>
            <p className="text-purple-200 mt-2">Browse and join hockey tournaments</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/host')}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Host Tournament
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-8 border border-purple-500/30">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏒</div>
            <h2 className="text-2xl font-bold mb-4">No Tournaments Available</h2>
            <p className="text-purple-200 mb-6">
              Be the first to create a hockey tournament and start the competition!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/host')}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create Tournament
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}