// Backend/routes/noteRoutes.js
import express from "express";
import { uploadNote, getNotes, getNoteFile, getNotesByClassroom } from "../controllers/noteController.js";

const router = express.Router();

router.post("/upload", uploadNote);
router.get("/", getNotes); // Get all notes (admin)
router.get("/classroom/:classroomId", getNotesByClassroom); // Get notes by classroom
router.get("/file/:fileId", getNoteFile);

export default router;