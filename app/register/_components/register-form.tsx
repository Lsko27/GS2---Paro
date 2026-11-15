"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CarTaxiFront,
  Loader2,
  Store,
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import Swal from "sweetalert2";

import { Button } from "@/app/_components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/app/_components/ui/field";
import { Input } from "@/app/_components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { registerUser } from "@/app/_services/register-service";
import {
  registerSchema,
  type RegisterFormData,
} from "../_schemas/register-schema";

const accountTypes = [
  {
    value: "TRABALHADOR",
    label: "Trabalhador",
    Icon: CarTaxiFront,
  },
  {
    value: "ESTABELECIMENTO",
    label: "Estabelecimento",
    Icon: Store,
  },
] as const;

type AccountType = RegisterFormData["role"];

const tabClassName =
  "h-auto min-h-13 w-full min-w-0 flex-col gap-1 rounded-2xl border-[1.5px] border-neutral-500 bg-white p-3 text-center text-base font-bold whitespace-normal text-neutral-950 shadow-none data-active:border-primary data-active:bg-white data-active:text-neutral-950 data-active:shadow-none";

const RegisterForm = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "TRABALHADOR",
    },
  });

  const selectedRole = useWatch({
    control: form.control,
    name: "role",
  });

  const handleAccountTypeChange = (value: unknown) => {
    if (value !== "TRABALHADOR" && value !== "ESTABELECIMENTO") {
      return;
    }

    form.setValue("role", value as AccountType, {
      shouldValidate: true,
    });

    setServerError(null);
  };

  const handleRegister = async (data: RegisterFormData) => {
    setServerError(null);

    try {
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      });

      await Swal.fire({
        icon: "success",
        title: "Conta criada!",
        text:
          data.role === "ESTABELECIMENTO"
            ? "Sua conta foi criada. Faça login para cadastrar seu ponto de apoio."
            : "Seu cadastro foi realizado. Faça login para continuar.",
        confirmButtonText: "Fazer login",
        confirmButtonColor: "#0f766e",
      });

      router.replace("/login");
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar sua conta.",
      );
    }
  };

  return (
    <Tabs
      value={selectedRole}
      onValueChange={handleAccountTypeChange}
      className="w-full"
    >
      <form
        onSubmit={form.handleSubmit(handleRegister)}
        noValidate
        className="flex flex-col gap-4"
      >
        <TabsList
          aria-label="Tipo de cadastro"
          className="grid h-auto! w-full grid-cols-2 gap-3 bg-transparent p-0"
        >
          {accountTypes.map(({ value, label, Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              type="button"
              disabled={form.formState.isSubmitting}
              className={tabClassName}
            >
              <Icon className="size-6 text-slate-700" aria-hidden="true" />

              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nome completo</FieldLabel>

                <div className="relative">
                  <User
                    className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    autoComplete="name"
                    placeholder="Digite seu nome completo..."
                    aria-invalid={fieldState.invalid}
                    className="h-12 rounded-xl pl-12"
                  />
                </div>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>

                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
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

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Telefone</FieldLabel>

                <div className="relative">
                  <Phone
                    className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <Input
                    {...field}
                    id={field.name}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(11) 99999-9999"
                    aria-invalid={fieldState.invalid}
                    className="h-12 rounded-xl pl-12"
                  />
                </div>

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

                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <Input
                    {...field}
                    id={field.name}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                    placeholder="Digite sua senha..."
                    className="h-12 rounded-xl pr-12 pl-12"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
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

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Confirmar senha</FieldLabel>

                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <Input
                    {...field}
                    id={field.name}
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirme sua senha..."
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

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {selectedRole === "ESTABELECIMENTO" && (
          <p className="rounded-xl bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">
            Após criar sua conta e fazer login, você poderá cadastrar seu
            estabelecimento, horários de funcionamento e recursos disponíveis.
          </p>
        )}

        {serverError && (
          <p role="alert" className="text-sm text-red-600">
            {serverError}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="h-11 w-full rounded-full bg-paro-orange text-lg font-semibold text-white hover:bg-paro-orange/90"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>

          <Link
            href="/login"
            className="flex h-11 w-full items-center justify-center rounded-full border-2 border-primary text-lg font-semibold text-primary"
          >
            Já tenho conta
          </Link>
        </div>
      </form>
    </Tabs>
  );
};

export default RegisterForm;
