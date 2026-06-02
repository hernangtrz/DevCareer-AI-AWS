/**
 * lib/cognito.ts
 *
 * Cliente de autenticación con AWS Cognito usando las APIs REST directas.
 * No requiere dependencias externas — usa el fetch nativo del navegador.
 */

const REGION       = process.env.NEXT_PUBLIC_AWS_REGION       || "us-east-1";
const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!;
const CLIENT_ID    = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;

const COGNITO_URL = `https://cognito-idp.${REGION}.amazonaws.com/`;

async function cognitoRequest(target: string, body: object) {
  const res = await fetch(COGNITO_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.__type || "Error de Cognito");
  }

  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGN UP — Registrar nuevo usuario
// ─────────────────────────────────────────────────────────────────────────────
export async function signUpCognito(
  email: string,
  password: string,
  name: string
): Promise<{ userSub: string }> {
  const data = await cognitoRequest("SignUp", {
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name",  Value: name },
    ],
  });

  return { userSub: data.UserSub };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM SIGN UP — Confirmar código de verificación enviado al email
// ─────────────────────────────────────────────────────────────────────────────
export async function confirmSignUpCognito(
  email: string,
  code: string
): Promise<void> {
  await cognitoRequest("ConfirmSignUp", {
    ClientId:         CLIENT_ID,
    Username:         email,
    ConfirmationCode: code,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGN IN — Iniciar sesión y obtener tokens
// ─────────────────────────────────────────────────────────────────────────────
export async function signInCognito(
  email: string,
  password: string
): Promise<{ idToken: string; accessToken: string; refreshToken: string }> {
  const data = await cognitoRequest("InitiateAuth", {
    ClientId:  CLIENT_ID,
    AuthFlow:  "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });

  const result = data.AuthenticationResult;

  return {
    idToken:      result.IdToken,
    accessToken:  result.AccessToken,
    refreshToken: result.RefreshToken,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGN OUT — Limpiar sesión local
// ─────────────────────────────────────────────────────────────────────────────
export function signOutCognito(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("cognitoIdToken");
    localStorage.removeItem("cognitoAccessToken");
    localStorage.removeItem("cognitoRefreshToken");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET CURRENT ID TOKEN — Leer desde localStorage
// ─────────────────────────────────────────────────────────────────────────────
export function getCognitoIdToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("cognitoIdToken") ?? "";
}
