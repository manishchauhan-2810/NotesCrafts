import Submission from "../models/Submission.js";
import { AI_Service } from "../services/aiService.js";

export const submitAnswer = async (req, res) => {
  try {
    const { submission_id, student_id, answer_text, source_text } = req.body;
    if (!submission_id || !student_id || !answer_text)
      return res.status(400).json({ error: "Missing required fields" });

    const gradeData = AI_Service.gradeSubjective(answer_text, source_text);
    const plagiarismScore = AI_Service.checkPlagiarism(answer_text);

    const submission = await Submission.create({
      submissionId: submission_id,
      studentId: student_id,
      answerText: answer_text,
      grade: gradeData.grade,
      feedback: gradeData.feedback,
      plagiarismScore,
    });

    res.status(200).json({
      message: "Submission received and graded successfully",
      submission,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
