"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function GoalProgressForm({
  goalId,
  currentValue,
  active,
}: {
  goalId: string;
  currentValue: number;
  active: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const payload = {
      currentValue: Number(formData.get("currentValue")),
      active: formData.get("active") === "true",
    };
    const response = await fetch(`/api/goals/${goalId}`, {
      method: "PATCH",
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
    <form action={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
      <label className="space-y-2">
        <span className="text-sm font-bold text-sky-800">Avance actual</span>
        <input
          type="number"
          name="currentValue"
          min="0"
          defaultValue={currentValue}
          className="w-36 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
        />
      </label>
      <label className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
        <input type="checkbox" name="active" defaultChecked={active} value="true" />
        Seguir activo
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-sky-700 px-5 py-3 font-bold text-white disabled:opacity-60"
      >
        Actualizar
      </button>
      {message ? <p className="text-sm font-semibold text-slate-700">{message}</p> : null}
    </form>
  );
}
