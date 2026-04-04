import { cn } from "@/lib/utils";

const styles = {
  calm: "bg-emerald-100 text-emerald-800",
  warn: "bg-amber-100 text-amber-800",
  stress: "bg-rose-100 text-rose-800",
};

export function StatusBadge({
  tone,
  children,
}: {
  tone: keyof typeof styles;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-4 py-2 text-sm font-bold",
        styles[tone],
      )}
    >
      {children}
    </span>
  );
}
