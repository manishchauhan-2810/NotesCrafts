import express from "express";
import { uploadNote, getNotes, getNoteFile } from "../controllers/noteController.js";

const router = express.Router();

router.post("/upload", uploadNote);
router.get("/", getNotes);
router.get("/file/:fileId", getNoteFile);

export default router;
