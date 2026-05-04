"use client";

import { useMemo, useState } from "react";

import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { projectCategories, projects } from "@/lib/data";

export function ProjectsFilter() {
  const [active, setActive] = useState("All");
  const filtered = useMemo(() => (active === "All" ? projects : projects.filter((project) => project.category === active)), [active]);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-3">
        {projectCategories.map((category) => (
          <Button
            key={category}
            variant={active === category ? "industrial" : "outline"}
            size="sm"
            onClick={() => setActive(category)}
            className="shrink-0"
          >
            {category}
          </Button>
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </div>
  );
}
