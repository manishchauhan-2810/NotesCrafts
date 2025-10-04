import express from "express";
import { createClassroom, joinClassroom, getClassrooms } from "../controllers/classroomController.js";

const router = express.Router();

router.post("/create", createClassroom);
router.post("/join", joinClassroom);
router.get("/", getClassrooms);

export default router;
