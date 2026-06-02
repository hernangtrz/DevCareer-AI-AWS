"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  signUpCognito,
  confirmSignUpCognito,
  signInCognito,
} from "@/lib/cognito";
import { signIn, signUp } from "@/lib/api";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [pendingEmail, setPendingEmail]       = useState("");
  const [pendingName, setPendingName]         = useState("");
  const [pendingSub, setPendingSub]           = useState("");
  const [confirmCode, setConfirmCode]         = useState("");
  const [confirmLoading, setConfirmLoading]   = useState(false);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        // 1. Registrar usuario en Cognito
        const { userSub } = await signUpCognito(email, password!, name!);

        // 2. Mostrar formulario de confirmación de código
        setPendingEmail(email);
        setPendingName(name!);
        setPendingSub(userSub);
        setPendingConfirmation(true);

        toast.info("Te enviamos un código de verificación a tu correo.");
      } else {
        const { email, password } = data;

        // 1. Autenticar en Cognito y obtener ID Token
        const { idToken } = await signInCognito(email, password);

        // 2. Guardar token en localStorage para Client Components (Agent.tsx)
        localStorage.setItem("cognitoIdToken", idToken);

        // 3. Pedir sessionCookie al backend (valida el token y crea usuario en DynamoDB si es necesario)
        const result = await signIn({ idToken });

        if (!result.success || !result.sessionCookie) {
          toast.error(result.message || "Error al iniciar sesión.");
          return;
        }

        // 4. Guardar sessionCookie como cookie httpOnly para Server Components
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionCookie: result.sessionCookie }),
        });

        toast.success("Sesión iniciada correctamente.");
        router.refresh();
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      const msg = error?.message || "Hubo un error. Intenta nuevamente.";
      toast.error(msg);
    }
  };

  // ─── Confirmar código de verificación de Cognito ────────────────────────
  const handleConfirmCode = async () => {
    if (!confirmCode || confirmCode.length < 6) {
      toast.error("Ingresa el código de 6 dígitos que recibiste por email.");
      return;
    }

    setConfirmLoading(true);
    try {
      // 1. Confirmar cuenta en Cognito
      await confirmSignUpCognito(pendingEmail, confirmCode);

      // 2. Registrar usuario en DynamoDB del backend
      const result = await signUp({
        uid:   pendingSub,
        name:  pendingName,
        email: pendingEmail,
      });

      if (!result.success) {
        // 409 = ya existe, igual podemos redirigir a login
        if (result.message?.includes("ya existe")) {
          toast.success("Cuenta confirmada. Por favor inicia sesión.");
        } else {
          toast.error(result.message);
          return;
        }
      } else {
        toast.success("¡Cuenta creada con éxito! Por favor inicia sesión.");
      }

      router.push("/sign-in");
    } catch (error: any) {
      toast.error(error?.message || "Código inválido o expirado. Intenta de nuevo.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const isSignIn = type === "sign-in";

  // ─── Pantalla de confirmación de código ─────────────────────────────────
  if (pendingConfirmation) {
    return (
      <div className="card-border lg:min-w-[566px]">
        <div className="flex flex-col gap-6 card py-14 px-10">
          <div className="flex flex-row gap-2 justify-center">
            <Image src="/logo.svg" alt="logo DevCareer AI" height={36} width={36} />
            <h2 className="text-primary-100">DevCareer AI</h2>
          </div>

          <h3>Confirma tu correo electrónico</h3>
          <p className="text-sm text-center opacity-80">
            Enviamos un código de 6 dígitos a <strong>{pendingEmail}</strong>.
            Ingrésalo abajo para activar tu cuenta.
          </p>

          <input
            type="text"
            inputMode="numeric"
            placeholder="Código de verificación (6 dígitos)"
            maxLength={6}
            value={confirmCode}
            onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ""))}
            className="border rounded-md px-4 py-3 text-center text-lg tracking-widest w-full"
          />

          <Button
            className="btn"
            onClick={handleConfirmCode}
            disabled={confirmLoading}
          >
            {confirmLoading ? "Verificando..." : "Verificar cuenta"}
          </Button>

          <p className="text-center text-sm opacity-70">
            ¿Ya tienes cuenta?{" "}
            <Link href="/sign-in" className="font-bold text-user-primary">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ─── Formulario principal de login / registro ─────────────────────────
  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo de DevCareer AI" height={36} width={36} />
          <h2 className="text-primary-100">DevCareer AI</h2>
        </div>

        <h3>Practica entrevistas de trabajo con IA</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Nombre"
                placeholder="Tu nombre"
                type="text"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Correo electrónico"
              placeholder="Tu correo electrónico"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              type="password"
            />

            <Button className="btn" type="submit">
              {isSignIn ? "Iniciar sesión" : "Crear cuenta"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Iniciar sesión" : "Regístrate"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
