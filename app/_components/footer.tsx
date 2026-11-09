import {
  ChartNoAxesColumnIncreasing,
  House,
  MapPin,
  UserRound,
} from "lucide-react";
import Link from "next/link";

const atalhos = [
  { rotulo: "Início", href: "/home", Icone: House },
  { rotulo: "Explorar", href: "/explore", Icone: MapPin },
  { rotulo: "Impacto", href: "", Icone: ChartNoAxesColumnIncreasing },
  { rotulo: "Perfil", href: "/profile", Icone: UserRound },
] as const;

const classeAtalho =
  "flex min-h-11 min-w-0 flex-col items-center justify-center gap-2 rounded-md px-1 text-center text-xs text-neutral-950 focus-visible:outline-2 focus-visible:outline-primary";

export default function Footer() {
  return (
    <footer className="sticky bottom-0 z-20 w-full border-t border-neutral-300 bg-white">
      <nav
        aria-label="Navegação principal"
        className="grid grid-cols-4 px-2 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
      >
        {atalhos.map(({ rotulo, href, Icone }) => {
          const conteudo = (
            <>
              <Icone
                className="size-6 text-slate-700"
                strokeWidth={rotulo === "Impacto" ? 4 : 2}
                aria-hidden="true"
              />
              <span>{rotulo}</span>
            </>
          );

          return href ? (
            <Link key={rotulo} href={href} className={classeAtalho}>
              {conteudo}
            </Link>
          ) : (
            <button
              key={rotulo}
              type="button"
              disabled
              className={classeAtalho}
            >
              {conteudo}
            </button>
          );
        })}
      </nav>
    </footer>
  );
}
