import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
export declare const dynamo: DynamoDBDocumentClient;
export declare const TABLES: {
    USERS: string;
    INTERVIEWS: string;
    FEEDBACK: string;
};
