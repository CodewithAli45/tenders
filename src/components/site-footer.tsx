import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-border bg-card/40 xl:ml-70">
      <div className="w-full px-[4%] md:px-[6%] py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/icons/icon-192.png"
                alt="GovTender Pro"
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl object-cover shadow-md shadow-[#b86b35]/30"
              />
              <span className="text-base font-extrabold tracking-tight text-foreground">
                GovTender{" "}
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold uppercase tracking-wider">
                  Pro
                </span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Real-time Government Tender Management for EPC, Turnkey &amp; PSU
              Infrastructure projects. Find, track and win tenders with
              intelligent bidding intelligence.
            </p>
            <p className="text-sm font-semibold text-foreground/80 pt-1 border-t border-border/60">
              GovTender Pro is a product of{" "}
              <span className="font-extrabold text-foreground">
                MASHREQ ENTERPRISES
              </span>
            </p>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/tenders/live"
                  className="hover:text-primary transition-colors"
                >
                  Live Tenders
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/calculator"
                  className="hover:text-primary transition-colors"
                >
                  EMD Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/tender-document-tools"
                  className="hover:text-primary transition-colors"
                >
                  Tender Document Tools
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-foreground mb-4">
              Our Services
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-muted-foreground">
              <li>
                <Link
                  href="/services/registration"
                  className="hover:text-primary transition-colors"
                >
                  Vendor Registration
                </Link>
              </li>
              <li>
                <Link
                  href="/services/cost-estimation"
                  className="hover:text-primary transition-colors"
                >
                  Cost Estimation
                </Link>
              </li>
              <li>
                <Link
                  href="/services/bid-preparation"
                  className="hover:text-primary transition-colors"
                >
                  Bid Preparation
                </Link>
              </li>
              <li>
                <Link
                  href="/services/contract-finalization"
                  className="hover:text-primary transition-colors"
                >
                  Contract Finalization
                </Link>
              </li>
              <li>
                <Link
                  href="/services/billing-schedule"
                  className="hover:text-primary transition-colors"
                >
                  Billing Schedule
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-foreground mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm font-semibold text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <a
                  href="tel:+919661221326"
                  className="hover:text-primary transition-colors"
                >
                  +91 96612 21326
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:mashreqenterprises@gmail.com"
                  className="hover:text-primary transition-colors"
                >
                  mashreqenterprises@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  India — Serving EPC, Turnkey &amp; PSU clients nationwide
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-5 px-[4%] md:px-[6%] flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">
          © 2026 MASHREQ ENTERPRISES. All rights reserved.
        </p>
        <p className="text-xs font-semibold text-muted-foreground">
          Real-time Government Tender Intelligence Platform
        </p>
      </div>
    </footer>
  );
}
