type TenderRow = Record<string, unknown>;
type AttachmentRow = Record<string, unknown>;

export interface MappedTender {
  _id: string;
  internalId: string;
  title: string;
  organization: string;
  tenderValue: number;
  tenderNo: string;
  portalId: string;
  emdAmount: number;
  publishDate: string | null;
  dueDate: string;
  createdAt: string | null;
  updatedAt: string | null;
  scopeOfWork: string;
  location: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  paymentTerms: string;
  officerDesignation: string;
  eligibilityFinancial: string;
  eligibilityTechnical: string;
  eligibilityJV: string;
  technicalAnalysis: string;
  boqSummary: string;
  tenderDocuments: string[];
  corrigendumFiles: string[];
}

export function fromTenderRow(row: TenderRow): MappedTender {
  const attachments = (row.attachments as AttachmentRow[] | undefined) || [];
  return {
    _id: row.id,
    internalId: row.internal_id,
    title: row.title,
    organization: row.organization,
    tenderValue: Number(row.tender_value),
    tenderNo: row.tender_no,
    portalId: row.portal_id,
    emdAmount: Number(row.emd_amount),
    publishDate: row.publish_date,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scopeOfWork: row.scope_of_work || "",
    location: row.location || "",
    contactPerson: row.contact_person || "",
    contactPhone: row.contact_phone || "",
    contactEmail: row.contact_email || "",
    paymentTerms: row.payment_terms || "",
    officerDesignation: row.officer_designation || "",
    eligibilityFinancial: row.eligibility_financial || "",
    eligibilityTechnical: row.eligibility_technical || "",
    eligibilityJV: row.eligibility_jv || "",
    technicalAnalysis: row.technical_analysis || "",
    boqSummary: row.boq_summary || "",
    tenderDocuments: attachments.filter((file) => file.attachment_type === "document").map((file) => file.file_url),
    corrigendumFiles: attachments.filter((file) => file.attachment_type === "corrigendum").map((file) => file.file_url),
  } as MappedTender;
}
