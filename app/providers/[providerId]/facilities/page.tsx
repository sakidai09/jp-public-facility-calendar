import { notFound } from "next/navigation";
import { getProvider } from "../../../data/providers";
import { FacilityListClient } from "../../../components/FacilityListClient";

export const revalidate = 86400; // 1 day

interface Props {
  params: { providerId: string };
}

export default async function FacilitiesPage({ params }: Props) {
  const provider = getProvider(params.providerId);
  if (!provider) return notFound();
  const facilities = await provider.fetchFacilities();

  return (
    <main className="container-narrow py-10 space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm text-slate-500">{provider.name}</p>
          <h1 className="text-3xl font-bold">施設一覧</h1>
          <p className="text-slate-600 text-sm">
            オープンデータの CSV から自動取得。検索やカテゴリで絞り込めます。
          </p>
        </div>
        <a
          href="/providers"
          className="text-sm text-emerald-700 underline underline-offset-4"
        >
          自治体一覧へ戻る
        </a>
      </div>
      <FacilityListClient facilities={facilities} providerId={provider.id} />
    </main>
  );
}
