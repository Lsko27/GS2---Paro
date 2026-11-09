"use client";

import { Mail, Pencil, Phone, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";

const perfilExemplo = {
  nome: "Alex Santos",
  email: "alex.santos@example.com",
  telefone: "(11) 90000-0000",
};

const camposPerfil = [
  {
    nome: "nome",
    rotulo: "Nome completo",
    tipo: "text",
    autoComplete: "name",
    Icone: UserRound,
  },
  {
    nome: "email",
    rotulo: "E-mail",
    tipo: "email",
    autoComplete: "email",
    Icone: Mail,
  },
  {
    nome: "telefone",
    rotulo: "Telefone",
    tipo: "tel",
    autoComplete: "tel",
    Icone: Phone,
  },
] as const;

const ProfilePanel = () => {
  const [perfil, setPerfil] = useState(perfilExemplo);
  const [editando, setEditando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  function salvarPerfil(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const dados = new FormData(evento.currentTarget);
    const novoPerfil = {
      nome: String(dados.get("nome") ?? "").trim(),
      email: String(dados.get("email") ?? "").trim(),
      telefone: String(dados.get("telefone") ?? "").trim(),
    };

    if (!novoPerfil.nome || !novoPerfil.email || !novoPerfil.telefone) {
      setMensagem("Preencha o nome, o e-mail e o telefone.");
      return;
    }

    setPerfil(novoPerfil);
    setEditando(false);
    setMensagem("Dados atualizados nesta tela.");
  }

  return (
    <div className="mt-4 grid gap-3">
      <Card className="rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none ring-0">
        <CardContent className="flex items-center gap-3 p-0">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <UserRound className="size-7" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-neutral-950">
              {perfil.nome}
            </p>
            <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              Trabalhador
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-3 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none ring-0">
        <CardHeader className="flex items-center justify-between gap-2 p-0">
          <CardTitle className="text-base font-semibold text-neutral-950">
            Dados pessoais
          </CardTitle>

          {!editando && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setMensagem("");
                setEditando(true);
              }}
              className="rounded-full text-primary"
            >
              <Pencil className="size-4" aria-hidden="true" />
              Editar
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {editando ? (
            <form onSubmit={salvarPerfil} className="grid gap-3">
              {camposPerfil.map(({ nome, rotulo, tipo, autoComplete }) => (
                <label key={nome} className="grid gap-1.5">
                  <span className="text-xs font-medium">{rotulo}</span>
                  <Input
                    name={nome}
                    type={tipo}
                    autoComplete={autoComplete}
                    defaultValue={perfil[nome]}
                    required
                    className="h-11 rounded-xl"
                  />
                </label>
              ))}

              <div className="mt-1 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-full"
                  onClick={() => {
                    setEditando(false);
                    setMensagem("");
                  }}
                >
                  Cancelar
                </Button>

                <Button type="submit" className="h-10 rounded-full">
                  Salvar
                </Button>
              </div>
            </form>
          ) : (
            <dl className="divide-y divide-neutral-200">
              {camposPerfil.map(({ nome, rotulo, Icone }) => (
                <div key={nome} className="py-2.5">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icone className="size-4" aria-hidden="true" />
                    {rotulo}
                  </dt>
                  <dd className="mt-1 wrap-break-words pl-5.5 text-sm text-neutral-950">
                    {perfil[nome]}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {mensagem && (
            <p role="status" className="mt-3 text-xs text-muted-foreground">
              {mensagem}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePanel;
