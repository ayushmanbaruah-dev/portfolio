# Aayushman Baruah — Portfolio

Stark-inspired portfolio with a resume-grounded AI assistant (Gemini), optional voice replies, and a "Hire me" form that emails you (Resend).

```
apps/web   React + Vite + TypeScript + Framer Motion  (Render Static Site)
apps/api   Node + Express: /api/chat /api/voice /api/contact /api/health  (Render Web Service)
render.yaml  Render Blueprint for both services
```

## Run locally
```bash
cp .env.example .env            # fill in keys (never commit .env)
cd apps/api && npm install && npm run dev      # http://localhost:8787
cd apps/web && npm install && VITE_API_URL=http://localhost:8787 npm run dev   # http://localhost:5173
```
Needs Node 20+.

## Deploy on Render
1. Push this folder to a GitHub repo.
2. Render dashboard → **New → Blueprint** → pick the repo. It creates `portfolio-api` and `portfolio-web`.
3. On `portfolio-api` set: `GEMINI_API_KEY`, `RESEND_API_KEY`, `CONTACT_TO`, and `CORS_ORIGIN` (your web URL, e.g. `https://portfolio-web.onrender.com`).
4. On `portfolio-web` set `VITE_API_URL` to the API URL (e.g. `https://portfolio-api.onrender.com`), then redeploy the web service (it's baked in at build time).
5. Free web services sleep when idle, so the first chat/email after a pause can take ~30–60 s.

## Email (Resend)
With the free test sender (`onboarding@resend.dev`), mail is only delivered to the address your Resend account was created with, so set `CONTACT_TO` to that address (an AOL address won't receive it). To deliver to AOL, verify your own domain in Resend and set `RESEND_FROM` to an address on it.

## Customize
- Chat knowledge: `apps/api/src/resume.js` (the only facts the assistant may use)
- Projects, skill levels, links: `apps/web/src/data.ts`
- Colours and fonts: top of `apps/web/src/styles.css`
- Voice: set `GEMINI_VOICE` (try Aoede, Zephyr, Leda, Kore). Voice plays only when a visitor presses "Play voice".
- Model names are env vars in case Google renames them.
