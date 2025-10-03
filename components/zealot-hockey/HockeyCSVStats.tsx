/**
 * Hockey CSV Stats Component
 * Displays CSV-based hockey statistics without Select components
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Download, Upload, BarChart3 } from 'lucide-react';

export const HockeyCSVStats: React.FC = () => {
  const sampleStats = [
    { team: 'Red', player: 'ZealotMaster', goals: 8, assists: 6, steals: 5, shots: 15 },
    { team: 'Blue', player: 'HockeyPro', goals: 5, assists: 8, steals: 3, shots: 12 },
    { team: 'Red', player: 'GoalGuardian', goals: 1, assists: 3, steals: 2, shots: 4 }
  ];

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span>CSV Hockey Statistics</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Import and analyze hockey matchmaking data from CSV files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">14</div>
            <div className="text-gray-400 text-sm">Total Goals</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">17</div>
            <div className="text-gray-400 text-sm">Total Assists</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">10</div>
            <div className="text-gray-400 text-sm">Total Steals</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">31</div>
            <div className="text-gray-400 text-sm">Total Shots</div>
          </div>
        </div>

        {/* Sample Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Team</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Player</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Goals</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Assists</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Steals</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Shots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sampleStats.map((stat, index) => (
                <tr key={index} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <Badge className={stat.team === 'Red' ? 'bg-red-600' : 'bg-blue-600'}>
                      {stat.team}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{stat.player}</td>
                  <td className="px-4 py-3 text-yellow-400 font-bold">{stat.goals}</td>
                  <td className="px-4 py-3 text-blue-400 font-bold">{stat.assists}</td>
                  <td className="px-4 py-3 text-green-400 font-bold">{stat.steals}</td>
                  <td className="px-4 py-3 text-white">{stat.shots}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CSV Format Info */}
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
          <h4 className="text-white font-semibold mb-3">Required CSV Format</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400 mb-2">Basic Columns:</div>
              <ul className="text-gray-300 space-y-1">
                <li>• team (Red/Blue)</li>
                <li>• handle (Player name)</li>
                <li>• goals (number)</li>
                <li>• assists (number)</li>
                <li>• steals (number)</li>
              </ul>
            </div>
            <div>
              <div className="text-gray-400 mb-2">Advanced Columns:</div>
              <ul className="text-gray-300 space-y-1">
                <li>• shots (number)</li>
                <li>• pickups (number)</li>
                <li>• passes (number)</li>
                <li>• possession (seconds)</li>
                <li>• saves (number)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};