import axios from "axios";

export const getDoubts = async (classId) => {
  const res = await axios.get(`https://adhayan-backend.onrender.com/api/doubts/${classId}`);
  return res.data;
};

export const createDoubt = async (payload) => {
  const res = await axios.post("https://adhayan-backend.onrender.com/api/doubts", payload);
  return res.data;
};
