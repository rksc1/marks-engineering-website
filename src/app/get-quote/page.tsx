import type { Metadata } from "next";

import { QuoteForm } from "@/components/quote-form";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Get Quote",
  description: "Request a fabrication quotation from MARKS Engineering & Co. Upload drawings, material needs, quantity, and site location."
};

export default function GetQuotePage() {
  return (
    <>
      <section className="bg-steel py-20">
        <div className="container grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          <SectionHeading
            eyebrow="Quotation request"
            title="Upload your drawing and fabrication requirement."
            description="Share project type, material, quantity, site location, and drawings so the team can review feasibility and respond with the next steps."
          />
          <QuoteForm />
        </div>
      </section>
    </>
  );
}
