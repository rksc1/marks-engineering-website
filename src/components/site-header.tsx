"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { cn, siteConfig, whatsappLink } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/customer/session", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (data?.name) setCustomer(data);
      } catch {
        // ignore
      }
    }

    loadSession();
  }, []);

  const customerName = customer?.name?.split(" ")[0] ?? "";

  return (
    <header className="sticky top-0 z-50 border-b bg-white/92 backdrop-blur">
      <div className="container flex h-20 items-center justify-between gap-4">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 -ml-2" onClick={() => setOpen(false)}>
          <Image
            src="/MEClogo.svg"
            alt="MARKS Engineering & Co."
            width={84}
            height={84}
            className="h-14 w-14 object-contain"
          />
          <span className="min-w-0">
            <span className="block font-display text-base font-semibold leading-tight text-zinc-950">
              MARKS Engineering & Co.
            </span>
            <span className="block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Fabrication & Structural Engineering
            </span>
          </span>
        </Link>

        {/* NAV */}
        <nav className="hidden items-center gap-2 lg:flex">
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

        {/* RIGHT SIDE */}
        <div className="hidden items-center gap-2 lg:flex">

          {/* CUSTOMER */}
          {customer ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/customer">
                Hi, {customerName}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/customer/login">
                Login
              </Link>
            </Button>
          )}

          {/* CALL */}
          <Button asChild variant="outline" size="sm">
            <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
              <Phone className="h-4 w-4" />
              Call
            </a>
          </Button>

          {/* WHATSAPP */}
          <Button asChild size="sm" variant="secondary">
            <a href={whatsappLink()} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </Button>

          {/* MAIN CTA */}
          <Button asChild size="sm" className="bg-black text-white hover:bg-zinc-800">
            <Link href="/get-quote">
              Get Quote
            </Link>
          </Button>

        </div>

        {/* MOBILE BUTTON */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* MOBILE MENU */}
      {open && (
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

            {/* CUSTOMER */}
            {customer ? (
              <Link
                href="/customer"
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-sm font-semibold text-zinc-700"
              >
                Hi, {customerName}
              </Link>
            ) : (
              <Link
                href="/customer/login"
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-sm font-semibold text-zinc-700"
              >
                Customer Login
              </Link>
            )}

            {/* CTA */}
            <Link
              href="/get-quote"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-black text-white text-center py-3"
            >
              Get Quote
            </Link>

          </nav>
        </div>
      )}
    </header>
  );
}