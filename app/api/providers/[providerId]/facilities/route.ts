import { NextResponse } from "next/server";
import { getProvider } from "../../../../data/providers";

export const revalidate = 86400; // 1 day

interface Props {
  params: { providerId: string };
}

export async function GET(_req: Request, { params }: Props) {
  const provider = getProvider(params.providerId);
  if (!provider) {
    return NextResponse.json({ message: "Provider not found" }, { status: 404 });
  }
  const facilities = await provider.fetchFacilities();
  return NextResponse.json(facilities, { status: 200 });
}
