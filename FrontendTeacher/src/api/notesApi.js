import axios from "axios";

const BASE_URL = "http://localhost:5000/api/notes";

// Fetch all notes
export const getNotes = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

// Upload new note
export const uploadNote = async (formData) => {
  const res = await axios.post(`${BASE_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
