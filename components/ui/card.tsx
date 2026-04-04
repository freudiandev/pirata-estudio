import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_-24px_rgba(27,68,98,0.35)] backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}
