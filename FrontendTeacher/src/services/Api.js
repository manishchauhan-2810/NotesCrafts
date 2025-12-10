import axios from "axios";

const API = axios.create({
  baseURL: "https://adhayan-backend.onrender.com/api/quiz", // Replace with your backend URL
});

// Quiz APIs
export const generateQuiz = (noteId) => API.post("/generate", { noteId });
export const getQuiz = (noteId) => API.get(`/${noteId}`);
export const getAllQuizzes = () => API.get("/");
export const updateQuiz = (quizId, data) => API.put(`/${quizId}`, data);
export const deleteQuiz = (quizId) => API.delete(`/${quizId}`);

export default API;
