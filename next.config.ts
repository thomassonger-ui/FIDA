import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * 301s for the legacy WordPress site's URLs (fldentalassisting.com),
   * mapped ahead of the domain merge so old links, bookmarks, and search
   * results land on the right pages the moment DNS cuts over.
   */
  async redirects() {
    return [
      { source: "/our-program", destination: "/programs/entry-level-dental-assisting", permanent: true },
      { source: "/apply-now", destination: "/register", permanent: true },
      { source: "/schedule-a-tour", destination: "/tour", permanent: true },
      { source: "/expanded-functions-dental-assisting", destination: "/programs/efda-certification-florida", permanent: true },
      { source: "/radiography-for-dental-personnel", destination: "/programs/dental-radiography-certification", permanent: true },
      { source: "/template-footer-cta", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
