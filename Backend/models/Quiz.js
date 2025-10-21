// Backend/models/Quiz.js
import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  noteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Note", 
    required: true 
  },
  classroomId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Classroom",
    required: true 
  },
  title: {
    type: String,
    default: "Untitled Quiz"
  },
  generatedFrom: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Note" 
  }],
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String,
    },
  ],
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.model("Quiz", quizSchema);