import { redirect } from "next/navigation";
import { JobForm } from "@/components/forms/job-form";
import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/services/dashboard";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const data = await getDashboardData();

  if (!data.user.setupComplete) {
    redirect("/welcome");
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-3">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-sky-700">
          Nuevo trabajo
        </p>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          Decide con la cabeza tranquila, no con la presión del momento
        </h1>
        <p className="max-w-3xl text-base leading-7 text-slate-600">
          Aquí no importa si el cliente apura. Importa si de verdad llegas.
        </p>
      </Card>
      <JobForm
        jobs={data.pendingJobs.map((job) => ({
          id: job.id,
          clientName: job.clientName,
          description: job.description,
          deadline: job.deadline.toISOString(),
          totalTimeMinutes: job.totalTimeMinutes,
          actualWorkedMinutes: job.actualWorkedMinutes,
          progressPercent: job.progressPercent,
          status: job.status,
          createdAt: job.createdAt.toISOString(),
          updatedAt: job.updatedAt.toISOString(),
        }))}
        workingHoursStart={data.user.workingHoursStart}
        workingHoursEnd={data.user.workingHoursEnd}
        todayWorkedMinutes={data.todayLog?.totalWorkedMinutes ?? 0}
        needsPendingRefresh={data.capacity.needsPendingRefresh}
      />
    </div>
  );
}
