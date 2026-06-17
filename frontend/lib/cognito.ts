/**
 * lib/cognito.ts
 *
 * Cliente de autenticación híbrido. Soporta AWS Cognito y Supabase Auth.
 */

import { supabase } from "./supabase";

const REGION       = process.env.NEXT_PUBLIC_AWS_REGION       || "us-east-1";
const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "";
const CLIENT_ID    = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "";

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
): Promise<{ userSub: string; session?: any }> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Error al registrar el usuario en Supabase");

    return { userSub: data.user.id, session: data.session };
  }

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
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });

    if (error) throw new Error(error.message);
    return;
  }

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
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.session) throw new Error("Error al obtener la sesión de Supabase");

    return {
      idToken:      data.session.access_token,
      accessToken:  data.session.access_token,
      refreshToken: data.session.refresh_token || "",
    };
  }

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
export async function signOutCognito(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("cognitoIdToken");
    localStorage.removeItem("cognitoAccessToken");
    localStorage.removeItem("cognitoRefreshToken");
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    await supabase.auth.signOut();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET CURRENT ID TOKEN — Leer desde localStorage
// ─────────────────────────────────────────────────────────────────────────────
export function getCognitoIdToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("cognitoIdToken") ?? "";
}

