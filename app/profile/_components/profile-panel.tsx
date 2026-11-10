"use client";

import { Loader2, Mail, Pencil, Phone, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { getAuthenticatedUser } from "@/app/_services/auth-service";
import type { AuthenticatedUser } from "@/app/_types/auth";

const profileFields = [
  {
    name: "nome",
    label: "Nome completo",
    Icon: UserRound,
  },
  {
    name: "email",
    label: "E-mail",
    Icon: Mail,
  },
] as const;

const ProfilePanel = () => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const authenticatedUser = await getAuthenticatedUser();

        if (!active) return;

        if (!authenticatedUser) {
          setError("Você precisa estar conectado para acessar seu perfil.");
          return;
        }

        setUser(authenticatedUser);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);

        if (active) {
          setError("Não foi possível carregar os dados do perfil.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground"
      >
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        Carregando perfil...
      </div>
    );
  }

  if (error || !user) {
    return (
      <Card className="mt-4 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none">
        <CardContent className="p-0">
          <p role="alert" className="text-sm text-red-600">
            {error ?? "Não foi possível carregar o perfil."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const userTypeLabel =
    user.tipoUsuario === "TRABALHADOR"
      ? "Trabalhador"
      : user.tipoUsuario === "ESTABELECIMENTO"
        ? "Estabelecimento"
        : user.tipoUsuario;

  return (
    <div className="mt-4 grid gap-3">
      <Card className="rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none ring-0">
        <CardContent className="flex items-center gap-3 p-0">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <UserRound className="size-7" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-neutral-950">
              {user.nome}
            </p>

            <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {userTypeLabel}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-3 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none ring-0">
        <CardHeader className="flex items-center justify-between gap-2 p-0">
          <CardTitle className="text-base font-semibold text-neutral-950">
            Dados pessoais
          </CardTitle>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled
            title="Edição de perfil ainda não disponível"
            className="rounded-full text-primary"
          >
            <Pencil className="size-4" aria-hidden="true" />
            Editar
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <dl className="divide-y divide-neutral-200">
            {profileFields.map(({ name, label, Icon }) => (
              <div key={name} className="py-2.5">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </dt>

                <dd className="mt-1 wrap-break-words pl-5.5 text-sm text-neutral-950">
                  {user[name]}
                </dd>
              </div>
            ))}

            <div className="py-2.5">
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="size-4" aria-hidden="true" />
                Telefone
              </dt>

              <dd className="mt-1 pl-5.5 text-sm text-muted-foreground">
                Não informado
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePanel;
