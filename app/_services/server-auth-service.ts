import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthenticatedUser } from "@/app/_types/auth";

export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get("paro_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    throw new Error("BACKEND_API_URL não configurada.");
  }

  const response = await fetch(`${backendUrl}/auth/me`, {
    method: "GET",
    headers: {
      Cookie: `paro_token=${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new Error("Não foi possível validar a sessão.");
  }

  return (await response.json()) as AuthenticatedUser;
}
