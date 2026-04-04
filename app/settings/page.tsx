import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/forms/settings-form";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/services/user";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user.setupComplete) {
    redirect("/welcome");
  }

  return (
    <Card className="space-y-5">
      <p className="text-sm font-black uppercase tracking-[0.28em] text-sky-700">
        Ajustes
      </p>
      <h1 className="text-4xl font-black tracking-tight text-slate-900">
        Haz que la app te hable como trabajas tú
      </h1>
      <p className="max-w-2xl text-base leading-7 text-slate-600">
        Cambia tu horario real y el tipo de oficio. Eso ajusta el lenguaje y el cálculo de capacidad.
      </p>
      <SettingsForm
        name={user.name}
        workingHoursStart={user.workingHoursStart}
        workingHoursEnd={user.workingHoursEnd}
        workProfile={user.workProfile}
        customWorkLabel={user.customWorkLabel}
      />
    </Card>
  );
}
