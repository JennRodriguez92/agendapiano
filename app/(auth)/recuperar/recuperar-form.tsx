"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function RecuperarForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    const supabase = createSupabaseBrowserClient();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/actualizar-contrasena`,
      });
      if (error) throw error;
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Algo salió mal, intenta de nuevo.");
    }
  }

  if (status === "sent") {
    return (
      <Card className="text-center">
        <p className="text-[15px]">
          Si {email} tiene una cuenta con nosotros, te llegará un correo con el enlace para
          crear una nueva contraseña.
        </p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-fg-muted">
          Correo
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border-strong bg-bg-elevated px-4 py-3 text-[15px] outline-none focus:border-accent"
        />
      </div>

      {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}

      <Button type="submit" size="full" disabled={status === "loading"}>
        {status === "loading" ? "Enviando…" : "Enviar enlace"}
      </Button>
    </form>
  );
}
