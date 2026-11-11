import { redirect } from "next/navigation";
import { Suspense } from "react";

import Footer from "@/app/_components/footer";
import Navbar from "@/app/_components/navbar";
import { requireAuthenticatedUser } from "@/app/_services/server-auth-service";

import ManagementPanel from "./_components/management-panel";

interface ManagePageProps {
  params: Promise<{
    id: string;
  }>;
}

async function ProtectedManagement({ params }: ManagePageProps) {
  const { id } = await params;
  const establishmentId = Number(id);

  if (!Number.isSafeInteger(establishmentId) || establishmentId <= 0) {
    redirect("/home");
  }

  const user = await requireAuthenticatedUser();

  if (user.tipoUsuario !== "ESTABELECIMENTO") {
    redirect("/home");
  }

  return <ManagementPanel establishmentId={establishmentId} />;
}

function ManagementLoading() {
  return (
    <div role="status" className="flex items-center justify-center py-10">
      <p className="text-sm text-muted-foreground">
        Carregando gerenciamento...
      </p>
    </div>
  );
}

export default function ManagePage({ params }: ManagePageProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-white">
      <Navbar />

      <main className="flex-1 px-3 pt-4 pb-28">
        <div className="mb-4 px-2">
          <h1 className="text-lg font-semibold text-neutral-950">
            Gerenciar ponto de apoio
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure os recursos e informações do seu estabelecimento.
          </p>
        </div>

        <Suspense fallback={<ManagementLoading />}>
          <ProtectedManagement params={params} />
        </Suspense>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white">
        <Footer />
      </div>
    </div>
  );
}
