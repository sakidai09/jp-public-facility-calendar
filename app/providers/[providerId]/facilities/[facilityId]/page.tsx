import { notFound } from "next/navigation";
import { Calendar } from "../../../../../components/Calendar";
import { getProvider } from "../../../../../data/providers";
import { Availability } from "../../../../../lib/types";
import { formatDate } from "../../../../../lib/date";

export const revalidate = 300; // 5 minutes for availability

interface Props {
  params: { providerId: string; facilityId: string };
}

async function fetchAvailability(
  providerId: string,
  facilityId: string,
  from: Date,
  to: Date
): Promise<Availability[]> {
  const searchParams = new URLSearchParams({
    from: formatDate(from),
    to: formatDate(to),
  });
  const url = `/api/providers/${providerId}/facilities/${facilityId}/availability?${searchParams.toString()}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error("Failed to fetch availability");
  return res.json();
}

export default async function FacilityDetailPage({ params }: Props) {
  const provider = getProvider(params.providerId);
  if (!provider) return notFound();
  const facilities = await provider.fetchFacilities();
  const facility = facilities.find((f) => f.id === params.facilityId);
  if (!facility) return notFound();

  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  let availabilities: Availability[] = [];
  try {
    availabilities = await fetchAvailability(provider.id, facility.id, from, to);
  } catch (error) {
    // フォールバック: 直接 Provider を叩いて SSR を継続
    availabilities = await provider.fetchAvailability(facility.id, from, to);
    console.warn("Fallback availability from provider", error);
  }

  return (
    <main className="container-narrow py-10 space-y-6">
      <div className="card p-5 flex flex-col gap-2">
        <p className="text-sm text-slate-500">{provider.name}</p>
        <h1 className="text-3xl font-bold">{facility.name}</h1>
        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="badge border border-slate-200 bg-slate-50 text-slate-700">
            {facility.category}
          </span>
          {facility.address && <span>{facility.address}</span>}
          {facility.phone && <span>TEL: {facility.phone}</span>}
        </div>
        {facility.reservationPageUrl && (
          <a
            href={facility.reservationPageUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700"
          >
            予約する
          </a>
        )}
      </div>
      <Calendar month={from} availabilities={availabilities} />
    </main>
  );
}
