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

    // Verify file exists
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse("File tidak ditemukan", { status: 404 });
    }

    // Role & ownership check
    if (user.role !== "ADMIN") {
      const payment = await prisma.payment.findFirst({
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

      if (!payment || payment.serviceRequest.customerId !== user.id) {
        return new NextResponse("Forbidden: Anda tidak memiliki akses ke bukti transfer ini", {
          status: 403,
        });
      }
    }

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();

    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".pdf") contentType = "application/pdf";

    return new NextResponse(fileBuffer, {
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
