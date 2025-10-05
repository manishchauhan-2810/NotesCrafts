import express from "express";
import { upload, uploadNote, getNotes } from "../controllers/notesController.js";

const router = express.Router();

// POST /api/notes/upload
router.post("/upload", upload.single("file"), uploadNote);

router.get("/", getNotes);

export default router;
