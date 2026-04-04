import { Card } from "@/components/ui/card";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { buildAsciiBar, formatMinutes } from "@/lib/formatters";
import type { CapacitySnapshot } from "@/services/capacity";

export function CapacityPanel({ snapshot }: { snapshot: CapacitySnapshot }) {
  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Capacidad real
            </h2>
            <HelpTooltip text="Capacidad es cuánto trabajo te cabe de verdad sin ahogarte. No es deseo: es tiempo útil disponible." />
          </div>
          <p className="text-sm leading-6 text-slate-600">
            Mira esto antes de prometer algo nuevo.
          </p>
        </div>
        <p className="rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-sky-800">
          {buildAsciiBar(snapshot.loadPercentToday)}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] bg-[#f5fbff] p-4">
          <p className="text-sm font-semibold text-sky-700">Horas ocupadas hoy</p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {formatMinutes(snapshot.todayAssignedMinutes)}
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-[#f5fbff] p-4">
          <p className="text-sm font-semibold text-sky-700">Horas disponibles hoy</p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {formatMinutes(snapshot.todayAvailableMinutes)}
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-[#f5fbff] p-4">
          <p className="text-sm font-semibold text-sky-700">Pendiente total</p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {formatMinutes(snapshot.totalPendingMinutes)}
          </p>
        </div>
      </div>
    </Card>
  );
}
