import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Si AWS_ACCESS_KEY_ID está presente la usa, si no deja que el SDK
// tome las credenciales del rol IAM del contenedor (LabRole)
const clientConfig: ConstructorParameters<typeof DynamoDBClient>[0] = {
  region: process.env.AWS_REGION || "us-east-1",
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
  };
}

const client = new DynamoDBClient(clientConfig);

export const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const TABLES = {
  USERS: process.env.DYNAMO_TABLE_USERS || "devcareer_users",
  INTERVIEWS: process.env.DYNAMO_TABLE_INTERVIEWS || "devcareer_interviews",
  FEEDBACK: process.env.DYNAMO_TABLE_FEEDBACK || "devcareer_feedback",
};