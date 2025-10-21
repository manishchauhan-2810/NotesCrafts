// FrontendTeacher/src/components/QuizzesPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Sparkles,
  Pencil,
  Trash2,
  CheckCircle,
  Eye,
  X,
  FileText,
  Plus,
  Minus,
  Loader,
  Save,
} from "lucide-react";
import axios from "axios";
import { getNotesByClassroom } from "../api/notesApi";

const QuizzesPage = () => {
  const { classId } = useParams();

  const [drafts, setDrafts] = useState([]);
  const [published, setPublished] = useState([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingQuiz, setViewingQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const [availableNotes, setAvailableNotes] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);

  // Fetch quizzes on load
  useEffect(() => {
    fetchQuizzes();
  }, [classId]);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/quiz/classroom/${classId}`
      );
      const quizzes = res.data.quizzes || [];

      setDrafts(quizzes.filter((q) => q.status === "draft"));
      setPublished(quizzes.filter((q) => q.status === "published"));
    } catch (err) {
      console.error("Error fetching quizzes:", err);
    }
  };

  // Fetch notes when AI modal opens
  const handleOpenAIModal = async () => {
    setShowAIModal(true);
    setLoadingNotes(true);

    try {
      const response = await getNotesByClassroom(classId);
      setAvailableNotes(response.notes || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      alert("Failed to load notes");
    } finally {
      setLoadingNotes(false);
    }
  };

  // Generate quiz using AI
  const handleGenerateWithAI = async () => {
    if (selectedNotes.length === 0) {
      alert("Please select at least one note");
      return;
    }

    console.log("=== FRONTEND: Starting Quiz Generation ===");
    console.log("Selected notes:", selectedNotes);
    console.log("Classroom ID:", classId);

    setIsGenerating(true);

    try {
      const payload = {
        noteIds: selectedNotes,
        classroomId: classId,
      };

      console.log("📤 Sending payload:", JSON.stringify(payload, null, 2));
      
      const response = await axios.post(
        'http://localhost:5000/api/quiz/generate-ai',
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Response received:", response.data);

      // Add to drafts
      setDrafts(prev => [response.data.quiz, ...prev]);
      
      // Show success message
      const stats = response.data.stats;
      alert(
        `✅ Quiz Generated Successfully!\n\n` +
        `📊 Details:\n` +
        `• Questions: ${stats.questionsGenerated}\n` +
        `• Notes processed: ${stats.processedNotes}/${stats.totalNotes}\n` +
        `• Content analyzed: ${(stats.textLength / 1000).toFixed(1)}K characters`
      );
      
      // Close modal and reset
      setSelectedNotes([]);
      setShowAIModal(false);
    } catch (err) {
      console.error("❌ Generation error:", err);
      console.error("Error response:", err.response?.data);
      
      let errorMessage = "Failed to generate quiz";
      
      if (err.response?.data?.error) {
        errorMessage = `❌ ${err.response.data.error}`;
        
        if (err.response.data.stats) {
          errorMessage += `\n\n📊 Stats:\n${JSON.stringify(err.response.data.stats, null, 2)}`;
        }
        
        if (err.response.data.details) {
          errorMessage += `\n\n💡 Details: ${err.response.data.details}`;
        }
      } else if (err.message) {
        errorMessage = `❌ ${err.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (quiz) => {
    setEditingQuiz({ ...quiz });
    setShowEditModal(true);
  };

  const handleView = (quiz) => {
    setViewingQuiz(quiz);
    setShowViewModal(true);
  };

  const handleUpdateQuiz = async () => {
    if (!editingQuiz) return;

    try {
      await axios.put(`http://localhost:5000/api/quiz/${editingQuiz._id}`, {
        title: editingQuiz.title,
        questions: editingQuiz.questions,
        status: editingQuiz.status,
      });

      if (editingQuiz.status === "draft") {
        setDrafts(
          drafts.map((q) => (q._id === editingQuiz._id ? editingQuiz : q))
        );
      } else {
        setPublished(
          published.map((q) => (q._id === editingQuiz._id ? editingQuiz : q))
        );
      }

      setEditingQuiz(null);
      setShowEditModal(false);
      alert("Quiz updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update quiz");
    }
  };

  const handleDelete = async (id, status) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/quiz/${id}`);

      if (status === "draft") {
        setDrafts(drafts.filter((q) => q._id !== id));
      } else {
        setPublished(published.filter((q) => q._id !== id));
      }

      alert("Quiz deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete quiz");
    }
  };

  const handlePublish = async (id) => {
    const quiz = drafts.find((q) => q._id === id);
    if (!quiz) return;

    try {
      const updatedQuiz = { ...quiz, status: "published" };
      await axios.put(`http://localhost:5000/api/quiz/${id}`, updatedQuiz);

      setPublished([updatedQuiz, ...published]);
      setDrafts(drafts.filter((q) => q._id !== id));

      alert("Quiz published successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to publish quiz");
    }
  };

  const toggleNoteSelection = (noteId) => {
    setSelectedNotes((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const updateQuizTitle = (value) =>
    setEditingQuiz({ ...editingQuiz, title: value });

  const updateQuestion = (qIndex, field, value) => {
    const updatedQuestions = [...editingQuiz.questions];
    updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], [field]: value };
    setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updatedQuestions = [...editingQuiz.questions];
    const updatedOptions = [...updatedQuestions[qIndex].options];
    updatedOptions[optIndex] = value;
    updatedQuestions[qIndex] = {
      ...updatedQuestions[qIndex],
      options: updatedOptions,
    };
    setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
  };

  const addQuestion = () => {
    const newQuestion = {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    };
    setEditingQuiz({
      ...editingQuiz,
      questions: [...editingQuiz.questions, newQuestion],
    });
  };

  const removeQuestion = (qIndex) => {
    if (editingQuiz.questions.length <= 1) {
      alert("Quiz must have at least one question");
      return;
    }
    const updatedQuestions = editingQuiz.questions.filter(
      (_, i) => i !== qIndex
    );
    setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Quizzes</h2>
        <button
          onClick={handleOpenAIModal}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Sparkles className="w-5 h-5" />
          Create with AI
        </button>
      </div>

      {/* Drafts */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Drafts</h3>
        <div className="space-y-4">
          {drafts.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">
                No drafts yet. Create your first quiz!
              </p>
            </div>
          ) : (
            drafts.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {quiz.title}
                  </h4>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                    draft
                  </span>
                  <span className="text-sm text-gray-500">
                    {quiz.questions?.length || 0} questions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(quiz)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(quiz._id, "draft")}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                  <button
                    onClick={() => handlePublish(quiz._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Publish
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Published */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Published</h3>
        <div className="space-y-4">
          {published.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No published quizzes yet.</p>
            </div>
          ) : (
            published.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {quiz.title}
                  </h4>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    published
                  </span>
                  <span className="text-sm text-gray-500">
                    {quiz.questions?.length || 0} questions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleView(quiz)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> View Quiz
                  </button>
                  <button
                    onClick={() => handleEdit(quiz)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(quiz._id, "published")}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                Generate Quiz with AI
              </h3>
              <button
                onClick={() => {
                  setShowAIModal(false);
                  setSelectedNotes([]);
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={isGenerating}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <h4 className="font-semibold text-gray-900 mb-4">
                Select Source Notes (Upload PDF First)
              </h4>

              {loadingNotes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                  <span className="ml-3 text-gray-600">Loading notes...</span>
                </div>
              ) : availableNotes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">
                    No notes uploaded yet
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Please upload notes first in the Notes tab
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableNotes.map((note) => (
                    <label
                      key={note._id}
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedNotes.includes(note._id)
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedNotes.includes(note._id)}
                        onChange={() => toggleNoteSelection(note._id)}
                        disabled={isGenerating}
                        className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-600"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {note.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Uploaded by {note.uploadedBy} •{" "}
                            {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowAIModal(false);
                  setSelectedNotes([]);
                }}
                disabled={isGenerating}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateWithAI}
                disabled={selectedNotes.length === 0 || isGenerating}
                className="flex-1 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  `Generate Quiz (${selectedNotes.length} notes selected)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Edit Quiz</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingQuiz(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Quiz Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={editingQuiz.title}
                  onChange={(e) => updateQuizTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Enter quiz title"
                />
              </div>

              {/* Questions */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Questions ({editingQuiz.questions.length})
                  </h4>
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                </div>

                {editingQuiz.questions.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="p-6 border border-gray-200 rounded-lg space-y-4 bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <h5 className="text-md font-semibold text-gray-900">
                        Question {qIndex + 1}
                      </h5>
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Question Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question
                      </label>
                      <textarea
                        value={q.question}
                        onChange={(e) =>
                          updateQuestion(qIndex, "question", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        rows="3"
                        placeholder="Enter question"
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Options
                      </label>
                      {q.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-600 w-8">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              updateOption(qIndex, optIndex, e.target.value)
                            }
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                            placeholder={`Option ${String.fromCharCode(
                              65 + optIndex
                            )}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Correct Answer */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer
                      </label>
                      <select
                        value={q.correctAnswer}
                        onChange={(e) =>
                          updateQuestion(qIndex, "correctAnswer", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      >
                        <option value="">Select correct answer</option>
                        {q.options.map((option, optIndex) => (
                          <option key={optIndex} value={option}>
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingQuiz(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateQuiz}
                className="flex-1 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {viewingQuiz.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {viewingQuiz.questions.length} Questions
                </p>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingQuiz(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {viewingQuiz.questions.map((q, qIndex) => (
                <div
                  key={qIndex}
                  className="p-6 border border-gray-200 rounded-lg space-y-4 bg-white"
                >
                  <h5 className="text-lg font-semibold text-gray-900">
                    Question {qIndex + 1}
                  </h5>
                  <p className="text-gray-800 text-base">{q.question}</p>

                  <div className="space-y-2">
                    {q.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg border-2 ${
                          option === q.correctAnswer
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-700">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span className="text-gray-800">{option}</span>
                          {option === q.correctAnswer && (
                            <span className="ml-auto px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingQuiz(null);
                }}
                className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizzesPage;