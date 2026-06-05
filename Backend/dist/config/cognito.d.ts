export declare const cognitoVerifier: import("aws-jwt-verify/cognito-verifier").CognitoJwtVerifierSingleUserPool<{
    userPoolId: string;
    tokenUse: "access";
    clientId: string;
}>;
export declare const cognitoIdVerifier: import("aws-jwt-verify/cognito-verifier").CognitoJwtVerifierSingleUserPool<{
    userPoolId: string;
    tokenUse: "id";
    clientId: string;
}>;
