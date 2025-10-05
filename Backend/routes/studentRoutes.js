import express from "express";
import {
  registerStudent,
  loginStudent,
  logoutStudent,
  submitAnswer,
} from "../controllers/studentController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);

router.post("/logout", authMiddleware, authorizeRoles("student"), logoutStudent);
router.post(
  "/submit_answer",
  authMiddleware,
  authorizeRoles("student"),
  submitAnswer
);

export default router;
