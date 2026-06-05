import { z } from "zod";
export declare const feedbackSchema: z.ZodObject<{
    totalScore: z.ZodNumber;
    categoryScores: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        score: z.ZodNumber;
        comment: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        score?: number;
        comment?: string;
    }, {
        name?: string;
        score?: number;
        comment?: string;
    }>, "many">;
    strengths: z.ZodArray<z.ZodString, "many">;
    areasForImprovement: z.ZodArray<z.ZodString, "many">;
    finalAssessment: z.ZodString;
}, "strip", z.ZodTypeAny, {
    totalScore?: number;
    categoryScores?: {
        name?: string;
        score?: number;
        comment?: string;
    }[];
    strengths?: string[];
    areasForImprovement?: string[];
    finalAssessment?: string;
}, {
    totalScore?: number;
    categoryScores?: {
        name?: string;
        score?: number;
        comment?: string;
    }[];
    strengths?: string[];
    areasForImprovement?: string[];
    finalAssessment?: string;
}>;
export declare const interviewCovers: string[];
export declare const getRandomInterviewCover: () => string;
export declare const interviewTemplates: {
    id: string;
    role: string;
    level: string;
    type: string;
    techstack: string[];
    questions: string[];
    finalized: boolean;
}[];
