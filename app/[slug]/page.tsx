import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContactForm from "@/app/components/contact-form";
import { news, services } from "@/content/site";

const routeNames = ["about", "services", "store", "news", "contact"];
export const instant = false;

const pageDetails: Record<string, { eyebrow: string; title: string; intro: string }> = {
  about: {
    eyebrow: "A little about Luxion",
    title: "Energy for the life you’re building.",
    intro: "We help homes and businesses explore better energy with thoughtful guidance, considered system design and support at every step.",
  },
  services: {
    eyebrow: "What we do",
    title: "Good energy starts with a good plan.",
    intro: "From the first conversation to ongoing care, explore flexible ways we can help you move toward more dependable power.",
  },
  store: {
    eyebrow: "Solar solutions",
    title: "The right pieces, thoughtfully matched.",
    intro: "Explore the kinds of solar equipment we can help you source. Final product choices and pricing are confirmed after a needs assessment.",
  },
  news: {
    eyebrow: "Ideas & insights",
    title: "A little inspiration for brighter days.",
    intro: "Practical guides and useful perspectives to help make your next energy decision feel easier.",
  },
  contact: {
    eyebrow: "Let’s talk energy",
    title: "A good conversation is a great place to start.",
    intro: "Tell us what matters to you and we’ll help you find a thoughtful next step. Our contact details on this page are placeholders.",
  },
};

const productCategories = ["Solar panels", "Inverters", "Battery storage", "Charge controllers", "Accessories"];
const values = [
  ["Start by listening", "We take the time to understand the people and priorities behind every project."],
  ["Make it clear", "We explain options in straightforward language so decisions feel considered, not rushed."],
  ["Stay alongside", "We believe good support continues after installation and commissioning."],
];

export function generateStaticParams() {
  return routeNames.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const details = pageDetails[slug];
  return details ? { title: details.eyebrow, description: details.intro } : {};
}

function PageBanner({ slug, title }: { slug: string; title: string }) {
  return (
    <section className="page-banner">
      <div className="container">
        <div className="page-breadcrumb"><Link href="/">Home</Link><span>/</span><span>{title}</span></div>
        <span className="eyebrow eyebrow-on-dark"><span /> {pageDetails[slug].eyebrow}</span>
        <h1>{pageDetails[slug].title}</h1>
        <p>{pageDetails[slug].intro}</p>
      </div>
    </section>
  );
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const details = pageDetails[slug];
  if (!details) notFound();

  return (
    <main>
      <PageBanner slug={slug} title={details.eyebrow} />
      {slug === "about" && <div className="container content-page">
        <section className="content-intro-grid"><div><span className="eyebrow"><span /> Our point of view</span><h2>Better energy should feel <em>simple.</em></h2></div><div><p>Luxion Solar is a placeholder brand experience created to demonstrate a modern solar-energy website. Our purpose, history and team information are intentionally written as original sample content and should be replaced with verified company details.</p><p>We imagine a future where dependable energy is easier to understand, easier to plan for and more thoughtfully suited to everyday life.</p></div></section>
        <section className="mission-grid"><article><span>01</span><h3>Our mission</h3><p>Make the path to more dependable energy clearer for homes and businesses.</p></article><article><span>02</span><h3>Our vision</h3><p>Help more people feel confident about the choices that power their future.</p></article></section>
        <section className="values-section"><div className="section-heading"><span className="eyebrow"><span /> What guides us</span><h2>Our values, in <em>practice.</em></h2></div><div className="page-card-grid">{values.map(([title, description], index) => <article className="page-card" key={title}><span className="page-card-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
        <section className="timeline-section"><span className="eyebrow"><span /> Our story</span><h2>A journey that’s <em>just beginning.</em></h2><p>Company milestones will be added here when verified source material is available.</p><div className="timeline-items"><article><strong>Today</strong><span>Building a more considered solar experience.</span></article><article><strong>What’s next</strong><span>Growing with the communities we serve.</span></article><article><strong>Our future</strong><span>Powering brighter possibilities together.</span></article></div></section>
        <section className="download-placeholder"><div><span className="eyebrow"><span /> Helpful resources</span><h2>Company resources</h2><p>Datasheet and brochure downloads can be added when approved files are ready.</p></div><span className="download-label">Downloads coming soon</span></section>
      </div>}
      {slug === "services" && <div className="container content-page"><section className="page-card-grid service-page-grid">{[
        ...services,
        { title: "Assembling", description: "Careful system assembly and preparation, with components matched to your design.", icon: "assemble" },
        { title: "Component sales", description: "Guidance on exploring quality solar components for your home or business.", icon: "components" },
        { title: "Repairs & service", description: "Maintenance and troubleshooting support to help your system perform as intended.", icon: "service" },
      ].map((service, index) => <article className="page-card" key={service.title}><span className="page-card-number">0{index + 1}</span><span className="page-card-symbol">{["⌖", "▧", "☼", "⌘", "◈", "↻"][index]}</span><h3>{service.title}</h3><p>{service.description}</p><Link className="text-link" href="/contact">Talk to our team <span>↗</span></Link></article>)}</section><section className="content-cta"><div><span className="eyebrow eyebrow-on-dark"><span /> Find a good place to begin</span><h2>Let’s talk about what matters to you.</h2></div><Link className="button button-gold" href="/contact">Request a consultation <span>↗</span></Link></section></div>}
      {slug === "store" && <div className="container content-page"><section className="store-category-grid">{productCategories.map((category, index) => <article className="store-category" key={category}><span>{["☼", "⌁", "▱", "◉", "✦"][index]}</span><h2>{category}</h2><p>Explore suitable options with guidance from our team.</p><Link href="/contact">Ask about {category.toLowerCase()} ↗</Link></article>)}</section><div className="store-note"><strong>Every system is custom-quoted.</strong><p>We don’t publish product prices or specifications in this placeholder store. Final availability, compatibility, warranty and pricing depend on your project and are confirmed by the Luxion team.</p><Link className="button" href="/contact">Request product guidance <span>↗</span></Link></div></div>}
      {slug === "news" && <div className="container content-page"><section className="news-page-grid">{news.map((item) => <article className="news-page-card" key={item.title}><div className="news-page-image"><Image src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=1000&q=85`} alt="" fill sizes="(max-width: 700px) 90vw, 40vw" /></div><div><span className="news-category">{item.category}</span><h2>{item.title}</h2><p>{item.date} · 4 min read</p><p>Sample editorial content for the Luxion Solar website. Replace this teaser with a reviewed article before publication.</p><Link className="text-link" href="/contact">Ask us a question <span>↗</span></Link></div></article>)}</section><p className="content-note">These article teasers are illustrative placeholders; an editorial feed and individual article pages are not connected in this starter.</p></div>}
      {slug === "contact" && <div className="container content-page contact-page"><div className="contact-details"><span className="eyebrow"><span /> We’re here to help</span><h2>Let’s make your next step <em>clear.</em></h2><p>Share a question, explore a project or ask our team to help you size a system. Replace these placeholder contact details with verified business information before launch.</p><a href="tel:+2348000000000"><small>Call our team</small><strong>+234 (800) 000 0000</strong></a><a href="mailto:hello@luxionsolar.example"><small>Email</small><strong>hello@luxionsolar.example</strong></a><div className="contact-hours"><small>Office hours</small><strong>Monday – Friday · 8:00am – 5:00pm</strong><span>Customer service availability is a placeholder.</span></div><a className="map-placeholder" href="https://maps.google.com/?q=Lagos+Nigeria" target="_blank" rel="noreferrer">Map location placeholder · Lagos, Nigeria ↗</a></div><div className="contact-form-wrap"><h2>Drop us a line</h2><p>We’ll help you find a good place to begin.</p><ContactForm /></div></div>}
    </main>
  );
}
