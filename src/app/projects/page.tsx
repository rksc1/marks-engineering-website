import type { Metadata } from "next";

import { ProjectsFilter } from "@/components/projects-filter";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Projects",
  description: "Gallery of fabrication project categories including warehouse sheds, oxygen plant sheds, mezzanine floors, ACP structures, gates, and railings."
};

export default function ProjectsPage() {
  return (
    <>
      <section className="bg-zinc-950 py-20 text-white">
        <div className="container">
          <SectionHeading
            eyebrow="Projects"
            title="Completed fabrication categories for industrial and commercial customers."
            description="Representative work types handled by MARKS Engineering & Co. across sheds, structural supports, ACP frameworks, gates, and railings."
            className="[&_h2]:text-white [&_p]:text-zinc-300"
          />
        </div>
      </section>
      <section className="py-20">
        <div className="container">
          <ProjectsFilter />
        </div>
      </section>
    </>
  );
}
