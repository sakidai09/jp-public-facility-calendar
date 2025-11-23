import { NextResponse } from "next/server";
import { getProvider } from "../../../../../../data/providers";

export const revalidate = 300; // 5 minutes

interface Props {
  params: { providerId: string; facilityId: string };
}

export async function GET(request: Request, { params }: Props) {
  const provider = getProvider(params.providerId);
  if (!provider) {
    return NextResponse.json({ message: "Provider not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const from = fromParam ? new Date(fromParam) : new Date();
  const to = toParam ? new Date(toParam) : new Date(from.getFullYear(), from.getMonth() + 1, 0);

  const availabilities = await provider.fetchAvailability(params.facilityId, from, to);
  // ensure sorted for deterministic output
  const sorted = availabilities.sort((a, b) => {
    if (a.date === b.date) return a.period.localeCompare(b.period);
    return a.date.localeCompare(b.date);
  });

  return NextResponse.json(sorted);
}
