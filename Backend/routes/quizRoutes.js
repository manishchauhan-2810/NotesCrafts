// Backend/routes/quizRoutes.js
import express from 'express';
import {
  generateQuizWithAI,
  getQuiz,
  getQuizzesByClassroom,
  updateQuiz,
  deleteQuiz,
} from '../controllers/quizController.js';

const router = express.Router();

// ✅ AI Generation route
router.post('/generate-ai', generateQuizWithAI);

// Get quiz by ID
router.get('/:quizId', getQuiz);

// Get quizzes by classroom
router.get('/classroom/:classroomId', getQuizzesByClassroom);

// Update quiz
router.put('/:quizId', updateQuiz);

// Delete quiz
router.delete('/:quizId', deleteQuiz);

export default router;