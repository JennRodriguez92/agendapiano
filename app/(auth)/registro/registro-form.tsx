"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Crea el usuario en Supabase Auth con el nombre en los metadatos. La fila
 * de student_profiles (db/schema.ts) se crea del lado del servidor con un
 * trigger sobre auth.users (ver db/triggers.sql) — no se inserta desde el
 * cliente para no depender de RLS de escritura sobre esa tabla.
 */
export function RegistroForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    const supabase = createSupabaseBrowserClient();

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/inicio`,
        },
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
          Te enviamos un correo de confirmación a {email}. Ábrelo para activar tu cuenta.
        </p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="fullName" className="text-sm font-medium text-fg-muted">
          Nombre completo
        </label>
        <input
          id="fullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-xl border border-border-strong bg-bg-elevated px-4 py-3 text-[15px] outline-none focus:border-accent"
        />
      </div>

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

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-fg-muted">
          Contraseña
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
        {status === "loading" ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
    </form>
  );
}
