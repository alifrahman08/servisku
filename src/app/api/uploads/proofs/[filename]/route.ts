import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const filename = path.basename(params.filename); // Prevent path traversal
    const filePath = path.join(process.cwd(), "public", "uploads", "proofs", filename);

    // Role & ownership check
    let targetPayment: any = null;
    if (user.role !== "ADMIN") {
      targetPayment = await prisma.payment.findFirst({
        where: {
          OR: [
            { proofUrl: { contains: filename } },
            { proofFileName: filename },
          ],
        },
        include: {
          serviceRequest: {
            select: { customerId: true },
          },
        },
      });

      if (!targetPayment || targetPayment.serviceRequest.customerId !== user.id) {
        return new NextResponse("Forbidden: Anda tidak memiliki akses ke bukti transfer ini", {
          status: 403,
        });
      }
    }

    let fileBuffer: Buffer | null = null;
    let contentType = "application/octet-stream";
    const ext = path.extname(filename).toLowerCase();

    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".pdf") contentType = "application/pdf";

    // 1. Try local filesystem (for local dev)
    try {
      await fs.access(filePath);
      fileBuffer = await fs.readFile(filePath);
    } catch {
      // 2. Fallback to database stored Data URL (for Vercel serverless environment)
      if (!targetPayment) {
        targetPayment = await prisma.payment.findFirst({
          where: {
            OR: [
              { proofFileName: filename },
              { proofUrl: { contains: filename } },
            ],
          },
        });
      }

      if (targetPayment?.proofUrl && targetPayment.proofUrl.startsWith("data:")) {
        const matches = targetPayment.proofUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          contentType = matches[1];
          fileBuffer = Buffer.from(matches[2], "base64");
        }
      }
    }

    if (!fileBuffer) {
      return new NextResponse("File tidak ditemukan", { status: 404 });
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600, no-transform",
      },
    });
  } catch (error) {
    console.error("Proof file serve error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
