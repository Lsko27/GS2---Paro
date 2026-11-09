import Image from "next/image";
import RegisterForm from "./_components/register-form";

export default function CadastroPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="relative flex h-[30svh] min-h-52 max-h-64 shrink-0 items-start justify-center overflow-hidden pt-8">
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

      <section className="relative z-10 -mt-12 w-full flex-1 rounded-t-[40px] bg-white pt-6 pb-8">
        <div className="mx-auto w-full max-w-120 space-y-3 px-5">
          <h1 className="text-3xl font-bold text-primary">Criar Conta</h1>
          <p className="pb-6 text-base">Cadastre-se para usar o Parô.</p>

          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
