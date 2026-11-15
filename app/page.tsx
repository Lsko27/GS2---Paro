import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/app/_components/ui/button";
import { cn } from "cn";

const SplashScreenPage = () => {
  return (
    <main className="flex min-h-dvh w-full flex-col bg-white lg:grid lg:grid-cols-2">
      {/* Banner */}
      <div className="relative flex h-[44svh] min-h-75 max-h-95 shrink-0 items-start justify-center overflow-hidden pt-8 lg:h-dvh lg:max-h-none lg:min-h-dvh lg:items-center lg:pt-0">
        <Image
          src="/city.png"
          alt="Cidade - Parô"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[center_82%] lg:object-[center_70%]"
        />

        <Image
          src="/logo.png"
          alt="Parô"
          width={186}
          height={237}
          priority
          className="relative z-10 h-auto w-18.5 lg:-translate-y-20 lg:w-40 xl:w-48"
        />
      </div>

      {/* Conteúdo */}
      <section className="relative z-10 -mt-12 w-full flex-1 rounded-t-[40px] bg-white pt-10 pb-8 lg:mt-0 lg:flex lg:items-center lg:justify-center lg:rounded-none lg:px-12 lg:py-16">
        <div className="mx-auto w-full max-w-120 px-5 lg:max-w-110 lg:px-0">
          <h1 className="pb-21 text-center text-4xl font-bold text-primary lg:pb-4 lg:text-left lg:text-5xl xl:text-6xl">
            Bem-vindo
          </h1>

          <p className="hidden text-base leading-relaxed text-neutral-600 lg:block lg:text-lg">
            Encontre pontos de apoio durante sua jornada. Água, descanso e
            outros recursos essenciais perto de você.
          </p>

          {/* Botões de acesso */}
          <div className="flex flex-col items-center justify-center gap-4 lg:mt-10">
            <Link
              href="/login"
              className={cn(
                buttonVariants(),
                "w-full rounded-full bg-paro-orange p-6 text-lg lg:h-14",
              )}
            >
              Entrar
            </Link>

            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full rounded-full border-2 border-primary p-6 text-lg text-primary lg:h-14",
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
