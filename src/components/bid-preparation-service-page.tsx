import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileSearch,
  FileSignature,
  ListChecks,
  Mail,
  Phone,
  Scale,
  Send,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { BidPreparationEnquiryForm } from "@/components/bid-preparation-enquiry-form";
import { services } from "@/lib/services";

const includedItems = [
  {
    icon: FileSearch,
    title: "Tender Document Review",
    intro: "We start with the issued tender documents, not a generic bid template.",
    points: [
      "Review the NIT/IFB, instructions to bidders, GCC, SCC, technical specifications, eligibility criteria, and prescribed schedules.",
      "Identify submission deadlines, EMD, tender fees, mandatory documents, and rejection conditions.",
      "Create a requirement-wise bid checklist for the submission.",
      "Flag missing information and ambiguous requirements for clarification.",
    ],
  },
  {
    icon: ClipboardCheck,
    title: "Technical Bid Preparation",
    intro: "Evidence is organised and mapped to the qualification clauses that ask for it.",
    points: [
      "Organise work orders, completion certificates, and experience documents.",
      "Check turnover certificates, audited financial statements, and other financial eligibility evidence where required.",
      "Compile equipment, personnel, technical capability, and methodology documents where applicable.",
      "Map evidence against the relevant qualification clauses.",
      "We do not claim eligibility when the supporting evidence is insufficient.",
    ],
  },
  {
    icon: FileSignature,
    title: "Annexures, Undertakings and Affidavits",
    intro: "Prescribed formats are completed from information and approvals you provide.",
    points: [
      "Populate prescribed annexures, declarations, undertakings, and affidavit formats using client-provided information.",
      "Support power-of-attorney, non-blacklisting declarations, acceptance forms, and similar documents when required by the tender.",
      "Follow the exact format and wording prescribed in the bidding documents.",
      "Flag requirements for stamp paper, notarisation, attestation, CA certification, board resolutions, or authorised signatures.",
      "We never invent declarations, credentials, or signatures.",
    ],
  },
  {
    icon: Calculator,
    title: "Financial Bid and BOQ",
    intro: "The commercial file is checked for structure, arithmetic, and completeness.",
    points: [
      "Review BOQ items, quantities, units, pricing instructions, and arithmetic.",
      "Populate the prescribed BOQ using rates approved by the client.",
      "Check extensions, totals, taxes, and required fields where applicable.",
      "Preserve the original spreadsheet structure and mandatory file format.",
      "We do not invent rates, alter quantities, or make commercial assumptions without approval.",
      "Flag inconsistencies and items requiring clarification.",
    ],
  },
  {
    icon: Scale,
    title: "Commercial Compliance Review",
    intro: "Commercial conditions are separated into mandatory requirements and points for approval.",
    points: [
      "Check EMD/tender fee, bid validity, GST and tax declarations, price variation clauses, performance security, payment conditions, and other applicable commercial requirements.",
      "Identify deviations, missing forms, and conditions requiring client approval.",
      "Distinguish mandatory tender requirements from recommendations.",
      "We do not provide legal, tax, or CA certification services unless separately authorised and qualified.",
    ],
  },
  {
    icon: ListChecks,
    title: "Final Submission Checklist",
    intro: "The assembled package is checked against the tender checklist before handover.",
    points: [
      "Verify required documents against the tender checklist.",
      "Check signatures, seals, file names, formats, validity, and legibility.",
      "Check portal-specific upload requirements, DSC requirements, and bid submission instructions.",
      "Identify outstanding documents before submission.",
      "Explain that final submission and confirmation must be completed through the authorised bidder account unless a separate authorised arrangement is agreed.",
    ],
  },
];

const scopeBoundaries = [
  {
    icon: FileCheck2,
    title: "Document preparation",
    text: "We draft, compile, and check the bid package against the tender’s prescribed requirements and formats.",
  },
  {
    icon: BadgeCheck,
    title: "Eligibility assessment",
    text: "We map your evidence to the qualification clauses, but the tender authority evaluates eligibility. We do not claim eligibility where evidence is insufficient.",
  },
  {
    icon: Scale,
    title: "Statutory certification",
    text: "CA, tax, legal, notarisation, and attestation requirements remain with the authorised professional unless separately agreed and qualified.",
  },
  {
    icon: Send,
    title: "Portal submission",
    text: "Final submission and confirmation are completed through your authorised bidder account unless a separate authorised arrangement is agreed.",
  },
];

const processSteps = [
  {
    title: "Share the tender notice and complete bidding documents",
    text: "Send the NIT/IFB, all bidding documents, corrigenda, prescribed annexures, BOQ files, and any client instructions. We flag anything missing before work starts.",
  },
  {
    title: "Review the tender and prepare a clause-wise checklist",
    text: "We map the submission requirements, eligibility clauses, formats, and deadlines to the document or declaration that answers each one.",
  },
  {
    title: "Compile the required technical, financial, commercial and declaration documents",
    text: "We populate the prescribed formats using approved client information, organise the supporting evidence, and check the BOQ arithmetic and file formats.",
  },
  {
    title: "Check the package against the tender requirements and report outstanding items",
    text: "You receive the prepared package, the submission-readiness checklist, and a clear list of gaps, deviations, and points needing clarification or approval.",
  },
];

const deliverables = [
  "Tender compliance checklist.",
  "Technical bid document index.",
  "Prepared annexures and declarations.",
  "Organised technical supporting documents.",
  "Reviewed BOQ / financial bid file.",
  "Final submission-readiness checklist.",
  "List of missing documents, deviations, and clarification points.",
];

const relatedSlugs = ["registration", "price-variation", "clarification-submission"];

export function BidPreparationServicePage() {
  const relatedServices = services.filter((service) => relatedSlugs.includes(service.slug));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-[2%]">
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All services
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-3xl space-y-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a5730] dark:text-[#e2a678]">
            Tender support service
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Bid Preparation</h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Prepare a complete tender submission based on the tender notice, bidding documents,
            eligibility criteria, prescribed annexures and submission instructions. From technical
            qualification documents to financial bid schedules, every requirement is checked against
            the tender conditions.
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <a
              href="#enquiry"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#9a5730] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-[#874a28] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
            >
              Discuss your tender
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="tel:+919661221326"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background/80 px-5 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call +91 96612 21326
            </a>
          </div>
          <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            We prepare and check documents against the tender you provide. Qualification,
            certification, rejection risk, and award decisions remain with the tender authority. We
            do not guarantee qualification or award.
          </p>
        </div>
      </section>

      <section id="included" className="scroll-mt-32 space-y-4" aria-labelledby="included-heading">
        <div className="max-w-3xl space-y-2">
          <h2 id="included-heading" className="text-2xl font-bold sm:text-3xl">
            What&apos;s included
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            The scope follows the tender documents and supporting information you provide. Each
            activity below is completed against the actual clauses, prescribed formats, and
            submission instructions — not a generic template.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {includedItems.map(({ icon: Icon, title, intro, points }, index) => (
            <article
              key={title}
              className="glass-card flex h-full flex-col rounded-2xl border border-black/5 p-5 dark:border-white/10 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Part {index + 1} of 6
                  </p>
                  <h3 className="mt-0.5 text-base font-bold leading-snug">{title}</h3>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{intro}</p>
              <ul className="mt-4 space-y-2.5 border-t border-border pt-4">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="scope-heading">
        <div className="max-w-3xl space-y-2">
          <h2 id="scope-heading" className="text-2xl font-bold sm:text-3xl">
            Scope and responsibility
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Document preparation, eligibility assessment, statutory certification, and actual portal
            submission are separate responsibilities. We keep that distinction clear throughout the
            engagement.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {scopeBoundaries.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <h3 className="flex items-center gap-2 font-bold">
                <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>

        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
          <p className="flex items-start gap-2 text-sm font-semibold">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            Every output depends on what you provide.
          </p>
          <p className="mt-1.5 pl-6 text-sm leading-6 text-muted-foreground">
            We work from the tender documents, corrigenda, and supporting records supplied by the
            client. Incomplete, inconsistent, or outdated information can affect the bid. We report
            gaps and deviations, but we do not promise a rejection-free submission, automatic
            compliance, or award of the tender.
          </p>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="how-it-works">
        <div className="max-w-3xl space-y-2">
          <h2 id="how-it-works" className="text-2xl font-bold sm:text-3xl">
            How it works
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            A document-led process. You approve the information, rates, and declarations that go into
            the bid.
          </p>
        </div>

        <div className="glass-card rounded-2xl border border-black/5 p-6 dark:border-white/10 sm:p-8">
          <ol className="grid gap-5 sm:grid-cols-2">
            {processSteps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 flex items-start gap-2 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            We do not need your portal password, OTP, DSC PIN, private key, or access token. Final
            submission remains with your authorised bidder account unless a separate authorised
            arrangement is agreed.
          </p>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="deliverables-heading">
        <div className="max-w-3xl space-y-2">
          <h2 id="deliverables-heading" className="text-2xl font-bold sm:text-3xl">
            Deliverables
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Depending on the agreed scope, the package may include the following.
          </p>
        </div>

        <div className="glass-card rounded-2xl border border-black/5 p-6 dark:border-white/10 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <ListChecks className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-bold">A submission-ready package</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Deliverables vary according to the agreed scope, the tender requirements, and the
                documents available from the client. They are not a guarantee of qualification.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-3">
              {deliverables.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="enquiry" className="scroll-mt-32 space-y-4" aria-labelledby="enquiry-heading">
        <div className="max-w-3xl space-y-2">
          <h2 id="enquiry-heading" className="text-2xl font-bold sm:text-3xl">
            Discuss Your Tender
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Share the tender documents and tell us which parts of the bid you need help preparing.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="glass-card rounded-2xl border border-black/5 p-6 dark:border-white/10 lg:col-span-3">
            <BidPreparationEnquiryForm />
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="glass-card rounded-2xl border border-black/5 p-5 dark:border-white/10">
              <h3 className="mb-2 flex items-center gap-2 font-bold">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                What to share
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                After we confirm the scope, we usually ask for:
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  "NIT/IFB and the complete bidding documents.",
                  "All corrigenda, addenda, and clarification replies.",
                  "Prescribed annexures, declarations, and BOQ files.",
                  "Eligibility, experience, and financial supporting records.",
                  "Client-approved rates and any specific submission instructions.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
                This enquiry form does not accept document uploads. We will confirm a secure way to
                share the files after the scope is agreed.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
              <h3 className="mb-2 flex items-center gap-2 font-bold">
                <ShieldAlert className="h-4 w-4 text-amber-600" aria-hidden="true" />
                Do not send credentials
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Do not share portal passwords, OTPs, DSC PINs or private keys, access tokens, or
                confidential tender credentials through this form.
              </p>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="mb-2 font-bold">Prefer to talk?</h3>
              <p className="text-sm leading-6 text-foreground/80">
                Call or email us with the tender organisation, reference number, and submission
                deadline.
              </p>
              <div className="mt-3 space-y-2 text-sm font-semibold">
                <a href="tel:+919661221326" className="flex items-center gap-2 hover:text-primary">
                  <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                  +91 96612 21326
                </a>
                <a href="mailto:mashreqenterprises@gmail.com" className="flex items-center gap-2 break-all hover:text-primary">
                  <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  mashreqenterprises@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="related-services">
        <div className="max-w-3xl space-y-2">
          <h2 id="related-services" className="text-2xl font-bold sm:text-3xl">
            Related services
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Bid preparation often connects to registration, price variation, and pre-bid
            clarifications. These services cover those steps.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {relatedServices.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-bold group-hover:text-primary">{service.label}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-6 text-muted-foreground">{service.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#9a5730] dark:text-[#e2a678]">
                  View service
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <p className="flex items-start gap-2 px-1 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        Tender requirements can change through corrigenda. Always check the latest issued documents
        before submission. Preparation support does not replace the tender authority’s evaluation or
        your own commercial decisions.
      </p>
    </div>
  );
}
