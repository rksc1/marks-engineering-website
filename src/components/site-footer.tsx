import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

import { services } from "@/lib/data";
import { siteConfig, whatsappLink } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="bg-zinc-950 text-white">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-bold">{siteConfig.name}</p>
          <p className="mt-4 max-w-md text-sm leading-6 text-zinc-300">{siteConfig.description}</p>
          <div className="mt-6 grid gap-2 text-sm text-zinc-300">
            <a className="flex items-center gap-2 hover:text-white" href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
              <Phone className="h-4 w-4" />
              {siteConfig.phone}
            </a>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {siteConfig.location}
            </p>
          </div>
        </div>
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-widest text-zinc-400">Services</p>
          <div className="mt-4 grid gap-2 text-sm text-zinc-300">
            {services.map((service) => (
              <Link key={service.slug} href={`/services#${service.slug}`} className="hover:text-white">
                {service.title}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-widest text-zinc-400">Lead actions</p>
          <div className="mt-4 grid gap-2 text-sm text-zinc-300">
            <Link href="/get-quote" className="hover:text-white">
              Upload drawings for quote
            </Link>
            <Link href="/projects" className="hover:text-white">
              View completed projects
            </Link>
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="hover:text-white">
              Start WhatsApp inquiry
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container flex flex-col gap-2 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Established {siteConfig.established}. Built for industrial fabrication leads.</p>
          <p>Bilaspur, Chhattisgarh, India</p>
        </div>
      </div>
    </footer>
  );
}
