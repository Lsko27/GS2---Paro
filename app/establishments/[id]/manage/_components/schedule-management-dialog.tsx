"use client";

import { CalendarClock, Clock3, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";

interface ScheduleManagementDialogProps {
  establishmentId: number;
}

type ScheduleResponse = {
  id: number;
  estabelecimentoId: number;
  diaSemana: number;
  horaAbertura: string | null;
  horaFechamento: string | null;
  fechado: boolean;
};

type ScheduleDay = {
  dayOfWeek: number;
  label: string;
  closed: boolean;
  openingTime: string;
  closingTime: string;
};

const WEEK_DAYS = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
] as const;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function createEmptySchedule(): ScheduleDay[] {
  return WEEK_DAYS.map((label, index) => ({
    dayOfWeek: index + 1,
    label,
    closed: true,
    openingTime: "08:00",
    closingTime: "18:00",
  }));
}

function mapSchedule(response: ScheduleResponse[]): ScheduleDay[] {
  const byDay = new Map(response.map((item) => [item.diaSemana, item]));

  return createEmptySchedule().map((day) => {
    const saved = byDay.get(day.dayOfWeek);

    if (!saved) return day;

    return {
      ...day,
      closed: saved.fechado,
      openingTime: saved.horaAbertura ?? "08:00",
      closingTime: saved.horaFechamento ?? "18:00",
    };
  });
}

async function getErrorMessage(response: Response) {
  if (response.status === 401) {
    return "Sua sessão expirou. Faça login novamente.";
  }

  if (response.status === 403) {
    return "Você não tem permissão para alterar estes horários.";
  }

  const body = await response.json().catch(() => null);

  return (
    body?.message ??
    `Não foi possível concluir a operação (${response.status}).`
  );
}

const ScheduleManagementDialog = ({
  establishmentId,
}: ScheduleManagementDialogProps) => {
  const [open, setOpen] = useState(false);

  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [draft, setDraft] = useState<ScheduleDay[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadSchedule = useCallback(
    async (signal?: AbortSignal) => {
      const response = await fetch(
        `/api/establishments/${establishmentId}/hours`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal,
        },
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = (await response.json()) as ScheduleResponse[];

      if (!Array.isArray(data)) {
        throw new Error("Resposta de horários inválida.");
      }

      return mapSchedule(data);
    },
    [establishmentId],
  );

  useEffect(() => {
    const controller = new AbortController();

    loadSchedule(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setSchedule(result);
          setError(null);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? error.message
              : "Erro ao carregar horários.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [loadSchedule]);

  const updateDay = (dayOfWeek: number, changes: Partial<ScheduleDay>) => {
    setDraft((current) =>
      current.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...changes } : day,
      ),
    );

    setDialogError(null);
  };

  const handleOpen = () => {
    setDraft(schedule.map((day) => ({ ...day })));
    setDialogError(null);
    setSuccessMessage(null);
    setOpen(true);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSaving) return;
    setOpen(nextOpen);
  };

  const handleSave = async () => {
    setDialogError(null);

    const invalidDay = draft.find(
      (day) =>
        !day.closed &&
        (!TIME_PATTERN.test(day.openingTime) ||
          !TIME_PATTERN.test(day.closingTime) ||
          day.openingTime >= day.closingTime),
    );

    if (invalidDay) {
      setDialogError(
        `Confira ${invalidDay.label}: o fechamento deve ser posterior à abertura.`,
      );
      return;
    }

    const payload = draft.map((day) => ({
      diaSemana: day.dayOfWeek,
      horaAbertura: day.closed ? null : day.openingTime,
      horaFechamento: day.closed ? null : day.closingTime,
      fechado: day.closed,
    }));

    setIsSaving(true);

    try {
      const csrfResponse = await fetch("/api/auth/csrf", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!csrfResponse.ok) {
        throw new Error("Não foi possível obter o token CSRF.");
      }

      const csrfData = (await csrfResponse.json()) as {
        headerName: string;
        token: string;
      };

      if (csrfData.headerName !== "X-XSRF-TOKEN" || !csrfData.token) {
        throw new Error("Token CSRF inválido.");
      }

      const response = await fetch(
        `/api/establishments/${establishmentId}/hours`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrfData.token,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const savedData = (await response.json()) as ScheduleResponse[];

      if (!Array.isArray(savedData)) {
        throw new Error(
          "O servidor não retornou uma lista válida de horários.",
        );
      }

      setSchedule(mapSchedule(savedData));
      setSuccessMessage("Horários atualizados com sucesso.");
      setOpen(false);
    } catch (error) {
      setDialogError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar os horários.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card className="gap-4 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none ring-0">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Clock3 className="size-5 text-primary" />
            Horários de funcionamento
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 p-0">
          {isLoading ? (
            <p
              role="status"
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" />
              Carregando horários...
            </p>
          ) : error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {schedule.map((day) => (
                  <div
                    key={day.dayOfWeek}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="font-medium">{day.label}</span>

                    <span className="text-right text-muted-foreground">
                      {day.closed
                        ? "Fechado"
                        : `${day.openingTime} - ${day.closingTime}`}
                    </span>
                  </div>
                ))}
              </div>

              {successMessage && (
                <p role="status" className="text-xs text-teal-700">
                  {successMessage}
                </p>
              )}

              <Button
                type="button"
                onClick={handleOpen}
                className="h-11 w-full rounded-full bg-paro-orange font-semibold text-white hover:bg-paro-orange/90"
              >
                <CalendarClock className="size-4" />
                Configurar horários
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[18px]">
          <DialogHeader>
            <DialogTitle>Configurar horários</DialogTitle>

            <DialogDescription>
              Defina os dias e horários de funcionamento do estabelecimento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {draft.map((day) => (
              <div
                key={day.dayOfWeek}
                className="space-y-3 border-b border-neutral-200 pb-4 last:border-b-0"
              >
                <label className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{day.label}</span>

                  <span className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={!day.closed}
                      disabled={isSaving}
                      onChange={(event) =>
                        updateDay(day.dayOfWeek, {
                          closed: !event.target.checked,
                        })
                      }
                      className="size-4 accent-teal-700"
                    />
                    Aberto
                  </span>
                </label>

                {!day.closed ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid min-w-0 gap-1.5">
                      <label
                        htmlFor={`opening-${day.dayOfWeek}`}
                        className="text-xs font-medium"
                      >
                        Abertura
                      </label>

                      <Input
                        id={`opening-${day.dayOfWeek}`}
                        type="time"
                        value={day.openingTime}
                        disabled={isSaving}
                        onChange={(event) =>
                          updateDay(day.dayOfWeek, {
                            openingTime: event.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    <div className="grid min-w-0 gap-1.5">
                      <label
                        htmlFor={`closing-${day.dayOfWeek}`}
                        className="text-xs font-medium"
                      >
                        Fechamento
                      </label>

                      <Input
                        id={`closing-${day.dayOfWeek}`}
                        type="time"
                        value={day.closingTime}
                        disabled={isSaving}
                        onChange={(event) =>
                          updateDay(day.dayOfWeek, {
                            closingTime: event.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Estabelecimento fechado neste dia.
                  </p>
                )}
              </div>
            ))}
          </div>

          {dialogError && (
            <p role="alert" className="text-xs text-red-600">
              {dialogError}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => setOpen(false)}
              className="rounded-full"
            >
              Cancelar
            </Button>

            <Button
              type="button"
              disabled={isSaving}
              onClick={() => void handleSave()}
              className="rounded-full bg-paro-orange text-white hover:bg-paro-orange/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar horários"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScheduleManagementDialog;
