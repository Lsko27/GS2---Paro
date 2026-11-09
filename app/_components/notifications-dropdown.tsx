"use client";

import { BellIcon, CheckCheck } from "lucide-react";
import { useState } from "react";

import { buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const notificacoesIniciais = [
  {
    id: "boas-vindas",
    titulo: "Boas-vindas ao Parô",
    mensagem: "Abra Explorar para conhecer os pontos de apoio.",
    tempo: "Agora",
    lida: false,
  },
  {
    id: "servicos",
    titulo: "Encontre o serviço que você precisa",
    mensagem:
      "Use os filtros de água e banheiro para escolher sua próxima parada.",
    tempo: "Hoje",
    lida: false,
  },
  {
    id: "localizacao",
    titulo: "Veja o mapa perto de você",
    mensagem:
      "Toque no ícone de localização para centralizar o mapa na sua posição.",
    tempo: "Ontem",
    lida: true,
  },
];

export default function NotificationsDropdown() {
  const [notificacoes, setNotificacoes] = useState(notificacoesIniciais);
  const [somenteNaoLidas, setSomenteNaoLidas] = useState(false);

  const naoLidas = notificacoes.filter(({ lida }) => !lida);
  const visiveis = somenteNaoLidas ? naoLidas : notificacoes;
  const total = naoLidas.length;
  const contador =
    total === 1 ? "1 notificação não lida" : `${total} notificações não lidas`;

  function marcarComoLida(id: string) {
    setNotificacoes((atuais) =>
      atuais.map((notificacao) =>
        notificacao.id === id ? { ...notificacao, lida: true } : notificacao,
      ),
    );
  }

  function marcarTodasComoLidas() {
    setNotificacoes((atuais) =>
      atuais.map((notificacao) => ({ ...notificacao, lida: true })),
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        aria-label={`Abrir notificações. ${contador}`}
        className={`relative ${buttonVariants({ variant: "ghost", size: "icon" })}`}
      >
        <BellIcon className="size-6" aria-hidden="true" />

        {total > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-none font-semibold text-primary-foreground"
          >
            {total}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-88 max-w-[calc(100vw-1.5rem)]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-2">
            <span className="block font-semibold">Notificações</span>
            <span className="block text-xs font-normal text-muted-foreground">
              {contador}
            </span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuCheckboxItem
            checked={somenteNaoLidas}
            onCheckedChange={(marcado) => setSomenteNaoLidas(marcado === true)}
          >
            Somente não lidas
          </DropdownMenuCheckboxItem>

          <DropdownMenuItem
            disabled={total === 0}
            onClick={marcarTodasComoLidas}
          >
            <CheckCheck className="size-4" aria-hidden="true" />
            Marcar todas como lidas
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuSeparator />

        {visiveis.length > 0 ? (
          <DropdownMenuGroup className="max-h-72 overflow-y-auto">
            {visiveis.map(({ id, titulo, mensagem, tempo, lida }) => (
              <DropdownMenuItem
                key={id}
                disabled={lida}
                onClick={() => marcarComoLida(id)}
                className={`items-start gap-2 whitespace-normal px-3 py-2.5 data-disabled:opacity-100 ${
                  lida ? "" : "bg-primary/5"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold">{titulo}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {tempo}
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {mensagem}
                  </p>

                  {!lida && (
                    <span className="mt-1 block text-xs font-medium text-primary">
                      Marcar como lida
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ) : (
          <DropdownMenuLabel className="px-3 py-3 text-sm font-normal text-muted-foreground">
            {somenteNaoLidas
              ? "Todas as notificações foram lidas."
              : "Nenhuma notificação por enquanto."}
          </DropdownMenuLabel>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
