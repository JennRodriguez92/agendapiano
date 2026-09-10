"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ActualizarContrasenaForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    const supabase = createSupabaseBrowserClient();

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStatus("done");
      setTimeout(() => {
        router.push("/inicio");
        router.refresh();
      }, 1500);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Algo salió mal, intenta de nuevo.");
    }
  }

  if (status === "done") {
    return (
      <Card className="text-center">
        <p className="text-[15px]">Listo, tu contraseña quedó actualizada. Entrando…</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-fg-muted">
          Nueva contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-border-strong bg-bg-elevated px-4 py-3 text-[15px] outline-none focus:border-accent"
        />
      </div>

      {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}

      <Button type="submit" size="full" disabled={status === "loading"}>
        {status === "loading" ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </form>
  );
}
