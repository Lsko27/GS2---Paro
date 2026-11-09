"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, type Control } from "react-hook-form";
import { z } from "zod";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/app/_components/ui/field";
import { Input } from "@/app/_components/ui/input";

const workerSchema = z.object({
  Name: z.string().trim().min(1, "O nome é obrigatório"),
  Email: z
    .string()
    .trim()
    .min(1, "E-mail é obrigatório")
    .pipe(z.email("Informe um e-mail válido")),
  Cellphone: z
    .string()
    .trim()
    .regex(
      /^(?:\+55\s*)?(?:\(\d{2}\)|\d{2})\s*9\d{4}[-\s]?\d{4}$/,
      "Informe um celular com DDD.",
    ),
  Password: z.string().trim().min(1, "Senha é obrigatória"),
});

export type DadosTrabalhador = z.infer<typeof workerSchema>;

export const opcoesTrabalhador = {
  resolver: zodResolver(workerSchema),
  defaultValues: {
    Name: "",
    Email: "",
    Cellphone: "",
    Password: "",
  },
};

const camposTrabalhador = [
  {
    name: "Name",
    label: "Nome completo",
    type: "text",
    placeholder: "Digite seu nome...",
  },
  {
    name: "Email",
    label: "E-mail",
    type: "email",
    placeholder: "Digite seu e-mail...",
  },
  {
    name: "Cellphone",
    label: "Celular",
    type: "tel",
    placeholder: "+55 (11) 91234-5678",
  },
  {
    name: "Password",
    label: "Senha",
    type: "password",
    placeholder: "Digite sua senha...",
  },
] as const;

const WorkerFields = ({ control }: { control: Control<DadosTrabalhador> }) => {
  const prefixoId = useId();

  return (
    <FieldGroup className="gap-3">
      {camposTrabalhador.map(({ name, label, type, placeholder }) => {
        const id = `${prefixoId}-${name}`;
        const idErro = `${id}-erro`;

        return (
          <Controller
            key={name}
            name={name}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={id}>{label}</FieldLabel>
                <Input
                  {...field}
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.error ? idErro : undefined}
                />
                {fieldState.error && (
                  <FieldError id={idErro} errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        );
      })}
    </FieldGroup>
  );
};

export default WorkerFields;
