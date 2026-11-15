import { forwardBackendRequest } from "@/app/_lib/forward-backend-request";

export async function POST(request: Request) {
  return forwardBackendRequest(request, "/auth/password/forgot", "POST");
}
