"use client";

import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import type { JobStatusValue } from "@/lib/constants";
import { buildAsciiBar, formatMinutes, formatShortDate } from "@/lib/formatters";
import { evaluateNewJobAcceptance, type CapacityJobInput } from "@/services/capacity";

type SerializableJob = {
  id: string;
  clientName: string;
  description: string;
  deadline: string;
  totalTimeMinutes: number;
  actualWorkedMinutes: number;
  progressPercent: number;
  status: JobStatusValue;
  createdAt: string;
  updatedAt: string;
};

type OrderLine = {
  id: string;
  garment: string;
  quantity: number;
  pricePerUnit: string;
  costPerUnit: string;
  timePerUnitMinutes: string;
};

function createOrderLine(): OrderLine {
  return {
    id: Math.random().toString(36).slice(2, 10),
    garment: "",
    quantity: 1,
    pricePerUnit: "",
    costPerUnit: "",
    timePerUnitMinutes: "",
  };
}

function FieldLabel({ title, help }: { title: string; help: string }) {
  return (
    <span className="flex items-center gap-2 text-sm font-bold text-sky-800">
      {title}
      <HelpTooltip text={help} />
    </span>
  );
}

export function JobForm({
  jobs,
  workingHoursStart,
  workingHoursEnd,
  todayWorkedMinutes,
  needsPendingRefresh,
}: {
  jobs: SerializableJob[];
  workingHoursStart: string;
  workingHoursEnd: string;
  todayWorkedMinutes: number;
  needsPendingRefresh: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    clientName: "",
    type: "",
    description: "",
    quantity: 1,
    price: "",
    cost: "",
    timePerUnitMinutes: "",
    totalTimeMinutes: "",
    deadline: "",
  });
  const [orderLines, setOrderLines] = useState<OrderLine[]>([createOrderLine()]);
  const deferredForm = useDeferredValue(form);

  const mappedJobs = useMemo(
    () =>
      jobs.map(
        (job) =>
          ({
            ...job,
            deadline: new Date(job.deadline),
            createdAt: new Date(job.createdAt),
            updatedAt: new Date(job.updatedAt),
          }) satisfies CapacityJobInput,
      ),
    [jobs],
  );

  const detailedLines = orderLines.filter((line) => line.garment.trim().length > 0);
  const quantityFromLines = detailedLines.reduce(
    (sum, line) => sum + Math.max(Number(line.quantity) || 0, 0),
    0,
  );
  const totalPriceFromLines = detailedLines.reduce(
    (sum, line) => sum + Math.max(Number(line.quantity) || 0, 0) * Math.max(Number(line.pricePerUnit) || 0, 0),
    0,
  );
  const totalCostFromLines = detailedLines.reduce(
    (sum, line) => sum + Math.max(Number(line.quantity) || 0, 0) * Math.max(Number(line.costPerUnit) || 0, 0),
    0,
  );
  const totalTimeFromLines = detailedLines.reduce(
    (sum, line) =>
      sum + Math.max(Number(line.quantity) || 0, 0) * Math.max(Number(line.timePerUnitMinutes) || 0, 0),
    0,
  );
  const hasLineTimeDetails = detailedLines.some((line) => Math.max(Number(line.timePerUnitMinutes) || 0, 0) > 0);
  const resolvedQuantity =
    detailedLines.length > 0 ? quantityFromLines : Math.max(Number(deferredForm.quantity) || 0, 0);
  const resolvedPrice =
    detailedLines.length > 0 ? totalPriceFromLines.toFixed(2) : deferredForm.price;
  const resolvedCost =
    detailedLines.length > 0 ? totalCostFromLines.toFixed(2) : deferredForm.cost;
  const resolvedTotalTime =
    detailedLines.length > 0 && hasLineTimeDetails
      ? String(totalTimeFromLines)
      : deferredForm.totalTimeMinutes;
  const resolvedDescription =
    detailedLines.length > 0
      ? [
          deferredForm.description.trim(),
          "Prendas del pedido:",
          ...detailedLines.map(
            (line) =>
              `- ${line.garment.trim()}: ${line.quantity} | precio c/u ${line.pricePerUnit || "0"} | costo c/u ${line.costPerUnit || "0"} | tiempo c/u ${line.timePerUnitMinutes || "0"} min`,
          ),
        ]
          .filter(Boolean)
          .join("\n")
      : deferredForm.description;

  const totalTime =
    Number(resolvedTotalTime) > 0
      ? Number(resolvedTotalTime)
      : resolvedQuantity *
        Math.max(Number(deferredForm.timePerUnitMinutes), 0);

  const preview =
    deferredForm.deadline && totalTime > 0
      ? evaluateNewJobAcceptance({
          existingJobs: mappedJobs,
          proposedJob: {
            id: "preview",
            clientName: deferredForm.clientName || "Nuevo cliente",
            description: resolvedDescription || "Trabajo nuevo",
            deadline: new Date(deferredForm.deadline),
            totalTimeMinutes: totalTime,
            actualWorkedMinutes: 0,
            progressPercent: 0,
            status: "PENDING",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          workingHoursStart,
          workingHoursEnd,
          todayWorkedMinutes,
        })
      : null;

  async function handleSubmit() {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        quantity: resolvedQuantity,
        price: resolvedPrice,
        cost: resolvedCost,
        totalTimeMinutes: resolvedTotalTime,
        description: resolvedDescription,
      }),
    });
    const result = await response.json();
    setMessage(result.message);

    if (response.ok) {
      startTransition(() => {
        router.push("/jobs");
        router.refresh();
      });
    }
  }

  const savingBlocked = needsPendingRefresh || (preview ? !preview.canSave : true);
  const requiredFieldClass =
    "w-full rounded-2xl border border-rose-300 bg-white px-4 py-3 text-lg outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100";
  const timingFieldClass =
    "w-full rounded-2xl border border-rose-300 bg-white px-4 py-3 text-lg outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100";
  const addLineButtonClass =
    "inline-flex items-center justify-center rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-bold text-sky-800 transition hover:-translate-y-0.5 hover:bg-sky-50";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="space-y-5">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-rose-600">
            ¿CUÁNTO TIEMPO REAL TE VA A TOMAR?
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
            Registra los detalles, costos y tiempos de tus pedidos para analizar la rentabilidad de tu negocio.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Si te equivocas aquí, todo tu cálculo se daña. No pongas el tiempo ideal: pon el tiempo real.
          </p>
        </div>
        {needsPendingRefresh ? (
          <div className="rounded-[1.6rem] bg-[#fff1e8] p-4 text-base font-semibold text-amber-900">
            Primero conviene actualizar tus pendientes. No puedes calcular nuevos trabajos si no actualizas lo que ya debes.
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <FieldLabel
              title="Cliente"
              help="Aquí va el nombre de la persona o negocio que te hizo el pedido."
            />
            <input
              className={requiredFieldClass}
              value={form.clientName}
              onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))}
            />
          </label>
          <label className="space-y-2">
            <FieldLabel
              title="Fecha y hora de ingreso del pedido"
              help="Aquí anotas el día y la hora en que entró el pedido. Usa la fecha y la hora real para recordar exactamente cuándo lo aceptaste, por ejemplo 2026-04-04 a las 14:30."
            />
            <input
              type="datetime-local"
              step="60"
              className={requiredFieldClass}
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
            />
          </label>
        </div>
        <label className="space-y-2">
          <FieldLabel
            title="Descripción"
            help="Describe bien qué vas a entregar para que no se te escape ningún detalle importante."
          />
          <textarea
            rows={4}
            className={requiredFieldClass}
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
        </label>
        <div className="rounded-[1.7rem] border border-sky-100 bg-[#f5fbff] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-700">
                Prendas del pedido
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Si un mismo pedido trae cosas distintas, como gorras y camisetas, abre otra fila y anota cada una por separado.
              </p>
            </div>
            <button
              type="button"
              className={addLineButtonClass}
              onClick={() => setOrderLines((current) => [...current, createOrderLine()])}
            >
              + Otra fila
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {orderLines.map((line, index) => (
              <div
                key={line.id}
                className="grid gap-3 rounded-[1.4rem] border border-sky-100 bg-white/90 p-4 md:grid-cols-[1.2fr_0.7fr_0.9fr_0.9fr_0.9fr_1fr_auto]"
              >
                <label className="space-y-2">
                  <FieldLabel
                    title={`Prenda ${index + 1}`}
                    help="Escribe qué tipo de prenda o pieza va en esta fila. Por ejemplo: gorra, camiseta o mandil."
                  />
                  <input
                    className={requiredFieldClass}
                    value={line.garment}
                    onChange={(event) =>
                      setOrderLines((current) =>
                        current.map((item) =>
                          item.id === line.id ? { ...item, garment: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="space-y-2">
                  <FieldLabel
                    title="Cantidad"
                    help="Pon cuántas piezas hay de esta misma prenda en esta fila."
                  />
                  <input
                    type="number"
                    min="1"
                    className={requiredFieldClass}
                    value={line.quantity}
                    onChange={(event) =>
                      setOrderLines((current) =>
                        current.map((item) =>
                          item.id === line.id
                            ? { ...item, quantity: Math.max(Number(event.target.value) || 0, 0) }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="space-y-2">
                  <FieldLabel
                    title="Precio por c/unidad"
                    help="Pon cuánto te pagan por cada pieza de esta fila. La app suma todo para darte el precio total."
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={requiredFieldClass}
                    value={line.pricePerUnit}
                    onChange={(event) =>
                      setOrderLines((current) =>
                        current.map((item) =>
                          item.id === line.id ? { ...item, pricePerUnit: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="space-y-2">
                  <FieldLabel
                    title="Costo o inversión"
                    help="Pon cuánto te cuesta producir cada pieza de esta fila. Aquí entran materiales, mano de obra o apoyos directos."
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={requiredFieldClass}
                    value={line.costPerUnit}
                    onChange={(event) =>
                      setOrderLines((current) =>
                        current.map((item) =>
                          item.id === line.id ? { ...item, costPerUnit: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="space-y-2">
                  <FieldLabel
                    title="Demora por c/unidad"
                    help="Pon cuántos minutos te demora hacer una pieza de esta fila. La app multiplica eso por la cantidad para sacar la demora en tiempo."
                  />
                  <input
                    type="number"
                    min="0"
                    className={requiredFieldClass}
                    value={line.timePerUnitMinutes}
                    onChange={(event) =>
                      setOrderLines((current) =>
                        current.map((item) =>
                          item.id === line.id ? { ...item, timePerUnitMinutes: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={orderLines.length === 1}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-lg font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                    onClick={() =>
                      setOrderLines((current) =>
                        current.length === 1 ? current : current.filter((item) => item.id !== line.id),
                      )
                    }
                    aria-label="Quitar fila"
                  >
                    x
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold text-sky-900">
            Cantidad total del pedido: {resolvedQuantity || 0}. Precio total: ${resolvedPrice || "0.00"}. Costo total: ${resolvedCost || "0.00"}. Demora total: {resolvedTotalTime || "0"} min.
          </p>
        </div>
        <div className="rounded-[1.7rem] border border-amber-200 bg-[#fff9ef] p-5">
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-bold text-amber-900">
                Fecha y hora de entrega del proyecto
                <HelpTooltip text="Aquí anotas cuándo vas a entregar este trabajo. Usa la fecha y la hora real prometida al cliente." />
              </span>
              <input
                type="datetime-local"
                step="60"
                className={timingFieldClass}
                value={form.deadline}
                onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))}
              />
            </label>
          </div>
          <p className="mt-4 text-sm font-semibold text-amber-900">
            Si te equivocas aquí, todo tu cálculo se daña.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending || savingBlocked}
          className="w-full rounded-full bg-[#123b62] px-6 py-4 text-lg font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {pending ? "Guardando..." : savingBlocked ? "Primero revisa tu carga real" : "Guardar trabajo"}
        </button>
        {message ? <p className="text-sm font-semibold text-slate-700">{message}</p> : null}
      </Card>
      <Card className="space-y-4">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Respuesta en tiempo real</h2>
        {preview ? (
          <>
            <div
              className={`rounded-[1.6rem] p-4 text-lg font-black ${
                preview.status === "fit"
                  ? "bg-emerald-100 text-emerald-900"
                  : preview.status === "tight"
                    ? "bg-amber-100 text-amber-900"
                    : "bg-rose-100 text-rose-900"
              }`}
            >
              {preview.message}
            </div>
            <p className="text-base leading-7 text-slate-600">{preview.detail}</p>
            {preview.suggestedDate && preview.suggestedDateLabel ? (
              <p className="rounded-[1.3rem] bg-sky-50 px-4 py-3 font-semibold text-sky-900">
                {preview.suggestedDateLabel}. Eso cae el {formatShortDate(preview.suggestedDate)}.
              </p>
            ) : null}
            <div className="rounded-[1.4rem] bg-[#f8fbff] p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                Carga de hoy
              </p>
              <p className="mt-2 font-mono text-lg text-slate-800">
                {buildAsciiBar(preview.snapshot.loadPercentToday)}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Hoy quedan {formatMinutes(preview.snapshot.todayAvailableMinutes)} y ya tienes ocupadas{" "}
                {formatMinutes(preview.snapshot.todayAssignedMinutes)}.
              </p>
            </div>
          </>
        ) : (
          <p className="rounded-[1.6rem] bg-[#f8fbff] p-4 text-base leading-7 text-slate-600">
            Llena el tiempo y la fecha prometida para ver si de verdad cabe o no.
          </p>
        )}
      </Card>
    </div>
  );
}
