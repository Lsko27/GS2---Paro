export type UserRole = "TRABALHADOR" | "ESTABELECIMENTO";

export type AuthenticatedUser = {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  tipoUsuario: UserRole;
  criadoEm: string;
};

export type UpdateProfileData = {
  nome: string;
  email: string;
  telefone: string | null;
};
