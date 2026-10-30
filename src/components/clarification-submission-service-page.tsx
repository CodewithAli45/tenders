import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileSearch,
  ListChecks,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  ShieldAlert,
  ShieldCheck,
  Table2,
} from "lucide-react";
import Link from "next/link";
import { services } from "@/lib/services";

const includedItems = [
  {
    icon: FileSearch,
    title: "Tender review",
    text: "Review tender clauses, technical specifications, BOQ items and commercial conditions requiring clarification.",
  },
  {
    icon: MessageSquareText,
    title: "Query drafting",
    text: "Draft clear queries with relevant clause references and supporting explanations.",
  },
  {
    icon: Table2,
    title: "Clarification schedule",
    text: "Prepare the clarification schedule in the prescribed format, such as Excel or the authority's template.",
  },
  {
    icon: ListChecks,
    title: "Submission check",
    text: "Check the query schedule against submission instructions and deadlines.",
  },
];

const processSteps = [
  {
    title: "Share your questions",
    text: "Send the tender documents and the points you want clarified, along with any deadline or format instructions you already have.",
  },
  {
    title: "Review and drafting",
    text: "We review the relevant clauses, specifications, and BOQ items, then draft clause-referenced queries with supporting explanations.",
  },
  {
    title: "Approval and submission",
    text: "You review and approve the final schedule, which is submitted through the prescribed channel before the clarification deadline.",
  },
];

const whatToSend = [
  "The complete tender documents, including the NIT/IFB and any corrigenda.",
  "The clauses, specifications, or BOQ items you want clarified.",
  "The authority's clarification format or schedule template, if prescribed.",
  "The clarification deadline and submission instructions.",
];

const relatedSlugs = ["bid-preparation", "registration", "price-variation"];

export function ClarificationSubmissionServicePage() {
  const relatedServices = services.filter((service) => relatedSlugs.includes(service.slug));
  const mailto = `mailto:mashreqenterprises@gmail.com?subject=${encodeURIComponent(
    "Clarification submission enquiry",
  )}`;

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
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Clarification Submission</h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Get help preparing clear, clause-specific queries to resolve ambiguities in tender
            conditions, technical specifications, BOQ items and commercial requirements before the
            clarification deadline.
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <a
              href={mailto}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#9a5730] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-[#874a28] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
            >
              Start a clarification enquiry
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
            We help draft and format the queries. The authority decides whether to answer or amend
            the tender, and submission through the prescribed channel and deadline remains with the
            bidder unless a separate authorised arrangement is agreed.
          </p>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="included-heading">
        <div className="max-w-3xl space-y-2">
          <h2 id="included-heading" className="text-2xl font-bold sm:text-3xl">
            What&apos;s included
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Queries are drafted from the issued tender documents, so each one points to the clause,
            specification, or BOQ item it refers to.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {includedItems.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="glass-card flex h-full flex-col rounded-2xl border border-black/5 p-5 dark:border-white/10 sm:p-6"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="how-it-works">
        <div className="max-w-3xl space-y-2">
          <h2 id="how-it-works" className="text-2xl font-bold sm:text-3xl">
            How it works
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            A short review cycle. You approve the final wording before anything is submitted.
          </p>
        </div>

        <div className="glass-card rounded-2xl border border-black/5 p-6 dark:border-white/10 sm:p-8">
          <ol className="grid gap-5 sm:grid-cols-3">
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
            Clarification queries must reach the authority before its stated deadline. Late or
            incorrectly formatted queries may not be considered.
          </p>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="enquiry-heading">
        <div className="max-w-3xl space-y-2">
          <h2 id="enquiry-heading" className="text-2xl font-bold sm:text-3xl">
            Discuss Your Clarifications
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Send the tender documents and the points you want clarified. We will confirm the scope
            and the deadline before starting.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="glass-card rounded-2xl border border-black/5 p-6 dark:border-white/10 lg:col-span-3">
            <h3 className="mb-2 flex items-center gap-2 font-bold">
              <Send className="h-4 w-4 text-primary" aria-hidden="true" />
              What to share
            </h3>
            <ul className="mt-3 space-y-2">
              {whatToSend.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
              Do not send portal passwords, OTPs, DSC PINs or private keys, access tokens, or
              confidential tender credentials. We will confirm a secure way to share documents after
              the scope is agreed.
            </p>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="mb-2 font-bold">Prefer to talk?</h3>
              <p className="text-sm leading-6 text-foreground/80">
                Call or email us with the tender organisation, reference number, and clarification
                deadline.
              </p>
              <div className="mt-3 space-y-2 text-sm font-semibold">
                <a href="tel:+919661221326" className="flex items-center gap-2 hover:text-primary">
                  <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                  +91 96612 21326
                </a>
                <a
                  href="mailto:mashreqenterprises@gmail.com"
                  className="flex items-center gap-2 break-all hover:text-primary"
                >
                  <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  mashreqenterprises@gmail.com
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
              <h3 className="mb-2 flex items-center gap-2 font-bold">
                <ShieldAlert className="h-4 w-4 text-amber-600" aria-hidden="true" />
                Scope note
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                We do not guarantee that a query will be answered, accepted, or result in an
                amendment. The tender authority decides what clarifications to issue and whether to
                extend any deadline.
              </p>
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
            Clarifications often feed into bid preparation, portal registration, and price variation
            claims.
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
                  <ArrowUpRight
                    className="h-4 w-4 text-muted-foreground transition group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-4 font-bold group-hover:text-primary">{service.label}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-6 text-muted-foreground">
                  {service.summary}
                </p>
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
        Tender requirements can change through corrigenda and clarification replies. Always check
        the latest issued documents before submission.
      </p>
    </div>
  );
}
