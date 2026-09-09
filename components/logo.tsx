import { cn } from "@/lib/utils";

/**
 * Wordmark provisional de NicoPiano — el cliente compartió el logo real
 * (foto + wordmark con nota musical) por chat, pero esta sesión no puede
 * leer los bytes de una imagen pegada en la conversación, solo guardar un
 * archivo que se suba al repo o una URL. En cuanto llegue el archivo real
 * (PNG/SVG) va en /public/logo.png y este componente lo reemplaza por un
 * <Image>, sin tocar los lugares donde <Logo /> ya se usa.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-heading font-semibold", className)}>
      <svg viewBox="0 0 24 24" className="size-7 shrink-0" aria-hidden fill="none">
        <path
          d="M9 17V5l10-2v10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="6.5" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16.5" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      <span className="tracking-tight">
        Nico<span className="text-accent">Piano</span>
      </span>
    </div>
  );
}
