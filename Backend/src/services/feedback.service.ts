import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLES } from "../config/dynamo";
import { Feedback } from "../types";
import { v4 as uuidv4 } from "uuid";

export async function createFeedbackRecord(
  feedback: Omit<Feedback, "id">
): Promise<string> {
  const id = uuidv4();
  const item: Feedback = { id, ...feedback };

  await dynamo.send(
    new PutCommand({
      TableName: TABLES.FEEDBACK,
      Item: item,
    })
  );

  return id;
}

export async function getFeedbackByInterviewId(
  interviewId: string,
  userId: string
): Promise<Feedback | null> {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: TABLES.FEEDBACK,
      IndexName: "interviewId-userId-index",
      KeyConditionExpression:
        "interviewId = :interviewId AND userId = :userId",
      ExpressionAttributeValues: {
        ":interviewId": interviewId,
        ":userId": userId,
      },
    })
  );

  if (!result.Items || result.Items.length === 0) return null;

  const feedbacks = result.Items as Feedback[];

  // Retornar el más reciente
  return feedbacks.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
}
