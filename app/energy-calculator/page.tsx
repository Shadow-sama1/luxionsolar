import type { Metadata } from "next";
import EnergyCalculator from "@/app/components/energy-calculator";

export const metadata: Metadata = {
  title: "Energy Calculator",
  description: "Build an initial solar system estimate based on your appliances and energy use.",
};

export default function EnergyCalculatorPage() {
  return <EnergyCalculator />;
}
