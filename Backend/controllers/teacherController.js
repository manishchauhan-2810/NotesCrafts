import Document from "../models/Document.js";
import { AI_Service } from "../services/aiService.js";

export const generateAssignment = async (req, res) => {
  try {
    const { user_id, source_text } = req.body;
    if (!user_id || !source_text)
      return res.status(400).json({ error: "Missing required fields" });

    const doc = await Document.create({ teacherId: user_id, sourceText: source_text });
    const assignment = AI_Service.generateContent(source_text);

    res.status(200).json({
      message: "Assignment generated successfully",
      teacher_id: user_id,
      assignment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

