import { JobStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { JobProgressForm } from "@/components/forms/job-progress-form";
import { Card } from "@/components/ui/card";
import { getWorkProfileCopy } from "@/lib/copy";
import { formatCurrency, formatMinutes, formatShortDate } from "@/lib/formatters";
import { getDashboardData } from "@/services/dashboard";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const data = await getDashboardData();

  if (!data.user.setupComplete) {
    redirect("/welcome");
  }

  const copy = getWorkProfileCopy(data.user.workProfile, data.user.customWorkLabel);
  const activeStatuses: JobStatus[] = [
    JobStatus.PENDING,
    JobStatus.IN_PROGRESS,
    JobStatus.READY,
  ];
  const pendingJobs = data.jobs.filter((job) => activeStatuses.includes(job.status));
  const archivedJobs = data.jobs.filter(
    (job) => !activeStatuses.includes(job.status),
  );

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-sky-700">
          Promesas
        </p>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          {copy.pendingTitle}
        </h1>
        <p className="text-base leading-7 text-slate-600">
          Antes de aceptar algo nuevo, esto es lo que tienes que revisar.
        </p>
        {data.capacity.needsPendingRefresh ? (
          <div className="rounded-[1.6rem] bg-[#fff1e8] p-4 text-base font-semibold text-amber-900">
            No puedes calcular nuevos trabajos si no actualizas lo que ya debes.
          </div>
        ) : null}
      </Card>

      <div className="space-y-5">
        {pendingJobs.map((job) => (
          <Card key={job.id} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                  {job.clientName}
                </p>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  {job.description}
                </h2>
                <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
                  <span>Cantidad: {job.quantity}</span>
                  <span>Tiempo total: {formatMinutes(job.totalTimeMinutes)}</span>
                  <span>Entrega: {formatShortDate(job.deadline)}</span>
                </div>
              </div>
              <div className="rounded-[1.5rem] bg-[#f8fbff] p-4">
                <p className="text-sm font-semibold text-sky-700">Dinero esperado</p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {formatCurrency(Number(job.price))}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Costo estimado: {formatCurrency(Number(job.cost))}
                </p>
              </div>
            </div>
            <JobProgressForm
              jobId={job.id}
              progressPercent={job.progressPercent}
              status={job.status}
            />
          </Card>
        ))}
      </div>

      {archivedJobs.length ? (
        <Card className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Cerrados</h2>
          <div className="space-y-3">
            {archivedJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-[1.3rem] bg-[#fffdf8] px-4 py-3 text-slate-700"
              >
                <p className="font-bold">{job.clientName}</p>
                <p className="text-sm">{job.description}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
