export type Appliance = {
  id: string;
  name: string;
  category: string;
  watts: number;
};

export type ApplianceSelection = {
  appliance: Appliance;
  quantity: number;
  hours: number;
};

export type SizingResult = {
  connectedLoadW: number;
  dailyEnergyWh: number;
  inverterKva: number;
  batteryCapacityKwh: number;
  panelCount: number;
  panelCapacityW: number;
};

export const standardInverterRatings = [1, 1.5, 2, 3, 5, 7.5, 10, 15, 20, 30, 50];
export const peakSunHoursByState: Record<string, number> = {
  "Lagos": 4.5,
  "Abuja (FCT)": 5.2,
  "Ogun": 4.7,
  "Oyo": 5,
  "Rivers": 4.2,
  "Enugu": 4.7,
  "Kano": 5.8,
  "Kaduna": 5.4,
  "Other": 4.5,
};

export function calculateSystem(
  selections: ApplianceSelection[],
  peakSunHours = 4.5,
): SizingResult {
  const safePeakSunHours =
    Number.isFinite(peakSunHours) && peakSunHours > 0 ? peakSunHours : 4.5;
  const validSelections = selections.filter(
    ({ appliance, quantity, hours }) =>
      Number.isFinite(appliance.watts) &&
      appliance.watts > 0 &&
      Number.isFinite(quantity) &&
      quantity > 0 &&
      Number.isFinite(hours) &&
      hours >= 0,
  );
  const connectedLoadW = validSelections.reduce(
    (total, { appliance, quantity }) => total + appliance.watts * quantity,
    0,
  );
  const dailyEnergyWh = validSelections.reduce(
    (total, { appliance, quantity, hours }) =>
      total + appliance.watts * quantity * hours,
    0,
  );
  const neededKva = (connectedLoadW * 1.25) / 1000;
  const inverterKva =
    standardInverterRatings.find((rating) => rating >= neededKva) ??
    Math.ceil(neededKva / 10) * 10;
  const batteryCapacityKwh = (dailyEnergyWh / 1000 / 24 * 8) / (0.8 * 0.9);
  const panelCount = Math.ceil(dailyEnergyWh / (550 * safePeakSunHours * 0.8));
  const panelCapacityW = panelCount * 550;

  return {
    connectedLoadW,
    dailyEnergyWh,
    inverterKva,
    batteryCapacityKwh,
    panelCount,
    panelCapacityW,
  };
}
