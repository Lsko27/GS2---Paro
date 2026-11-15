import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthRecoveryLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function AuthRecoveryLayout({
  title,
  description,
  children,
}: AuthRecoveryLayoutProps) {
  return (
    <main className="min-h-dvh bg-white lg:grid lg:grid-cols-2">
      {/* Banner mobile */}
      <div className="relative flex h-[36svh] min-h-56 max-h-80 items-start justify-center overflow-hidden pt-8 lg:hidden">
        <Image
          src="/city.png"
          alt="Cidade — Parô"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_82%]"
        />

        <Image
          src="/logo.png"
          alt="Parô"
          width={186}
          height={237}
          className="relative z-10 h-auto w-18.5"
        />
      </div>

      {/* Banner desktop */}
      <aside className="relative hidden min-h-dvh overflow-hidden lg:flex">
        <Image
          src="/city.png"
          alt="Cidade — Parô"
          fill
          priority
          sizes="50vw"
          className="object-cover object-[center_70%]"
        />

        <div className="absolute inset-0 bg-primary/70" />

        <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Parô" width={64} height={82} />

            <div>
              <h2 className="text-3xl font-bold text-white">Parô</h2>

              <p className="text-sm text-white/80">
                Pontos de apoio para quem move a cidade
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl leading-tight font-bold text-white">
              Seu caminho continua por aqui.
            </h2>

            <p className="mt-4 text-base leading-relaxed text-white/85">
              Recupere o acesso à sua conta e continue encontrando pontos de
              apoio perto de você.
            </p>
          </div>

          <p className="text-sm text-white/70">
            Parô © 2026 — Conectando trabalhadores e estabelecimentos.
          </p>
        </div>
      </aside>

      {/* Formulário */}
      <section className="relative z-10 -mt-12 rounded-t-[40px] bg-white px-5 pt-10 pb-10 lg:mt-0 lg:flex lg:min-h-dvh lg:items-center lg:justify-center lg:rounded-none lg:px-8">
        <div className="mx-auto w-full max-w-120 lg:max-w-md">
          <div className="space-y-6 lg:rounded-[28px] lg:border lg:border-neutral-200 lg:p-8 lg:shadow-sm">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="size-4" />
              Voltar ao login
            </Link>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary lg:text-4xl">
                {title}
              </h1>

              <p className="text-base text-neutral-600">{description}</p>
            </div>

            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
