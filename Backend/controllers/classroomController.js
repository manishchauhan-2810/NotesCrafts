import Classroom from "../models/Classroom.js";
import User from "../models/User.js";
import { nanoid } from "nanoid";

/**
 * Create Classroom (Teacher)
 * POST /api/classroom/create
 * Body: { teacherId, name }
 */
export const createClassroom = async (req, res) => {
  try {
    const { teacherId, name } = req.body;

    if (!teacherId || !name) {
      return res.status(400).json({ error: "teacherId and name are required" });
    }

    // Verify teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    if (teacher.role !== "teacher") {
      return res.status(400).json({ error: "User is not a teacher" });
    }

    // Generate a unique 6-character class code
    const classCode = nanoid(6).toUpperCase();

    // Create classroom
    const classroom = await Classroom.create({ teacherId, name, classCode });

    res.status(201).json({
      message: "Classroom created successfully",
      classroom,
    });
  } catch (error) {
    console.error("Create Classroom Error:", error);
    res.status(500).json({ error: "Server error while creating classroom" });
  }
};

/**
 * Join Classroom (Student)
 * POST /api/classroom/join
 * Body: { studentId, classCode }
 */
export const joinClassroom = async (req, res) => {
  try {
    const { studentId, classCode } = req.body;

    if (!studentId || !classCode) {
      return res.status(400).json({ error: "studentId and classCode are required" });
    }

    // Find class by code
    const classroom = await Classroom.findOne({ classCode });
    if (!classroom) return res.status(404).json({ error: "Invalid class code" });

    // Verify student
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });
    if (student.role !== "student") {
      return res.status(400).json({ error: "User is not a student" });
    }

    // Prevent duplicates
    if (classroom.students.includes(studentId)) {
      return res.status(400).json({ error: "Student already joined this classroom" });
    }

    classroom.students.push(studentId);
    await classroom.save();

    res.status(200).json({
      message: "Joined classroom successfully",
      classroom,
    });
  } catch (error) {
    console.error("Join Classroom Error:", error);
    res.status(500).json({ error: "Server error while joining classroom" });
  }
};

/**
 * Get classrooms for teacher or student
 * GET /api/classroom?userId=xxx&role=teacher|student
 */
export const getClassrooms = async (req, res) => {
  try {
    const { userId, role } = req.query;

    if (!userId || !role) {
      return res.status(400).json({ error: "userId and role are required" });
    }

    let classrooms;
    if (role === "teacher") {
      classrooms = await Classroom.find({ teacherId: userId }).populate("students", "name email");
    } else if (role === "student") {
      classrooms = await Classroom.find({ students: userId }).populate("teacherId", "name email");
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    res.status(200).json({ classrooms });
  } catch (error) {
    console.error("Get Classrooms Error:", error);
    res.status(500).json({ error: "Server error while fetching classrooms" });
  }
};

export const getClassroomById = async (req, res) => {
  try {
    const { classId } = req.params;

    const classroom = await Classroom.findById(classId)
      .populate('students', 'name email createdAt') // Populate student details
      .populate('teacherId', 'name email');

    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    res.status(200).json({
      success: true,
      classroom
    });
  } catch (error) {
    console.error("Error fetching classroom:", error);
    res.status(500).json({ error: "Server error" });
  }
};