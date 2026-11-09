"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useFieldArray, type Control } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/app/_components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/app/_components/ui/field";
import { Input } from "@/app/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

const diasSemana = [
  { value: "segunda", label: "Segunda-feira" },
  { value: "terca", label: "Terça-feira" },
  { value: "quarta", label: "Quarta-feira" },
  { value: "quinta", label: "Quinta-feira" },
  { value: "sexta", label: "Sexta-feira" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

const opcoesHora = Array.from({ length: 48 }, (_, indice) => {
  const hora = String(Math.floor(indice / 2)).padStart(2, "0");
  const minuto = indice % 2 === 0 ? "00" : "30";
  const valor = `${hora}:${minuto}`;

  return { value: valor, label: valor };
});

const horaSchema = z
  .string()
  .refine(
    (hora) => opcoesHora.some(({ value }) => value === hora),
    "Selecione um horário.",
  );

const diaSchema = z
  .string()
  .refine(
    (dia) => diasSemana.some(({ value }) => value === dia),
    "Selecione um dia da semana.",
  );

const horarioSchema = z
  .object({
    diaInicial: diaSchema,
    diaFinal: diaSchema,
    abertura: horaSchema,
    fechamento: horaSchema,
  })
  .refine(
    ({ abertura, fechamento }) =>
      !abertura || !fechamento || abertura !== fechamento,
    {
      path: ["fechamento"],
      message: "Escolha um horário diferente da abertura.",
    },
  );

function diasDoPeriodo(diaInicial: string, diaFinal: string) {
  const inicio = diasSemana.findIndex(({ value }) => value === diaInicial);
  const fim = diasSemana.findIndex(({ value }) => value === diaFinal);

  if (inicio === -1 || fim === -1) return [];
  if (inicio <= fim) return diasSemana.slice(inicio, fim + 1);

  return [...diasSemana.slice(inicio), ...diasSemana.slice(0, fim + 1)];
}

const establishmentSchema = z
  .object({
    nome: z.string().trim().min(1, "Informe o nome do estabelecimento."),
    endereco: z.string().trim().min(1, "Informe o endereço."),
    horarios: z
      .array(horarioSchema)
      .min(1, "Adicione pelo menos um período de funcionamento."),
  })
  .superRefine(({ horarios }, contexto) => {
    const diasCadastrados = new Set<string>();

    horarios.forEach(({ diaInicial, diaFinal }, indice) => {
      const dias = diasDoPeriodo(diaInicial, diaFinal);
      const conflito = dias.find(({ value }) => diasCadastrados.has(value));

      if (conflito) {
        contexto.addIssue({
          code: "custom",
          path: ["horarios", indice, "diaFinal"],
          message: `${conflito.label} já faz parte de outro período.`,
        });
      }

      dias.forEach(({ value }) => diasCadastrados.add(value));
    });
  });

export type DadosEstabelecimento = z.infer<typeof establishmentSchema>;

const horarioInicial = {
  diaInicial: "",
  diaFinal: "",
  abertura: "",
  fechamento: "",
};

export const opcoesEstabelecimento = {
  resolver: zodResolver(establishmentSchema),
  defaultValues: {
    nome: "",
    endereco: "",
    horarios: [horarioInicial],
  },
};

const camposTexto = [
  {
    name: "nome",
    label: "Nome do estabelecimento",
    placeholder: "Ex.: Padaria da Esquina",
  },
  {
    name: "endereco",
    label: "Endereço",
    placeholder: "Rua, número, bairro e cidade",
  },
] as const;

type CampoDoHorario = keyof DadosEstabelecimento["horarios"][number];

type CampoHorarioProps = {
  control: Control<DadosEstabelecimento>;
  name: `horarios.${number}.${CampoDoHorario}`;
  label: string;
  opcoes: { value: string; label: string }[];
};

const CampoHorario = ({ control, name, label, opcoes }: CampoHorarioProps) => {
  const id = useId();
  const idErro = `${id}-erro`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>

          <Select
            items={opcoes}
            name={field.name}
            value={field.value || null}
            onValueChange={(valor) => field.onChange(valor ?? "")}
          >
            <SelectTrigger
              id={id}
              ref={field.ref}
              onBlur={field.onBlur}
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.error ? idErro : undefined}
              className="w-full"
            >
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>

            <SelectContent>
              {opcoes.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {fieldState.error && (
            <FieldError id={idErro} errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  );
};

const EstablishmentFields = ({
  control,
}: {
  control: Control<DadosEstabelecimento>;
}) => {
  const prefixoId = useId();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "horarios",
  });

  return (
    <FieldGroup className="gap-3">
      {camposTexto.map(({ name, label, placeholder }) => {
        const id = `${prefixoId}-${name}`;
        const idErro = `${id}-erro`;

        return (
          <Controller
            key={name}
            control={control}
            name={name}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={id}>{label}</FieldLabel>

                <Input
                  {...field}
                  id={id}
                  placeholder={placeholder}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.error ? idErro : undefined}
                />

                {fieldState.error && (
                  <FieldError id={idErro} errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        );
      })}

      <fieldset className="grid gap-3">
        <legend className="mb-3 text-sm font-semibold text-primary">
          Horário de funcionamento
        </legend>

        {fields.map(({ id }, indice) => (
          <div key={id} className="grid gap-3 rounded-xl border p-3">
            <div className="grid grid-cols-2 gap-3">
              <CampoHorario
                control={control}
                name={`horarios.${indice}.diaInicial`}
                label="Dia inicial"
                opcoes={diasSemana}
              />

              <CampoHorario
                control={control}
                name={`horarios.${indice}.diaFinal`}
                label="Último dia"
                opcoes={diasSemana}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CampoHorario
                control={control}
                name={`horarios.${indice}.abertura`}
                label="Abre às"
                opcoes={opcoesHora}
              />

              <CampoHorario
                control={control}
                name={`horarios.${indice}.fechamento`}
                label="Fecha às"
                opcoes={opcoesHora}
              />
            </div>

            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                className="justify-self-end"
                onClick={() => remove(indice)}
              >
                Remover período
              </Button>
            )}
          </div>
        ))}

        <p className="text-xs text-muted-foreground">
          Se o fechamento for antes da abertura, ele vale para o dia seguinte.
        </p>

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full border-primary text-primary"
          disabled={fields.length >= diasSemana.length}
          onClick={() => append(horarioInicial)}
        >
          Adicionar período
        </Button>
      </fieldset>
    </FieldGroup>
  );
};

export default EstablishmentFields;
