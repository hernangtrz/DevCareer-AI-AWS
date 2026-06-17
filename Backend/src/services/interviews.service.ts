import {
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLES } from "../config/dynamo";
import { supabase } from "../config/supabase";
import { Interview } from "../types";
import { v4 as uuidv4 } from "uuid";

// Mappers to translate between database schema (snake_case) and JS object (camelCase)
function mapInterviewFromDb(row: any): Interview {
  return {
    id: row.id,
    role: row.role,
    level: row.level,
    questions: row.questions || [],
    techstack: row.techstack || [],
    createdAt: row.created_at || new Date().toISOString(),
    userId: row.user_id,
    type: row.type,
    finalized: !!row.finalized,
    coverImage: row.cover_image,
  };
}

function mapInterviewToDb(interview: Partial<Interview>): any {
  const row: any = {};
  if (interview.id !== undefined) row.id = interview.id;
  if (interview.role !== undefined) row.role = interview.role;
  if (interview.level !== undefined) row.level = interview.level;
  if (interview.questions !== undefined) row.questions = interview.questions;
  if (interview.techstack !== undefined) row.techstack = interview.techstack;
  if (interview.createdAt !== undefined) row.created_at = interview.createdAt;
  if (interview.userId !== undefined) row.user_id = interview.userId;
  if (interview.type !== undefined) row.type = interview.type;
  if (interview.finalized !== undefined) row.finalized = interview.finalized;
  if (interview.coverImage !== undefined) row.cover_image = interview.coverImage;
  return row;
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[]> {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error in Supabase getInterviewsByUserId:", error);
      return [];
    }
    return (data || []).map(mapInterviewFromDb);
  }

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
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("finalized", true)
      .neq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error in Supabase getLatestInterviews:", error);
      return [];
    }
    return (data || []).map(mapInterviewFromDb);
  }

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
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error in Supabase getInterviewById:", error);
      return null;
    }
    return data ? mapInterviewFromDb(data) : null;
  }

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

  if (process.env.SUPABASE_URL) {
    const row = mapInterviewToDb(item);
    const { error } = await supabase
      .from("interviews")
      .insert(row);

    if (error) {
      console.error("Error in Supabase createInterview:", error);
      throw error;
    }
    return id;
  }

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
  if (process.env.SUPABASE_URL) {
    const row = mapInterviewToDb(interview);
    const { error } = await supabase
      .from("interviews")
      .update(row)
      .eq("id", interview.id);

    if (error) {
      console.error("Error in Supabase updateInterview:", error);
      throw error;
    }
    return;
  }

  await dynamo.send(
    new PutCommand({
      TableName: TABLES.INTERVIEWS,
      Item: interview,
    })
  );
}

