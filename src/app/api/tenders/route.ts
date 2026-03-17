import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Tender from "@/models/Tender";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();

    // The user requested all fields except documents to be compulsory.
    // We should validate them here.
    const requiredFields = [
      "internalId",
      "title",
      "organization",
      "category",
      "tenderValue",
      "tenderNo",
      "portalId",
      "emdAmount",
      "emdThrough",
      "publishDate",
      "dueDate",
      "tenderType",
      "formOfContract",
      "corrigendum"
    ];

    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === "") {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    const tender = await Tender.create(data);
    return NextResponse.json(tender, { status: 201 });
  } catch (error: any) {
    console.error("Error creating tender:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create tender" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const tenders = await Tender.find({}).sort({ createdAt: -1 });
    return NextResponse.json(tenders);
  } catch (error: any) {
    console.error("Error fetching tenders:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenders" },
      { status: 500 }
    );
  }
}
