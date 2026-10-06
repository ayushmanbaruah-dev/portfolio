import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Chat from "./Chat";
import { API, EMAIL, LINKS, PROJECTS, Project, SKILLS } from "./data";

const NAV = ["about", "projects", "experience", "skills", "contact"];
const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Reactor({ className = "" }: { className?: string }) {
  return (
    <div className={`reactor ${className}`} aria-hidden="true">
      <i /><i /><i /><b />
    </div>
  );
}

function Boot() {
  const [done, setDone] = useState(reduced);
  useEffect(() => {
    if (done) return;
    const end = () => setDone(true);
    const t = setTimeout(end, 1300);
    window.addEventListener("keydown", end); window.addEventListener("pointerdown", end);
    return () => { clearTimeout(t); window.removeEventListener("keydown", end); window.removeEventListener("pointerdown", end); };
  }, [done]);
  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="boot" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
          <Reactor /><p className="mono">Initializing J.A.R.V.I.S.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProjectModal({ p, onClose }: { p: Project; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal hud" role="dialog" aria-modal="true" aria-label={p.name}
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        <h3>{p.name}</h3>
        <p className="muted">{p.summary}</p>
        <ul className="specs">{p.specs.map((s) => <li key={s}>{s}</li>)}</ul>
        <div className="chips">{p.stack.map((s) => <span key={s}>{s}</span>)}</div>
        <div className="row">
          <a className="btn" href={p.repo} target="_blank" rel="noreferrer">View on GitHub</a>
          <button className="btn ghost" onClick={onClose} autoFocus>Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Contact() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [err, setErr] = useState("");
  const [f, setF] = useState({ name: "", email: "", message: "", website: "" });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault(); setState("sending");
    try {
      const r = await fetch(`${API}/api/contact`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setState("ok"); setF({ name: "", email: "", message: "", website: "" });
    } catch (x) { setErr(x instanceof Error && x.message ? x.message : "Could not send the message."); setState("err"); }
  }
  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent("Hello Aayushman")}&body=${encodeURIComponent(f.message)}`;

  return (
    <form className="contact hud" onSubmit={submit}>
      <label>Name<input required maxLength={100} value={f.name} onChange={set("name")} autoComplete="name" /></label>
      <label>Email<input required type="email" maxLength={200} value={f.email} onChange={set("email")} autoComplete="email" /></label>
      <label>Message<textarea required rows={5} maxLength={2000} value={f.message} onChange={set("message")} /></label>
      <input className="trap" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={f.website} onChange={set("website")} />
      <div className="row">
        <button className="btn" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}</button>
        <a className="btn ghost" href={`https://mail.google.com/mail/?view=cm&to=${EMAIL}&su=${encodeURIComponent("Hello Aayushman")}`} target="_blank" rel="noreferrer">Open in Gmail</a>
        <a className="link" href={mailto}>Use email app</a>
      </div>
      <p role="status" className={state === "err" ? "error" : "muted"}>
        {state === "ok" && "Message sent. I'll reply to the address you entered."}
        {state === "err" && `${err} You can also email ${EMAIL}.`}
      </p>
    </form>
  );
}

export default function App() {
  const [open, setOpen] = useState<Project | null>(null);
  return (
    <>
      <Boot />
      <header className="nav">
        <a href="#top" className="mono brand" aria-label="Home">AB</a>
        <nav aria-label="Primary">{NAV.map((n) => <a key={n} href={`#${n}`}>{n[0].toUpperCase() + n.slice(1)}</a>)}</nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-text">
            <p className="status mono"><span className="dot" /> J.A.R.V.I.S. online</p>
            <h1>Aayushman Baruah</h1>
            <p className="lead">AI/ML engineer who builds search systems and machine learning pipelines, from data to a deployed app.</p>
            <div className="row">
              <a className="btn" href="#projects">See my projects</a>
              <a className="btn ghost" href="#contact">Hire me</a>
            </div>
          </div>
          <div className="hero-viz hud"><Reactor className="big" /><div className="scan" aria-hidden="true" /></div>
        </section>

        <section id="about">
          <h2>About</h2>
          <p>I recently finished a B.Tech in Computer Science (Data Science) at MCKV Institute of Engineering, Howrah, and I'm looking for AI/ML Engineer roles. I like projects with a full path: data, model, evaluation, API and container.</p>
          <dl className="facts">
            <div><dt>Education</dt><dd>B.Tech CSE (Data Science), MCKV Institute of Engineering, 2021 to 2025. GPA 7.01</dd></div>
            <div><dt>Certifications</dt><dd>Generative AI (Great Learning), Python (Udemy)</dd></div>
          </dl>
          <div className="row">
            <a className="btn ghost" href={LINKS.github} target="_blank" rel="noreferrer">GitHub</a>
            <a className="btn ghost" href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="btn ghost" href="/Aayushman_Baruah_Resume.pdf" download>Download resume</a>
          </div>
        </section>

        <section id="projects">
          <h2>Projects</h2>
          <div className="grid">
            {PROJECTS.map((p) => (
              <button key={p.id} className="card hud" onClick={() => setOpen(p)} aria-label={`Open details for ${p.name}`}>
                <h3>{p.name}</h3><p className="muted">{p.tagline}</p>
                <div className="chips">{p.stack.map((s) => <span key={s}>{s}</span>)}</div>
                <span className="more">View details</span>
              </button>
            ))}
          </div>
        </section>

        <section id="experience">
          <h2>Experience</h2>
          <article className="job hud">
            <h3>Full Stack Web Development Intern, ARDENT</h3>
            <p className="mono muted">Kolkata, July to August 2024</p>
            <p>Built features for a job portal on the MERN stack: user authentication, database operations and frontend-backend integration. Debugged and tested components and helped with documentation.</p>
          </article>
        </section>

        <section id="skills">
          <h2>Skills</h2>
          <div className="skills">
            {SKILLS.map((g) => (
              <div key={g.group} className="hud panel">
                <h3>{g.group}</h3>
                {g.items.map(([n, v]) => (
                  <div key={n} className="bar"><span>{n}</span><div role="img" aria-label={`${n} ${v} percent`}><i style={{ width: `${v}%` }} /></div></div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section id="contact">
          <h2>Hire me</h2>
          <p className="muted">Send a message and it lands straight in my inbox.</p>
          <Contact />
        </section>
      </main>
      <footer>© {new Date().getFullYear()} Aayushman Baruah</footer>

      <AnimatePresence>{open && <ProjectModal p={open} onClose={() => setOpen(null)} />}</AnimatePresence>
      <Chat />
    </>
  );
}
