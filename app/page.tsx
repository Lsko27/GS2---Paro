"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/app/_components/ui/button";
import { cn } from "cn";

const SplashScreenPage = () => {
  return (
    <main className="flex min-h-dvh w-full flex-col bg-white">
      <div className="relative flex h-[44svh] min-h-75 max-h-95 shrink-0 items-start justify-center overflow-hidden pt-8">
        <Image
          src="/city.png"
          alt="Parô banner"
          fill
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover object-[center_82%]"
        />

        <Image
          src="/logo.png"
          alt="Parô"
          width={186}
          height={237}
          className="relative h-auto w-18.5"
        />
      </div>

      <section className="relative z-10 -mt-12 w-full flex-1 rounded-t-[40px] bg-white pb-8 pt-10">
        <div className="mx-auto w-full max-w-120 px-5">
          <h1 className="text-center text-4xl font-bold text-primary pb-21">
            Bem-vindo
          </h1>

          <div className="flex flex-col items-center justify-center gap-4">
            <Link
              href="/login"
              className={cn(
                buttonVariants(),
                "w-full rounded-full bg-paro-orange p-6 text-lg",
              )}
            >
              Entrar
            </Link>

            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full rounded-full border-2 border-primary text-primary p-6 text-lg",
              )}
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SplashScreenPage;
