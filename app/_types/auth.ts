export type UserRole = "TRABALHADOR" | "ESTABELECIMENTO";

export type AuthenticatedUser = {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: UserRole;
  criadoEm: string;
};
