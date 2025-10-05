import React, { useState } from 'react';
import { ChevronLeft, Download, User, Clock, CheckCircle, XCircle, Edit2, Save, X, AlertTriangle, Sparkles, FileText, TrendingUp } from 'lucide-react';

const TestResultsViewer = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingMarks, setEditingMarks] = useState({});
  const [isAIGrading, setIsAIGrading] = useState(false);
  const [showPlagiarismDetails, setShowPlagiarismDetails] = useState(false);

  // Sample test paper data
  const testPaper = {
    id: 1,
    title: 'Photosynthesis Test Paper',
    totalMarks: 50,
    questions: [
      { id: 1, question: 'Explain the process of photosynthesis in detail.', type: 'long', marks: 15 },
      { id: 2, question: 'What are the raw materials required for photosynthesis?', type: 'short', marks: 5 },
      { id: 3, question: 'Describe the role of chlorophyll in photosynthesis.', type: 'long', marks: 10 },
      { id: 4, question: 'What is the end product of photosynthesis?', type: 'short', marks: 5 },
      { id: 5, question: 'Compare light and dark reactions in photosynthesis.', type: 'long', marks: 15 }
    ]
  };

  // Sample student submissions
  const [students, setStudents] = useState([
    {
      id: 1,
      name: 'Aarav Sharma',
      email: 'aarav.sharma@school.com',
      submittedAt: '2024-10-01 10:30 AM',
      status: 'graded',
      totalMarks: 42,
      plagiarismScore: 15,
      aiDetection: 22,
      answers: [
        { 
          questionId: 1, 
          answer: 'Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in chloroplasts and involves two main stages: light-dependent reactions and light-independent reactions (Calvin cycle). During light reactions, water molecules are split, oxygen is released, and ATP and NADPH are produced. In the Calvin cycle, CO2 is fixed and glucose is synthesized using the ATP and NADPH from light reactions.',
          marksAwarded: 13,
          maxMarks: 15,
          aiSuggestion: 13,
          feedback: 'Good explanation but missing details about thylakoid and stroma.'
        },
        { 
          questionId: 2, 
          answer: 'The raw materials are carbon dioxide, water, and sunlight. Chlorophyll also plays a role.',
          marksAwarded: 4,
          maxMarks: 5,
          aiSuggestion: 4,
          feedback: 'Correct, but chlorophyll is not a raw material.'
        },
        { 
          questionId: 3, 
          answer: 'Chlorophyll is a green pigment found in chloroplasts. It absorbs light energy, mainly in the blue and red wavelengths, and reflects green light. This absorbed energy is used to drive the photosynthesis process by exciting electrons.',
          marksAwarded: 9,
          maxMarks: 10,
          aiSuggestion: 9,
          feedback: 'Excellent answer with good detail.'
        },
        { 
          questionId: 4, 
          answer: 'Glucose and oxygen',
          marksAwarded: 5,
          maxMarks: 5,
          aiSuggestion: 5,
          feedback: 'Perfect!'
        },
        { 
          questionId: 5, 
          answer: 'Light reactions occur in thylakoid membranes and require light. They produce ATP and NADPH. Dark reactions occur in stroma and do not require light directly. They use ATP and NADPH to fix CO2 and produce glucose.',
          marksAwarded: 11,
          maxMarks: 15,
          aiSuggestion: 12,
          feedback: 'Good comparison but lacks depth in explanation.'
        }
      ]
    },
    {
      id: 2,
      name: 'Diya Patel',
      email: 'diya.patel@school.com',
      submittedAt: '2024-10-01 11:15 AM',
      status: 'pending',
      totalMarks: 0,
      plagiarismScore: 8,
      aiDetection: 12,
      answers: [
        { 
          questionId: 1, 
          answer: 'Photosynthesis is how plants make food using sunlight, water and carbon dioxide. The process happens in leaves and produces oxygen as a byproduct.',
          marksAwarded: 0,
          maxMarks: 15,
          aiSuggestion: 7,
          feedback: ''
        },
        { 
          questionId: 2, 
          answer: 'Carbon dioxide from air, water from soil, and light energy from sun.',
          marksAwarded: 0,
          maxMarks: 5,
          aiSuggestion: 5,
          feedback: ''
        },
        { 
          questionId: 3, 
          answer: 'Chlorophyll captures sunlight and helps in making food for plants.',
          marksAwarded: 0,
          maxMarks: 10,
          aiSuggestion: 5,
          feedback: ''
        },
        { 
          questionId: 4, 
          answer: 'Sugar and oxygen gas',
          marksAwarded: 0,
          maxMarks: 5,
          aiSuggestion: 5,
          feedback: ''
        },
        { 
          questionId: 5, 
          answer: 'Light reactions need light and make energy molecules. Dark reactions use those molecules to make glucose.',
          marksAwarded: 0,
          maxMarks: 15,
          aiSuggestion: 8,
          feedback: ''
        }
      ]
    },
    {
      id: 3,
      name: 'Rohan Verma',
      email: 'rohan.verma@school.com',
      submittedAt: '2024-10-01 09:45 AM',
      status: 'graded',
      totalMarks: 38,
      plagiarismScore: 35,
      aiDetection: 45,
      answers: [
        { 
          questionId: 1, 
          answer: 'Photosynthesis is a complex biochemical process...',
          marksAwarded: 10,
          maxMarks: 15,
          aiSuggestion: 11,
          feedback: 'High plagiarism detected. Content seems copied.'
        },
        { 
          questionId: 2, 
          answer: 'CO2, H2O, and light',
          marksAwarded: 5,
          maxMarks: 5,
          aiSuggestion: 5,
          feedback: ''
        },
        { 
          questionId: 3, 
          answer: 'Chlorophyll molecules absorb photons...',
          marksAwarded: 7,
          maxMarks: 10,
          aiSuggestion: 8,
          feedback: 'Possible AI-generated content.'
        },
        { 
          questionId: 4, 
          answer: 'Glucose (C6H12O6) and O2',
          marksAwarded: 5,
          maxMarks: 5,
          aiSuggestion: 5,
          feedback: ''
        },
        { 
          questionId: 5, 
          answer: 'Light reactions are photo-dependent...',
          marksAwarded: 11,
          maxMarks: 15,
          aiSuggestion: 12,
          feedback: ''
        }
      ]
    },
    {
      id: 4,
      name: 'Ananya Singh',
      email: 'ananya.singh@school.com',
      submittedAt: '2024-10-01 10:00 AM',
      status: 'pending',
      totalMarks: 0,
      plagiarismScore: 5,
      aiDetection: 10,
      answers: [
        { questionId: 1, answer: 'Plants use sunlight to convert carbon dioxide and water into glucose. This process releases oxygen into the atmosphere. Chloroplasts contain chlorophyll which captures light energy.', marksAwarded: 0, maxMarks: 15, aiSuggestion: 9, feedback: '' },
        { questionId: 2, answer: 'Sunlight, carbon dioxide, and water', marksAwarded: 0, maxMarks: 5, aiSuggestion: 5, feedback: '' },
        { questionId: 3, answer: 'Chlorophyll is essential for capturing light energy and converting it to chemical energy.', marksAwarded: 0, maxMarks: 10, aiSuggestion: 6, feedback: '' },
        { questionId: 4, answer: 'Glucose', marksAwarded: 0, maxMarks: 5, aiSuggestion: 3, feedback: '' },
        { questionId: 5, answer: 'Light reactions happen during day and dark reactions during night.', marksAwarded: 0, maxMarks: 15, aiSuggestion: 4, feedback: '' }
      ]
    },
    {
      id: 5,
      name: 'Kabir Malhotra',
      email: 'kabir.malhotra@school.com',
      submittedAt: '2024-10-01 11:30 AM',
      status: 'pending',
      totalMarks: 0,
      plagiarismScore: 12,
      aiDetection: 18,
      answers: [
        { questionId: 1, answer: 'Detailed answer about photosynthesis...', marksAwarded: 0, maxMarks: 15, aiSuggestion: 12, feedback: '' },
        { questionId: 2, answer: 'Water, CO2, sunlight', marksAwarded: 0, maxMarks: 5, aiSuggestion: 5, feedback: '' },
        { questionId: 3, answer: 'Chlorophyll absorbs light...', marksAwarded: 0, maxMarks: 10, aiSuggestion: 8, feedback: '' },
        { questionId: 4, answer: 'Glucose and oxygen', marksAwarded: 0, maxMarks: 5, aiSuggestion: 5, feedback: '' },
        { questionId: 5, answer: 'Comparison of both reactions...', marksAwarded: 0, maxMarks: 15, aiSuggestion: 10, feedback: '' }
      ]
    }
  ]);

  const handleAIGrading = async () => {
    if (!selectedStudent || selectedStudent.status === 'graded') return;
    
    setIsAIGrading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedStudents = students.map(student => {
      if (student.id === selectedStudent.id) {
        const gradedAnswers = student.answers.map(answer => ({
          ...answer,
          marksAwarded: answer.aiSuggestion
        }));
        const total = gradedAnswers.reduce((sum, ans) => sum + ans.marksAwarded, 0);
        
        return {
          ...student,
          answers: gradedAnswers,
          totalMarks: total,
          status: 'graded'
        };
      }
      return student;
    });
    
    setStudents(updatedStudents);
    setSelectedStudent({
      ...selectedStudent,
      answers: selectedStudent.answers.map(ans => ({ ...ans, marksAwarded: ans.aiSuggestion })),
      totalMarks: selectedStudent.answers.reduce((sum, ans) => sum + ans.aiSuggestion, 0),
      status: 'graded'
    });
    setIsAIGrading(false);
  };

  const startEditingMarks = (questionId) => {
    const answer = selectedStudent.answers.find(a => a.questionId === questionId);
    setEditingMarks({ ...editingMarks, [questionId]: answer.marksAwarded });
  };

  const saveMarks = (questionId) => {
    const newMarks = editingMarks[questionId];
    
    const updatedStudents = students.map(student => {
      if (student.id === selectedStudent.id) {
        const updatedAnswers = student.answers.map(answer => 
          answer.questionId === questionId 
            ? { ...answer, marksAwarded: newMarks }
            : answer
        );
        const total = updatedAnswers.reduce((sum, ans) => sum + ans.marksAwarded, 0);
        
        return {
          ...student,
          answers: updatedAnswers,
          totalMarks: total,
          status: 'graded'
        };
      }
      return student;
    });
    
    setStudents(updatedStudents);
    setSelectedStudent({
      ...selectedStudent,
      answers: selectedStudent.answers.map(ans => 
        ans.questionId === questionId ? { ...ans, marksAwarded: newMarks } : ans
      ),
      totalMarks: selectedStudent.answers.reduce((sum, ans) => 
        sum + (ans.questionId === questionId ? newMarks : ans.marksAwarded), 0
      ),
      status: 'graded'
    });
    
    const newEditingMarks = { ...editingMarks };
    delete newEditingMarks[questionId];
    setEditingMarks(newEditingMarks);
  };

  const cancelEditingMarks = (questionId) => {
    const newEditingMarks = { ...editingMarks };
    delete newEditingMarks[questionId];
    setEditingMarks(newEditingMarks);
  };

  const getPlagiarismColor = (score) => {
    if (score < 15) return 'text-green-600 bg-green-50';
    if (score < 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAIDetectionColor = (score) => {
    if (score < 20) return 'text-green-600 bg-green-50';
    if (score < 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Student List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <button className="text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Test Results</h2>
              <p className="text-sm text-gray-500">{testPaper.title}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total: {students.length} students</span>
            <span className="text-gray-600">
              Graded: {students.filter(s => s.status === 'graded').length}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {students.map(student => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                selectedStudent?.id === student.id
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
                    <p className="font-semibold text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                </div>
                {student.status === 'graded' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{student.submittedAt}</span>
                {student.status === 'graded' && (
                  <span className="font-semibold text-purple-600">
                    {student.totalMarks}/{testPaper.totalMarks}
                  </span>
                )}
              </div>

              {student.status === 'graded' && (
                <div className="mt-2 flex gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getPlagiarismColor(student.plagiarismScore)}`}>
                    <AlertTriangle className="w-3 h-3" />
                    <span>P: {student.plagiarismScore}%</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getAIDetectionColor(student.aiDetection)}`}>
                    <Sparkles className="w-3 h-3" />
                    <span>AI: {student.aiDetection}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Answer Sheet */}
      <div className="flex-1 overflow-y-auto">
        {selectedStudent ? (
          <div className="max-w-5xl mx-auto p-8">
            {/* Header with Student Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedStudent.name}</h1>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted: {selectedStudent.submittedAt}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">
                    {selectedStudent.totalMarks}/{testPaper.totalMarks}
                  </div>
                  <p className="text-sm text-gray-500">
                    {((selectedStudent.totalMarks / testPaper.totalMarks) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleAIGrading}
                  disabled={selectedStudent.status === 'graded' || isAIGrading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isAIGrading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Grading...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {selectedStudent.status === 'graded' ? 'AI Graded' : 'Grade with AI'}
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowPlagiarismDetails(!showPlagiarismDetails)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  Analysis
                </button>

                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>

              {/* Plagiarism & AI Detection Details */}
              {showPlagiarismDetails && (
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${getPlagiarismColor(selectedStudent.plagiarismScore)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      <h3 className="font-semibold">Plagiarism Detection</h3>
                    </div>
                    <div className="text-2xl font-bold mb-1">{selectedStudent.plagiarismScore}%</div>
                    <p className="text-sm">
                      {selectedStudent.plagiarismScore < 15 ? 'Low risk - Original content' :
                       selectedStudent.plagiarismScore < 30 ? 'Moderate risk - Some similarities found' :
                       'High risk - Significant similarities detected'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${getAIDetectionColor(selectedStudent.aiDetection)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5" />
                      <h3 className="font-semibold">AI Detection</h3>
                    </div>
                    <div className="text-2xl font-bold mb-1">{selectedStudent.aiDetection}%</div>
                    <p className="text-sm">
                      {selectedStudent.aiDetection < 20 ? 'Low probability - Likely human written' :
                       selectedStudent.aiDetection < 40 ? 'Moderate probability - Mixed content' :
                       'High probability - Likely AI generated'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Answer Sheet */}
            <div className="space-y-6">
              {testPaper.questions.map((question, index) => {
                const studentAnswer = selectedStudent.answers.find(a => a.questionId === question.id);
                const isEditing = editingMarks[question.id] !== undefined;
                
                return (
                  <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {/* Question */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Question {index + 1}
                        </h3>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                            {question.type === 'short' ? 'Short Answer' : 'Long Answer'}
                          </span>
                          <span className="text-sm font-semibold text-gray-600">
                            {question.marks} marks
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700">{question.question}</p>
                    </div>

                    {/* Student Answer */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Student's Answer:</h4>
                      <p className="text-gray-900 whitespace-pre-wrap">{studentAnswer.answer}</p>
                    </div>

                    {/* Grading Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">AI Suggestion</p>
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-purple-600" />
                              <span className="font-semibold text-purple-600">
                                {studentAnswer.aiSuggestion}/{question.marks}
                              </span>
                            </div>
                          </div>

                          <div className="h-8 w-px bg-gray-300"></div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">Awarded Marks</p>
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max={question.marks}
                                  value={editingMarks[question.id]}
                                  onChange={(e) => setEditingMarks({
                                    ...editingMarks,
                                    [question.id]: Math.min(question.marks, Math.max(0, parseInt(e.target.value) || 0))
                                  })}
                                  className="w-20 px-3 py-1 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-purple-600"
                                />
                                <button
                                  onClick={() => saveMarks(question.id)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => cancelEditingMarks(question.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-green-600">
                                  {studentAnswer.marksAwarded}/{question.marks}
                                </span>
                                <button
                                  onClick={() => startEditingMarks(question.id)}
                                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {studentAnswer.feedback && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">
                            <span className="font-semibold">Feedback: </span>
                            {studentAnswer.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Final Actions */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Final Score</h3>
                  <p className="text-sm text-gray-600">
                    Review and finalize the grades before publishing
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <div className="text-3xl font-bold text-purple-600">
                      {selectedStudent.totalMarks}/{testPaper.totalMarks}
                    </div>
                    <p className="text-sm text-gray-500">
                      {((selectedStudent.totalMarks / testPaper.totalMarks) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                    Publish Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">Select a student to view their answer sheet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResultsViewer;