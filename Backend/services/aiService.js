export const AI_Service = {
  generateContent: (sourceText) => ({
    question_type: "Short Answer",
    question: `Explain in your own words: ${sourceText.substring(0, 80)}...`,
    max_marks: 10,
  }),

  gradeSubjective: (answerText, sourceText) => {
    const score = Math.min(10, Math.floor(answerText.split(" ").length / 3));
    const feedback =
      score < 7 ? "Good effort, but elaborate more." : "Excellent explanation!";
    return { grade: score, feedback };
  },

  checkPlagiarism: (answerText) => {
    const randomScore = Math.random() * 0.4; // 0–40%
    return parseFloat(randomScore.toFixed(2));
  },
};

