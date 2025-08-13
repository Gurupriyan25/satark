import React from 'react';
import { Users, Activity, CheckCircle, AlertTriangle, Camera, FileText, Upload } from 'lucide-react';
import OCRScanner from './OCRScanner';

interface AgentDashboardProps {
  // Add props as needed
}

const AgentDashboard: React.FC<AgentDashboardProps> = () => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'ocr'>('overview');

  const handleTextExtracted = (text: string, confidence: number) => {
    console.log('Text extracted:', text, 'Confidence:', confidence);
    // Here you would typically send this data to your backend
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Field Agent Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your surveys and scan documents</p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Live Status</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('ocr')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'ocr'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>Document Scanner</span>
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Assigned Surveys</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Documents Processed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">23</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                  <Camera className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Survey AIS-2024-03 completed</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Tamil document processed with PaddleOCR</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                    <Upload className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">New survey assignment received</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ocr' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <OCRScanner mode="agent" onTextExtracted={handleTextExtracted} />
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;