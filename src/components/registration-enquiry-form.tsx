"use client";

import { FormEvent, useRef, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Mail, Phone } from "lucide-react";

const businessConstitutions = [
  "Proprietorship",
  "Partnership",
  "Limited Liability Partnership (LLP)",
  "Private Limited Company",
  "Public Limited Company",
  "Other",
];

const targetPortalGroups = [
  {
    label: "Central government",
    options: [
      "CPPP (Central Public Procurement Portal)",
      "NIC eProcurement / eTender (etenders.gov.in)",
    ],
  },
  {
    label: "Government e-Marketplace",
    options: ["GeM (Government e-Marketplace)"],
  },
  {
    label: "Public sector undertakings",
    options: [
      "Coal India eProcurement",
      "NTPC eProcurement",
      "BHEL eProcurement",
      "SAIL eProcurement",
      "Indian Railways IREPS",
    ],
  },
  {
    label: "TenderWizard-enabled organisations",
    options: ["MECON", "CPWD", "ISRO"],
  },
  {
    label: "State government",
    options: ["State government e-procurement portal"],
  },
  {
    label: "Not listed",
    options: ["Other / Not sure"],
  },
];

const gstOptions = [
  "GST registered",
  "Registration applied / in process",
  "Not registered",
  "Not applicable",
  "Not sure",
];

const msmeOptions = [
  "Udyam / MSME registered",
  "Registration applied / in process",
  "Not registered",
  "Not sure",
];

const dscOptions = [
  "Valid DSC available",
  "DSC applied / in process",
  "Need help obtaining a DSC",
  "Not sure",
];

type FormValues = {
  businessName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  constitution: string;
  targetPortal: string;
  gstStatus: string;
  msmeStatus: string;
  dscStatus: string;
  message: string;
};

const emptyValues: FormValues = {
  businessName: "",
  contactPerson: "",
  mobile: "",
  email: "",
  constitution: "",
  targetPortal: "",
  gstStatus: "",
  msmeStatus: "",
  dscStatus: "",
  message: "",
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const inputClass =
  "min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive/10";

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.businessName.trim().length < 2) {
    errors.businessName = "Enter your registered or trading business name.";
  }

  if (values.contactPerson.trim().length < 2) {
    errors.contactPerson = "Enter the name of the person we should contact.";
  }

  if (!values.mobile.trim()) {
    errors.mobile = "Enter a mobile number so we can discuss the registration.";
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
    errors.email = "Enter an email address for the quotation and follow-up.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.constitution) {
    errors.constitution = "Select your business constitution.";
  }

  if (!values.targetPortal) {
    errors.targetPortal = "Select the portal you want to register on, or choose Other / Not sure.";
  }

  if (!values.gstStatus) {
    errors.gstStatus = "Select your GST status.";
  }

  if (!values.msmeStatus) {
    errors.msmeStatus = "Select your MSME / Udyam status.";
  }

  if (!values.dscStatus) {
    errors.dscStatus = "Select your DSC status.";
  }

  if (values.message.length > 1000) {
    errors.message = "Keep the message under 1,000 characters.";
  }

  return errors;
}

function buildMailto(values: FormValues) {
  const subject = `Registration assistance enquiry — ${values.businessName.trim()}`;
  const body = [
    "Hello,",
    "",
    "I would like help with government tender portal registration.",
    "",
    `Business name: ${values.businessName.trim()}`,
    `Contact person: ${values.contactPerson.trim()}`,
    `Mobile: ${values.mobile.trim()}`,
    `Email: ${values.email.trim()}`,
    `Business constitution: ${values.constitution}`,
    `Target portal: ${values.targetPortal}`,
    `GST status: ${values.gstStatus}`,
    `MSME / Udyam status: ${values.msmeStatus}`,
    `DSC status: ${values.dscStatus}`,
    "",
    "Additional details:",
    values.message.trim() || "—",
    "",
    "Please confirm the current portal checklist and next steps.",
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

export function RegistrationEnquiryForm() {
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setDraftHref(null);
      window.requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
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
          <label htmlFor="businessName" className="mb-1.5 block text-sm font-semibold">
            Business name <span className="text-primary" aria-hidden="true">*</span>
          </label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            autoComplete="organization"
            value={values.businessName}
            onChange={(event) => update("businessName", event.target.value)}
            className={inputClass}
            placeholder="As shown on your PAN or GST records"
            required
            aria-invalid={Boolean(errors.businessName)}
            aria-describedby={errors.businessName ? "businessName-error" : undefined}
          />
          <FieldError id="businessName-error" message={errors.businessName} />
        </div>

        <div>
          <label htmlFor="contactPerson" className="mb-1.5 block text-sm font-semibold">
            Contact person&apos;s name <span className="text-primary" aria-hidden="true">*</span>
          </label>
          <input
            id="contactPerson"
            name="contactPerson"
            type="text"
            autoComplete="name"
            value={values.contactPerson}
            onChange={(event) => update("contactPerson", event.target.value)}
            className={inputClass}
            placeholder="Authorised or coordinating person"
            required
            aria-invalid={Boolean(errors.contactPerson)}
            aria-describedby={errors.contactPerson ? "contactPerson-error" : undefined}
          />
          <FieldError id="contactPerson-error" message={errors.contactPerson} />
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
          <label htmlFor="constitution" className="mb-1.5 block text-sm font-semibold">
            Business constitution <span className="text-primary" aria-hidden="true">*</span>
          </label>
          <select
            id="constitution"
            name="constitution"
            value={values.constitution}
            onChange={(event) => update("constitution", event.target.value)}
            className={inputClass}
            required
            aria-invalid={Boolean(errors.constitution)}
            aria-describedby={errors.constitution ? "constitution-error" : undefined}
          >
            <option value="">Select business constitution</option>
            {businessConstitutions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <FieldError id="constitution-error" message={errors.constitution} />
        </div>

        <div>
          <label htmlFor="targetPortal" className="mb-1.5 block text-sm font-semibold">
            Target portal <span className="text-primary" aria-hidden="true">*</span>
          </label>
          <select
            id="targetPortal"
            name="targetPortal"
            value={values.targetPortal}
            onChange={(event) => update("targetPortal", event.target.value)}
            className={inputClass}
            required
            aria-invalid={Boolean(errors.targetPortal)}
            aria-describedby={errors.targetPortal ? "targetPortal-error" : undefined}
          >
            <option value="">Select target portal</option>
            {targetPortalGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <FieldError id="targetPortal-error" message={errors.targetPortal} />
        </div>

        <div>
          <label htmlFor="gstStatus" className="mb-1.5 block text-sm font-semibold">
            GST status <span className="text-primary" aria-hidden="true">*</span>
          </label>
          <select
            id="gstStatus"
            name="gstStatus"
            value={values.gstStatus}
            onChange={(event) => update("gstStatus", event.target.value)}
            className={inputClass}
            required
            aria-invalid={Boolean(errors.gstStatus)}
            aria-describedby={errors.gstStatus ? "gstStatus-error" : undefined}
          >
            <option value="">Select GST status</option>
            {gstOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <FieldError id="gstStatus-error" message={errors.gstStatus} />
        </div>

        <div>
          <label htmlFor="msmeStatus" className="mb-1.5 block text-sm font-semibold">
            MSME / Udyam status <span className="text-primary" aria-hidden="true">*</span>
          </label>
          <select
            id="msmeStatus"
            name="msmeStatus"
            value={values.msmeStatus}
            onChange={(event) => update("msmeStatus", event.target.value)}
            className={inputClass}
            required
            aria-invalid={Boolean(errors.msmeStatus)}
            aria-describedby={errors.msmeStatus ? "msmeStatus-error" : undefined}
          >
            <option value="">Select MSME / Udyam status</option>
            {msmeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <FieldError id="msmeStatus-error" message={errors.msmeStatus} />
        </div>

        <div>
          <label htmlFor="dscStatus" className="mb-1.5 block text-sm font-semibold">
            DSC status <span className="text-primary" aria-hidden="true">*</span>
          </label>
          <select
            id="dscStatus"
            name="dscStatus"
            value={values.dscStatus}
            onChange={(event) => update("dscStatus", event.target.value)}
            className={inputClass}
            required
            aria-invalid={Boolean(errors.dscStatus)}
            aria-describedby={errors.dscStatus ? "dscStatus-error" : undefined}
          >
            <option value="">Select DSC status</option>
            {dscOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <FieldError id="dscStatus-error" message={errors.dscStatus} />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold">
          Anything else we should know? <span className="text-xs font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          className="min-h-28 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10 aria-[invalid=true]:border-destructive"
          placeholder="Tender reference, buyer name, category, previous registration issue, or a preferred call-back time."
          maxLength={1000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <FieldError id="message-error" message={errors.message} />
          <span className="ml-auto shrink-0 text-xs text-muted-foreground" aria-live="polite">
            {values.message.length}/1000
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
        Do not include PAN or Aadhaar copies, DSC PINs or private keys, passwords, OTPs, or portal access tokens.
        We will ask for the portal checklist and share the next steps before any document is exchanged.
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
          This opens your email app with the details filled in. Nothing is sent or stored until you send that email.
        </p>
      </div>

      {draftHref && (
        <div
          role="status"
          className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6"
        >
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
