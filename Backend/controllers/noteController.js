import mongoose from "mongoose";
import multer from "multer";
import Note from "../models/Note.js";
import { bucket, conn } from "../config/gridfs.js"; // ✅ updated import

// Multer setup for GridFS (memory storage for streaming to bucket)
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadNote = [
  upload.single("file"),
  async (req, res) => {
    try {
      const { title, uploadedBy, classroomId } = req.body;
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      if (!title) return res.status(400).json({ message: "Title is required" });
      if (!uploadedBy) return res.status(400).json({ message: "uploadedBy is required" });

      // Upload file to GridFS
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
      });

      uploadStream.end(req.file.buffer);

      uploadStream.on("finish", async () => {
        const note = await Note.create({
          title,
          uploadedBy,
          classroomId,
          fileId: uploadStream.id, // ✅ Use uploadStream.id
        });

        res.status(201).json({ message: "Note uploaded successfully", note });
      });

      uploadStream.on("error", (err) => {
        console.error("GridFS Upload Error:", err);
        res.status(500).json({ message: "Error uploading file", error: err.message });
      });
    } catch (error) {
      console.error("Upload Note Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

// Get all notes
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Get Notes Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Stream PDF to browser
export const getNoteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const _id = new mongoose.Types.ObjectId(fileId);

    const readStream = bucket.openDownloadStream(_id);

    readStream.on("error", (err) => {
      console.error("GridFS Read Error:", err);
      res.status(404).json({ message: "File not found", error: err.message });
    });

    readStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
