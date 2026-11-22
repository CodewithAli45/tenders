import type { MetadataRoute } from "next";
import type { MappedTender } from "@/lib/tender-mapping";
import { fetchPublicTenders } from "@/lib/public-tenders";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tenders-epc.vercel.app";
  let tenders: MappedTender[] = [];

  try {
    tenders = await fetchPublicTenders();
  } catch (error) {
    console.error("Tender sitemap load error:", error);
  }

  return [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    ...tenders.map((tender) => ({
      url: `${baseUrl}/tender/${encodeURIComponent(tender._id)}`,
      lastModified: tender.updatedAt || tender.createdAt || undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
