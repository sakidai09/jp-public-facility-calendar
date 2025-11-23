"use client";

import { useMemo, useState } from "react";
import { Availability } from "../lib/types";
import {
  formatDate,
  getMonthDays,
  getPeriodLabel,
  groupAvailabilityByDate,
  statusLabel,
} from "../lib/date";

interface CalendarProps {
  month: Date;
  availabilities: Availability[];
}

const statusColor: Record<Availability["status"], string> = {
  available: "bg-availability-available/20 text-emerald-700 border-emerald-200",
  few: "bg-availability-few/20 text-amber-700 border-amber-200",
  full: "bg-availability-full/20 text-rose-700 border-rose-200",
  closed: "bg-availability-closed/20 text-slate-700 border-slate-200",
};

export function Calendar({ month, availabilities }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const grouped = useMemo(
    () => groupAvailabilityByDate(availabilities),
    [availabilities]
  );

  const days = useMemo(
    () => getMonthDays(month.getFullYear(), month.getMonth()),
    [month]
  );

  const selected = grouped[selectedDate] ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
      <div className="card p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">月間カレンダー</p>
              <h2 className="text-xl font-semibold">
                {month.getFullYear()}年 {month.getMonth() + 1}月
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {days.map((date) => {
              const iso = formatDate(date);
              const dayAvail = grouped[iso];
              const status = dayAvail?.find((a) => a.status !== "closed")?.status ??
                (dayAvail ? "closed" : undefined);
              return (
                <button
                  key={iso}
                  onClick={() => setSelectedDate(iso)}
                  className={`text-left rounded-lg border p-3 transition hover:border-emerald-400 hover:shadow-sm bg-white ${
                    selectedDate === iso ? "border-emerald-500 shadow" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">{date.toLocaleDateString("ja-JP", { weekday: "short" })}</p>
                      <p className="text-lg font-semibold">{date.getDate()}日</p>
                    </div>
                    {status && (
                      <span className={`badge border ${statusColor[status]}`}>
                        {statusLabel(status)}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-slate-600">
                    {dayAvail?.map((a) => (
                      <span
                        key={`${a.period}-${a.status}`}
                        className={`badge border ${statusColor[a.status]}`}
                      >
                        {getPeriodLabel(a.period)} {statusLabel(a.status)}
                        {typeof a.remaining === "number" ? ` (${a.remaining})` : ""}
                      </span>
                    )) || <span className="text-slate-400">データなし</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="card p-4 sticky top-4 h-fit">
        <p className="text-sm text-slate-500">選択日</p>
        <h3 className="text-2xl font-semibold">{selectedDate}</h3>
        <div className="mt-4 space-y-2">
          {selected.length === 0 && <p className="text-slate-500">データなし</p>}
          {selected.map((a) => (
            <div
              key={`${a.period}-${a.date}`}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 ${statusColor[a.status]}`}
            >
              <div>
                <p className="text-sm font-semibold">{getPeriodLabel(a.period)}</p>
                <p className="text-xs text-slate-600">{statusLabel(a.status)}</p>
              </div>
              {typeof a.remaining === "number" && (
                <span className="text-sm font-semibold">残り {a.remaining}</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6">
          <p className="text-sm text-slate-500">スマホ向け</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
            {days.map((date) => {
              const iso = formatDate(date);
              const dayAvail = grouped[iso] ?? [];
              const status = dayAvail[0]?.status ?? "closed";
              return (
                <button
                  key={`mobile-${iso}`}
                  onClick={() => setSelectedDate(iso)}
                  className={`min-w-[110px] rounded-lg border px-3 py-2 text-left ${
                    selectedDate === iso
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="text-[11px] text-slate-500">
                    {date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" })}
                  </p>
                  <div className={`badge mt-1 border ${statusColor[status]}`}>
                    {statusLabel(status)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
