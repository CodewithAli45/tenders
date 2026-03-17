import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_URL?.split("://")[1].split(":")[0],
  api_secret: process.env.CLOUDINARY_URL?.split(":")[2].split("@")[0],
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const tenderId = formData.get("tenderId") as string;
    const type = formData.get("type") as string; // 'document' or 'corrigendum'

    if (!file || !tenderId) {
      return NextResponse.json(
        { error: "File and Tender ID are required" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise<NextResponse>((resolve) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `tenders/${tenderId}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            resolve(NextResponse.json({ error: "Upload failed" }, { status: 500 }));
          } else {
            resolve(NextResponse.json({ url: result?.secure_url }));
          }
        }
      ).end(buffer);
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
