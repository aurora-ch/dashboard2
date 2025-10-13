import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <aside className="hidden border-r bg-background/60 p-4 backdrop-blur md:block">
        <div className="mb-6 text-xl font-semibold">Aurora</div>
        <nav className="grid gap-2 text-sm">
          <Link href="/dashboard" className="rounded px-3 py-2 hover:bg-muted">
            Dashboard
          </Link>
          <Link href="/logs" className="rounded px-3 py-2 hover:bg-muted">
            Logs
          </Link>
          <Link href="/receptionist" className="rounded px-3 py-2 hover:bg-muted">
            Receptionist
          </Link>
          <Link href="/settings" className="rounded px-3 py-2 hover:bg-muted">
            Settings
          </Link>
        </nav>
      </aside>
      <main className="flex flex-col">
        <header className="flex items-center justify-between border-b bg-background/60 p-3 backdrop-blur">
          <div />
          <ThemeToggle />
        </header>
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}


