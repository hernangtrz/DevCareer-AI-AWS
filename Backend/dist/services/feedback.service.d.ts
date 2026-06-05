import { Feedback } from "../types";
export declare function createFeedbackRecord(feedback: Omit<Feedback, "id">): Promise<string>;
export declare function getFeedbackByInterviewId(interviewId: string, userId: string): Promise<Feedback | null>;
