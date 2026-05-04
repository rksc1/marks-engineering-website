import Image from "next/image";

import { Card } from "@/components/ui/card";
import type { Project } from "@/lib/data";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-zinc-100">
        <Image src={project.image} alt={project.title} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" />
        <div className="absolute left-3 top-3 rounded bg-zinc-950 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">
          {project.category}
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">{project.location}</p>
        <h3 className="mt-2 font-display text-xl font-bold text-zinc-950">{project.title}</h3>
        <p className="mt-3 text-sm leading-6 text-zinc-600">{project.summary}</p>
      </div>
    </Card>
  );
}
