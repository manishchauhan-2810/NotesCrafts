// FrontendStudent/src/components/TakeTestModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { submitTest } from '../api/testApi';

export default function TakeTestModal({ testPaper, studentId, studentName, onClose, onSubmit }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Calculate initial time
    if (testPaper.duration) {
      setTimeLeft(testPaper.duration * 60);
    } else if (testPaper.endTime) {
      const now = new Date();
      const end = new Date(testPaper.endTime);
      const diff = Math.floor((end - now) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    }
  }, [testPaper]);

  useEffect(() => {
    // Timer countdown
    if (timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft]);

  const formatTime = (seconds) => {
    if (seconds === null) return 'No time limit';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < testPaper.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleAutoSubmit = async () => {
    console.log('⏰ Time expired - Auto submitting test');
    await handleSubmitTest(true);
  };

  const handleSubmitClick = () => {
    const unanswered = testPaper.questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      setShowConfirmation(true);
    } else {
      handleSubmitTest(false);
    }
  };

  const handleSubmitTest = async (autoSubmit = false) => {
    try {
      setIsSubmitting(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Prepare answers array
      const answersArray = testPaper.questions.map(q => ({
        questionId: q._id,
        answer: answers[q._id] || '' // Empty if not answered
      }));

      console.log('📤 Submitting test:', { testPaperId: testPaper._id, studentId });

      await submitTest(testPaper._id, studentId, answersArray);

      if (!autoSubmit) {
        alert('✅ Test Submitted Successfully!\n\nYour answers have been submitted. Results will be available after teacher checks them.');
      } else {
        alert('⏰ Time Expired!\n\nYour test was auto-submitted. Results will be available after checking.');
      }

      onSubmit();
    } catch (error) {
      console.error('❌ Submit error:', error);
      alert(error.response?.data?.error || 'Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getTextareaRows = (type) => {
    if (type === 'short') return 3;
    if (type === 'medium') return 6;
    if (type === 'long') return 12;
    return 5;
  };

  const question = testPaper.questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{testPaper.title}</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-6 h-6 cursor-pointer" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of {testPaper.questions.length}
            </span>
            {timeLeft !== null && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                timeLeft < 60 ? 'bg-red-100 text-red-700' : 
                timeLeft < 300 ? 'bg-yellow-100 text-yellow-700' : 
                'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-semibold">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / testPaper.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Question {currentQuestion + 1}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                question.type === 'short'
                  ? 'bg-blue-100 text-blue-700'
                  : question.type === 'medium'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-pink-100 text-pink-700'
              }`}>
                {question.marks} marks
              </span>
            </div>

            <p className="text-gray-800 mb-4">{question.question}</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer:
              </label>
              <textarea
                value={answers[question._id] || ''}
                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                placeholder={`Write your answer here (${question.type === 'short' ? '2-3 lines' : question.type === 'medium' ? '5-6 lines' : '10-12 lines'} expected)...`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                rows={getTextareaRows(question.type)}
              />
              <p className="text-xs text-gray-500 mt-1">
                {question.type === 'short' && '💡 Tip: Keep it brief and to the point (2-3 lines)'}
                {question.type === 'medium' && '💡 Tip: Provide a detailed explanation (5-6 lines)'}
                {question.type === 'long' && '💡 Tip: Write a comprehensive answer with examples (10-12 lines)'}
              </p>
            </div>
          </div>

          {/* Answer Status */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Answered: {getAnsweredCount()} / {testPaper.questions.length}
              </span>
              {getAnsweredCount() < testPaper.questions.length && (
                <span className="text-sm text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {testPaper.questions.length - getAnsweredCount()} unanswered
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0 || isSubmitting}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Previous
            </button>

            {currentQuestion < testPaper.questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmitClick}
                disabled={isSubmitting}
                className="px-8 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit Test
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Submit Test?
                </h3>
                <p className="text-gray-600">
                  You have {testPaper.questions.length - getAnsweredCount()} unanswered question(s). 
                  Are you sure you want to submit?
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={() => handleSubmitTest(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}