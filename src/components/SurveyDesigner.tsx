import React, { useState } from 'react';
import { 
  Plus, Wand2, Languages, Save, Eye, Send,
  Type, CheckSquare, Circle, List, Calendar, Hash, Star,
  Move, Trash2
} from 'lucide-react';

const OPENAI_API_KEY = "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";

const SurveyDesigner: React.FC = () => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState(['en', 'hi']);
  const [questions, setQuestions] = useState([
    {
      id: '1',
      type: 'text',
      question: 'What is your age?',
      required: true,
      options: []
    },
    {
      id: '2',
      type: 'multiple-choice',
      question: 'Which district do you belong to?',
      required: true,
      options: ['Ahmadabad', 'Surat', 'Vadodara', 'Rajkot']
    }
  ]);

  const questionTypes = [
    { type: 'text', label: 'Text Input', icon: Type },
    { type: 'multiple-choice', label: 'Multiple Choice', icon: CheckSquare },
    { type: 'single-choice', label: 'Single Choice', icon: Circle },
    { type: 'dropdown', label: 'Dropdown', icon: List },
    { type: 'date', label: 'Date', icon: Calendar },
    { type: 'number', label: 'Number', icon: Hash },
    { type: 'rating', label: 'Rating', icon: Star },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  ];

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an AI survey generator. Based on the user's prompt, return a JSON array of survey questions. Each question should have: id (string), type (text | multiple-choice | single-choice | dropdown | date | number | rating), question (string), required (boolean), and options (array for choice types, else empty array)."
            },
            {
              role: "user",
              content: aiPrompt
            }
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      let parsedQuestions = [];
      try {
        parsedQuestions = JSON.parse(data.choices[0].message.content);
      } catch (err) {
        console.error("Error parsing AI output", err);
        parsedQuestions = [];
      }

      // Ensure IDs are strings
      parsedQuestions = parsedQuestions.map(q => ({
        ...q,
        id: q.id.toString()
      }));

      setQuestions(prev => [...prev, ...parsedQuestions]);
    } catch (error) {
      console.error("Error generating survey:", error);
    }
    setIsGenerating(false);
    setAiPrompt('');
  };

  const addQuestion = (type: string) => {
    const newQuestion = {
      id: Date.now().toString(),
      type,
      question: `New ${type.replace('-', ' ')} question`,
      required: false,
      options: type.includes('choice') || type === 'dropdown' ? ['Option 1', 'Option 2'] : []
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Survey Designer</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Create intelligent surveys with AI assistance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Save className="h-4 w-4" />
            <span>Save Draft</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
            <Send className="h-4 w-4" />
            <span>Publish</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* AI Builder */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Wand2 className="h-5 w-5 mr-2 text-purple-600" />
              AI Survey Builder
            </h3>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe your survey..."
              className="w-full p-4 border border-gray-200 rounded-xl resize-none h-32"
            />
            <button
              onClick={handleAIGenerate}
              disabled={!aiPrompt.trim() || isGenerating}
              className="w-full mt-4 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl"
            >
              {isGenerating ? "Generating..." : "Generate with AI"}
            </button>
          </div>

          {/* Language Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Languages className="h-5 w-5 mr-2 text-blue-600" />
              Multilingual Support
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguages(prev => 
                      prev.includes(lang.code) 
                        ? prev.filter(l => l !== lang.code)
                        : [...prev, lang.code]
                    );
                  }}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 ${
                    selectedLanguages.includes(lang.code)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question Types */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Question Types</h3>
            <div className="space-y-2">
              {questionTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.type}
                    onClick={() => addQuestion(type.type)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">{type.label}</span>
                    <Plus className="h-4 w-4 text-gray-400 ml-auto" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Questions */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Survey Questions</h3>
              <p className="text-gray-600 mt-1">{questions.length} questions added</p>
            </div>
            
            <div className="p-6 space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 rounded-xl p-6 border-2 hover:border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">Q{index + 1}</span>
                        <span className="bg-gray-200 text-xs px-2 py-1 rounded">
                          {question.type.replace('-', ' ')}
                        </span>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                          />
                          <span className="text-sm text-gray-600">Required</span>
                        </label>
                      </div>
                      <textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                        className="w-full p-3 border rounded-lg resize-none"
                        rows={2}
                      />
                      {(question.type.includes('choice') || question.type === 'dropdown') && (
                        <div className="mt-4 space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optIndex] = e.target.value;
                                  updateQuestion(question.id, 'options', newOptions);
                                }}
                                className="flex-1 p-2 border rounded-lg"
                              />
                              <button
                                onClick={() => {
                                  const newOptions = question.options.filter((_, i) => i !== optIndex);
                                  updateQuestion(question.id, 'options', newOptions);
                                }}
                                className="p-2 text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newOptions = [...question.options, `Option ${question.options.length + 1}`];
                              updateQuestion(question.id, 'options', newOptions);
                            }}
                            className="text-blue-600 text-sm flex items-center space-x-1"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add option</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => removeQuestion(question.id)}
                      className="p-2 text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SurveyDesigner;
