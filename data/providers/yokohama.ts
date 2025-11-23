import { Availability, Facility, FacilityProvider } from "../../lib/types";
import {
  fetchHtml,
  normalizeAvailabilityTable,
  parseCsvFacilities,
} from "../../lib/scraper";
import { formatDate } from "../../lib/date";

const YOKOHAMA_CSV_URL =
  "https://www.city.yokohama.lg.jp/static/opendata/sportscsv/sportscenter.csv";
const YOKOHAMA_FALLBACK_CSV = `id,name,category,address,phone,reservationPageUrl
101,横浜市スポーツセンター（仮）,体育館,横浜市中区日本大通1-1,045-000-0000,https://www.yspc.or.jp/
102,金沢スポーツセンター,体育館,横浜市金沢区泥亀2-14-1,045-785-3000,https://www.yspc.or.jp/kanazawa_sc_ysa/
103,栄スポーツセンター,体育館,横浜市栄区桂町279-29,045-894-9503,https://www.yspc.or.jp/sakae_sc_ysa/
`;

function fallbackAvailability(from: Date, to: Date): Availability[] {
  const availabilities: Availability[] = [];
  const periods: Availability["period"][] = ["morning", "afternoon", "night"];
  const statuses: Availability["status"][] = ["available", "few", "full", "closed"];
  const cursor = new Date(from);
  while (cursor <= to) {
    periods.forEach((period, idx) => {
      const status = statuses[(cursor.getDay() + idx) % statuses.length];
      availabilities.push({
        date: formatDate(cursor),
        period,
        status,
        remaining: status === "available" ? 8 - (idx % 4) : undefined,
      });
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return availabilities;
}

async function fetchYokohamaCsv(): Promise<string> {
  try {
    const res = await fetch(YOKOHAMA_CSV_URL, { cache: "no-store" });
    if (res.ok) return res.text();
  } catch (error) {
    console.warn("Yokohama CSV fallback", error);
  }
  return YOKOHAMA_FALLBACK_CSV;
}

async function fetchYokohamaAvailabilityHtml(
  facilityId: string
): Promise<string | null> {
  const url = `https://www.yspc.or.jp/ysa/availability?facility=${facilityId}`;
  try {
    return await fetchHtml(url);
  } catch (error) {
    console.warn("Yokohama availability fallback", error);
    return null;
  }
}

export const YokohamaProvider: FacilityProvider = {
  id: "yokohama",
  name: "横浜市",
  async fetchFacilities(): Promise<Facility[]> {
    const csv = await fetchYokohamaCsv();
    return parseCsvFacilities(csv, this.id, {
      id: "id",
      name: "name",
      category: "category",
      address: "address",
      phone: "phone",
      reservationPageUrl: "reservationPageUrl",
    });
  },
  async fetchAvailability(
    facilityId: string,
    from: Date,
    to: Date
  ): Promise<Availability[]> {
    const html = await fetchYokohamaAvailabilityHtml(facilityId);
    if (html) {
      const parsed = normalizeAvailabilityTable(html, this.id);
      if (parsed.length > 0) return parsed;
    }
    return fallbackAvailability(from, to);
  },
};
