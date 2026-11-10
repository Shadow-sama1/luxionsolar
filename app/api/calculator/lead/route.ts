import { z } from "zod";
import { calculateSystem, peakSunHoursByState, type ApplianceSelection } from "@/lib/sizing";
import { getPrisma } from "@/lib/prisma";
import { createEnergyReportPdf } from "@/lib/server/energy-report-pdf";
import { sendEmail } from "@/lib/server/email";
import { IntegrationUnavailableError } from "@/lib/server/errors";
import { enforceRateLimit } from "@/lib/server/rate-limit";

const states = Object.keys(peakSunHoursByState) as [string, ...string[]];
const leadSchema = z.object({
  submissionId: z.string().uuid(),
  lead: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(6).max(40),
    state: z.enum(states),
    address: z.string().trim().max(400),
    installationType: z.string().trim().min(1).max(80),
    budget: z.string().trim().min(1).max(80),
    timeline: z.string().trim().min(1).max(80),
    notes: z.string().trim().max(2000),
    consent: z.literal(true),
  }),
  goal: z.string().trim().min(1).max(80),
  grid: z.string().trim().min(1).max(80),
  appliances: z.array(z.object({
    id: z.string().trim().min(1).max(120),
    name: z.string().trim().min(1).max(120),
    category: z.string().trim().min(1).max(80),
    watts: z.number().int().min(1).max(10000),
    quantity: z.number().int().min(1).max(20),
    hours: z.number().min(0).max(24),
  })).min(1).max(40),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: "Please review your details and select at least one appliance." }, { status: 400 });
  }
  if (!process.env.SALES_TEAM_EMAIL || !process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return Response.json({ error: "Lead delivery is not configured on this server." }, { status: 503 });
  }

  try {
    const rate = await enforceRateLimit(request, "calculator");
    if (!rate.success) {
      return Response.json(
        { error: "Too many estimates. Please try again later." },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    }

    const selections: ApplianceSelection[] = parsed.data.appliances.map((item) => ({
      appliance: { id: item.id, name: item.name, category: item.category, watts: item.watts },
      quantity: item.quantity,
      hours: item.hours,
    }));
    const result = calculateSystem(selections, peakSunHoursByState[parsed.data.lead.state]);
    const lead = parsed.data.lead;
    const name = `${lead.firstName} ${lead.lastName}`;
    const report = {
      connectedLoadW: result.connectedLoadW,
      dailyEnergyWh: result.dailyEnergyWh,
      inverterKva: result.inverterKva,
      batteryCapacityKwh: result.batteryCapacityKwh,
      panelCount: result.panelCount,
      panelCapacityW: result.panelCapacityW,
      selections: parsed.data.appliances,
    };
    const reportPdf = await createEnergyReportPdf({
      name,
      state: lead.state,
      goal: parsed.data.goal,
      selections,
      result,
    });

    const savedLead = await getPrisma().calculatorLead.upsert({
      where: { submissionId: parsed.data.submissionId },
      create: {
        submissionId: parsed.data.submissionId,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        state: lead.state,
        address: lead.address || null,
        goal: parsed.data.goal,
        gridProfile: parsed.data.grid,
        budget: lead.budget,
        timeline: lead.timeline,
        notes: lead.notes || null,
        report,
      },
      update: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        state: lead.state,
        address: lead.address || null,
        goal: parsed.data.goal,
        gridProfile: parsed.data.grid,
        budget: lead.budget,
        timeline: lead.timeline,
        notes: lead.notes || null,
        report,
      },
      select: { id: true },
    });

    const reportText = [
      `Hello ${lead.firstName},`,
      "",
      "Your Luxion Solar initial energy snapshot is attached.",
      `Recommended inverter estimate: ${result.inverterKva} kVA`,
      `Battery storage estimate: ${result.batteryCapacityKwh.toFixed(1)} kWh`,
      `Solar array estimate: ${result.panelCapacityW} W (${result.panelCount} × 550 W panels)`,
      "",
      "These planning figures are illustrative and require site verification before quotation or installation.",
    ].join("\n");
    const salesText = [
      `New calculator lead: ${name}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone}`,
      `Location: ${lead.state}`,
      `Goal: ${parsed.data.goal}`,
      `Grid profile: ${parsed.data.grid}`,
      `Estimate: ${result.inverterKva} kVA inverter, ${result.batteryCapacityKwh.toFixed(1)} kWh battery, ${result.panelCapacityW} W panels`,
      `Budget: ${lead.budget}`,
      `Timeline: ${lead.timeline}`,
      `Address: ${lead.address || "Not provided"}`,
      `Notes: ${lead.notes || "None"}`,
    ].join("\n");
    const attachment = { filename: "luxion-energy-snapshot.pdf", content: reportPdf };
    const deliveryResults = await Promise.allSettled([
      sendEmail({
        to: lead.email,
        subject: "Your Luxion Solar energy snapshot",
        text: reportText,
        attachments: [attachment],
      }),
      sendEmail({
        to: process.env.SALES_TEAM_EMAIL,
        subject: `New solar calculator lead: ${name}`,
        text: salesText,
        attachments: [attachment],
      }),
    ]);
    const emailSent = deliveryResults.every((delivery) => delivery.status === "fulfilled");
    for (const delivery of deliveryResults) {
      if (delivery.status === "rejected") console.error("Calculator lead email delivery failed", delivery.reason);
    }

    return Response.json({
      leadId: savedLead.id,
      emailSent,
      message: emailSent
        ? "Your estimate has been saved and emailed."
        : "Your estimate has been saved, but email delivery failed. Please contact our team.",
    }, { status: 201 });
  } catch (error) {
    if (error instanceof IntegrationUnavailableError) {
      return Response.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }
}
