"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic-link">("password");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    const supabase = createSupabaseBrowserClient();

    try {
      if (mode === "password") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/inicio");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/inicio` },
        });
        if (error) throw error;
        setStatus("sent");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Algo salió mal, intenta de nuevo.");
    }
  }

  if (status === "sent") {
    return (
      <Card className="text-center">
        <p className="text-[15px]">Te enviamos un enlace mágico a {email}. Revisa tu correo.</p>
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

      {mode === "password" && (
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-fg-muted">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border-strong bg-bg-elevated px-4 py-3 text-[15px] outline-none focus:border-accent"
          />
        </div>
      )}

      {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}

      <Button type="submit" size="full" disabled={status === "loading"}>
        {status === "loading" ? "Entrando…" : mode === "password" ? "Entrar" : "Enviar enlace mágico"}
      </Button>

      <button
        type="button"
        onClick={() => setMode(mode === "password" ? "magic-link" : "password")}
        className="w-full text-center text-sm text-fg-muted"
      >
        {mode === "password" ? "Entrar con enlace mágico" : "Entrar con contraseña"}
      </button>
    </form>
  );
}
