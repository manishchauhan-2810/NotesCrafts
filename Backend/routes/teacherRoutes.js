import express from "express";
import { generateAssignment } from "../controllers/teacherController.js";

const router = express.Router();

router.post("/generate_assignment", generateAssignment);

export default router;
