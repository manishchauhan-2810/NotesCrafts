// FrontendTeacher/src/Pages/TestResultsViewer.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Download, User, Clock, CheckCircle, XCircle, 
  Edit2, Save, X, AlertTriangle, Sparkles, FileText, TrendingUp, Loader 
} from 'lucide-react';
import { 
  getTestSubmissions, 
  checkTestWithAI, 
  updateMarksManually,
  getTestPaperById
} from '../api/testPaperApi';

const TestResultsViewer = () => {
  const { classId, testId } = useParams();
  const navigate = useNavigate();

  const [testPaper, setTestPaper] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingMarks, setEditingMarks] = useState({});
  const [isAIChecking, setIsAIChecking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [testId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const testResponse = await getTestPaperById(testId);
      setTestPaper(testResponse);

      const submissionsResponse = await getTestSubmissions(testId);
      setSubmissions(submissionsResponse.submissions || []);

      if (submissionsResponse.submissions.length > 0) {
        setSelectedStudent(submissionsResponse.submissions[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  const handleAIChecking = async () => {
    if (!confirm('This will check all pending submissions using AI. Continue?')) return;

    try {
      setIsAIChecking(true);

      const response = await checkTestWithAI(testId);

      alert(`✅ AI Checking Complete!\n\nChecked ${response.checkedCount}/${response.totalSubmissions} submissions`);

      await fetchData();
    } catch (error) {
      console.error('AI checking error:', error);
      alert(error.response?.data?.error || 'Failed to check with AI');
    } finally {
      setIsAIChecking(false);
    }
  };

  const startEditingMarks = (questionId, currentMarks) => {
    setEditingMarks({ ...editingMarks, [questionId]: currentMarks });
  };

  const saveMarks = async (questionId) => {
    try {
      const newMarks = editingMarks[questionId];

      const updatedAnswers = selectedStudent.answers.map(ans =>
        ans.questionId === questionId
          ? { questionId: ans.questionId, marksAwarded: newMarks, teacherFeedback: ans.teacherFeedback }
          : { questionId: ans.questionId, marksAwarded: ans.marksAwarded, teacherFeedback: ans.teacherFeedback }
      );

      await updateMarksManually(selectedStudent._id, updatedAnswers);

      alert('✅ Marks updated successfully!');

      await fetchData();

      const newEditingMarks = { ...editingMarks };
      delete newEditingMarks[questionId];
      setEditingMarks(newEditingMarks);
    } catch (error) {
      console.error('Error updating marks:', error);
      alert('Failed to update marks');
    }
  };

  const cancelEditingMarks = (questionId) => {
    const newEditingMarks = { ...editingMarks };
    delete newEditingMarks[questionId];
    setEditingMarks(newEditingMarks);
  };

  const getTextareaRows = (type) => {
    if (type === 'short') return 3;
    if (type === 'medium') return 6;
    if (type === 'long') return 12;
    return 5;
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading test results...</p>
        </div>
      </div>
    );
  }

  // TEST NOT FOUND
  if (!testPaper) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-semibold">Test paper not found</p>
          <button
            onClick={() => navigate(`/class/${classId}/test-papers`)}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition cursor-pointer"
          >
            Back to Test Papers
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const checkedCount = submissions.filter(s => s.status === 'checked').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* LEFT SIDEBAR */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => navigate(`/class/${classId}/test-papers`)}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Test Papers
          </button>
          
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">{testPaper.title}</h2>
            <p className="text-sm text-gray-500">{testPaper.totalMarks} marks total</p>
          </div>
          
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-gray-600">Total: {submissions.length} students</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
              Checked: {checkedCount}
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
              Pending: {pendingCount}
            </span>
          </div>

          {pendingCount > 0 && (
            <button
              onClick={handleAIChecking}
              disabled={isAIChecking}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isAIChecking ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Checking with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Check All with AI ({pendingCount})
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {submissions.length === 0 ? (
            <div className="p-6 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No submissions yet</p>
            </div>
          ) : (
            submissions.map(student => (
              <div
                key={student._id}
                onClick={() => setSelectedStudent(student)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedStudent?._id === student._id
                    ? 'bg-purple-50 border-l-4 border-l-purple-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{student.studentName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(student.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {student.status === 'checked' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    student.status === 'checked'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {student.status === 'checked' ? 'Checked' : 'Pending'}
                  </span>
                  {student.status === 'checked' && (
                    <span className="font-semibold text-purple-600">
                      {student.marksObtained}/{student.totalMarks}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL - STUDENT ANSWER SHEET */}
      <div className="flex-1 overflow-y-auto">
        {selectedStudent ? (
          <div className="max-w-5xl mx-auto p-8">

            {/* STUDENT HEADER */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedStudent.studentName}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(selectedStudent.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">
                    {selectedStudent.marksObtained}/{selectedStudent.totalMarks}
                  </div>
                  <p className="text-sm text-gray-500">{selectedStudent.percentage}%</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedStudent.status === 'checked'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedStudent.status === 'checked' ? 'Checked' : 'Pending'}
                  </span>
                </div>
              </div>

              {selectedStudent.status === 'checked' && selectedStudent.checkedAt && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Checked on: {new Date(selectedStudent.checkedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* QUESTIONS LOOP */}
            <div className="space-y-6">
              {selectedStudent.answers.map((answer, index) => {
                const question = testPaper.questions.find(q => q._id === answer.questionId);
                const isEditing = editingMarks[answer.questionId] !== undefined;

                return (
                  <div key={answer.questionId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    
                    {/* QUESTION TITLE */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Question {index + 1}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          question.type === 'short' 
                            ? 'bg-blue-100 text-blue-700'
                            : question.type === 'medium'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          {question.marks} marks
                        </span>
                      </div>
                      <p className="text-gray-700">{question.question}</p>
                    </div>

                    {/* STUDENT ANSWER */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Student's Answer:</h4>
                      <textarea
                        value={answer.studentAnswer}
                        readOnly
                        rows={getTextareaRows(question.type)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 resize-none"
                      />
                    </div>

                    {/* ANSWER KEY */}
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">Answer Key:</h4>
                      <p className="text-blue-800 whitespace-pre-wrap">{question.answerKey}</p>

                      {question.answerGuidelines && (
                        <p className="text-xs text-blue-600 mt-2">
                          <strong>Guidelines:</strong> {question.answerGuidelines}
                        </p>
                      )}
                    </div>

                    {/* GRADING */}
                    <div className="border-t border-gray-200 pt-4">

                      <div className="flex items-center gap-6">

                        {/* AI MARKS */}
                        {answer.aiMarks !== null && (
                          <>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">AI Suggestion</p>
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <span className="font-semibold text-purple-600">
                                  {answer.aiMarks}/{question.marks}
                                </span>
                              </div>
                            </div>

                            <div className="h-8 w-px bg-gray-300"></div>
                          </>
                        )}

                        {/* MARKS AWARDED */}
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Marks Awarded</p>

                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max={question.marks}
                                value={editingMarks[answer.questionId]}
                                onChange={(e) =>
                                  setEditingMarks({
                                    ...editingMarks,
                                    [answer.questionId]: Math.min(
                                      question.marks,
                                      Math.max(0, parseInt(e.target.value) || 0)
                                    )
                                  })
                                }
                                className="w-20 px-3 py-1 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-purple-600"
                              />
                              <button
                                onClick={() => saveMarks(answer.questionId)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded cursor-pointer"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => cancelEditingMarks(answer.questionId)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold ${
                                  answer.marksAwarded === question.marks
                                    ? 'text-green-600'
                                    : answer.marksAwarded > 0
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {answer.marksAwarded}/{question.marks}
                              </span>
                              <button
                                onClick={() => startEditingMarks(answer.questionId, answer.marksAwarded)}
                                className="p-1 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* AI FEEDBACK */}
                      {answer.aiFeedback && (
                        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-sm text-purple-900">
                            <span className="font-semibold">AI Feedback:</span> {answer.aiFeedback}
                          </p>
                        </div>
                      )}

                      {/* TEACHER FEEDBACK */}
                      {answer.teacherFeedback && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">
                            <span className="font-semibold">Teacher Feedback:</span> {answer.teacherFeedback}
                          </p>
                        </div>
                      )}

                      {/* CHECKED BY */}
                      <div className="mt-3">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                            answer.checkedBy === 'ai'
                              ? 'bg-purple-100 text-purple-700'
                              : answer.checkedBy === 'teacher'
                              ? 'bg-blue-100 text-blue-700'
                              : answer.checkedBy === 'both'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {answer.checkedBy === 'ai' && '✨ Checked by AI'}
                          {answer.checkedBy === 'teacher' && '👨‍🏫 Checked by Teacher'}
                          {answer.checkedBy === 'both' && '✅ Checked by AI & Teacher'}
                          {answer.checkedBy === 'pending' && '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FINAL SUMMARY */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Final Score</h3>
                  <p className="text-sm text-gray-600">
                    {selectedStudent.status === 'checked'
                      ? 'Results finalized and saved'
                      : 'Awaiting completion of checking'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <div className="text-3xl font-bold text-purple-600">
                      {selectedStudent.marksObtained}/{selectedStudent.totalMarks}
                    </div>
                    <p className="text-sm text-gray-500">{selectedStudent.percentage}%</p>
                  </div>

                  {selectedStudent.status === 'checked' && (
                    <button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                      Download Report
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">
                Select a student to view their answer sheet
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResultsViewer;
