import Link from "next/link";
import { Facility } from "../lib/types";

interface Props {
  facility: Facility;
  href: string;
}

export function FacilityCard({ facility, href }: Props) {
  return (
    <Link href={href} className="card block p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{facility.category}</p>
          <h3 className="text-lg font-semibold">{facility.name}</h3>
          {facility.address && (
            <p className="text-sm text-slate-600 mt-1">{facility.address}</p>
          )}
          {facility.phone && (
            <p className="text-xs text-slate-500 mt-1">TEL: {facility.phone}</p>
          )}
        </div>
        <span className="badge border border-emerald-200 bg-emerald-50 text-emerald-700">詳細</span>
      </div>
    </Link>
  );
}
