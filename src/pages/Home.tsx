/**
 * Home page component - Landing page with navigation to main features
 */
import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Trophy, Users, BarChart3, Upload, Play } from 'lucide-react';

export default function Home() {
  const handleNavigation = (path: string) => {
    window.location.hash = `#/${path}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Zealot <span className="text-blue-400">Hockey</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Advanced statistics, matchmaking, and tournament management for competitive hockey gaming
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg" 
              onClick={() => handleNavigation('dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="w-5 h-5 mr-2" />
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => handleNavigation('tournaments')}
              className="bg-transparent border-white text-white hover:bg-white hover:text-slate-900"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Tournaments
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Statistics Dashboard */}
          <Card className="bg-gray-900/50 border-gray-700 hover:border-blue-500 transition-all duration-300">
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-blue-400 mb-2" />
              <CardTitle className="text-white">Advanced Analytics</CardTitle>
              <CardDescription className="text-gray-400">
                Track player performance with detailed statistics and ELO rankings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleNavigation('dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                View Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Matchmaking */}
          <Card className="bg-gray-900/50 border-gray-700 hover:border-green-500 transition-all duration-300">
            <CardHeader>
              <Users className="w-10 h-10 text-green-400 mb-2" />
              <CardTitle className="text-white">Matchmaking</CardTitle>
              <CardDescription className="text-gray-400">
                Join competitive queues and find opponents at your skill level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleNavigation('dashboard')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Find Match
              </Button>
            </CardContent>
          </Card>

          {/* Tournament Hosting */}
          <Card className="bg-gray-900/50 border-gray-700 hover:border-purple-500 transition-all duration-300">
            <CardHeader>
              <Trophy className="w-10 h-10 text-purple-400 mb-2" />
              <CardTitle className="text-white">Tournaments</CardTitle>
              <CardDescription className="text-gray-400">
                Create and manage competitive tournaments with bracket systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleNavigation('host')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Host Tournament
              </Button>
            </CardContent>
          </Card>

          {/* Statistics Import */}
          <Card className="bg-gray-900/50 border-gray-700 hover:border-orange-500 transition-all duration-300">
            <CardHeader>
              <Upload className="w-10 h-10 text-orange-400 mb-2" />
              <CardTitle className="text-white">Import Stats</CardTitle>
              <CardDescription className="text-gray-400">
                Upload CSV files or paste data to import player statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleNavigation('dashboard')}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Import Data
              </Button>
            </CardContent>
          </Card>

          {/* Leaderboards */}
          <Card className="bg-gray-900/50 border-gray-700 hover:border-yellow-500 transition-all duration-300">
            <CardHeader>
              <Trophy className="w-10 h-10 text-yellow-400 mb-2" />
              <CardTitle className="text-white">Leaderboards</CardTitle>
              <CardDescription className="text-gray-400">
                View top players and team rankings across multiple metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleNavigation('tournaments')}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                View Rankings
              </Button>
            </CardContent>
          </Card>

          {/* Replay Analysis */}
          <Card className="bg-gray-900/50 border-gray-700 hover:border-red-500 transition-all duration-300">
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-red-400 mb-2" />
              <CardTitle className="text-white">Replay Analysis</CardTitle>
              <CardDescription className="text-gray-400">
                Analyze game replays for strategic insights and improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleNavigation('dashboard')}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Analyze Games
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}