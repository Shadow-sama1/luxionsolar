"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (formData.get("website")) return;
    setSubmitting(true);
    setStatus("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const result = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "We couldn’t send your message.");
      setStatus(result.message ?? "Your message has been sent.");
      form.reset();
    } catch (error) {
      console.error("Contact form submission failed", error);
      setStatus(error instanceof Error ? error.message : "The request failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={submitMessage}>
      <div className="contact-form-grid">
        <label>Your name<input name="name" autoComplete="name" required placeholder="Your name" /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
        <label>Phone (optional)<input name="phone" type="tel" autoComplete="tel" placeholder="+234" /></label>
        <label>Subject<input name="subject" required placeholder="How can we help?" /></label>
        <label className="contact-full">Your message<textarea name="message" rows={5} required placeholder="Tell us a little about what you need..." /></label>
        <label className="contact-trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <button className="button" type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send message"} <span>↗</span></button>
      <p className="contact-form-note" role="status" aria-live="polite">{status || "Your message will be sent when the database, rate limiter and email service are configured."}</p>
    </form>
  );
}
