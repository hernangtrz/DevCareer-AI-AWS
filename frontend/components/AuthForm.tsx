"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/api";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Cuenta creada con éxito. Por favor inicia sesión.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Error al iniciar sesión. Intenta nuevamente.");
          return;
        }

        // 1. Pedir sessionCookie al backend
        const result = await signIn({ idToken });

        if (!result.success || !result.sessionCookie) {
          toast.error(result.message || "Error al iniciar sesión.");
          return;
        }

        // 2. Guardar sessionCookie como cookie httpOnly via Route Handler
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionCookie: result.sessionCookie }),
        });

        toast.success("Sesión iniciada correctamente.");
        router.refresh();
        router.push("/dashboard");
      }
    } catch (error) {
      console.log(error);
      toast.error(`Hubo un error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image
            src="/logo.svg"
            alt="logo de DevCareer AI"
            height={36}
            width={36}
          />
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
              placeholder="Ingresa tu contraseña"
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
