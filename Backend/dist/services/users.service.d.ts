import { User } from "../types";
export declare function getUserById(uid: string): Promise<User | null>;
export declare function getUserByEmail(email: string): Promise<User | null>;
export declare function createUser(user: User): Promise<void>;
