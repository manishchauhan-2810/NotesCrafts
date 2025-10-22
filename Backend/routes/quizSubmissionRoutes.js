// Backend/routes/quizSubmissionRoutes.js
import express from 'express';
import {
  submitQuiz,
  getQuizResult,
  checkSubmission,
  getQuizSubmissions
} from '../controllers/quizSubmissionController.js';

const router = express.Router();

// Submit quiz
router.post('/submit', submitQuiz);

// Get student's result
router.get('/result/:quizId/:studentId', getQuizResult);

// Check if submitted
router.get('/check/:quizId/:studentId', checkSubmission);

// Get all submissions for quiz (Teacher)
router.get('/quiz/:quizId', getQuizSubmissions);

export default router;