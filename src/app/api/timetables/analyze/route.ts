import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeTimetableImage } from "@/lib/mistral";
import * as fs from "node:fs";
import * as path from "node:path";

const PERIOD_TIMES: Record<string, string> = {
  I: "08:00-08:50",
  II: "09:00-09:50",
  III: "10:00-10:50",
  IV: "11:00-11:50",
  V: "12:00-12:50",
  VI: "13:30-14:20",
  VII: "14:30-15:20",
  VIII: "15:30-16:20",
  IX: "16:30-17:20",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "timetableId (id) required" }, { status: 400 });
    }

    const timetable = await prisma.timetable.findUnique({
      where: { id, deletedAt: null },
    });

    if (!timetable) {
      return NextResponse.json({ error: "Timetable not found" }, { status: 404 });
    }

    const pngPath = path.join(process.cwd(), "public", "uploads", `${id}.png`);
    if (!fs.existsSync(pngPath)) {
      return NextResponse.json(
        { error: "Visual PNG snapshot of this PDF was not found. Please upload a new PDF to generate a visual preview." },
        { status: 404 }
      );
    }

    // Read PNG file and convert to base64
    const fileBuffer = fs.readFileSync(pngPath);
    const base64 = fileBuffer.toString("base64");

    console.log(`[analyze-route] Sending timetable ${id} PNG to Mistral Vision model...`);
    const analysis = await analyzeTimetableImage(base64);

    if (!analysis.slots || !Array.isArray(analysis.slots) || analysis.slots.length === 0) {
      return NextResponse.json(
        { error: "Mistral Vision failed to extract any time slots from the image." },
        { status: 422 }
      );
    }

    console.log(`[analyze-route] Extracted ${analysis.slots.length} slots from image. Updating DB...`);

    // Delete existing slots in a transaction and create new ones
    await prisma.$transaction([
      prisma.timeSlot.deleteMany({
        where: { timetableId: id },
      }),
      prisma.timeSlot.createMany({
        data: analysis.slots.map((s) => ({
          timetableId: id,
          dayOfWeek: s.dayOfWeek,
          periodName: s.periodName,
          timeRange: PERIOD_TIMES[s.periodName] || "",
          subjectDetails: s.subjectDetails,
        })),
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Timetable grid analysis complete! Successfully updated slots.`,
      slotsCount: analysis.slots.length,
    });
  } catch (err: any) {
    console.error("[analyze-route] error:", err);
    return NextResponse.json(
      { error: err.message || "An error occurred during image recognition analysis" },
      { status: 500 }
    );
  }
}
