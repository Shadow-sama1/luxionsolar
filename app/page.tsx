import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { projects, services, packages, news } from "@/content/site";
import { CalculatorDialog, ReviewCarousel } from "@/app/components/home-interactions";

const photo = (id: string, width = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

function SectionHeading({ eyebrow, title, description, light = false }: { eyebrow: string; title: ReactNode; description?: string; light?: boolean }) {
  return <div className={`section-heading ${light ? "heading-light" : ""}`}><span className="eyebrow"><span /> {eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>;
}

export default function Home() {
  return (
    <main>
      <section className="hero">
        <Image className="hero-image" src={photo("photo-1509391366360-2e959784a276", 2200)} alt="Solar panels catching the afternoon sun" fill priority sizes="100vw" />
        <div className="hero-shade" />
        <div className="container hero-content">
          <span className="hero-eyebrow"><span /> Energy that moves you forward</span>
          <h1>Power your life.<br /><em>Brighten what’s next.</em></h1>
          <p>Thoughtful solar solutions for homes and businesses ready for a more dependable, more sustainable way to power every day.</p>
          <div className="hero-actions"><Link href="/services" className="button button-gold">Explore our solutions <span>↗</span></Link><a className="button button-light-outline" href="https://wa.me/2348000000000?text=Hello%20Luxion%20Solar%2C%20I%27d%20like%20a%20custom%20solar%20quote." target="_blank" rel="noreferrer">Get a custom quote <span>↗</span></a></div>
          <div className="hero-facts"><div><span className="fact-symbol">⌂</span><span><strong>Made for real life</strong><small>Designed around your needs</small></span></div><div><span className="fact-symbol">◎</span><span><strong>Built to grow</strong><small>Flexible system options</small></span></div><div><span className="fact-symbol">☼</span><span><strong>Here to help</strong><small>From first chat to aftercare</small></span></div></div>
          <a className="discover-cue" href="#our-story"><span /> Discover more</a>
        </div>
        <div className="hero-index"><strong>01</strong><span /> 04</div>
      </section>

      <section className="trust-strip">
        <div className="container trust-inner"><p>A more considered way<br />to power <em>what matters.</em></p><div className="trust-stat"><strong>01</strong><span>Thoughtful<br />system design</span></div><div className="trust-stat"><strong>02</strong><span>Quality-first<br />components</span></div><div className="trust-stat"><strong>03</strong><span>Support beyond<br />installation</span></div><div className="trust-stamp"><span>✦</span><small>Designed for<br />Nigerian living</small></div></div>
      </section>

      <section className="partner-strip"><div className="container partner-inner"><span className="partner-caption">A thoughtful ecosystem<br />of energy solutions</span><div className="partner-wordmark">SUN<span>FIELD</span></div><div className="partner-wordmark partner-wordmark-serif">NOVA <small>ENERGY</small></div><div className="partner-wordmark partner-wordmark-round">ever<span>bright</span></div><div className="partner-wordmark partner-wordmark-wide">SOLAR<span>CRAFT</span></div><span className="partner-placeholder">Illustrative partner names</span></div></section>

      <section className="story-section section-pad" id="our-story">
        <div className="container story-grid">
          <div className="story-visual">
            <div className="story-image-main"><Image src={photo("photo-1497440001374-f26997328c1b")} alt="Sunlight on a modern solar installation" fill sizes="(max-width: 700px) 90vw, 35vw" /></div>
            <div className="story-image-small"><Image src={photo("photo-1508514177221-188b1cf16e9d", 700)} alt="Solar panel array against a clear sky" fill sizes="(max-width: 700px) 48vw, 18vw" /></div>
            <div className="story-note"><span>☼</span><strong>A brighter<br />way forward.</strong><small>One thoughtful step at a time</small></div>
          </div>
          <div className="story-copy"><span className="eyebrow"><span /> The Luxion difference</span><h2>Energy for the life you’re <em>building.</em></h2><p>We believe a better energy experience starts with listening. Luxion Solar helps people find a system that feels right for their space, their priorities and the way they live.</p><p>From an early conversation to a considered installation, we make the journey clearer — with practical guidance and support that stays with you.</p>
            <ul className="check-list"><li><span>✓</span> Recommendations shaped around your real energy use</li><li><span>✓</span> Flexible options that can grow with your needs</li><li><span>✓</span> Quality components selected with care</li><li><span>✓</span> Clear communication at every step</li></ul>
            <Link href="/about" className="text-link">Get to know Luxion <span>↗</span></Link>
          </div>
        </div>
      </section>

      <section className="advantage-section section-pad">
        <div className="container"><SectionHeading eyebrow="A better way to go solar" title={<>Considered solutions.<br /><em>Confidence that lasts.</em></>} description="Good energy is more than what gets installed. It’s how it fits your day, how it grows with you, and who’s there when you need support." />
          <div className="advantage-grid">{services.map((service, index) => <article className="advantage-card" key={service.title}><span className="advantage-number">0{index + 1}</span><span className="advantage-icon">{["⌖", "▧", "☼"][index]}</span><h3>{service.title}</h3><p>{service.description}</p><div className="advantage-foot"><span>✓</span> Built around your needs</div><Link href="/services" aria-label={`Learn about ${service.title}`} className="card-arrow">↗</Link></article>)}</div>
        </div>
      </section>

      <section className="impact-section">
        <div className="impact-image"><Image src={photo("photo-1473341304170-971dccb5ac1e", 1600)} alt="Clean energy landscape at golden hour" fill sizes="50vw" /></div>
        <div className="impact-shade" />
        <div className="container impact-content"><span className="eyebrow eyebrow-on-dark"><span /> A little more good in every day</span><h2>Powering progress.<br /><em>With a lighter footprint.</em></h2><p>Solar is a practical choice for greater energy independence — and a meaningful way to reduce reliance on fossil-fuel power over time.</p><div className="impact-stats"><div><strong>☼</strong><span>Renewable energy,<br />right from your roof</span></div><div><strong>↘</strong><span>Less reliance on<br />fuel-powered backup</span></div><div><strong>∞</strong><span>A more resilient<br />energy future</span></div></div><div className="impact-actions"><Link className="button button-gold" href="/about">Our approach <span>↗</span></Link><Link className="button button-light-outline" href="/energy-calculator">Explore your energy use <span>↗</span></Link></div></div>
      </section>

      <section className="numbers-section section-pad"><div className="container"><SectionHeading eyebrow="Small details. Big picture." title={<>The brighter choice,<br /><em>by the numbers.</em></>} description="A few reasons more people are exploring a smarter way to power home and work." /><div className="numbers-grid"><div><strong>24/7</strong><span>Customer care<br />when it matters</span></div><div><strong>01:01</strong><span>One-to-one<br />system guidance</span></div><div><strong>100%</strong><span>Designed around<br />your priorities</span></div><div><strong>∞</strong><span>Room to adapt<br />and grow</span></div><div><strong>4.8<small>/5</small></strong><span>Customer experience<br />placeholder rating</span></div><div><strong>1</strong><span>Team alongside you,<br />from start to support</span></div></div><p className="content-note">Illustrative brand placeholders — no verified performance statistics are represented.</p></div></section>

      <section className="packages-section section-pad" id="packages"><div className="container"><SectionHeading eyebrow="Find your fit" title={<>A good place to <em>start.</em></>} description="Every home and business is different. Explore a few system starting points, then talk to our team about what could work for you." /><div className="package-grid">{packages.map((item, index) => <article key={item.name} className={`package-card ${item.popular ? "package-popular" : ""}`}>{item.popular && <div className="popular-ribbon">A customer favourite</div>}<div className="package-icon">{["⌂", "⌂", "▥"][index]}</div><span className="package-size">{item.size}</span><h3>{item.name}</h3><p>{item.description}</p><div className="package-rule" /><ul>{item.items.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul><div className="package-warranty"><span>✳</span> Warranty options depend on system design</div><a className="package-quote" href={`https://wa.me/2348000000000?text=${encodeURIComponent(`Hello Luxion Solar, I would like to discuss the ${item.name} system.`)}`} target="_blank" rel="noreferrer">Ask for a custom quote <span>↗</span></a><CalculatorDialog /></article>)}</div><p className="package-note">Every system is assessed and custom quoted. Final equipment, pricing and warranty terms depend on your needs and site assessment.</p></div></section>

      <section className="testimonial-section section-pad"><div className="container"><div className="testimonial-heading"><div><SectionHeading eyebrow="Good energy, good people" title={<>Real stories.<br /><em>Brighter days.</em></>} description="Every energy journey is personal. Here are a few example reflections from the Luxion community." /></div><div className="rating-summary"><strong>4.8</strong><div><span>★★★★★</span><small>Example rating · illustrative reviews</small></div></div></div><ReviewCarousel /><div className="testimonial-link"><Link className="text-link" href="/news">More stories from our community <span>↗</span></Link></div></div></section>

      <section className="projects-section section-pad" id="projects"><div className="container"><div className="projects-top"><SectionHeading eyebrow="Made for everyday impact" title={<>A few brighter<br /><em>possibilities.</em></>} description="Explore illustrative project stories from homes and businesses across Nigeria." /><Link href="/contact" className="text-link">Talk about your project <span>↗</span></Link></div><div className="project-grid">{projects.map((project, index) => <article className={`project-card project-card-${index + 1}`} key={project.title}><div className="project-photo"><Image src={photo(project.image, 900)} alt={project.title} fill sizes="(max-width: 650px) 90vw, 30vw" /><span className="project-badge">{project.size} · Example</span><span className="project-zoom">↗</span></div><div className="project-info"><span>{project.type}</span><h3>{project.title}</h3><p>⌖ {project.place}</p></div></article>)}</div><p className="content-note">Project names, locations and system sizes are illustrative placeholders.</p></div></section>

      <section className="client-strip"><div className="container"><div className="client-strip-heading"><span className="eyebrow"><span /> Good things happen together</span><p>Our growing network <em>of collaborators.</em></p><span>Placeholder names for layout demonstration</span></div><div className="client-marquee"><span>brightworks</span><span>OPEN<span className="wordmark-light">GRID</span></span><span className="wordmark-serif">SOLSTICE</span><span>terra<span className="wordmark-light">power</span></span><span>DAYLIGHT CO.</span></div><div className="client-marquee client-marquee-second"><span>sunward studio</span><span>FIELD<span className="wordmark-light">NOTES</span></span><span className="wordmark-serif">NORTHSTAR</span><span>good energy</span><span>ROOT & RAY</span></div></div></section>

      <section className="video-section section-pad"><div className="container video-grid"><div className="video-copy"><span className="eyebrow"><span /> Come a little closer</span><h2>Curious about <em>solar?</em></h2><p>Get to know the ideas behind a more considered energy journey. Simple explainers, useful answers and a little inspiration for what comes next.</p><div className="video-tags"><span>Solar basics</span><span>Energy at home</span><span>Our approach</span></div><a href="https://www.youtube.com/" className="button button-dark" target="_blank" rel="noreferrer">Visit our video channel <span>↗</span></a></div><a className="video-card" href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="Visit the Luxion Solar video channel"><Image src={photo("photo-1509391366360-2e959784a276", 1200)} alt="Solar panels in bright afternoon light" fill sizes="(max-width: 700px) 90vw, 50vw" /><span className="video-play">▶</span><span className="video-label">A brighter way to power your day <small>Video placeholder · 02:36</small></span></a></div></section>

      <section className="news-section section-pad"><div className="container"><div className="news-top"><SectionHeading eyebrow="A little inspiration" title={<>Ideas for a brighter<br /><em>everyday.</em></>} description="Helpful thoughts for making your next energy decision feel a little easier." /><Link href="/news" className="text-link">Explore all stories <span>↗</span></Link></div><div className="news-grid">{news.map((item) => <article className="news-card" key={item.title}><Link href="/news" className="news-image"><Image src={photo(item.image, 900)} alt="" fill sizes="(max-width: 650px) 90vw, 40vw" /></Link><div><span className="news-category">{item.category}</span><h3><Link href="/news">{item.title}</Link></h3><p>{item.date} <span>·</span> 4 min read</p></div></article>)}</div></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow eyebrow-on-dark"><span /> Make your next move</span><h2>Better energy starts<br />with a <em>conversation.</em></h2></div><div><p>Tell us what matters to you. We’ll help you find a thoughtful place to begin.</p><Link className="button button-gold" href="/contact">Let’s talk <span>↗</span></Link></div></div></section>
    </main>
  );
}
