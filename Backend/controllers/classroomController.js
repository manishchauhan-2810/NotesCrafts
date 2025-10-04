import mongoose from "mongoose";
import Classroom from "../models/Classroom.js";
import User from "../models/User.js";
import { nanoid } from "nanoid";

export const createClassroom = async (req, res) => {
  try {
    const { teacherId, name } = req.body;

    if (!teacherId || !name) return res.status(400).json({ error: "teacherId and name are required" });
    if (!mongoose.Types.ObjectId.isValid(teacherId)) return res.status(400).json({ error: "Invalid teacherId format" });

    const teacher = await User.findById(teacherId);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    if (teacher.role !== "teacher") return res.status(400).json({ error: "User is not a teacher" });

    const classroom = await Classroom.create({
      teacherId,
      name,
      classCode: nanoid(6),
      students: [],
    });

    res.status(201).json({ message: "Classroom created successfully", classroom });
  } catch (error) {
    console.error("Create Classroom Error:", error);
    res.status(500).json({ error: "Server error while creating classroom" });
  }
};

export const joinClassroom = async (req, res) => {
  try {
    const { classroomId, studentId } = req.body;

    if (!classroomId || !studentId) return res.status(400).json({ error: "classroomId and studentId are required" });
    if (!mongoose.Types.ObjectId.isValid(classroomId)) return res.status(400).json({ error: "Invalid classroomId" });
    if (!mongoose.Types.ObjectId.isValid(studentId)) return res.status(400).json({ error: "Invalid studentId" });

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });
    if (student.role !== "student") return res.status(400).json({ error: "User is not a student" });

    if (classroom.students.some((s) => s.toString() === studentId)) {
      return res.status(400).json({ error: "Student already joined this classroom" });
    }

    classroom.students.push(studentId);
    await classroom.save();

    res.status(200).json({ message: "Joined classroom successfully", classroom });
  } catch (error) {
    console.error("Join Classroom Error:", error);
    res.status(500).json({ error: "Server error while joining classroom" });
  }
};

export const getClassrooms = async (req, res) => {
  try {
    const { userId, role } = req.query;

    if (!userId || !role) return res.status(400).json({ error: "userId and role are required" });
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ error: "Invalid userId" });

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
