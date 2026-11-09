"use client";

import { CarTaxiFront, Store } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/app/_components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";

import WorkerFields, {
  opcoesTrabalhador,
  type DadosTrabalhador,
} from "./worker-fields";
import EstablishmentFields, {
  DadosEstabelecimento,
  opcoesEstabelecimento,
} from "./establishment-fields";

const perfisCadastro = [
  { valor: "trabalhador", rotulo: "Trabalhador", Icone: CarTaxiFront },
  { valor: "estabelecimento", rotulo: "Estabelecimento", Icone: Store },
] as const;

type PerfilCadastro = (typeof perfisCadastro)[number]["valor"];

const classeAba =
  "h-auto min-h-13 w-full min-w-0 flex-col gap-1 rounded-2xl border-[1.5px] border-neutral-500 bg-white p-3 text-center text-base font-bold whitespace-normal text-neutral-950 shadow-none data-active:border-primary data-active:bg-white data-active:text-neutral-950 data-active:shadow-none";

const RegisterForm = () => {
  const [perfil, setPerfil] = useState<PerfilCadastro>("trabalhador");

  const formularioTrabalhador = useForm<DadosTrabalhador>(opcoesTrabalhador);
  const formularioEstabelecimento = useForm<DadosEstabelecimento>(
    opcoesEstabelecimento,
  );

  function selecionarPerfil(valor: unknown) {
    const selecionado = perfisCadastro.find((opcao) => opcao.valor === valor);

    if (selecionado) {
      setPerfil(selecionado.valor);
    }
  }

  function confirmarValidacao() {
    console.info("Cadastro validado", { perfil });
  }

  const envioPorPerfil = {
    trabalhador: formularioTrabalhador.handleSubmit(confirmarValidacao),
    estabelecimento: formularioEstabelecimento.handleSubmit(confirmarValidacao),
  };

  return (
    <Tabs value={perfil} onValueChange={selecionarPerfil} className="w-full">
      <form
        noValidate
        onSubmit={envioPorPerfil[perfil]}
        className="flex flex-col gap-4"
      >
        <TabsContent value="trabalhador">
          <WorkerFields control={formularioTrabalhador.control} />
        </TabsContent>

        <TabsContent value="estabelecimento">
          <EstablishmentFields control={formularioEstabelecimento.control} />
        </TabsContent>

        <TabsList
          aria-label="Tipo de cadastro"
          className="grid h-auto! w-full grid-cols-2 gap-3 bg-transparent p-0"
        >
          {perfisCadastro.map(({ valor, rotulo, Icone }) => (
            <TabsTrigger
              key={valor}
              value={valor}
              type="button"
              className={classeAba}
            >
              <Icone className="size-6 text-slate-700" aria-hidden="true" />
              {rotulo}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <Button
            type="submit"
            className="h-11 w-full rounded-full bg-paro-orange text-lg font-semibold text-white hover:bg-paro-orange/90"
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
