import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/forms/onboarding-form";
import { PirateMascot } from "@/components/pirate/pirate-mascot";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/services/user";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const user = await getCurrentUser();

  if (user.setupComplete) {
    redirect("/");
  }

  return (
    <div className="grid min-h-[70vh] items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="flex flex-col items-center justify-center gap-4 text-center">
        <PirateMascot mood="calm" />
        <p className="text-sm font-black uppercase tracking-[0.28em] text-sky-700">
          Bienvenida
        </p>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          Bienvenido a Pirate Studio. Tu negocio, tus reglas, tu control.
        </h1>
        <p className="max-w-lg text-base leading-7 text-slate-600">
          Aquí vienes a mirar tu trabajo con honestidad, cuidar tu dinero y decidir sin ahogarte.
        </p>
      </Card>
      <OnboardingForm />
    </div>
  );
}
