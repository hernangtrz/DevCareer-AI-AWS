"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = getUserById;
exports.getUserByEmail = getUserByEmail;
exports.createUser = createUser;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const dynamo_1 = require("../config/dynamo");
async function getUserById(uid) {
    const result = await dynamo_1.dynamo.send(new lib_dynamodb_1.GetCommand({
        TableName: dynamo_1.TABLES.USERS,
        Key: { id: uid },
    }));
    if (!result.Item)
        return null;
    return result.Item;
}
async function getUserByEmail(email) {
    const result = await dynamo_1.dynamo.send(new lib_dynamodb_1.QueryCommand({
        TableName: dynamo_1.TABLES.USERS,
        IndexName: "email-index",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
        Limit: 1,
    }));
    if (!result.Items || result.Items.length === 0)
        return null;
    return result.Items[0];
}
async function createUser(user) {
    await dynamo_1.dynamo.send(new lib_dynamodb_1.PutCommand({
        TableName: dynamo_1.TABLES.USERS,
        Item: user,
        ConditionExpression: "attribute_not_exists(id)",
    }));
}
//# sourceMappingURL=users.service.js.map