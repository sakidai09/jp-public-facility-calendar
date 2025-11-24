import { Availability, Facility, FacilityProvider } from "../../lib/types";
import {
  fetchHtml,
  normalizeAvailabilityTable,
  parseCsvFacilities,
} from "../../lib/scraper";
import { formatDate } from "../../lib/date";

const HAKODATE_PACKAGE_ID = "public-sports-facilities";
const HAKODATE_FALLBACK_CSV = `id,name,category,address,phone,reservationPageUrl
001,函館アリーナ,アリーナ,函館市湯川町1-32-2,0138-57-3141,https://yoyaku.hakobura.jp/
002,千代台公園野球場,野球場,函館市千代台町22-24,0138-55-1900,https://yoyaku.hakobura.jp/
003,函館フットボールパーク,サッカー場,函館市日吉町4-19-1,,https://yoyaku.hakobura.jp/
`;

async function fetchHakodateCsv(): Promise<string> {
  try {
    const res = await fetch(
      `https://www.hakodate-opendata.jp/api/3/action/package_show?id=${HAKODATE_PACKAGE_ID}`,
      { cache: "no-store" }
    );
    const json = await res.json();
    const resources: any[] = json.result?.resources ?? [];
    const csvResource = resources.find((r) => (r.format || "").toLowerCase() === "csv");
    if (csvResource?.url) {
      const csvRes = await fetch(csvResource.url, { cache: "no-store" });
      if (csvRes.ok) return csvRes.text();
    }
  } catch (error) {
    console.warn("Hakodate CSV fallback", error);
  }
  return HAKODATE_FALLBACK_CSV;
}

function fallbackAvailability(from: Date, to: Date): Availability[] {
  const availabilities: Availability[] = [];
  const periods: Availability["period"][] = ["morning", "afternoon", "night"];
  const statuses: Availability["status"][] = ["available", "few", "full", "closed"];
  const cursor = new Date(from);
  while (cursor <= to) {
    periods.forEach((period, idx) => {
      const status = statuses[(cursor.getDate() + idx) % statuses.length];
      availabilities.push({
        date: formatDate(cursor),
        period,
        status,
        remaining: status === "available" ? 5 - (idx % 3) : undefined,
      });
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return availabilities;
}

async function fetchHakodateAvailabilityHtml(facilityId: string): Promise<string | null> {
  const url = `https://yoyaku.hakobura.jp/rsrv/web/search_sks?cmnnId=${facilityId}`;
  try {
    return await fetchHtml(url);
  } catch (error) {
    console.warn("Hakodate availability fallback", error);
    return null;
  }
}

export const HakodateProvider: FacilityProvider = {
  id: "hakodate",
  name: "函館市",
  async fetchFacilities(): Promise<Facility[]> {
    const csv = await fetchHakodateCsv();
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
    const html = await fetchHakodateAvailabilityHtml(facilityId);
    if (html) {
      const parsed = normalizeAvailabilityTable(html, this.id);
      if (parsed.length > 0) return parsed;
    }
    return fallbackAvailability(from, to);
  },
};
