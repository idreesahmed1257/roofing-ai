# Schoenherr Roofing — AI Voice Receptionist Demo

Minimal roofing company demo site with a **Gemini Live** voice sales receptionist grounded on your knowledge base via **Upstash Vector**.

## Setup

1. Put keys in `.env.local` (already supported):

```env
GEMINI_API_KEY=...
UPSTASH_VECTOR_REST_URL=...
UPSTASH_VECTOR_REST_TOKEN=...
GEMINI_LIVE_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
GEMINI_EMBED_DIM=768
```

(`GEMENI_API_KEY` typo is also accepted.)

**Vercel:** `.env*` is gitignored, so keys are **not** uploaded with git. Add the same variables in Vercel → Project → Settings → Environment Variables (Production + Preview), then **Redeploy**. Check `GET /api/health` — it reports which required keys are present (values are never returned).

Brevo email alerts (when a lead is booked):

```env
BREVO_API_KEY=xkeysib-...
BREVO_TO_EMAIL=you@yourdomain.com
BREVO_FROM_EMAIL=verified-sender@yourdomain.com
BREVO_FROM_NAME=Schoenherr Roofing Demo
```

2. Index knowledge (markdown in `knowledge/`):

```bash
npm run index-knowledge
```

3. Run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Talk to receptionist**.

## Pitch script

> “Yesterday there was a hailstorm and I found pebbles/granules from my roof by the door and gutters. What do you suggest?”

The bot should ask clarifying questions and recommend a consultation before repair/replace, then offer to book an estimate.

## Add more knowledge

Drop more `.md` files into `knowledge/` and re-run `npm run index-knowledge`.
