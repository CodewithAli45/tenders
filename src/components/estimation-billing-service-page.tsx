import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Coins,
  FileSearch,
  MapPin,
  PackageCheck,
  Phone,
  Route,
  ShieldAlert,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { services } from "@/lib/services";

const tenderTypes = [
  {
    icon: ClipboardList,
    title: "Turnkey tenders without a priced estimate",
    text: "Some turnkey packages, including SAIL tenders, may leave the contractor to work out the detailed quantities and cost. We break the scope into deliverables, activities, and measurable work packages, then prepare a project-specific estimate and a practical billing schedule from the tender requirements.",
  },
  {
    icon: Building2,
    title: "Lump-sum turnkey tenders",
    text: "Where a PSU asks for one total price for the complete work, every requirement needed to deliver that outcome must be considered. We build up the total from the scope, execution plan, resources, procurement, site constraints, and commercial assumptions.",
  },
];

const estimateSteps = [
  {
    title: "Understand the complete scope",
    text: "Review the tender, specifications, drawings, completion requirements, interfaces, exclusions, and deliverables. Identify work that is implied by the required finished project even when it is not listed as a separate BOQ line.",
  },
  {
    title: "Visit and assess the site",
    text: "A site visit is essential to understand access, ground and existing conditions, working space, utilities, storage, lifting needs, local restrictions, and the practical sequence of work. Record observations and open questions before finalising the estimate.",
  },
  {
    title: "Build project-specific costs",
    text: "Assess quantities, materials, labour, equipment, temporary works, transport, handling, wastage, lead times, local availability, and execution conditions. DSR or other schedule rates can be a reference where relevant, but should not replace project-specific rate analysis.",
  },
  {
    title: "Check price and billing structure",
    text: "Bring the cost build-up together into the required total bid price. Where the tender needs a billing schedule, align milestones or measurable activities with the work sequence, contract terms, and records required for payment claims.",
  },
];

const siteFactors = [
  { icon: PackageCheck, text: "Material specifications, quantities, wastage, and procurement lead time" },
  { icon: Truck, text: "Local supplier availability, transport distance, unloading, and handling" },
  { icon: MapPin, text: "Site access, terrain, existing assets, utilities, and working restrictions" },
  { icon: Route, text: "Execution sequence, labour availability, equipment, storage, and temporary works" },
  { icon: Coins, text: "Taxes, duties, price assumptions, cash flow, risk allowances, and commercial margin" },
];

const prepareList = [
  "Complete tender documents, BOQ or price schedule, specifications, and all corrigenda.",
  "Drawings, design criteria, scope descriptions, completion milestones, and interface details.",
  "Site visit access and any available site survey, geotechnical, utility, or existing-condition records.",
  "Preferred makes, approved vendors, local supplier quotes, lead times, and logistics assumptions.",
  "Required bid format, taxes and duties treatment, completion period, and billing schedule template.",
];

const relatedSlugs = ["extra-claim", "clarification-submission", "price-variation"];

export function EstimationBillingServicePage() {
  const relatedServices = services.filter((service) => relatedSlugs.includes(service.slug));
  const mailto = `mailto:mashreqenterprises@gmail.com?subject=${encodeURIComponent("Turnkey estimation and billing schedule enquiry")}`;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-[2%]">
      <Link href="/services" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All services
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-3xl space-y-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a5730] dark:text-[#e2a678]">Tender support service</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Turnkey Estimation &amp; Billing Schedule</h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            A turnkey price has to cover what it will actually take to deliver the required project. We study the scope, visit the site, assess local conditions and availability, and build up the estimate around the work—not just around published schedule rates.
          </p>
          <p className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm font-semibold leading-6 text-foreground">
            One missed requirement, site constraint, or supply cost can materially reduce the project margin. A site visit is essential before the estimate is treated as complete.
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <a href={mailto} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#9a5730] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-[#874a28] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25">
              Discuss an estimate <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="tel:+919661221326" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background/80 px-5 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary">
              <Phone className="h-4 w-4" aria-hidden="true" /> Call +91 96612 21326
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="tender-pricing-types">
        <div className="max-w-3xl space-y-2">
          <h2 id="tender-pricing-types" className="text-2xl font-bold sm:text-3xl">Different turnkey formats need different estimates</h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">We adapt the cost build-up and billing structure to the tender documents instead of assuming every PSU tender uses the same BOQ format.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {tenderTypes.map(({ icon: Icon, title, text }) => (
            <article key={title} className="glass-card rounded-2xl border border-black/5 p-5 dark:border-white/10 sm:p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="estimate-method">
        <div className="max-w-3xl space-y-2">
          <h2 id="estimate-method" className="text-2xl font-bold sm:text-3xl">How we build the estimate</h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">DSR can inform a rate check, but it cannot by itself establish the cost of a site-specific turnkey project.</p>
        </div>
        <div className="glass-card rounded-2xl border border-black/5 p-6 dark:border-white/10 sm:p-8">
          <ol className="grid gap-5 sm:grid-cols-2">
            {estimateSteps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{index + 1}</span>
                <div><h3 className="text-sm font-bold">{step.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="glass-card rounded-2xl border border-black/5 p-6 dark:border-white/10 lg:col-span-3 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-bold"><MapPin className="h-5 w-5 text-primary" aria-hidden="true" />What the site visit checks</h2>
          <ul className="mt-4 space-y-3">
            {siteFactors.map(({ icon: Icon, text }) => <li key={text} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"><Icon className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{text}</li>)}
          </ul>
          <p className="mt-4 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">If a site visit or required data is unavailable, the estimate should state its assumptions, exclusions, and unresolved risks. An unverified desktop estimate should not be presented as a confirmed site-based price.</p>
        </div>
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h2 className="mb-2 font-bold">Information to prepare</h2>
            <ul className="space-y-2">
              {prepareList.map((item) => <li key={item} className="flex items-start gap-2 text-sm leading-5 text-muted-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{item}</li>)}
            </ul>
            <a href={mailto} className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-110">Request an estimation review <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
            <h3 className="mb-2 flex items-center gap-2 font-bold"><ShieldAlert className="h-4 w-4 text-amber-600" aria-hidden="true" />Scope note</h3>
            <p className="text-sm leading-6 text-muted-foreground">The estimate depends on the tender documents, site observations, supplier inputs, and stated assumptions. It is a decision-support document, not a guarantee of actual cost, project profit, or tender award. Confirm the final bid against the issued tender and your own commercial approval.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="related-services">
        <div><h2 id="related-services" className="text-2xl font-bold sm:text-3xl">Related services</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Use these services to resolve tender gaps and document changes during execution.</p></div>
        <div className="grid gap-3 sm:grid-cols-3">
          {relatedServices.map((service) => <Link key={service.slug} href={`/services/${service.slug}`} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-sm font-semibold transition hover:border-primary/40 hover:text-primary">{service.label}<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>)}
        </div>
      </section>
    </div>
  );
}
