import { Card } from "@/components/ui/card";

export function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="space-y-2">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
        {label}
      </p>
      <p className="text-3xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="text-sm leading-6 text-slate-600">{hint}</p>
    </Card>
  );
}
