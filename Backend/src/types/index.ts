export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
  coverImage?: string;
}

export interface Feedback {
  id: string;
  interviewId: string;
  userId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
  englishFeedback?: {
    overallLevel: string;      // CEFR: A1, A2, B1, B2, C1, C2
    grammarScore: number;      // 0-100
    vocabularyScore: number;   // 0-100
    fluencyScore: number;      // 0-100
    grammarErrors: string[];   // ejemplos de errores gramaticales detectados
    vocabularySuggestions: string[]; // palabras/frases que podría mejorar
    overallComment: string;    // resumen del nivel de inglés
  };
}

export interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
}

export interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

export interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

export interface SignUpParams {
  uid: string;
  name: string;
  email: string;
}

export interface SignInParams {
  email: string;
  idToken: string;
}
