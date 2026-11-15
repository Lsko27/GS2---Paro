import { Suspense } from "react";
import { redirect } from "next/navigation";

import Footer from "@/app/_components/footer";
import Navbar from "@/app/_components/navbar";
import { requireAuthenticatedUser } from "@/app/_services/server-auth-service";

import EstablishmentForm from "./_components/establishment-form";

async function ProtectedEstablishmentForm() {
  const user = await requireAuthenticatedUser();

  if (user.tipoUsuario !== "ESTABELECIMENTO") {
    redirect("/home");
  }

  return <EstablishmentForm />;
}

const NewEstablishmentPage = () => {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-white lg:bg-neutral-50">
      <Navbar />

      <main className="mx-auto w-full max-w-120 flex-1 px-3 pt-4 pb-28 lg:max-w-7xl lg:px-8 lg:pt-10 lg:pb-12">
        <header className="mb-4 px-2 lg:mb-8 lg:px-0">
          <p className="hidden text-sm font-semibold uppercase tracking-wide text-primary/70 lg:block">
            Painel do estabelecimento
          </p>

          <h1 className="text-lg font-semibold text-neutral-950 lg:mt-2 lg:text-3xl lg:font-bold lg:text-primary">
            Cadastrar ponto de apoio
          </h1>

          <p className="mt-1 text-sm text-muted-foreground lg:mt-2 lg:text-base">
            Preencha as informações do seu estabelecimento para disponibilizá-lo
            no Parô.
          </p>
        </header>

        <Suspense
          fallback={
            <div
              role="status"
              className="animate-pulse rounded-[18px] border border-neutral-200 bg-white p-5 lg:rounded-[24px] lg:p-8"
            >
              <div className="h-6 w-52 rounded bg-neutral-200" />
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="h-72 rounded-xl bg-neutral-100" />
                <div className="h-72 rounded-xl bg-neutral-100" />
              </div>
            </div>
          }
        >
          <ProtectedEstablishmentForm />
        </Suspense>
      </main>

      {/* Navegação inferior somente no mobile */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white lg:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default NewEstablishmentPage;
