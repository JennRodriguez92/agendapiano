import { NicoNav } from "@/components/nico-nav";

export default function NicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col bg-bg pb-20 md:flex-row md:pb-0">
      <NicoNav />
      <main className="flex-1 px-4 pt-6 md:px-8 md:pt-8">{children}</main>
    </div>
  );
}
