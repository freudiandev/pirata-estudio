"use client";

import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
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

  const totalTime =
    Number(deferredForm.totalTimeMinutes) > 0
      ? Number(deferredForm.totalTimeMinutes)
      : Math.max(Number(deferredForm.quantity), 0) *
        Math.max(Number(deferredForm.timePerUnitMinutes), 0);

  const preview =
    deferredForm.deadline && totalTime > 0
      ? evaluateNewJobAcceptance({
          existingJobs: mappedJobs,
          proposedJob: {
            id: "preview",
            clientName: deferredForm.clientName || "Nuevo cliente",
            description: deferredForm.description || "Trabajo nuevo",
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
      body: JSON.stringify(form),
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="space-y-5">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-rose-600">
            ¿CUÁNTO TIEMPO REAL TE VA A TOMAR?
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
            Sé sincero. Esto define si podrás cumplir.
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
            <span className="text-sm font-bold text-sky-800">Cliente</span>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg outline-none"
              value={form.clientName}
              onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold text-sky-800">Tipo de trabajo</span>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg outline-none"
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
            />
          </label>
        </div>
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Descripción</span>
          <textarea
            rows={4}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg outline-none"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-bold text-sky-800">Cantidad</span>
            <input
              type="number"
              min="1"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg outline-none"
              value={form.quantity}
              onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold text-sky-800">Precio total</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg outline-none"
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold text-sky-800">Costo estimado</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg outline-none"
              value={form.cost}
              onChange={(event) => setForm((current) => ({ ...current, cost: event.target.value }))}
            />
          </label>
        </div>
        <div className="rounded-[1.7rem] border border-amber-200 bg-[#fff9ef] p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-bold text-amber-900">Tiempo por unidad</span>
              <input
                type="number"
                min="0"
                className="w-full rounded-2xl border border-amber-200 px-4 py-3 text-lg outline-none"
                value={form.timePerUnitMinutes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, timePerUnitMinutes: event.target.value }))
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-amber-900">O tiempo total</span>
              <input
                type="number"
                min="0"
                className="w-full rounded-2xl border border-amber-200 px-4 py-3 text-lg outline-none"
                value={form.totalTimeMinutes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, totalTimeMinutes: event.target.value }))
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-amber-900">Fecha prometida</span>
              <input
                type="date"
                className="w-full rounded-2xl border border-amber-200 px-4 py-3 text-lg outline-none"
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
