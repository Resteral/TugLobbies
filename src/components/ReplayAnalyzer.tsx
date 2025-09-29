
/**
 * Replay Analyzer Component
 * Handles SC2 replay analysis for Zealot Hockey matches
 */

import { useState } from 'react';
import { Upload, Play, BarChart3, Download, FileText } from 'lucide-react';
import { Button } from './ui/button';

interface ReplayAnalysis {
  fileName: string;
  gameDuration: string;
  players: {
    name: string;
    race: string;
    apm: number;
    result: 'Win' | 'Loss';
  }[];
  matchStats: {
    goals: number[];
    saves: number[];
    shots: number[];
  };
  eloChanges: {
    player1: number;
    player2: number;
  };
}

export default function ReplayAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReplayAnalysis | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.SC2Replay')) {
      setIsAnalyzing(true);
      
      // Simulate analysis process
      setTimeout(() => {
        const mockAnalysis: ReplayAnalysis = {
          fileName: file.name,
          gameDuration: '14:23',
          players: [
            { name: 'ProtossPro', race: 'Protoss', apm: 245, result: 'Win' },
            { name: 'ZealotKing', race: 'Protoss', apm: 218, result: 'Loss' },
          ],
          matchStats: {
            goals: [3, 1],
            saves: [8, 5],
            shots: [15, 12],
          },
          eloChanges: {
            player1: +15,
            player2: -15,
          },
        };
        setAnalysisResult(mockAnalysis);
        setIsAnalyzing(false);
      }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">SC2 Replay Analysis</h2>
        <p className="text-gray-400">Upload StarCraft II replays for automatic Zealot Hockey analysis</p>
      </div>

      {/* Upload Area */}
      <div className="bg-gray-800/30 rounded-xl p-8 border-2 border-dashed border-gray-600 mb-8 text-center">
        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Upload Replay File</h3>
        <p className="text-gray-400 mb-4">Drag & drop your .SC2Replay file or click to browse</p>
        <input
          type="file"
          accept=".SC2Replay"
          onChange={handleFileUpload}
          className="hidden"
          id="replay-upload"
        />
        <Button asChild>
          <label htmlFor="replay-upload" className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Choose Replay File
          </label>
        </Button>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-blue-500/30 mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <div>
              <div className="font-semibold">Analyzing Replay...</div>
              <div className="text-sm text-gray-400">Extracting match data and calculating statistics</div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Match Overview */}
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Match Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-400">File Name</div>
                <div className="font-semibold">{analysisResult.fileName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Game Duration</div>
                <div className="font-semibold">{analysisResult.gameDuration}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Analysis Date</div>
                <div className="font-semibold">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Player Comparison */}
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
              Player Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysisResult.players.map((player, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  player.result === 'Win' 
                    ? 'border-green-500/30 bg-green-500/10' 
                    : 'border-red-500/30 bg-red-500/10'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-lg">{player.name}</div>
                      <div className="text-sm text-gray-400">{player.race} • {player.apm} APM</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      player.result === 'Win' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {player.result}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-2xl font-bold">{analysisResult.matchStats.goals[index]}</div>
                      <div className="text-xs text-gray-400">Goals</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{analysisResult.matchStats.saves[index]}</div>
                      <div className="text-xs text-gray-400">Saves</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{analysisResult.matchStats.shots[index]}</div>
                      <div className="text-xs text-gray-400">Shots</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-center">
                    <div className={`text-sm font-semibold ${
                      analysisResult.eloChanges[`player${index + 1}` as keyof typeof analysisResult.eloChanges] > 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      ELO {analysisResult.eloChanges[`player${index + 1}` as keyof typeof analysisResult.eloChanges] > 0 ? '+' : ''}
                      {analysisResult.eloChanges[`player${index + 1}` as keyof typeof analysisResult.eloChanges]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button variant="outline" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export Analysis
            </Button>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Add to Database
            </Button>
          </div>
        </div>
      )}

      {/* Features List */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4">
          <FileText className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <h4 className="font-bold mb-2">Automatic Parsing</h4>
          <p className="text-gray-400 text-sm">Extracts player stats, goals, and match duration automatically</p>
        </div>
        <div className="text-center p-4">
          <BarChart3 className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h4 className="font-bold mb-2">ELO Calculation</h4>
          <p className="text-gray-400 text-sm">Calculates ELO changes based on match outcome and player ratings</p>
        </div>
        <div className="text-center p-4">
          <Download className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h4 className="font-bold mb-2">CSV Export</h4>
          <p className="text-gray-400 text-sm">Export match data for external analysis and tracking</p>
        </div>
      </div>
    </div>
  );
}
