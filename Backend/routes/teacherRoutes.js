import express from "express";
import {
  registerTeacher,
  loginTeacher,
  logoutTeacher,
  generateAssignment,
} from "../controllers/teacherController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerTeacher);
router.post("/login", loginTeacher);

router.post("/logout", authMiddleware, authorizeRoles("teacher"), logoutTeacher);
router.post(
  "/generate_assignment",
  authMiddleware,
  authorizeRoles("teacher"),
  generateAssignment
);

export default router;
