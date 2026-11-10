"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2, LocateFixed, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

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
import { Textarea } from "@/app/_components/ui/textarea";

import { getAddressByCep } from "@/app/_services/cep-service";
import { getCoordinatesByAddress } from "@/app/_services/geocoding-service";
import {
  establishmentSchema,
  type EstablishmentFormData,
} from "@/app/establishments/_schemas/establishment-schema";

interface EstablishmentEditDialogProps {
  establishmentId: number;
}

type EstablishmentResponse = {
  id: number;
  nome: string;
  descricao: string | null;
  condicoesAcesso: string | null;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  latitude: number | string;
  longitude: number | string;
  imagemUrl: string | null;
};

const addressFields = [
  { name: "street", label: "Logradouro" },
  { name: "number", label: "Número" },
  { name: "neighborhood", label: "Bairro" },
  { name: "city", label: "Cidade" },
  { name: "state", label: "UF" },
] as const;

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
}

function mapToForm(
  establishment: EstablishmentResponse,
): EstablishmentFormData {
  return {
    name: establishment.nome,
    description: establishment.descricao ?? "",
    zipCode: formatCep(establishment.cep),
    street: establishment.logradouro,
    number: establishment.numero,
    neighborhood: establishment.bairro,
    city: establishment.cidade,
    state: establishment.uf,
    latitude: String(establishment.latitude),
    longitude: String(establishment.longitude),
    imageUrl: establishment.imagemUrl ?? "",
  };
}

async function getErrorMessage(response: Response) {
  if (response.status === 401) {
    return "Sua sessão expirou. Faça login novamente.";
  }

  if (response.status === 403) {
    return "Você não tem permissão para editar este estabelecimento.";
  }

  const data = await response.json().catch(() => null);

  return (
    data?.message ??
    data?.detail ??
    `Não foi possível concluir a operação (HTTP ${response.status}).`
  );
}

const EstablishmentEditDialog = ({
  establishmentId,
}: EstablishmentEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const [establishment, setEstablishment] =
    useState<EstablishmentResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EstablishmentFormData>({
    resolver: zodResolver(establishmentSchema),
    defaultValues: {
      name: "",
      description: "",
      zipCode: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      latitude: "",
      longitude: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadEstablishment() {
      try {
        const response = await fetch(`/api/establishments/${establishmentId}`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const data = (await response.json()) as EstablishmentResponse;

        if (controller.signal.aborted) return;

        setEstablishment(data);
        reset(mapToForm(data));
        setError(null);
      } catch (error) {
        if (controller.signal.aborted) return;

        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o estabelecimento.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadEstablishment();

    return () => controller.abort();
  }, [establishmentId, reset]);

  const invalidateCoordinates = () => {
    setValue("latitude", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("longitude", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleCepSearch = async () => {
    const cep = getValues("zipCode").replace(/\D/g, "");

    if (cep.length !== 8) return;

    setIsSearchingCep(true);
    setError(null);

    try {
      const address = await getAddressByCep(cep);

      setValue("street", address.logradouro ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue("neighborhood", address.bairro ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue("city", address.localidade ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue("state", address.uf ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      invalidateCoordinates();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível consultar o CEP.",
      );
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleGeocoding = async () => {
    const address = {
      street: getValues("street").trim(),
      number: getValues("number").trim(),
      neighborhood: getValues("neighborhood").trim(),
      city: getValues("city").trim(),
      state: getValues("state").trim(),
    };

    if (!address.street || !address.number || !address.city || !address.state) {
      setError("Preencha o endereço e o número primeiro.");
      return;
    }

    setIsGeocoding(true);
    setError(null);

    try {
      const result = await getCoordinatesByAddress(address);

      const currentAddress = {
        street: getValues("street").trim(),
        number: getValues("number").trim(),
        neighborhood: getValues("neighborhood").trim(),
        city: getValues("city").trim(),
        state: getValues("state").trim(),
      };

      // Não utiliza coordenadas de um endereço que mudou
      // enquanto a API respondia.
      if (JSON.stringify(currentAddress) !== JSON.stringify(address)) {
        return;
      }

      setValue("latitude", result.latitude.toFixed(7), {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue("longitude", result.longitude.toFixed(7), {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível localizar o endereço.",
      );
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleOpen = () => {
    if (!establishment) return;

    reset(mapToForm(establishment));
    setError(null);
    setSuccessMessage(null);
    setOpen(true);
  };

  const onSubmit = async (data: EstablishmentFormData) => {
    setError(null);

    try {
      // Consulta o valor mais recente das condições de acesso
      // para não apagá-las durante a edição dos dados gerais.
      const currentResponse = await fetch(
        `/api/establishments/${establishmentId}`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!currentResponse.ok) {
        throw new Error(await getErrorMessage(currentResponse));
      }

      const current = (await currentResponse.json()) as EstablishmentResponse;

      const csrfResponse = await fetch("/api/auth/csrf", {
        credentials: "include",
        cache: "no-store",
      });

      if (!csrfResponse.ok) {
        throw new Error("Não foi possível obter o token CSRF.");
      }

      const csrf = (await csrfResponse.json()) as {
        headerName: string;
        token: string;
      };

      if (csrf.headerName !== "X-XSRF-TOKEN" || !csrf.token) {
        throw new Error("Token CSRF inválido.");
      }

      const payload = {
        nome: data.name.trim(),
        descricao: data.description.trim() || null,
        condicoesAcesso: current.condicoesAcesso,
        cep: data.zipCode.replace(/\D/g, ""),
        logradouro: data.street.trim(),
        numero: data.number.trim(),
        bairro: data.neighborhood.trim(),
        cidade: data.city.trim(),
        uf: data.state.trim().toUpperCase(),
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        imagemUrl: data.imageUrl.trim() || null,
      };

      const response = await fetch(`/api/establishments/${establishmentId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrf.token,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const updated = (await response.json()) as EstablishmentResponse;

      setEstablishment(updated);
      reset(mapToForm(updated));
      setSuccessMessage("Estabelecimento atualizado com sucesso.");
      setOpen(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o estabelecimento.",
      );
    }
  };

  return (
    <>
      <Card className="gap-4 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none ring-0">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="size-5 text-primary" />
            Dados do estabelecimento
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 p-0">
          {isLoading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Carregando dados...
            </p>
          ) : establishment ? (
            <>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{establishment.nome}</p>

                <p className="text-sm text-muted-foreground">
                  {establishment.logradouro}, {establishment.numero} -{" "}
                  {establishment.bairro}, {establishment.cidade}/
                  {establishment.uf}
                </p>
              </div>

              {successMessage && (
                <p role="status" className="text-xs text-teal-700">
                  {successMessage}
                </p>
              )}

              <Button
                type="button"
                onClick={handleOpen}
                className="h-11 w-full rounded-full bg-paro-orange text-white hover:bg-paro-orange/90"
              >
                <Pencil className="size-4" />
                Editar estabelecimento
              </Button>
            </>
          ) : (
            <p role="alert" className="text-sm text-red-600">
              {error ?? "Estabelecimento não encontrado."}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!isSubmitting && !isGeocoding && !isSearchingCep) {
            setOpen(nextOpen);
          }
        }}
      >
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[18px]">
          <DialogHeader>
            <DialogTitle>Editar estabelecimento</DialogTitle>
            <DialogDescription>
              Atualize as informações do seu ponto de apoio.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="grid gap-1.5">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Nome *
              </label>

              <Input
                id="edit-name"
                {...register("name")}
                aria-invalid={Boolean(errors.name)}
              />

              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Descrição
              </label>

              <Textarea
                id="edit-description"
                rows={4}
                {...register("description")}
              />

              {errors.description && (
                <p className="text-xs text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="edit-image" className="text-sm font-medium">
                URL da imagem
              </label>

              <Input
                id="edit-image"
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                {...register("imageUrl")}
              />

              {errors.imageUrl && (
                <p className="text-xs text-red-600">
                  {errors.imageUrl.message}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="edit-zipCode" className="text-sm font-medium">
                CEP *
              </label>

              <Controller
                name="zipCode"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="edit-zipCode"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="00000-000"
                    onChange={(event) => {
                      const value = formatCep(event.target.value);

                      field.onChange(value);
                      invalidateCoordinates();
                    }}
                    onBlur={() => {
                      field.onBlur();
                      void handleCepSearch();
                    }}
                  />
                )}
              />

              {isSearchingCep && (
                <p className="text-xs text-muted-foreground">
                  Consultando CEP...
                </p>
              )}

              {errors.zipCode && (
                <p className="text-xs text-red-600">{errors.zipCode.message}</p>
              )}
            </div>

            {addressFields.map(({ name, label }) => (
              <Controller
                key={name}
                name={name}
                control={control}
                render={({ field }) => (
                  <div className="grid gap-1.5">
                    <label
                      htmlFor={`edit-${name}`}
                      className="text-sm font-medium"
                    >
                      {label} *
                    </label>

                    <Input
                      {...field}
                      id={`edit-${name}`}
                      className="w-full"
                      onChange={(event) => {
                        field.onChange(event);
                        invalidateCoordinates();
                      }}
                      aria-invalid={Boolean(errors[name])}
                    />

                    {errors[name] && (
                      <p className="text-xs text-red-600">
                        {errors[name]?.message}
                      </p>
                    )}
                  </div>
                )}
              />
            ))}

            <div className="space-y-3 rounded-xl border border-neutral-200 p-3">
              <p className="text-sm font-semibold">Coordenadas</p>

              <Button
                type="button"
                variant="outline"
                disabled={isGeocoding || isSearchingCep || isSubmitting}
                onClick={() => void handleGeocoding()}
                className="w-full rounded-full"
              >
                {isGeocoding ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LocateFixed className="size-4" />
                )}
                Localizar endereço
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid min-w-0 gap-1.5">
                  <label
                    htmlFor="edit-latitude"
                    className="text-xs font-medium"
                  >
                    Latitude *
                  </label>

                  <Input
                    id="edit-latitude"
                    inputMode="decimal"
                    {...register("latitude")}
                  />

                  {errors.latitude && (
                    <p className="text-xs text-red-600">
                      {errors.latitude.message}
                    </p>
                  )}
                </div>

                <div className="grid min-w-0 gap-1.5">
                  <label
                    htmlFor="edit-longitude"
                    className="text-xs font-medium"
                  >
                    Longitude *
                  </label>

                  <Input
                    id="edit-longitude"
                    inputMode="decimal"
                    {...register("longitude")}
                  />

                  {errors.longitude && (
                    <p className="text-xs text-red-600">
                      {errors.longitude.message}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Se alterar o endereço, localize novamente as coordenadas antes
                de salvar.
              </p>
            </div>

            {error && (
              <p role="alert" className="text-xs text-red-600">
                {error}
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setOpen(false)}
                className="rounded-full"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || isGeocoding || isSearchingCep}
                className="rounded-full bg-paro-orange text-white hover:bg-paro-orange/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EstablishmentEditDialog;
