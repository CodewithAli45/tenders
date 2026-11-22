import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Disclaimer | GovTender Pro",
  description:
    "GovTender Pro is an independent advisory and intelligence platform operated by MASHREQ ENTERPRISES, not a government portal or authority.",
};

function DisclaimerSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

export default function DisclaimerPage() {
  return (
    <article className="mx-auto w-full max-w-4xl space-y-8 p-[2%]">
      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">MASHREQ ENTERPRISES</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Disclaimer</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Please read this notice when using GovTender Pro or relying on information shown here.
        </p>
      </header>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm font-semibold leading-7">
        GovTender Pro, operated by MASHREQ ENTERPRISES, is an independent advisory and intelligence platform. It is not a government portal, department, procurement authority, or official tender publishing website.
      </div>

      <DisclaimerSection title="No government affiliation">
        <p>
          MASHREQ ENTERPRISES is an independent business. It is not affiliated with, endorsed by, or acting on behalf of any government, public-sector organization, tendering authority, or procurement portal. Names, logos, and marks belonging to third parties remain the property of their respective owners and are used only to identify them or their opportunities.
        </p>
      </DisclaimerSection>

      <DisclaimerSection title="Tender information and verification">
        <p>
          Tender notices, dates, values, eligibility summaries, status information, and related materials are provided for general information and may be compiled from public sources or supplied for analysis. Information can change, be incomplete, or contain errors. Always verify the current notice, corrigenda, eligibility, deadlines, and submission instructions in the issuing authority’s original documents and official portal before acting.
        </p>
      </DisclaimerSection>

      <DisclaimerSection title="Advisory services and outcomes">
        <p>
          Any guidance or support offered through this platform is independent advisory assistance. It is not an official interpretation, approval, or decision by a tendering authority. Using the platform or its services does not guarantee eligibility, bid acceptance, contract award, or any particular commercial result. Users remain responsible for their own submissions and decisions.
        </p>
      </DisclaimerSection>

      <DisclaimerSection title="External websites">
        <p>
          Links to government portals, documents, or other external websites are provided for convenience. MASHREQ ENTERPRISES does not control those websites and is not responsible for their availability, content, or policies.
        </p>
      </DisclaimerSection>

      <p className="border-t border-border pt-5 text-sm leading-6 text-muted-foreground">
        Questions about this notice can be sent to{" "}
        <a className="font-semibold text-primary underline underline-offset-2" href="mailto:mashreqenterprises@gmail.com">mashreqenterprises@gmail.com</a>.
      </p>
    </article>
  );
}
