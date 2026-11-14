import Image from "next/image";
import RegisterForm from "./_components/register-form";

export default function RegisterPage() {
  return (
    <main className="min-h-dvh bg-white lg:grid lg:grid-cols-2">
      {/* Mobile Hero */}
      <div className="relative flex h-[30svh] min-h-52 max-h-64 shrink-0 items-start justify-center overflow-hidden pt-8 lg:hidden">
        <Image
          src="/city.png"
          alt="Parô banner"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-[center_80%]"
        />

        <Image
          src="/logo.png"
          alt="Parô"
          width={186}
          height={237}
          className="relative h-auto w-18.5"
        />
      </div>

      {/* Desktop Left Side */}
      <section className="relative hidden overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <Image
          src="/city.png"
          alt="Parô banner"
          fill
          sizes="50vw"
          className="object-cover object-[center_70%]"
          priority
        />

        <div className="absolute inset-0 bg-primary/70" />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Parô" width={64} height={82} />

            <div>
              <h1 className="text-3xl font-bold text-white">Parô</h1>

              <p className="text-sm text-white/80">
                Pontos de apoio para quem move a cidade
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <span className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              Faça parte do Parô
            </span>

            <h2 className="text-4xl leading-tight font-bold text-white">
              Juntos, construímos uma cidade mais acolhedora.
            </h2>

            <p className="mt-4 text-base leading-relaxed text-white/85">
              Seja você um trabalhador em busca de apoio ou um estabelecimento
              disposto a ajudar, o Parô conecta pessoas e transforma jornadas.
            </p>
          </div>

          <p className="text-sm text-white/70">
            Parô © 2026 — Conectando trabalhadores e estabelecimentos.
          </p>
        </div>
      </section>

      {/* Register Form Area */}
      <section className="relative z-10 -mt-12 w-full flex-1 rounded-t-[40px] bg-white px-5 pt-6 pb-8 lg:mt-0 lg:flex lg:min-h-dvh lg:items-start lg:justify-center lg:rounded-none lg:px-8 lg:py-12">
        <div className="mx-auto w-full max-w-120 lg:max-w-lg">
          <div className="space-y-3 lg:rounded-[28px] lg:border lg:border-neutral-200 lg:bg-white lg:p-8 lg:shadow-sm">
            <div className="space-y-2 pb-4">
              <h1 className="text-3xl font-bold text-primary lg:text-4xl">
                Criar Conta
              </h1>

              <p className="text-base text-neutral-700">
                Cadastre-se para fazer parte do Parô.
              </p>
            </div>

            <RegisterForm />
          </div>
        </div>
      </section>
    </main>
  );
}
