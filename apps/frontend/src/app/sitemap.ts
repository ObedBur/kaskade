import type { MetadataRoute } from "next";

const siteUrl = "https://cascadheure.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/services",
    "/compare",
    "/devenir-prestataire",
    "/confidentialite",
    "/conditions",
    "/securite",
  ];

  return pages.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/services" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/services" ? 0.9 : 0.7,
  }));
}
