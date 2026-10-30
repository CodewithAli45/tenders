import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  Factory,
  FileCheck2,
  Globe2,
  KeyRound,
  Landmark,
  LayoutGrid,
  Mail,
  MapPin,
  MessageSquare,
  Mountain,
  Phone,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  TrainFront,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { RegistrationEnquiryForm } from "@/components/registration-enquiry-form";
import { services } from "@/lib/services";

const portalGroups = [
  {
    icon: Landmark,
    title: "CPPP and NIC eProcurement / eTender",
    description:
      "The Central Public Procurement Portal publishes central tenders and links to participating buyer systems. The NIC eProcurement system is used by many central departments and attached offices for their own tenders.",
    links: [
      { label: "CPPP", note: "Central Public Procurement Portal", href: "https://eprocure.gov.in/cppp/" },
      { label: "NIC eProcurement", note: "Government eProcurement System", href: "https://etenders.gov.in/eprocure/app" },
    ],
  },
  {
    icon: ShoppingBag,
    title: "Government e-Marketplace (GeM)",
    description:
      "GeM handles seller registration, verification, catalogue listings, and order participation through its own seller account and approval process.",
    links: [{ label: "GeM", note: "Government e-Marketplace", href: "https://gem.gov.in/" }],
  },
  {
    icon: Mountain,
    title: "Coal India eProcurement",
    description:
      "Coal India and its subsidiaries publish tenders and vendor registration requirements on the Coal India eProcurement system.",
    links: [{ label: "Coal India eProcurement", note: "Coal India Limited", href: "https://coalindiatenders.nic.in/nicgep/app" }],
  },
  {
    icon: Zap,
    title: "NTPC eProcurement",
    description:
      "NTPC publishes its tender notices, vendor registration, and bid submission routes on the NTPC Tender Portal.",
    links: [{ label: "NTPC Tender Portal", note: "NTPC Limited", href: "https://ntpctender.ntpc.co.in/" }],
  },
  {
    icon: Factory,
    title: "BHEL eProcurement",
    description:
      "BHEL uses its eProcurement portal for tender publication, vendor enrolment, and online bid submission.",
    links: [{ label: "BHEL eProcurement", note: "Bharat Heavy Electricals Limited", href: "https://eprocurebhel.co.in/" }],
  },
  {
    icon: Factory,
    title: "SAIL eProcurement",
    description:
      "SAIL tenders, vendor registration, and bid submission are handled through the SAIL Tenders portal.",
    links: [{ label: "SAIL Tenders", note: "Steel Authority of India Limited", href: "https://sailtenders.co.in/" }],
  },
  {
    icon: TrainFront,
    title: "Indian Railways IREPS",
    description:
      "IREPS is the Indian Railways e-procurement system for works, goods, and services. Vendor registration and bid participation follow Railway Board requirements.",
    links: [{ label: "IREPS", note: "Indian Railways E-Procurement System", href: "https://ireps.gov.in/" }],
  },
  {
    icon: LayoutGrid,
    title: "TenderWizard-enabled organisations",
    description:
      "Some organisations use TenderWizard or a similar platform for all or part of their procurement. We confirm the current portal and registration route on the buyer’s own tender page before starting.",
    links: [
      { label: "TenderWizard", note: "Procurement platform", href: "https://www.tenderwizard.com/" },
      { label: "MECON", note: "MECON Limited", href: "https://www.meconlimited.co.in/" },
      { label: "CPWD eTenders", note: "Central Public Works Department", href: "https://etender.cpwd.gov.in/" },
      { label: "ISRO Tenders", note: "Indian Space Research Organisation", href: "https://www.isro.gov.in/Tenders.html" },
    ],
  },
  {
    icon: MapPin,
    title: "State government e-procurement portals",
    description:
      "State portals are separate from central systems, and each state sets its own vendor registration, fees, and category requirements. Examples include Maharashtra, Uttar Pradesh, Karnataka, and Kerala.",
    links: [
      { label: "Maharashtra", note: "mahatenders.gov.in", href: "https://mahatenders.gov.in/" },
      { label: "Uttar Pradesh", note: "etender.up.nic.in", href: "https://etender.up.nic.in/" },
      { label: "Karnataka", note: "eproc.karnataka.gov.in", href: "https://eproc.karnataka.gov.in/" },
      { label: "Kerala", note: "etenders.kerala.gov.in", href: "https://etenders.kerala.gov.in/" },
    ],
  },
];

const supportItems = [
  {
    icon: Globe2,
    title: "Identify the correct portal",
    text: "We read the tender or buyer instructions and confirm which portal, registration type, and category actually apply to your business.",
  },
  {
    icon: ClipboardList,
    title: "Review business details",
    text: "We check entity type, address, contact details, PAN and GST information, and Udyam records for consistency before you enter them.",
  },
  {
    icon: FileCheck2,
    title: "Organise documents",
    text: "We map the portal’s checklist to the records you hold and flag missing, expired, or inconsistent files before submission.",
  },
  {
    icon: KeyRound,
    title: "Guide portal-specific steps",
    text: "We walk through account creation, profile completion, category selection, declarations, and the portal’s verification steps.",
  },
  {
    icon: MessageSquare,
    title: "Follow up on objections",
    text: "If the portal raises a query or rejects a detail, we help interpret the response and prepare the correction or clarification.",
  },
  {
    icon: Building2,
    title: "Profile updates and renewal",
    text: "Where the portal supports it, we help keep vendor details, categories, and registration validity current.",
  },
];

const checklist = [
  "Business email address and mobile number that the portal can verify.",
  "PAN and GST details, where applicable to your business and the portal.",
  "MSME / Udyam details, if you are registered.",
  "Registered business address and current contact details.",
  "Business constitution or type — proprietorship, partnership, LLP, company, or other applicable form.",
  "Proprietor, partner, or director details, as applicable to your constitution.",
  "Authorised contact person’s details and any identity information the portal specifically asks for.",
  "DSC status and the portal-specific digital signature requirements.",
];

const faqs = [
  {
    question: "Does registration on one portal cover other portals?",
    answer:
      "No. Each portal issues its own vendor account. Registration on CPPP, GeM, a PSU portal, or a state portal does not automatically create an account on any other portal. Even where the same organisation appears on more than one platform, you may need separate enrolment or profile verification.",
  },
  {
    question: "Do you guarantee registration or approval?",
    answer:
      "No. We assist with preparation, portal steps, and follow-up. The portal or buying organisation decides whether to approve a vendor registration, category, or profile. We do not promise guaranteed registration, instant approval, or eligibility for any tender.",
  },
  {
    question: "Is Aadhaar mandatory for registration?",
    answer:
      "Not universally. Some portals ask for identity or verification details for the authorised person, and the exact requirement depends on the portal and your business constitution. We do not ask for Aadhaar or PAN copies in the general enquiry form.",
  },
  {
    question: "Do I need a Digital Signature Certificate (DSC)?",
    answer:
      "It depends on the portal and your role. Many government e-tender portals require a suitable Class 3 DSC, often with signing and encryption capability. GeM’s registration process differs. Check the current instructions on the specific portal before buying or configuring a DSC.",
  },
  {
    question: "How long does registration take?",
    answer:
      "Processing time depends on the portal, the registration type, and the verification the buyer performs. Some registrations complete online; others need document verification or offline approval. DSC setup and testing can add time. We do not promise a fixed or 24-hour turnaround.",
  },
  {
    question: "Will you need my password, OTP, or DSC private key?",
    answer:
      "No. You should never share portal passwords, OTPs, DSC PINs, private keys, or access tokens with anyone. We guide you while you retain control of your account and sign-in credentials.",
  },
  {
    question: "Can a business register without GST?",
    answer:
      "Some portals allow registration with a declaration, while others require a GSTIN for the relevant category or turnover. The rule depends on the portal, the goods or services, and your business constitution. We confirm the current requirement from the portal’s published instructions.",
  },
  {
    question: "Do you help with renewal or profile changes?",
    answer:
      "Yes, where the portal supports it. That can include updating address, contact person, bank details, categories, or validity. The portal’s own rules and verification process still apply.",
  },
];

const relatedSlugs = ["price-variation", "bid-preparation", "clarification-submission"];

export function RegistrationServicePage() {
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
            Tender support service · India
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Government Tender Portal Registration
          </h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Get your business ready to participate in government tenders. We help you identify the
            correct portal, prepare the required business details and documents, and complete the
            registration process.
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <a
              href="#enquiry"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#9a5730] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-[#874a28] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
            >
              Start a registration enquiry
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
          <p className="text-xs leading-5 text-muted-foreground">
            We help you prepare and complete the application. Registration approval, vendor status,
            and category decisions remain with the portal or buying organisation.
          </p>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="portal-coverage">
        <div className="max-w-3xl space-y-2">
          <h2 id="portal-coverage" className="text-2xl font-bold sm:text-3xl">
            Portal coverage
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            We work on the portal named in the tender or confirmed by the buying organisation. These
            are the portals contractors most often ask us about, with links to their official
            websites.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 sm:p-5">
          <p className="flex items-start gap-2 text-sm font-semibold">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            Registration is portal-specific.
          </p>
          <p className="mt-1.5 pl-6 text-sm leading-6 text-muted-foreground">
            Enrolling on one portal does not register your business on another. Different departments
            and PSUs may have separate registration, verification, category, and renewal
            requirements, even when they use the same platform.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {portalGroups.map(({ icon: Icon, title, description, links }) => (
            <article
              key={title}
              className="glass-card flex h-full flex-col rounded-2xl border border-black/5 p-5 dark:border-white/10"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="pt-1.5 text-sm font-bold leading-snug">{title}</h3>
              </div>
              <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
              <ul className="mt-4 space-y-2 border-t border-border pt-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-start gap-1.5 text-xs font-semibold text-foreground transition hover:text-primary"
                    >
                      <span>
                        {link.label}
                        <span className="block text-[11px] font-normal text-muted-foreground">
                          {link.note}
                        </span>
                      </span>
                      <ExternalLink
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:text-primary"
                        aria-hidden="true"
                      />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="text-xs leading-5 text-muted-foreground">
          Portal addresses, fees, and document requirements can change. Use the instructions published
          by the portal or buyer for the specific tender; the links above are starting points, not a
          guarantee that a particular registration route is currently open.
        </p>
      </section>

      <section className="space-y-4" aria-labelledby="what-we-help-with">
        <div className="max-w-3xl space-y-2">
          <h2 id="what-we-help-with" className="text-2xl font-bold sm:text-3xl">
            What we help with
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            This is practical registration assistance — not a consultancy report and not a promise of
            enrolment. The scope depends on the portal, your business, and the category you want to
            register for.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {supportItems.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="glass-card rounded-2xl border border-black/5 p-5 dark:border-white/10"
            >
              <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mb-2 font-bold">{title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
            <h3 className="mb-2 flex items-center gap-2 font-bold">
              <BadgeCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              Assistance, not approval
            </h3>
            <p className="text-sm leading-6 text-foreground/80">
              We help you understand the process and present a complete application. The portal or
              buying organisation decides whether the registration is accepted and which categories
              are approved.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-2 flex items-center gap-2 font-bold">
              <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
              Your account stays yours
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              You retain control of portal credentials, OTPs, and DSC tokens. We do not create or
              certify statutory records, decide eligibility, or hold your login and signing
              credentials.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="documents-required">
        <div className="max-w-3xl space-y-2">
          <h2 id="documents-required" className="text-2xl font-bold sm:text-3xl">
            Documents and information required
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Exact requirements depend on the portal, the buyer, and your business constitution. Use
            this checklist as a practical starting point, then confirm the current list on the target
            portal.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-5">
          <div className="glass-card space-y-4 rounded-2xl border border-black/5 p-6 dark:border-white/10 lg:col-span-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <ClipboardList className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-bold">Registration checklist</h3>
                <p className="text-xs text-muted-foreground">Prepare these before you start the portal application.</p>
              </div>
            </div>
            <ul className="space-y-3">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="glass-card rounded-2xl border border-black/5 p-5 dark:border-white/10">
              <h3 className="mb-2 font-bold">Requirements vary by business type</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                A proprietorship, partnership, LLP, and company do not submit the same owner or
                signatory records. Aadhaar or other identity documents are not required universally;
                use only what the specific portal asks for.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
              <h3 className="mb-2 flex items-center gap-2 font-bold">
                <ShieldAlert className="h-4 w-4 text-amber-600" aria-hidden="true" />
                Keep sensitive records private
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Do not send PAN or Aadhaar copies, DSC private keys, DSC PINs, portal passwords, OTPs,
                or access tokens through the enquiry form. Share documents only through the portal or
                an agreed secure method.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card space-y-3 rounded-2xl border border-black/5 p-6 dark:border-white/10">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <KeyRound className="h-5 w-5 text-primary" aria-hidden="true" />
            Digital Signature Certificate (DSC) guidance
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Class 3 DSC requirements vary by portal and by user role. Many government e-tender portals
            require a suitable DSC, often with both signing and encryption functionality. GeM’s
            registration process is different, so do not assume that every portal has the same DSC
            requirement.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            A newly issued DSC may need configuration and a test signing before you submit a bid.
            Token drivers, browser settings, and portal registration of the certificate can take time
            to verify. Check the target portal’s current DSC instructions, and do not rely on a
            universal 24-hour completion time.
          </p>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="how-it-works">
        <div className="max-w-3xl space-y-2">
          <h2 id="how-it-works" className="text-2xl font-bold sm:text-3xl">
            How the process works
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            A short, guided sequence. You review and approve the details before anything is submitted
            in your name.
          </p>
        </div>

        <div className="glass-card rounded-2xl border border-black/5 p-6 dark:border-white/10 sm:p-8">
          <ol className="grid gap-5 sm:grid-cols-2">
            {[
              {
                title: "Select the target portal",
                text: "Tell us the portal, buyer, or tender reference. We confirm the current registration route and the category that fits your business.",
              },
              {
                title: "Review business details and document readiness",
                text: "We check entity details, contact information, GST and Udyam status, and the documents the portal expects for your constitution.",
              },
              {
                title: "Complete the portal-specific registration steps",
                text: "We guide account creation, profile completion, declarations, and submission. You retain control of logins, OTPs, and your DSC.",
              },
              {
                title: "Check the portal’s response and resolve objections",
                text: "We help you read the status, understand any query, and prepare the correction or clarification the portal asks for.",
              },
            ].map((step, index) => (
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
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            Processing time depends on the portal and its verification requirements. Some
            registrations complete online, while others need document verification or offline
            approval. We do not promise instant registration or a fixed completion date.
          </p>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="faq">
        <div className="max-w-3xl space-y-2">
          <h2 id="faq" className="text-2xl font-bold sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Common questions about portal registration, documents, and what this service can and
            cannot do.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-border bg-card p-0 shadow-sm transition open:border-primary/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-5 pb-5 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="enquiry" className="scroll-mt-32 space-y-4" aria-labelledby="enquiry-heading">
        <div className="max-w-3xl space-y-2">
          <h2 id="enquiry-heading" className="text-2xl font-bold sm:text-3xl">
            Registration enquiry
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Share the basics and we will confirm the portal checklist and next steps. Fields marked
            with <span className="font-semibold text-[#9a5730] dark:text-[#e2a678]">*</span> are required.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="glass-card rounded-2xl border border-black/5 p-6 dark:border-white/10 lg:col-span-3">
            <RegistrationEnquiryForm />
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="glass-card rounded-2xl border border-black/5 p-5 dark:border-white/10">
              <h3 className="mb-3 flex items-center gap-2 font-bold">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                What happens next
              </h3>
              <ol className="space-y-3">
                {[
                  "We confirm the portal, registration type, and scope of assistance.",
                  "We share the current checklist and flag the gaps in your records.",
                  "You decide whether to proceed; nothing is submitted in your name without your approval.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="mb-2 font-bold">Prefer to talk?</h3>
              <p className="text-sm leading-6 text-foreground/80">
                Call or email us with the portal name and your business type.
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

            <div className="rounded-2xl border border-border bg-card p-5 text-xs leading-5 text-muted-foreground">
              The enquiry form does not upload documents. Do not send PAN or Aadhaar copies, DSC PINs
              or private keys, passwords, OTPs, or access tokens.
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
            Registration is usually one part of a longer tender process. These services pick up where
            registration leaves off.
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

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <p className="max-w-2xl text-sm leading-6 text-foreground/80">
            Not sure which portal or service you need? Send us the tender reference and we will point
            you to the right starting point.
          </p>
          <a
            href="#enquiry"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#9a5730] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#874a28]"
          >
            Ask us
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      <p className="flex items-start gap-2 px-1 text-xs leading-5 text-muted-foreground">
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Portal rules, fees, and document requirements can change. The current instructions published
        by the portal or buying organisation govern each application.
      </p>
    </div>
  );
}
