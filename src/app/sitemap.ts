import type { MetadataRoute } from "next";
import { getAllIcons, getAllCategories } from "@/lib/icons";

const BASE_URL = "https://thesvg.org";
const CDN_BASE =
  "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const icons = getAllIcons();
  const categories = getAllCategories();

  // ---- Static pages (high-value) ----
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/compare`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/extensions`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/api-docs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/submit`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/legal`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ---- Category filter pages ----
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/?category=${encodeURIComponent(cat)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // ---- Individual icon pages (with real lastModified when available) ----
  const iconPages: MetadataRoute.Sitemap = icons.map((icon) => ({
    url: `${BASE_URL}/icon/${icon.slug}`,
    lastModified: icon.dateAdded ? new Date(icon.dateAdded) : now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
    images: [`${CDN_BASE}/${icon.slug}/default.svg`],
  }));

  return [...staticPages, ...categoryPages, ...iconPages];
}
