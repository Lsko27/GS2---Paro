"use client";

import {
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Info,
  Loader2,
  Menu,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import NotificationsDropdown from "./notifications-dropdown";
import { getAuthenticatedUser } from "../_services/auth-service";
import { AuthenticatedUser } from "../_types/auth";

const Navbar = () => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const authenticatedUser = await getAuthenticatedUser();

        if (active) {
          setUser(authenticatedUser);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);

        if (active) {
          setAuthError(true);
        }
      } finally {
        if (active) {
          setIsLoadingUser(false);
        }
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  const perguntasParo = [
    {
      pergunta: "Como encontro um ponto de apoio?",
      resposta:
        "Na tela Início, use a busca e os filtros do mapa. Em Explorar, você pode filtrar os cartões por água ou banheiro.",
    },
    {
      pergunta: "Como sei se um ponto está aberto?",
      resposta:
        "Em Explorar, confira a indicação de aberto ou fechado e o endereço no cartão do ponto.",
    },
    {
      pergunta: "Como uso minha localização?",
      resposta:
        "Toque no ícone de localização ao lado da busca. Ao permitir o acesso no navegador, o mapa centraliza na sua posição.",
    },
  ];

  const userTypeLabel =
    user?.tipoUsuario === "TRABALHADOR"
      ? "Trabalhador"
      : user?.tipoUsuario === "ESTABELECIMENTO"
        ? "Estabelecimento"
        : user?.tipoUsuario;

  return (
    <nav aria-label="Navegação superior" className="border-b-2 p-6">
      <div className="flex w-full items-center justify-between">
        <Link href="/home" aria-label="Início do Parô">
          <Image src="/logo.png" alt="Parô" width={29} height={36} />
        </Link>

        <div className="flex items-center gap-6 text-primary">
          <NotificationsDropdown />

          <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
            <SheetTrigger
              type="button"
              aria-label="Abrir menu"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <Menu className="size-6" aria-hidden="true" />
            </SheetTrigger>

            <SheetContent side="right" className="w-[85vw] max-w-sm gap-0 p-0">
              <SheetHeader className="border-b p-4 pr-12">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Conta e ajuda</SheetDescription>
              </SheetHeader>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {isLoadingUser ? (
                  <div className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Loader2
                        className="size-5 animate-spin"
                        aria-hidden="true"
                      />
                    </span>

                    <span className="text-sm text-muted-foreground">
                      Carregando perfil...
                    </span>
                  </div>
                ) : user ? (
                  <Link
                    href="/profile"
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <UserRound className="size-5" aria-hidden="true" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {user.nome}
                      </span>

                      <span className="block text-xs text-muted-foreground">
                        {userTypeLabel}
                      </span>

                      <span className="mt-1 block text-xs font-medium text-primary">
                        Meu perfil
                      </span>
                    </span>

                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                ) : (
                  <div className="rounded-xl border border-neutral-200 p-3">
                    <p className="text-sm text-muted-foreground">
                      {authError
                        ? "Não foi possível carregar sua conta."
                        : "Você ainda não está conectado."}
                    </p>

                    {!authError && (
                      <Link
                        href="/login"
                        onClick={() => setMenuAberto(false)}
                        className="mt-2 block w-fit text-sm font-semibold text-primary underline"
                      >
                        Fazer login
                      </Link>
                    )}
                  </div>
                )}

                <section className="space-y-2">
                  <h3 className="flex items-center gap-2 px-1 text-sm font-semibold">
                    <CircleHelp
                      className="size-5 text-primary"
                      aria-hidden="true"
                    />
                    Como usar o Parô
                  </h3>

                  <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200">
                    {perguntasParo.map(({ pergunta, resposta }) => (
                      <details key={pergunta} className="group">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                          <span>{pergunta}</span>
                          <ChevronDown
                            className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                            aria-hidden="true"
                          />
                        </summary>

                        <p className="px-3 pb-3 text-sm leading-relaxed text-muted-foreground">
                          {resposta}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>

                <section className="rounded-xl border border-primary/15 bg-primary/5 p-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Info className="size-5" aria-hidden="true" />
                    Sobre o Parô
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    O Parô ajuda quem trabalha na rua a encontrar pontos de
                    apoio com água, banheiro, descanso e tomada ao longo do
                    trajeto.
                  </p>
                </section>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
