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
 * Generate Assignment from text using Gemini AI
 * 5 questions (10 marks each) = 50 marks total
 */
export const generateAssignmentFromText = async (extractedText) => {
  try {
    console.log("🤖 Preparing Gemini prompt for Assignment...");
    
    const limitedText = extractedText.slice(0, 12000);
    
    const prompt = `
You are an expert assignment question generator. Generate EXACTLY 5 assignment questions from the following educational content.

CONTENT:
${limitedText}

REQUIREMENTS:
1. Generate EXACTLY 5 questions
2. Each question should be 10 marks
3. Questions should be descriptive/analytical type requiring detailed answers
4. Questions should test understanding, application, and analysis skills
5. Each question MUST have:
   - Clear question text
   - Marks allocation (10 marks each)
   - Detailed answer key (comprehensive model answer)
   - Guidelines for acceptable alternate answers

RESPONSE FORMAT (Valid JSON only):
{
  "questions": [
    {
      "question": "Explain the process of photosynthesis in detail, including the light-dependent and light-independent reactions. Discuss the factors that affect the rate of photosynthesis.",
      "marks": 10,
      "answerKey": "Photosynthesis is the process by which green plants convert light energy into chemical energy. It occurs in two main stages:\n\n1. Light-Dependent Reactions:\n- Occur in thylakoid membranes\n- Water molecules split (photolysis) releasing O2\n- Light energy captured by chlorophyll\n- ATP and NADPH produced\n- Electrons transported through electron transport chain\n\n2. Light-Independent Reactions (Calvin Cycle):\n- Occur in stroma\n- CO2 fixation by RuBP\n- Reduction phase using ATP and NADPH\n- Regeneration of RuBP\n- Glucose synthesis\n\nFactors Affecting Photosynthesis:\n1. Light Intensity: Rate increases with light up to saturation point\n2. CO2 Concentration: Higher CO2 increases rate up to optimal level\n3. Temperature: Optimal range 25-35°C\n4. Water Availability: Essential for photolysis\n5. Chlorophyll Content: More chlorophyll = higher rate",
      "answerGuidelines": "Must cover: Both light and dark reactions, locations, inputs/outputs, at least 3 factors. Award marks: 10 = complete answer with all points, 8-9 = minor details missing, 6-7 = major concepts covered but lacking depth, 4-5 = basic understanding shown, below 4 = incomplete/incorrect"
    }
  ]
}

IMPORTANT: 
- Return ONLY valid JSON
- No markdown, no code blocks, no extra text
- Exactly 5 questions, each 10 marks
- Answer keys must be comprehensive and detailed
- Include answer guidelines for fair evaluation
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
             q.marks === 10 &&
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
 * Check assignment answers using AI with answer keys
 */
export const checkAssignmentWithAI = async (answerKeys, studentAnswers) => {
  try {
    console.log("🤖 Checking assignment answers with AI...");
    
    const prompt = `
You are an expert teacher checking assignment answers. Be fair, context-aware, and give partial marks for partially correct answers.

Compare each student answer with the answer key and guidelines. Award marks based on:
- Correctness of concepts
- Completeness of answer
- Depth of explanation
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
      "marksAwarded": 8,
      "reason": "Good understanding shown, covered main concepts but missing some details",
      "feedback": "Excellent coverage of light reactions. Add more details about Calvin cycle intermediates and mention the role of RuBisCO enzyme."
    }
  ]
}

IMPORTANT:
- Be lenient with phrasing variations
- Award full marks if concept is correct and complete
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

export default { generateAssignmentFromText, checkAssignmentWithAI };