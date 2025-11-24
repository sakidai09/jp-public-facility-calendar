import { NextResponse } from "next/server";
import { providers } from "../../../data/providers";

export const revalidate = 86400;

export async function GET() {
  const data = Object.values(providers).map((p) => ({ id: p.id, name: p.name }));
  return NextResponse.json(data, { status: 200 });
}
