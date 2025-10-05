import React, { useState } from 'react';
import { Sparkles, Pencil, Trash2, CheckCircle, Eye, X, FileText, Plus, Minus } from 'lucide-react';

const TestPapersPage = () => {
  const [drafts, setDrafts] = useState([
    { 
      id: 1, 
      title: 'Cell Structure Basics Test', 
      status: 'draft',
      questions: [
        { id: 1, question: 'Explain the structure and function of mitochondria.', type: 'long', marks: 5 },
        { id: 2, question: 'What is the role of ribosomes?', type: 'short', marks: 2 }
      ]
    }
  ]);
  const [published, setPublished] = useState([
    { 
      id: 2, 
      title: 'Photosynthesis Test Paper', 
      status: 'published', 
      submissions: 18,
      questions: [
        { id: 1, question: 'Describe the process of photosynthesis in detail.', type: 'long', marks: 10 }
      ]
    }
  ]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
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
      { id: 1, question: `Explain in detail the main concept discussed in ${selectedNoteTitles[0]}.`, type: 'long', marks: 10 },
      { id: 2, question: `What are the key components mentioned in ${selectedNoteTitles[0]}?`, type: 'short', marks: 3 },
      { id: 3, question: `Describe the process or mechanism explained in the notes about ${selectedNoteTitles[0]}.`, type: 'long', marks: 8 },
      { id: 4, question: `Define the important terms related to ${selectedNoteTitles[0]}.`, type: 'short', marks: 2 }
    ];

    if (selectedNotes.length > 1) {
      generatedQuestions.push({
        id: 5,
        question: `Compare and contrast ${selectedNoteTitles[0]} with ${selectedNoteTitles[1]}.`,
        type: 'long',
        marks: 10
      });
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newTest = {
      id: Date.now(),
      title: `Test Paper from ${selectedNoteTitles.join(', ')}`,
      status: 'draft',
      questions: generatedQuestions,
      generatedFrom: selectedNotes.length
    };
    
    setDrafts([...drafts, newTest]);
    setSelectedNotes([]);
    setShowAIModal(false);
    setIsGenerating(false);
  };

  const handleEdit = (test) => setEditingTest({...test});
  const handleUpdateTest = () => {
    if (!editingTest) return;
    if (editingTest.status === 'draft') {
      setDrafts(drafts.map(t => t.id === editingTest.id ? editingTest : t));
    } else {
      setPublished(published.map(t => t.id === editingTest.id ? editingTest : t));
    }
    setEditingTest(null);
    setShowEditModal(false);
  };
  const handleDelete = (id, status) => {
    if (status === 'draft') setDrafts(drafts.filter(t => t.id !== id));
    else setPublished(published.filter(t => t.id !== id));
  };
  const handlePublish = (id) => {
    const test = drafts.find(t => t.id === id);
    if (test) {
      setPublished([...published, { ...test, status: 'published', submissions: 0 }]);
      setDrafts(drafts.filter(t => t.id !== id));
    }
  };
  const toggleNoteSelection = (noteId) => {
    setSelectedNotes(prev => prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]);
  };
  const updateTestTitle = (value) => setEditingTest({...editingTest, title: value});
  const updateQuestion = (qIndex, field, value) => {
    const updatedQuestions = [...editingTest.questions];
    updatedQuestions[qIndex] = {...updatedQuestions[qIndex], [field]: value};
    setEditingTest({...editingTest, questions: updatedQuestions});
  };
  const addQuestion = () => {
    const newQuestion = { id: Date.now(), question: '', type: 'short', marks: 2 };
    setEditingTest({ ...editingTest, questions: [...editingTest.questions, newQuestion] });
  };
  const removeQuestion = (qIndex) => {
    const updatedQuestions = editingTest.questions.filter((_, i) => i !== qIndex);
    setEditingTest({...editingTest, questions: updatedQuestions});
  };

  const getTotalMarks = (questions) => {
    return questions?.reduce((sum, q) => sum + (q.marks || 0), 0) || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Test Papers</h2>
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
                <p className="text-gray-500">No drafts yet. Create your first test paper!</p>
              </div>
            ) : (
              drafts.map(test => (
                <div
                  key={test.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <h4 className="text-lg font-semibold text-gray-900">{test.title}</h4>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">draft</span>
                    <span className="text-sm text-gray-500">{test.questions?.length || 0} questions</span>
                    <span className="text-sm text-gray-500">• {getTotalMarks(test.questions)} marks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { handleEdit(test); setShowEditModal(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(test.id, 'draft')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <button
                      onClick={() => handlePublish(test.id)}
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
                <p className="text-gray-500">No published test papers yet.</p>
              </div>
            ) : (
              published.map(test => (
                <div
                  key={test.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <h4 className="text-lg font-semibold text-gray-900">{test.title}</h4>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">published</span>
                    <span className="text-sm text-gray-500">{test.questions?.length || 0} questions</span>
                    <span className="text-sm text-gray-500">• {getTotalMarks(test.questions)} marks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { handleEdit(test); setShowEditModal(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(test.id, 'published')}
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
              <h3 className="text-2xl font-bold text-gray-900">Generate Test Paper with AI</h3>
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

      {/* Edit Test Paper Modal */}
      {showEditModal && editingTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Edit Test Paper</h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingTest(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Test Paper Title</label>
                <input
                  type="text"
                  value={editingTest.title}
                  onChange={(e) => updateTestTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-semibold text-purple-900">
                  Total Marks: {getTotalMarks(editingTest.questions)}
                </p>
              </div>

              <div className="space-y-6">
                {editingTest.questions.map((q, qIndex) => (
                  <div key={q.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900">Question {qIndex + 1}</h4>
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-600"
                        >
                          <option value="short">Short Answer</option>
                          <option value="long">Long Answer</option>
                        </select>
                      </div>
                      {editingTest.questions.length > 1 && (
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
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Marks</label>
                      <input
                        type="number"
                        value={q.marks}
                        onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value) || 0)}
                        min="1"
                        max="20"
                        className="w-24 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-600"
                      />
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
                onClick={() => { setShowEditModal(false); setEditingTest(null); }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTest}
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

export default TestPapersPage;