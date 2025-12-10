import axios from "axios";

const API = axios.create({
  baseURL: "https://adhayan-backend.onrender.com/api", // your backend base URL
});

export default API;
