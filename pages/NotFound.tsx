/**
 * 404 Not Found page component
 * Handles unknown routes
 */

import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  const quickActions = [
    {
      label: 'Go Home',
      description: 'Return to the main page',
      icon: Home,
      onClick: () => navigate('/'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Back',
      description: 'Go back to previous page',
      icon: ArrowLeft,
      onClick: () => window.history.back(),
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Browse Tournaments',
      description: 'Explore available tournaments',
      icon: Search,
      onClick: () => navigate('/tournaments'),
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/30 border-gray-700">
        <CardHeader className="text-center">
          <div className="text-6xl font-bold text-purple-400 mb-4">404</div>
          <CardTitle className="text-2xl text-white">Page Not Found</CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                className="w-full justify-start bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600"
              >
                <div className={`w-8 h-8 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mr-3`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">{action.label}</div>
                  <div className="text-gray-400 text-xs">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Help Text */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
            <p className="text-blue-300 text-sm text-center">
              If you believe this is an error, please contact support or check the URL for typos.
            </p>
          </div>

          {/* Search Suggestion */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Looking for something specific?</p>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="bg-transparent border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}