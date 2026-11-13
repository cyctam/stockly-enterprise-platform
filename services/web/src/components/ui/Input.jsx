import React from "react";

export default function Input({
  label,
  hint,
  error,
  className = "",
  type = "text",
  ...props
}) {
  return (
    <label className="block text-sm text-slate-700">
      {label && <span className="mb-2 block font-medium">{label}</span>}
      <input
        type={type}
        className={[
          "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-soft placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200",
          error ? "border-rose-400 focus:ring-rose-200" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {hint && !error && (
        <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      )}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}
