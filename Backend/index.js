import express from 'express';
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

dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());


app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);

app.use("/api/classroom", classroomRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/announcement", announcementRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/question-bank", questionBankRoutes);

const port = 5000;

app.get('/', (req, res) => { 
  res.send('AI- Powered Smart Classroom Backend is Running !');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
}); 