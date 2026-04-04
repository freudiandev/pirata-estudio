import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function BehaviorPanel({ messages }: { messages: string[] }) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          Señales para cuidar tu negocio y tu cabeza
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Pirate Studio no solo registra. También te ayuda a decidir con honestidad.
        </p>
      </div>
      <div className="space-y-3">
        {messages.length ? (
          messages.map((message) => (
            <div
              key={message}
              className="flex items-start gap-3 rounded-[1.4rem] bg-[#fff4ea] px-4 py-3 text-slate-700"
            >
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
              <p className="leading-7">{message}</p>
            </div>
          ))
        ) : (
          <div className="flex items-start gap-3 rounded-[1.4rem] bg-emerald-50 px-4 py-3 text-slate-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
            <p className="leading-7">
              Vas bien. Sigue registrando y revisando lo prometido antes de aceptar algo nuevo.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
