import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
export interface AuthRequest extends Request<ParamsDictionary, any, any, ParsedQs> {
    userId?: string;
    userEmail?: string;
    userName?: string;
}
export declare function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
