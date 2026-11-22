import { TenderDashboardMount } from "@/components/tender-dashboard-mount";
import { TenderIndexPreview } from "@/components/tender-index-preview";
import { getPublicTenders } from "@/lib/public-tenders";
import type { MappedTender } from "@/lib/tender-mapping";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Indian Government Tenders | GovTender Pro",
  description:
    "Browse current Indian government and EPC tenders with tender values, EMD amounts, issuing organizations, publication dates, and submission deadlines.",
};

export default async function Home() {
  let tenders: MappedTender[] = [];
  try {
    tenders = await getPublicTenders();
  } catch (error) {
    console.error("Public tender page load error:", error);
  }

  return (
    <TenderDashboardMount initialTenders={tenders}>
      <TenderIndexPreview tenders={tenders} />
    </TenderDashboardMount>
  );
}
