import type { Metadata } from "next";
import Image from "next/image";

import { SectionHeading } from "@/components/section-heading";
import { capabilities } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: "About MARKS Engineering & Co., a Bilaspur based industrial fabrication and structural engineering company established in 2021."
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-zinc-950 py-20 text-white">
        <div className="container grid gap-10 lg:grid-cols-[0.9fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-accent">About MARKS Engineering & Co.</p>
            <h1 className="mt-4 font-display text-5xl font-bold leading-tight md:text-7xl">
              Fabrication capacity grounded in workshop execution.
            </h1>
          </div>
          <p className="text-lg leading-8 text-zinc-300">
            Established in 2021 in Bilaspur, Chhattisgarh, MARKS Engineering & Co. supports industrial customers with
            fabricated MS structures, shed frameworks, mezzanine structures, ACP support systems, and utility fabrication.
          </p>
        </div>
      </section>
      <section className="py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Story"
            title="A young fabrication company built around practical industrial needs."
            description="MARKS Engineering & Co. started in 2021 to support local factories, commercial sites, and industrial buyers that need responsive fabrication partners for structural and utility work."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["Mission", "Deliver dependable fabrication and installation support with clear quotation, practical execution, and consistent workshop discipline."],
              ["Vision", "Build a trusted fabrication platform where customers can upload jobs and capable vendors can collaborate on industrial requirements."],
              ["Values", "Accuracy, material honesty, site responsibility, responsive communication, and long-term customer trust."]
            ].map(([title, copy]) => (
              <div key={title} className="rounded-lg border bg-white p-6">
                <h2 className="font-display text-2xl font-bold">{title}</h2>
                <p className="mt-4 text-sm leading-6 text-zinc-600">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100">
            <Image src="/images/hero-workshop.png" alt="MARKS Engineering workshop setup" fill className="object-cover" />
          </div>
          <div>
            <SectionHeading
              eyebrow="Workshop setup"
              title="A lean fabrication shop for drawing-led industrial work."
              description="The team handles cutting, drilling, punching, welding, lathe machining, and press cutting for MS pipe, angle, channel, sheet, and profile sheet jobs."
            />
            <div className="mt-8 grid grid-cols-2 gap-4">
              {capabilities.map((capability) => (
                <div key={capability.label} className="rounded-lg border p-4">
                  <p className="font-semibold">{capability.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-zinc-100 py-20">
        <div className="container grid gap-5 md:grid-cols-3">
          {[
            ["Established", "2021"],
            ["Location", "Bilaspur, Chhattisgarh"],
            ["Project scale", "Up to 2-floor mezzanine structures"]
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-white p-6">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">{label}</p>
              <p className="mt-3 font-display text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
