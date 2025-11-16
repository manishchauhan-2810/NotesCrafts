import express from 'express';
import {
  submitTest,
  checkTestWithAI,
  getTestResult,
  checkSubmission,
  getTestSubmissions,
  updateMarksManually
} from '../controllers/testSubmissionController.js';

const router = express.Router();

// Submit test
router.post('/submit', submitTest);

// Check test with AI
router.post('/check-with-ai/:testPaperId', checkTestWithAI);

// Get student's result
router.get('/result/:testPaperId/:studentId', getTestResult);

// Check if submitted
router.get('/check/:testPaperId/:studentId', checkSubmission);

// Get all submissions for test (Teacher)
router.get('/test/:testPaperId', getTestSubmissions);

// Update marks manually (Teacher override)
router.put('/update-marks/:submissionId', updateMarksManually);

export default router;