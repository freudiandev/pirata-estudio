"use client";

import { HelpCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type TooltipPosition = {
  top: number;
  left: number;
};

export function HelpTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const canUsePortal = typeof window !== "undefined";

  useEffect(() => {
    if (!open || !buttonRef.current) {
      return;
    }

    function updatePosition() {
      if (!buttonRef.current) {
        return;
      }

      const rect = buttonRef.current.getBoundingClientRect();
      const tooltipWidth = 256;
      const gap = 12;
      const viewportPadding = 16;
      const preferredLeft = rect.right + gap;
      const maxLeft = window.innerWidth - tooltipWidth - viewportPadding;
      const left = Math.max(viewportPadding, Math.min(preferredLeft, maxLeft));
      const top = Math.max(viewportPadding, rect.top + rect.height / 2);

      setPosition({ top, left });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !canUsePortal) {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      return;
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimeoutRef.current = null;
    }, 10_000);

    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, [canUsePortal, open]);

  return (
    <div className="inline-flex items-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100"
        aria-label="Ayuda"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {canUsePortal && open
        ? createPortal(
            <div
              className="fixed z-[9999] w-64 -translate-y-1/2 rounded-2xl border border-sky-100 bg-white p-3 text-sm leading-6 text-slate-600 shadow-2xl"
              style={{ top: position.top, left: position.left }}
            >
              {text}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
