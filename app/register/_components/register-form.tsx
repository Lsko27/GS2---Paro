"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useId, useState } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/app/_components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/app/_components/ui/field";
import { Input } from "@/app/_components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";

const cadastroSchema = z.object({
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

type DadosCadastro = z.infer<typeof cadastroSchema>;

const opcoesFormulario = {
  resolver: zodResolver(cadastroSchema),
  defaultValues: {
    Name: "",
    Email: "",
    Cellphone: "",
    Password: "",
  },
};

import { CarTaxiFront, Store } from "lucide-react";

const perfisCadastro = [
  { valor: "trabalhador", rotulo: "Trabalhador", Icone: CarTaxiFront },
  { valor: "estabelecimento", rotulo: "Estabelecimento", Icone: Store },
] as const;

type PerfilCadastro = (typeof perfisCadastro)[number]["valor"];

const camposCadastro = [
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

function CamposCadastro({ control }: { control: Control<DadosCadastro> }) {
  const prefixoId = useId();

  return (
    <FieldGroup className="gap-3">
      {camposCadastro.map(({ name, label, type, placeholder }) => {
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
}

const RegisterForm = () => {
  const [perfil, setPerfil] = useState<PerfilCadastro>("trabalhador");

  const formularios = {
    trabalhador: useForm<DadosCadastro>(opcoesFormulario),
    estabelecimento: useForm<DadosCadastro>(opcoesFormulario),
  };

  const formularioAtivo = formularios[perfil];

  function selecionarPerfil(valor: unknown) {
    const opcao = perfisCadastro.find((perfil) => perfil.valor === valor);

    if (opcao) {
      setPerfil(opcao.valor);
    }
  }

  function confirmarValidacao() {
    console.info("Cadastro validado", { perfil });
  }

  return (
    <Tabs value={perfil} onValueChange={selecionarPerfil} className="w-full">
      <form
        noValidate
        onSubmit={formularioAtivo.handleSubmit(confirmarValidacao)}
        className="flex flex-col gap-4"
      >
        {perfisCadastro.map(({ valor }) => (
          <TabsContent key={valor} value={valor}>
            <CamposCadastro control={formularios[valor].control} />
          </TabsContent>
        ))}

        <TabsList
          aria-label="Tipo de cadastro"
          className="grid h-auto! w-full grid-cols-2 gap-3 bg-transparent p-0"
        >
          {perfisCadastro.map(({ valor, rotulo, Icone }) => (
            <TabsTrigger
              key={valor}
              type="button"
              value={valor}
              className="h-auto min-h-13 w-full min-w-0 flex-col gap-1 rounded-2xl border-[1.5px] border-neutral-500 bg-white p-3 text-center text-base font-bold whitespace-normal text-neutral-950 shadow-none data-active:border-primary data-active:bg-white data-active:text-neutral-950 data-active:shadow-none"
            >
              <Icone className="size-6 text-slate-700" aria-hidden="true" />
              {rotulo}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <Button
            type="submit"
            className=" h-11 w-full rounded-full bg-paro-orange text-lg font-semibold text-white hover:bg-paro-orange/90"
          >
            Criar
          </Button>
          <Link
            href="/login"
            className="mt-3 flex h-11 w-full items-center justify-center rounded-full border-2 border-primary text-lg font-semibold text-primary"
          >
            Já tenho conta
          </Link>
        </div>
      </form>
    </Tabs>
  );
};

export default RegisterForm;
