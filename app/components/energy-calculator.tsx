"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { calculateSystem, peakSunHoursByState, type Appliance, type ApplianceSelection } from "@/lib/sizing";

const baseAppliances: Appliance[] = [
  { id: "fan", name: "Ceiling fan", category: "Cooling", watts: 75 },
  { id: "ac", name: "Air conditioner", category: "Cooling", watts: 1200 },
  { id: "fridge", name: "Refrigerator", category: "Kitchen", watts: 180 },
  { id: "microwave", name: "Microwave", category: "Kitchen", watts: 1000 },
  { id: "tv", name: "Television", category: "Entertainment", watts: 120 },
  { id: "lights", name: "LED lights", category: "Lighting", watts: 12 },
  { id: "laptop", name: "Laptop", category: "Office", watts: 65 },
  { id: "pump", name: "Water pump", category: "Water & Pumps", watts: 750 },
  { id: "router", name: "Wi-Fi router", category: "Office", watts: 15 },
  { id: "security", name: "CCTV system", category: "Security", watts: 40 },
];
const categories = ["All", "Cooling", "Kitchen", "Lighting", "Entertainment", "Office", "Water & Pumps", "Security"];
const states = ["Lagos", "Abuja (FCT)", "Ogun", "Oyo", "Rivers", "Enugu", "Kano", "Kaduna", "Other"];
const profileOptions = [
  ["No Grid", "0–2 hours daily", "◎"],
  ["Occasional", "2–6 hours daily", "◷"],
  ["Moderate", "6–12 hours daily", "◑"],
  ["Good", "12–20 hours daily", "◉"],
];
const goals = ["Grid backup", "Hybrid solar", "Full off-grid", "Business / commercial"];

type LeadDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
  address: string;
  installationType: string;
  budget: string;
  timeline: string;
  notes: string;
  consent: boolean;
};
const emptyLead: LeadDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  state: "Lagos",
  address: "",
  installationType: "Residential home",
  budget: "Not sure yet",
  timeline: "Exploring my options",
  notes: "",
  consent: false,
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(value);
}

export default function EnergyCalculator({ embedded = false }: { embedded?: boolean }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [applianceList, setApplianceList] = useState<Appliance[]>(baseAppliances);
  const [hours, setHours] = useState<Record<string, number>>({});
  const [grid, setGrid] = useState("Moderate");
  const [goal, setGoal] = useState("Hybrid solar");
  const [lead, setLead] = useState<LeadDetails>(emptyLead);
  const [loadingLine, setLoadingLine] = useState(0);
  const [sent, setSent] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const [leadDeliveryMessage, setLeadDeliveryMessage] = useState("");
  const [analysisNote, setAnalysisNote] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [customName, setCustomName] = useState("");
  const [customWatts, setCustomWatts] = useState("");
  const [customError, setCustomError] = useState("");
  const [applianceError, setApplianceError] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("luxion-energy-wizard");
      if (saved) {
        const state = JSON.parse(saved) as { step?: number; selected?: Record<string, number>; hours?: Record<string, number>; grid?: string; goal?: string; lead?: LeadDetails; appliances?: Appliance[]; submissionId?: string; leadDeliveryMessage?: string; analysisNote?: string; analysisError?: string };
        window.requestAnimationFrame(() => {
          if (state.step && state.step >= 1 && state.step <= 5) setStep(state.step);
          if (state.selected) setSelected(state.selected);
          if (state.appliances) setApplianceList([...baseAppliances, ...state.appliances.filter((item) => item.id.startsWith("custom-"))]);
          if (state.hours) setHours(state.hours);
          if (state.grid) setGrid(state.grid);
          if (state.goal) setGoal(state.goal);
          if (state.lead) setLead({ ...emptyLead, ...state.lead });
          if (state.submissionId) setSubmissionId(state.submissionId);
          if (state.leadDeliveryMessage) setLeadDeliveryMessage(state.leadDeliveryMessage);
          if (state.analysisNote) setAnalysisNote(state.analysisNote);
          if (state.analysisError) setAnalysisError(state.analysisError);
        });
      }
    } catch (error) {
      console.error("Could not restore calculator progress", error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("luxion-energy-wizard", JSON.stringify({
        step,
        selected,
        hours,
        grid,
        goal,
        lead,
        submissionId,
        leadDeliveryMessage,
        analysisNote,
        analysisError,
        appliances: applianceList.filter((item) => item.id.startsWith("custom-")),
      }));
    } catch (error) {
      console.error("Could not save calculator progress", error);
    }
  }, [step, selected, hours, grid, goal, lead, applianceList, submissionId, leadDeliveryMessage, analysisNote, analysisError]);

  useEffect(() => {
    if (step !== 4) return;
    const interval = window.setInterval(() => setLoadingLine((value) => (value + 1) % 6), 850);
    const timeout = window.setTimeout(() => setStep(5), 5000);
    return () => { window.clearInterval(interval); window.clearTimeout(timeout); };
  }, [step]);

  const selections: ApplianceSelection[] = useMemo(() => applianceList.flatMap((appliance) => {
    const quantity = selected[appliance.id] ?? 0;
    return quantity > 0 ? [{ appliance, quantity, hours: hours[appliance.category] ?? 6 }] : [];
  }), [applianceList, selected, hours]);
  const result = calculateSystem(selections, peakSunHoursByState[lead.state] ?? peakSunHoursByState.Other);
  const visibleAppliances = category === "All" ? applianceList : applianceList.filter((item) => item.category === category);
  const selectedCount = Object.values(selected).reduce((sum, quantity) => sum + quantity, 0);

  function changeQuantity(id: string, delta: number) {
    setSelected((previous) => ({ ...previous, [id]: Math.max(0, Math.min(20, (previous[id] ?? 0) + delta)) }));
    setApplianceError("");
  }

  function addCustomAppliance(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const watts = Number(customWatts);
    if (!customName.trim() || !Number.isFinite(watts) || watts < 1 || watts > 10000) {
      setCustomError("Enter an appliance name and a wattage from 1 to 10,000.");
      return;
    }
    const id = `custom-${Date.now()}`;
    setApplianceList((previous) => [...previous, { id, name: customName.trim(), category: "Custom", watts }]);
    setSelected((previous) => ({ ...previous, [id]: 1 }));
    setCustomName("");
    setCustomWatts("");
    setCustomError("");
  }

  function startOver() {
    setStep(1);
    setSelected({});
    setHours({});
    setLead(emptyLead);
    setSubmissionId("");
    setLeadDeliveryMessage("");
    setAnalysisNote("");
    setAnalysisError("");
    setSent(false);
    try {
      window.localStorage.removeItem("luxion-energy-wizard");
    } catch (error) {
      console.error("Could not clear calculator progress", error);
    }
  }

  async function submitLead() {
    const requestId = submissionId || crypto.randomUUID();
    setSubmissionId(requestId);
    setLeadDeliveryMessage("Saving your estimate and preparing the report…");
    try {
      const response = await fetch("/api/calculator/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: requestId,
          lead,
          goal,
          grid,
          appliances: selections.map(({ appliance, quantity, hours: runHours }) => ({
            ...appliance,
            quantity,
            hours: runHours,
          })),
        }),
      });
      const payload = await response.json() as { message?: string; error?: string; emailSent?: boolean };
      if (!response.ok) throw new Error(payload.error ?? "Could not save your estimate.");
      setLeadDeliveryMessage(payload.message ?? "Your estimate has been saved.");
      return payload.emailSent === true;
    } catch (error) {
      console.error("Calculator lead submission failed", error);
      setLeadDeliveryMessage(error instanceof Error ? error.message : "The request failed. Please try again.");
      return false;
    }
  }

  async function submitDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep(4);
    await Promise.all([submitLead(), requestAnalysis()]);
  }

  async function requestAnalysis() {
    setAnalysisError("");
    setAnalysisNote("");
    try {
      const response = await fetch("/api/calculator/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appliances: selections.map(({ appliance, quantity, hours: runHours }) => ({
            ...appliance,
            quantity,
            hours: runHours,
          })),
          location: lead.state,
          goal,
          grid,
        }),
      });
      const payload = await response.json() as { note?: string; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "AI recommendation unavailable.");
      setAnalysisNote(payload.note ?? "");
    } catch (error) {
      console.error("Calculator recommendation request failed", error);
      setAnalysisError(error instanceof Error ? error.message : "AI recommendation unavailable.");
      setAnalysisNote("This preliminary estimate uses your selected appliances, local planning assumptions, and stated energy goal. A site visit is needed to verify the design.");
    }
  }

  return (
    <main className={embedded ? "calculator calculator-embedded" : "calculator"}>
      {!embedded && <div className="calculator-intro"><span className="eyebrow"><span /> Your solar journey starts here</span><h1>Let’s find your <em>right-sized</em> system.</h1><p>Share a little about how you use energy. We’ll turn it into a practical starting point for your solar journey.</p></div>}
      <section className="wizard-card">
        <div className="wizard-top">
          <div className="wizard-step-copy"><span>STEP {Math.min(step, 5)} OF 5</span><strong>{["Select appliances", "Your usage profile", "A few details", "Sizing your system", "Your energy snapshot"][step - 1]}</strong></div>
          <span className="wizard-step-fraction">0{Math.min(step, 5)} <i>/ 05</i></span>
        </div>
        <div className="wizard-progress"><span style={{ width: `${step * 20}%` }} /></div>

        {step === 1 && <div className="wizard-body">
          <div className="wizard-heading"><div><h2>What would you like to power?</h2><p>Choose your appliances and add how many you use at home.</p></div><span className="step-icon">01</span></div>
          <div className="category-tabs" role="tablist" aria-label="Appliance categories">{categories.map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
          <div className="appliance-grid">{visibleAppliances.map((item) => <div className="appliance-card" key={item.id}>
            <span className="appliance-symbol" aria-hidden="true">{item.category === "Cooling" ? "❄" : item.category === "Kitchen" ? "⌂" : item.category === "Lighting" ? "☼" : item.category === "Water & Pumps" ? "◉" : "⌘"}</span>
            <div className="appliance-info"><strong>{item.name}</strong><span>{item.watts} W each</span></div>
            <div className="quantity-control"><button aria-label={`Remove one ${item.name}`} type="button" onClick={() => changeQuantity(item.id, -1)}>−</button><span>{selected[item.id] ?? 0}</span><button aria-label={`Add one ${item.name}`} type="button" onClick={() => changeQuantity(item.id, 1)}>+</button></div>
          </div>)}</div>
          {category === "All" && <form className="custom-appliance-form" onSubmit={addCustomAppliance}>
            <span className="appliance-symbol">＋</span><div className="appliance-info"><strong>Add an appliance</strong><span>Not on the list? Add your own.</span></div>
            <input aria-label="Custom appliance name" value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Appliance" />
            <input aria-label="Custom appliance wattage" type="number" min="1" max="10000" value={customWatts} onChange={(event) => setCustomWatts(event.target.value)} placeholder="Watts" />
            <button className="text-button" type="submit">Add +</button>
          </form>}
          {customError && category === "All" && <p className="custom-appliance-error" role="alert">{customError}</p>}
          <div className="usage-hours"><div><strong>Daily usage hours</strong><span>Set the typical hours each selected appliance runs.</span></div>{["Cooling", "Kitchen", "Lighting", "Entertainment"].map((item) => <label key={item}>{item}<select aria-label={`${item} daily usage hours`} value={hours[item] ?? 6} onChange={(event) => setHours((previous) => ({ ...previous, [item]: Number(event.target.value) }))}>{[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 24].map((value) => <option value={value} key={value}>{value} hours</option>)}</select></label>)}</div>
          <div className="live-summary"><div><span>Total connected load</span><strong>{formatNumber(result.connectedLoadW)} <small>W</small></strong></div><div><span>Daily energy needed</span><strong>{(result.dailyEnergyWh / 1000).toFixed(1)} <small>kWh</small></strong></div><div><span>Appliances selected</span><strong>{selectedCount} <small>items</small></strong></div><div><span>Estimated inverter</span><strong>{result.inverterKva} <small>kVA</small></strong></div></div>
          {applianceError && <p className="appliance-selection-error" role="alert">{applianceError}</p>}
          <div className="wizard-actions"><span>{selectedCount ? `${selectedCount} appliance${selectedCount === 1 ? "" : "s"} selected` : "Start with the appliances you use most"}</span><button className="button" type="button" onClick={() => { if (!selectedCount) { setApplianceError("Add at least one appliance to build a useful estimate."); return; } setApplianceError(""); setStep(2); }}>Continue <span>→</span></button></div>
        </div>}

        {step === 2 && <div className="wizard-body">
          <div className="wizard-heading"><div><h2>Tell us about your power needs.</h2><p>This helps us understand your priorities and local conditions.</p></div><span className="step-icon">02</span></div>
          <h3 className="field-section-title">How often is grid power available?</h3>
          <div className="profile-grid">{profileOptions.map(([name, description, symbol]) => <button key={name} type="button" className={`profile-option ${grid === name ? "selected" : ""}`} onClick={() => setGrid(name)}><span className="profile-symbol">{symbol}</span><strong>{name}</strong><small>{description}</small><span className="radio-dot" /></button>)}</div>
          <h3 className="field-section-title">What is your primary goal?</h3>
          <div className="goal-grid">{goals.map((name) => <button key={name} type="button" className={`goal-option ${goal === name ? "selected" : ""}`} onClick={() => setGoal(name)}><span className="goal-check">{goal === name ? "✓" : ""}</span>{name}</button>)}</div>
          <div className="form-grid"><label>Installation location<select value={lead.state} onChange={(event) => setLead((previous) => ({ ...previous, state: event.target.value }))}>{states.map((state) => <option key={state}>{state}</option>)}</select></label><label>Installation type<select value={lead.installationType} onChange={(event) => setLead((previous) => ({ ...previous, installationType: event.target.value }))}><option>Residential home</option><option>Apartment</option><option>Commercial / office</option><option>Industrial</option><option>Estate / compound</option></select></label></div>
          <div className="wizard-actions"><button className="button button-ghost" type="button" onClick={() => setStep(1)}>← Back</button><button className="button" type="button" onClick={() => setStep(3)}>Continue <span>→</span></button></div>
        </div>}

        {step === 3 && <form className="wizard-body" onSubmit={submitDetails}>
          <div className="wizard-heading"><div><h2>Who should we prepare this for?</h2><p>Your details help us make this recommendation more useful. We’ll keep them private.</p></div><span className="step-icon">03</span></div>
          <div className="form-grid">
            <label>First name<input required autoComplete="given-name" value={lead.firstName} onChange={(event) => setLead((previous) => ({ ...previous, firstName: event.target.value }))} placeholder="e.g. Ada" /></label>
            <label>Last name<input required autoComplete="family-name" value={lead.lastName} onChange={(event) => setLead((previous) => ({ ...previous, lastName: event.target.value }))} placeholder="e.g. Okafor" /></label>
            <label>Email address<input required type="email" autoComplete="email" value={lead.email} onChange={(event) => setLead((previous) => ({ ...previous, email: event.target.value }))} placeholder="you@example.com" /></label>
            <label>Phone number<input required type="tel" autoComplete="tel" value={lead.phone} onChange={(event) => setLead((previous) => ({ ...previous, phone: event.target.value }))} placeholder="+234" /></label>
            <label>Budget range<select value={lead.budget} onChange={(event) => setLead((previous) => ({ ...previous, budget: event.target.value }))}><option>Not sure yet</option><option>Under ₦500,000</option><option>₦500,000–₦1,000,000</option><option>₦1,000,000–₦2,000,000</option><option>₦2,000,000–₦5,000,000</option><option>₦5,000,000–₦10,000,000</option><option>Above ₦10,000,000</option></select></label>
            <label>When are you hoping to get started?<select value={lead.timeline} onChange={(event) => setLead((previous) => ({ ...previous, timeline: event.target.value }))}><option>Exploring my options</option><option>As soon as possible</option><option>Within 1–3 months</option><option>Within 3–6 months</option><option>More than 6 months</option></select></label>
            <label className="full-field">Installation address<input autoComplete="street-address" value={lead.address} onChange={(event) => setLead((previous) => ({ ...previous, address: event.target.value }))} placeholder="Street address or area" /></label>
            <label className="full-field">Anything else we should know?<textarea rows={3} value={lead.notes} onChange={(event) => setLead((previous) => ({ ...previous, notes: event.target.value }))} placeholder="Tell us about your space, priorities or questions..." /></label>
            <label className="consent full-field"><input type="checkbox" required checked={lead.consent} onChange={(event) => setLead((previous) => ({ ...previous, consent: event.target.checked }))} /> I agree that the Luxion Solar team may contact me about this solar estimate.</label>
          </div>
          <div className="wizard-actions"><button className="button button-ghost" type="button" onClick={() => setStep(2)}>← Back</button><button className="button" type="submit">Build my estimate <span>→</span></button></div>
        </form>}

        {step === 4 && <div className="analysis-screen"><span className="analysis-sun">☼</span><span className="eyebrow">A moment, please</span><h2>Putting the pieces together.</h2><p>We’re using your appliance selections and location to create an initial system estimate.</p><div className="analysis-list">{["Calculating your energy demand", "Matching an inverter size", "Sizing your battery storage", "Estimating your solar array", "Preparing your energy snapshot", "Checking the numbers"].map((label, index) => <div className={index === loadingLine ? "current" : index < loadingLine ? "complete" : ""} key={label}><span>{index < loadingLine ? "✓" : index === loadingLine ? "◌" : "○"}</span>{label}</div>)}</div><span className="estimate-disclaimer">Your estimate is a starting point, not a final system design.</span></div>}

        {step === 5 && <div className="wizard-body">
          {!sent ? <>
            <div className="report-kicker"><span className="report-spark">✦</span><div><span>YOUR PERSONAL ENERGY SNAPSHOT</span><small>Prepared for {lead.firstName || "you"} · {lead.state}</small></div><button className="report-print" type="button" onClick={() => window.print()}>Print report ↗</button></div>
            <h2 className="report-title">A brighter plan, built around you.</h2>
            <p className="report-description">Based on your appliance selection, {grid.toLowerCase()} grid supply and {goal.toLowerCase()} goal, here’s a first look at a system that could fit.</p>
            <div className="result-hero"><div><span>INITIAL SYSTEM ESTIMATE</span><strong>{result.inverterKva} <small>kVA</small></strong><p>recommended inverter size</p></div><div className="result-pills"><div><span>Battery storage</span><strong>{result.batteryCapacityKwh.toFixed(1)} kWh</strong></div><div><span>Solar array</span><strong>{result.panelCapacityW.toLocaleString()} W</strong></div><div><span>550 W panels</span><strong>{result.panelCount} panels</strong></div></div></div>
            <div className="report-columns"><section className="report-box"><h3>Your connected appliances</h3><div className="load-table"><div className="load-head"><span>Appliance</span><span>Qty</span><span>Watts</span><span>Daily use</span></div>{selections.length ? selections.map(({ appliance, quantity, hours: runHours }) => <div className="load-row" key={appliance.id}><span>{appliance.name}</span><span>{quantity}</span><span>{formatNumber(appliance.watts * quantity)} W</span><span>{runHours} h</span></div>) : <div className="load-row"><span>No appliances selected</span><span>—</span><span>0 W</span><span>—</span></div>}</div><div className="load-total"><span>Total daily energy</span><strong>{(result.dailyEnergyWh / 1000).toFixed(1)} kWh</strong></div></section><section className="report-box why-box"><h3>Why this system?</h3><p>{analysisNote || "Preparing a plain-language explanation from your calculated system estimate."}</p>{analysisError && <small className="analysis-error">{analysisError}</small>}<div className="report-tip"><span>✦</span> A site assessment can refine this estimate for your roof, wiring and exact appliances.</div></section></div>
            <div className="report-footnote">All figures are indicative and are not an offer or final engineering specification. A Luxion Solar specialist can verify your actual needs, installation conditions and budget before quotation.</div>
            <p className="report-delivery" role="status" aria-live="polite">{leadDeliveryMessage || "Report delivery status unavailable."}</p>
            <div className="report-actions"><button className="button" type="button" onClick={async () => { if (await submitLead()) setSent(true); }}>Email full report (PDF) <span>→</span></button><button className="button button-ghost" type="button" onClick={() => { const url = new URL("https://wa.me/2348000000000"); url.searchParams.set("text", `Hello Luxion Solar, I have an initial estimate for a ${result.inverterKva} kVA system. Could I speak with a specialist?`); window.open(url.toString(), "_blank", "noopener,noreferrer"); }}>Speak to an expert ↗</button><button className="restart-link" type="button" onClick={startOver}>Start over</button></div>
          </> : <div className="success-screen"><span className="success-icon">✓</span><h2>Your energy report has been emailed.</h2><p>Thanks, {lead.firstName || "there"}. We sent the PDF report to {lead.email}.</p><Link className="button" href="/contact">Book a free site survey <span>→</span></Link><button className="restart-link" type="button" onClick={startOver}>Start another estimate</button></div>}
        </div>}
      </section>
      {!embedded && <p className="calculator-privacy">Your details are only for a personalised follow-up. <Link href="/contact">Need help? Talk to our team.</Link></p>}
    </main>
  );
}
