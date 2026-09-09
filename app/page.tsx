import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-accent-soft text-3xl">
        🎹
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold">Tu Profe de Piano</h1>
        <p className="text-fg-muted">Soy Nico, tu profe de piano.</p>
      </div>
      <Link href="/login" className={cn(buttonVariants({ size: "full" }))}>
        Entrar
      </Link>
    </div>
  );
}
