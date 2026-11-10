import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/server/email";
import { IntegrationUnavailableError } from "@/lib/server/errors";
import { enforceRateLimit } from "@/lib/server/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().default(""),
  subject: z.string().trim().min(1).max(160),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(200).optional().default(""),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: "Please check the form fields and try again." }, { status: 400 });
  }
  if (parsed.data.website) {
    return Response.json({ error: "Unable to process this message." }, { status: 400 });
  }
  if (!process.env.SALES_TEAM_EMAIL || !process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return Response.json({ error: "Contact delivery is not configured on this server." }, { status: 503 });
  }

  try {
    const rate = await enforceRateLimit(request, "contact");
    if (!rate.success) {
      return Response.json(
        { error: "Too many messages. Please try again later." },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    }

    const message = await getPrisma().contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
      },
      select: { id: true },
    });

    await sendEmail({
      to: process.env.SALES_TEAM_EMAIL,
      subject: `Website enquiry: ${parsed.data.subject}`,
      text: [
        `Name: ${parsed.data.name}`,
        `Email: ${parsed.data.email}`,
        `Phone: ${parsed.data.phone || "Not provided"}`,
        "",
        parsed.data.message,
      ].join("\n"),
    });

    return Response.json({ id: message.id, message: "Your message has been sent." }, { status: 201 });
  } catch (error) {
    if (error instanceof IntegrationUnavailableError) {
      return Response.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof Error && error.message === "Email delivery failed.") {
      return Response.json(
        { error: "Your message was saved, but email delivery failed. Please contact our team directly." },
        { status: 502 },
      );
    }
    throw error;
  }
}
