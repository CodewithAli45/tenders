import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { services } from "@/lib/services";

export const metadata = {
  title: "Services | GovTender Pro",
  description:
    "Price variation, registration, bid preparation, clarification submission, estimation and billing schedules, and extra claims support for government tenders.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-[2%]">
      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Tender support services
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Our services</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          Practical support at every stage of a government tender — from portal registration and
          bid submission to price variation, billing, and extra claims.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
              </div>
              <h2 className="mt-4 text-base font-bold group-hover:text-primary">
                {service.label}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{service.summary}</p>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-bold">Not sure which service you need?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Send us the tender document and we will point you to the right starting point.
            </p>
          </div>
        </div>
        <a
          href="mailto:mashreqenterprises@gmail.com"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-110"
        >
          Ask us
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
