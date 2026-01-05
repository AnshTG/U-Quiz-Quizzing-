
import { GoogleGenAI, Type } from "@google/genai";
import { QuizConfig, Question } from "../types";

export const generateQuestions = async (config: QuizConfig): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const topicsList = config.topics.join(", ");
  const prompt = `
    Act as a senior NCERT Subject Matter Expert.
    Generate a high-quality assessment with exactly ${config.quantity} items.
    
    CONTEXT:
    - Grade: ${config.class}
    - Subject: ${config.subject}
    - Scope: ${topicsList}
    - Cognitive Demand: ${config.strength} (Easy=Recall, Medium=Application, Hard=Analysis)

    OUTPUT FORMAT RULES (MANDATORY):
    1. Language: Use professional, academic English/Hindi as per the subject.
    2. Options: Exactly 4 distinct options per question.
    3. Explanation: Provide a "Rationale" citing the NCERT concept.
    
    TEXT & MATH RENDERING RULES (CRITICAL):
    - Fractions: DO NOT USE LaTeX \\frac. ALWAYS use horizontal "p/q" style (e.g., 5/8, 1/2).
    - Decimals: Use standard notation (e.g., 0.75, 12.5). 
    - Exponents: Use standard caret notation (e.g., x^2, 10^3).
    - Symbols: Only use LaTeX $ delimiters for complex symbols like square roots ($ \\sqrt{x} $) or Greek letters ($ \\theta $).
    - Currency: Use "₹" symbol directly.
    - Encoding: Ensure no non-standard control characters are in the string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"],
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("AI returned empty content");
    
    let parsed: Question[] = JSON.parse(jsonText);
    
    // Validate and clean up result
    return parsed.map(q => ({
      ...q,
      options: (q.options || []).slice(0, 4),
      // Force double check on p/q if AI hallucinated \frac
      question: q.question.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2'),
      correctAnswer: q.correctAnswer.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2'),
      explanation: q.explanation.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2'),
    }));
  } catch (error) {
    console.error("Session Generation Failure:", error);
    throw error;
  }
};
