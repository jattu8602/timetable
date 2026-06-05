import { NextRequest, NextResponse } from "next/server";
import { parseTimetableText } from "@/lib/timetable/parser";
import { importTimetable } from "@/lib/timetable/importer";
import { extractTextFromPdf } from "@/lib/ocr";
import { structureWithOpenAI } from "@/lib/openai-timetable";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = file.name.endsWith(".pdf")
      ? await extractTextFromPdf(buffer)
      : buffer.toString("utf-8");

    if (!text.trim()) {
      return NextResponse.json(
        { error: "No text could be extracted from the PDF." },
        { status: 400 }
      );
    }

    const isOcrText = text.includes("---PAGE BREAK---");

    let parsed;

    if (isOcrText) {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "paste-your-openai-key-here") {
        return NextResponse.json(
          { error: "OPENAI_API_KEY not configured. Set it in .env to structure OCR'd timetables." },
          { status: 500 }
        );
      }
      parsed = await structureWithOpenAI(text);
    } else {
      parsed = parseTimetableText(text);
    }

    if (parsed.slots.length === 0 && parsed.courses.length === 0) {
      return NextResponse.json(
        { error: "Could not parse a valid timetable from the document." },
        { status: 400 }
      );
    }

    const timetable = await importTimetable(parsed);

    return NextResponse.json(
      {
        success: true,
        timetableId: timetable.id,
        slotCount: parsed.slots.length,
        courseCount: parsed.courses.length,
        source: isOcrText ? "ocr+openai" : "parser",
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
