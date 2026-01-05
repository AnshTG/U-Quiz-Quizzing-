
export interface NCERTEntry {
  subjectName: string;
  className: string;
  chapterName: string;
}

export interface QuizConfig {
  class: string;
  subject: string;
  topics: string[];
  strength: 'Easy' | 'Medium' | 'Hard';
  quantity: number;
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export enum AppState {
  HOME = 'HOME',
  SETUP = 'SETUP',
  LOADING = 'LOADING',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS',
  CURRICULUM = 'CURRICULUM'
}
