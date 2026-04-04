"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { workProfileOptions, type WorkProfileValue } from "@/lib/constants";

export function SettingsForm({
  name,
  workingHoursStart,
  workingHoursEnd,
  workProfile,
  customWorkLabel,
}: {
  name: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  workProfile: WorkProfileValue;
  customWorkLabel?: string | null;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(workProfile);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/settings", {
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
    <form action={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Nombre</span>
          <input
            name="name"
            defaultValue={name}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Tipo de trabajo</span>
          <select
            name="workProfile"
            value={profile}
            onChange={(event) => setProfile(event.target.value as WorkProfileValue)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
          >
            {workProfileOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {profile === "CUSTOM" ? (
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Nombre personalizado</span>
          <input
            name="customWorkLabel"
            defaultValue={customWorkLabel ?? ""}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
          />
        </label>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Inicio</span>
          <input
            type="time"
            name="workingHoursStart"
            defaultValue={workingHoursStart}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Fin</span>
          <input
            type="time"
            name="workingHoursEnd"
            defaultValue={workingHoursEnd}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[#123b62] px-5 py-3 font-bold text-white disabled:opacity-60"
      >
        Guardar ajustes
      </button>
      {message ? <p className="text-sm font-semibold text-slate-700">{message}</p> : null}
    </form>
  );
}
