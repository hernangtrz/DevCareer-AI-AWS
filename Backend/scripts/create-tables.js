#!/usr/bin/env node
/**
 * Script para crear las tablas de DynamoDB en AWS.
 * Ejecutar UNA SOLA VEZ antes de desplegar el backend.
 *
 * Uso:
 *   node scripts/create-tables.js
 *
 * Requiere las variables de entorno AWS_REGION, AWS_ACCESS_KEY_ID,
 * AWS_SECRET_ACCESS_KEY configuradas (o usar un perfil AWS local).
 */

require("dotenv").config();
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");

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

const client = new DynamoDBClient(clientConfig);

const TABLES = {
  USERS: process.env.DYNAMO_TABLE_USERS || "devcareer_users",
  INTERVIEWS: process.env.DYNAMO_TABLE_INTERVIEWS || "devcareer_interviews",
  FEEDBACK: process.env.DYNAMO_TABLE_FEEDBACK || "devcareer_feedback",
};

const tableDefinitions = [
  {
    TableName: TABLES.USERS,
    // PK: id (Firebase UID)
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "email", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        // Permite buscar usuario por email
        IndexName: "email-index",
        KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  },
  {
    TableName: TABLES.INTERVIEWS,
    // PK: id (UUID generado por el backend)
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        // Permite listar entrevistas de un usuario ordenadas por fecha
        IndexName: "userId-createdAt-index",
        KeySchema: [
          { AttributeName: "userId", KeyType: "HASH" },
          { AttributeName: "createdAt", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  },
  {
    TableName: TABLES.FEEDBACK,
    // PK: id (UUID generado por el backend)
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "interviewId", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        // Permite buscar feedback por interviewId + userId
        IndexName: "interviewId-userId-index",
        KeySchema: [
          { AttributeName: "interviewId", KeyType: "HASH" },
          { AttributeName: "userId", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  },
];

async function tableExists(tableName) {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("🚀 Creando tablas de DynamoDB para DevCareer AI...\n");

  for (const definition of tableDefinitions) {
    const exists = await tableExists(definition.TableName);

    if (exists) {
      console.log(`⏭️  Tabla "${definition.TableName}" ya existe. Saltando.`);
      continue;
    }

    try {
      await client.send(new CreateTableCommand(definition));
      console.log(`✅ Tabla "${definition.TableName}" creada correctamente.`);
    } catch (error) {
      console.error(`❌ Error creando tabla "${definition.TableName}":`, error.message);
    }
  }

  console.log("\n✅ Proceso completado.");
}

main();
