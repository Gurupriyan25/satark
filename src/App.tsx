import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SurveyDesigner from './components/SurveyDesigner';
import AgentManagement from './components/AgentManagement';
import AgentDashboard from './components/AgentDashboard';
import SatarkCopilot from './components/SatarkCopilot';
import OCRManagement from './components/OCRManagement';
import DataValidation from './components/DataValidation';
import { Bot } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [copilotOpen, setCopilotOpen] = useState(false);

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'survey-designer':
        return <SurveyDesigner />;
      case 'agent-management':
        return <AgentManagement />;
      case 'response-tracker':
        return (
          <div className="p-6 flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Response Tracker</h2>
              <p className="text-gray-600 dark:text-gray-400">Coming soon - Track citizen responses across all channels</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-6 flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Real-Time Analytics</h2>
              <p className="text-gray-600 dark:text-gray-400">Coming soon - Advanced analytics and insights</p>
            </div>
          </div>
        );
      case 'data-quality':
        return <DataValidation />;
      case 'reporting':
        return (
          <div className="p-6 flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reporting & Exports</h2>
              <p className="text-gray-600 dark:text-gray-400">Coming soon - Comprehensive reporting suite</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6 flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings & Compliance</h2>
              <p className="text-gray-600 dark:text-gray-400">Coming soon - System configuration and compliance</p>
            </div>
          </div>
        );
      case 'ocr-management':
        return <OCRManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <div className="flex">
        <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
        
        <main className="flex-1 overflow-hidden relative">
          {renderActiveModule()}
        </main>
      </div>

      {/* Copilot Toggle Button */}
      <button
        onClick={() => setCopilotOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center z-40 hover:scale-110"
      >
        <Bot className="h-6 w-6" />
      </button>

      {/* Copilot Panel */}
      <SatarkCopilot isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/dashboard/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/agent" 
                element={
                  <ProtectedRoute requiredRole="agent">
                    <AgentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;