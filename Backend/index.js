import express from 'express';
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import teacherRoutes from "./routes/teacherRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";


const app = express();

dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());


app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);

app.use("/api/classroom", classroomRoutes)

const port = 5000;

app.get('/', (req, res) => { 
  res.send('AI- Powered Smart Classroom Backend is Running !');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
}); 