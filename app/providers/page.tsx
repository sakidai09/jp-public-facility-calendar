import { providers } from "../../data/providers";
import { ProviderCard } from "../../components/ProviderCard";

export const revalidate = 86400;

export default function ProvidersPage() {
  return (
    <main className="container-narrow py-10 space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-emerald-600 font-semibold">Japan Public Sports Facility Availability Viewer</p>
        <h1 className="text-3xl font-bold">自治体を選択</h1>
        <p className="text-slate-600">
          日本の自治体が提供する公共スポーツ施設の空き状況を、カレンダー形式で横断的に閲覧できます。
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.values(providers).map((provider) => (
          <ProviderCard
            key={provider.id}
            id={provider.id}
            name={provider.name}
            description="施設一覧と空き状況を確認"
          />
        ))}
      </div>
    </main>
  );
}
