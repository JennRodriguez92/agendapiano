"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Users, Calendar, Wallet, MessageSquare, BarChart3, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/panel/hoy", label: "Hoy", icon: Sun },
  { href: "/panel/pianistas", label: "Pianistas", icon: Users },
  { href: "/panel/agenda", label: "Agenda", icon: Calendar },
  { href: "/panel/planes", label: "Planes", icon: CalendarDays },
  { href: "/panel/pagos", label: "Pagos", icon: Wallet },
  { href: "/panel/contenido", label: "Contenido", icon: MessageSquare },
  { href: "/panel/metricas", label: "Métricas", icon: BarChart3 },
];

export function NicoNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-elevated/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:static md:w-56 md:border-t-0 md:border-r md:pb-0"
      aria-label="Panel de Nico"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-1 md:mx-0 md:max-w-none md:flex-col md:gap-1 md:p-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <li key={href} className="flex-1 md:flex-none">
              <Link
                href={href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-medium transition-colors md:h-auto md:flex-row md:justify-start md:gap-2.5 md:px-3 md:py-2.5 md:text-sm",
                  active
                    ? "text-accent md:bg-accent-soft"
                    : "text-fg-subtle hover:text-fg-muted md:hover:bg-bg-elevated-2"
                )}
              >
                <Icon className="size-5 md:size-4" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
