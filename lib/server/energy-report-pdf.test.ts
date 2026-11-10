import assert from "node:assert/strict";
import test from "node:test";
import { calculateSystem, type ApplianceSelection } from "../sizing.ts";
import { createEnergyReportPdf } from "./energy-report-pdf.ts";

test("generates a valid PDF energy snapshot", async () => {
  const selections: ApplianceSelection[] = [
    { appliance: { id: "fan", name: "Ceiling fan", category: "Cooling", watts: 75 }, quantity: 1, hours: 6 },
  ];
  const result = calculateSystem(selections, 4.5);
  const pdf = await createEnergyReportPdf({
    name: "Test User",
    state: "Lagos",
    goal: "Hybrid solar",
    selections,
    result,
  });

  assert.equal(pdf.toString("utf8", 0, 5), "%PDF-");
  assert.ok(pdf.length > 1000);
});
