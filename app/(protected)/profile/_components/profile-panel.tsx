"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Pencil, Phone, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import {
  getAuthenticatedUser,
  updateAuthenticatedUser,
} from "@/app/_services/auth-service";
import type { AuthenticatedUser } from "@/app/_types/auth";

const profileSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "O nome deve conter pelo menos 3 caracteres.")
    .max(150, "O nome deve conter no máximo 150 caracteres."),
  email: z
    .email("Informe um e-mail válido.")
    .trim()
    .max(150, "O e-mail deve conter no máximo 150 caracteres."),
  telefone: z.string().refine(
    (value) => {
      const digits = value.replace(/\D/g, "");

      return digits.length === 0 || /^\d{10,11}$/.test(digits);
    },
    { message: "Informe um telefone válido com DDD." },
  ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const profileFields = [
  {
    name: "nome",
    label: "Nome completo",
    type: "text",
    autoComplete: "name",
    Icon: UserRound,
  },
  {
    name: "email",
    label: "E-mail",
    type: "email",
    autoComplete: "email",
    Icon: Mail,
  },
  {
    name: "telefone",
    label: "Telefone",
    type: "tel",
    autoComplete: "tel",
    Icon: Phone,
  },
] as const;

const ProfilePanel = () => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
    },
  });

  const { reset } = form;

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

        reset({
          nome: authenticatedUser.nome,
          email: authenticatedUser.email,
          telefone: authenticatedUser.telefone ?? "",
        });
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
  }, [reset]);

  const handleSave = async (data: ProfileFormData) => {
    setError(null);
    setMessage("");

    try {
      const updatedUser = await updateAuthenticatedUser({
        nome: data.nome,
        email: data.email,
        telefone: data.telefone.replace(/\D/g, "") || null,
      });

      setUser(updatedUser);

      reset({
        nome: updatedUser.nome,
        email: updatedUser.email,
        telefone: updatedUser.telefone ?? "",
      });

      setIsEditing(false);
      setMessage("Perfil atualizado com sucesso.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o perfil.",
      );
    }
  };

  const handleCancel = () => {
    if (!user) return;

    reset({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone ?? "",
    });

    setIsEditing(false);
    setError(null);
    setMessage("");
  };

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

  if (!user) {
    return (
      <Card className="mt-4 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none lg:mt-8 lg:rounded-[24px] lg:p-6">
        <CardContent className="p-0">
          <p role="alert" className="text-sm text-red-600">
            {error ?? "Perfil indisponível."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const userTypeLabel =
    user.tipoUsuario === "TRABALHADOR" ? "Trabalhador" : "Estabelecimento";

  return (
    <div className="mt-4 grid items-start gap-3 lg:mt-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6">
      {/* Identificação do usuário */}
      <Card className="rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none ring-0 lg:rounded-[24px] lg:border-neutral-200 lg:p-6">
        <CardContent className="flex items-center gap-3 p-0 lg:flex-col lg:gap-4 lg:py-5">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-primary lg:size-24">
            <UserRound className="size-7 lg:size-11" aria-hidden="true" />
          </div>

          <div className="min-w-0 lg:w-full lg:text-center">
            <p className="truncate font-semibold text-neutral-950 lg:text-xl">
              {user.nome}
            </p>

            <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary lg:mt-3 lg:px-4 lg:py-1">
              {userTypeLabel}
            </span>

            <p className="mt-3 hidden wrap-break-words text-sm text-neutral-500 lg:block">
              {user.email}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dados pessoais */}
      <Card className="min-w-0 gap-3 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none ring-0 lg:gap-6 lg:rounded-[24px] lg:border-neutral-200 lg:p-6">
        <CardHeader className="flex items-center justify-between gap-2 p-0">
          <CardTitle className="text-base font-semibold text-neutral-950 lg:text-xl">
            Dados pessoais
          </CardTitle>

          {!isEditing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full text-primary hover:bg-primary/5 hover:text-primary lg:px-4"
              onClick={() => {
                setError(null);
                setMessage("");
                setIsEditing(true);
              }}
            >
              <Pencil className="size-4" aria-hidden="true" />
              Editar
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {isEditing ? (
            <form
              onSubmit={form.handleSubmit(handleSave)}
              className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4"
              noValidate
            >
              {profileFields.map(({ name, label, type, autoComplete }) => (
                <label
                  key={name}
                  className={`grid min-w-0 gap-1.5 ${
                    name === "nome" ? "lg:col-span-2" : ""
                  }`}
                >
                  <span className="text-xs font-medium lg:text-sm">
                    {label}
                  </span>

                  <Input
                    {...form.register(name)}
                    type={type}
                    autoComplete={autoComplete}
                    aria-invalid={Boolean(form.formState.errors[name])}
                    className="h-11 w-full rounded-xl"
                  />

                  {form.formState.errors[name]?.message && (
                    <span className="text-xs text-red-600">
                      {form.formState.errors[name]?.message}
                    </span>
                  )}
                </label>
              ))}

              <div className="mt-1 grid grid-cols-2 gap-2 lg:col-span-2 lg:mt-3 lg:flex lg:justify-end lg:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={form.formState.isSubmitting}
                  onClick={handleCancel}
                  className="h-10 rounded-full lg:min-w-28"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="h-10 rounded-full lg:min-w-28"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <dl className="divide-y divide-neutral-200 lg:grid lg:grid-cols-2 lg:gap-4 lg:divide-y-0">
              {profileFields.map(({ name, label, Icon }) => (
                <div
                  key={name}
                  className={`min-w-0 py-2.5 lg:rounded-xl lg:border lg:border-neutral-200 lg:p-4 ${
                    name === "nome" ? "lg:col-span-2" : ""
                  }`}
                >
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground lg:text-sm">
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </dt>

                  <dd className="mt-1 wrap-break-words pl-5.5 text-sm text-neutral-950 lg:mt-2 lg:text-base">
                    {user[name] || "Não informado"}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {error && (
            <p role="alert" className="mt-3 text-xs text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="mt-3 text-xs text-teal-700">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePanel;
