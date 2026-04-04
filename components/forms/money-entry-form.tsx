"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { EntryTypeValue } from "@/lib/constants";

export function MoneyEntryForm({ type }: { type: EntryTypeValue }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/entries", {
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
      <input type="hidden" name="type" value={type} />
      <label className="space-y-2">
        <span className="text-sm font-bold text-sky-800">
          {type === "INCOME" ? "¿Qué dinero entró?" : "¿Qué dinero salió?"}
        </span>
        <input
          name="title"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
          placeholder={type === "INCOME" ? "Ej. anticipo de cliente" : "Ej. compra de hilos"}
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Monto</span>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Categoría</span>
          <input
            name="category"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
            placeholder={type === "INCOME" ? "Abono, entrega..." : "Materiales, transporte..."}
          />
        </label>
      </div>
      <input type="hidden" name="date" value={new Date().toISOString()} />
      <button
        type="submit"
        disabled={pending}
        className={`rounded-full px-5 py-3 font-bold text-white disabled:opacity-60 ${
          type === "INCOME" ? "bg-emerald-600" : "bg-rose-500"
        }`}
      >
        {type === "INCOME" ? "Registrar ingreso" : "Registrar gasto"}
      </button>
      {message ? <p className="text-sm font-semibold text-slate-700">{message}</p> : null}
    </form>
  );
}
