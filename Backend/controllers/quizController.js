import mongoose from "mongoose";
import axios from "axios";
import Quiz from "../models/Quiz.js";
import Note from "../models/Note.js";
import { bucket } from "../config/gridfs.js";

export const generateQuiz = async (req, res) => {
  try {
    const { noteId } = req.body;
    if (!noteId) return res.status(400).json({ error: "noteId is required" });

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const _id = new mongoose.Types.ObjectId(note.fileId);
    const chunks = [];
    const readstream = bucket.openDownloadStream(_id);

    readstream.on("data", (chunk) => chunks.push(chunk));
    readstream.on("error", (err) => {
      console.error(err);
      res.status(500).json({ error: "Error reading PDF" });
    });

    readstream.on("end", async () => {
      const buffer = Buffer.concat(chunks);
      const text = buffer.toString("utf-8").slice(0, 2000); // simple extract

      const sentences = text
        .split(".")
        .map((s) => s.trim())
        .filter((s) => s.length > 10)
        .slice(0, 10);

      const questions = sentences.map((sentence, index) => ({
        question: `Q${index + 1}: ${sentence}?`,
        options: ["True", "False", "Not Sure", "None of the above"],
        correctAnswer: "True",
      }));

      const quiz = await Quiz.create({ noteId, questions });
      res.status(201).json({ success: true, message: "Quiz generated successfully", quiz });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating quiz" });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const { noteId } = req.params;
    const quiz = await Quiz.findOne({ noteId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
