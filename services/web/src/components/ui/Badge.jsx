import React from "react";

const variants = {
  healthy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  low: "bg-amber-100 text-amber-700 border-amber-200",
  critical: "bg-rose-100 text-rose-700 border-rose-200",
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  approved: "bg-sky-100 text-sky-700 border-sky-200",
  received: "bg-indigo-100 text-indigo-700 border-indigo-200",
  info: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function Badge({ label, variant = "info", className = "" }) {
  const variantStyles = variants[variant] ?? variants.info;

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        variantStyles,
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
