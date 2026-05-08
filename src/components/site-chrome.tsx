"use client";

import { usePathname } from "next/navigation";

import { FloatingActions } from "@/components/floating-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <main>{children}</main>;
  }

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <FloatingActions />
    </>
  );
}
