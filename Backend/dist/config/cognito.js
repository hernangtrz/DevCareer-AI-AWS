"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cognitoIdVerifier = exports.cognitoVerifier = void 0;
const aws_jwt_verify_1 = require("aws-jwt-verify");
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
// Verifica Access Tokens de Cognito
exports.cognitoVerifier = aws_jwt_verify_1.CognitoJwtVerifier.create({
    userPoolId: USER_POOL_ID,
    tokenUse: "access",
    clientId: CLIENT_ID,
});
// Verifica ID Tokens de Cognito (contiene name, email, sub)
exports.cognitoIdVerifier = aws_jwt_verify_1.CognitoJwtVerifier.create({
    userPoolId: USER_POOL_ID,
    tokenUse: "id",
    clientId: CLIENT_ID,
});
//# sourceMappingURL=cognito.js.map