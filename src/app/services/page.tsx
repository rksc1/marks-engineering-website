import type { Metadata } from "next";

import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { capabilities, capabilityBoxes, services } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services",
  description: "Industrial fabrication, structural fabrication, ACP support structures, gates, railings, and installation services in Bilaspur."
};

export default function ServicesPage() {
  return (
    <>
      <section className="bg-steel py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Services"
            title="Fabrication categories for industrial buyers and commercial sites."
            description="Each project can begin from a drawing, rough dimension, site photograph, or requirement note."
          />
        </div>
      </section>
      <section className="py-20">
        <div className="container grid gap-6 lg:grid-cols-2">
          {services.map((service) => (
            <div id={service.slug} key={service.slug} className="scroll-mt-24">
              <ServiceCard service={service} showLink={false} />
            </div>
          ))}
        </div>
      </section>
      <section className="bg-zinc-950 py-20 text-white">
        <div className="container grid gap-10 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Production capability"
            title="3mm-20mm thickness range with common MS industrial sections."
            description="Clear capability boxes help customers decide whether a drawing or site requirement is suitable before requesting a quote."
            className="[&_h2]:text-white [&_p]:text-zinc-300"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {capabilities.map((capability) => {
              const Icon = capability.icon;
              return (
                <div key={capability.label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                  <Icon className="h-5 w-5 text-accent" />
                  <span className="font-semibold">{capability.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container grid gap-5 md:grid-cols-3">
          {capabilityBoxes.map((box) => (
            <div key={box.title} className="rounded-lg border bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">{box.title}</p>
              <p className="mt-3 font-display text-3xl font-bold">{box.value}</p>
              <p className="mt-4 text-sm leading-6 text-zinc-600">{box.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
