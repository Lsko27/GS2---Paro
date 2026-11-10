import { forwardBackendRequest } from "@/app/_lib/forward-backend-request";

export async function GET(request: Request) {
  return forwardBackendRequest(request, "/estabelecimentos/meus", "GET");
}
