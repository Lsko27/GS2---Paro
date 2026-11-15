import {
  Armchair,
  ArrowRight,
  Bath,
  Droplets,
  HeartHandshake,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";

import Footer from "@/app/_components/footer";
import Navbar from "@/app/_components/navbar";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

import getImpactSummary from "@/app/_services/impact-service";

import ImpactStats from "./_components/impact-stats";
import ResourceDistribution from "./_components/resource-distribution";

async function ImpactIndicators() {
  let summary = null;

  try {
    summary = await getImpactSummary();
  } catch (error) {
    unstable_rethrow(error);
    console.error("Erro ao carregar impacto:", error);
  }

  if (!summary) {
    return (
      <Card className="rounded-[18px] border border-neutral-200 p-4 shadow-none lg:rounded-[24px] lg:p-6">
        <CardContent className="space-y-2 p-0">
          <p role="alert" className="text-sm font-medium">
            Não foi possível carregar os indicadores.
          </p>

          <p className="text-xs text-neutral-600">
            Verifique a conexão com o servidor e tente novamente mais tarde.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <ImpactStats summary={summary} />

      <ResourceDistribution summary={summary} />

      <p className="px-2 text-xs leading-relaxed text-neutral-500 lg:px-1">
        Indicadores referentes aos estabelecimentos e recursos cadastrados na
        plataforma.
      </p>
    </div>
  );
}

function ImpactIndicatorsLoading() {
  return (
    <div
      role="status"
      aria-label="Carregando indicadores de impacto"
      className="space-y-5 lg:space-y-6"
    >
      <div className="space-y-3">
        <div className="h-6 w-48 animate-pulse rounded-lg bg-neutral-200" />

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-[18px] border border-neutral-200 bg-neutral-100 lg:rounded-[24px]"
            />
          ))}
        </div>
      </div>

      <div className="h-80 animate-pulse rounded-[18px] border border-neutral-200 bg-neutral-100 lg:rounded-[24px]" />
    </div>
  );
}

export default function ImpactPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-white lg:max-w-none lg:bg-neutral-50">
      <Navbar />

      <main className="flex-1 space-y-5 px-3 pt-4 pb-24 lg:mx-auto lg:w-full lg:max-w-360 lg:space-y-8 lg:px-8 lg:pt-10 lg:pb-12">
        {/* Cabeçalho */}
        <header className="space-y-1 px-2 lg:px-0">
          <h1 className="text-lg font-semibold text-neutral-950 lg:text-3xl lg:font-bold lg:text-primary">
            Nosso impacto
          </h1>

          <p className="text-sm text-neutral-600 lg:mt-2 lg:text-base">
            Apoio que transforma a rotina de quem está nas ruas.
          </p>
        </header>

        {/* Apresentação do propósito */}
        <section className="relative overflow-hidden rounded-[18px] bg-[#014641] p-5 text-white lg:grid lg:min-h-70 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)] lg:items-center lg:gap-10 lg:rounded-[28px] lg:p-10 xl:p-12">
          <div className="relative z-10 space-y-4">
            <Badge className="border-0 bg-white/15 text-white">
              O propósito do Parô
            </Badge>

            <h2 className="max-w-2xl text-xl leading-snug font-bold lg:text-3xl xl:text-4xl">
              Uma cidade mais acolhedora para quem trabalha nas ruas.
            </h2>

            <p className="max-w-2xl text-sm leading-relaxed text-teal-50 lg:text-base">
              Conectamos entregadores e motoristas a estabelecimentos que
              oferecem água, banheiro, descanso e outros recursos essenciais
              durante a jornada de trabalho.
            </p>

            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 lg:mt-2"
            >
              <MapPin className="size-4" aria-hidden="true" />
              Encontrar pontos de apoio
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Recursos destacados somente no Desktop */}
          <div className="relative z-10 hidden border-l border-white/15 pl-8 lg:block">
            <p className="mb-4 text-sm font-medium text-teal-100">
              Apoio para o dia a dia
            </p>

            <div className="grid gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <Droplets
                  className="size-6 shrink-0 text-orange-300"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">Água potável</span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <Bath
                  className="size-6 shrink-0 text-orange-300"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">Banheiro</span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <Armchair
                  className="size-6 shrink-0 text-orange-300"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">Área de descanso</span>
              </div>
            </div>
          </div>
        </section>

        {/* Indicadores e conteúdo institucional */}
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)] lg:gap-6">
          <div className="min-w-0">
            <Suspense fallback={<ImpactIndicatorsLoading />}>
              <ImpactIndicators />
            </Suspense>
          </div>

          <aside className="grid min-w-0 gap-5 lg:gap-6">
            {/* Por que o Parô importa */}
            <Card className="gap-3 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none lg:gap-5 lg:rounded-[24px] lg:border-neutral-200 lg:p-6">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <HeartHandshake
                    className="size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  Por que o Parô importa?
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 p-0 lg:space-y-4">
                <p className="text-sm leading-relaxed text-neutral-600">
                  Para quem passa o dia trabalhando nas ruas, encontrar um
                  banheiro, água potável ou um lugar para descansar nem sempre é
                  simples.
                </p>

                <p className="text-sm leading-relaxed text-neutral-600">
                  O Parô aproxima esses trabalhadores de comércios dispostos a
                  oferecer apoio, dando visibilidade aos recursos disponíveis em
                  cada região.
                </p>
              </CardContent>
            </Card>

            {/* Chamada para estabelecimentos */}
            <Card className="gap-4 rounded-[18px] border-0 bg-orange-50 p-4 shadow-none lg:rounded-[24px] lg:p-6">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-base text-orange-950 lg:text-lg">
                  <Droplets
                    className="size-5 shrink-0 text-paro-orange"
                    aria-hidden="true"
                  />
                  Faça parte dessa mudança
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 p-0">
                <p className="text-sm leading-relaxed text-orange-900">
                  Seu estabelecimento pode oferecer um espaço de apoio a quem
                  mantém a cidade em movimento.
                </p>

                <Button
                  render={<Link href="/register" />}
                  className="h-11 w-full rounded-full bg-paro-orange font-semibold text-white hover:bg-paro-orange/90"
                >
                  Faça parte do Parô
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {/* Navegação inferior somente no Mobile */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white lg:hidden">
        <Footer />
      </div>
    </div>
  );
}
