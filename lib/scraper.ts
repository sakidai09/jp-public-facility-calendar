import { load } from "cheerio";
import { parse } from "csv-parse/sync";
import { Availability, Facility } from "./types";
import { formatDate } from "./date";

export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch HTML: ${res.status}`);
  return res.text();
}

export function parseCsvFacilities(csv: string, providerId: string, mapping: {
  id: string;
  name: string;
  category?: string;
  address?: string;
  phone?: string;
  reservationPageUrl?: string;
}): Facility[] {
  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
  });
  return records.map((row: any, index: number) => ({
    id: row[mapping.id] || String(index + 1),
    providerId,
    name: row[mapping.name] ?? "名称未設定",
    category: row[mapping.category ?? "カテゴリ"] ?? "施設",
    address: mapping.address ? row[mapping.address] : undefined,
    phone: mapping.phone ? row[mapping.phone] : undefined,
    reservationPageUrl: mapping.reservationPageUrl
      ? row[mapping.reservationPageUrl]
      : undefined,
  }));
}

export function normalizeAvailabilityTable(html: string, providerId: string): Availability[] {
  const $ = load(html);
  const rows = $("table tr");
  const availabilities: Availability[] = [];
  rows.each((_, row) => {
    const cells = $(row).find("td, th");
    if (cells.length < 4) return;
    const dateText = $(cells[0]).text().trim();
    const date = normalizeDate(dateText);
    const periods = ["morning", "afternoon", "night"] as const;
    periods.forEach((period, idx) => {
      const statusText = $(cells[idx + 1]).text().trim();
      if (!statusText) return;
      availabilities.push({
        date,
        period,
        status: normalizeStatus(statusText),
        remaining: extractNumber(statusText),
      });
    });
  });
  return availabilities;
}

export function normalizeStatus(text: string): Availability["status"] {
  const normalized = text.toLowerCase();
  if (normalized.includes("休") || normalized.includes("閉")) return "closed";
  if (normalized.includes("○") || normalized.includes("空")) return "available";
  if (normalized.includes("△") || normalized.includes("少") || normalized.includes("わず"))
    return "few";
  if (normalized.includes("×") || normalized.includes("満")) return "full";
  return "full";
}

export function normalizeDate(text: string): string {
  const today = new Date();
  const match = text.match(/(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (match) {
    const [, y, m, d] = match;
    return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const md = text.match(/(\d{1,2})[\/-](\d{1,2})/);
  if (md) {
    const [, m, d] = md;
    return `${today.getFullYear()}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return formatDate(today);
}

function extractNumber(text: string): number | undefined {
  const match = text.match(/(\d+)/);
  return match ? Number(match[1]) : undefined;
}
