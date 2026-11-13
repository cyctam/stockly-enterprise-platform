import React from "react";

export default function StatCard({
  title,
  value,
  helper,
  trend,
  statusLabel,
  accent = "bg-slate-900",
}) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {title}
          </p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900">
            {value}
          </h3>
          {helper && <p className="mt-1 text-sm text-slate-500">{helper}</p>}
        </div>
        <div
          className={[
            "h-10 w-10 rounded-lg text-white flex items-center justify-center text-sm font-semibold shadow-soft",
            accent,
          ].join(" ")}
        >
          {statusLabel ?? "OK"}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{trend.value}</span>
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
