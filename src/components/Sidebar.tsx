import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  MessageSquare, 
  BarChart3, 
  ShieldCheck, 
  FileDown, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  UserCheck,
  Smartphone,
  Lock,
  Globe,
  Activity,
  Camera,
  FileText as FileTextIcon
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, onModuleChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const modules = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      color: 'text-accent'
    },
    { 
      id: 'survey-management', 
      name: 'Survey Management', 
      icon: FileText, 
      color: 'text-success',
      subItems: [
        { id: 'survey-designer', name: 'Create Survey', icon: Plus },
        { id: 'view-surveys', name: 'View Surveys', icon: Eye }
      ]
    },
    { 
      id: 'agent-management', 
      name: 'Agent Management', 
      icon: Users, 
      color: 'text-accent',
      subItems: [
        { id: 'assign-track', name: 'Assign & Track', icon: UserCheck }
      ]
    },
    { 
      id: 'validation-engine', 
      name: 'Validation Engine', 
      icon: ShieldCheck, 
      color: 'text-warning'
    },
    { 
      id: 'analytics', 
      name: 'Reports & Analytics', 
      icon: BarChart3, 
      color: 'text-success'
    },
    { 
      id: 'citizen-channels', 
      name: 'Citizen Channels', 
      icon: Smartphone, 
      color: 'text-accent'
    },
    { 
      id: 'compliance-privacy', 
      name: 'Compliance & Privacy', 
      icon: Lock, 
      color: 'text-error'
    },
    { 
      id: 'ocr-management', 
      name: 'OCR Management', 
      icon: Camera, 
      color: 'text-purple-600'
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: Settings, 
      color: 'text-corporate-600'
    },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-corporate-200 transition-all duration-300 flex flex-col shadow-soft`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-corporate-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-corporate-900">SATARK.AI</h2>
              <p className="text-xs text-corporate-600">Survey Intelligence</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-corporate-50 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-corporate-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-corporate-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id || (module.subItems && module.subItems.some(sub => activeModule === sub.id));
          
          return (
            <div key={module.id} className="space-y-1">
              <button
                onClick={() => onModuleChange(module.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-corporate-100 border border-corporate-200 shadow-soft'
                    : 'hover:bg-corporate-50'
                }`}
                title={isCollapsed ? module.name : ''}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-white shadow-soft' : 'bg-corporate-50'}`}>
                  <Icon className={`h-5 w-5 ${isActive ? module.color : 'text-corporate-600'}`} />
                </div>
                {!isCollapsed && (
                  <div className="ml-3 flex-1 text-left">
                    <span className={`font-medium ${
                      isActive ? 'text-corporate-900' : 'text-corporate-700'
                    }`}>
                      {module.name}
                    </span>
                    {module.subItems && (
                      <div className="text-xs text-corporate-500 mt-1">
                        {module.subItems.length} items
                      </div>
                    )}
                  </div>
                )}
              </button>

              {/* Sub Items */}
              {!isCollapsed && module.subItems && isActive && (
                <div className="ml-6 space-y-1">
                  {module.subItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = activeModule === subItem.id;
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => onModuleChange(subItem.id)}
                        className={`w-full flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                          isSubActive
                            ? 'bg-white shadow-soft border border-corporate-200'
                            : 'hover:bg-corporate-50'
                        }`}
                      >
                        <SubIcon className={`h-4 w-4 mr-3 ${isSubActive ? module.color : 'text-corporate-500'}`} />
                        <span className={`text-sm font-medium ${
                          isSubActive ? 'text-corporate-900' : 'text-corporate-600'
                        }`}>
                          {subItem.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-corporate-200 bg-corporate-50">
        <div className={`${isCollapsed ? 'text-center' : 'text-left'} space-y-2`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            {!isCollapsed && (
              <div className="text-xs text-corporate-600 font-medium">
                System Status: Online
              </div>
            )}
          </div>
          {!isCollapsed && (
            <>
              <div className="text-xs text-corporate-500">
                SATARK.AI v2.1.3
              </div>
              <div className="text-xs text-corporate-400">
                Last updated: 2 hours ago
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <Globe className="h-3 w-3 text-warning" />
                <span className="text-xs text-corporate-600">भारत सरकार</span>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;