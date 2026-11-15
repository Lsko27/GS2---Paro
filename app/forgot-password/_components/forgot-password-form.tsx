"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/app/_components/ui/button";
import { Field, FieldError, FieldLabel } from "@/app/_components/ui/field";
import { Input } from "@/app/_components/ui/input";

const formSchema = z.object({
  email: z.email("Informe um e-mail válido.").trim(),
});

type FormData = z.infer<typeof formSchema>;

const ForgotPasswordForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);

    try {
      const response = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });

      if (response.status === 429) {
        throw new Error(
          "Muitas solicitações. Aguarde alguns minutos antes de tentar novamente.",
        );
      }

      if (!response.ok) {
        throw new Error(
          "Não foi possível processar a solicitação. Tente novamente.",
        );
      }

      setSubmitted(true);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      );
    }
  };

  if (submitted) {
    return (
      <div role="status" className="space-y-4 text-center">
        <CheckCircle2
          className="mx-auto size-12 text-primary"
          aria-hidden="true"
        />

        <h2 className="text-xl font-semibold">Verifique seu e-mail</h2>

        <p className="text-sm leading-relaxed text-neutral-600">
          Se houver uma conta associada ao e-mail informado, você receberá um
          link para redefinir sua senha.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>

            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                {...field}
                id={field.name}
                type="email"
                autoComplete="email"
                placeholder="Digite seu e-mail..."
                aria-invalid={fieldState.invalid}
                className="h-12 rounded-xl pl-12"
              />
            </div>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

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
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            Enviando...
          </>
        ) : (
          "Enviar link de recuperação"
        )}
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
