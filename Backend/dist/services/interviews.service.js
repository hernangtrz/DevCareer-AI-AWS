"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInterviewsByUserId = getInterviewsByUserId;
exports.getLatestInterviews = getLatestInterviews;
exports.getInterviewById = getInterviewById;
exports.createInterview = createInterview;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const dynamo_1 = require("../config/dynamo");
const uuid_1 = require("uuid");
async function getInterviewsByUserId(userId) {
    const result = await dynamo_1.dynamo.send(new lib_dynamodb_1.QueryCommand({
        TableName: dynamo_1.TABLES.INTERVIEWS,
        IndexName: "userId-createdAt-index",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
        ScanIndexForward: false, // desc por createdAt
    }));
    return (result.Items || []);
}
async function getLatestInterviews(userId, limit = 20) {
    // Trae entrevistas finalizadas de otros usuarios
    const result = await dynamo_1.dynamo.send(new lib_dynamodb_1.ScanCommand({
        TableName: dynamo_1.TABLES.INTERVIEWS,
        FilterExpression: "finalized = :finalized AND userId <> :userId",
        ExpressionAttributeValues: {
            ":finalized": true,
            ":userId": userId,
        },
        Limit: limit * 3, // sobreescanear para compensar el filtro
    }));
    const items = (result.Items || []);
    // Ordenar por createdAt desc y limitar
    return items
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
}
async function getInterviewById(id) {
    const result = await dynamo_1.dynamo.send(new lib_dynamodb_1.GetCommand({
        TableName: dynamo_1.TABLES.INTERVIEWS,
        Key: { id },
    }));
    if (!result.Item)
        return null;
    return result.Item;
}
async function createInterview(interview) {
    const id = (0, uuid_1.v4)();
    const item = { id, ...interview };
    await dynamo_1.dynamo.send(new lib_dynamodb_1.PutCommand({
        TableName: dynamo_1.TABLES.INTERVIEWS,
        Item: item,
    }));
    return id;
}
//# sourceMappingURL=interviews.service.js.map