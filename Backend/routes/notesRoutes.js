import express from "express";
import { upload, uploadNote, getNotes } from "../controllers/notesController.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadNote);

router.get("/", getNotes);

export default router;
