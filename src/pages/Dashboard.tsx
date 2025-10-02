/**
 * Dashboard page with comprehensive hockey statistics and matchmaking data
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { HockeyStatsDashboard } from '../components/zealot-hockey/HockeyStatsDashboard';
import { HockeyStatsSpreadsheet } from '../components/zealot-hockey/HockeyStatsSpreadsheet';
import { GameStatsAggregator } from '../components/zealot-hockey/GameStatsAggregator';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Hockey Statistics Dashboard</h1>
          <p className="text-gray-300">
            Comprehensive analytics and matchmaking statistics for hockey gameplay
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 p-1 rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="leaderboard" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Leaderboard
            </TabsTrigger>
            <TabsTrigger 
              value="statistics" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Statistics
            </TabsTrigger>
            <TabsTrigger 
              value="matchmaking" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Matchmaking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <HockeyStatsDashboard />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Hockey Leaderboard</CardTitle>
                <CardDescription className="text-gray-400">
                  Player rankings based on matchmaking performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-gray-300 p-8 text-center">
                  <p>Leaderboard component will be displayed here</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Sorting by goals, assists, steals, and other hockey statistics
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <HockeyStatsSpreadsheet />
          </TabsContent>

          <TabsContent value="matchmaking" className="space-y-6">
            <GameStatsAggregator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}