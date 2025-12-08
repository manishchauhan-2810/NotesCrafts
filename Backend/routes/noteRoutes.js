// Backend/routes/noteRoutes.js
import express from "express";
import { 
  uploadNote, 
  getNotes, 
  getNoteFile, 
  getNotesByClassroom,
  deleteNote // ✅ NEW
} from "../controllers/noteController.js";

const router = express.Router();

router.post("/upload", uploadNote);
router.get("/", getNotes);
router.get("/classroom/:classroomId", getNotesByClassroom);
router.get("/file/:fileId", getNoteFile);
router.delete("/:noteId", deleteNote); // ✅ NEW - Delete note

export default router;