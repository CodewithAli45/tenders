import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { getPublicTenderById } from "@/lib/public-tenders";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tender = await getPublicTenderById(id);
  if (!tender) return { title: "Tender not found | GovTender Pro" };

  const description = [tender.organization, tender.internalId, tender.location]
    .filter(Boolean)
    .join(" · ");

  return {
    title: `${tender.title} | GovTender Pro`,
    description: description || `Tender details for ${tender.title}.`,
    alternates: { canonical: `/tender/${encodeURIComponent(id)}` },
  };
}

const formatDate = (value?: string | null) => {
  if (!value) return "Not specified";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not specified"
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(date);
};

const formatAmount = (amount?: number | null) =>
  !amount || amount <= 0
    ? "Refer to tender document"
    : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass-card space-y-3 rounded-2xl border border-border p-5 sm:p-7">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function SafeTenderContent({ html }: { html: unknown }) {
  const source = typeof html === "string" ? html : "";
  const safeHtml = source
    ? DOMPurify.sanitize(source, { USE_PROFILES: { html: true } })
    : "";

  return safeHtml ? (
    <div className="rich-text-surface text-sm" dangerouslySetInnerHTML={{ __html: safeHtml }} />
  ) : (
    <p className="text-sm italic text-muted-foreground">Not specified.</p>
  );
}

export default async function TenderPage({ params }: Props) {
  const { id } = await params;
  const tender = await getPublicTenderById(id);
  if (!tender) notFound();

  const documents = [
    ...tender.tenderDocuments.map((url: string) => ({ url, label: "Tender document" })),
    ...tender.corrigendumFiles.map((url: string) => ({ url, label: "Corrigendum" })),
  ];

  return (
    <article className="mx-auto w-full max-w-5xl space-y-6 p-[2%]">
      <Link href="/" className="text-sm font-semibold text-primary hover:underline">
        ← Back to tender dashboard
      </Link>

      <header className="glass-card space-y-5 rounded-3xl border border-border p-6 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Public tender listing</p>
        <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl">{tender.title}</h1>
        <p className="text-base font-semibold text-muted-foreground">{tender.organization}</p>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Tender reference", tender.internalId],
            ["Tender number", tender.tenderNo],
            ["Estimated value", formatAmount(tender.tenderValue)],
            ["Earnest money deposit", formatAmount(tender.emdAmount)],
            ["Published", formatDate(tender.publishDate)],
            ["Submission deadline", formatDate(tender.dueDate)],
            ["Location", tender.location],
            ["Portal reference", tender.portalId],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-background/50 p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
              <dd className="mt-1 break-words text-sm font-semibold">{value || "Not specified"}</dd>
            </div>
          ))}
        </dl>
      </header>

      {tender.scopeOfWork && <DetailSection title="Scope of work"><SafeTenderContent html={tender.scopeOfWork} /></DetailSection>}

      {(tender.eligibilityTechnical || tender.eligibilityFinancial || tender.eligibilityJV) && (
        <DetailSection title="Eligibility requirements">
          <div className="space-y-4">
            {tender.eligibilityTechnical && <div><h3 className="mb-1 text-sm font-bold">Technical eligibility</h3><SafeTenderContent html={tender.eligibilityTechnical} /></div>}
            {tender.eligibilityFinancial && <div><h3 className="mb-1 text-sm font-bold">Financial eligibility</h3><SafeTenderContent html={tender.eligibilityFinancial} /></div>}
            {tender.eligibilityJV && <div><h3 className="mb-1 text-sm font-bold">Joint venture conditions</h3><SafeTenderContent html={tender.eligibilityJV} /></div>}
          </div>
        </DetailSection>
      )}

      {(tender.technicalAnalysis || tender.boqSummary || tender.paymentTerms) && (
        <DetailSection title="Tender analysis and conditions">
          <div className="space-y-4">
            {tender.technicalAnalysis && <div><h3 className="mb-1 text-sm font-bold">Technical notes</h3><SafeTenderContent html={tender.technicalAnalysis} /></div>}
            {tender.boqSummary && <div><h3 className="mb-1 text-sm font-bold">BOQ summary</h3><SafeTenderContent html={tender.boqSummary} /></div>}
            {tender.paymentTerms && <div><h3 className="mb-1 text-sm font-bold">Payment terms</h3><SafeTenderContent html={tender.paymentTerms} /></div>}
          </div>
        </DetailSection>
      )}

      {documents.length > 0 && (
        <DetailSection title="Tender documents">
          <ul className="space-y-2">
            {documents.map(({ url, label }, index) => (
              <li key={`${url}-${index}`}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary underline-offset-2 hover:underline">
                  {label} {index + 1}
                </a>
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      <p className="text-xs leading-5 text-muted-foreground">
        Tender information is provided for reference. Confirm current dates, eligibility, and submission requirements in the issuing authority’s original tender documents.
      </p>
    </article>
  );
}
