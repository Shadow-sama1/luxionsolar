import { createElement } from "react";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { ApplianceSelection, SizingResult } from "../sizing.ts";

const styles = StyleSheet.create({
  page: { padding: 38, fontFamily: "Helvetica", color: "#0e1f20", fontSize: 10 },
  header: { backgroundColor: "#0b3b3c", color: "#ffffff", padding: 20, marginBottom: 20 },
  eyebrow: { color: "#e6be4f", fontSize: 8, letterSpacing: 1.5, marginBottom: 8 },
  title: { fontSize: 22, marginBottom: 6 },
  subtitle: { color: "#d9f0ef", fontSize: 9 },
  sectionTitle: { color: "#0f5f61", fontSize: 12, marginBottom: 8, marginTop: 16 },
  metrics: { flexDirection: "row", gap: 8, marginBottom: 8 },
  metric: { flexGrow: 1, backgroundColor: "#f2f8f7", padding: 12 },
  metricLabel: { color: "#637273", fontSize: 8, marginBottom: 5 },
  metricValue: { color: "#0b3b3c", fontSize: 15 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e9e7", paddingVertical: 6 },
  cell: { flex: 1 },
  tableHeader: { color: "#637273", fontSize: 8, fontWeight: 700 },
  note: { color: "#637273", fontSize: 8, lineHeight: 1.5, marginTop: 18 },
});

type ReportData = {
  name: string;
  state: string;
  goal: string;
  selections: ApplianceSelection[];
  result: SizingResult;
};

function EnergyReportPage({ name, state, goal, selections, result }: ReportData) {
  const rows = [
    createElement(
      View,
      { style: [styles.row, styles.tableHeader], key: "header" },
      createElement(Text, { style: styles.cell }, "Appliance"),
      createElement(Text, { style: styles.cell }, "Qty"),
      createElement(Text, { style: styles.cell }, "Unit watts"),
      createElement(Text, { style: styles.cell }, "Hours/day"),
    ),
    ...selections.map(({ appliance, quantity, hours }, index) =>
      createElement(
        View,
        { style: styles.row, key: `${appliance.id}-${index}` },
        createElement(Text, { style: styles.cell }, appliance.name),
        createElement(Text, { style: styles.cell }, String(quantity)),
        createElement(Text, { style: styles.cell }, String(appliance.watts)),
        createElement(Text, { style: styles.cell }, String(hours)),
      ),
    ),
  ];

  return createElement(
    Page,
    { size: "A4", style: styles.page },
      createElement(
        View,
        { style: styles.header },
        createElement(Text, { style: styles.eyebrow }, "LUXION SOLAR · INITIAL ENERGY SNAPSHOT"),
        createElement(Text, { style: styles.title }, `A brighter plan for ${name}`),
        createElement(Text, { style: styles.subtitle }, `${state} · ${goal}`),
      ),
      createElement(Text, { style: styles.sectionTitle }, "Initial system estimate"),
      createElement(
        View,
        { style: styles.metrics },
        createElement(
          View,
          { style: styles.metric },
          createElement(Text, { style: styles.metricLabel }, "Inverter"),
          createElement(Text, { style: styles.metricValue }, `${result.inverterKva} kVA`),
        ),
        createElement(
          View,
          { style: styles.metric },
          createElement(Text, { style: styles.metricLabel }, "Battery storage"),
          createElement(Text, { style: styles.metricValue }, `${result.batteryCapacityKwh.toFixed(1)} kWh`),
        ),
        createElement(
          View,
          { style: styles.metric },
          createElement(Text, { style: styles.metricLabel }, "Solar panels"),
          createElement(Text, { style: styles.metricValue }, `${result.panelCount} × 550 W`),
        ),
      ),
      createElement(Text, { style: styles.sectionTitle }, "Appliance breakdown"),
      ...rows,
      createElement(
        Text,
        { style: styles.note },
        `Connected load: ${Math.round(result.connectedLoadW)} W · Daily energy: ${(result.dailyEnergyWh / 1000).toFixed(1)} kWh. This estimate is illustrative, based on the submitted details and planning assumptions. It is not a final engineering design or quotation; a qualified specialist must verify the site, loads and equipment before installation.`,
      ),
  );
}

export async function createEnergyReportPdf(data: ReportData) {
  return renderToBuffer(createElement(Document, null, createElement(EnergyReportPage, data)));
}
