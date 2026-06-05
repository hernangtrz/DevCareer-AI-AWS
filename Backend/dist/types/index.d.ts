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
}
export interface CreateFeedbackParams {
    interviewId: string;
    userId: string;
    transcript: {
        role: string;
        content: string;
    }[];
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
