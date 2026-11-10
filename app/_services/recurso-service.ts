import { api } from "@/app/_lib/api";
import type { Resource } from "@/app/_types/resource";

export async function getResources(): Promise<Resource[]> {
  return api<Resource[]>("/recursos");
}
