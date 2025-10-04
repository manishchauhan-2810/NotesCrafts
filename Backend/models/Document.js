import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sourceText: String,
});

export default mongoose.model("Document", documentSchema);

