import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  FileText,
  Mail,
  MessageSquareText,
  Phone,
  Ruler,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { services } from "@/lib/services";

const claimTypes = [
  {
    icon: FileSearch,
    title: "Work outside the original scope",
    text: "Additional work required to complete or operate the project but not described in the signed scope, specifications, or contract documents.",
  },
  {
    icon: Ruler,
    title: "Extra or varied quantities",
    text: "Measured quantities that exceed the BOQ, or work items whose quantities or descriptions have changed. Check the contract’s variation and measurement rules.",
  },
  {
    icon: ClipboardList,
    title: "New items or revised requirements",
    text: "Items arising from revised drawings, site instructions, changed specifications, or requirements that were not included in the priced BOQ.",
  },
  {
    icon: MessageSquareText,
    title: "Unrecorded instructions and impacts",
    text: "Work directed through correspondence or site instructions, and related time or cost impacts where the contract permits a claim and its notice requirements are met.",
  },
];

const processSteps = [
  {
    title: "Compare the documents",
    text: "Set the signed contract, BOQ, specifications, drawings, and later revisions side by side to identify what changed and when.",
  },
  {
    title: "Give notice and seek instruction",
    text: "Use the contract’s required notice channel and deadlines. Ask the authorised representative to confirm the instruction, scope, measurement method, and applicable rate before proceeding where practicable.",
  },
  {
    title: "Measure and keep evidence",
    text: "Maintain dated measurements, daily records, photographs, material and labour details, site entries, and correspondence while the work is happening.",
  },
  {
    title: "Submit and follow up",
    text: "Prepare a clause-linked claim with quantity calculations, rate build-up, supporting records, and a clear submission history. Track the response and any required resubmission.",
  },
];

const evidenceList = [
  "Signed agreement, applicable conditions, BOQ, specifications, and original drawings.",
  "Revised drawings, site instructions, minutes, emails, letters, and approval records.",
  "Joint measurements, measurement book entries, daily progress reports, and site registers.",
  "Dated photographs, labour and equipment records, delivery notes, and material invoices.",
  "Rate analysis, quantity calculations, notices, claim submissions, and acknowledgement of receipt.",
];

const relatedSlugs = ["clarification-submission", "estimation-billing-schedule", "price-variation"];

export function ExtraClaimsServicePage() {
  const relatedServices = services.filter((service) => relatedSlugs.includes(service.slug));
  const mailto = `mailto:mashreqenterprises@gmail.com?subject=${encodeURIComponent("Extra work claim enquiry")}`;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-[2%]">
      <Link href="/services" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All services
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-3xl space-y-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a5730] dark:text-[#e2a678]">Tender support service</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Extra Work Claims</h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Work carried out beyond the signed contract or BOQ can become difficult to value and recover if it is not identified, notified, measured, and claimed under the contract procedure. We help organise the contractual basis and contemporaneous evidence for extra items, quantity deviations, and instructed scope changes.
          </p>
          <p className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm font-semibold leading-6 text-foreground">
            Key point: extra work is not necessarily added to a bill automatically. If you do not formally notify and claim it with supporting records, it may never be assessed for payment.
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <a href={mailto} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#9a5730] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-[#874a28] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25">
              Discuss an extra work claim <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="tel:+919661221326" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background/80 px-5 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary">
              <Phone className="h-4 w-4" aria-hidden="true" /> Call +91 96612 21326
            </a>
          </div>
          <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            Extra work is not automatically payable just because it was performed. Entitlement, valuation, authorisation, notice deadlines, and payment depend on the signed contract and the facts. Raise the issue promptly and keep written records; do not rely only on verbal assurances.
          </p>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="claim-types">
        <div className="max-w-3xl space-y-2">
          <h2 id="claim-types" className="text-2xl font-bold sm:text-3xl">What may need an extra claim?</h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">The contract determines whether a change is a variation, a new item, or a separate claim. These are common situations to review against the actual contract.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {claimTypes.map(({ icon: Icon, title, text }) => (
            <article key={title} className="glass-card rounded-2xl border border-black/5 p-5 dark:border-white/10 sm:p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="claim-process">
        <div className="max-w-3xl space-y-2">
          <h2 id="claim-process" className="text-2xl font-bold sm:text-3xl">How we prepare the claim</h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">Build the record while the work is underway. Waiting until final billing can make instructions, quantities, rates, and deadlines harder to establish.</p>
        </div>
        <div className="glass-card rounded-2xl border border-black/5 p-6 dark:border-white/10 sm:p-8">
          <ol className="grid gap-5 sm:grid-cols-2">
            {processSteps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{index + 1}</span>
                <div><h3 className="text-sm font-bold">{step.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p></div>
              </li>
            ))}
          </ol>
          <p className="mt-6 flex items-start gap-2 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            If a revised work order or BOQ has not been issued, record the gap in writing and request formal direction and valuation. Follow the contract’s notice and approval procedure before carrying out changed work where practicable. Urgent safety or protection work should be documented and reported promptly under the applicable terms.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="glass-card rounded-2xl border border-black/5 p-6 dark:border-white/10 lg:col-span-3 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-bold"><FileText className="h-5 w-5 text-primary" aria-hidden="true" /> Records to gather</h2>
          <ul className="mt-4 space-y-3">
            {evidenceList.map((item) => <li key={item} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{item}</li>)}
          </ul>
          <p className="mt-4 flex items-start gap-2 border-t border-border pt-4 text-xs leading-5 text-muted-foreground"><Camera className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />Keep original dated records and proof of submission. Do not alter measurements, backdate notices, or present unsupported quantities.</p>
        </div>
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h2 className="mb-2 font-bold">Start with a document review</h2>
            <p className="text-sm leading-6 text-foreground/80">Share the contract, BOQ, relevant drawings or revisions, instructions, and the records available so far. We can map the change and confirm what information is missing.</p>
            <div className="mt-4 space-y-2 text-sm font-semibold">
              <a href={mailto} className="flex items-center gap-2 break-all hover:text-primary"><Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />mashreqenterprises@gmail.com</a>
              <a href="tel:+919661221326" className="flex items-center gap-2 hover:text-primary"><Phone className="h-4 w-4 text-primary" aria-hidden="true" />+91 96612 21326</a>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
            <h3 className="mb-2 flex items-center gap-2 font-bold"><AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />Scope and outcome</h3>
            <p className="text-sm leading-6 text-muted-foreground">We help prepare and organise claim documentation. We cannot promise that the employer will accept or pay a claim. The employer or contract administrator decides it under the contract; disputed claims may require separate professional or legal advice.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="related-services">
        <div><h2 id="related-services" className="text-2xl font-bold sm:text-3xl">Related services</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Extra work claims often connect with clarification, measurement, billing, and price adjustment records.</p></div>
        <div className="grid gap-3 sm:grid-cols-3">
          {relatedServices.map((service) => <Link key={service.slug} href={`/services/${service.slug}`} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-sm font-semibold transition hover:border-primary/40 hover:text-primary">{service.label}<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>)}
        </div>
      </section>
    </div>
  );
}
