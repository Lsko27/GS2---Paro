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
    <div className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-white">
      <Navbar />

      <main className="flex-1 px-3 pt-4 pb-28">
        <div className="mb-4 px-2">
          <h1 className="text-lg font-semibold text-neutral-950">
            Cadastrar ponto de apoio
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Preencha as informações do seu estabelecimento para disponibilizá-lo
            no Parô.
          </p>
        </div>

        <Suspense
          fallback={
            <p role="status" className="px-2 text-sm text-muted-foreground">
              Verificando permissão...
            </p>
          }
        >
          <ProtectedEstablishmentForm />
        </Suspense>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white">
        <Footer />
      </div>
    </div>
  );
};

export default NewEstablishmentPage;
