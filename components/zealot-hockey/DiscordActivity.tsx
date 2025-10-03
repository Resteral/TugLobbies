/**
 * Discord Activity Component for Zealot Hockey
 * Shows Discord integration status and activity
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { MessageCircle, Users, Gamepad2, Clock, ChevronDown, CheckCircle, XCircle } from 'lucide-react';

export const DiscordActivity: React.FC = () => {
  const [selectedActivityType, setSelectedActivityType] = useState<string>('all');
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'playing', label: 'Playing' },
    { value: 'queued', label: 'In Queue' },
    { value: 'spectating', label: 'Spectating' }
  ];

  const mockActivities = [
    {
      id: '1',
      playerName: 'ProPlayer1',
      activity: 'playing',
      game: 'Zealot Hockey 1v1',
      status: 'In Match',
      duration: '12:45',
      spectators: 3
    },
    {
      id: '2',
      playerName: 'ZealotMaster',
      activity: 'queued',
      game: 'Zealot Hockey 2v2',
      status: 'Waiting for players',
      duration: '05:23',
      spectators: 0
    },
    {
      id: '3',
      playerName: 'HockeyChamp',
      activity: 'spectating',
      game: 'Zealot Hockey 1v1',
      status: 'Watching match',
      duration: '08:17',
      spectators: 1
    },
    {
      id: '4',
      playerName: 'StarCraftPro',
      activity: 'playing',
      game: 'Zealot Hockey 3v3',
      status: 'In Match',
      duration: '15:32',
      spectators: 2
    }
  ];

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'playing': return 'text-green-400';
      case 'queued': return 'text-yellow-400';
      case 'spectating': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'playing': return <Gamepad2 className="w-4 h-4" />;
      case 'queued': return <Clock className="w-4 h-4" />;
      case 'spectating': return <Users className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const handleActivityTypeChange = (value: string) => {
    setSelectedActivityType(value);
    setShowActivityDropdown(false);
  };

  const filteredActivities = selectedActivityType === 'all' 
    ? mockActivities 
    : mockActivities.filter(activity => activity.activity === selectedActivityType);

  return (
    <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-700 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div>Discord Activity</div>
              <CardDescription className="text-indigo-200">
                Real-time player activities and status
              </CardDescription>
            </div>
          </div>
          
          {/* Activity Type Filter Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              className="bg-transparent border-indigo-600 text-indigo-300 hover:bg-indigo-700"
              onClick={() => setShowActivityDropdown(!showActivityDropdown)}
            >
              {activityTypes.find(type => type.value === selectedActivityType)?.label}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            
            {showActivityDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-indigo-800 border border-indigo-600 rounded-lg shadow-lg z-10">
                {activityTypes.map((type) => (
                  <div
                    key={type.value}
                    className="px-4 py-2 hover:bg-indigo-700 cursor-pointer text-indigo-300"
                    onClick={() => {
                      handleActivityTypeChange(type.value);
                      setShowActivityDropdown(false);
                    }}
                  >
                    {type.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="bg-indigo-800/30 rounded-xl p-4 border border-indigo-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-white font-semibold">Discord Connected</div>
                <div className="text-indigo-300 text-sm">Rich presence active</div>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600">
              Online
            </Badge>
          </div>
          <Progress value={100} className="h-2 bg-indigo-900/50" />
          <div className="flex justify-between text-sm text-indigo-300 mt-2">
            <span>Activity Sync</span>
            <span>100%</span>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 rounded-lg bg-indigo-800/30 border border-indigo-700/50 hover:bg-indigo-700/30 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg bg-indigo-700/50 ${getActivityColor(activity.activity)}`}>
                  {getActivityIcon(activity.activity)}
                </div>
                <div>
                  <div className="text-white font-semibold">{activity.playerName}</div>
                  <div className="text-indigo-300 text-sm">{activity.game}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-medium ${getActivityColor(activity.activity)}`}>
                  {activity.status}
                </div>
                <div className="flex items-center space-x-4 text-xs text-indigo-400 mt-1">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{activity.duration}</span>
                  </div>
                  {activity.spectators > 0 && (
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{activity.spectators}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Start Activity
          </Button>
          <Button variant="outline" className="bg-transparent border-indigo-600 text-indigo-300 hover:bg-indigo-600 hover:text-white">
            <Users className="w-4 h-4 mr-2" />
            Invite Friends
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-indigo-700/50">
          <div className="text-center">
            <div className="text-white font-bold text-lg">{mockActivities.length}</div>
            <div className="text-indigo-300 text-sm">Active</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-lg">
              {mockActivities.filter(a => a.activity === 'playing').length}
            </div>
            <div className="text-indigo-300 text-sm">Playing</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-lg">
              {mockActivities.reduce((acc, activity) => acc + activity.spectators, 0)}
            </div>
            <div className="text-indigo-300 text-sm">Spectators</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};