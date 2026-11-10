# Luxion Solar

A Next.js App Router experience for a placeholder Nigerian solar-energy brand. Brand copy, review text, project details, partner names and contact details are illustrative and should be replaced before launch.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validate

```bash
npm run lint
npm run test:sizing
npm run build
```

## Content and design

- Replace homepage cards, project stories, reviews, services and article teasers in [`content/site.ts`](./content/site.ts).
- Replace assistant FAQs in [`content/assistant.ts`](./content/assistant.ts).
- Replace placeholder phone, email and WhatsApp links in [`app/components/site-shell.tsx`](./app/components/site-shell.tsx), [`app/components/home-interactions.tsx`](./app/components/home-interactions.tsx) and [`app/page.tsx`](./app/page.tsx).
- Change the shared site and assistant themes in [`app/globals.css`](./app/globals.css). Assistant colors are scoped to `.assistant-widget`.
- Homepage photos currently use Unsplash URLs and are configured in [`next.config.ts`](./next.config.ts).
- About, Services, Store, News and Contact starter pages use [`app/[slug]/page.tsx`](./app/[slug]/page.tsx).

## Energy estimate

The calculator is available at `/energy-calculator` and from the home-page package cards. Its deterministic estimate is implemented in [`lib/sizing.ts`](./lib/sizing.ts) and covered by `npm run test:sizing`. The current panel estimate uses illustrative state-level peak-sun-hour assumptions, 80% system efficiency and 550 W modules; inverter sizing applies 25% headroom; battery capacity assumes eight hours of autonomy, 80% depth of discharge and 90% conversion efficiency. These are planning assumptions, not an engineering specification. Validate assumptions and local irradiance data with a qualified designer before using the results commercially.

Calculator progress and the assistant conversation are stored in browser local storage. The report print action uses the browser print dialog. Lead saving, PDF/email delivery and AI analysis are implemented as server integrations and return a clear configuration error until credentials and a database are available.

## Server integration setup

The Prisma models are in [`prisma/schema.prisma`](./prisma/schema.prisma); Prisma 7 configuration is in [`prisma.config.ts`](./prisma.config.ts). Product categories can be seeded from [`prisma/seed.mjs`](./prisma/seed.mjs).

1. Copy `.env.example` to `.env` and set your Neon Postgres, Upstash, Resend and Anthropic credentials.
2. Run `npm run db:generate`, `npm run db:migrate:dev` and `npm run db:seed`.
3. Start the app with `npm run dev`.

The Contact form posts to `/api/contact`. The Energy Calculator posts to `/api/calculator/lead`, which recomputes sizing on the server, saves the lead, generates a PDF and emails the report and sales notification. Its AI explanation is generated separately by `/api/calculator/analysis`; the assistant streams from `/api/ai/chat`. These routes return explicit configuration errors until their required services are configured. Never expose secret keys to browser code.

## Deployment and remaining integrations

Deploy to Vercel after setting all required environment variables and applying the Prisma migrations. Production use still requires verified business contact details and real project imagery. Store inventory, cart/checkout UI, Paystack initialization and webhook handling, production blog/RSS, sitemap and robots routes are not implemented yet. Do not treat sample reviews, sample performance statements, placeholder partner names or contact values as verified facts.
