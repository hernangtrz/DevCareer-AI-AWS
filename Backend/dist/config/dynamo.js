"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TABLES = exports.dynamo = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
// Si AWS_ACCESS_KEY_ID está presente la usa, si no deja que el SDK
// tome las credenciales del rol IAM del contenedor (LabRole)
const clientConfig = {
    region: process.env.AWS_REGION || "us-east-1",
};
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
    };
}
const client = new client_dynamodb_1.DynamoDBClient(clientConfig);
exports.dynamo = lib_dynamodb_1.DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true,
    },
});
exports.TABLES = {
    USERS: process.env.DYNAMO_TABLE_USERS || "devcareer_users",
    INTERVIEWS: process.env.DYNAMO_TABLE_INTERVIEWS || "devcareer_interviews",
    FEEDBACK: process.env.DYNAMO_TABLE_FEEDBACK || "devcareer_feedback",
};
//# sourceMappingURL=dynamo.js.map