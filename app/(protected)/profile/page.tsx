import { Suspense } from "react";

import ProfilePanel from "./_components/profile-panel";
import Navbar from "@/app/_components/navbar";
import Footer from "@/app/_components/footer";
import { requireAuthenticatedUser } from "@/app/_services/server-auth-service";

async function ProtectedProfile() {
  await requireAuthenticatedUser();

  return <ProfilePanel />;
}

function ProfileLoading() {
  return (
    <div
      role="status"
      aria-label="Verificando sessão"
      className="mt-5 grid animate-pulse gap-4 lg:mt-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6"
    >
      <div className="h-44 rounded-[18px] bg-neutral-100 lg:h-64 lg:rounded-[24px]" />

      <div className="h-72 rounded-[18px] bg-neutral-100 lg:rounded-[24px]" />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-white lg:max-w-none lg:bg-neutral-50">
      <Navbar />

      <main className="flex-1 px-3 pt-4 pb-28 lg:mx-auto lg:w-full lg:max-w-360 lg:px-8 lg:pt-10 lg:pb-12">
        <header className="px-2 lg:px-0">
          <h1 className="text-lg font-semibold text-neutral-950 lg:text-3xl lg:font-bold lg:text-primary">
            Meu perfil
          </h1>

          <p className="mt-1 text-sm text-muted-foreground lg:mt-2 lg:text-base">
            Gerencie os dados da sua conta no Parô.
          </p>
        </header>

        <Suspense fallback={<ProfileLoading />}>
          <ProtectedProfile />
        </Suspense>
      </main>

      {/* Navegação inferior somente no Mobile */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white lg:hidden">
        <Footer />
      </div>
    </div>
  );
}
