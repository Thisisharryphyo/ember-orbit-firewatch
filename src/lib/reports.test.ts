import { describe, expect, it } from "vitest";
import { fireDetectionsCsv, fireReportBaseName, fireReportDateRange } from "./reports";
import type { FirePoint } from "@/types/firescope";

const point: FirePoint = {
  lat: 16.5, lng: 96.1, frp: 12.4, isDay: 1, date: "2026-11-14", time: "0630",
  satellite: "NOAA-20", sensor: "VIIRS", source: "VIIRS, NOAA-20",
};

describe("filtered fire reports", () => {
  it("exports the filtered detection values and escapes spreadsheet fields", () => {
    expect(fireDetectionsCsv([point])).toBe(
      "latitude,longitude,acquisition_date,acquisition_time_utc,satellite,sensor,source_product,frp_mw,daynight\r\n" +
      '16.5,96.1,2026-11-14,0630,NOAA-20,VIIRS,"VIIRS, NOAA-20",12.4,D',
    );
  });

  it("names and dates the report using the selected filter window", () => {
    expect(fireReportBaseName({ sensor: "HARMONIZED", date: "2026-11-14", days: 3 })).toBe(
      "firescope-harmonized-2026-11-14-3d",
    );
    expect(fireReportDateRange({ date: "2026-11-14", days: 3 })).toBe("2026-11-14 to 2026-11-16");
  });
});
