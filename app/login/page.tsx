"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../_components/ui/field";
import { Input } from "../_components/ui/input";
import Link from "next/link";
import { Button } from "../_components/ui/button";

const formSchema = z.object({
  Email: z
    .string()
    .trim()
    .min(1, { message: "E-mail é obrigatório" })
    .regex(/^\S+@\S+\.\S+$/, "Invalid email"),
  Password: z.string().trim().min(1, { message: "Senha é obrigatória" }),
});

const LoginPage = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Email: "",
      Password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };
  return (
    <main>
      <div className="relative flex h-[44svh] min-h-75 max-h-95 shrink-0 items-start justify-center overflow-hidden pt-8">
        <Image
          src="/city.png"
          alt="Parô banner"
          fill
          sizes="(max-width: 480px) 100vw, 480px"
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

      <section className="relative z-10 -mt-12 w-full flex-1 rounded-t-[40px] bg-white pb-8 pt-10">
        <div className="mx-auto w-full max-w-120 px-5">
          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-primary">Entrar</h1>
            <p className="pb-6 text-lg">
              Acesse sua conta para encontrar pontos de apoio perto de você.
            </p>

            <div className="w-full">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Controller
                    name="Email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="email"
                          aria-invalid={fieldState.invalid}
                          placeholder="Digite seu e-mail.."
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="Password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Senha</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="password"
                          aria-invalid={fieldState.invalid}
                          placeholder="Digite sua senha..."
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
                <Link
                  href="/forgot-password"
                  className="mt-3 block w-fit underline font-semibold text-primary"
                >
                  Esqueci minha senha
                </Link>
                <div className="flex flex-col mt-6 gap-4 w-full">
                  <Button
                    type="submit"
                    className=" text-lg font-bold p-6 rounded-full bg-paro-orange"
                  >
                    Entrar
                  </Button>
                  <Button
                    type="submit"
                    variant="outline"
                    className="text-primary text-lg font-bold p-6 rounded-full border-2 border-primary"
                  >
                    Criar conta
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
