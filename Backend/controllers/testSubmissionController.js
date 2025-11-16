import TestSubmission from "../models/TestSubmission.js";
import TestPaper from "../models/TestPaper.js";
import User from "../models/User.js";
import { checkAnswersWithAI } from "../config/geminiTestPaper.js";

/**
 * Submit test answers (without grading)
 * POST /api/test-submission/submit
 */
export const submitTest = async (req, res) => {
  try {
    const { testPaperId, studentId, answers } = req.body;

    console.log("📥 Test submission received:", { testPaperId, studentId });

    if (!testPaperId || !studentId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        error: "testPaperId, studentId, and answers array are required",
      });
    }

    const testPaper = await TestPaper.findById(testPaperId);
    if (!testPaper) {
      return res.status(404).json({ error: "Test paper not found" });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check if already submitted
    const existingSubmission = await TestSubmission.findOne({
      testPaperId,
      studentId,
    });
    if (existingSubmission) {
      return res.status(400).json({
        error: "Test already submitted",
        submission: existingSubmission,
      });
    }

    // Check test timing
    if (testPaper.endTime && new Date() > new Date(testPaper.endTime)) {
      return res.status(400).json({ error: "Test time has expired" });
    }

    // Add question details to answers
    const submissionAnswers = answers.map((studentAnswer) => {
      const question = testPaper.questions.find(
        (q) => q._id.toString() === studentAnswer.questionId
      );

      if (!question) {
        throw new Error(`Question not found: ${studentAnswer.questionId}`);
      }

      return {
        questionId: studentAnswer.questionId,
        question: question.question,
        studentAnswer: studentAnswer.answer,
        answerKey: question.answerKey,
        marks: question.marks,
        marksAwarded: 0,
        checkedBy: "pending",
      };
    });

    const submission = await TestSubmission.create({
      testPaperId,
      studentId,
      studentName: student.name,
      answers: submissionAnswers,
      totalMarks: testPaper.totalMarks,
      marksObtained: 0,
      percentage: 0,
      status: "pending",
    });

    console.log("✅ Test submitted (pending checking)");

    res.status(201).json({
      success: true,
      message: "Test submitted successfully. Awaiting results.",
      submission: {
        _id: submission._id,
        status: "pending",
        submittedAt: submission.submittedAt,
      },
    });
  } catch (error) {
    console.error("❌ Test submission error:", error);
    res.status(500).json({
      error: "Failed to submit test",
      details: error.message,
    });
  }
};

/**
 * Check test answers using AI
 * POST /api/test-submission/check-with-ai/:testPaperId
 */
export const checkTestWithAI = async (req, res) => {
  try {
    const { testPaperId } = req.params;

    console.log("🤖 Starting AI checking for test:", testPaperId);

    const testPaper = await TestPaper.findById(testPaperId);
    if (!testPaper) {
      return res.status(404).json({ error: "Test paper not found" });
    }

    const submissions = await TestSubmission.find({
      testPaperId,
      status: "pending",
    });

    if (submissions.length === 0) {
      return res.status(404).json({ error: "No pending submissions found" });
    }

    console.log(`📋 Checking ${submissions.length} submissions...`);

    const answerKeys = testPaper.questions.map((q) => ({
      questionId: q._id.toString(),
      question: q.question,
      answerKey: q.answerKey,
      answerGuidelines: q.answerGuidelines,
      marks: q.marks,
    }));

    let checkedCount = 0;

    for (const submission of submissions) {
      try {
        const studentAnswers = submission.answers.map((ans) => ({
          questionId: ans.questionId,
          studentAnswer: ans.studentAnswer,
        }));

        // Gemini AI Check
        const aiResults = await checkAnswersWithAI(answerKeys, studentAnswers);

        let totalMarksObtained = 0;

        submission.answers = submission.answers.map((ans) => {
          const aiResult = aiResults.find(
            (r) => r.questionId === ans.questionId
          );

          if (aiResult) {
            totalMarksObtained += aiResult.marksAwarded;
            return {
              ...ans,
              aiMarks: aiResult.marksAwarded,
              marksAwarded: aiResult.marksAwarded,
              aiFeedback: aiResult.feedback || aiResult.reason || "",
              checkedBy: "ai",
            };
          }

          return ans;
        });

        submission.marksObtained = totalMarksObtained;
        submission.percentage = parseFloat(
          ((totalMarksObtained / submission.totalMarks) * 100).toFixed(2)
        );
        submission.status = "checked";
        submission.checkedAt = new Date();

        await submission.save();
        checkedCount++;

        console.log(`✅ Checked submission for ${submission.studentName}`);
      } catch (error) {
        console.error(
          `❌ Error checking submission ${submission._id}:`,
          error
        );
      }
    }

    console.log(
      `✅ AI checking completed: ${checkedCount}/${submissions.length} submissions`
    );

    res.status(200).json({
      success: true,
      message: `Checked ${checkedCount} submissions using AI`,
      checkedCount,
      totalSubmissions: submissions.length,
    });
  } catch (error) {
    console.error("❌ AI checking error:", error);
    res.status(500).json({
      error: "Failed to check with AI",
      details: error.message,
    });
  }
};

/**
 * Get student's test result
 * GET /api/test-submission/result/:testPaperId/:studentId
 */
export const getTestResult = async (req, res) => {
  try {
    const { testPaperId, studentId } = req.params;

    const submission = await TestSubmission.findOne({
      testPaperId,
      studentId,
    }).populate("testPaperId", "title totalMarks");

    if (!submission) {
      return res.status(404).json({ error: "No submission found" });
    }

    res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("Error fetching result:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Check if student has submitted test
 * GET /api/test-submission/check/:testPaperId/:studentId
 */
export const checkSubmission = async (req, res) => {
  try {
    const { testPaperId, studentId } = req.params;

    const submission = await TestSubmission.findOne({
      testPaperId,
      studentId,
    });

    res.status(200).json({
      hasSubmitted: !!submission,
      status: submission?.status || null,
      submissionId: submission?._id || null,
    });
  } catch (error) {
    console.error("Error checking submission:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all submissions for teacher
 * GET /api/test-submission/test/:testPaperId
 */
export const getTestSubmissions = async (req, res) => {
  try {
    const { testPaperId } = req.params;

    const submissions = await TestSubmission.find({ testPaperId })
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Update marks manually by teacher
 * PUT /api/test-submission/update-marks/:submissionId
 */
export const updateMarksManually = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { answers } = req.body; // Array of {questionId, marksAwarded, teacherFeedback}

    const submission = await TestSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    let totalMarksObtained = 0;

    submission.answers = submission.answers.map((ans) => {
      const update = answers.find((a) => a.questionId === ans.questionId);

      if (update) {
        totalMarksObtained += update.marksAwarded;
        return {
          ...ans,
          marksAwarded: update.marksAwarded,
          teacherFeedback: update.teacherFeedback || ans.teacherFeedback,
          checkedBy: ans.checkedBy === "ai" ? "both" : "teacher",
        };
      }

      totalMarksObtained += ans.marksAwarded;
      return ans;
    });

    submission.marksObtained = totalMarksObtained;
    submission.percentage = parseFloat(
      ((totalMarksObtained / submission.totalMarks) * 100).toFixed(2)
    );
    submission.status = "checked";
    submission.checkedAt = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      message: "Marks updated successfully",
      submission,
    });
  } catch (error) {
    console.error("Error updating marks:", error);
    res.status(500).json({ error: "Server error" });
  }
};
