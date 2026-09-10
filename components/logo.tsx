import Image from "next/image";
import { cn } from "@/lib/utils";

/** Logo real de NicoPiano (public/logo.png) — blanco sobre fondo transparente, pensado para fondos oscuros como el de la app. */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="NicoPiano"
      width={300}
      height={130}
      className={cn("h-auto w-40", className)}
      priority
    />
  );
}
