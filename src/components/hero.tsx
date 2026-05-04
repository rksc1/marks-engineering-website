import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0">
        <Image src="/images/hero-workshop.png" alt="Industrial fabrication workshop" fill priority className="object-cover opacity-[0.42]" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/28" />
      </div>
      <div className="container relative grid min-h-[calc(100vh-4rem)] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.72fr]">
        <div className="max-w-4xl">
          <p className="inline-flex rounded bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-zinc-200 ring-1 ring-white/15">
            Established 2021 · Bilaspur, Chhattisgarh
          </p>
          <h1 className="mt-6 font-display text-5xl font-bold leading-none md:text-7xl lg:text-8xl">
            Industrial fabrication built for working sites.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-200 md:text-xl">
            MARKS Engineering & Co. fabricates machine frames, sheds, mezzanine structures, ACP supports, gates,
            railings, and custom MS structures for serious B2B projects.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/get-quote">
                <FileText className="h-5 w-5" />
                Get Quote
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/15">
              <Link href="/contact">
                <Phone className="h-5 w-5" />
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="clip-industrial border border-white/15 bg-white/10 p-6 backdrop-blur">
            <div className="grid gap-4">
              {[
                ["Thickness", "3mm-20mm"],
                ["Materials", "MS pipe · Angle · Channel · Sheet"],
                ["Project scale", "Up to 2-floor mezzanine"],
                ["Lead flow", "Upload drawings for quotation"]
              ].map(([label, value]) => (
                <div key={label} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{label}</p>
                  <p className="mt-1 font-display text-xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <Link href="/services" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-accent">
              Explore capabilities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      <div className="relative h-14 border-t border-white/10 bg-zinc-950">
        <div className="container flex h-full items-center gap-6 overflow-hidden text-xs font-bold uppercase tracking-widest text-zinc-400">
          <span>{siteConfig.shortName}</span>
          <span>Welding</span>
          <span>Lathe machining</span>
          <span>Punching</span>
          <span>Drilling</span>
          <span>Cutting</span>
          <span>Press cutting</span>
        </div>
      </div>
    </section>
  );
}
