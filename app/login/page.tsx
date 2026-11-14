"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../_components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../_components/ui/field";
import { Input } from "../_components/ui/input";
import { setAuthToast } from "../_components/auth-toast";
import { Alert, AlertDescription, AlertTitle } from "../_components/ui/alert";

const formSchema = z.object({
  email: z
    .email("Informe um e-mail válido.")
    .trim()
    .min(1, "E-mail é obrigatório."),
  password: z.string().min(1, "Senha é obrigatória."),
});

type LoginFormData = z.infer<typeof formSchema>;

type CsrfResponse = {
  headerName: string;
  token: string;
};

type LoginErrorResponse = {
  message?: string;
};

const LoginPage = () => {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    try {
      const csrfResponse = await fetch("/api/auth/csrf", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!csrfResponse.ok) {
        throw new Error("Não foi possível iniciar a autenticação.");
      }

      const csrf = (await csrfResponse.json()) as CsrfResponse;

      if (!csrf.token || csrf.headerName !== "X-XSRF-TOKEN") {
        throw new Error("Token de segurança inválido.");
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          [csrf.headerName]: csrf.token,
        },
        body: JSON.stringify({
          email: data.email,
          senha: data.password,
        }),
      });

      if (!response.ok) {
        switch (response.status) {
          case 400:
            setServerError("Verifique os dados informados e tente novamente.");
            return;

          case 401:
            setServerError("E-mail ou senha inválidos.");
            return;

          case 403:
            setServerError(
              "Não foi possível validar a sessão. Tente novamente.",
            );
            return;

          case 429:
            setServerError(
              "Muitas tentativas de login. Por segurança, aguarde alguns minutos antes de tentar novamente.",
            );
            return;

          default: {
            const errorData = (await response
              .json()
              .catch(() => ({}))) as LoginErrorResponse;

            throw new Error(
              errorData.message ?? "Não foi possível realizar o login.",
            );
          }
        }
      }

      setAuthToast("login");
      window.location.replace("/home");
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      );
    }
  };

  return (
    <main className="min-h-dvh bg-white lg:grid lg:grid-cols-2">
      {/* Mobile Hero */}
      <div className="relative flex h-[44svh] min-h-75 max-h-95 shrink-0 items-start justify-center overflow-hidden pt-8 lg:hidden">
        <Image
          src="/city.png"
          alt="Parô banner"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-[center_82%]"
        />

        <Image
          src="/logo.png"
          alt="Parô"
          width={186}
          height={237}
          className="relative h-auto w-18.5"
        />
      </div>

      {/* Desktop Left Side */}
      <section className="relative hidden min-h-dvh overflow-hidden lg:flex lg:flex-col lg:justify-between">
        <Image
          src="/city.png"
          alt="Parô banner"
          fill
          sizes="50vw"
          className="object-cover object-[center_70%]"
          priority
        />

        <div className="absolute inset-0 bg-primary/70" />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Parô" width={64} height={82} />
            <div>
              <h1 className="text-3xl font-bold text-white">Parô</h1>
              <p className="text-sm text-white/80">
                Pontos de apoio para quem move a cidade
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <span className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              Bem-vindo de volta
            </span>

            <h2 className="text-4xl font-bold leading-tight text-white">
              Encontre apoio durante sua jornada de trabalho.
            </h2>

            <p className="mt-4 text-base leading-relaxed text-white/85">
              Acesse sua conta para localizar estabelecimentos com água,
              banheiro, descanso e outros recursos essenciais perto de você.
            </p>
          </div>

          <p className="relative z-10 text-sm text-white/70">
            Parô © 2026 — Conectando trabalhadores e estabelecimentos.
          </p>
        </div>
      </section>

      {/* Form Area */}
      <section className="relative z-10 -mt-12 w-full flex-1 rounded-t-[40px] bg-white px-5 pt-10 pb-8 lg:mt-0 lg:flex lg:min-h-dvh lg:items-center lg:justify-center lg:rounded-none lg:px-8">
        <div className="w-full max-w-120 lg:max-w-md">
          <div className="space-y-3 lg:rounded-[28px] lg:border lg:border-neutral-200 lg:bg-white lg:p-8 lg:shadow-sm">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary lg:text-4xl">
                Entrar
              </h1>

              <p className="text-md text-neutral-700">
                Acesse sua conta para encontrar pontos de apoio perto de você.
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="pt-2">
              <FieldGroup>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>

                      <Input
                        {...field}
                        id={field.name}
                        type="email"
                        autoComplete="email"
                        aria-invalid={fieldState.invalid}
                        placeholder="Digite seu e-mail..."
                        className="h-12 rounded-xl"
                      />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Senha</FieldLabel>

                      <Input
                        {...field}
                        id={field.name}
                        type="password"
                        autoComplete="current-password"
                        aria-invalid={fieldState.invalid}
                        placeholder="Digite sua senha..."
                        className="h-12 rounded-xl"
                      />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              {serverError && (
                <Alert
                  variant="destructive"
                  role="alert"
                  className="mt-4 rounded-xl border-red-200 bg-red-50 text-red-700"
                >
                  <CircleAlert aria-hidden="true" className="size-4" />

                  <AlertTitle>
                    {serverError.startsWith("Muitas tentativas")
                      ? "Acesso temporariamente limitado"
                      : "Não foi possível entrar"}
                  </AlertTitle>

                  <AlertDescription className="text-red-700">
                    {serverError}
                  </AlertDescription>
                </Alert>
              )}

              <Link
                href="/forgot-password"
                className="mt-4 block w-fit font-semibold text-primary underline"
              >
                Esqueci minha senha
              </Link>

              <div className="mt-6 flex w-full flex-col gap-4">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="h-12 rounded-full bg-paro-orange text-lg font-semibold"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2
                        className="size-5 animate-spin"
                        aria-hidden="true"
                      />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>

                <Link
                  href="/register"
                  className="flex h-12 w-full items-center justify-center rounded-full border-2 border-primary text-lg font-semibold text-primary"
                >
                  Criar conta
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
