"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, CalendarDays, ClipboardList, CreditCard, FileText, Home, LogOut, Menu, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  adminName: string;
  children: React.ReactNode;
};

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/workers", label: "Workers", icon: Users },
  { href: "/admin/attendance", label: "Attendance", icon: CalendarDays },
  { href: "/admin/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/work-orders", label: "Work Orders", icon: FileText },
  { href: "/admin/quotes", label: "Quotes", icon: BarChart3 }
];

export function AdminShell({ adminName, children }: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const breadcrumbs = buildBreadcrumbs(pathname);

  return (
    <section className="min-h-screen bg-zinc-100">
      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r bg-zinc-950 text-white lg:sticky lg:top-0 lg:block lg:h-screen">
          <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open admin menu">
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                  <h1 className="font-display text-lg font-bold text-zinc-950 md:text-xl">MARKS Admin</h1>
                  <nav className="mt-1 flex flex-wrap items-center gap-1 text-xs font-medium text-zinc-500">
                    {breadcrumbs.map((crumb, index) => (
                      <span key={`${crumb}-${index}`} className="flex items-center gap-1">
                        {index > 0 ? <span>/</span> : null}
                        <span className={index === breadcrumbs.length - 1 ? "text-zinc-800" : ""}>{crumb}</span>
                      </span>
                    ))}
                  </nav>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Admin profile</p>
                  <p className="text-sm font-bold text-zinc-950">{adminName}</p>
                </div>
                <form action="/api/admin/logout" method="post">
                  <Button variant="outline" size="sm">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </form>
              </div>
            </div>
          </header>

          {open ? (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close admin menu" onClick={() => setOpen(false)} />
              <aside className="relative h-full w-[280px] max-w-[85vw] bg-zinc-950 text-white shadow-2xl">
                <button type="button" className="absolute right-3 top-3 rounded-md p-2 text-zinc-300 hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)} aria-label="Close admin menu">
                  <X className="h-5 w-5" />
                </button>
                <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
              </aside>
            </div>
          ) : null}

          <div className="px-4 py-6 md:px-6">{children}</div>
        </div>
      </div>
    </section>
  );
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="font-display text-xl font-bold">MARKS</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">Operations Panel</p>
      </div>
      <nav className="grid gap-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white",
                active && "bg-white text-zinc-950 hover:bg-white hover:text-zinc-950"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function buildBreadcrumbs(pathname: string) {
  if (pathname === "/admin") return ["Admin", "Dashboard"];
  const labels: Record<string, string> = {
    workers: "Workers",
    attendance: "Attendance",
    tasks: "Tasks",
    payments: "Payments",
    "work-orders": "Work Orders",
    quotes: "Quotes"
  };
  const parts = pathname.split("/").filter(Boolean).slice(1);
  return ["Admin", ...parts.map((part, index) => (index > 0 && parts[index - 1] === "quotes" ? "Details" : labels[part] || titleize(part)))];
}

function titleize(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
