import { Resend } from "resend";
import { IntegrationUnavailableError } from "@/lib/server/errors";

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  attachments?: { filename: string; content: Buffer }[];
};

export async function sendEmail({ to, subject, text, attachments }: EmailMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new IntegrationUnavailableError("Resend email");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from, to, subject, text, attachments });
  if (error) {
    console.error("Resend could not deliver an email", error);
    throw new Error("Email delivery failed.");
  }
}
