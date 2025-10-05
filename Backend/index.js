import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

import teacherRoutes from "./routes/teacherRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";

import noteRoutes from "./routes/noteRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import questionBankRoutes from "./routes/questionBankRoutes.js";


const app = express();


import doubtRoutes from "./routes/doubtRoutes.js";


dotenv.config();
connectDB();


const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join a classroom room
  socket.on("join_class", (classId) => {
    socket.join(classId);
    console.log(`🔹 Socket ${socket.id} joined class ${classId}`);
  });

  // New doubt event
  socket.on("new_doubt", (doubt) => {
    io.to(doubt.classId).emit("doubt_added", doubt);
  });

  // New reply to a doubt
  socket.on("new_reply", ({ classId, doubtId, reply }) => {
    io.to(classId).emit("reply_added", { doubtId, reply });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io accessible in routes
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/classroom", classroomRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/announcement", announcementRoutes);

app.use("/api/quiz", quizRoutes);
app.use("/api/question-bank", questionBankRoutes);

app.use("/api/doubts", doubtRoutes);


// Health check
app.get("/", (req, res) => {
  res.send("AI-Powered Smart Classroom Backend is Running!");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export { io };
