import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { IntegrationUnavailableError } from "@/lib/server/errors";

type Bucket = "contact" | "calculator" | "ai" | "checkout";

const limits: Record<Bucket, { requests: number; duration: `${number} m` | `${number} h` }> = {
  contact: { requests: 5, duration: "1 h" },
  calculator: { requests: 4, duration: "1 h" },
  ai: { requests: 15, duration: "1 m" },
  checkout: { requests: 6, duration: "1 h" },
};

const limiters = new Map<Bucket, Ratelimit>();
let redis: Redis | undefined;

export async function enforceRateLimit(request: Request, bucket: Bucket) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new IntegrationUnavailableError("Upstash rate limiting");

  if (!redis) redis = new Redis({ url, token });
  let limiter = limiters.get(bucket);
  if (!limiter) {
    const config = limits[bucket];
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.requests, config.duration),
      prefix: `luxion:${bucket}`,
    });
    limiters.set(bucket, limiter);
  }

  const ip =
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  return limiter.limit(ip);
}
