"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { workProfileOptions, type WorkProfileValue } from "@/lib/constants";

export function OnboardingForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState<WorkProfileValue>("EMBROIDERY");

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
      startTransition(() => {
        router.push("/");
        router.refresh();
      });
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5 rounded-[2rem] bg-white/90 p-6 shadow-xl">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">¿Cómo quieres que te llame?</span>
          <input
            name="name"
            defaultValue="Capitana Marina"
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
          <span className="text-sm font-bold text-sky-800">Ponle tu nombre al oficio</span>
          <input
            name="customWorkLabel"
            placeholder="Ej. Taller de serigrafía"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
          />
        </label>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Desde qué hora trabajas</span>
          <input
            type="time"
            name="workingHoursStart"
            defaultValue="08:00"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold text-sky-800">Hasta qué hora trabajas</span>
          <input
            type="time"
            name="workingHoursEnd"
            defaultValue="17:00"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg outline-none"
          />
        </label>
      </div>
      <p className="rounded-[1.5rem] bg-[#f7fbff] px-4 py-3 text-sm leading-6 text-slate-600">
        Esto solo adapta el lenguaje y los ejemplos. La lógica central sigue siendo la misma.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[#123b62] px-6 py-4 text-lg font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Preparando tu estudio..." : "Entrar a Pirate Studio"}
      </button>
      {message ? <p className="text-sm font-semibold text-slate-700">{message}</p> : null}
    </form>
  );
}
