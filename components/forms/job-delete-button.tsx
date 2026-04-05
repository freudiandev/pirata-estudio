"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function JobDeleteButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  async function handleDelete() {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: "DELETE",
    });
    const result = await response.json();
    setMessage(result.message);

    if (response.ok) {
      startTransition(() => router.refresh());
    }
  }

  return (
    <div className="flex items-start justify-end">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-xl font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Borrar promesa"
        title="Borrar promesa"
      >
        x
      </button>
      {message ? <p className="sr-only">{message}</p> : null}
    </div>
  );
}
