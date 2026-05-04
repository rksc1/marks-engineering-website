import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Service } from "@/lib/data";

export function ServiceCard({ service, showLink = true }: { service: Service; showLink?: boolean }) {
  const Icon = service.icon;

  return (
    <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-industrial">
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-zinc-950 text-white">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle>{service.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-zinc-600">{service.summary}</p>
        <ul className="mt-5 grid gap-2 text-sm text-zinc-700">
          {service.details.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
        {showLink ? (
          <Link href={`/services#${service.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-zinc-950">
            View details
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
