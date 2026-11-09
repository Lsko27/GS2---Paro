import Image from "next/image";

import HomeExplorer from "./_components/home-explorer";
import Navbar from "../_components/navbar";
import Footer from "../_components/footer";

const HomePage = () => {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-white">
      <Navbar />

      <main className="flex-1 px-2 pt-3 pb-5">
        <div className="relative h-56.75 w-full">
          <Image
            src="/banner-paro.png"
            alt="Banner Parô"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <HomeExplorer />
      </main>
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white">
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
