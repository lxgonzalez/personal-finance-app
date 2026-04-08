import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/auth/login", "/auth/sign-up"],
      disallow: ["/dashboard", "/transactions", "/categories"],
    },
    sitemap: "/sitemap.xml",
  };
}
