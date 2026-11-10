import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { calculateSystem, peakSunHoursByState, type ApplianceSelection } from "@/lib/sizing";
import { IntegrationUnavailableError } from "@/lib/server/errors";
import { enforceRateLimit } from "@/lib/server/rate-limit";

const analysisSchema = z.object({
  appliances: z.array(z.object({
    id: z.string().trim().min(1).max(120),
    name: z.string().trim().min(1).max(120),
    category: z.string().trim().min(1).max(80),
    watts: z.number().int().min(1).max(10000),
    quantity: z.number().int().min(1).max(20),
    hours: z.number().min(0).max(24),
  })).min(1).max(40),
  location: z.enum(Object.keys(peakSunHoursByState) as [string, ...string[]]),
  goal: z.string().trim().min(1).max(80),
  grid: z.string().trim().min(1).max(80),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = analysisSchema.safeParse(payload);
  if (!parsed.success) return Response.json({ error: "The sizing summary is invalid." }, { status: 400 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "AI recommendations are not configured on this server." }, { status: 503 });

  try {
    const rate = await enforceRateLimit(request, "calculator");
    if (!rate.success) {
      return Response.json(
        { error: "Too many analysis requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    }

    const selections: ApplianceSelection[] = parsed.data.appliances.map((item) => ({
      appliance: { id: item.id, name: item.name, category: item.category, watts: item.watts },
      quantity: item.quantity,
      hours: item.hours,
    }));
    const result = calculateSystem(selections, peakSunHoursByState[parsed.data.location]);
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
      max_tokens: 300,
      system: [
        "You write a short, plain-language explanation for a solar-sizing estimate.",
        "The supplied numeric result is already computed by a deterministic sizing engine. Do not recalculate, alter, round or add any numeric recommendation.",
        "Do not invent prices, savings, payback, ROI, certifications, warranties, emissions reductions, or equipment specs.",
        "Explain that the figures are preliminary and require site verification. If the goal or location is uncertain, say the estimate is only a starting point.",
        "Return only two short paragraphs: what the selected system means, then why the estimate fits the provided load and goal.",
      ].join(" "),
      messages: [{
        role: "user",
        content: JSON.stringify({
          result,
          location: parsed.data.location,
          goal: parsed.data.goal,
          grid: parsed.data.grid,
        }),
      }],
    });
    const note = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n\n")
      .trim();
    if (!note) throw new Error("The AI service returned an empty recommendation.");
    return Response.json({ note });
  } catch (error) {
    if (error instanceof IntegrationUnavailableError) {
      return Response.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }
}
