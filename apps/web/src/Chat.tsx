import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { API, QUICK_QUESTIONS } from "./data";

type Msg = { role: "user" | "assistant"; text: string };
const GREETING: Msg = { role: "assistant", text: "J.A.R.V.I.S. online. Ask me anything about Aayushman's work, skills or education." };

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const end = useRef<HTMLDivElement>(null);

  const stop = () => { audio.current?.pause(); audio.current = null; setSpeaking(null); };

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    const next: Msg[] = [...msgs, { role: "user", text: t }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const r = await fetch(`${API}/api/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      const d = await r.json();
      setMsgs([...next, { role: "assistant", text: r.ok ? d.reply : d.error ?? "Something went wrong." }]);
    } catch {
      setMsgs([...next, { role: "assistant", text: "I can't reach the server. Please try again shortly." }]);
    } finally {
      setBusy(false);
      setTimeout(() => end.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  async function speak(i: number) {
    if (speaking === i) return stop();
    stop(); setSpeaking(i);
    try {
      const r = await fetch(`${API}/api/voice`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msgs[i].text }),
      });
      if (!r.ok) throw new Error();
      const a = new Audio(URL.createObjectURL(await r.blob()));
      audio.current = a;
      a.onended = () => setSpeaking(null);
      await a.play();
    } catch { setSpeaking(null); }
  }

  return (
    <>
      <button className="chat-fab" aria-label={open ? "Close assistant" : "Open assistant"} onClick={() => { if (open) stop(); setOpen(!open); }}>
        <span className="reactor mini" aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.section className="chat hud" role="dialog" aria-label="J.A.R.V.I.S. assistant"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.2 }}>
            <header><span className="dot" /> J.A.R.V.I.S.<button className="link" onClick={() => { stop(); setOpen(false); }} aria-label="Close">Close</button></header>
            <div className="chat-log" aria-live="polite">
              {msgs.map((m, i) => (
                <div key={i} className={`bubble ${m.role}`}>
                  {m.text}
                  {m.role === "assistant" && (
                    <button className="link speak" onClick={() => speak(i)} aria-label={speaking === i ? "Stop voice" : "Play voice"}>
                      {speaking === i ? "Stop voice" : "Play voice"}
                    </button>
                  )}
                </div>
              ))}
              {busy && <div className="bubble assistant muted">Thinking…</div>}
              <div ref={end} />
            </div>
            {msgs.length === 1 && (
              <div className="quick">{QUICK_QUESTIONS.map((q) => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); send(input); }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder="Ask about Aayushman" aria-label="Your question" />
              <button type="submit" disabled={busy || !input.trim()}>Send</button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
