import {
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLES } from "../config/dynamo";
import { Interview } from "../types";
import { v4 as uuidv4 } from "uuid";

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[]> {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: TABLES.INTERVIEWS,
      IndexName: "userId-createdAt-index",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
      ScanIndexForward: false, // desc por createdAt
    })
  );

  return (result.Items || []) as Interview[];
}

export async function getLatestInterviews(
  userId: string,
  limit: number = 20
): Promise<Interview[]> {
  // Trae entrevistas finalizadas de otros usuarios
  const result = await dynamo.send(
    new ScanCommand({
      TableName: TABLES.INTERVIEWS,
      FilterExpression:
        "finalized = :finalized AND userId <> :userId",
      ExpressionAttributeValues: {
        ":finalized": true,
        ":userId": userId,
      },
      Limit: limit * 3, // sobreescanear para compensar el filtro
    })
  );

  const items = (result.Items || []) as Interview[];

  // Ordenar por createdAt desc y limitar
  return items
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const result = await dynamo.send(
    new GetCommand({
      TableName: TABLES.INTERVIEWS,
      Key: { id },
    })
  );

  if (!result.Item) return null;
  return result.Item as Interview;
}

export async function createInterview(
  interview: Omit<Interview, "id">
): Promise<string> {
  const id = uuidv4();
  const item: Interview = { id, ...interview };

  await dynamo.send(
    new PutCommand({
      TableName: TABLES.INTERVIEWS,
      Item: item,
    })
  );

  return id;
}

export async function updateInterview(
  interview: Interview
): Promise<void> {
  await dynamo.send(
    new PutCommand({
      TableName: TABLES.INTERVIEWS,
      Item: interview,
    })
  );
}
