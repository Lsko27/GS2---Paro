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
    <div
      role="status"
      aria-label="Carregando gerenciamento"
      className="grid gap-4 lg:grid-cols-2"
    >
      <div className="h-28 animate-pulse rounded-3xl bg-neutral-200 lg:col-span-2" />
      <div className="h-52 animate-pulse rounded-3xl bg-neutral-200" />
      <div className="h-52 animate-pulse rounded-3xl bg-neutral-200" />
    </div>
  );
}

export default function ManagePage({ params }: ManagePageProps) {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-white lg:bg-neutral-50">
      <Navbar />

      <main className="mx-auto w-full max-w-120 flex-1 px-3 pt-4 pb-28 lg:max-w-7xl lg:px-8 lg:pt-10 lg:pb-12">
        <header className="mb-5 px-2 lg:mb-8 lg:px-0">
          <p className="hidden text-sm font-semibold uppercase tracking-wide text-primary/70 lg:block">
            Painel de gestão
          </p>

          <h1 className="text-lg font-semibold text-neutral-950 lg:mt-2 lg:text-3xl lg:font-bold lg:text-primary">
            Gerenciar ponto de apoio
          </h1>

          <p className="mt-1 text-sm text-muted-foreground lg:mt-2 lg:text-base">
            Configure os recursos e informações do seu estabelecimento.
          </p>
        </header>

        <Suspense fallback={<ManagementLoading />}>
          <ProtectedManagement params={params} />
        </Suspense>
      </main>

      {/* Mantém a navegação inferior exclusivamente no Mobile */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white lg:hidden">
        <Footer />
      </div>
    </div>
  );
}
