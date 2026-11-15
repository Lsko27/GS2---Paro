"use client";
import {
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  House,
  Info,
  Loader2,
  LogOut,
  MapPin,
  PlusCircle,
  ChevronDown,
  Menu,
  Store,
  UserRound,
  Heart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getAuthenticatedUser, logout } from "../_services/auth-service";
import type { AuthenticatedUser } from "../_types/auth";
import { setAuthToast } from "./auth-toast";
import NotificationsDropdown from "./notifications-dropdown";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
type OwnedEstablishment = {
  id: number;
  nome: string;
};
const navigationItems = [
  { href: "/home", label: "Início", Icon: House },
  { href: "/explore", label: "Explorar", Icon: MapPin },
  {
    href: "/impact",
    label: "Impacto",
    Icon: ChartNoAxesColumnIncreasing,
  },
] as const;

const NavbarContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [ownedEstablishments, setOwnedEstablishments] = useState<
    OwnedEstablishment[]
  >([]);
  const [isLoadingEstablishments, setIsLoadingEstablishments] = useState(false);
  const [establishmentsError, setEstablishmentsError] = useState(false);
  useEffect(() => {
    let active = true;
    async function loadUser() {
      try {
        const authenticatedUser = await getAuthenticatedUser();
        if (active) setUser(authenticatedUser);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        if (active) setAuthError(true);
      } finally {
        if (active) setIsLoadingUser(false);
      }
    }
    void loadUser();
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (user?.tipoUsuario !== "ESTABELECIMENTO") return;
    const controller = new AbortController();
    async function loadOwnedEstablishments() {
      setIsLoadingEstablishments(true);
      setEstablishmentsError(false);
      try {
        const response = await fetch("/api/establishments/mine", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Não foi possível carregar os estabelecimentos.");
        }
        const data = (await response.json()) as OwnedEstablishment[];
        if (!controller.signal.aborted) setOwnedEstablishments(data);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Erro ao carregar estabelecimentos:", error);
        setOwnedEstablishments([]);
        setEstablishmentsError(true);
      } finally {
        if (!controller.signal.aborted) setIsLoadingEstablishments(false);
      }
    }
    void loadOwnedEstablishments();
    return () => controller.abort();
  }, [user?.tipoUsuario]);
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
      setAuthToast("logout");
      setUser(null);
      setOwnedEstablishments([]);
      setMenuAberto(false);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Erro ao encerrar sessão:", error);
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Não foi possível sair da conta.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };
  const userTypeLabel =
    user?.tipoUsuario === "TRABALHADOR"
      ? "Trabalhador"
      : user?.tipoUsuario === "ESTABELECIMENTO"
        ? "Estabelecimento"
        : user?.tipoUsuario;
  const isFavoritesActive =
    pathname === "/favorites" || pathname.startsWith("/favorites/");

  return (
    <nav
      aria-label="Navegação superior"
      className="border-b-2 p-6 lg:h-18 lg:border-b lg:border-neutral-200 lg:bg-white lg:px-8 lg:py-2"
    >
      <div className="mx-auto flex h-full w-full max-w-360 items-center justify-between gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        {/* Marca completa apenas no Desktop */}
        <Link
          href="/home"
          aria-label="Parô — ir para o início"
          className="flex w-fit shrink-0 items-center gap-2.5"
        >
          <Image src="/logo.png" alt="" width={29} height={36} priority />
          <span className="hidden text-[27px] font-extrabold tracking-[-0.055em] text-primary lg:inline">
            Parô<span className="text-paro-orange">.</span>
          </span>
        </Link>

        {/* Navegação central Desktop */}
        <div className="hidden items-center gap-2 lg:flex">
          {navigationItems.map(({ href, label, Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-9 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors hover:bg-primary/5 hover:text-primary ${
                  isActive ? "bg-primary/10 text-primary" : "text-neutral-500"
                }`}
              >
                <Icon className="size-4.25" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Ações à direita */}
        <div className="flex shrink-0 items-center gap-6 text-primary lg:justify-self-end lg:gap-4">
          <Link
            href="/favorites"
            aria-current={isFavoritesActive ? "page" : undefined}
            className={`hidden h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors hover:bg-primary/5 lg:flex ${
              isFavoritesActive
                ? "bg-primary/10 text-primary"
                : "text-[#3D625A]"
            }`}
          >
            <Heart className="size-5" aria-hidden="true" />
            Favoritos
          </Link>

          <span
            aria-hidden="true"
            className="hidden h-7 w-px bg-neutral-200 lg:block"
          />

          <NotificationsDropdown />

          <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
            <SheetTrigger
              type="button"
              aria-label="Abrir menu da conta"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary lg:h-11 lg:w-auto lg:gap-3 lg:px-2"
            >
              <Menu className="size-6 lg:hidden" aria-hidden="true" />

              <span className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 lg:flex">
                <UserRound className="size-5" aria-hidden="true" />
              </span>

              <span className="hidden min-w-0 flex-col items-start text-left lg:flex">
                <span
                  className="max-w-36 truncate text-xs leading-5 font-bold text-[#34574F]"
                  title={user?.nome}
                >
                  {isLoadingUser
                    ? "Carregando..."
                    : (user?.nome ?? "Minha conta")}
                </span>
                <span className="max-w-32 truncate text-[11px] leading-4 text-neutral-500">
                  {isLoadingUser
                    ? "Carregando..."
                    : (userTypeLabel ?? "Visitante")}
                </span>
              </span>

              <ChevronDown
                className="hidden size-4 text-neutral-500 lg:block"
                aria-hidden="true"
              />
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
                  <h3 className="px-1 text-sm font-semibold">Navegação</h3>
                  <div className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200">
                    <Link
                      href="/home"
                      onClick={() => setMenuAberto(false)}
                      className="flex min-h-12 items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      <House
                        className="size-5 text-primary"
                        aria-hidden="true"
                      />
                      Início
                    </Link>
                    <Link
                      href="/explore"
                      onClick={() => setMenuAberto(false)}
                      className="flex min-h-12 items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      <MapPin
                        className="size-5 text-primary"
                        aria-hidden="true"
                      />
                      Explorar pontos de apoio
                    </Link>
                    <Link
                      href="/favorites"
                      onClick={() => setMenuAberto(false)}
                      className="flex min-h-12 items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      <Heart
                        className="size-5 text-primary"
                        aria-hidden="true"
                      />
                      Meus Favoritos
                    </Link>
                  </div>
                </section>
                {user?.tipoUsuario === "ESTABELECIMENTO" && (
                  <section className="space-y-2">
                    <h3 className="px-1 text-sm font-semibold">
                      Meu estabelecimento
                    </h3>
                    <Link
                      href="/establishments/new"
                      onClick={() => setMenuAberto(false)}
                      className="flex min-h-12 items-center gap-3 rounded-xl border border-primary/20 p-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                    >
                      <PlusCircle className="size-5" aria-hidden="true" />
                      Cadastrar ponto de apoio
                    </Link>
                    {isLoadingEstablishments ? (
                      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 p-3 text-sm text-muted-foreground">
                        <Loader2
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                        Carregando estabelecimentos...
                      </div>
                    ) : establishmentsError ? (
                      <p
                        role="alert"
                        className="rounded-xl border border-red-200 p-3 text-sm text-red-600"
                      >
                        Não foi possível carregar seus estabelecimentos.
                      </p>
                    ) : ownedEstablishments.length > 0 ? (
                      <div className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200">
                        {ownedEstablishments.map((establishment) => (
                          <Link
                            key={establishment.id}
                            href={`/establishments/${establishment.id}/manage`}
                            onClick={() => setMenuAberto(false)}
                            className="flex items-center gap-3 p-3 transition-colors hover:bg-muted"
                          >
                            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                              <Store className="size-5" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold">
                                {establishment.nome}
                              </span>
                              <span className="mt-1 block text-xs text-muted-foreground">
                                Gerenciar estabelecimento
                              </span>
                            </span>
                            <ChevronRight
                              className="size-4 shrink-0 text-muted-foreground"
                              aria-hidden="true"
                            />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-xl border border-neutral-200 p-3 text-sm text-muted-foreground">
                        Nenhum estabelecimento cadastrado.
                      </p>
                    )}
                  </section>
                )}
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
              {user && (
                <div className="border-t border-neutral-200 p-4">
                  {logoutError && (
                    <p role="alert" className="mb-3 text-xs text-red-600">
                      {logoutError}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="h-11 w-full justify-start gap-3 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {isLoggingOut ? (
                      <Loader2
                        className="size-5 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <LogOut className="size-5" aria-hidden="true" />
                    )}
                    {isLoggingOut ? "Saindo..." : "Sair da conta"}
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

const Navbar = () => {
  return (
    <Suspense
      fallback={
        <div
          aria-hidden="true"
          className="h-20 border-b-2 border-neutral-200 bg-white lg:h-18 lg:border-b"
        />
      }
    >
      <NavbarContent />
    </Suspense>
  );
};

export default Navbar;
