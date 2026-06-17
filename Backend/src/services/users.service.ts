import {
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLES } from "../config/dynamo";
import { supabase } from "../config/supabase";
import { User } from "../types";

export async function getUserById(uid: string): Promise<User | null> {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", uid)
      .maybeSingle();

    if (error) {
      console.error("Error in Supabase getUserById:", error);
      return null;
    }
    return data as User | null;
  }

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
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Error in Supabase getUserByEmail:", error);
      return null;
    }
    return data as User | null;
  }

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
  if (process.env.SUPABASE_URL) {
    const { error } = await supabase
      .from("users")
      .insert({
        id: user.id,
        name: user.name,
        email: user.email,
      });

    if (error) {
      console.error("Error in Supabase createUser:", error);
      throw error;
    }
    return;
  }

  await dynamo.send(
    new PutCommand({
      TableName: TABLES.USERS,
      Item: user,
      ConditionExpression: "attribute_not_exists(id)",
    })
  );
}

