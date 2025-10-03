/**
 * Home page component
 * Main landing page for TUG Lobbies
 */

import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Trophy, Users, Gamepad2, BarChart3, MessageCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Trophy,
      title: 'Tournaments',
      description: 'Compete in organized tournaments with prize pools',
      color: 'from-yellow-500 to-orange-500',
      onClick: () => navigate('/tournaments')
    },
    {
      icon: Users,
      title: 'Matchmaking',
      description: 'Find opponents with similar skill levels',
      color: 'from-blue-500 to-cyan-500',
      onClick: () => navigate('/dashboard')
    },
    {
      icon: Gamepad2,
      title: 'Lobby System',
      description: 'Create and join custom game lobbies',
      color: 'from-green-500 to-emerald-500',
      onClick: () => navigate('/dashboard')
    },
    {
      icon: BarChart3,
      title: 'Statistics',
      description: 'Track your performance and rankings',
      color: 'from-purple-500 to-pink-500',
      onClick: () => navigate('/dashboard')
    },
    {
      icon: MessageCircle,
      title: 'Discord Integration',
      description: 'Connect with Discord for rich presence',
      color: 'from-indigo-500 to-purple-500',
      onClick: () => navigate('/dashboard')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          TUG Lobbies
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Advanced matchmaking and tournament platform for StarCraft II and Zealot Hockey
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
          >
            Get Started
          </Button>
          <Button 
            onClick={() => navigate('/tournaments')}
            variant="outline"
            className="bg-transparent border-purple-600 text-purple-300 hover:bg-purple-600 hover:text-white px-8 py-3 text-lg"
          >
            View Tournaments
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-gray-800/30 border-gray-700 hover:border-gray-500 transition-colors cursor-pointer"
              onClick={feature.onClick}
            >
              <CardHeader>
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
                <CardDescription className="text-gray-400">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <Card className="bg-blue-900/20 border-blue-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-400">1,247</div>
              <div className="text-blue-300 text-sm">Active Players</div>
            </CardContent>
          </Card>
          <Card className="bg-green-900/20 border-green-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-400">42</div>
              <div className="text-green-300 text-sm">Tournaments</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-900/20 border-purple-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-400">8,956</div>
              <div className="text-purple-300 text-sm">Matches Played</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-900/20 border-yellow-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-400">$2,580</div>
              <div className="text-yellow-300 text-sm">Prize Pool</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}