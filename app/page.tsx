import Link from "next/link";
import { EntryType } from "@prisma/client";
import { redirect } from "next/navigation";
import { BehaviorPanel } from "@/components/dashboards/behavior-panel";
import { CapacityPanel } from "@/components/dashboards/capacity-panel";
import { SummaryCard } from "@/components/dashboards/summary-card";
import { WorkloadTable } from "@/components/dashboards/workload-table";
import { DailyLogForm } from "@/components/forms/daily-log-form";
import { MoneyEntryForm } from "@/components/forms/money-entry-form";
import { PirateMascot } from "@/components/pirate/pirate-mascot";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getWorkProfileCopy } from "@/lib/copy";
import { formatCurrency, formatMinutes } from "@/lib/formatters";
import { getDashboardData } from "@/services/dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getDashboardData();

  if (!data.user.setupComplete) {
    redirect("/welcome");
  }

  const copy = getWorkProfileCopy(data.user.workProfile, data.user.customWorkLabel);
  const statusLabel =
    data.capacity.mood === "calm"
      ? "Hoy estás en control"
      : data.capacity.mood === "warn"
        ? "Ojo, estás al límite"
        : "Estás sobrecargado";

  return (
    <div className="space-y-6">
      <Card className="grid gap-6 overflow-hidden lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-sky-700">
            {copy.shortLabel}
          </p>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-900">
            {copy.todayPrompt}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Mira primero lo que ya prometiste, registra lo de hoy y después decide si algo nuevo cabe de verdad.
          </p>
          <div className="flex flex-wrap gap-3">
            <StatusBadge tone={data.capacity.mood}>{statusLabel}</StatusBadge>
            <p className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700">
              Pendiente: {formatMinutes(data.capacity.totalPendingMinutes)}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/jobs/new"
              className="rounded-[1.6rem] bg-[#123b62] px-5 py-4 text-center text-base font-black text-white transition hover:-translate-y-0.5"
            >
              Registrar trabajo
            </Link>
            <Link
              href="/#income"
              className="rounded-[1.6rem] bg-emerald-600 px-5 py-4 text-center text-base font-black text-white transition hover:-translate-y-0.5"
            >
              Registrar ingreso
            </Link>
            <Link
              href="/#expense"
              className="rounded-[1.6rem] bg-rose-500 px-5 py-4 text-center text-base font-black text-white transition hover:-translate-y-0.5"
            >
              Registrar gasto
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-[2rem] bg-[radial-gradient(circle_at_top,_#e5f5ef_0%,_#fdf9f1_55%,_#f5f0e4_100%)] p-4">
          <PirateMascot mood={data.capacity.mood} />
          <p className="max-w-sm text-center text-base leading-7 text-slate-600">
            Bienvenido a Pirate Studio. Tu negocio, tus reglas, tu control.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Ingresos"
          value={formatCurrency(data.monthSummary.income)}
          hint="Lo que ha entrado este mes."
        />
        <SummaryCard
          label="Gastos"
          value={formatCurrency(data.monthSummary.expenses)}
          hint="Lo que ya salió este mes."
        />
        <SummaryCard
          label="Balance"
          value={formatCurrency(data.monthSummary.balance)}
          hint="Lo que te queda después de contar lo que entra y lo que sale."
        />
        <SummaryCard
          label="Carga"
          value={`${Math.round(data.capacity.loadPercentToday)}%`}
          hint="Qué tan lleno está realmente tu día."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <CapacityPanel snapshot={data.capacity} />
          <WorkloadTable snapshot={data.capacity} />
          <BehaviorPanel messages={data.behaviorMessages} />
        </div>
        <div className="space-y-6">
          <Card id="log" className="space-y-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              ¿Ya registraste lo de hoy?
            </h2>
            <DailyLogForm
              defaultMinutes={data.todayLog?.totalWorkedMinutes}
              defaultNotes={data.todayLog?.notes}
            />
          </Card>
          <Card id="income" className="space-y-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Registrar ingreso
            </h2>
            <MoneyEntryForm type={EntryType.INCOME} />
          </Card>
          <Card id="expense" className="space-y-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Registrar gasto
            </h2>
            <MoneyEntryForm type={EntryType.EXPENSE} />
          </Card>
        </div>
      </div>
    </div>
  );
}
