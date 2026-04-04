import { Card } from "@/components/ui/card";
import { buildAsciiBar } from "@/lib/formatters";
import type { CapacitySnapshot } from "@/services/capacity";

export function WorkloadTable({ snapshot }: { snapshot: CapacitySnapshot }) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          Mini calendario de ocupación
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Verde si todavía respiras. Amarillo si vas justo. Rojo si ya no cabe.
        </p>
      </div>
      <div className="space-y-3">
        {snapshot.days.slice(0, 6).map((day) => (
          <div
            key={day.date.toISOString()}
            className="grid items-center gap-3 rounded-[1.2rem] bg-[#fffdf8] px-4 py-3 md:grid-cols-[1.2fr_1fr_90px]"
          >
            <p className="font-bold text-slate-900">{day.label}</p>
            <p className="font-mono text-sm text-slate-700">
              {buildAsciiBar(day.occupancyPercent)}
            </p>
            <span
              className={`rounded-full px-3 py-1 text-center text-sm font-bold ${
                day.occupancyPercent < 70
                  ? "bg-emerald-100 text-emerald-800"
                  : day.occupancyPercent < 95
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
              }`}
            >
              {Math.round(day.occupancyPercent)}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
