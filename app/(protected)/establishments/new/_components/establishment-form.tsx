"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2, LocateFixed, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import Swal from "sweetalert2";

import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { getAddressByCep } from "@/app/_services/cep-service";
import { createEstablishment } from "@/app/_services/create-establishment-service";
import { getCoordinatesByAddress } from "@/app/_services/geocoding-service";
import {
  establishmentSchema,
  type EstablishmentFormData,
} from "@/app/(protected)/establishments/_schemas/establishment-schema";

const addressFields = [
  { name: "zipCode", label: "CEP", placeholder: "00000-000" },
  { name: "street", label: "Logradouro", placeholder: "Avenida Paulista" },
  { name: "number", label: "Número", placeholder: "1000" },
  { name: "neighborhood", label: "Bairro", placeholder: "Bela Vista" },
  { name: "city", label: "Cidade", placeholder: "São Paulo" },
  { name: "state", label: "UF", placeholder: "SP" },
] as const;

type AddressFieldName = (typeof addressFields)[number]["name"];

const EstablishmentForm = () => {
  const router = useRouter();
  const geocodingRequestId = useRef(0);

  const [serverError, setServerError] = useState<string | null>(null);
  const [cepError, setCepError] = useState<string | null>(null);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [geocodingResult, setGeocodingResult] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
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

  const zipCode = useWatch({ control, name: "zipCode" });
  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });

  const invalidateCoordinates = () => {
    geocodingRequestId.current += 1;
    setValue("latitude", "", { shouldValidate: true });
    setValue("longitude", "", { shouldValidate: true });
    setGeocodingResult(null);
    setGeocodingError(null);
    setIsGeocoding(false);
  };

  // Ao completar o CEP, consulta e preenche o endereço automaticamente.
  useEffect(() => {
    const cleanedCep = (zipCode ?? "").replace(/\D/g, "");
    if (cleanedCep.length !== 8) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const address = await getAddressByCep(cleanedCep, controller.signal);
        if (controller.signal.aborted) return;

        setValue("street", address.logradouro ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("neighborhood", address.bairro ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("city", address.localidade ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("state", address.uf ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setCepError(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        setCepError(
          error instanceof Error
            ? error.message
            : "Não foi possível consultar o CEP.",
        );
      } finally {
        if (!controller.signal.aborted) setIsSearchingCep(false);
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [zipCode, setValue]);

  const handleZipCodeChange = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    const formattedCep =
      digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;

    setCepError(null);
    setServerError(null);
    setIsSearchingCep(digits.length === 8);

    setValue("street", "");
    setValue("neighborhood", "");
    setValue("city", "");
    setValue("state", "");
    invalidateCoordinates();

    return formattedCep;
  };

  const handleGeocoding = async () => {
    if (isGeocoding || isSearchingCep) return;

    const address = {
      street: getValues("street").trim(),
      number: getValues("number").trim(),
      neighborhood: getValues("neighborhood").trim(),
      city: getValues("city").trim(),
      state: getValues("state").trim(),
    };

    if (!address.street || !address.number || !address.city || !address.state) {
      setGeocodingError("Preencha o endereço e o número primeiro.");
      return;
    }

    const requestId = ++geocodingRequestId.current;
    setIsGeocoding(true);
    setGeocodingError(null);
    setGeocodingResult(null);

    try {
      const result = await getCoordinatesByAddress(address);
      if (requestId !== geocodingRequestId.current) return;

      const currentAddress = {
        street: getValues("street").trim(),
        number: getValues("number").trim(),
        neighborhood: getValues("neighborhood").trim(),
        city: getValues("city").trim(),
        state: getValues("state").trim(),
      };
      if (JSON.stringify(currentAddress) !== JSON.stringify(address)) return;

      setValue("latitude", result.latitude.toFixed(7), {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue("longitude", result.longitude.toFixed(7), {
        shouldValidate: true,
        shouldDirty: true,
      });
      setGeocodingResult(result.displayName);
    } catch (error) {
      if (requestId !== geocodingRequestId.current) return;
      setGeocodingError(
        error instanceof Error
          ? error.message
          : "Não foi possível localizar o endereço.",
      );
    } finally {
      if (requestId === geocodingRequestId.current) setIsGeocoding(false);
    }
  };

  const onSubmit = async (data: EstablishmentFormData) => {
    if (isSearchingCep || isGeocoding || cepError) return;
    setServerError(null);

    try {
      const establishment = await createEstablishment(data);
      await Swal.fire({
        icon: "success",
        title: "Ponto de apoio cadastrado!",
        text: "Agora você pode configurar os recursos e horários de funcionamento.",
        confirmButtonText: "Ver estabelecimento",
        confirmButtonColor: "#0f766e",
      });
      router.replace(`/establishments/${establishment.id}/manage`);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o ponto de apoio.",
      );
    }
  };

  return (
    <Card className="gap-5 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none ring-0">
      <CardHeader className="p-0">
        <CardTitle className="text-lg font-semibold text-neutral-950">
          Dados do ponto de apoio
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-6"
        >
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Building2 className="size-5 text-primary" />
              Informações gerais
            </h2>

            <div className="grid gap-1.5">
              <label htmlFor="name" className="text-xs font-medium">
                Nome do estabelecimento *
              </label>
              <Input
                id="name"
                placeholder="Ex.: Café Central"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="description" className="text-xs font-medium">
                Descrição
              </label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Descreva seu ponto de apoio..."
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="imageUrl" className="text-xs font-medium">
                URL da imagem
              </label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                aria-invalid={Boolean(errors.imageUrl)}
                {...register("imageUrl")}
              />
              {errors.imageUrl && (
                <p className="text-xs text-red-600">
                  {errors.imageUrl.message}
                </p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="size-5 text-primary" />
              Endereço
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {addressFields.map(({ name, label, placeholder }) => (
                <div key={name} className="grid w-full min-w-0 gap-1.5">
                  <label htmlFor={name} className="text-xs font-medium">
                    {label} *
                  </label>

                  <Controller
                    name={name as AddressFieldName}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        id={name}
                        placeholder={placeholder}
                        className="w-full"
                        inputMode={name === "zipCode" ? "numeric" : undefined}
                        maxLength={name === "zipCode" ? 9 : undefined}
                        aria-invalid={
                          fieldState.invalid ||
                          (name === "zipCode" && Boolean(cepError))
                        }
                        onChange={(event) => {
                          if (name === "zipCode") {
                            field.onChange(
                              handleZipCodeChange(event.target.value),
                            );
                          } else {
                            field.onChange(event.target.value);
                            invalidateCoordinates();
                          }
                        }}
                        onBlur={() => {
                          field.onBlur();
                          if (name === "number") void handleGeocoding();
                        }}
                      />
                    )}
                  />

                  {name === "zipCode" && isSearchingCep && (
                    <p
                      role="status"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <Loader2
                        className="size-3 animate-spin"
                        aria-hidden="true"
                      />
                      Consultando CEP...
                    </p>
                  )}
                  {name === "zipCode" && cepError && (
                    <p role="alert" className="text-xs text-red-600">
                      {cepError}
                    </p>
                  )}
                  {errors[name] && (
                    <p className="text-xs text-red-600">
                      {errors[name]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Informe o CEP para preencher o endereço automaticamente. Confira
              os dados e complete o número do estabelecimento.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold">
              Coordenadas do estabelecimento
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Podemos localizar seu endereço automaticamente. Confira a posição
              sugerida antes de cadastrar o ponto de apoio.
            </p>

            <Button
              type="button"
              variant="outline"
              disabled={isGeocoding || isSearchingCep}
              onClick={() => void handleGeocoding()}
              className="h-10 w-full rounded-full"
            >
              {isGeocoding ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Buscando coordenadas...
                </>
              ) : (
                <>
                  <LocateFixed className="size-4" aria-hidden="true" />
                  Localizar endereço automaticamente
                </>
              )}
            </Button>

            {geocodingError && (
              <p role="alert" className="text-xs text-red-600">
                {geocodingError}
              </p>
            )}

            {geocodingResult && (
              <div className="rounded-xl bg-primary/5 p-3 text-xs">
                <p className="font-semibold text-primary">
                  Localização sugerida
                </p>
                <p className="mt-1 text-muted-foreground">{geocodingResult}</p>
                <p className="mt-2 text-muted-foreground">
                  As coordenadas podem ser aproximadas. Confira se correspondem
                  ao seu estabelecimento.
                </p>
                {latitude && longitude && (
                  <Link
                    href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-medium text-primary underline"
                  >
                    Conferir no mapa
                  </Link>
                )}
                <p className="mt-2 text-muted-foreground">
                  Dados © OpenStreetMap contributors
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="grid min-w-0 gap-1.5">
                <label htmlFor="latitude" className="text-xs font-medium">
                  Latitude *
                </label>
                <Input
                  id="latitude"
                  type="text"
                  inputMode="decimal"
                  placeholder="-23.5645000"
                  aria-invalid={Boolean(errors.latitude)}
                  {...register("latitude")}
                />
                {errors.latitude && (
                  <p className="text-xs text-red-600">
                    {errors.latitude.message}
                  </p>
                )}
              </div>
              <div className="grid min-w-0 gap-1.5">
                <label htmlFor="longitude" className="text-xs font-medium">
                  Longitude *
                </label>
                <Input
                  id="longitude"
                  type="text"
                  inputMode="decimal"
                  placeholder="-46.6520000"
                  aria-invalid={Boolean(errors.longitude)}
                  {...register("longitude")}
                />
                {errors.longitude && (
                  <p className="text-xs text-red-600">
                    {errors.longitude.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {serverError && (
            <p role="alert" className="text-sm text-red-600">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            disabled={
              isSubmitting || isSearchingCep || isGeocoding || Boolean(cepError)
            }
            className="h-11 w-full rounded-full bg-paro-orange text-base font-semibold text-white hover:bg-paro-orange/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Cadastrando...
              </>
            ) : (
              "Cadastrar ponto de apoio"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EstablishmentForm;
