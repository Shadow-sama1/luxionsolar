import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { assistantFaq } from "@/content/assistant";
import { services } from "@/content/site";
import { getPrisma } from "@/lib/prisma";
import { IntegrationUnavailableError } from "@/lib/server/errors";
import { enforceRateLimit } from "@/lib/server/rate-limit";

export const maxDuration = 30;

const chatSchema = z.object({
  sessionId: z.string().uuid(),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(4000),
  })).min(1).max(20),
});

function retrieveKnowledge(query: string, products: { name: string; description: string; specifications: unknown; priceNgn: { toString(): string } | null }[]) {
  const words = query.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2);
  const serviceInfo = services
    .filter((service) => words.some((word) => `${service.title} ${service.description}`.toLowerCase().includes(word)))
    .map((service) => `${service.title}: ${service.description}`);
  const faqInfo = assistantFaq
    .filter((item) => words.some((word) => `${item.question} ${item.answer}`.toLowerCase().includes(word)))
    .map((item) => `Q: ${item.question}\nA: ${item.answer}`);
  const productInfo = products
    .filter((product) => words.some((word) => `${product.name} ${product.description} ${JSON.stringify(product.specifications)}`.toLowerCase().includes(word)))
    .slice(0, 5)
    .map((product) => `Product: ${product.name}\nDetails: ${product.description}\nSpecifications: ${JSON.stringify(product.specifications)}\nPrice: ${product.priceNgn ? `₦${product.priceNgn}` : "Custom quote"}`);

  return [
    "Luxion Solar service information:",
    ...(serviceInfo.length ? serviceInfo : services.map((service) => `${service.title}: ${service.description}`)),
    "Frequently asked questions:",
    ...(faqInfo.length ? faqInfo : assistantFaq.map((item) => `Q: ${item.question}\nA: ${item.answer}`)),
    "Matching store products:",
    ...(productInfo.length ? productInfo : ["No matching product listing is currently available. Do not guess product details."]),
  ].join("\n\n");
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = chatSchema.safeParse(payload);
  if (!parsed.success || parsed.data.messages.at(-1)?.role !== "user") {
    return Response.json({ error: "Send a valid chat message to continue." }, { status: 400 });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "The AI assistant is not configured on this server." }, { status: 503 });

  try {
    const rate = await enforceRateLimit(request, "ai");
    if (!rate.success) {
      return Response.json(
        { error: "Too many messages. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }

    const products = await getPrisma().product.findMany({
      where: { isActive: true },
      select: { name: true, description: true, specifications: true, priceNgn: true },
      take: 100,
    });
    const latestQuestion = parsed.data.messages.at(-1)?.content ?? "";
    const knowledge = retrieveKnowledge(latestQuestion, products);
    const anthropic = new Anthropic({ apiKey });
    const stream = anthropic.messages.stream({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
      max_tokens: 700,
      system: [
        "You are Luxion Solar's customer support assistant. Only answer questions about Luxion Solar, solar energy basics, the published Luxion services and the store knowledge provided below.",
        "Use only facts in the supplied knowledge. Never invent product specifications, prices, certifications, warranties, customer results, or company facts.",
        "Luxion systems are custom-quoted unless the supplied product data explicitly contains a price. If uncertain, say so plainly and direct the customer to WhatsApp or the contact page.",
        "Do not provide electrical installation instructions that could put a user at risk. Recommend a qualified solar professional for system design and installation.",
        "Use a warm, concise tone. You may point customers to /energy-calculator and /contact.",
        `Knowledge base:\n${knowledge}`,
      ].join("\n\n"),
      messages: parsed.data.messages.map(({ role, content }) => ({ role, content })),
    });
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("AI assistant stream failed", error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "The assistant could not finish this reply. Please try WhatsApp." })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (error instanceof IntegrationUnavailableError) {
      return Response.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }
}
