import React from 'react';
import { Users, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

interface AgentDashboardProps {
  // Add props as needed
}

const AgentDashboard: React.FC<AgentDashboardProps> = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Agent Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">Live Status</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Agents</p>
              <p className="text-2xl font-bold text-blue-900">0</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Agents</p>
              <p className="text-2xl font-bold text-green-900">0</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-yellow-900">0</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Completed</p>
              <p className="text-2xl font-bold text-purple-900">0</p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-gray-500">
          Agent dashboard component is ready for implementation.
        </p>
      </div>
    </div>
  );
};

export default AgentDashboard;