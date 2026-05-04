import Link from "next/link";
import { ArrowRight, CheckCircle2, UploadCloud } from "lucide-react";

import { Hero } from "@/components/hero";
import { MotionReveal } from "@/components/motion-reveal";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { TestimonialsSection } from "@/components/testimonials-section";
import { Button } from "@/components/ui/button";
import { capabilities, materials, projects, services, trustPoints } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Fabrication services"
            title="Practical metalwork for factories, warehouses, facades, and utility structures."
            description="From drawing review to on-site installation, the focus is reliable fabrication that fits real industrial conditions."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <MotionReveal key={service.slug} delay={index * 0.05}>
                <ServiceCard service={service} />
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 py-20 text-white">
        <div className="container grid gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-start">
          <SectionHeading
            eyebrow="Why choose us"
            title="Workshop discipline with site-aware execution."
            description="MARKS Engineering is built for customers who need clear communication, material-aware fabrication, and installation support without template promises."
            className="text-white [&_h2]:text-white [&_p]:text-zinc-300"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {trustPoints.map((point) => (
              <div key={point} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <p className="mt-4 font-semibold leading-6">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-steel py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Capabilities"
            title="Fabrication, machining, and metal preparation under one coordinated workflow."
            description={`Materials handled include ${materials.join(", ")} with a 3mm-20mm thickness capability.`}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability) => {
              const Icon = capability.icon;
              return (
                <div key={capability.label} className="flex items-center gap-4 rounded-lg border bg-white p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-zinc-950 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-lg font-bold">{capability.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Completed work" title="Project categories customers ask us to fabricate." />
            <Button asChild variant="outline">
              <Link href="/projects">
                View gallery
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-100 py-20">
        <div className="container">
          <div className="grid gap-3 rounded-lg bg-zinc-950 p-4 text-white md:grid-cols-4">
            {["Established 2021", "Bilaspur based", "3mm-20mm thickness", "Drawing-led quotes"].map((item) => (
              <div key={item} className="rounded border border-white/10 bg-white/5 p-4 text-center text-sm font-bold uppercase tracking-widest">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <section className="bg-zinc-100 py-20">
        <div className="container grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <SectionHeading
            eyebrow="Built for leads"
            title="Send drawings, site notes, and material needs in one quotation request."
            description="The current quote flow is ready for direct inquiries and structured so it can evolve into a customer job upload and vendor marketplace system later."
          />
          <div className="rounded-lg border bg-white p-6 shadow-industrial">
            <UploadCloud className="h-9 w-9 text-primary" />
            <p className="mt-4 font-display text-2xl font-bold">Upload PDF, image, or site sketch.</p>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Customers can submit project type, material, quantity, location, and drawing files for faster quotation review.
            </p>
            <Button asChild className="mt-6">
              <Link href="/get-quote">Start quote request</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
