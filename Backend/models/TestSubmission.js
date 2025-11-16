import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  studentAnswer: {
    type: String,
    required: true,
  },
  answerKey: {
    type: String,
    required: true,
  },
  marks: {
    type: Number,
    required: true,
  },
  marksAwarded: {
    type: Number,
    default: 0,
  },
  aiMarks: {
    type: Number,
    default: null,
  }, // AI suggested marks
  aiFeedback: {
    type: String,
    default: "",
  },
  teacherFeedback: {
    type: String,
    default: "",
  },
  checkedBy: {
    type: String,
    enum: ["pending", "ai", "teacher", "both"],
    default: "pending",
  },
});

const testSubmissionSchema = new mongoose.Schema({
  testPaperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TestPaper",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  answers: [answerSchema],
  totalMarks: {
    type: Number,
    required: true,
  },
  marksObtained: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["pending", "checked"],
    default: "pending",
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  checkedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Index for faster queries
testSubmissionSchema.index({ testPaperId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("TestSubmission", testSubmissionSchema);