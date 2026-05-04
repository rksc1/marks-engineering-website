import Link from "next/link";
import { FileText, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/utils";

export function FloatingActions() {
  return (
    <>
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-industrial transition-transform hover:scale-105 md:bottom-7"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 p-3 backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline">
            <Link href="/contact">Contact Us</Link>
          </Button>
          <Button asChild>
            <Link href="/get-quote">
              <FileText className="h-4 w-4" />
              Get Quote
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
