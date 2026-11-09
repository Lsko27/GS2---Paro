import { MapPin } from "lucide-react";

import Footer from "../_components/footer";
import Navbar from "../_components/navbar";
import EstablishmentCard from "./_components/establishment-card";

export default function ExplorePage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-white">
      <Navbar />

      <main className="flex-1 px-3 pt-4 pb-5">
        <div className="px-2">
          <h1 className="text-lg leading-tight font-semibold text-neutral-950">
            Pontos de apoio perto de você
          </h1>

          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="flex min-w-0 items-center gap-1.5 text-xs text-neutral-800">
              <MapPin
                className="size-4 shrink-0 text-slate-700"
                aria-hidden="true"
              />
              <span className="truncate">Vila Madalena, São Paulo - SP</span>
            </p>

            <span className="shrink-0 text-[10px] text-neutral-600">
              Dados de exemplo
            </span>
          </div>
          <div className="flex flex-col mt-4 gap-4">
            <EstablishmentCard />
            <EstablishmentCard />
            <EstablishmentCard />
            <EstablishmentCard />
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white">
          <Footer />
        </div>
      </main>
    </div>
  );
}
