"use client";

import {
  ChartNoAxesColumnIncreasing,
  House,
  MapPin,
  PlusCircle,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getAuthenticatedUser } from "@/app/_services/auth-service";
import type { AuthenticatedUser } from "@/app/_types/auth";

const navigationItems = [
  { label: "Início", href: "/home", Icon: House },
  { label: "Explorar", href: "/explore", Icon: MapPin },
  {
    label: "Impacto",
    href: "/impact",
    Icon: ChartNoAxesColumnIncreasing,
  },
  { label: "Perfil", href: "/profile", Icon: UserRound },
];

const shortcutClassName =
  "flex min-h-11 min-w-0 flex-col items-center justify-center gap-2 rounded-md px-1 text-center text-xs text-neutral-950 focus-visible:outline-2 focus-visible:outline-primary";

const Footer = () => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const authenticatedUser = await getAuthenticatedUser();

        if (active) {
          setUser(authenticatedUser);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário no Footer:", error);
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  const isEstablishment = user?.tipoUsuario === "ESTABELECIMENTO";

  const items = isEstablishment
    ? [
        ...navigationItems.slice(0, 2),
        {
          label: "Cadastrar",
          href: "/establishments/new",
          Icon: PlusCircle,
        },
        ...navigationItems.slice(2),
      ]
    : navigationItems;

  return (
    <footer className="sticky bottom-0 z-20 w-full border-t border-neutral-300 bg-white">
      <nav
        aria-label="Navegação principal"
        className={`grid px-2 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] ${
          isEstablishment ? "grid-cols-5" : "grid-cols-4"
        }`}
      >
        {items.map(({ label, href, Icon }) => {
          const content = (
            <>
              <Icon
                className="size-6 text-slate-700"
                strokeWidth={label === "Impacto" ? 4 : 2}
                aria-hidden="true"
              />
              <span>{label}</span>
            </>
          );

          return href ? (
            <Link key={label} href={href} className={shortcutClassName}>
              {content}
            </Link>
          ) : (
            <button
              key={label}
              type="button"
              disabled
              className={shortcutClassName}
            >
              {content}
            </button>
          );
        })}
      </nav>
    </footer>
  );
};

export default Footer;
