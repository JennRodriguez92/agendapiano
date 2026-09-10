"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

  async function handleGoogleSignIn() {
    setStatus("loading");
    setErrorMessage(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/inicio` },
    });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    }
    // En éxito, Supabase redirige a Google — no hay nada más que hacer aquí.
  }

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
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/inicio` },
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
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={status === "loading"}
        className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-border-strong bg-bg-elevated text-[15px] font-medium transition-colors hover:bg-bg-elevated-2 disabled:opacity-40"
      >
        <GoogleIcon className="size-5" />
        Entrar con Google
      </button>

      <div className="flex items-center gap-3 text-xs text-fg-subtle">
        <div className="h-px flex-1 bg-border" />o<div className="h-px flex-1 bg-border" />
      </div>

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

      {mode === "password" && (
        <Link href="/recuperar" className="block text-right text-sm text-fg-muted">
          ¿Olvidaste tu contraseña?
        </Link>
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
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.12A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.61H1.27a12 12 0 0 0 0 10.78l4-3.12Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.6 4.6 1.79l3.45-3.45C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.12C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}
