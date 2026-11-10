"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navigation = [
  { label: "About us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Store", href: "/store" },
  { label: "Our news", href: "/news" },
  { label: "Energy calculator", href: "/energy-calculator" },
  { label: "Contact", href: "/contact" },
];

type ChatMessage = { role: "user" | "assistant"; content: string };

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (message.role === "user" || message.role === "assistant") && typeof message.content === "string";
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="topline">
        <div className="container topline-inner">
          <div className="topline-contact">
            <a href="tel:+2348000000000"><span aria-hidden="true">⌕</span> +234 (800) 000 0000</a>
            <a href="mailto:hello@luxionsolar.example"><span aria-hidden="true">✉</span> hello@luxionsolar.example</a>
          </div>
          <p>Mon – Fri: 8:00am – 5:00pm <span className="topline-divider">|</span> Customer Service 24/7</p>
        </div>
      </div>
      <header className="site-header">
        <div className="container nav-inner">
          <Link className="brand" href="/" aria-label="Luxion Solar home">
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span className="brand-type"><strong>luxion</strong><small>SOLAR</small></span>
          </Link>
          <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
            {navigation.map((item) => (
              <Link key={item.href} onClick={() => setMenuOpen(false)} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link className="button button-small nav-cta" href="/contact">Get a quote <span aria-hidden="true">↗</span></Link>
          </nav>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span /><span />
          </button>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="container footer-main">
        <div className="footer-about">
          <Link className="brand brand-light" href="/">
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span className="brand-type"><strong>luxion</strong><small>SOLAR</small></span>
          </Link>
          <p>We believe better energy should feel simple. We help homes and businesses move toward a brighter, more dependable future.</p>
          <div className="social-links" aria-label="Social links">
            <a href="https://www.instagram.com/" aria-label="Instagram">ig</a>
            <a href="https://www.linkedin.com/" aria-label="LinkedIn">in</a>
            <a href="https://www.facebook.com/" aria-label="Facebook">f</a>
            <a href="https://www.youtube.com/" aria-label="YouTube">▶</a>
          </div>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/about">About Luxion</Link><Link href="/services">Our services</Link><Link href="/store">Solar solutions</Link><Link href="/news">Ideas & insights</Link>
        </div>
        <div>
          <h3>Useful links</h3>
          <Link href="/energy-calculator">Energy calculator</Link><Link href="/contact">Get in touch</Link><Link href="/contact">Book a site visit</Link><a href="#projects">Our projects</a>
        </div>
        <div className="footer-contact">
          <h3>Let’s talk energy</h3>
          <p>Have a question? Our team is happy to help you find a good place to start.</p>
          <a className="footer-email" href="mailto:hello@luxionsolar.example">hello@luxionsolar.example</a>
          <a href="tel:+2348000000000">+234 (800) 000 0000</a>
          <a className="footer-direction" href="https://maps.google.com/?q=Lagos+Nigeria">Get directions <span>↗</span></a>
        </div>
      </div>
      <div className="container footer-bottom"><span>© 2025 Luxion Solar. Placeholder brand content for demonstration.</span><span>Thoughtfully powered for tomorrow.</span></div>
    </footer>
  );
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      let id = window.sessionStorage.getItem("luxion-ai-session");
      if (!id) {
        id = window.crypto.randomUUID();
        window.sessionStorage.setItem("luxion-ai-session", id);
      }
      const saved = window.localStorage.getItem(`luxion-ai-chat:${id}`);
      const parsedHistory: unknown = saved ? JSON.parse(saved) : [];
      const history = Array.isArray(parsedHistory) ? parsedHistory.filter(isChatMessage) : [];
      window.requestAnimationFrame(() => {
        setSessionId(id);
        setMessages(history.slice(-30));
      });
    } catch (error) {
      console.error("Could not restore assistant history", error);
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    try {
      window.localStorage.setItem(`luxion-ai-chat:${sessionId}`, JSON.stringify(messages.slice(-30)));
    } catch (error) {
      console.error("Could not save assistant history", error);
    }
  }, [messages, sessionId]);

  useEffect(() => {
    if (open) {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      chatEnd.current?.scrollIntoView({ behavior, block: "end" });
    }
  }, [messages, open]);

  async function sendMessage(content: string) {
    const text = content.trim();
    if (!text || pending) return;
    const id = sessionId || window.crypto.randomUUID();
    const conversation = [...messages, { role: "user" as const, content: text }].slice(-20);
    setSessionId(id);
    setDraft("");
    setPending(true);
    setMessages([...conversation, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, messages: conversation }),
      });
      if (!response.ok) {
        const result = await response.json() as { error?: string };
        throw new Error(result.error ?? "The assistant is unavailable right now.");
      }
      if (!response.body) throw new Error("The assistant returned an empty response.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let answer = "";
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          const event = JSON.parse(data) as { text?: string; error?: string };
          if (event.error) throw new Error(event.error);
          if (event.text) {
            answer += event.text;
            setMessages((current) => [...current.slice(0, -1), { role: "assistant", content: answer }]);
          }
        }
        if (done) break;
      }
      if (!answer) setMessages((current) => [...current.slice(0, -1), { role: "assistant", content: "I couldn’t prepare a reply. Please try WhatsApp or contact our team." }]);
    } catch (error) {
      console.error("Assistant request failed", error);
      const explanation = error instanceof Error ? error.message : "The assistant is unavailable right now.";
      setMessages((current) => [...current.slice(0, -1), { role: "assistant", content: `${explanation} You can reach a person on WhatsApp below.` }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="assistant-widget">
      {open && (
        <section className="assistant-panel" aria-label="Luxion Solar AI assistant">
          <div className="assistant-head">
            <span className="assistant-avatar">✦</span>
            <div><strong>Luxion Solar AI</strong><small><i /> AI assistant · server connection required</small></div>
            <button type="button" aria-label="Close assistant" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="assistant-content" role="log" aria-live="polite" aria-label="Chat messages">
            {!messages.length && <p className="assistant-note">Hi there! Ask about solar options, system sizing or how to reach our team.</p>}
            {!!messages.length && messages.map((message, index) => <p className={`assistant-bubble ${message.role}`} key={`${message.role}-${index}`}>{message.content || (pending ? <span className="typing-indicator" aria-label="Assistant is typing"><i /><i /><i /></span> : "")}</p>)}
            {!messages.length && <div className="assistant-quick">
              <button type="button" disabled={pending} onClick={() => void sendMessage("How do I size a solar system?")}>How do I size a system?</button>
              <button type="button" disabled={pending} onClick={() => void sendMessage("What services do you offer?")}>Explore your services</button>
              <button type="button" disabled={pending} onClick={() => void sendMessage("How can I contact the team?")}>Talk to the team</button>
            </div>}
            <div ref={chatEnd} />
            <a className="assistant-whatsapp" href="https://wa.me/2348000000000">Ready to speak with a human expert? <strong>Chat on WhatsApp ↗</strong></a>
          </div>
          <form className="assistant-compose" onSubmit={(event) => { event.preventDefault(); void sendMessage(draft); }}>
            <input aria-label="Ask Luxion Solar" placeholder="Ask us anything..." value={draft} onChange={(event) => setDraft(event.target.value)} disabled={pending} />
            <button aria-label="Send message" type="submit" disabled={pending || !draft.trim()}>↑</button>
          </form>
          <div className="assistant-credit">Powered by Luxion Solar AI</div>
        </section>
      )}
      <button className="assistant-launcher" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="assistant-launcher-icon">✦</span><span>{open ? "Close assistant" : "Ask Luxion AI"}</span><b>1</b>
      </button>
    </div>
  );
}
