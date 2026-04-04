"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function DailyLogForm({
  defaultMinutes,
  defaultNotes,
}: {
  defaultMinutes?: number;
  defaultNotes?: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/daily-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    setMessage(result.message);

    if (response.ok) {
      startTransition(() => router.refresh());
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <label className="space-y-2">
        <span className="text-sm font-bold text-sky-800">¿Cuántos minutos trabajaste hoy?</span>
        <input
          name="totalWorkedMinutes"
          type="number"
          min="0"
          defaultValue={defaultMinutes ?? 0}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-bold text-sky-800">Nota rápida del día</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={defaultNotes ?? ""}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
          placeholder="Ej. avancé 8 gorras y revisé entregas"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-60"
      >
        Guardar mi día
      </button>
      {message ? <p className="text-sm font-semibold text-slate-700">{message}</p> : null}
    </form>
  );
}
