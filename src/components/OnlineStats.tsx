import React from 'react';
import { Users, MessageSquare } from 'lucide-react';
import { Stats } from '../types';

interface OnlineStatsProps {
  stats: Stats;
}

export default function OnlineStats({ stats }: OnlineStatsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Live Stats</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span className="text-gray-600">Online Users</span>
          </div>
          <span className="text-lg font-semibold text-blue-600">{stats.onlineUsers}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-green-500" />
            <span className="text-gray-600">Active Chats</span>
          </div>
          <span className="text-lg font-semibold text-green-600">{stats.activeChats}</span>
        </div>
      </div>
    </div>
  );
}