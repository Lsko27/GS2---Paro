import Footer from "../_components/footer";
import Navbar from "../_components/navbar";
import ProfilePanel from "./_components/profile-panel";

export default function ProfilePage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-white">
      <Navbar />

      <main className="flex-1 px-3 pt-4 ">
        <div className="px-2">
          <h1 className="text-lg font-semibold text-neutral-950">Meu perfil</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os dados da sua conta no Parô.
          </p>
        </div>

        <ProfilePanel />
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white">
        <Footer />
      </div>
    </div>
  );
}
