import { Interview } from "../types";
export declare function getInterviewsByUserId(userId: string): Promise<Interview[]>;
export declare function getLatestInterviews(userId: string, limit?: number): Promise<Interview[]>;
export declare function getInterviewById(id: string): Promise<Interview | null>;
export declare function createInterview(interview: Omit<Interview, "id">): Promise<string>;
