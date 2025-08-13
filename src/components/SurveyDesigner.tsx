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
  Trash2
} from "lucide-react";

const OPENROUTER_API_KEY = "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"; // your key

const SurveyDesigner: React.FC = () => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  const questionTypes = [
    { type: "text", label: "Text Input", icon: Type },
    { type: "multiple-choice", label: "Multiple Choice", icon: CheckSquare },
    { type: "single-choice", label: "Single Choice", icon: Circle },
    { type: "dropdown", label: "Dropdown", icon: List },
    { type: "date", label: "Date", icon: Calendar },
    { type: "number", label: "Number", icon: Hash },
    { type: "rating", label: "Rating", icon: Star },
  ];

const handleAIGenerate = async () => {
  if (!aiPrompt.trim()) return;
  setIsGenerating(true);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`, // store in .env
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are an AI survey generator. Output ONLY a JSON array of survey questions with fields: id, type, question, required, options.",
          },
          { role: "user", content: aiPrompt },
        ],
      }),
    });

    const data = await response.json();
    console.log("OpenRouter raw response:", data);

    if (data.error) {
      alert(`API Error: ${data.error.message}`);
      setIsGenerating(false);
      return;
    }

    const aiContent = data?.choices?.[0]?.message?.content;
    if (!aiContent) {
      alert("No AI content found in API response");
      setIsGenerating(false);
      return;
    }

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(aiContent);
    } catch (err) {
      console.error("Error parsing AI output:", aiContent);
      alert("Error parsing AI output. Check console for raw output.");
      parsedQuestions = [];
    }

    setQuestions((prev) => [...prev, ...parsedQuestions]);
  } catch (error) {
    console.error("Error generating survey:", error);
    alert(`Error: ${error.message}`);
  }

  setIsGenerating(false);
};


 const addQuestion = (type: string) => {
    const newQuestion = {
      id: Date.now().toString(),
      type,
      question: `New ${type.replace("-", " ")} question`,
      required: false,
      options: type.includes("choice") || type === "dropdown" ? ["Option 1", "Option 2"] : [],
    };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* AI Survey Generator */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Wand2 className="h-5 w-5 mr-2 text-purple-600" /> AI Survey Generator
        </h3>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="A survey for (target audience) for the (issue) with (number) questions and (other requirements)"
          className="w-full p-4 border rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white h-24 focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleAIGenerate}
          disabled={isGenerating || !aiPrompt.trim()}
          className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              <span>Generate Survey</span>
            </>
          )}
        </button>

        {/* AI Generated Preview */}
        {generatedQuestions.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border space-y-4">
            <h4 className="text-md font-semibold">Generated Questions</h4>
            {generatedQuestions.map((q, i) => (
              <div key={i} className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <p className="font-medium">{q.question}</p>
                {q.type.includes("choice") && (
                  <ul className="list-disc ml-5 text-sm text-gray-600">
                    {q.options.map((opt, idx) => (
                      <li key={idx}>{opt}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <div className="flex gap-3">
              <button
                onClick={() => setQuestions((prev) => [...prev, ...generatedQuestions])}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit3 className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={() => alert("Survey assigned/shared!")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Share2 className="h-4 w-4" /> Share/Assign
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Survey Designer */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Manual Survey Builder</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {questionTypes.map((qt) => {
            const Icon = qt.icon;
            return (
              <button
                key={qt.type}
                onClick={() => addQuestion(qt.type)}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-100"
              >
                <Icon className="h-4 w-4" /> {qt.label}
              </button>
            );
          })}
        </div>
        {questions.map((q) => (
          <div key={q.id} className="p-4 border rounded-xl mb-3 flex justify-between">
            <div>
              <p className="font-medium">{q.question}</p>
              {q.options?.length > 0 && (
                <ul className="list-disc ml-5 text-sm text-gray-600">
                  {q.options.map((opt, idx) => (
                    <li key={idx}>{opt}</li>
                  ))}
                </ul>
              )}
            </div>
            <button onClick={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))}>
              <Trash2 className="text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurveyDesigner;
