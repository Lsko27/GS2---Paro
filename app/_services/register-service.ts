import type { RegisterFormData } from "@/app/register/_schemas/register-schema";

type RegisterUserData = Omit<RegisterFormData, "confirmPassword">;

type RegisterResponse = {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  tipoUsuario: "TRABALHADOR" | "ESTABELECIMENTO";
};

export async function registerUser(
  data: RegisterUserData,
): Promise<RegisterResponse> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nome: data.name,
      email: data.email,
      telefone: data.phone.replace(/\D/g, ""),
      senha: data.password,
      tipoUsuario: data.role,
    }),
  });

  if (response.status === 409) {
    throw new Error("Este e-mail já está cadastrado.");
  }

  if (response.status === 400) {
    throw new Error("Dados inválidos. Verifique as informações.");
  }

  if (!response.ok) {
    throw new Error("Não foi possível criar sua conta.");
  }

  return (await response.json()) as RegisterResponse;
}
