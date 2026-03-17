import mongoose, { Schema, Document } from "mongoose";

export interface ITender extends Document {
  internalId: string;
  title: string;
  organization: string;
  category: "central" | "state" | "psu" | "railway";
  tenderValue: number;
  tenderNo: string;
  portalId: string;
  emdAmount: number;
  emdThrough: "online" | "bg" | "msme";
  publishDate: Date;
  dueDate: Date;
  tenderType: "open" | "limited" | "global";
  formOfContract: "epc" | "item" | "turnkey" | "supply";
  corrigendum: boolean;
  corrigendumFiles?: string[];
  tenderDocuments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TenderSchema: Schema = new Schema(
  {
    internalId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    organization: { type: String, required: true },
    category: { 
      type: String, 
      required: true, 
      enum: ["central", "state", "psu", "railway"] 
    },
    tenderValue: { type: Number, required: true },
    tenderNo: { type: String, required: true },
    portalId: { type: String, required: true },
    emdAmount: { type: Number, required: true },
    emdThrough: { 
      type: String, 
      required: true, 
      enum: ["online", "bg", "msme"] 
    },
    publishDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    tenderType: { 
      type: String, 
      required: true, 
      enum: ["open", "limited", "global"] 
    },
    formOfContract: { 
      type: String, 
      required: true, 
      enum: ["epc", "item", "turnkey", "supply"] 
    },
    corrigendum: { type: Boolean, required: true, default: false },
    corrigendumFiles: [{ type: String }],
    tenderDocuments: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.TenderDetails || mongoose.model<ITender>("TenderDetails", TenderSchema);
