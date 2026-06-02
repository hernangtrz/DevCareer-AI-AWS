import { CognitoJwtVerifier } from "aws-jwt-verify";

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
const CLIENT_ID    = process.env.COGNITO_CLIENT_ID!;

// Verifica Access Tokens de Cognito
export const cognitoVerifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse:   "access",
  clientId:   CLIENT_ID,
});

// Verifica ID Tokens de Cognito (contiene name, email, sub)
export const cognitoIdVerifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse:   "id",
  clientId:   CLIENT_ID,
});
