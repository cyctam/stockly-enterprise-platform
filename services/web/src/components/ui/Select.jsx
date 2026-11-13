import React from "react";

export default function Select({
  label,
  hint,
  error,
  className = "",
  children,
  ...props
}) {
  return (
    <label className="block text-sm text-slate-700">
      {label && <span className="mb-2 block font-medium">{label}</span>}
      <select
        className={[
          "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-soft focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200",
          error ? "border-rose-400 focus:ring-rose-200" : "",
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </select>
      {hint && !error && (
        <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      )}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}
