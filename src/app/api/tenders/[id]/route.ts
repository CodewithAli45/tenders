import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Tender from "@/models/Tender";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const data = await req.json();

    const tender = await Tender.findByIdAndUpdate(id, data, { new: true });
    
    if (!tender) {
      return NextResponse.json({ error: "Tender not found" }, { status: 404 });
    }

    return NextResponse.json(tender);
  } catch (error: any) {
    console.error("Error updating tender:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update tender" },
      { status: 500 }
    );
  }
}
