import React, { useState } from 'react';
import { Sparkles, Pencil, Trash2, CheckCircle, Eye, X, FileText, Plus, Minus } from 'lucide-react';

const QuizzesPage = () => {
  const [activeTab, setActiveTab] = useState('quizzes');
  const [drafts, setDrafts] = useState([
    { 
      id: 1, 
      title: 'Cell Structure Basics', 
      status: 'draft',
      questions: [
        { id: 1, question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Chloroplast'], correctAnswer: 1 },
        { id: 2, question: 'Which organelle is responsible for protein synthesis?', options: ['Golgi Body', 'Ribosome', 'Lysosome', 'Vacuole'], correctAnswer: 1 }
      ]
    }
  ]);
  const [published, setPublished] = useState([
    { 
      id: 2, 
      title: 'Photosynthesis Quiz', 
      status: 'published', 
      submissions: 24,
      questions: [
        { id: 1, question: 'What gas is released during photosynthesis?', options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'], correctAnswer: 1 }
      ]
    }
  ]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [availableNotes] = useState([
    { id: 1, title: 'Photosynthesis Notes', date: '2024-10-01' },
    { id: 2, title: 'Cell Structure', date: '2024-09-28' },
    { id: 3, title: 'Digestive System', date: '2024-09-25' },
    { id: 4, title: 'Human Anatomy', date: '2024-09-20' },
    { id: 5, title: 'Plant Biology', date: '2024-09-15' }
  ]);
  const [selectedNotes, setSelectedNotes] = useState([]);

  const handleGenerateWithAI = async () => {
    if (selectedNotes.length === 0) return;
    setIsGenerating(true);

    const selectedNoteTitles = selectedNotes.map(id => 
      availableNotes.find(n => n.id === id)?.title
    );
    
    const generatedQuestions = [
      { id: 1, question: `What is the main concept in ${selectedNoteTitles[0]}?`, options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswer: 0 },
      { id: 2, question: `Explain the key process described in ${selectedNoteTitles[0]}?`, options: ['Process 1', 'Process 2', 'Process 3', 'Process 4'], correctAnswer: 1 },
      { id: 3, question: `What are the important components mentioned in the notes?`, options: ['Components A', 'Components B', 'Components C', 'Components D'], correctAnswer: 2 }
    ];

    if (selectedNotes.length > 1) {
      generatedQuestions.push({
        id: 4,
        question: `How does ${selectedNoteTitles[0]} relate to ${selectedNoteTitles[1]}?`,
        options: ['Relation A', 'Relation B', 'Relation C', 'Relation D'],
        correctAnswer: 0
      });
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newQuiz = {
      id: Date.now(),
      title: `Quiz from ${selectedNoteTitles.join(', ')}`,
      status: 'draft',
      questions: generatedQuestions,
      generatedFrom: selectedNotes.length
    };
    
    setDrafts([...drafts, newQuiz]);
    setSelectedNotes([]);
    setShowAIModal(false);
    setIsGenerating(false);
  };

  const handleEdit = (quiz) => setEditingQuiz({...quiz});
  const handleUpdateQuiz = () => {
    if (!editingQuiz) return;
    if (editingQuiz.status === 'draft') {
      setDrafts(drafts.map(q => q.id === editingQuiz.id ? editingQuiz : q));
    } else {
      setPublished(published.map(q => q.id === editingQuiz.id ? editingQuiz : q));
    }
    setEditingQuiz(null);
    setShowEditModal(false);
  };
  const handleDelete = (id, status) => {
    if (status === 'draft') setDrafts(drafts.filter(q => q.id !== id));
    else setPublished(published.filter(q => q.id !== id));
  };
  const handlePublish = (id) => {
    const quiz = drafts.find(q => q.id === id);
    if (quiz) {
      setPublished([...published, { ...quiz, status: 'published', submissions: 0 }]);
      setDrafts(drafts.filter(q => q.id !== id));
    }
  };
  const toggleNoteSelection = (noteId) => {
    setSelectedNotes(prev => prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]);
  };
  const updateQuizTitle = (value) => setEditingQuiz({...editingQuiz, title: value});
  const updateQuestion = (qIndex, field, value) => {
    const updatedQuestions = [...editingQuiz.questions];
    updatedQuestions[qIndex] = {...updatedQuestions[qIndex], [field]: value};
    setEditingQuiz({...editingQuiz, questions: updatedQuestions});
  };
  const updateOption = (qIndex, optIndex, value) => {
    const updatedQuestions = [...editingQuiz.questions];
    const updatedOptions = [...updatedQuestions[qIndex].options];
    updatedOptions[optIndex] = value;
    updatedQuestions[qIndex] = {...updatedQuestions[qIndex], options: updatedOptions};
    setEditingQuiz({...editingQuiz, questions: updatedQuestions});
  };
  const addQuestion = () => {
    const newQuestion = { id: Date.now(), question: '', options: ['', '', '', ''], correctAnswer: 0 };
    setEditingQuiz({ ...editingQuiz, questions: [...editingQuiz.questions, newQuestion] });
  };
  const removeQuestion = (qIndex) => {
    const updatedQuestions = editingQuiz.questions.filter((_, i) => i !== qIndex);
    setEditingQuiz({...editingQuiz, questions: updatedQuestions});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Quizzes</h2>
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Create with AI
          </button>
        </div>

        {/* Drafts Section */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Drafts</h3>
          <div className="space-y-4">
            {drafts.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No drafts yet. Create your first quiz!</p>
              </div>
            ) : (
              drafts.map(quiz => (
                <div
                  key={quiz.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <h4 className="text-lg font-semibold text-gray-900">{quiz.title}</h4>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">draft</span>
                    <span className="text-sm text-gray-500">{quiz.questions?.length || 0} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { handleEdit(quiz); setShowEditModal(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(quiz.id, 'draft')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <button
                      onClick={() => handlePublish(quiz.id)}
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

        {/* Published Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Published</h3>
          <div className="space-y-4">
            {published.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No published quizzes yet.</p>
              </div>
            ) : (
              published.map(quiz => (
                <div
                  key={quiz.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <h4 className="text-lg font-semibold text-gray-900">{quiz.title}</h4>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">published</span>
                    <span className="text-sm text-gray-500">{quiz.questions?.length || 0} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { handleEdit(quiz); setShowEditModal(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(quiz.id, 'published')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      <Eye className="w-4 h-4" /> View Results
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Generate Quiz with AI</h3>
              <button
                onClick={() => { setShowAIModal(false); setSelectedNotes([]); }}
                className="text-gray-400 hover:text-gray-600"
                disabled={isGenerating}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <h4 className="font-semibold text-gray-900 mb-4">Select Source Notes</h4>
              <div className="space-y-3">
                {availableNotes.map(note => (
                  <label
                    key={note.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedNotes.includes(note.id)
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedNotes.includes(note.id)}
                      onChange={() => toggleNoteSelection(note.id)}
                      disabled={isGenerating}
                      className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-600"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{note.title}</p>
                        <p className="text-sm text-gray-500">{note.date}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => { setShowAIModal(false); setSelectedNotes([]); }}
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
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </span>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quiz Modal */}
      {showEditModal && editingQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Edit Quiz</h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingQuiz(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Quiz Title</label>
                <input
                  type="text"
                  value={editingQuiz.title}
                  onChange={(e) => updateQuizTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="space-y-6">
                {editingQuiz.questions.map((q, qIndex) => (
                  <div key={q.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Question {qIndex + 1}</h4>
                      {editingQuiz.questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                      <textarea
                        value={q.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                        rows="2"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Options</label>
                      {q.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correctAnswer === optIndex}
                            onChange={() => updateQuestion(qIndex, 'correctAnswer', optIndex)}
                            className="w-4 h-4 text-green-600"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-600"
                          />
                          {q.correctAnswer === optIndex && (
                            <span className="text-xs text-green-600 font-medium">Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addQuestion}
                className="mt-6 flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 font-semibold rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Question
              </button>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => { setShowEditModal(false); setEditingQuiz(null); }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateQuiz}
                className="flex-1 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizzesPage;
