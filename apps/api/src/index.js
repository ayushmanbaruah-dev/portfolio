import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { SYSTEM } from "./resume.js";

const {
  GEMINI_API_KEY, RESEND_API_KEY, CONTACT_TO,
  CORS_ORIGIN = "http://localhost:5173",
  GEMINI_CHAT_MODEL = "gemini-2.5-flash",
  GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts",
  GEMINI_VOICE = "Kore",
  RESEND_FROM = "Portfolio <onboarding@resend.dev>",
  PORT = 8787,
} = process.env;

const app = express();
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: CORS_ORIGIN.split(",").map((s) => s.trim()) }));
app.use(express.json({ limit: "16kb" }));

const limit = (max) =>
  rateLimit({
    windowMs: 10 * 60 * 1000, max, standardHeaders: true, legacyHeaders: false,
    message: { error: "Too many requests. Please try again in a few minutes." },
  });

const GEMINI = "https://generativelanguage.googleapis.com/v1beta/models";
async function gemini(model, body) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
  const r = await fetch(`${GEMINI}/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

// Gemini TTS returns raw 24 kHz 16-bit mono PCM; browsers need a WAV header.
function pcmToWav(pcm, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/chat", limit(30), async (req, res) => {
  const msgs = req.body?.messages;
  if (!Array.isArray(msgs) || !msgs.length || msgs.length > 20)
    return res.status(400).json({ error: "Invalid messages." });
  const contents = [];
  for (const m of msgs.slice(-10)) {
    if (!["user", "assistant"].includes(m?.role) || typeof m.text !== "string" || !m.text.trim() || m.text.length > 500)
      return res.status(400).json({ error: "Messages must be 1-500 characters." });
    contents.push({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] });
  }
  if (contents[contents.length - 1].role !== "user") return res.status(400).json({ error: "Invalid messages." });
  try {
    const data = await gemini(GEMINI_CHAT_MODEL, {
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents,
      generationConfig: { maxOutputTokens: 400, temperature: 0.3 },
    });
    const reply = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
    res.json({ reply: reply || "I couldn't generate a reply. Please try again." });
  } catch (e) {
    console.error(e.message);
    res.status(502).json({ error: "The assistant is offline right now." });
  }
});

app.post("/api/voice", limit(15), async (req, res) => {
  const text = req.body?.text;
  if (typeof text !== "string" || !text.trim() || text.length > 600)
    return res.status(400).json({ error: "Text must be 1-600 characters." });
  try {
    const data = await gemini(GEMINI_TTS_MODEL, {
      contents: [{ parts: [{ text: `Say in a warm, upbeat, friendly and smiling tone: ${text}` }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_VOICE } } },
      },
    });
    const b64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!b64) throw new Error("No audio returned");
    res.set("Content-Type", "audio/wav").send(pcmToWav(Buffer.from(b64, "base64")));
  } catch (e) {
    console.error(e.message);
    res.status(502).json({ error: "Voice is unavailable right now." });
  }
});

app.post("/api/contact", limit(5), async (req, res) => {
  const { name, email, message, website } = req.body || {};
  if (website) return res.json({ ok: true }); // honeypot: bots fill this hidden field
  const okStr = (s, max) => typeof s === "string" && s.trim().length > 0 && s.length <= max;
  if (!okStr(name, 100) || !okStr(message, 2000) || !okStr(email, 200) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Please fill in your name, a valid email and a message." });
  if (!RESEND_API_KEY || !CONTACT_TO) return res.status(500).json({ error: "Email is not configured." });
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: RESEND_FROM, to: [CONTACT_TO], reply_to: email,
        subject: `Portfolio message from ${name.replace(/[\r\n]/g, " ")}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
    });
    if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
    res.json({ ok: true });
  } catch (e) {
    console.error(e.message);
    res.status(502).json({ error: "Could not send the message. Please email me directly." });
  }
});

app.listen(PORT, () => console.log(`API listening on ${PORT}`));
