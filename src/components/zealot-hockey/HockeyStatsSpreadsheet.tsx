/**
 * Comprehensive hockey statistics spreadsheet for all imported data
 */

import React, { useState } from 'react';
import { HockeyPlayerStats } from '../../types/hockey-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Download, Search, Filter, ArrowUpDown } from 'lucide-react';

interface HockeyStatsSpreadsheetProps {
  stats: HockeyPlayerStats[];
}

export const HockeyStatsSpreadsheet: React.FC<HockeyStatsSpreadsheetProps> = ({ stats }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('points');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterTeam, setFilterTeam] = useState<string>('all');

  if (stats.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Statistics Data</h3>
          <p className="text-gray-400">Import hockey statistics to view the spreadsheet</p>
        </CardContent>
      </Card>
    );
  }

  // Get unique teams for filter
  const teams = [...new Set(stats.map(stat => stat.team))].sort();

  // Process and filter data
  const processedStats = stats.map(stat => ({
    ...stat,
    shootingPercentage: stat.shootingPercentage || (stat.shots > 0 ? (stat.goals / stat.shots) * 100 : 0),
    savePercentage: stat.savePercentage || (stat.shotsAllowed > 0 ? (stat.saves / stat.shotsAllowed) * 100 : 0),
    passCompletion: stat.passCompletion || (stat.passes > 0 ? (stat.passesReceived / stat.passes) * 100 : 0),
    points: stat.points || (stat.goals + stat.assists)
  }));

  // Filter and sort data
  const filteredStats = processedStats.filter(stat => {
    const matchesSearch = stat.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stat.accountId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = filterTeam === 'all' || stat.team === filterTeam;
    return matchesSearch && matchesTeam;
  });

  const sortedStats = [...filteredStats].sort((a, b) => {
    const aValue = a[sortField as keyof HockeyPlayerStats] as number;
    const bValue = b[sortField as keyof HockeyPlayerStats] as number;
    
    if (sortDirection === 'asc') {
      return (aValue || 0) - (bValue || 0);
    } else {
      return (bValue || 0) - (aValue || 0);
    }
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return (
      <ArrowUpDown className={`w-3 h-3 ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
    );
  };

  const exportToCSV = () => {
    const headers = [
      'Team', 'Player', 'Account ID', 'Goals', 'Assists', 'Points', 
      'Shots', 'Shooting %', 'Pickups', 'Passes', 'Passes Received', 'Pass %',
      'Possession Time', 'Shots Allowed', 'Saves', 'Save %', 'Goalie Time', 'Skater Time'
    ];

    const csvData = processedStats.map(stat => [
      stat.team,
      stat.handle,
      stat.accountId,
      stat.goals.toString(),
      stat.assists.toString(),
      (stat.goals + stat.assists).toString(),
      stat.shots.toString(),
      (stat.shootingPercentage || 0).toFixed(1),
      stat.pickups.toString(),
      stat.passes.toString(),
      stat.passesReceived.toString(),
      (stat.passCompletion || 0).toFixed(1),
      `${Math.floor(stat.possession / 60)}m ${stat.possession % 60}s`,
      stat.shotsAllowed.toString(),
      stat.saves.toString(),
      (stat.savePercentage || 0).toFixed(1),
      `${Math.floor(stat.goaltenderTime / 60)}m ${stat.goaltenderTime % 60}s`,
      `${Math.floor(stat.skaterTime / 60)}m ${stat.skaterTime % 60}s`
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hockey-stats-spreadsheet.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <th 
      className="p-3 text-left cursor-pointer hover:bg-gray-700 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {children}
        {getSortIcon(field)}
      </div>
    </th>
  );

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <CardTitle className="text-white flex items-center space-x-2">
              <Download className="w-5 h-5 text-green-400" />
              <span>Hockey Statistics Spreadsheet</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Comprehensive view of all player statistics with sorting and filtering
            </CardDescription>
          </div>
          <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search players or account IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Teams</option>
            {teams.map(team => (
              <option key={team} value={team}>Team {team}</option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400 text-sm">
            Showing {sortedStats.length} of {stats.length} records
          </span>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Filter className="w-4 h-4" />
            <span>Sorted by: {sortField} ({sortDirection})</span>
          </div>
        </div>

        {/* Spreadsheet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                <SortableHeader field="handle">
                  <span className="text-gray-400 font-semibold">Player</span>
                </SortableHeader>
                <SortableHeader field="team">
                  <span className="text-gray-400 font-semibold">Team</span>
                </SortableHeader>
                <SortableHeader field="goals">
                  <span className="text-gray-400 font-semibold">G</span>
                </SortableHeader>
                <SortableHeader field="assists">
                  <span className="text-gray-400 font-semibold">A</span>
                </SortableHeader>
                <SortableHeader field="points">
                  <span className="text-gray-400 font-semibold">PTS</span>
                </SortableHeader>
                <SortableHeader field="shots">
                  <span className="text-gray-400 font-semibold">SHT</span>
                </SortableHeader>
                <SortableHeader field="shootingPercentage">
                  <span className="text-gray-400 font-semibold">SHT%</span>
                </SortableHeader>
                <SortableHeader field="pickups">
                  <span className="text-gray-400 font-semibold">PICK</span>
                </SortableHeader>
                <SortableHeader field="passCompletion">
                  <span className="text-gray-400 font-semibold">PASS%</span>
                </SortableHeader>
                <SortableHeader field="possession">
                  <span className="text-gray-400 font-semibold">POS</span>
                </SortableHeader>
                <SortableHeader field="savePercentage">
                  <span className="text-gray-400 font-semibold">SAVE%</span>
                </SortableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map((stat, index) => (
                <tr 
                  key={`${stat.accountId}-${index}`} 
                  className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="p-3">
                    <div>
                      <div className="text-white font-medium">{stat.handle}</div>
                      <div className="text-gray-400 text-xs">{stat.accountId}</div>
                    </div>
                  </td>
                  <td className="p-3 text-gray-400">{stat.team}</td>
                  <td className="p-3 text-green-400 font-bold text-center">{stat.goals}</td>
                  <td className="p-3 text-blue-400 font-bold text-center">{stat.assists}</td>
                  <td className="p-3 text-yellow-400 font-bold text-center">{stat.points || stat.goals + stat.assists}</td>
                  <td className="p-3 text-white text-center">{stat.shots}</td>
                  <td className="p-3 text-purple-400 text-center">
                    {(stat.shootingPercentage || 0).toFixed(1)}%
                  </td>
                  <td className="p-3 text-white text-center">{stat.pickups}</td>
                  <td className="p-3 text-cyan-400 text-center">
                    {(stat.passCompletion || 0).toFixed(1)}%
                  </td>
                  <td className="p-3 text-orange-400 text-center">
                    {Math.floor(stat.possession / 60)}m
                  </td>
                  <td className="p-3 text-green-400 text-center">
                    {stat.savePercentage ? `${stat.savePercentage.toFixed(1)}%` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        {sortedStats.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Math.round(sortedStats.reduce((sum, stat) => sum + (stat.points || 0), 0) / sortedStats.length)}
              </div>
              <div className="text-sm text-gray-400">Avg Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Math.round(sortedStats.reduce((sum, stat) => sum + (stat.shootingPercentage || 0), 0) / sortedStats.length)}%
              </div>
              <div className="text-sm text-gray-400">Avg Shot %</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Math.round(sortedStats.reduce((sum, stat) => sum + (stat.passCompletion || 0), 0) / sortedStats.length)}%
              </div>
              <div className="text-sm text-gray-400">Avg Pass %</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Math.round(sortedStats.reduce((sum, stat) => sum + stat.possession, 0) / sortedStats.length / 60)}m
              </div>
              <div className="text-sm text-gray-400">Avg Possession</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};