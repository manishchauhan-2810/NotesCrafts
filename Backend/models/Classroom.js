import mongoose from "mongoose";
import { nanoid } from "nanoid";

const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  classCode: { type: String, required: true, unique: true, default: () => nanoid(6) },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export default mongoose.model("Classroom", classroomSchema);
