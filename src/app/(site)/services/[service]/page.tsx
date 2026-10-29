import { ArrowLeft, ArrowUpRight, Briefcase, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PriceVariationReferencePage } from "@/components/price-variation-reference";
import { getService, services } from "@/lib/services";

export function generateStaticParams() {
  return services.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const detail = getService(service);
  if (!detail) return { title: "Service not found | GovTender Pro" };
  return {
    title: `${detail.label} | GovTender Pro`,
    description: detail.summary,
  };
}

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  if (service === "price-variation") return <PriceVariationReferencePage />;

  const detail = getService(service);
  if (!detail) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-[2%]">
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        All services
      </Link>

      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Tender support service
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{detail.label}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {detail.summary}
          </p>
        </div>
        <span className="w-fit rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          Expert service
        </span>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <section className="glass-card space-y-4 rounded-3xl border border-black/5 p-8 dark:border-white/10">
            <h2 className="text-2xl font-bold">What&apos;s included</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              We work from the issued tender documents and the signed contract, so every output
              stays traceable to the clause it supports.
            </p>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {detail.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="glass-card space-y-4 rounded-3xl border border-black/5 p-8 dark:border-white/10">
            <h2 className="text-2xl font-bold">How it works</h2>
            <ol className="space-y-3 text-sm leading-6 text-muted-foreground">
              {[
                "Share the tender document, contract, or drawings you want reviewed.",
                "We check the clauses, formats, and deadlines that apply to this service.",
                "You receive a reviewed draft or calculation with the source references.",
                "We follow up on submissions and clarifications until they are closed.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <h3 className="mb-2 font-bold">Request a quote</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Interested in {detail.label}? Get a customised quote within 24 hours.
            </p>
            <a
              href={`mailto:mashreqenterprises@gmail.com?subject=${encodeURIComponent(`Enquiry: ${detail.label}`)}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-110"
            >
              Inquire now
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              or call{" "}
              <a href="tel:+919661221326" className="font-semibold text-primary hover:underline">
                +91 96612 21326
              </a>
            </p>
          </div>

          <div className="glass-card rounded-2xl border border-black/5 p-6 dark:border-white/10">
            <h3 className="mb-4 flex items-center gap-2 font-bold">
              <Briefcase className="h-4 w-4 text-primary" />
              Related services
            </h3>
            <div className="space-y-2">
              {services
                .filter((item) => item.slug !== detail.slug)
                .slice(0, 3)
                .map((item) => (
                  <Link
                    key={item.slug}
                    href={`/services/${item.slug}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-semibold transition hover:border-primary hover:text-primary"
                  >
                    {item.label}
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
