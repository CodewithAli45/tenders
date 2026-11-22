import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacy Policy | GovTender Pro",
  description:
    "Learn how GovTender Pro and MASHREQ ENTERPRISES handle site information, email enquiries, cookies, and Google AdSense advertising.",
};

function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto w-full max-w-4xl space-y-8 p-[2%]">
      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">MASHREQ ENTERPRISES</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          This policy explains how information may be handled when you use GovTender Pro.
        </p>
      </header>

      <PolicySection title="Information handled by the site">
        <p>
          GovTender Pro displays tender, organization, and related procurement information. The site may process technical request information needed to deliver pages, protect the service, and diagnose errors. Public pages can be viewed without creating an account.
        </p>
        <p>
          Enquiry forms on this site prepare a message in your device’s email application. The message is sent only if you choose to send it; its contents are then handled by your email provider and MASHREQ ENTERPRISES to respond to your enquiry.
        </p>
      </PolicySection>

      <PolicySection title="Service providers and stored records">
        <p>
          Tender records, related documents, and site administration data are hosted using third-party infrastructure providers, including Supabase. Some tender and bid-result information is published for visitors to view. We use these providers to operate the platform and do not control their independent security or privacy practices; their own terms and policies also apply.
        </p>
      </PolicySection>

      <PolicySection title="Cookies and Google AdSense">
        <p>
          This site uses Google AdSense advertising code. Google and other third-party advertising vendors may use cookies, web beacons, IP addresses, or similar identifiers to serve, measure, and improve ads. Depending on your settings, advertising cookies may be used to show ads based on visits to this site or other sites.
        </p>
        <p>
          You can manage personalized advertising through <a className="font-semibold text-primary underline underline-offset-2" href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>. You can also manage or block cookies in your browser settings. Blocking cookies may affect advertising and some site features. For more detail, read <a className="font-semibold text-primary underline underline-offset-2" href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">how Google uses information from sites or apps that use its services</a>.
        </p>
        <p>
          Google’s use of advertising cookies is subject to Google’s policies and the settings available in your region. Where applicable, consent for advertising cookies and personalized ads is handled in accordance with relevant legal requirements and Google’s consent tools.
        </p>
      </PolicySection>

      <PolicySection title="How information is used and shared">
        <p>
          Information provided in an enquiry is used to understand and respond to that request. Technical information may be used to operate, secure, and maintain the site. Google and its advertising partners may process information as described in their own privacy and advertising policies when ads are requested or displayed.
        </p>
        <p>
          We do not sell enquiry details. Information may be disclosed when necessary to operate the service, respond to a lawful request, protect rights and safety, or comply with applicable law.
        </p>
      </PolicySection>

      <PolicySection title="Your choices and contact">
        <p>
          You may choose not to send an enquiry, adjust browser cookie settings, or use Google’s advertising controls. For privacy questions or requests concerning an enquiry sent to us, contact MASHREQ ENTERPRISES at{" "}
          <a className="font-semibold text-primary underline underline-offset-2" href="mailto:mashreqenterprises@gmail.com">mashreqenterprises@gmail.com</a>.
        </p>
      </PolicySection>

      <p className="border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
        Google requires publishers to disclose the use of advertising cookies and third-party ad technologies in a privacy policy. See Google AdSense’s{" "}
        <a className="font-semibold text-primary underline underline-offset-2" href="https://support.google.com/adsense/answer/1348695" target="_blank" rel="noopener noreferrer">required content guidance</a>.
      </p>
    </article>
  );
}
