import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { siteConfig, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact MARKS Engineering & Co. in Bilaspur, Chhattisgarh for industrial and structural fabrication inquiries."
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-zinc-950 py-20 text-white">
        <div className="container">
          <SectionHeading
            eyebrow="Contact"
            title="Talk to MARKS Engineering about your fabrication requirement."
            description="Call, WhatsApp, or submit a short inquiry with your requirement and site location."
            className="[&_h2]:text-white [&_p]:text-zinc-300"
          />
        </div>
      </section>
      <section className="py-20">
        <div className="container grid gap-10 lg:grid-cols-[0.8fr_1fr]">
          <div className="grid gap-4">
            <div className="rounded-lg border p-5">
              <Phone className="h-5 w-5 text-primary" />
              <p className="mt-3 font-display text-xl font-bold">Phone</p>
              <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="mt-1 block text-zinc-600">
                {siteConfig.phone}
              </a>
            </div>
            <div className="rounded-lg border p-5">
              <Mail className="h-5 w-5 text-primary" />
              <p className="mt-3 font-display text-xl font-bold">Email</p>
              <a href={`mailto:${siteConfig.email}`} className="mt-1 block text-zinc-600">
                {siteConfig.email}
              </a>
            </div>
            <div className="rounded-lg border p-5">
              <MessageCircle className="h-5 w-5 text-primary" />
              <p className="mt-3 font-display text-xl font-bold">WhatsApp</p>
              <Button asChild className="mt-4">
                <a href={whatsappLink()} target="_blank" rel="noreferrer">
                  Start chat
                </a>
              </Button>
            </div>
            <div className="rounded-lg border p-5">
              <MapPin className="h-5 w-5 text-primary" />
              <p className="mt-3 font-display text-xl font-bold">Address</p>
              <p className="mt-1 text-zinc-600">{siteConfig.address}</p>
            </div>
            <div className="rounded-lg border p-5">
              <Clock className="h-5 w-5 text-primary" />
              <p className="mt-3 font-display text-xl font-bold">Working hours</p>
              <p className="mt-1 text-zinc-600">Monday to Saturday, 9:30 AM - 7:00 PM</p>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="rounded-lg border bg-white p-5 shadow-industrial md:p-8">
              <h2 className="font-display text-3xl font-bold">Send inquiry</h2>
              <div className="mt-6">
                <ContactForm source="contact-page" />
              </div>
            </div>
            <iframe
              title="MARKS Engineering location map"
              className="h-80 w-full rounded-lg border"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Bilaspur%2C%20Chhattisgarh%2C%20India&output=embed"
            />
          </div>
        </div>
      </section>
    </>
  );
}
