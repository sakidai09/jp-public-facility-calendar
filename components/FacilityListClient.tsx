"use client";

import { useMemo, useState } from "react";
import { Facility } from "../lib/types";
import { FacilityCard } from "./FacilityCard";

interface Props {
  facilities: Facility[];
  providerId: string;
}

export function FacilityListClient({ facilities, providerId }: Props) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    facilities.forEach((f) => set.add(f.category || "その他"));
    return Array.from(set);
  }, [facilities]);

  const filtered = useMemo(() => {
    return facilities.filter((f) => {
      const keywordMatch = keyword
        ? f.name.toLowerCase().includes(keyword.toLowerCase()) ||
          (f.address || "").toLowerCase().includes(keyword.toLowerCase())
        : true;
      const categoryMatch = category ? f.category === category : true;
      return keywordMatch && categoryMatch;
    });
  }, [facilities, keyword, category]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          className="rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          placeholder="施設名・住所で検索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">すべてのカテゴリ</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="text-sm text-slate-500 flex items-center">{filtered.length}件 表示中</div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            href={`/providers/${providerId}/facilities/${facility.id}`}
          />
        ))}
      </div>
    </div>
  );
}
