"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/app/_components/ui/button";
import { Field, FieldError, FieldLabel } from "@/app/_components/ui/field";
import { Input } from "@/app/_components/ui/input";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "A senha deve conter pelo menos 8 caracteres.")
      .max(72, "A senha deve conter no máximo 72 caracteres."),

    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });

type FormData = z.infer<typeof formSchema>;

type ResetPasswordFormProps = {
  token: string;
};

const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);

    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          senha: data.password,
        }),
      });

      if (response.status === 400 || response.status === 410) {
        throw new Error("Este link é inválido, expirou ou já foi utilizado.");
      }

      if (!response.ok) {
        throw new Error(
          "Não foi possível redefinir sua senha. Tente novamente.",
        );
      }

      setSuccess(true);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      );
    }
  };

  if (!token) {
    return (
      <div role="alert" className="space-y-4">
        <p className="text-sm text-red-600">
          O link de recuperação é inválido ou está incompleto.
        </p>

        <Link
          href="/forgot-password"
          className="inline-block font-semibold text-primary underline"
        >
          Solicitar outro link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div role="status" className="space-y-5 text-center">
        <CheckCircle2
          className="mx-auto size-12 text-primary"
          aria-hidden="true"
        />

        <h2 className="text-xl font-semibold">Senha redefinida!</h2>

        <p className="text-sm text-neutral-600">
          Sua senha foi atualizada. Agora você pode entrar na sua conta.
        </p>

        <Button
          render={<Link href="/login" />}
          className="h-12 w-full rounded-full bg-paro-orange text-base font-semibold text-white"
        >
          Fazer login
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Nova senha</FieldLabel>

            <div className="relative">
              <Lock
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                {...field}
                id={field.name}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Digite sua nova senha..."
                aria-invalid={fieldState.invalid}
                className="h-12 rounded-xl pr-12 pl-12"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-2 size-9 -translate-y-1/2 rounded-lg text-muted-foreground hover:bg-transparent hover:text-primary"
              >
                {showPassword ? (
                  <EyeOff className="size-5" aria-hidden="true" />
                ) : (
                  <Eye className="size-5" aria-hidden="true" />
                )}
              </Button>
            </div>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="confirmPassword"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Confirmar nova senha</FieldLabel>

            <div className="relative">
              <Lock
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                {...field}
                id={field.name}
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirme sua nova senha..."
                aria-invalid={fieldState.invalid}
                className="h-12 rounded-xl pr-12 pl-12"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={
                  showConfirmPassword
                    ? "Ocultar confirmação de senha"
                    : "Mostrar confirmação de senha"
                }
                aria-pressed={showConfirmPassword}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute top-1/2 right-2 size-9 -translate-y-1/2 rounded-lg text-muted-foreground hover:bg-transparent hover:text-primary"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-5" aria-hidden="true" />
                ) : (
                  <Eye className="size-5" aria-hidden="true" />
                )}
              </Button>
            </div>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <p className="text-xs text-muted-foreground">
        A senha deve conter entre 8 e 72 caracteres.
      </p>

      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="h-12 w-full rounded-full bg-paro-orange text-base font-semibold text-white hover:bg-paro-orange/90"
      >
        {form.formState.isSubmitting ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Salvando...
          </>
        ) : (
          "Redefinir senha"
        )}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
