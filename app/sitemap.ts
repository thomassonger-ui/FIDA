import type { MetadataRoute } from "next";

// Branded production domain — the canonical site we want indexed.
const SITE_URL = "https://fldentalassisting.online";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/programs", priority: 0.9, changeFrequency: "weekly" },
    { path: "/programs/efda-certification-florida", priority: 0.8, changeFrequency: "monthly" },
    { path: "/programs/dental-radiography-certification", priority: 0.8, changeFrequency: "monthly" },
    { path: "/admissions", priority: 0.9, changeFrequency: "weekly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/tickets", priority: 0.4, changeFrequency: "monthly" },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
