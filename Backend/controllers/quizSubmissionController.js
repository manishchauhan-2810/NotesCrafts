// Backend/controllers/quizSubmissionController.js
import QuizSubmission from "../models/QuizSubmission.js";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";

/**
 * Submit quiz answers and auto-grade
 * POST /api/quiz-submission/submit
 */
export const submitQuiz = async (req, res) => {
  try {
    const { quizId, studentId, answers } = req.body;

    console.log("📥 Quiz submission received:", { quizId, studentId, answersCount: answers?.length });

    // Validation
    if (!quizId || !studentId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ 
        error: "quizId, studentId, and answers array are required" 
      });
    }

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check if already submitted
    const existingSubmission = await QuizSubmission.findOne({ quizId, studentId });
    if (existingSubmission) {
      return res.status(400).json({ 
        error: "Quiz already submitted",
        submission: existingSubmission 
      });
    }

    // Check if quiz is still active (time-based)
    if (quiz.endTime && new Date() > new Date(quiz.endTime)) {
      return res.status(400).json({ 
        error: "Quiz time has expired" 
      });
    }

    // Auto-grade answers
    let correctCount = 0;
    const gradedAnswers = answers.map(studentAnswer => {
      const question = quiz.questions.find(q => q._id.toString() === studentAnswer.questionId);
      
      if (!question) {
        throw new Error(`Question not found: ${studentAnswer.questionId}`);
      }

      const isCorrect = studentAnswer.selectedAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        questionId: studentAnswer.questionId,
        selectedAnswer: studentAnswer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = ((correctCount / totalQuestions) * 100).toFixed(2);

    // Save submission
    const submission = await QuizSubmission.create({
      quizId,
      studentId,
      studentName: student.name,
      answers: gradedAnswers,
      score: correctCount,
      totalQuestions,
      percentage: parseFloat(percentage),
      submittedAt: new Date()
    });

    console.log("✅ Quiz graded and saved:", {
      score: `${correctCount}/${totalQuestions}`,
      percentage: `${percentage}%`
    });

    res.status(201).json({
      success: true,
      message: "Quiz submitted and graded successfully",
      submission: {
        _id: submission._id,
        score: correctCount,
        totalQuestions,
        percentage: parseFloat(percentage),
        submittedAt: submission.submittedAt
      }
    });
  } catch (error) {
    console.error("❌ Quiz submission error:", error);
    res.status(500).json({ 
      error: "Failed to submit quiz",
      details: error.message 
    });
  }
};

/**
 * Get student's quiz result
 * GET /api/quiz-submission/result/:quizId/:studentId
 */
export const getQuizResult = async (req, res) => {
  try {
    const { quizId, studentId } = req.params;

    const submission = await QuizSubmission.findOne({ quizId, studentId })
      .populate('quizId', 'title questions');

    if (!submission) {
      return res.status(404).json({ error: "No submission found" });
    }

    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    console.error("Error fetching result:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Check if student has submitted quiz
 * GET /api/quiz-submission/check/:quizId/:studentId
 */
export const checkSubmission = async (req, res) => {
  try {
    const { quizId, studentId } = req.params;

    const submission = await QuizSubmission.findOne({ quizId, studentId });

    res.status(200).json({
      hasSubmitted: !!submission,
      submissionId: submission?._id || null
    });
  } catch (error) {
    console.error("Error checking submission:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all submissions for a quiz (Teacher view)
 * GET /api/quiz-submission/quiz/:quizId
 */
export const getQuizSubmissions = async (req, res) => {
  try {
    const { quizId } = req.params;

    const submissions = await QuizSubmission.find({ quizId })
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Server error" });
  }
};