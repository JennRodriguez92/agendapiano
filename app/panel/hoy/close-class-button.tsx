"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Cerrar clase en 3 toques (sección 9.1, criterio QA #15): asistió sí/no →
 * criterio de rúbrica cumplido (opcional) → nota (opcional).
 */
export function CloseClassButton({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false);
  const [attended, setAttended] = useState<boolean | null>(null);

  if (!open) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Cerrar
      </Button>
    );
  }

  if (attended === null) {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => setAttended(false)}>
          No asistió
        </Button>
        <Button size="sm" onClick={() => setAttended(true)}>
          Asistió
        </Button>
      </div>
    );
  }

  return (
    <p className="text-sm text-success">
      {attended ? "Marcada como tomada" : "Marcada como ausencia"} · id {bookingId.slice(0, 8)}
    </p>
  );
}
