// Backend/controllers/testSubmissionController.js
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
      isResultPublished: false, // ⭐ NEW: Result publication flag
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
 * ⭐ NEW: Check test with AI - BATCH PROCESSING with rate limiting
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

    console.log(`📋 Found ${submissions.length} pending submissions`);

    const answerKeys = testPaper.questions.map((q) => ({
      questionId: q._id.toString(),
      question: q.question,
      answerKey: q.answerKey,
      answerGuidelines: q.answerGuidelines,
      marks: q.marks,
    }));

    let checkedCount = 0;
    let failedCount = 0;

    // ⭐ BATCH PROCESSING: Process in batches of 5 to avoid rate limits
    const BATCH_SIZE = 5;
    const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds delay between batches

    for (let i = 0; i < submissions.length; i += BATCH_SIZE) {
      const batch = submissions.slice(i, i + BATCH_SIZE);
      
      console.log(`\n🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(submissions.length / BATCH_SIZE)}`);
      console.log(`   Students: ${batch.map(s => s.studentName).join(', ')}`);

      // Process batch concurrently
      const batchPromises = batch.map(async (submission) => {
        try {
          const studentAnswers = submission.answers.map((ans) => ({
            questionId: ans.questionId,
            studentAnswer: ans.studentAnswer,
          }));

          // Gemini AI Check with retry logic
          let aiResults;
          let retries = 3;
          
          while (retries > 0) {
            try {
              aiResults = await checkAnswersWithAI(answerKeys, studentAnswers);
              break; // Success, exit retry loop
            } catch (error) {
              retries--;
              if (retries === 0) throw error;
              
              console.log(`   ⚠️ Retry ${3 - retries}/3 for ${submission.studentName}`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second between retries
            }
          }

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
          submission.isResultPublished = false; // ⭐ Not published yet

          await submission.save();
          checkedCount++;

          console.log(`   ✅ ${submission.studentName}: ${totalMarksObtained}/${submission.totalMarks}`);
          
          return { success: true, studentName: submission.studentName };
        } catch (error) {
          failedCount++;
          console.error(`   ❌ Failed for ${submission.studentName}:`, error.message);
          return { success: false, studentName: submission.studentName, error: error.message };
        }
      });

      await Promise.all(batchPromises);

      // Delay between batches (except for last batch)
      if (i + BATCH_SIZE < submissions.length) {
        console.log(`   ⏳ Waiting ${DELAY_BETWEEN_BATCHES/1000}s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    console.log(`\n✅ AI checking completed:`);
    console.log(`   Successfully checked: ${checkedCount}/${submissions.length}`);
    console.log(`   Failed: ${failedCount}/${submissions.length}`);

    res.status(200).json({
      success: true,
      message: `Checked ${checkedCount} submissions using AI${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
      checkedCount,
      failedCount,
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
 * ⭐ NEW: Publish results to students (batch update)
 * POST /api/test-submission/publish-results/:testPaperId
 */
export const publishResults = async (req, res) => {
  try {
    const { testPaperId } = req.params;

    const result = await TestSubmission.updateMany(
      { testPaperId, status: "checked" },
      { $set: { isResultPublished: true } }
    );

    console.log("✅ Results published:", result.modifiedCount);

    res.status(200).json({
      success: true,
      message: `Published results for ${result.modifiedCount} students`,
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error publishing results:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get student's test result (only if published)
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

    // ⭐ Check if result is published
    if (!submission.isResultPublished) {
      return res.status(403).json({
        error: "Results not published yet",
        status: submission.status,
      });
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
 * Get single submission by ID (for teacher route)
 * GET /api/test-submission/submission/:submissionId
 */
export const getSubmissionById = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await TestSubmission.findById(submissionId)
      .populate("testPaperId", "title totalMarks questions")
      .populate("studentId", "name email");

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
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
      isResultPublished: submission?.isResultPublished || false,
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
    const { answers } = req.body;

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
    // ⭐ Don't auto-publish after manual update
    // submission.isResultPublished stays as is

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