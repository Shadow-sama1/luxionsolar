import assert from "node:assert/strict";
import test from "node:test";
import { calculateSystem, type ApplianceSelection } from "./sizing.ts";

test("sizes a minimum inverter when no appliances are selected", () => {
  const result = calculateSystem([]);

  assert.equal(result.connectedLoadW, 0);
  assert.equal(result.dailyEnergyWh, 0);
  assert.equal(result.inverterKva, 1);
  assert.equal(result.panelCount, 0);
});

test("adds appliance loads and rounds the inverter up with 25% headroom", () => {
  const selections: ApplianceSelection[] = [
    { appliance: { id: "fan", name: "Fan", category: "Cooling", watts: 75 }, quantity: 2, hours: 8 },
    { appliance: { id: "fridge", name: "Fridge", category: "Kitchen", watts: 180 }, quantity: 1, hours: 24 },
  ];

  const result = calculateSystem(selections, 4.5);

  assert.equal(result.connectedLoadW, 330);
  assert.equal(result.dailyEnergyWh, 5520);
  assert.equal(result.inverterKva, 1);
  assert.equal(result.panelCapacityW, 1650);
  assert.equal(result.panelCount, 3);
  assert.ok(result.batteryCapacityKwh > 0);
});

test("uses a safe peak-sun-hours fallback for invalid input", () => {
  const selections: ApplianceSelection[] = [
    { appliance: { id: "light", name: "Light", category: "Lighting", watts: 20 }, quantity: 1, hours: 5 },
  ];

  assert.equal(calculateSystem(selections, 0).panelCapacityW, calculateSystem(selections, 4.5).panelCapacityW);
  assert.equal(calculateSystem(selections, Number.NaN).panelCapacityW, calculateSystem(selections, 4.5).panelCapacityW);
});

test("ignores invalid appliance entries instead of returning non-finite sizing", () => {
  const result = calculateSystem([
    { appliance: { id: "invalid", name: "Invalid", category: "Custom", watts: Number.NaN }, quantity: 2, hours: 4 },
  ]);

  assert.equal(result.connectedLoadW, 0);
  assert.equal(result.dailyEnergyWh, 0);
  assert.ok(Number.isFinite(result.batteryCapacityKwh));
});
