"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getJobStatusLabel, jobStatusOptions, type JobStatusValue } from "@/lib/constants";

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
  const [selectedStatus, setSelectedStatus] = useState<JobStatusValue>(status);
  const [selectedProgress, setSelectedProgress] = useState(String(progressPercent));
  const [workedMinutesToday, setWorkedMinutesToday] = useState("0");
  const [pending, startTransition] = useTransition();

  async function handleSubmit() {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        progressPercent:
          selectedStatus === "COMPLETED" ? 100 : Number(selectedProgress),
        status: selectedStatus,
        workedMinutesToday: Number(workedMinutesToday),
      }),
    });
    const result = await response.json();
    setMessage(result.message);

    if (response.ok) {
      startTransition(() => router.refresh());
    }
  }

  return (
    <div className="space-y-4 rounded-[1.5rem] bg-[#f8fbff] p-4">
      <div className="space-y-2">
        <p className="text-sm font-bold text-sky-800">Estado del pedido</p>
        <div className="flex flex-wrap gap-2">
          {jobStatusOptions.map((option) => {
            const active = option.value === selectedStatus;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSelectedStatus(option.value);

                  if (option.value === "COMPLETED") {
                    setSelectedProgress("100");
                  }
                }}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  active
                    ? "bg-[#123b62] text-white shadow-lg"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-slate-600">
          Estado actual: <span className="font-bold">{getJobStatusLabel(selectedStatus)}</span>
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Avance (%)</span>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              value={selectedProgress}
              onChange={(event) => setSelectedProgress(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 outline-none"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-bold text-slate-500">
              %
            </span>
          </div>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Minutos trabajados hoy</span>
          <input
            type="number"
            min="0"
            value={workedMinutesToday}
            onChange={(event) => setWorkedMinutesToday(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending}
        className="rounded-full bg-[#123b62] px-5 py-3 font-bold text-white disabled:opacity-60"
      >
        Guardar estado del pedido
      </button>
      {message ? <p className="text-sm font-semibold text-slate-700">{message}</p> : null}
    </div>
  );
}
