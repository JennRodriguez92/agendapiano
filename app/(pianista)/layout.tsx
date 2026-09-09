import { PianistaNav } from "@/components/pianista-nav";

export default function PianistaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg pb-20">
      <main className="flex-1 px-4 pt-6">{children}</main>
      <PianistaNav />
    </div>
  );
}
