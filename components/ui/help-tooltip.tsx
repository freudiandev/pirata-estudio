"use client";

import { HelpCircle } from "lucide-react";
import { useState } from "react";

export function HelpTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100"
        aria-label="Ayuda"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute left-9 top-1/2 z-30 w-64 -translate-y-1/2 rounded-2xl border border-sky-100 bg-white p-3 text-sm leading-6 text-slate-600 shadow-xl">
          {text}
        </div>
      ) : null}
    </div>
  );
}
