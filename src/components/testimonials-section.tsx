import { MessageSquareQuote } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { testimonials } from "@/lib/data";

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="container">
        <SectionHeading
          eyebrow="Client trust"
          title="Testimonials and client references."
          description="This section is wired for real approved client quotes. Add verified client names and quotes in the content data when they are available."
        />
        {testimonials.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure key={`${testimonial.name}-${testimonial.company}`} className="rounded-lg border bg-white p-6">
                <MessageSquareQuote className="h-6 w-6 text-primary" />
                <blockquote className="mt-4 text-sm leading-6 text-zinc-700">&ldquo;{testimonial.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 text-sm font-bold text-zinc-950">
                  {testimonial.name}
                  <span className="block font-medium text-zinc-500">{testimonial.company}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-lg border border-dashed bg-zinc-50 p-6 text-sm leading-6 text-zinc-600">
            No fabricated testimonials have been added. Replace this note with real client quotes after approval.
          </div>
        )}
      </div>
    </section>
  );
}
