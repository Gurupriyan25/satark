import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  User,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Zap
} from 'lucide-react';

interface OCRDocument {
  id: string;
  agentId: string;
  agentName: string;
  district: string;
  state: string;
  documentType: string;
  extractedText: string;
  confidence: number;
  timestamp: Date;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  imageUrl: string;
  surveyId?: string;
  notes?: string;
}

const OCRManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<OCRDocument | null>(null);

  // Mock data - in real app, this would come from API
  const documents: OCRDocument[] = [
    {
      id: 'OCR001',
      agentId: 'AG001',
      agentName: 'Rajesh Kumar',
      district: 'Ahmadabad',
      state: 'Gujarat',
      documentType: 'Survey Form',
      extractedText: 'Name: राम प्रसाद शर्मा\nAge: 45\nOccupation: किसान\nIncome: ₹25,000 per month\nEducation: 12th Pass\nFamily Size: 5 members',
      confidence: 94,
      timestamp: new Date('2024-01-15T10:30:00'),
      status: 'pending',
      imageUrl: '/api/placeholder/400/600',
      surveyId: 'SUR001'
    },
    {
      id: 'OCR002',
      agentId: 'AG002',
      agentName: 'Priya Patel',
      district: 'Surat',
      state: 'Gujarat',
      documentType: 'Identity Verification',
      extractedText: 'Aadhaar Number: XXXX XXXX 1234\nName: PRIYA PATEL\nDOB: 15/08/1985\nAddress: 123 Gandhi Road, Surat, Gujarat',
      confidence: 98,
      timestamp: new Date('2024-01-15T09:15:00'),
      status: 'approved',
      imageUrl: '/api/placeholder/400/600',
      surveyId: 'SUR002'
    },
    {
      id: 'OCR003',
      agentId: 'AG003',
      agentName: 'Mohammed Ali',
      district: 'Hyderabad',
      state: 'Telangana',
      documentType: 'Income Certificate',
      extractedText: 'Certificate No: INC/2024/001\nName: Mohammed Ali Khan\nAnnual Income: ₹3,50,000\nIssued by: Tehsildar Office\nDate: 10/01/2024',
      confidence: 91,
      timestamp: new Date('2024-01-14T16:45:00'),
      status: 'reviewed',
      imageUrl: '/api/placeholder/400/600',
      surveyId: 'SUR003'
    }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.extractedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesDistrict = filterDistrict === 'all' || doc.district === filterDistrict;
    
    return matchesSearch && matchesStatus && matchesDistrict;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30';
      case 'reviewed': return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30';
      case 'approved': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      case 'rejected': return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const updateDocumentStatus = (docId: string, newStatus: OCRDocument['status']) => {
    // In real app, this would make an API call
    console.log(`Updating document ${docId} status to ${newStatus}`);
  };

  const downloadDocument = (doc: OCRDocument) => {
    const content = `OCR Document Report
    
Document ID: ${doc.id}
Agent: ${doc.agentName} (${doc.agentId})
Location: ${doc.district}, ${doc.state}
Document Type: ${doc.documentType}
Confidence: ${doc.confidence}%
Timestamp: ${doc.timestamp.toLocaleString()}
Status: ${doc.status}

Extracted Text:
${doc.extractedText}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-document-${doc.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: 'Total Documents', value: documents.length, icon: FileText, color: 'text-blue-600' },
    { label: 'Pending Review', value: documents.filter(d => d.status === 'pending').length, icon: Clock, color: 'text-yellow-600' },
    { label: 'Approved', value: documents.filter(d => d.status === 'approved').length, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Avg Confidence', value: `${Math.round(documents.reduce((acc, doc) => acc + doc.confidence, 0) / documents.length)}%`, icon: BarChart3, color: 'text-purple-600' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Zap className="h-8 w-8 mr-3 text-blue-600" />
            OCR Document Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review and manage OCR-extracted documents from field agents
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents, agents, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-w-64"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="all">All Districts</option>
              <option value="Ahmadabad">Ahmadabad</option>
              <option value="Surat">Surat</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Jaipur">Jaipur</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            OCR Documents ({filteredDocuments.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {doc.documentType} - {doc.id}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{doc.agentName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{doc.district}, {doc.state}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{doc.timestamp.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Extracted Text (Confidence: {doc.confidence}%)
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${doc.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{doc.confidence}%</span>
                      </div>
                    </div>
                    <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
                      {doc.extractedText}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        <span className="capitalize">{doc.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedDocument(doc)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => downloadDocument(doc)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      
                      {doc.status === 'pending' && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => updateDocumentStatus(doc.id, 'approved')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateDocumentStatus(doc.id, 'rejected')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl max-h-full overflow-auto w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Document Details - {selectedDocument.id}
              </h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <AlertTriangle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Document Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="text-gray-900 dark:text-white">{selectedDocument.documentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Agent:</span>
                      <span className="text-gray-900 dark:text-white">{selectedDocument.agentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Location:</span>
                      <span className="text-gray-900 dark:text-white">{selectedDocument.district}, {selectedDocument.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                      <span className="text-gray-900 dark:text-white">{selectedDocument.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Timestamp:</span>
                      <span className="text-gray-900 dark:text-white">{selectedDocument.timestamp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Extracted Text</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-mono">
                      {selectedDocument.extractedText}
                    </pre>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Original Image</h4>
                <img
                  src={selectedDocument.imageUrl}
                  alt="Original document"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OCRManagement;