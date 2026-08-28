
import { QuizConfig, Question } from "../types";

export const generateQuestions = async (config: QuizConfig): Promise<Question[]> => {
  try {
    const res = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ config }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${res.status}`);
    }

    const data = await res.json();
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Invalid response format from server");
    }

    return data.questions;
  } catch (error) {
    console.error("Session Generation Failure:", error);
    throw error;
  }
};

export interface GeminiChatQueryOptions {
  messages: { role: 'user' | 'model'; content: string }[];
  classContext?: string;
  subjectContext?: string;
  syllabusYear?: string;
}

export const sendGeminiStudyQuery = async (options: GeminiChatQueryOptions): Promise<string> => {
  try {
    const res = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${res.status}`);
    }

    const data = await res.json();
    if (!data.reply) {
      throw new Error("No response received from AI Study Tutor");
    }

    return data.reply;
  } catch (error) {
    console.error("Gemini Chat Failure:", error);
    throw error;
  }
};

