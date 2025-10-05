import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import Document from "../models/notesModel.js";
import { AI_Service } from "../services/aiService.js";

dotenv.config();


export const registerTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // Check if teacher already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword);

    // Create teacher
    const teacher = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "teacher",
    });

    res.status(201).json({
      message: "Teacher registered successfully",
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
};

export const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const teacher = await User.findOne({ email, role: "teacher" });
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    if (!teacher.password) {
      return res.status(400).json({
        error: "Password is not set for this teacher. Please re-register.",
      });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: teacher._id, role: teacher.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Teacher login successful",
      token,
      teacher: { id: teacher._id, name: teacher.name, email: teacher.email },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

export const logoutTeacher = async (req, res) => {
  try {
    // JWT is stateless; logout can just respond
    res.status(200).json({ message: "Teacher logged out successfully" });
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ error: "Server error during logout" });
  }
};

export const generateAssignment = async (req, res) => {
  try {
    const { user_id, source_text } = req.body;

    if (!user_id || !source_text) {
      return res.status(400).json({ error: "Teacher ID and source text are required" });
    }

    const teacher = await User.findById(user_id);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Save document
    const doc = await Document.create({
      teacherId: user_id,
      sourceText: source_text,
    });

    // Generate assignment
    const assignment =
      typeof AI_Service.generateContent === "function"
        ? await AI_Service.generateContent(source_text)
        : null;

    res.status(200).json({
      message: "Assignment generated successfully",
      teacher_id: user_id,
      assignment,
      document_id: doc._id,
    });
  } catch (err) {
    console.error("Generate Assignment Error:", err);
    res.status(500).json({ error: "Server error during assignment generation" });
  }
};
