import mongoose from "mongoose";
import Assignment from "../models/Assignment.js";
import Note from "../models/Note.js";
import { bucket } from "../config/gridfs.js";
import { generateAssignmentFromText } from "../config/geminiAssignment.js";
import { extractTextFromPDF, cleanText, validateTextContent } from "../utils/pdfExtractor.js";

/**
 * Generate assignment using AI
 * POST /api/assignment/generate-ai
 */
export const generateAssignmentWithAI = async (req, res) => {
  try {
    const { noteIds, classroomId } = req.body;

    console.log("=== ASSIGNMENT GENERATION STARTED ===");
    console.log("📥 Request:", { noteIds, classroomId });

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
      return res.status(400).json({ error: "Please select at least one note" });
    }

    if (!classroomId) {
      return res.status(400).json({ error: "classroomId is required" });
    }

    // Fetch notes
    const notes = await Note.find({ _id: { $in: noteIds } });
    
    if (notes.length === 0) {
      return res.status(404).json({ error: "No notes found" });
    }

    console.log(`✅ Found ${notes.length} notes`);

    // Extract text from PDFs
    let combinedText = "";
    let successfulExtractions = 0;
    
    for (const note of notes) {
      try {
        console.log(`📄 Processing: ${note.title}`);
        
        const fileId = new mongoose.Types.ObjectId(note.fileId);
        const chunks = [];
        const readstream = bucket.openDownloadStream(fileId);

        await new Promise((resolve, reject) => {
          readstream.on("data", (chunk) => chunks.push(chunk));
          readstream.on("error", reject);
          readstream.on("end", resolve);
        });

        const buffer = Buffer.concat(chunks);
        const text = await extractTextFromPDF(buffer);
        
        if (text && text.trim().length > 0) {
          combinedText += `\n\n=== ${note.title} ===\n\n${text}`;
          successfulExtractions++;
          console.log(`✅ Extracted ${text.length} characters`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${note.title}:`, error.message);
      }
    }

    if (successfulExtractions === 0) {
      return res.status(400).json({
        error: "Could not extract text from any PDF",
      });
    }

    if (!combinedText || combinedText.trim().length < 500) {
      return res.status(400).json({
        error: "Not enough content in notes (min 500 characters required)",
      });
    }

    console.log("✅ Content validation passed");

    // Clean text
    const cleanedText = cleanText(combinedText, 15000);

    // Generate assignment using Gemini
    console.log("🤖 Calling Gemini API...");
    const questions = await generateAssignmentFromText(cleanedText);

    console.log(`✅ Generated ${questions.length} questions`);

    // Create title
    const noteNames = notes.slice(0, 2).map(n => n.title).join(", ");
    const assignmentTitle = notes.length > 2 
      ? `Assignment from ${noteNames} and ${notes.length - 2} more`
      : `Assignment from ${noteNames}`;

    // Save to database
    const assignment = await Assignment.create({
      classroomId,
      title: assignmentTitle,
      description: "Complete all questions with detailed explanations",
      generatedFrom: noteIds,
      questions: questions.map(q => ({
        question: q.question,
        marks: q.marks,
        answerKey: q.answerKey,
        answerGuidelines: q.answerGuidelines || "",
      })),
      totalMarks: 50,
      status: "draft",
    });

    console.log("✅ Assignment saved:", assignment._id);
    console.log("=== GENERATION COMPLETED ===\n");

    res.status(201).json({
      success: true,
      message: `Generated assignment with ${questions.length} questions`,
      assignment,
      stats: {
        totalNotes: notes.length,
        processedNotes: successfulExtractions,
        questionsGenerated: questions.length,
        totalMarks: 50,
      }
    });
  } catch (error) {
    console.error("❌ ASSIGNMENT GENERATION FAILED:", error);
    res.status(500).json({
      error: "Failed to generate assignment",
      details: error.message,
    });
  }
};

/**
 * Get assignment by ID
 */
export const getAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.status(200).json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all assignments for a classroom
 */
export const getAssignmentsByClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    
    const assignments = await Assignment.find({ classroomId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Update assignment
 */
export const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const updateData = req.body;

    const assignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      assignment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Publish assignment
 */
export const publishAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { dueDate } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    assignment.status = "published";
    assignment.dueDate = dueDate || null;
    assignment.isActive = true;

    await assignment.save();

    res.status(200).json({
      success: true,
      message: "Assignment published successfully",
      assignment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to publish assignment" });
  }
};

/**
 * Delete assignment
 */
export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findByIdAndDelete(assignmentId);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get active assignments for students
 */
export const getActiveAssignmentsForStudent = async (req, res) => {
  try {
    const { classroomId } = req.params;
    
    const now = new Date();
    
    const assignments = await Assignment.find({ 
      classroomId,
      status: "published"
    }).sort({ createdAt: -1 });

    const activeAssignments = assignments.map(assignment => {
      let isActive = true;
      
      if (assignment.dueDate && now > new Date(assignment.dueDate)) {
        isActive = false;
      }

      return {
        ...assignment.toObject(),
        isActive
      };
    });

    res.status(200).json({
      success: true,
      count: activeAssignments.length,
      assignments: activeAssignments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};