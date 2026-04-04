"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { jobStatusOptions, type JobStatusValue } from "@/lib/constants";

export function JobProgressForm({
  jobId,
  progressPercent,
  status,
}: {
  jobId: string;
  progressPercent: number;
  status: JobStatusValue;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch(`/api/jobs/${jobId}`, {
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
    <form action={handleSubmit} className="space-y-3 rounded-[1.5rem] bg-[#f8fbff] p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Avance</span>
          <input
            name="progressPercent"
            type="number"
            min="0"
            max="100"
            defaultValue={progressPercent}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Estado</span>
          <select
            name="status"
            defaultValue={status}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          >
            {jobStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Minutos trabajados hoy</span>
          <input
            name="workedMinutesToday"
            type="number"
            min="0"
            defaultValue="0"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[#123b62] px-5 py-3 font-bold text-white disabled:opacity-60"
      >
        Guardar avance
      </button>
      {message ? <p className="text-sm font-semibold text-slate-700">{message}</p> : null}
    </form>
  );
}
