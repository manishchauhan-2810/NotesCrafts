import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/classroom", // Backend classroom routes
});

// ✅ Create new classroom
export const createClassroom = async (teacherId, name) => {
  try {
    const response = await API.post("/create", { teacherId, name });
    return response.data;
  } catch (error) {
    console.error("Error creating classroom:", error);
    throw error;
  }
};

// ✅ Join classroom
export const joinClassroom = async (studentId, classCode) => {
  try {
    const response = await API.post("/join", { studentId, classCode });
    return response.data;
  } catch (error) {
    console.error("Error joining classroom:", error);
    throw error;
  }
};

// ✅ Get classrooms for teacher/student
export const getClassrooms = async (userId, role) => {
  try {
    const response = await API.get("/", { params: { userId, role } });
    return response.data.classrooms;
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    throw error;
  }
};
