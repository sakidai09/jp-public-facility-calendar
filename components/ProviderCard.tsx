import Link from "next/link";

interface Props {
  id: string;
  name: string;
  description?: string;
}

export function ProviderCard({ id, name, description }: Props) {
  return (
    <Link href={`/providers/${id}/facilities`} className="card block p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">自治体</p>
          <h3 className="text-xl font-semibold">{name}</h3>
          {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
        </div>
        <span className="badge border border-emerald-200 bg-emerald-50 text-emerald-700">見る</span>
      </div>
    </Link>
  );
}
