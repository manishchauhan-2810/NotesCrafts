import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, enum: ["teacher", "student"], required: true },
});

export default mongoose.model("User", userSchema);

