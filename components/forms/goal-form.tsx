"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { goalTypeOptions, type GoalTypeValue } from "@/lib/constants";

export function GoalForm() {
  const router = useRouter();
  const [goalType, setGoalType] = useState<GoalTypeValue>("INCOME");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const currentOption = goalTypeOptions.find((option) => option.value === goalType)!;

  async function handleSubmit(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/goals", {
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
        <span className="text-sm font-bold text-sky-800">¿Qué quieres lograr?</span>
        <input
          name="title"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
          placeholder="Ej. Cerrar la semana sin atrasos"
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Tipo de objetivo</span>
          <select
            name="type"
            value={goalType}
            onChange={(event) => setGoalType(event.target.value as GoalTypeValue)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
          >
            {goalTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Periodo</span>
          <input
            name="periodLabel"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
            placeholder="Ej. este mes"
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Meta</span>
          <input
            name="targetValue"
            type="number"
            min="1"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Ya vas</span>
          <input
            name="currentValue"
            type="number"
            min="0"
            defaultValue="0"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Unidad</span>
          <input
            name="unit"
            value={currentOption.unit}
            readOnly
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg outline-none"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[#123b62] px-5 py-3 font-bold text-white disabled:opacity-60"
      >
        Guardar objetivo
      </button>
      {message ? <p className="text-sm font-semibold text-slate-700">{message}</p> : null}
    </form>
  );
}
