import Link from "next/link";
import type { MappedTender } from "@/lib/tender-mapping";

const formatDate = (value?: string | null) => {
  if (!value) return "Date not listed";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date not listed"
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
};

export function TenderIndexPreview({ tenders }: { tenders: MappedTender[] }) {
  const visibleTenders = tenders.slice(0, 10);

  return (
    <section aria-labelledby="tender-index-heading" className="mx-auto mb-8 w-full max-w-6xl space-y-4 px-2 sm:px-4">
      <header className="space-y-2">
        <h1 id="tender-index-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Current Indian Government &amp; EPC Tenders
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Browse public tender notices with issuing organizations, tender references, estimated values, and submission deadlines. Open a listing for its available scope, eligibility notes, and source documents.
        </p>
      </header>

      {visibleTenders.length > 0 ? (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card/50">
          {visibleTenders.map((tender) => (
            <li key={tender._id} className="p-4 sm:px-5">
              <Link href={`/tender/${encodeURIComponent(tender._id)}`} className="group block">
                <h2 className="font-bold leading-snug group-hover:text-primary">{tender.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tender.organization} · Reference {tender.internalId} · Submission deadline {formatDate(tender.dueDate)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-border bg-card/50 p-5 text-sm text-muted-foreground">
          Tender listings are temporarily unavailable. Please check back shortly.
        </p>
      )}
    </section>
  );
}
