"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn, siteConfig, whatsappLink } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/get-quote", label: "Get Quote" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/92 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 font-display text-sm font-bold text-white">
            ME
          </span>
          <span className="min-w-0">
            <span className="block font-display text-base font-bold leading-tight text-zinc-950">MARKS Engineering & Co.</span>
            <span className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Fabrication & Structural Engineering</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950",
                pathname === item.href && "bg-zinc-100 text-zinc-950"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="outline" size="sm">
            <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
              <Phone className="h-4 w-4" />
              Call
            </a>
          </Button>
          <Button asChild size="sm" variant="industrial">
            <a href={whatsappLink()} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open ? (
        <div className="border-t bg-white lg:hidden">
          <nav className="container grid gap-1 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-3 text-sm font-semibold text-zinc-700",
                  pathname === item.href && "bg-zinc-100 text-zinc-950"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
