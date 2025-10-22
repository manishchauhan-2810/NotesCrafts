// FrontendStudent/src/components/QuizResultModal.jsx
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Award, TrendingUp, Loader } from 'lucide-react';
import { getQuizResult } from '../api/quizApi';

export default function QuizResultModal({ quizId, studentId, onClose }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [quizId, studentId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const response = await getQuizResult(quizId, studentId);
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
  const quiz = result.quizId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quiz Result</h2>
              <p className="text-gray-600 mt-1">{quiz.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6 cursor-pointer" />
            </button>
          </div>
        </div>

        {/* Score Summary */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score */}
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {result.score}/{result.totalQuestions}
              </div>
              <p className="text-sm text-gray-600">Correct Answers</p>
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

          <div className="mt-4 text-center text-sm text-gray-600">
            Submitted on {new Date(result.submittedAt).toLocaleString()}
          </div>
        </div>

        {/* Detailed Answers */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Answer Review</h3>
          
          <div className="space-y-6">
            {result.answers.map((answer, index) => {
              const question = quiz.questions.find(q => q._id === answer.questionId);
              
              return (
                <div
                  key={answer.questionId}
                  className={`p-6 rounded-lg border-2 ${
                    answer.isCorrect
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex-1">
                      Question {index + 1}
                    </h4>
                    {answer.isCorrect ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        Correct
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
                        <XCircle className="w-4 h-4" />
                        Incorrect
                      </div>
                    )}
                  </div>

                  {/* Question Text */}
                  <p className="text-gray-800 mb-4">{question.question}</p>

                  {/* Options */}
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => {
                      const isCorrectAnswer = option === answer.correctAnswer;
                      const isSelectedAnswer = option === answer.selectedAnswer;
                      
                      let optionClass = 'bg-white border-gray-200';
                      if (isCorrectAnswer) {
                        optionClass = 'bg-green-100 border-green-500';
                      } else if (isSelectedAnswer && !answer.isCorrect) {
                        optionClass = 'bg-red-100 border-red-500';
                      }

                      return (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg border-2 ${optionClass}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span className="flex-1 text-gray-900">{option}</span>
                            {isCorrectAnswer && (
                              <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                                Correct Answer
                              </span>
                            )}
                            {isSelectedAnswer && !answer.isCorrect && (
                              <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                                Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
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