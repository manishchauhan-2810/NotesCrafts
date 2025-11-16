// FrontendStudent/src/components/TestResultModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Award, TrendingUp, Loader, AlertCircle, Sparkles } from 'lucide-react';
import { getTestResult } from '../api/testApi';

export default function TestResultModal({ testPaperId, studentId, onClose }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [testPaperId, studentId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const response = await getTestResult(testPaperId, studentId);
      setResult(response.submission);
    } catch (error) {
      console.error('Error fetching result:', error);
      alert('Failed to load result');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    return { grade: 'F', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="flex items-center gap-3">
            <Loader className="w-6 h-6 text-purple-600 animate-spin" />
            <span className="text-gray-600">Loading result...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const gradeInfo = getGrade(result.percentage);
  const testPaper = result.testPaperId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Test Result</h2>
              <p className="text-gray-600 mt-1">{testPaper.title}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6 cursor-pointer" />
            </button>
          </div>
        </div>

        {/* Score Summary */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Marks */}
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {result.marksObtained}/{result.totalMarks}
              </div>
              <p className="text-sm text-gray-600">Marks Obtained</p>
            </div>

            {/* Percentage */}
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {result.percentage}%
              </div>
              <p className="text-sm text-gray-600">Percentage</p>
            </div>

            {/* Grade */}
            <div className={`rounded-lg p-6 text-center shadow-sm ${gradeInfo.bgColor}`}>
              <div className={`text-6xl font-bold ${gradeInfo.color} mb-1`}>
                {gradeInfo.grade}
              </div>
              <p className="text-sm text-gray-600">Grade</p>
            </div>
          </div>

          {/* Submission Info */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Submitted on {new Date(result.submittedAt).toLocaleString()}
            {result.checkedAt && (
              <span> • Checked on {new Date(result.checkedAt).toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* Answers Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Answer Review</h3>

          <div className="space-y-6">
            {result.answers.map((answer, index) => {
              const marksPercentage = (answer.marksAwarded / answer.marks) * 100;

              return (
                <div
                  key={answer.questionId}
                  className={`p-6 rounded-lg border-2 ${
                    marksPercentage === 100
                      ? 'border-green-200 bg-green-50'
                      : marksPercentage >= 50
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex-1">
                      Question {index + 1}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      marksPercentage === 100
                        ? 'bg-green-600 text-white'
                        : marksPercentage >= 50
                        ? 'bg-yellow-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}>
                      {answer.marksAwarded}/{answer.marks} marks
                    </span>
                  </div>

                  <p className="text-gray-800 mb-4">{answer.question}</p>

                  {/* Student Answer */}
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Your Answer:</h5>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {answer.studentAnswer || 'Not answered'}
                      </p>
                    </div>
                  </div>

                  {/* Answer Key */}
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Expected Answer:</h5>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-blue-900 whitespace-pre-wrap">{answer.answerKey}</p>
                    </div>
                  </div>

                  {/* Feedback */}
                  {(answer.aiFeedback || answer.teacherFeedback) && (
                    <div className="space-y-2">
                      {answer.aiFeedback && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <p className="text-sm text-purple-900">
                            <span className="font-semibold">✨ AI Feedback: </span>
                            {answer.aiFeedback}
                          </p>
                        </div>
                      )}
                      {answer.teacherFeedback && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-900">
                            <span className="font-semibold">👨‍🏫 Teacher Feedback: </span>
                            {answer.teacherFeedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Checked By Badge */}
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
                      {answer.checkedBy === 'both' && '✅ Verified by Teacher'}
                      {answer.checkedBy === 'pending' && '⏳ Pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
