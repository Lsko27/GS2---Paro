import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Informe seu nome completo.")
      .max(150, "O nome deve conter no máximo 150 caracteres."),

    email: z
      .email("Informe um e-mail válido.")
      .trim()
      .max(150, "O e-mail deve conter no máximo 150 caracteres."),

    phone: z
      .string()
      .refine(
        (value) => /^\d{10,11}$/.test(value.replace(/\D/g, "")),
        "Informe um telefone válido com DDD.",
      ),

    password: z
      .string()
      .min(8, "A senha deve conter pelo menos 8 caracteres.")
      .max(72, "A senha deve conter no máximo 72 caracteres."),

    confirmPassword: z.string().min(1, "Confirme sua senha."),

    role: z.enum(["TRABALHADOR", "ESTABELECIMENTO"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
