"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BreathingButton } from "@/components/breathing/breathing-button";
import { PirateMascot } from "@/components/pirate/pirate-mascot";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Hoy" },
  { href: "/jobs", label: "Promesas" },
  { href: "/jobs/new", label: "Nuevo trabajo" },
  { href: "/goals", label: "Objetivos" },
  { href: "/settings", label: "Ajustes" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f9f4e8] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(116,200,179,0.35),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(72,158,214,0.18),_transparent_24%),linear-gradient(180deg,_#fffaf1_0%,_#f4efe2_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,_rgba(255,255,255,0.65),_transparent)]" />
      <header className="sticky top-0 z-30 border-b border-white/70 bg-[#fffaf1]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <PirateMascot compact />
            <div>
              <p className="text-xl font-black tracking-tight text-slate-900">Pirate Studio</p>
              <p className="text-sm text-sky-800">Tu negocio, tus reglas, tu control.</p>
            </div>
          </Link>
          <nav className="hidden flex-wrap gap-2 md:flex">
            {links.map((link) => {
              const active =
                link.href === "/" ? pathname === link.href : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-bold transition",
                    active
                      ? "bg-[#123b62] text-white shadow-lg"
                      : "bg-white/70 text-slate-700 hover:bg-white",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <BreathingButton />
    </div>
  );
}
