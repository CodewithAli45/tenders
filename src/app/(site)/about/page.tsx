import type { Metadata } from "next";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  Cog,
  Compass,
  Factory,
  FileSpreadsheet,
  FileText,
  Gauge,
  HardHat,
  Layers,
  LineChart,
  Minimize2,
  MoveVertical,
  Scale,
  Scissors,
  Search,
  Target,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About GovTender Pro | Construction Tender Intelligence",
  description:
    "GovTender Pro helps contractors and tendering teams find, understand, analyse and manage construction tenders for PSU, EPC and infrastructure projects.",
};

const focusAreas = [
  {
    icon: Building2,
    title: "Civil",
    description:
      "Civil construction works including buildings, industrial structures, foundations, roads, infrastructure and related works.",
  },
  {
    icon: Layers,
    title: "Structural",
    description:
      "Structural steel, fabrication, erection, industrial structures and related engineering works.",
  },
  {
    icon: Cog,
    title: "Mechanical",
    description:
      "Mechanical equipment, piping, plant works, erection, maintenance and other industrial mechanical packages.",
  },
  {
    icon: Factory,
    title: "EPC",
    description:
      "Engineering, Procurement and Construction projects where several areas of work come together under one contract.",
  },
  {
    icon: Wrench,
    title: "Turnkey Projects",
    description:
      "Projects where the contractor is responsible for delivering a complete working facility or system.",
  },
];

const bidderQuestions = [
  "What exactly is the scope?",
  "Are we eligible?",
  "What is the actual size of the work?",
  "Which part of the project has the highest value?",
  "What does the BOQ contain?",
  "Which items may need detailed rate analysis?",
  "What are the important technical requirements?",
  "What are the payment terms?",
  "What are the major risks?",
  "How much time is available to prepare the bid?",
];

const approach = [
  {
    step: "01",
    title: "Find",
    icon: Search,
    description:
      "Search and discover tenders based on organisation, category, location, work type and other requirements.",
  },
  {
    step: "02",
    title: "Understand",
    icon: FileText,
    description:
      "Read the important information from the tender documents, including scope, eligibility, EMD, value, dates and other conditions.",
  },
  {
    step: "03",
    title: "Analyse",
    icon: LineChart,
    description:
      "Study the technical requirements, BOQ, quantities, weightage, commercial conditions and other details that can affect the bid.",
  },
  {
    step: "04",
    title: "Prepare",
    icon: Target,
    description:
      "Use the available information and tools to organise documents and prepare for the bidding process.",
  },
];

const boqInsights = [
  "Major work categories",
  "Quantity of each item",
  "Estimated value",
  "Category-wise value",
  "Percentage weightage",
  "Major cost items",
  "Material requirements",
  "Items that need detailed rate analysis",
];

const rawBoqItems = [
  { label: "RCC", quantity: "8,500 m³" },
  { label: "Structural Steel", quantity: "2,100 MT" },
  { label: "Piping", quantity: "4,500 MT" },
];

const boqSummary = [
  { label: "Civil", share: 28 },
  { label: "Structural", share: 24 },
  { label: "Mechanical", share: 31 },
  { label: "Piping", share: 12 },
  { label: "Other", share: 5 },
];

const assessmentJourney = [
  "Tender Discovery",
  "Eligibility",
  "Scope",
  "BOQ",
  "Commercial Terms",
  "Documents",
  "Assessment",
];

const documentTools = [
  { icon: Layers, label: "Merge PDF" },
  { icon: Scissors, label: "Split PDF" },
  { icon: MoveVertical, label: "Arrange Pages" },
  { icon: Minimize2, label: "Compress PDF" },
];

const audiences = [
  {
    icon: HardHat,
    title: "Contractors",
    description: "Find and study tenders that match your work area and experience.",
  },
  {
    icon: Users,
    title: "Tendering Teams",
    description: "Keep tender information, documents and assessment work organised.",
  },
  {
    icon: Factory,
    title: "EPC Contractors",
    description: "Review large technical and commercial tenders in a structured way.",
  },
  {
    icon: Building2,
    title: "Civil & Structural Contractors",
    description: "Focus on relevant construction and structural packages.",
  },
  {
    icon: Cog,
    title: "Mechanical Contractors",
    description: "Find industrial mechanical, equipment, piping and erection opportunities.",
  },
  {
    icon: Briefcase,
    title: "Project & Commercial Teams",
    description: "Review important tender conditions before moving towards bid preparation.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
        {eyebrow}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground sm:leading-tight">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto px-1 sm:px-2 pb-8">
        {/* ---- Hero ---- */}
        <section className="mt-8 space-y-6">
          <div className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            About GovTender Pro
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
            Construction Tender Intelligence for PSU, EPC &amp; Infrastructure Projects
          </h1>
          <div className="space-y-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
            <p>
              GovTender Pro is a platform built to help contractors and tendering
              teams find, understand, analyse and manage construction tenders in
              one place.
            </p>
            <p>
              We focus on Civil, Structural, Mechanical, EPC and Turnkey projects,
              with a special focus on tenders from PSUs, government organisations
              and large infrastructure companies.
            </p>
          </div>
        </section>

        <div className="mt-16 space-y-16">
          {/* ---- Our Purpose ---- */}
          <section className="space-y-6">
            <SectionHeading eyebrow="Our Purpose" title="Making Tender Work Easier" />
            <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
              <p>
                Finding a suitable tender is only the first step.
              </p>
              <p>
                A tender may contain hundreds of pages of technical documents,
                eligibility conditions, drawings, BOQs, price schedules, payment
                terms and other requirements. Going through all of this takes time,
                and an important condition can easily be missed.
              </p>
              <p>GovTender Pro is being built to make this work more organised.</p>
            </div>
            <div className="glass-card rounded-2xl border border-border p-6">
              <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                The aim is simple
              </p>
              <p className="mt-3 text-lg font-semibold text-foreground leading-relaxed">
                Help you find the right tender, understand what the tender
                requires, and prepare better before you decide to bid.
              </p>
            </div>
          </section>

          {/* ---- What We Focus On ---- */}
          <section className="space-y-6">
            <SectionHeading eyebrow="What We Focus On" title="Work Categories We Cover" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {focusAreas.map((area) => (
                <div
                  key={area.title}
                  className="glass-card rounded-2xl border border-border p-5 flex gap-4"
                >
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <area.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <h3 className="font-bold text-foreground">{area.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {area.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ---- More Than Just Tender Listing ---- */}
          <section className="space-y-6">
            <SectionHeading
              eyebrow="More Than Just Tender Listing"
              title="A Tender Document Tells You What the Client Wants. We Help You Understand the Opportunity."
            >
              <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
                A tender portal normally gives you the tender notice and its
                documents. But a bidder often needs to answer many more questions.
              </p>
            </SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {bidderQuestions.map((question) => (
                <div key={question} className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground leading-relaxed">
                    {question}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
              These are the areas where tender assessment and analysis become
              important. GovTender Pro brings these activities into one place.
            </p>
          </section>

          {/* ---- Our Tender Intelligence Approach ---- */}
          <section className="space-y-6">
            <SectionHeading
              eyebrow="Our Tender Intelligence Approach"
              title="Four Steps From Listing to Bid"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {approach.map((item) => (
                <div
                  key={item.step}
                  className="glass-card rounded-2xl border border-border p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-2xl font-bold text-primary/25">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ---- BOQ & Price Schedule Analysis ---- */}
          <section className="space-y-6">
            <SectionHeading
              eyebrow="BOQ &amp; Price Schedule Analysis"
              title="A BOQ Is More Than a Table of Quantities"
            >
              <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
                Tender documents may provide a BOQ or price schedule as a PDF or
                spreadsheet. But the raw BOQ does not always give a clear picture of
                the project.
              </p>
            </SectionHeading>
            <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
              For example, a large BOQ may contain hundreds or thousands of items. A
              bidder may need to understand:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {boqInsights.map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <FileSpreadsheet className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
              GovTender Pro turns this information into clear and useful tender
              analysis.
            </p>

            {/* Example: raw BOQ items vs BOQ summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-2xl border border-border bg-muted/40 p-5 space-y-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  Raw BOQ items
                </p>
                <div className="space-y-2 font-mono text-sm">
                  {rawBoqItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 border-b border-border/60 pb-2 last:border-0 last:pb-0"
                    >
                      <span className="text-foreground">{item.label}</span>
                      <span className="text-muted-foreground shrink-0">
                        {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Quantities alone do not show where the value sits.
                </p>
              </div>

              <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 space-y-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                  Boq summary
                </p>
                <div className="space-y-3">
                  {boqSummary.map((row) => (
                    <div key={row.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground font-medium">
                          {row.label}
                        </span>
                        <span className="font-mono font-bold text-primary">
                          {row.share}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-background overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${row.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A much faster understanding of where the major work and value may
                  be.
                </p>
              </div>
            </div>
          </section>

          {/* ---- Built From Practical Tender Experience ---- */}
          <section className="space-y-6">
            <SectionHeading
              eyebrow="Built From Practical Tender Experience"
              title="Designed for Real Tender Work"
            >
              <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
                GovTender Pro is built with a practical understanding of tendering
                and construction work. The focus is not simply on collecting tender
                notices — it is on understanding the information a contractor
                actually needs when deciding whether to study a tender further and
                prepare a bid.
              </p>
            </SectionHeading>
            <div className="glass-card rounded-2xl border border-border p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                {assessmentJourney.map((stage, index) => (
                  <div key={stage} className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold">
                      {stage}
                    </span>
                    {index < assessmentJourney.length - 1 && (
                      <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ---- Tender Document Tools ---- */}
          <section className="space-y-6">
            <SectionHeading
              eyebrow="Tender Document Tools"
              title="Prepare Your Documents Without Leaving the Platform"
            >
              <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
                Tender submission often requires documents to be merged, split or
                compressed before uploading them to a tender portal. GovTender Pro
                includes tools designed around common tender-document requirements.
              </p>
            </SectionHeading>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {documentTools.map((tool) => (
                <div
                  key={tool.label}
                  className="glass-card rounded-2xl border border-border p-4 flex flex-col items-center text-center gap-2.5"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {tool.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="glass-card rounded-2xl border border-border p-5 flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <Gauge className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-foreground">
                  Built around real submission limits
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  If a tender portal has a maximum file-size limit, a bidder may
                  need to reduce a large document before submission. Processing is
                  done directly in your browser, so files are handled locally and
                  are never uploaded to a server.
                </p>
              </div>
            </div>
          </section>

          {/* ---- Who Is GovTender Pro For ---- */}
          <section className="space-y-6">
            <SectionHeading
              eyebrow="Who Is GovTender Pro For?"
              title="Built Around the People Who Bid"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {audiences.map((audience) => (
                <div
                  key={audience.title}
                  className="glass-card rounded-2xl border border-border p-5 flex gap-4"
                >
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <audience.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <h3 className="font-bold text-foreground">
                      {audience.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {audience.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ---- Our Vision ---- */}
          <section className="space-y-6">
            <SectionHeading
              eyebrow="Our Vision"
              title="Better Tender Decisions Start With Better Information"
            >
              <div className="space-y-4 text-base text-muted-foreground leading-relaxed max-w-3xl">
                <p>
                  Every tender is different. Some are simple. Some contain hundreds
                  of pages. Some have complex eligibility conditions. Others have
                  large BOQs and detailed technical requirements.
                </p>
                <p>
                  Our goal is to make this information easier to find, organise,
                  understand and analyse. GovTender Pro will continue to develop
                  around the real needs of contractors and tendering professionals.
                </p>
              </div>
            </SectionHeading>
          </section>

          {/* ---- About MASHREQ ENTERPRISES ---- */}
          <section className="space-y-6">
            <SectionHeading
              eyebrow="About MASHREQ ENTERPRISES"
              title="Built by MASHREQ ENTERPRISES"
            />
            <div className="glass-card rounded-2xl border border-border p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-md shadow-primary/30">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">MASHREQ ENTERPRISES</p>
                  <p className="text-xs text-muted-foreground">
                    Construction, engineering &amp; tendering
                  </p>
                </div>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">
                MASHREQ ENTERPRISES works with a focus on construction, engineering,
                tendering and related business activities. GovTender Pro is being
                developed as a dedicated digital platform to bring practical tender
                knowledge and modern software together.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                The long-term goal is to build useful tools for the complete
                tendering journey — from finding an opportunity to preparing and
                managing the bid.
              </p>
            </div>
          </section>
        </div>

        {/* ---- Closing CTA ---- */}
        <section className="mt-16 rounded-3xl border border-primary/25 bg-primary/5 p-8 sm:p-10 text-center space-y-5">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Ready to explore construction tenders?
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Find tenders, study their requirements and organise your bidding work
              with GovTender Pro.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md shadow-primary/30 hover:opacity-90 transition-opacity"
            >
              Explore Live Tenders
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tender-document-tools"
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-3 rounded-xl border border-border bg-card text-foreground font-bold text-sm hover:border-primary hover:text-primary transition-colors"
            >
              <Scale className="h-4 w-4" />
              Explore Tender Tools
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
