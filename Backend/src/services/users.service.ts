import {
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLES } from "../config/dynamo";
import { User } from "../types";

export async function getUserById(uid: string): Promise<User | null> {
  const result = await dynamo.send(
    new GetCommand({
      TableName: TABLES.USERS,
      Key: { id: uid },
    })
  );

  if (!result.Item) return null;
  return result.Item as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
      Limit: 1,
    })
  );

  if (!result.Items || result.Items.length === 0) return null;
  return result.Items[0] as User;
}

export async function createUser(user: User): Promise<void> {
  await dynamo.send(
    new PutCommand({
      TableName: TABLES.USERS,
      Item: user,
      ConditionExpression: "attribute_not_exists(id)",
    })
  );
}
