
import express from 'express';
import { generateQuiz, getQuiz } from '../controllers/quizController.js';

const router = express.Router();

router.post('/generate', generateQuiz);
router.get('/:noteId', getQuiz);

export default router;
