import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const NORMAL_PERIODS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

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
    const { timetableId, dayOfWeek, periodName, subjectDetails, span = 1, oldSubjectDetails } = body;

    if (!timetableId || !dayOfWeek || !periodName || !subjectDetails) {
      return NextResponse.json(
        { error: "timetableId, dayOfWeek, periodName, and subjectDetails are required" },
        { status: 400 }
      );
    }

    const startIndex = NORMAL_PERIODS.indexOf(periodName);
    if (startIndex === -1) {
      return NextResponse.json({ error: "Invalid periodName" }, { status: 400 });
    }

    const targetPeriods = NORMAL_PERIODS.slice(startIndex, startIndex + span);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Clear old spanned slots if updating/moving
      if (oldSubjectDetails && oldSubjectDetails.trim() && oldSubjectDetails !== "—") {
        await tx.timeSlot.deleteMany({
          where: {
            timetableId,
            dayOfWeek,
            subjectDetails: oldSubjectDetails,
          },
        });
      }

      // 2. Overwrite target slots in the new span
      await tx.timeSlot.deleteMany({
        where: {
          timetableId,
          dayOfWeek,
          periodName: { in: targetPeriods },
        },
      });

      // 3. Insert new slots
      const createdSlots = [];
      for (const p of targetPeriods) {
        if (subjectDetails !== "—") {
          const slot = await tx.timeSlot.create({
            data: {
              timetableId,
              dayOfWeek,
              periodName: p,
              timeRange: PERIOD_TIMES[p] || "",
              subjectDetails,
            },
          });
          createdSlots.push(slot);
        }
      }
      return createdSlots;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, subjectDetails, dayOfWeek, periodName, timeRange, span, oldSubjectDetails, timetableId } = body;

    if (!id) {
      return NextResponse.json({ error: "slot id required" }, { status: 400 });
    }

    // If span or oldSubjectDetails is specified, use transaction bulk update
    if (span !== undefined || oldSubjectDetails !== undefined) {
      if (!timetableId || !dayOfWeek || !periodName || !subjectDetails) {
        return NextResponse.json(
          { error: "timetableId, dayOfWeek, periodName, and subjectDetails required for span update" },
          { status: 400 }
        );
      }

      const startIndex = NORMAL_PERIODS.indexOf(periodName);
      if (startIndex === -1) {
        return NextResponse.json({ error: "Invalid periodName" }, { status: 400 });
      }

      const targetPeriods = NORMAL_PERIODS.slice(startIndex, startIndex + span);

      const result = await prisma.$transaction(async (tx) => {
        // Clean up old spanned slots
        if (oldSubjectDetails && oldSubjectDetails.trim() && oldSubjectDetails !== "—") {
          await tx.timeSlot.deleteMany({
            where: {
              timetableId,
              dayOfWeek,
              subjectDetails: oldSubjectDetails,
            },
          });
        }

        // Overwrite target slots in the new span
        await tx.timeSlot.deleteMany({
          where: {
            timetableId,
            dayOfWeek,
            periodName: { in: targetPeriods },
          },
        });

        // Insert new slots
        const createdSlots = [];
        for (const p of targetPeriods) {
          if (subjectDetails !== "—") {
            const slot = await tx.timeSlot.create({
              data: {
                timetableId,
                dayOfWeek,
                periodName: p,
                timeRange: PERIOD_TIMES[p] || "",
                subjectDetails,
              },
            });
            createdSlots.push(slot);
          }
        }
        return createdSlots;
      });

      return NextResponse.json(result);
    }

    // Default single-slot PATCH
    const updateData: any = {};
    if (subjectDetails !== undefined) updateData.subjectDetails = subjectDetails;
    if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek;
    if (periodName !== undefined) updateData.periodName = periodName;
    if (timeRange !== undefined) updateData.timeRange = timeRange;

    const data = await prisma.timeSlot.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "slot id required" }, { status: 400 });
    }

    await prisma.timeSlot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

