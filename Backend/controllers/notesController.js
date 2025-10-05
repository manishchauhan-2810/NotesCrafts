import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import Note from "../models/notesModel.js";

// 🔹 Multer Storage Config
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "class_notes",
    resource_type: "auto", // allows pdf, images, docs, etc.
  },
});

const upload = multer({ storage });

// 🔹 Upload a Note
export const uploadNote = async (req, res) => {
  try {
    const { title, uploadedBy, classroomId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = req.file.path;

    const note = await Note.create({
      title,
      fileUrl,
      uploadedBy,
      classroomId,
    });

    res.status(201).json({
      message: "Note uploaded successfully",
      note,
    });
  } catch (error) {
    console.error("Upload Note Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🔹 Get All Notes (for students + teacher)
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find().populate("uploadedBy", "name email");
    res.status(200).json(notes);
  } catch (error) {
    console.error("Get Notes Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { upload };
