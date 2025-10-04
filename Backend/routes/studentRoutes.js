import express from "express";
import { submitAnswer } from "../controllers/studentController.js";

const router = express.Router();

router.post("/submit_answer", submitAnswer);

export default router;
