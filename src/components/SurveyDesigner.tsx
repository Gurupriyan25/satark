import React, { useState } from "react";
import {
  Wand2,
  Edit3,
  Share2,
  Plus,
  Type,
  CheckSquare,
  Circle,
  List,
  Calendar,
  Hash,
  Star,
  Trash2,
  Save,
  Eye,
  Users,
  Settings,
  Copy,
  Download,
  AlertCircle,
  CheckCircle,
  Loader
} from "lucide-react";

interface Question {
  id: string;
  type: string;
  question: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: Date;
  status: 'draft' | 'published' | 'assigned';
}

const SurveyDesigner: React.FC = () => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSurvey, setCurrentSurvey] = useState<Survey>({
    id: '',
    title: 'Untitled Survey',
    description: '',
    questions: [],
    createdAt: new Date(),
    status: 'draft'
  });
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const questionTypes = [
    { type: "text", label: "Text Input", icon: Type, description: "Single line text input" },
    { type: "textarea", label: "Long Text", icon: Type, description: "Multi-line text input" },
    { type: "multiple-choice", label: "Multiple Choice", icon: CheckSquare, description: "Select multiple options" },
    { type: "single-choice", label: "Single Choice", icon: Circle, description: "Select one option" },
    { type: "dropdown", label: "Dropdown", icon: List, description: "Dropdown selection" },
    { type: "date", label: "Date", icon: Calendar, description: "Date picker" },
    { type: "number", label: "Number", icon: Hash, description: "Numeric input" },
    { type: "rating", label: "Rating", icon: Star, description: "Star rating scale" },
  ];

  const sampleQuestions = [
    {
      type: "text",
      question: "What is your full name?",
      required: true,
      placeholder: "Enter your full name"
    },
    {
      type: "single-choice",
      question: "What is your age group?",
      required: true,
      options: ["18-25", "26-35", "36-45", "46-55", "55+"]
    },
    {
      type: "multiple-choice",
      question: "Which of the following services do you use? (Select all that apply)",
      required: false,
      options: ["Healthcare", "Education", "Transportation", "Banking", "Government Services"]
    },
    {
      type: "rating",
      question: "How satisfied are you with government services?",
      required: true,
      options: ["1", "2", "3", "4", "5"]
    },
    {
      type: "textarea",
      question: "Please provide any additional feedback or suggestions:",
      required: false,
      placeholder: "Your feedback here..."
    }
  ];

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      setApiError("Please enter a survey description");
      return;
    }
    
    setIsGenerating(true);
    setApiError(null);

    try {
      // Enhanced prompt for better AI generation
      const enhancedPrompt = `Create a professional government survey based on this request: "${aiPrompt}". 
      
      Generate a JSON object with the following structure:
      {
        "title": "Survey Title",
        "description": "Brief description of the survey purpose",
        "questions": [
          {
            "id": "unique_id",
            "type": "text|textarea|single-choice|multiple-choice|dropdown|date|number|rating",
            "question": "Question text",
            "required": true/false,
            "options": ["option1", "option2"] (only for choice/dropdown/rating types),
            "placeholder": "placeholder text" (for text inputs)
          }
        ]
      }
      
      Make questions relevant to Indian government surveys, use appropriate question types, and ensure cultural sensitivity.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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",
          "HTTP-Referer": window.location.origin,
          "X-Title": "SATARK.AI Survey Generator"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are an expert survey designer for Indian government surveys. Generate professional, culturally appropriate surveys. Always respond with valid JSON only, no additional text."
            },
            {
              role: "user",
              content: enhancedPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "API request failed");
      }

      const aiContent = data?.choices?.[0]?.message?.content;
      if (!aiContent) {
        throw new Error("No content received from AI");
      }

      // Clean the response to extract JSON
      let cleanContent = aiContent.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      let parsedSurvey;
      try {
        parsedSurvey = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error("Parse error:", parseError);
        console.error("Raw content:", aiContent);
        throw new Error("Failed to parse AI response. Please try again.");
      }

      // Validate and structure the survey
      if (!parsedSurvey.questions || !Array.isArray(parsedSurvey.questions)) {
        throw new Error("Invalid survey structure received");
      }

      const newSurvey: Survey = {
        id: Date.now().toString(),
        title: parsedSurvey.title || "AI Generated Survey",
        description: parsedSurvey.description || "Generated by SATARK.AI",
        questions: parsedSurvey.questions.map((q: any, index: number) => ({
          id: q.id || `q_${Date.now()}_${index}`,
          type: q.type || "text",
          question: q.question || `Question ${index + 1}`,
          required: q.required !== false,
          options: q.options || [],
          placeholder: q.placeholder || ""
        })),
        createdAt: new Date(),
        status: 'draft'
      };

      setCurrentSurvey(newSurvey);
      setActiveTab('manual'); // Switch to manual tab to show the generated survey

    } catch (error) {
      console.error("Error generating survey:", error);
      setApiError(error instanceof Error ? error.message : "Failed to generate survey");
    } finally {
      setIsGenerating(false);
    }
  };

  const addQuestion = (type: string, sampleData?: any) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type,
      question: sampleData?.question || `New ${type.replace("-", " ")} question`,
      required: sampleData?.required || false,
      options: sampleData?.options || (type.includes("choice") || type === "dropdown" || type === "rating" ? ["Option 1", "Option 2"] : []),
      placeholder: sampleData?.placeholder || ""
    };
    
    setCurrentSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setCurrentSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, ...updates } : q
      )
    }));
  };

  const deleteQuestion = (id: string) => {
    setCurrentSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const addOption = (questionId: string) => {
    updateQuestion(questionId, {
      options: [...(currentSurvey.questions.find(q => q.id === questionId)?.options || []), `Option ${Date.now()}`]
    });
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = currentSurvey.questions.find(q => q.id === questionId);
    if (question?.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = currentSurvey.questions.find(q => q.id === questionId);
    if (question?.options) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const handleShare = () => {
    // Simulate sharing/assignment
    alert("Survey shared with field agents successfully!");
    setCurrentSurvey(prev => ({ ...prev, status: 'assigned' }));
  };

  const handleSave = () => {
    // Simulate saving
    alert("Survey saved successfully!");
    setCurrentSurvey(prev => ({ ...prev, status: 'published' }));
  };

  const renderQuestionEditor = (question: Question) => {
    const isEditing = editingQuestion === question.id;
    
    return (
      <div key={question.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-4">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Text
              </label>
              {isEditing ? (
                <textarea
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  rows={2}
                />
              ) : (
                <p className="text-gray-900 dark:text-white font-medium">{question.question}</p>
              )}
            </div>

            {/* Question Type */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                {question.type.replace("-", " ")}
              </span>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Required</span>
              </label>
            </div>

            {/* Options for choice questions */}
            {(question.type.includes("choice") || question.type === "dropdown" || question.type === "rating") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(question.id, index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        disabled={!isEditing}
                      />
                      {isEditing && (
                        <button
                          onClick={() => removeOption(question.id, index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      onClick={() => addOption(question.id)}
                      className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Option</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Placeholder for text inputs */}
            {(question.type === "text" || question.type === "textarea") && isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={question.placeholder || ""}
                  onChange={(e) => updateQuestion(question.id, { placeholder: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Enter placeholder text..."
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setEditingQuestion(isEditing ? null : question.id)}
              className={`p-2 rounded-lg transition-colors ${
                isEditing 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {isEditing ? <CheckCircle className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => deleteQuestion(question.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPreview = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{currentSurvey.title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{currentSurvey.description}</p>
      </div>
      
      <div className="space-y-6">
        {currentSurvey.questions.map((question, index) => (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              {index + 1}. {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {question.type === "text" && (
              <input
                type="text"
                placeholder={question.placeholder}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                disabled
              />
            )}
            
            {question.type === "textarea" && (
              <textarea
                placeholder={question.placeholder}
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                disabled
              />
            )}
            
            {question.type === "single-choice" && (
              <div className="space-y-2">
                {question.options?.map((option, optIndex) => (
                  <label key={optIndex} className="flex items-center space-x-2">
                    <input type="radio" name={question.id} disabled className="text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            )}
            
            {question.type === "multiple-choice" && (
              <div className="space-y-2">
                {question.options?.map((option, optIndex) => (
                  <label key={optIndex} className="flex items-center space-x-2">
                    <input type="checkbox" disabled className="text-blue-600 rounded" />
                    <span className="text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            )}
            
            {question.type === "dropdown" && (
              <select disabled className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                <option>Select an option...</option>
                {question.options?.map((option, optIndex) => (
                  <option key={optIndex}>{option}</option>
                ))}
              </select>
            )}
            
            {question.type === "rating" && (
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button key={rating} disabled className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <Star className="h-5 w-5 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
            
            {question.type === "date" && (
              <input
                type="date"
                disabled
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            )}
            
            {question.type === "number" && (
              <input
                type="number"
                placeholder={question.placeholder}
                disabled
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Wand2 className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-purple-600" />
              Survey Designer
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create professional surveys using AI or build them manually
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Survey Title and Description */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Survey Title
            </label>
            <input
              type="text"
              value={currentSurvey.title}
              onChange={(e) => setCurrentSurvey(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Enter survey title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={currentSurvey.description}
              onChange={(e) => setCurrentSurvey(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Brief description of the survey..."
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
            activeTab === 'ai'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Wand2 className="h-4 w-4" />
          <span>AI Generator</span>
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
            activeTab === 'manual'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Edit3 className="h-4 w-4" />
          <span>Manual Builder</span>
        </button>
      </div>

      {/* AI Generator Tab */}
      {activeTab === 'ai' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Wand2 className="h-5 w-5 mr-2 text-purple-600" />
                AI Survey Generator
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Describe your survey requirements and let AI generate professional questions for you.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Survey Description
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Example: Create a survey for rural farmers about digital literacy with 8-10 questions covering smartphone usage, internet access, and government app awareness. Include demographic questions and satisfaction ratings."
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {apiError && (
              <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 text-sm">{apiError}</span>
              </div>
            )}

            <button
              onClick={handleAIGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {isGenerating ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Generating Survey...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  <span>Generate Survey with AI</span>
                </>
              )}
            </button>

            {/* Sample Prompts */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Sample Prompts:</h4>
              <div className="space-y-2">
                {[
                  "Create a healthcare access survey for rural communities with 10 questions about medical facilities, insurance, and telemedicine usage",
                  "Design an education survey for parents about online learning effectiveness during COVID-19 with satisfaction ratings",
                  "Build a digital governance survey for citizens about government app usage and service satisfaction with demographic questions"
                ].map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setAiPrompt(prompt)}
                    className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Builder Tab */}
      {activeTab === 'manual' && (
        <div className="space-y-6">
          {/* Question Types */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-blue-600" />
              Add Questions
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {questionTypes.map((qt) => {
                const Icon = qt.icon;
                return (
                  <button
                    key={qt.type}
                    onClick={() => addQuestion(qt.type)}
                    className="flex flex-col items-center space-y-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group"
                  >
                    <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{qt.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{qt.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sample Questions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-600" />
              Sample Questions
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sampleQuestions.map((sample, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{sample.question}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{sample.type.replace("-", " ")}</p>
                    </div>
                    <button
                      onClick={() => addQuestion(sample.type, sample)}
                      className="ml-2 p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {sample.options && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Options: {sample.options.slice(0, 2).join(", ")}
                      {sample.options.length > 2 && "..."}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current Questions */}
          {currentSurvey.questions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <List className="h-5 w-5 mr-2 text-green-600" />
                  Survey Questions ({currentSurvey.questions.length})
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Assign to Agents</span>
                  </button>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {currentSurvey.questions.map(renderQuestionEditor)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && currentSurvey.questions.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl max-h-[90vh] overflow-auto w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Survey Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Trash2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="p-6">
              {renderPreview()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyDesigner;