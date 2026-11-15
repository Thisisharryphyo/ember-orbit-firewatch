import type { FireSource } from "@/lib/fireSources";
import type { FirePoint } from "@/types/firescope";

export const PRINT_REPORT_ROW_LIMIT = 500;

export interface FireReportData {
  sensor: FireSource;
  date: string;
  days: number;
  points: FirePoint[];
  total: number;
  source: string;
  duplicatesRemoved: number;
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function fireReportDateRange(report: Pick<FireReportData, "date" | "days">): string {
  return report.days === 1 ? report.date : `${report.date} to ${addDays(report.date, report.days - 1)}`;
}

export function fireReportBaseName(report: Pick<FireReportData, "sensor" | "date" | "days">): string {
  return `firescope-${report.sensor.toLowerCase()}-${report.date}-${report.days}d`;
}

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** CSV contains every loaded detection; source totals can be larger when the display cap is reached. */
export function fireDetectionsCsv(points: FirePoint[]): string {
  const header = [
    "latitude", "longitude", "acquisition_date", "acquisition_time_utc", "satellite",
    "sensor", "source_product", "frp_mw", "daynight",
  ];
  const rows = points.map((point) => [
    point.lat, point.lng, point.date, point.time, point.satellite, point.sensor,
    point.source, point.frp, point.isDay ? "D" : "N",
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function downloadFireCsv(report: FireReportData): void {
  const blob = new Blob([fireDetectionsCsv(report.points)], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, `${fireReportBaseName(report)}.csv`);
}
