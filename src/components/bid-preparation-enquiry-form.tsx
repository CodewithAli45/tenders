"use client";

import { FormEvent, useRef, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Mail, Phone } from "lucide-react";

const assistanceOptions = [
  "Full bid documentation",
  "Technical bid",
  "Annexures and affidavits",
  "Financial BOQ",
  "Commercial compliance review",
  "Final checklist",
];

type FormValues = {
  name: string;
  company: string;
  mobile: string;
  email: string;
  tenderOrganisation: string;
  tenderReference: string;
  assistance: string[];
  message: string;
};

const emptyValues: FormValues = {
  name: "",
  company: "",
  mobile: "",
  email: "",
  tenderOrganisation: "",
  tenderReference: "",
  assistance: [],
  message: "",
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const fieldIds: Record<keyof FormValues, string> = {
  name: "name",
  company: "company",
  mobile: "mobile",
  email: "email",
  tenderOrganisation: "tenderOrganisation",
  tenderReference: "tenderReference",
  assistance: "assistance-full-bid-documentation",
  message: "message",
};

const inputClass =
  "min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive/10";

function optionId(option: string) {
  return `assistance-${option.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Enter the name of the person we should contact.";
  }

  if (values.company.trim().length < 2) {
    errors.company = "Enter your company or firm name.";
  }

  if (!values.mobile.trim()) {
    errors.mobile = "Enter a mobile number so we can discuss the tender.";
  } else {
    const digits = values.mobile.replace(/\D/g, "");
    const local =
      digits.length === 12 && digits.startsWith("91")
        ? digits.slice(2)
        : digits.length === 11 && digits.startsWith("0")
          ? digits.slice(1)
          : digits;
    if (!/^[6-9]\d{9}$/.test(local)) {
      errors.mobile = "Enter a valid 10-digit Indian mobile number.";
    }
  }

  if (!values.email.trim()) {
    errors.email = "Enter an email address for the review and follow-up.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (values.tenderOrganisation.trim().length < 2) {
    errors.tenderOrganisation = "Enter the tender organisation or buyer name.";
  }

  if (values.assistance.length === 0) {
    errors.assistance = "Select at least one part of the bid you need help with.";
  }

  if (values.message.length > 1500) {
    errors.message = "Keep the message under 1,500 characters.";
  }

  return errors;
}

function buildMailto(values: FormValues) {
  const subject = `Bid preparation enquiry — ${values.company.trim()}`;
  const body = [
    "Hello,",
    "",
    "I would like help preparing a tender submission.",
    "",
    `Name: ${values.name.trim()}`,
    `Company / firm: ${values.company.trim()}`,
    `Mobile: ${values.mobile.trim()}`,
    `Email: ${values.email.trim()}`,
    `Tender organisation: ${values.tenderOrganisation.trim()}`,
    `Tender reference number: ${values.tenderReference.trim() || "Not provided"}`,
    "",
    "Assistance required:",
    ...values.assistance.map((item) => `- ${item}`),
    "",
    "Additional details:",
    values.message.trim() || "—",
    "",
    "Please confirm the scope, document requirements, and next steps.",
  ].join("\n");

  return `mailto:mashreqenterprises@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-destructive">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export function BidPreparationEnquiryForm() {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [draftHref, setDraftHref] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function toggleAssistance(option: string, checked: boolean) {
    update(
      "assistance",
      checked
        ? [...values.assistance, option]
        : values.assistance.filter((item) => item !== option),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setDraftHref(null);
      const firstError = Object.keys(nextErrors)[0] as keyof FormValues;
      window.requestAnimationFrame(() => {
        document.getElementById(fieldIds[firstError])?.focus();
      });
      return;
    }

    const href = buildMailto(values);
    setDraftHref(href);
    window.location.href = href;
  }

  const errorCount = Object.keys(errors).length;

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      {errorCount > 0 && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>Please check the highlighted fields and try again.</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
            Name <span className="text-primary" aria-hidden="true">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            className={inputClass}
            placeholder="Contact person"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          <FieldError id="name-error" message={errors.name} />
        </div>

        <div>
          <label htmlFor="company" className="mb-1.5 block text-sm font-semibold">
            Company / firm <span className="text-primary" aria-hidden="true">*</span>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            value={values.company}
            onChange={(event) => update("company", event.target.value)}
            className={inputClass}
            placeholder="Registered or trading name"
            required
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? "company-error" : undefined}
          />
          <FieldError id="company-error" message={errors.company} />
        </div>

        <div>
          <label htmlFor="mobile" className="mb-1.5 block text-sm font-semibold">
            Mobile number <span className="text-primary" aria-hidden="true">*</span>
          </label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.mobile}
            onChange={(event) => update("mobile", event.target.value)}
            className={inputClass}
            placeholder="+91 00000 00000"
            required
            aria-invalid={Boolean(errors.mobile)}
            aria-describedby={errors.mobile ? "mobile-error" : undefined}
          />
          <FieldError id="mobile-error" message={errors.mobile} />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
            Email <span className="text-primary" aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            className={inputClass}
            placeholder="name@business.com"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          <FieldError id="email-error" message={errors.email} />
        </div>

        <div>
          <label htmlFor="tenderOrganisation" className="mb-1.5 block text-sm font-semibold">
            Tender organisation <span className="text-primary" aria-hidden="true">*</span>
          </label>
          <input
            id="tenderOrganisation"
            name="tenderOrganisation"
            type="text"
            value={values.tenderOrganisation}
            onChange={(event) => update("tenderOrganisation", event.target.value)}
            className={inputClass}
            placeholder="Department, PSU, or buyer name"
            required
            aria-invalid={Boolean(errors.tenderOrganisation)}
            aria-describedby={errors.tenderOrganisation ? "tenderOrganisation-error" : undefined}
          />
          <FieldError id="tenderOrganisation-error" message={errors.tenderOrganisation} />
        </div>

        <div>
          <label htmlFor="tenderReference" className="mb-1.5 block text-sm font-semibold">
            Tender reference number{" "}
            <span className="text-xs font-normal text-muted-foreground">(if available)</span>
          </label>
          <input
            id="tenderReference"
            name="tenderReference"
            type="text"
            value={values.tenderReference}
            onChange={(event) => update("tenderReference", event.target.value)}
            className={inputClass}
            placeholder="NIT / tender ID"
            aria-invalid={Boolean(errors.tenderReference)}
            aria-describedby={errors.tenderReference ? "tenderReference-error" : undefined}
          />
          <FieldError id="tenderReference-error" message={errors.tenderReference} />
        </div>
      </div>

      <fieldset aria-describedby={errors.assistance ? "assistance-error" : undefined}>
        <legend className="mb-1.5 block text-sm font-semibold">
          Assistance required <span className="text-primary" aria-hidden="true">*</span>
        </legend>
        <p className="mb-2 text-xs text-muted-foreground">
          Select every part of the bid you need help preparing.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {assistanceOptions.map((option) => {
            const id = optionId(option);
            return (
              <label
                key={option}
                htmlFor={id}
                className="flex min-h-11 cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 text-sm transition hover:border-primary/40 has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5"
              >
                <input
                  id={id}
                  name="assistance"
                  type="checkbox"
                  value={option}
                  checked={values.assistance.includes(option)}
                  onChange={(event) => toggleAssistance(option, event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#9a5730] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                  aria-invalid={Boolean(errors.assistance)}
                  aria-describedby={errors.assistance ? "assistance-error" : undefined}
                />
                {option}
              </label>
            );
          })}
        </div>
        <FieldError id="assistance-error" message={errors.assistance} />
      </fieldset>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold">
          Anything else we should know?{" "}
          <span className="text-xs font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          className="min-h-28 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10 aria-[invalid=true]:border-destructive"
          placeholder="Submission deadline, scope, current status, or any specific tender requirement."
          maxLength={1500}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <FieldError id="message-error" message={errors.message} />
          <span className="ml-auto shrink-0 text-xs text-muted-foreground" aria-live="polite">
            {values.message.length}/1500
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
        Do not include portal passwords, OTPs, DSC PINs or private keys, access tokens, or
        confidential tender credentials. Share documents only after the scope is agreed and through
        the channel we confirm with you.
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#9a5730] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-[#874a28] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
        >
          Send enquiry by email
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="text-xs leading-5 text-muted-foreground">
          This opens your email app with the details filled in. Nothing is sent or stored until you
          send that email.
        </p>
      </div>

      {draftHref && (
        <div role="status" className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6">
          <p className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            Your email app should open with the enquiry draft.
          </p>
          <p className="mt-1 text-foreground/80">
            If it did not open,{" "}
            <a href={draftHref} className="font-semibold text-[#9a5730] underline underline-offset-2 dark:text-[#e2a678]">
              open the draft again
            </a>{" "}
            or email{" "}
            <a href="mailto:mashreqenterprises@gmail.com" className="font-semibold text-[#9a5730] underline underline-offset-2 dark:text-[#e2a678]">
              mashreqenterprises@gmail.com
            </a>
            . The enquiry is not submitted until you send the email.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <a href="tel:+919661221326" className="inline-flex items-center gap-1.5 font-semibold hover:text-primary">
          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
          +91 96612 21326
        </a>
        <a href="mailto:mashreqenterprises@gmail.com" className="inline-flex items-center gap-1.5 font-semibold hover:text-primary">
          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
          mashreqenterprises@gmail.com
        </a>
      </div>
    </form>
  );
}
