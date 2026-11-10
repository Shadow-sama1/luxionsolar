"use client";

import Link from "next/link";
import { useState } from "react";
import EnergyCalculator from "@/app/components/energy-calculator";
import { reviews } from "@/content/site";

export function CalculatorDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="button button-outline" type="button" onClick={() => setOpen(true)}>Size this for my home <span>↗</span></button>
      {open && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <section className="calculator-modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
          <div className="modal-top"><div><span className="eyebrow"><span /> Your solar journey starts here</span><h2 id="modal-heading">Find your starting point.</h2></div><button type="button" className="modal-close" aria-label="Close energy calculator" onClick={() => setOpen(false)}>×</button></div>
          <EnergyCalculator embedded />
          <Link className="modal-full-link" href="/energy-calculator" onClick={() => setOpen(false)}>Open full-page calculator ↗</Link>
        </section>
      </div>}
    </>
  );
}

export function ReviewCarousel() {
  const [start, setStart] = useState(0);
  const visible = [0, 1, 2].map((offset) => reviews[(start + offset) % reviews.length]);
  return (
    <div className="review-carousel">
      <div className="review-cards">{visible.map((review) => <article className="review-card" key={review.name}>
        <div className="review-stars" aria-label="5 out of 5 stars">★★★★★</div>
        <p>“{review.quote}”</p>
        <div className="review-person"><span>{review.initials}</span><div><strong>{review.name}</strong><small>{review.role}</small></div></div>
      </article>)}</div>
      <div className="review-controls"><span>{String(start + 1).padStart(2, "0")} <i>/ 05</i></span><div><button type="button" aria-label="Previous reviews" onClick={() => setStart((start + reviews.length - 1) % reviews.length)}>←</button><button type="button" aria-label="Next reviews" onClick={() => setStart((start + 1) % reviews.length)}>→</button></div></div>
    </div>
  );
}

export function WhatsAppButton() {
  return <a className="whatsapp-float" href="https://wa.me/2348000000000" aria-label="Chat with Luxion Solar on WhatsApp" target="_blank" rel="noreferrer"><span aria-hidden="true">◉</span><span className="whatsapp-label">Let’s chat</span></a>;
}
