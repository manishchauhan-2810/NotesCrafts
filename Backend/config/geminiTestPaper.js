import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEN_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

/**
 * Generate Test Paper from text using Gemini AI
 * 5 short (2 marks) + 3 medium (5 marks) + 2 long (10 marks) = 50 marks
 */
export const generateTestPaperFromText = async (extractedText) => {
  try {
    console.log("🤖 Preparing Gemini prompt for Test Paper...");
    
    const limitedText = extractedText.slice(0, 12000);
    
    const prompt = `
You are an expert exam question paper generator. Generate EXACTLY 10 questions with answer keys from the following educational content.

CONTENT:
${limitedText}

REQUIREMENTS:
1. Generate EXACTLY 10 questions in this structure:
   - 5 SHORT answer questions (2 marks each) - Answer in 2-3 lines
   - 3 MEDIUM answer questions (5 marks each) - Answer in 5-6 lines
   - 2 LONG answer questions (10 marks each) - Answer in 10-12 lines

2. Each question MUST have:
   - Clear question text
   - Question type (short/medium/long)
   - Marks allocation
   - Detailed answer key (model answer)
   - Guidelines for acceptable alternate answers

3. Question types:
   - SHORT: Definition, one-word, brief explanations (2-3 lines max)
   - MEDIUM: Explain concepts, compare, describe (5-6 lines)
   - LONG: Detailed explanations, analyze, elaborate (10-12 lines)

4. Answer keys should be:
   - Clear and comprehensive
   - Cover all key points
   - Include bullet points for long answers
   - Mention acceptable variations

RESPONSE FORMAT (Valid JSON only):
{
  "questions": [
    {
      "question": "What is photosynthesis?",
      "type": "short",
      "marks": 2,
      "answerKey": "Photosynthesis is the process by which green plants convert light energy into chemical energy, producing glucose and oxygen from carbon dioxide and water.",
      "answerGuidelines": "Accept: Any answer mentioning light energy conversion, glucose production, and CO2+H2O as raw materials"
    },
    {
      "question": "Explain the process of photosynthesis in detail.",
      "type": "medium",
      "marks": 5,
      "answerKey": "Photosynthesis occurs in two stages:\n1. Light Reactions: Occur in thylakoid membranes, water molecules split, oxygen released, ATP and NADPH produced.\n2. Calvin Cycle: Occurs in stroma, CO2 fixed using ATP and NADPH, glucose synthesized.\nChlorophyll absorbs light energy (mainly blue and red wavelengths), driving the entire process.",
      "answerGuidelines": "Must mention: light reactions, dark reactions/Calvin cycle, role of chlorophyll, products (O2, glucose). Partial marks for incomplete answers."
    },
    {
      "question": "Describe in detail the light-dependent and light-independent reactions of photosynthesis, including their locations, requirements, and products.",
      "type": "long",
      "marks": 10,
      "answerKey": "Light-Dependent Reactions:\n- Location: Thylakoid membranes of chloroplasts\n- Requirements: Light energy, water, chlorophyll, ADP, NADP+\n- Process: Photosystems I and II capture light energy, water molecules split (photolysis), electrons excited and transported through electron transport chain\n- Products: ATP, NADPH, O2 released\n\nLight-Independent Reactions (Calvin Cycle):\n- Location: Stroma of chloroplasts\n- Requirements: CO2, ATP, NADPH (from light reactions), RuBP (ribulose bisphosphate)\n- Process: CO2 fixation by RuBP, reduction phase using ATP and NADPH, regeneration of RuBP\n- Products: Glucose (C6H12O6), ADP, NADP+ returned to light reactions\n\nConnection: Light reactions provide energy (ATP) and reducing power (NADPH) for Calvin cycle. Both are interdependent for complete photosynthesis.",
      "answerGuidelines": "Must cover: Both reactions separately, locations, inputs/outputs, connection between them. Award marks based on completeness: 10 marks = all points, 8 marks = missing minor details, 5-7 marks = missing major concepts, below 5 = incomplete understanding"
    }
  ]
}

IMPORTANT: 
- Return ONLY valid JSON
- No markdown, no code blocks, no extra text
- Exactly 5 short + 3 medium + 2 long questions (total 10)
- Answer keys must be detailed enough for AI checking
- Include answer guidelines for semantic matching
`;

    console.log("📤 Sending request to Gemini...");

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    const response = result.response.text();
    
    console.log("📥 Received response from Gemini");

    // Clean response
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
    }

    // Parse JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError.message);
      throw new Error("Invalid JSON response from AI");
    }

    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error("Invalid response format from AI");
    }

    // Validate questions
    const validQuestions = parsedResponse.questions.filter(q => {
      return q.question && 
             q.type && 
             ['short', 'medium', 'long'].includes(q.type) &&
             q.marks &&
             q.answerKey;
    });

    if (validQuestions.length === 0) {
      throw new Error("No valid questions generated");
    }

    console.log(`✅ Generated ${validQuestions.length} valid questions`);

    return validQuestions;
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    throw error;
  }
};

/**
 * Check student answers using AI with answer keys
 */
export const checkAnswersWithAI = async (answerKeys, studentAnswers) => {
  try {
    console.log("🤖 Checking answers with AI...");
    
    const prompt = `
You are an expert teacher checking exam answers. Be fair, context-aware, and give partial marks for partially correct answers.

Compare each student answer with the answer key and guidelines. Award marks based on:
- Correctness of concepts
- Completeness of answer
- Semantic accuracy (accept synonyms and alternate phrasings)
- Partial marks for incomplete but correct attempts

ANSWER KEYS AND STUDENT ANSWERS:
${JSON.stringify({ answerKeys, studentAnswers }, null, 2)}

For each answer, provide:
1. Marks awarded (0 to maximum marks)
2. Reason for marks
3. Constructive feedback

RESPONSE FORMAT (Valid JSON only):
{
  "checkedAnswers": [
    {
      "questionId": "q1",
      "marksAwarded": 2,
      "reason": "Correct concept, clear explanation",
      "feedback": "Excellent! You've covered all key points."
    }
  ]
}

IMPORTANT:
- Be lenient with phrasing variations
- Award full marks if concept is correct
- Give partial marks for incomplete answers
- Consider answer guidelines provided
- Return ONLY valid JSON
`;

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    const response = result.response.text();

    // Clean response
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    let parsedResponse = JSON.parse(cleanedResponse);

    console.log("✅ AI checking completed");
    return parsedResponse.checkedAnswers;
  } catch (error) {
    console.error("❌ AI Checking Error:", error.message);
    throw error;
  }
};

export default { generateTestPaperFromText, checkAnswersWithAI };