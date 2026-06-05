import { NextRequest, NextResponse } from "next/server";
import { parseTimetableText } from "@/lib/timetable/parser";
import { importTimetable } from "@/lib/timetable/importer";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text: string;

    if (file.name.endsWith(".pdf")) {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      try {
        const textResult = await parser.getText();
        text = textResult.text;
      } finally {
        await parser.destroy();
      }
    } else {
      text = buffer.toString("utf-8");
    }

    const parsed = parseTimetableText(text);
    const timetable = await importTimetable(parsed);

    return NextResponse.json(
      { success: true, timetableId: timetable.id, slotCount: parsed.slots.length },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
