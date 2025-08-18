import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  MapPin, 
  Users, 
  Clock, 
  Filter,
  Search,
  Eye,
  RefreshCw,
  Download,
  Zap,
  Target,
  Award,
  Bell,
  BarChart3,
  Map,
  List,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Activity,
  Globe,
  Calendar
} from 'lucide-react';

interface ValidationError {
  id: string;
  type: 'missing_data' | 'logical_error' | 'location_mismatch' | 'format_error' | 'duplicate';
  severity: 'high' | 'medium' | 'low';
  description: string;
  field: string;
  value: string;
  suggestion: string;
  agentId: string;
  agentName: string;
  district: string;
  state: string;
  surveyId: string;
  timestamp: Date;
  status: 'pending' | 'fixed' | 'ignored';
  autoFixable: boolean;
}

interface ErrorCategory {
  type: string;
  label: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  examples: string[];
}

interface AgentPerformance {
  id: string;
  name: string;
  district: string;
  state: string;
  totalSurveys: number;
  errorCount: number;
  errorRate: number;
  accuracyScore: number;
  badge: 'gold' | 'silver' | 'bronze' | 'none';
  lastActive: Date;
  trend: 'improving' | 'declining' | 'stable';
  commonErrors: string[];
}

interface RegionData {
  id: string;
  name: string;
  type: 'state' | 'district' | 'block';
  errorRate: number;
  totalSurveys: number;
  errorCount: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  children?: RegionData[];
}

const DataValidation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'errors' | 'agents' | 'regions'>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedErrors, setSelectedErrors] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mock data - in real app, this would come from API
  const validationStats = {
    totalSurveys: 45678,
    validatedSurveys: 43234,
    pendingValidation: 2444,
    errorRate: 5.3,
    autoFixedErrors: 1876,
    manualReviewNeeded: 568,
    realTimeValidations: 12456,
    avgValidationTime: '2.3s'
  };

  const errorCategories: ErrorCategory[] = [
    {
      type: 'missing_data',
      label: 'Missing Data',
      count: 25400,
      percentage: 45.2,
      trend: 'down',
      color: 'bg-red-500',
      examples: ['Household income missing', 'Phone number blank', 'Education level not specified']
    },
    {
      type: 'logical_error',
      label: 'Logical Errors',
      count: 10000,
      percentage: 17.8,
      trend: 'stable',
      color: 'bg-orange-500',
      examples: ['Age = 2, Occupation = Farmer', 'Income > 10 lakhs in rural area', 'Child with PhD']
    },
    {
      type: 'format_error',
      label: 'Format Errors',
      count: 8200,
      percentage: 14.6,
      trend: 'down',
      color: 'bg-yellow-500',
      examples: ['Invalid phone format', 'Incorrect PIN code', 'Wrong date format']
    },
    {
      type: 'location_mismatch',
      label: 'Location Mismatches',
      count: 6800,
      percentage: 12.1,
      trend: 'up',
      color: 'bg-purple-500',
      examples: ['GPS vs reported address', 'Wrong district code', 'State boundary issues']
    },
    {
      type: 'duplicate',
      label: 'Duplicate Entries',
      count: 5700,
      percentage: 10.3,
      trend: 'stable',
      color: 'bg-blue-500',
      examples: ['Same household surveyed twice', 'Duplicate Aadhaar numbers', 'Repeated responses']
    }
  ];

  const mockErrors: ValidationError[] = [
    {
      id: 'ERR001',
      type: 'logical_error',
      severity: 'high',
      description: 'Age and occupation mismatch detected',
      field: 'age_occupation',
      value: 'Age: 3, Occupation: Software Engineer',
      suggestion: 'Please verify respondent age or occupation',
      agentId: 'AG001',
      agentName: 'Rajesh Kumar',
      district: 'Ahmadabad',
      state: 'Gujarat',
      surveyId: 'SUR001',
      timestamp: new Date('2024-01-15T10:30:00'),
      status: 'pending',
      autoFixable: false
    },
    {
      id: 'ERR002',
      type: 'missing_data',
      severity: 'medium',
      description: 'Household income field is empty',
      field: 'household_income',
      value: '',
      suggestion: 'Auto-fill with district average or request re-survey',
      agentId: 'AG002',
      agentName: 'Priya Patel',
      district: 'Surat',
      state: 'Gujarat',
      surveyId: 'SUR002',
      timestamp: new Date('2024-01-15T09:15:00'),
      status: 'pending',
      autoFixable: true
    },
    {
      id: 'ERR003',
      type: 'format_error',
      severity: 'low',
      description: 'Phone number format incorrect',
      field: 'phone_number',
      value: '98765-43210',
      suggestion: 'Format as +91-98765-43210',
      agentId: 'AG003',
      agentName: 'Mohammed Ali',
      district: 'Hyderabad',
      state: 'Telangana',
      surveyId: 'SUR003',
      timestamp: new Date('2024-01-14T16:45:00'),
      status: 'pending',
      autoFixable: true
    }
  ];

  const agentPerformance: AgentPerformance[] = [
    {
      id: 'AG001',
      name: 'Rajesh Kumar',
      district: 'Ahmadabad',
      state: 'Gujarat',
      totalSurveys: 150,
      errorCount: 8,
      errorRate: 5.3,
      accuracyScore: 94.7,
      badge: 'gold',
      lastActive: new Date('2024-01-15T10:30:00'),
      trend: 'improving',
      commonErrors: ['Missing phone numbers', 'Age verification']
    },
    {
      id: 'AG002',
      name: 'Priya Patel',
      district: 'Surat',
      state: 'Gujarat',
      totalSurveys: 120,
      errorCount: 15,
      errorRate: 12.5,
      accuracyScore: 87.5,
      badge: 'silver',
      lastActive: new Date('2024-01-15T09:15:00'),
      trend: 'stable',
      commonErrors: ['Income validation', 'Location mismatches']
    },
    {
      id: 'AG003',
      name: 'Mohammed Ali',
      district: 'Hyderabad',
      state: 'Telangana',
      totalSurveys: 200,
      errorCount: 35,
      errorRate: 17.5,
      accuracyScore: 82.5,
      badge: 'bronze',
      lastActive: new Date('2024-01-14T16:45:00'),
      trend: 'declining',
      commonErrors: ['Format errors', 'Duplicate entries', 'Missing data']
    }
  ];

  const regionData: RegionData[] = [
    {
      id: 'GJ',
      name: 'Gujarat',
      type: 'state',
      errorRate: 4.2,
      totalSurveys: 15000,
      errorCount: 630,
      status: 'good',
      children: [
        {
          id: 'GJ-AHM',
          name: 'Ahmadabad',
          type: 'district',
          errorRate: 3.8,
          totalSurveys: 5000,
          errorCount: 190,
          status: 'excellent'
        },
        {
          id: 'GJ-SUR',
          name: 'Surat',
          type: 'district',
          errorRate: 4.6,
          totalSurveys: 4000,
          errorCount: 184,
          status: 'good'
        }
      ]
    },
    {
      id: 'MH',
      name: 'Maharashtra',
      type: 'state',
      errorRate: 6.8,
      totalSurveys: 20000,
      errorCount: 1360,
      status: 'warning',
      children: [
        {
          id: 'MH-MUM',
          name: 'Mumbai',
          type: 'district',
          errorRate: 5.2,
          totalSurveys: 8000,
          errorCount: 416,
          status: 'good'
        },
        {
          id: 'MH-PUN',
          name: 'Pune',
          type: 'district',
          errorRate: 8.4,
          totalSurveys: 6000,
          errorCount: 504,
          status: 'warning'
        }
      ]
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30';
      case 'low': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'gold': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30';
      case 'silver': return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30';
      case 'bronze': return 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/30';
      default: return 'text-gray-500 bg-gray-50 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const toggleCategory = (categoryType: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryType)) {
      newExpanded.delete(categoryType);
    } else {
      newExpanded.add(categoryType);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleErrorSelection = (errorId: string) => {
    const newSelected = new Set(selectedErrors);
    if (newSelected.has(errorId)) {
      newSelected.delete(errorId);
    } else {
      newSelected.add(errorId);
    }
    setSelectedErrors(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleBulkAction = (action: 'fix' | 'ignore' | 'reassign') => {
    console.log(`Bulk ${action} for errors:`, Array.from(selectedErrors));
    setSelectedErrors(new Set());
    setShowBulkActions(false);
  };

  const filteredErrors = mockErrors.filter(error => {
    const matchesSeverity = filterSeverity === 'all' || error.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || error.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      error.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.district.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Shield className="h-8 w-8 mr-3 text-blue-600" />
            Data Quality & Validation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time validation, error analytics, and quality assurance
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Surveys</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{validationStats.totalSurveys.toLocaleString()}</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">+12% from last week</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{validationStats.errorRate}%</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">-2.1% improvement</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Auto-Fixed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{validationStats.autoFixedErrors.toLocaleString()}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">76% of total errors</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
              <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Validation Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{validationStats.avgValidationTime}</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">Real-time processing</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'errors', label: 'Error Analysis', icon: AlertTriangle },
          { id: 'agents', label: 'Agent Performance', icon: Users },
          { id: 'regions', label: 'Regional View', icon: Map }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Error Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Target className="h-6 w-6 mr-2 text-red-600" />
                Error Categories & Grouping
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Grouped errors for efficient bulk resolution
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              {errorCategories.map((category) => (
                <div key={category.type} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => toggleCategory(category.type)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {expandedCategories.has(category.type) ? (
                            <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          )}
                          <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{category.label}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {category.count.toLocaleString()} cases ({category.percentage}%)
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-1 text-sm ${
                          category.trend === 'up' ? 'text-red-600' : 
                          category.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          <TrendingUp className={`h-4 w-4 ${category.trend === 'down' ? 'rotate-180' : ''}`} />
                          <span className="capitalize">{category.trend}</span>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                          Bulk Fix
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedCategories.has(category.type) && (
                    <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-900">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Common Examples:</p>
                        {category.examples.map((example, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span>{example}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Validation Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Activity className="h-6 w-6 mr-2 text-green-600" />
                Edge Real-Time Validation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Live validation as data is submitted by field agents
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{validationStats.realTimeValidations.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Real-time Validations Today</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{validationStats.avgValidationTime}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average Processing Time</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                    <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{validationStats.manualReviewNeeded}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Manual Review Needed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Analysis Tab */}
      {activeTab === 'errors' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search errors, agents, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-w-64"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="all">All Severities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="fixed">Fixed</option>
                  <option value="ignored">Ignored</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {showBulkActions && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 dark:text-blue-300 font-medium">
                    {selectedErrors.size} errors selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('fix')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Auto-Fix Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('ignore')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Ignore Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('reassign')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reassign
                  </button>
                  <button
                    onClick={() => {
                      setSelectedErrors(new Set());
                      setShowBulkActions(false);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Validation Errors ({filteredErrors.length})
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredErrors.map((error) => (
                <div key={error.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedErrors.has(error.id)}
                      onChange={() => toggleErrorSelection(error.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{error.description}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span>Survey: {error.surveyId}</span>
                            <span>Field: {error.field}</span>
                            <span>Agent: {error.agentName}</span>
                            <span>{error.district}, {error.state}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(error.severity)}`}>
                            {error.severity.toUpperCase()}
                          </span>
                          {error.autoFixable && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                              Auto-fixable
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Current Value: </span>
                          <span className="text-red-600 dark:text-red-400">{error.value || 'Empty'}</span>
                        </div>
                        <div className="text-sm mt-1">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Suggestion: </span>
                          <span className="text-green-600 dark:text-green-400">{error.suggestion}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {error.timestamp.toLocaleString()}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {error.autoFixable && (
                            <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                              Auto-Fix
                            </button>
                          )}
                          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                            Review
                          </button>
                          <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
                            Ignore
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Agent Performance Tab */}
      {activeTab === 'agents' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Award className="h-6 w-6 mr-2 text-yellow-600" />
                Agent Error Analytics & Performance
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Surveys</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Error Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Accuracy</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Badge</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trend</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {agentPerformance.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{agent.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">{agent.district}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{agent.state}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{agent.totalSurveys}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{agent.errorCount} errors</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                agent.errorRate < 5 ? 'bg-green-500' :
                                agent.errorRate < 10 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(agent.errorRate, 20) * 5}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{agent.errorRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{agent.accuracyScore}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(agent.badge)}`}>
                          {agent.badge.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center space-x-1 text-sm ${
                          agent.trend === 'improving' ? 'text-green-600' :
                          agent.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          <TrendingUp className={`h-4 w-4 ${agent.trend === 'declining' ? 'rotate-180' : ''}`} />
                          <span className="capitalize">{agent.trend}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors">
                            <Bell className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Regional View Tab */}
      {activeTab === 'regions' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Globe className="h-6 w-6 mr-2 text-green-600" />
                Error Heatmap by Region
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Drill-down from national → state → district → block level
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              {regionData.map((region) => (
                <div key={region.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(region.status)}`}></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{region.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{region.type}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {region.errorRate}% Error Rate
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {region.errorCount.toLocaleString()} / {region.totalSurveys.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${getStatusColor(region.status)}`}
                            style={{ width: `${Math.min(region.errorRate * 10, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {region.children && (
                    <div className="p-4 space-y-2">
                      {region.children.map((child) => (
                        <div key={child.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(child.status)}`}></div>
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{child.name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 capitalize">{child.type}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {child.errorRate}%
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {child.errorCount} errors
                              </div>
                            </div>
                            
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(child.status)}`}
                                style={{ width: `${Math.min(child.errorRate * 10, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataValidation;