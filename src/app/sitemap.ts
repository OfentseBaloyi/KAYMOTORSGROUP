import type { MetadataRoute } from "next";
import { getAllCars } from "@/lib/data/cars";
import { publicEnv } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.siteUrl;
  const cars = await getAllCars();

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/cars`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/how-it-works`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  return [
    ...pages,
    ...cars.map((car) => ({
      url: `${base}/cars/${car.slug}`,
      lastModified: car.updatedAt,
      changeFrequency: "weekly" as const,
      // Sold cars stay listed (people search for them) but rank lower.
      priority: car.status === "sold" ? 0.3 : 0.8,
    })),
  ];
}
