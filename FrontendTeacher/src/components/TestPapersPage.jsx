// FrontendTeacher/src/components/TestPapersPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Pencil, Trash2, CheckCircle, Eye, Loader, FileText } from 'lucide-react';
import { 
  getTestPapersByClassroom, 
  deleteTestPaper,
  generateTestPaperWithAI
} from '../api/testPaperApi';
import { getNotesByClassroom } from '../api/notesApi';
import PublishTestModal from './PublishTestModal';
import EditAnswerKeysModal from './EditAnswerKeysModal';

const TestPapersPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState([]);
  const [published, setPublished] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [publishingTest, setPublishingTest] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const [availableNotes, setAvailableNotes] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);

  // Fetch test papers
  useEffect(() => {
    fetchTestPapers();
  }, [classId]);

  const fetchTestPapers = async () => {
    try {
      setLoading(true);
      const response = await getTestPapersByClassroom(classId);
      const testPapers = response.testPapers || [];

      setDrafts(testPapers.filter(t => t.status === 'draft'));
      setPublished(testPapers.filter(t => t.status === 'published'));
    } catch (error) {
      console.error('Error fetching test papers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Open AI modal and fetch notes
  const handleOpenAIModal = async () => {
    setShowAIModal(true);
    setLoadingNotes(true);

    try {
      const response = await getNotesByClassroom(classId);
      setAvailableNotes(response.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      alert('Failed to load notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  // Generate test paper with AI
  const handleGenerateWithAI = async () => {
    if (selectedNotes.length === 0) {
      alert('Please select at least one note');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await generateTestPaperWithAI(selectedNotes, classId);

      setDrafts(prev => [response.testPaper, ...prev]);

      alert(`✅ Test Paper Generated!\n\n` +
        `📊 Details:\n` +
        `• Questions: ${response.stats.questionsGenerated}\n` +
        `• Total Marks: ${response.stats.totalMarks}\n` +
        `• Notes processed: ${response.stats.processedNotes}/${response.stats.totalNotes}`
      );

      setSelectedNotes([]);
      setShowAIModal(false);
    } catch (error) {
      console.error('Generation error:', error);
      alert(error.response?.data?.error || 'Failed to generate test paper');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (testId, status) => {
    if (!confirm('Are you sure you want to delete this test paper?')) return;

    try {
      await deleteTestPaper(testId);

      if (status === 'draft') {
        setDrafts(drafts.filter(t => t._id !== testId));
      } else {
        setPublished(published.filter(t => t._id !== testId));
      }

      alert('Test paper deleted successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to delete test paper');
    }
  };

  const handleEditAnswerKeys = (test) => {
    setEditingTest(test);
    setShowEditModal(true);
  };

  const handlePublish = (test) => {
    setPublishingTest(test);
    setShowPublishModal(true);
  };

  const handleViewResults = (testId) => {
    navigate(`/class/${classId}/test-papers/results/${testId}`);
  };

  const toggleNoteSelection = (noteId) => {
    setSelectedNotes(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading test papers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Test Papers</h2>
        <button
          onClick={handleOpenAIModal}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
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
              <p className="text-gray-500">No drafts yet. Create your first test paper!</p>
            </div>
          ) : (
            drafts.map(test => (
              <div
                key={test._id}
                className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <h4 className="text-lg font-semibold text-gray-900">{test.title}</h4>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                    draft
                  </span>
                  <span className="text-sm text-gray-500">
                    {test.questions?.length || 0} questions • {test.totalMarks} marks
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditAnswerKeys(test)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" /> Edit Answer Keys
                  </button>
                  <button
                    onClick={() => handleDelete(test._id, 'draft')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                  <button
                    onClick={() => handlePublish(test)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
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
              <p className="text-gray-500">No published test papers yet.</p>
            </div>
          ) : (
            published.map(test => (
              <div
                key={test._id}
                className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <h4 className="text-lg font-semibold text-gray-900">{test.title}</h4>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    published
                  </span>
                  <span className="text-sm text-gray-500">
                    {test.questions?.length || 0} questions • {test.totalMarks} marks
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewResults(test._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> View Results
                  </button>
                  <button
                    onClick={() => handleDelete(test._id, 'published')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
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
                Generate Test Paper with AI
              </h3>
              <button
                onClick={() => {
                  setShowAIModal(false);
                  setSelectedNotes([]);
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={isGenerating}
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <h4 className="font-semibold text-gray-900 mb-4">
                Select Source Notes
              </h4>

              {loadingNotes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                  <span className="ml-3 text-gray-600">Loading notes...</span>
                </div>
              ) : availableNotes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No notes uploaded yet</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Please upload notes first in the Notes tab
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableNotes.map(note => (
                    <label
                      key={note._id}
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedNotes.includes(note._id)
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                          <p className="font-semibold text-gray-900">{note.title}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded by {note.uploadedBy} •{' '}
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
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateWithAI}
                disabled={selectedNotes.length === 0 || isGenerating}
                className="flex-1 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  `Generate Test Paper (${selectedNotes.length} notes)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Answer Keys Modal */}
      {showEditModal && editingTest && (
        <EditAnswerKeysModal
          testPaper={editingTest}
          onClose={() => {
            setShowEditModal(false);
            setEditingTest(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setEditingTest(null);
            fetchTestPapers();
          }}
        />
      )}

      {/* Publish Modal */}
      {showPublishModal && publishingTest && (
        <PublishTestModal
          testPaper={publishingTest}
          onClose={() => {
            setShowPublishModal(false);
            setPublishingTest(null);
          }}
          onPublished={() => {
            setShowPublishModal(false);
            setPublishingTest(null);
            fetchTestPapers();
          }}
        />
      )}
    </div>
  );
};

export default TestPapersPage;