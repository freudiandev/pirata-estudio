import { redirect } from "next/navigation";
import { GoalForm } from "@/components/forms/goal-form";
import { GoalProgressForm } from "@/components/forms/goal-progress-form";
import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/services/dashboard";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const data = await getDashboardData();

  if (!data.user.setupComplete) {
    redirect("/welcome");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="space-y-4">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-sky-700">
          Objetivos
        </p>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          Objetivos simples para sostener orden, dinero y tranquilidad
        </h1>
        <GoalForm />
      </Card>
      <div className="space-y-5">
        {data.goals.map((goal) => {
          const percent = Math.min((goal.currentValue / goal.targetValue) * 100, 100);

          return (
            <Card key={goal.id} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                    {goal.periodLabel}
                  </p>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    {goal.title}
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
                  {Math.round(percent)}%
                </span>
              </div>
              <div className="h-4 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,_#63c0a0,_#1f6a8a)]"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-base leading-7 text-slate-600">
                Llevas {goal.currentValue} de {goal.targetValue} {goal.unit}.
              </p>
              <GoalProgressForm
                goalId={goal.id}
                currentValue={goal.currentValue}
                active={goal.active}
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
