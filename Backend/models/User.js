import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: { type: String, required: true },
  role: { type: String, enum: ["teacher", "student"], required: true },
});

export default mongoose.model("User", userSchema);

