import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLES } from "../config/dynamo";
import { supabase } from "../config/supabase";
import { Feedback } from "../types";
import { v4 as uuidv4 } from "uuid";

// Mappers to translate between database schema (snake_case) and JS object (camelCase)
function mapFeedbackFromDb(row: any): Feedback {
  return {
    id: row.id,
    interviewId: row.interview_id,
    userId: row.user_id,
    totalScore: Number(row.total_score),
    categoryScores: row.category_scores || [],
    strengths: row.strengths || [],
    areasForImprovement: row.areas_for_improvement || [],
    finalAssessment: row.final_assessment,
    createdAt: row.created_at || new Date().toISOString(),
    englishFeedback: row.english_feedback,
  };
}

function mapFeedbackToDb(feedback: Partial<Feedback>): any {
  const row: any = {};
  if (feedback.id !== undefined) row.id = feedback.id;
  if (feedback.interviewId !== undefined) row.interview_id = feedback.interviewId;
  if (feedback.userId !== undefined) row.user_id = feedback.userId;
  if (feedback.totalScore !== undefined) row.total_score = feedback.totalScore;
  if (feedback.categoryScores !== undefined) row.category_scores = feedback.categoryScores;
  if (feedback.strengths !== undefined) row.strengths = feedback.strengths;
  if (feedback.areasForImprovement !== undefined) row.areas_for_improvement = feedback.areasForImprovement;
  if (feedback.finalAssessment !== undefined) row.final_assessment = feedback.finalAssessment;
  if (feedback.createdAt !== undefined) row.created_at = feedback.createdAt;
  if (feedback.englishFeedback !== undefined) row.english_feedback = feedback.englishFeedback;
  return row;
}

export async function createFeedbackRecord(
  feedback: Omit<Feedback, "id">
): Promise<string> {
  const id = uuidv4();
  const item: Feedback = { id, ...feedback };

  if (process.env.SUPABASE_URL) {
    const row = mapFeedbackToDb(item);
    const { error } = await supabase
      .from("feedback")
      .insert(row);

    if (error) {
      console.error("Error in Supabase createFeedbackRecord:", error);
      throw error;
    }
    return id;
  }

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
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("interview_id", interviewId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error in Supabase getFeedbackByInterviewId:", error);
      return null;
    }

    if (!data || data.length === 0) return null;

    // Retornar el más reciente
    return mapFeedbackFromDb(data[0]);
  }

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

