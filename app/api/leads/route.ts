import { NextResponse } from "next/server";
import { sendLeadNotificationEmail } from "@/lib/brevo";
import { saveLead } from "@/lib/leads";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      issue_summary?: string;
      preferred_time?: string;
    };

    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json(
        { error: "name and phone are required" },
        { status: 400 },
      );
    }

    const lead = await saveLead({
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim(),
      address: body.address?.trim(),
      issue_summary: body.issue_summary?.trim() || "General estimate request",
      preferred_time: body.preferred_time?.trim(),
    });

    const emailResult = await sendLeadNotificationEmail(lead);
    if (!emailResult.ok) {
      console.warn("lead email not sent:", emailResult.error);
    }

    return NextResponse.json({
      ok: true,
      lead,
      emailSent: emailResult.ok,
      emailSkipped: !emailResult.ok && "skipped" in emailResult && emailResult.skipped,
      emailError: emailResult.ok ? undefined : emailResult.error,
      message: emailResult.ok
        ? "Estimate request saved and notification emailed."
        : "Estimate request saved. A Ridgeform Roofing specialist will follow up.",
    });
  } catch (error) {
    console.error("lead save failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save lead" },
      { status: 500 },
    );
  }
}
