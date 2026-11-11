import { ArrowRight, Droplets, HeartHandshake, MapPin } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

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
import { unstable_rethrow } from "next/navigation";

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
      <Card className="rounded-[18px] border border-neutral-200 p-4 shadow-none">
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
    <>
      <ImpactStats summary={summary} />

      <ResourceDistribution summary={summary} />

      <p className="px-2 text-xs text-neutral-500">
        Indicadores referentes aos estabelecimentos e recursos cadastrados na
        plataforma.
      </p>
    </>
  );
}

function ImpactIndicatorsLoading() {
  return (
    <div
      role="status"
      aria-label="Carregando indicadores de impacto"
      className="space-y-4"
    >
      <div className="animate-pulse rounded-[18px] border border-neutral-200 p-5">
        <div className="h-5 w-40 rounded-lg bg-neutral-200" />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="h-24 rounded-xl bg-neutral-100" />
          <div className="h-24 rounded-xl bg-neutral-100" />
        </div>
      </div>

      <div className="animate-pulse rounded-[18px] border border-neutral-200 p-5">
        <div className="h-5 w-48 rounded-lg bg-neutral-200" />
        <div className="mt-5 h-36 rounded-xl bg-neutral-100" />
      </div>
    </div>
  );
}

export default function ImpactPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-white">
      <Navbar />

      <main className="flex-1 space-y-5 px-3 pt-4 pb-24">
        <section className="space-y-1 px-2">
          <h1 className="text-lg font-semibold text-neutral-950">
            Nosso impacto
          </h1>

          <p className="text-sm text-neutral-600">
            Apoio que transforma a rotina de quem está nas ruas.
          </p>
        </section>

        <section className="space-y-4 rounded-[18px] bg-teal-800 p-5 text-white">
          <Badge className="border-0 bg-white/15 text-white">
            O propósito do Parô
          </Badge>

          <h2 className="text-xl leading-snug font-bold">
            Uma cidade mais acolhedora para quem trabalha nas ruas.
          </h2>

          <p className="text-sm leading-relaxed text-teal-50">
            Conectamos entregadores e motoristas a estabelecimentos que oferecem
            água, banheiro, descanso e outros recursos essenciais durante a
            jornada de trabalho.
          </p>

          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white"
          >
            <MapPin className="size-4" />
            Encontrar pontos de apoio
            <ArrowRight className="size-4" />
          </Link>
        </section>

        <Suspense fallback={<ImpactIndicatorsLoading />}>
          <ImpactIndicators />
        </Suspense>

        <Card className="gap-3 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <HeartHandshake className="size-5 text-primary" />
              Por que o Parô importa?
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 p-0">
            <p className="text-sm leading-relaxed text-neutral-600">
              Para quem passa o dia trabalhando nas ruas, encontrar um banheiro,
              água potável ou um lugar para descansar nem sempre é simples.
            </p>

            <p className="text-sm leading-relaxed text-neutral-600">
              O Parô aproxima esses trabalhadores de comércios dispostos a
              oferecer apoio, dando visibilidade aos recursos disponíveis em
              cada região.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-4 rounded-[18px] border-0 bg-orange-50 p-4 shadow-none">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-2 text-base text-orange-950">
              <Droplets className="size-5 text-paro-orange" />
              Faça parte dessa mudança
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 p-0">
            <p className="text-sm leading-relaxed text-orange-900">
              Seu estabelecimento pode oferecer um espaço de apoio a quem mantém
              a cidade em movimento.
            </p>

            <Button
              render={<Link href="/register" />}
              className="h-11 w-full rounded-full bg-paro-orange font-semibold text-white hover:bg-paro-orange/90"
            >
              Faça parte do Parô
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white">
        <Footer />
      </div>
    </div>
  );
}
