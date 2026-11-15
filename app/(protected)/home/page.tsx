import Image from "next/image";

import HomeExplorer from "./_components/home-explorer";
import Navbar from "@/app/_components/navbar";
import Footer from "@/app/_components/footer";
import bannerDesktop from "@/public/banner-paro-desktop.png";

const HomePage = () => {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-white lg:bg-neutral-50">
      <Navbar />

      <main className="mx-auto w-full max-w-120 flex-1 px-2 pt-3 pb-28 lg:max-w-360 lg:px-8 lg:pt-6 lg:pb-10">
        {/* Banner Mobile */}
        <div className="relative h-56.75 w-full overflow-hidden lg:hidden">
          <Image
            src="/banner-paro.png"
            alt="Banner Parô"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Banner Desktop */}
        <div className="hidden w-full overflow-hidden rounded-[28px] lg:block">
          <Image
            src={bannerDesktop}
            alt="Banner Parô desktop"
            sizes="(min-width: 1024px) 1400px, 100vw"
            className="block h-auto w-full"
            priority
          />
        </div>

        {/* Busca, filtros e mapa */}
        <div className="lg:mt-4">
          <HomeExplorer />
        </div>
      </main>

      {/* Navegação inferior apenas no Mobile */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white lg:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
