"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFeedbackRecord = createFeedbackRecord;
exports.getFeedbackByInterviewId = getFeedbackByInterviewId;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const dynamo_1 = require("../config/dynamo");
const uuid_1 = require("uuid");
async function createFeedbackRecord(feedback) {
    const id = (0, uuid_1.v4)();
    const item = { id, ...feedback };
    await dynamo_1.dynamo.send(new lib_dynamodb_1.PutCommand({
        TableName: dynamo_1.TABLES.FEEDBACK,
        Item: item,
    }));
    return id;
}
async function getFeedbackByInterviewId(interviewId, userId) {
    const result = await dynamo_1.dynamo.send(new lib_dynamodb_1.QueryCommand({
        TableName: dynamo_1.TABLES.FEEDBACK,
        IndexName: "interviewId-userId-index",
        KeyConditionExpression: "interviewId = :interviewId AND userId = :userId",
        ExpressionAttributeValues: {
            ":interviewId": interviewId,
            ":userId": userId,
        },
    }));
    if (!result.Items || result.Items.length === 0)
        return null;
    const feedbacks = result.Items;
    // Retornar el más reciente
    return feedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}
//# sourceMappingURL=feedback.service.js.map