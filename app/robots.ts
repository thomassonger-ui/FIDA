import type { MetadataRoute } from "next";

// Public production URL. Falls back to the live domain if the env var is unset,
// so robots.txt always resolves to an absolute sitemap URL.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://fldentalassisting.online";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private / app areas out of the index.
        disallow: ["/admin", "/portal", "/api", "/login", "/auth", "/gate"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
