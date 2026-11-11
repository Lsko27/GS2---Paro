import { z } from "zod";

const coordinateSchema = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, "A coordenada é obrigatória.")
    .refine(
      (value) => /^-?\d+(\.\d{1,7})?$/.test(value),
      "Informe um número com até 7 casas decimais.",
    )
    .refine((value) => {
      const number = Number(value);
      return Number.isFinite(number) && number >= min && number <= max;
    }, "Coordenada fora do intervalo permitido.");

export const establishmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome é obrigatório.")
    .max(150, "Máximo de 150 caracteres."),

  description: z.string().trim().max(1000),

  zipCode: z
    .string()
    .refine(
      (value) => /^\d{8}$/.test(value.replace(/\D/g, "")),
      "Informe um CEP válido com 8 dígitos.",
    ),

  street: z.string().trim().min(1, "Informe o logradouro.").max(150),

  number: z.string().trim().min(1, "Informe o número.").max(20),

  neighborhood: z.string().trim().min(1, "Informe o bairro.").max(100),

  city: z.string().trim().min(1, "Informe a cidade.").max(100),

  state: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Informe uma UF válida."),

  latitude: coordinateSchema(-90, 90),
  longitude: coordinateSchema(-180, 180),

  imageUrl: z.string().trim().max(1000),
});

export type EstablishmentFormData = z.infer<typeof establishmentSchema>;
