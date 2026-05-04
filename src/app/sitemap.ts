import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/services", "/projects", "/get-quote", "/contact"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8
  }));
}
